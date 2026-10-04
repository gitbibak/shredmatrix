/* Side Crow (Parsva Bakasana), twist to the right. Three-quarter front view. Built on crow_pose.js (explicit pelvis placement,
 * palms = fixed world IK spots, ankles = IK targets in every pose so the feet lift instead of sliding).
 * Twist set-up: the whole body is yawed 90° (pelvis and thighs point to the character's LEFT, world -z) and the spine is turned
 * back with `twist` -80 so the chest faces the mat with the hands ahead (+x). The lean toward the hands is `roll` (pelvis) +
 * `side` (spine). prep (feet on the mat, knees together, pelvis rolled 30°, spine side-bent) -> hold (pelvis rolled ~80°, the
 * legs stack, feet lift).
 * Knees: the outer right thigh rests on the back of the LEFT upper arm (the arm hooked outside the right thigh). The spec's
 * hold text says "right upper arm"; with a right twist and the left elbow hooked outside the right thigh (spec start pose)
 * the stacked knees sit on the left arm, as in the usual one-arm side crow - matched to the technique, noted here.
 * Right thigh aimed analytically at the knee target on the left upper arm, left leg copies the right leg (stacked on top).
 * Hold, Newton on the pelvis (x, y, z): thigh length to the knee target, elbow flexion, small abduction. Prep (twisted squat):
 * pelvis (x, y, z) + left knee so both toes touch the mat and both soft arms reach the palms. A coarse grid gives the start.  * Fix 2026-10-04: hold elbow fit 88->80 (hips higher than shoulders, knees on the left upper arm); main camera now yaw -108 / alt -62 so the thigh-on-arm shelf is visible.
 */
{
const MAT = 0.012;
const HX = 0.30, HZ = 0.17;
const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };
const POLE = [0.15, -1, 0.35];
const ARM = { elbowPole: POLE, curl: 0.05, handFlat: true, handSurface: MAT, shAbd: 4, sh: 60, el: 30, yaw: 90, twist: -80 };
const RAW = {
  prep: Object.assign({ hip: 128, abd: 6, trunk: 0, roll: -20, side: -46, lumbar: 6, thoracic: 10, neck: -16, hrot: 0, knee: 145, ankle: -10, flat: false }, ARM),
  hold: Object.assign({ trunk: 0, roll: -96, side: 0, lumbar: 6, thoracic: 12, neck: -20, hrot: 0, knee: 115, ankle: -20, flat: false }, ARM),
};
const FIT = { hold: { el: 80 } };

function build(poses, mistakes) {
  const { V, solve, expand, BODY: B } = FB;
  const H = { handL: { at: [HX, MAT, -HZ] }, handR: { at: [HX, MAT, HZ] } };
  const sol = (p, x) => solve(expand(Object.assign({}, p, { ground: [['pelvis', x[1] - FB.CLEAR.pelvis]], pos: [x[0], 0, x[2]], ik: H })), CTX);
  const D = 180 / Math.PI, ang = (a, b, c) => Math.acos(Math.max(-1, Math.min(1, V.dot(V.norm(V.sub(a, b)), V.norm(V.sub(c, b)))))) * D;
  const elbowOf = (J) => 180 - ang(J.shoulderL, J.elbowL, J.wristL);
  const solveN = (f, x, eps = 1e-3, it = 40) => {
    for (let k = 0; k < it; k++) {
      const r = f(x); if (Math.max(...r.map(Math.abs)) < 1e-4) break;
      const n = x.length, Jm = [];
      for (let j = 0; j < n; j++) { const y = x.slice(); y[j] += eps; const rj = f(y); Jm.push(rj.map((v, i) => (v - r[i]) / eps)); }
      const A = r.map((_, i) => Jm.map((c) => c[i]).concat([r[i]]));
      for (let c = 0; c < n; c++) { let pv = c; for (let q = c + 1; q < n; q++) if (Math.abs(A[q][c]) > Math.abs(A[pv][c])) pv = q; [A[c], A[pv]] = [A[pv], A[c]];
        for (let q = 0; q < n; q++) if (q !== c) { const m = A[q][c] / A[c][c]; for (let w = c; w <= n; w++) A[q][w] -= m * A[c][w]; } }
      const nx = x.map((v, j) => { const cl = j < 3 ? 0.05 : 10; return v - Math.max(-cl, Math.min(cl, A[j][n] / A[j][j])); });
      if (nx.some((v) => !Number.isFinite(v))) break;
      x = nx;
    }
    return x;
  };
  // knee target on the back/outside of the LEFT upper arm
  const kneeTarget = (J, at) => {
    const sh = J.shoulderL, el = J.elbowL, ax = V.norm(V.sub(sh, el));
    let n = [0, 0.6, -0.8]; n = V.norm(V.sub(n, V.mul(ax, V.dot(n, ax))));
    return V.add(V.lerp(el, sh, at), V.mul(n, 0.085));
  };
  const aimLegs = (p, q) => {                          // right thigh -> knee target; left leg copies (stacked)
    const K = kneeTarget(q.J, p.kneeAt ?? 0.7), d = V.norm(V.sub(K, q.J.hipR)), P = q.F.pelvis;
    const dp = [V.dot(d, P[0]), V.dot(d, P[1]), V.dot(d, P[2])];
    p.abdR = p.abdL = Math.asin(Math.max(-1, Math.min(1, dp[2]))) * D;
    p.hipR = p.hipL = Math.atan2(dp[0], -dp[1]) * D;
    p.abdL = p.legsSym ? p.abdR : -p.abdR;             // stacked: same world direction; prep (legsSym): mirror image, legs side by side
    return V.len(V.sub(K, q.J.hipR)) - B.thigh;
  };
  const frame = (F) => ({ 0: F[0].slice(), 1: F[1].slice(), 2: F[2].slice() });
  const setFeet = (p, q) => { const one = (s) => ({ at: q.J['ankle' + s].slice(), foot: frame(q.F['foot' + s]) }); p.ik = Object.assign({}, H, { ankleL: one('L'), ankleR: one('R') }); };
  const place = (p, fit, x0) => {
    const f = (x) => {
      const pp = Object.assign({}, p); if (fit.toes) pp.kneeL = x[3]; if (fit.stack) pp.roll = x[3];
      const r0 = aimLegs(pp, sol(pp, x));
      const q = sol(pp, x);
      const r = [r0, (elbowOf(q.J) - fit.el) / 300, pp.abdR / 300];
      if (fit.toes) { r.push(q.J.toeR[1] - MAT); r[2] = q.J.toeL[1] - MAT; }
      if (fit.stack) r.push(q.J.elbowL[0] - q.J.wristL[0] + 0.02);   // forearm ~vertical (elbow over the wrist)
      return r;
    };
    // coarse grid on the pelvis position first (Newton needs a start where the arms reach the palms)
    let best = null;
    for (let a = -0.4; a <= 0.31; a += 0.05) for (let b = 0.3; b <= 0.71; b += 0.05) for (let c = -0.3; c <= 0.31; c += 0.05) {
      const y = fit.toes ? [a, b, c, p.knee] : fit.stack ? [a, b, c, p.roll] : [a, b, c], r = f(y), e = r.reduce((u, v) => u + v * v, 0);
      if (!best || e < best.e) best = { e, y };
    }
    let x = solveN(f, best.y);
    if (fit.toes) p.kneeL = x[3]; if (fit.stack) p.roll = x[3];
    for (let k = 0; k < 3; k++) aimLegs(p, sol(p, x));
    p.ground = [['pelvis', x[1] - FB.CLEAR.pelvis]]; p.pos = [x[0], 0, x[2]];
    setFeet(p, sol(p, x));
    return x;
  };
  const xh = place(poses.hold, FIT.hold, [-0.1, 0.5, 0.1]);
  // prep (twisted squat, both feet on the mat): own leg angles, solve pelvis (x, y, z) + left knee so both toes touch the mat
  // and both soft arms reach their palms
  { const p = poses.prep, er = (J, s) => 180 - ang(J['shoulder' + s], J['elbow' + s], J['wrist' + s]);
    // unknowns: lateral pelvis offset fixed from a grid; Newton on height, fore-aft, left knee and the spine side bend
    let lat = 0;
    const f = (x) => { const q = sol(Object.assign({}, p, { kneeL: x[2], side: x[3] }), [lat, x[0], x[1]]); return [q.J.toeR[1] - MAT, q.J.toeL[1] - MAT, (er(q.J, 'L') - 22) / 300, (er(q.J, 'R') - 30) / 300]; };
    let best = null;
    for (let a = -0.4; a <= 0.31; a += 0.05) for (let b = 0.2; b <= 0.61; b += 0.05) for (let c = -0.3; c <= 0.31; c += 0.05) {
      lat = a; const e = f([b, c, p.knee, p.side]).reduce((u, v) => u + v * v, 0); if (!best || e < best.e) best = { e, a, y: [b, c, p.knee, p.side] }; }
    lat = best.a;
    const x = solveN(f, best.y); p.kneeL = x[2]; p.side = x[3];
    const X = [lat, x[0], x[1]];
    p.ground = [['pelvis', X[1] - FB.CLEAR.pelvis]]; p.pos = [X[0], 0, X[2]];
    const qq = sol(p, X); setFeet(p, qq);
    p.ik.ankleL.at[1] -= qq.J.toeL[1] - MAT;          // whatever is left: the left ankle target drops so the toes touch (leg IK bends)
    p.hipR = p.hipL = p.hip; p.abdR = p.abdL = p.abd; delete p.hip; delete p.abd; }
  for (const m of mistakes) {
    const base = Object.assign({}, poses[m.at], m.pose);
    if (m.fit) place(base, m.fit, xh);
    for (const k of ['hipL', 'hipR', 'abdL', 'abdR', 'kneeL', 'ground', 'pos', 'ik']) if (base[k] !== undefined) m.pose[k] = base[k];
  }
  for (const k in poses) { const p = poses[k]; if (p.kneeL === undefined) p.kneeL = p.knee; p.kneeR = p.knee; delete p.knee; }
  return poses;
}

window.EXERCISE = {
  id: 'side_crow',
  name: { tr: 'Yan Karga Pozu (Parsva Bakasana)', en: 'Side Crow (Parsva Bakasana)', es: 'Cuervo lateral' },
  category: { tr: 'Yoga · Kol dengesi · Dönüş', en: 'Yoga · Arm balance · Twist', es: 'Yoga · Equilibrio · Torsión' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['obliques', 'triceps', 'chest', 'delts', 'core'],
  side: 'R',
  tempo: '3-6-3',
  hold: true, holdDur: 3,
  view: { yaw: -108, pitch: 8 },
  alt: { yaw: -62, pitch: 6, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
    text: { tr: 'Dizler üst üste, sol kolun arkasında', en: 'Knees stacked on the back of the left arm', es: 'Rodillas apiladas sobre el brazo izquierdo' } },
  setupView: { yaw: -10, pitch: 18 },
  contacts: ['handR', 'handL', 'ballR', 'ballL'],
  props: [['mat', { at: [0.05, 0, -0.05], length: 1.3, width: 1.0 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = build(RAW, this.mistakes)); },
  rest: 'prep',
  rep: [
    { to: 'hold', dur: 3.0, phase: 0 },
    { to: 'hold', dur: 1.0, phase: 1 },
    { to: 'prep', dur: 3.0, phase: 2 },
  ],
  setup: { tr: 'Çömel, dizler birleşik, sağa dön. Sol dirsek sağ uyluğun dışında, avuçlar matta. Sonra taraf değiştir.',
    en: 'Squat, knees together, twist right. Left elbow outside the right thigh, palms down. Then switch sides.',
    es: 'En cuclillas, rodillas juntas, gira a la derecha. Codo izquierdo fuera del muslo. Luego cambia de lado.' },
  phases: [
    { name: { tr: 'Öne eğil, kaldır', en: 'Lean and lift', es: 'Inclínate y eleva' }, breath: 'out', slow: 1.2,
      text: { tr: 'Dirsekleri 90° bük, dizler sol kolda, ayaklar kalksın.', en: 'Bend the elbows to 90°, knees on the left arm, feet lift.', es: 'Codos a 90°, rodillas en el brazo izquierdo, pies arriba.' } },
    { name: { tr: 'Pozda kal', en: 'Hold', es: 'Mantén' }, breath: 'easy', arc: ['shoulderL', 'elbowL', 'wristL'],
      text: { tr: 'Bakış öne, dönüş göğüsten, dizler üst üste.', en: 'Gaze forward, twist from the ribs, knees stacked.', es: 'Mirada al frente, gira desde las costillas, rodillas apiladas.' } },
    { name: { tr: 'Yumuşakça in', en: 'Lower softly', es: 'Baja suave' }, breath: 'out', slow: 1.0,
      text: { tr: 'Ayakları yere bırak, çömelmeye dön.', en: 'Feet down, back to the squat.', es: 'Pies abajo, vuelve a la cuclilla.' } },
  ],
  tempoText: { tr: '3 sn kalk · 3-5 nefes kal · 3 sn in', en: '3 s up · stay 3-5 breaths · 3 s down', es: '3 s arriba · 3-5 respiraciones · 3 s abajo' },
  mistakes: [
    { title: { tr: 'Dizler dirseğe yakın', en: 'Knees low by the elbow', es: 'Rodillas cerca del codo' },
      text: { tr: 'Bacaklar koldan kayar, kollar çöker.', en: 'The legs slide off, the arms collapse.', es: 'Las piernas resbalan, los brazos ceden.' },
      fix: { tr: 'Dizleri kolda yukarı taşı', en: 'Bring the knees higher on the arm', es: 'Sube las rodillas en el brazo' },
      fixText: { tr: 'Dizler omza yakın, dirsek 90°', en: 'Knees near the shoulder, elbows at 90°', es: 'Rodillas cerca del hombro, codos a 90°' },
      at: 'hold', fit: { el: 110 }, pose: { kneeAt: 0.2 }, marks: ['kneeR', 'elbowL'], parts: ['thighR', 'upperL'] },
    { title: { tr: 'Dönüş yetersiz', en: 'Not enough twist', es: 'Poca torsión' },
      text: { tr: 'Uyluk kola oturmaz, omuz düşer.', en: 'The thigh misses the arm, the shoulder drops.', es: 'El muslo no apoya en el brazo, el hombro cae.' },
      fix: { tr: 'Daha çok dön, dirseği uyluğun dışına kancala', en: 'Twist more, hook the elbow outside the thigh', es: 'Gira más, engancha el codo fuera del muslo' },
      fixText: { tr: 'Göğüs mata, kalça yana', en: 'Chest to the mat, hips to the side', es: 'Pecho a la esterilla, cadera al lado' },
      at: 'hold', pose: { twist: -58, shrugL: 0.04, neck: 0 }, view: { yaw: -20, pitch: 14 }, marks: ['shoulderL'], parts: ['chest', 'upperL'] },
  ],
  cues: [{ tr: 'Dönüş kaburgalardan', en: 'Twist from the ribs', es: 'Gira desde las costillas' },
    { tr: 'Dizler kolda yukarıda', en: 'Knees high on the arm', es: 'Rodillas altas en el brazo' },
    { tr: 'Bakış öne', en: 'Gaze forward', es: 'Mirada al frente' }],
};
}
