/* Crow Pose (Bakasana). Side view. Arm-balance template: squat -> knees onto the upper arms (toes still down) -> toes lift ->
 * hold -> back to the squat.
 * Geometry (build(), lazy, after the rig sets FB.BODY), no engine contact sets at all:
 *   - the pelvis is placed explicitly: ground [['pelvis', y - clearance]] sets its height, anchorX ['pelvis'] + pos its x.
 *   - palms: world IK targets on two fixed mat spots (shoulder-width) in EVERY pose -> weight-bearing flat hands that never move.
 *   - feet: ankle IK targets (+ foot frame) in every pose (downward_dog.js pinFeet idea): on one floor spot in the squat and in
 *     the perch, at their FK place in the air in the hold, so the feet lift (no sliding) and come back to the same spot.
 *   - knees on the upper arms: for a pelvis position the arm IK gives the upper arm; the knee target K sits on the back/outside
 *     of the upper arm (70 % of the way from the elbow to the shoulder, one limb radius off the arm axis). Hip flexion and
 *     abduction are solved analytically so the thigh points exactly at K; a small Newton solve moves the pelvis (x, y)
 *     until |hip - K| = thigh length and the elbow has its target flexion (perch: also the knee flexion that puts the toes on
 *     the mat). Feet together: hip external rotation bisected so the ankles meet behind the body.
 *   - every pose carries the same keys (ik.handL/R, ik.ankleL/R, ground, pos), so nothing switches during a transition. */
{
const MAT = 0.012;
const HX = 0.32, HZ = 0.17;                         // palm spots (x, +-z)
const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };
const POLE = [0.15, -1, 0.35];                      // elbows point back toward the feet, slightly out (hugging, chaturanga-like)
const ARM = { elbowPole: POLE, curl: 0.05, handFlat: true, handSurface: MAT, shAbd: 4, sh: 60, el: 30 };
const RAW = {
  squat: Object.assign({ trunk: 60, lumbar: 16, thoracic: 16, neck: -18, hip: 128, abd: 30, hrot: 20, knee: 150, ankle: 24, flat: false }, ARM),
  perch: Object.assign({ trunk: 62, lumbar: 16, thoracic: 18, neck: -16, knee: 140, ankle: -20, flat: false }, ARM),
  crow: Object.assign({ trunk: 56, lumbar: 18, thoracic: 22, neck: -24, knee: 150, ankle: -36, flat: false }, ARM),
};
const FIT = { perch: { el: 88, toes: true }, crow: { el: 40 } };

function build(poses, mistakes) {
  const { V, solve, expand, BODY: B } = FB;
  const H = { handL: { at: [HX, MAT, -HZ] }, handR: { at: [HX, MAT, HZ] } };
  const sol = (p, px, py) => solve(expand(Object.assign({}, p, { ground: [['pelvis', py - FB.CLEAR.pelvis]], pos: [px, 0, 0], ik: H })), CTX);
  const D = 180 / Math.PI, ang = (a, b, c) => Math.acos(Math.max(-1, Math.min(1, V.dot(V.norm(V.sub(a, b)), V.norm(V.sub(c, b)))))) * D;
  const elbowOf = (J) => 180 - ang(J.shoulderR, J.elbowR, J.wristR);
  const solveN = (f, x, eps = 1e-3, it = 30) => {     // Newton with finite differences, any size
    for (let k = 0; k < it; k++) {
      const r = f(x); if (Math.max(...r.map(Math.abs)) < 1e-4) break;
      const n = x.length, Jm = [];
      for (let j = 0; j < n; j++) { const y = x.slice(); y[j] += eps; const rj = f(y); Jm.push(rj.map((v, i) => (v - r[i]) / eps)); }
      // solve Jm^T d = r (Jm[j][i] = dr_i/dx_j), Gaussian elimination
      const A = r.map((_, i) => Jm.map((c) => c[i]).concat([r[i]]));
      for (let c = 0; c < n; c++) { let pv = c; for (let q = c + 1; q < n; q++) if (Math.abs(A[q][c]) > Math.abs(A[pv][c])) pv = q; [A[c], A[pv]] = [A[pv], A[c]];
        for (let q = 0; q < n; q++) if (q !== c) { const m = A[q][c] / A[c][c]; for (let w = c; w <= n; w++) A[q][w] -= m * A[c][w]; } }
      x = x.map((v, j) => { const cl = j < 2 ? 0.06 : 12; return v - Math.max(-cl, Math.min(cl, A[j][n] / A[j][j])); });
    }
    return x;
  };
  // knee target on the back/outside of the upper arm, and the hip angles that aim the thigh at it
  const kneeTarget = (J, s, at = 0.7) => {
    const sh = J['shoulder' + s], el = J['elbow' + s], ax = V.norm(V.sub(sh, el));
    const sg = s === 'R' ? 1 : -1;
    let n = V.add([0, 0.75, 0], [0, 0, 0.66 * sg]); n = V.norm(V.sub(n, V.mul(ax, V.dot(n, ax))));
    return V.add(V.lerp(el, sh, at), V.mul(n, 0.085));
  };
  const aimThigh = (p, q, s) => {
    const K = kneeTarget(q.J, s, p.kneeAt), d = V.norm(V.sub(K, q.J['hip' + s])), P = q.F.pelvis, sg = s === 'R' ? 1 : -1;
    const dp = [V.dot(d, P[0]), V.dot(d, P[1]), V.dot(d, P[2])];
    p['abd' + s] = Math.asin(Math.max(-1, Math.min(1, sg * dp[2]))) * D;
    p['hip' + s] = Math.atan2(dp[0], -dp[1]) * D;
    return V.len(V.sub(K, q.J['hip' + s])) - B.thigh;
  };
  const feetTogether = (p, px, py) => {               // external rotation so the ankles meet (z ~ +-0.07)
    let lo = -30, hi = 80;
    for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; const J = sol(Object.assign({}, p, { hrot: m }), px, py).J; if (J.ankleR[2] > 0.07) lo = m; else hi = m; }
    p.hrot = (lo + hi) / 2;
  };
  const frame = (F) => ({ 0: F[0].slice(), 1: F[1].slice(), 2: F[2].slice() });
  const setFeet = (p, J, F, floor) => {
    const one = (s) => { const at = J['ankle' + s].slice(); if (floor) { at[0] = floor[s][0]; at[1] += floor[s][1]; at[2] = floor[s][2]; } return { at, foot: frame(F['foot' + s]) }; };
    p.ik = Object.assign({}, H, { ankleL: one('L'), ankleR: one('R') });
  };
  const place = (name, p, fit) => {
    let x = [-0.05, 0.5, p.knee];
    const f = (x) => {
      const q0 = sol(p, x[0], x[1]);
      const pp = Object.assign({}, p, { knee: x[2] });
      const rL = aimThigh(pp, q0, 'L'), rR = aimThigh(pp, q0, 'R');
      const q = sol(pp, x[0], x[1]);
      const r = [(rL + rR) / 2, (elbowOf(q.J) - fit.el) / 300];
      if (fit.toes) r.push((q.J.toeR[1] - MAT) * 1);
      return r;
    };
    x = solveN(f, fit.toes ? x : x.slice(0, 2));
    if (fit.toes) p.knee = x[2];
    const q0 = sol(p, x[0], x[1]); aimThigh(p, q0, 'L'); aimThigh(p, q0, 'R');
    feetTogether(p, x[0], x[1]);
    for (let k = 0; k < 2; k++) { const q1 = sol(p, x[0], x[1]); aimThigh(p, q1, 'L'); aimThigh(p, q1, 'R'); }
    p.ground = [['pelvis', x[1] - FB.CLEAR.pelvis]]; p.pos = [x[0], 0, 0];
    return x;
  };
  place('perch', poses.perch, FIT.perch);
  const qp = sol(poses.perch, poses.perch.pos[0], poses.perch.ground[0][1] + FB.CLEAR.pelvis);
  // floor spot of the feet = the perch toes (balls on the mat)
  const spot = { L: [qp.J.ankleL[0], 0, qp.J.ankleL[2]], R: [qp.J.ankleR[0], 0, qp.J.ankleR[2]] };
  setFeet(poses.perch, qp.J, qp.F);
  place('crow', poses.crow, FIT.crow);
  { const p = poses.crow, q = sol(p, p.pos[0], p.ground[0][1] + FB.CLEAR.pelvis); setFeet(p, q.J, q.F); }
  // squat: pelvis (x, y) so the toes land on the perch toe spot, with the squat's own hip/knee angles
  { const p = poses.squat;
    // unknowns: pelvis x, y and the trunk lean (so the soft arms reach the palm spots: elbow ~20°)
    const g = (x) => { const q = sol(Object.assign({}, p, { trunk: x[2] }), x[0], x[1]); return [q.J.toeR[0] - qp.J.toeR[0], q.J.toeR[1] - MAT, (elbowOf(q.J) - 20) / 300]; };
    let x = solveN(g, [-0.3, 0.45, p.trunk]); p.trunk = x[2];
    feetTogether(p, x[0], x[1]);
    x = solveN(g, x); p.trunk = x[2];
    p.ground = [['pelvis', x[1] - FB.CLEAR.pelvis]]; p.pos = [x[0], 0, 0];
    const q = sol(p, x[0], x[1]); setFeet(p, q.J, q.F); }
  void spot;
  // mistakes: same placement rules on the merged pose
  for (const m of mistakes) {
    const base = Object.assign({}, poses[m.at], m.pose);
    if (m.fit) { place('m', base, m.fit); const q = sol(base, base.pos[0], base.ground[0][1] + FB.CLEAR.pelvis); setFeet(base, q.J, q.F); }
    for (const k of ['hipL', 'hipR', 'abdL', 'abdR', 'hrot', 'knee', 'ground', 'pos', 'ik']) if (base[k] !== undefined) m.pose[k] = base[k];
  }
  for (const k in poses) { const p = poses[k]; for (const s of ['L', 'R']) { if (p['hip' + s] === undefined) p['hip' + s] = p.hip; if (p['abd' + s] === undefined) p['abd' + s] = p.abd; } delete p.hip; delete p.abd; }
  return poses;
}

window.EXERCISE = {
  id: 'crow_pose',
  name: { tr: 'Karga Pozu (Bakasana)', en: 'Crow Pose (Bakasana)', es: 'Postura del cuervo' },
  category: { tr: 'Yoga · Kol dengesi', en: 'Yoga · Arm balance', es: 'Yoga · Equilibrio de brazos' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['triceps', 'delts', 'chest', 'core', 'forearms'],
  tempo: '3-6-3',
  hold: true, holdDur: 3,
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 20, pitch: 10, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Dizler kolların arkasında, dirsekler içe', en: 'Knees on the backs of the arms, elbows in', es: 'Rodillas sobre los brazos, codos adentro' } },
  setupView: { yaw: 40, pitch: 14 },
  contacts: ['handR', 'handL', 'ballR', 'ballL'],
  props: [['mat', { at: [0.1, 0, 0], length: 1.5 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = build(RAW, this.mistakes)); },
  rest: 'squat',
  rep: [
    { to: 'perch', dur: 2.5, phase: 0 },
    { to: 'crow', dur: 2.0, phase: 1 },
    { to: 'crow', dur: 1.0, phase: 2 },
    { to: 'squat', dur: 2.5, phase: 3 },
  ],
  setup: { tr: 'Çömel, dizler geniş. Avuçlar omuz genişliğinde matta, parmaklar açık.',
    en: 'Squat with the knees wide. Palms shoulder-width on the mat, fingers spread.',
    es: 'En cuclillas, rodillas abiertas. Palmas al ancho de hombros, dedos abiertos.' },
  phases: [
    { name: { tr: 'Dizleri kollara yerleştir', en: 'Knees onto the arms', es: 'Rodillas a los brazos' }, breath: 'out', slow: 1.1,
      text: { tr: 'Öne eğil, dirsekleri bük, dizler üst kollara.', en: 'Lean in, bend the elbows, knees high on the arms.', es: 'Inclínate, flexiona codos, rodillas arriba en los brazos.' } },
    { name: { tr: 'Ayakları kaldır', en: 'Lift the feet', es: 'Eleva los pies' }, breath: 'in', slow: 1.4,
      text: { tr: 'Ağırlık ellere, ayaklar kalksın.', en: 'Weight into the hands, feet float up.', es: 'Peso a las manos, los pies suben.' } },
    { name: { tr: 'Pozda kal', en: 'Hold', es: 'Mantén' }, breath: 'easy', arc: ['shoulderR', 'elbowR', 'wristR'],
      text: { tr: 'Bakış öne, sırt yuvarlak, yeri it.', en: 'Gaze forward, round the back, press the floor away.', es: 'Mirada al frente, espalda redonda, empuja el suelo.' } },
    { name: { tr: 'Yumuşakça in', en: 'Lower softly', es: 'Baja suave' }, breath: 'out', slow: 1.0,
      text: { tr: 'Ayaklar yere, çömelmeye dön.', en: 'Feet down, back to the squat.', es: 'Pies abajo, vuelve a la cuclilla.' } },
  ],
  tempoText: { tr: '3 sn gir · 3-5 nefes kal · 3 sn in', en: '3 s in · stay 3-5 breaths · 3 s down', es: '3 s entrar · 3-5 respiraciones · 3 s bajar' },
  mistakes: [
    { title: { tr: 'Ayaklara bakıyor', en: 'Looking at the feet', es: 'Mirar los pies' },
      text: { tr: 'Çene göğse düşer, baş kolların arkasına kaçar, denge geriye kayar.', en: 'The chin drops, the head falls behind the arms, balance tips back.', es: 'La barbilla cae, la cabeza va atrás, el equilibrio se pierde.' },
      fix: { tr: 'Bakış 30 cm öne', en: 'Gaze 30 cm ahead', es: 'Mirada 30 cm adelante' },
      fixText: { tr: 'Çeneyi hafif kaldır, ağırlık ellerin üstünde', en: 'Lift the chin a little, weight over the hands', es: 'Sube un poco la barbilla, peso sobre las manos' },
      at: 'crow', fit: { el: 30 }, pose: { trunk: 50, neck: 40, thoracic: 28 }, marks: ['head'], parts: ['neck'] },
    { title: { tr: 'Dizler dirseklere kayıyor', en: 'Knees slide to the elbows', es: 'Rodillas hacia los codos' },
      text: { tr: 'Dizler kolun altına iner, kalça düşer, kollar zorlanır.', en: 'The knees slip low on the arms, the hips drop, the arms strain.', es: 'Las rodillas bajan por el brazo, la cadera cae.' },
      fix: { tr: 'Dizleri koltuk altına yakın sar', en: 'Knees high, near the armpits', es: 'Rodillas altas, cerca de las axilas' },
      fixText: { tr: 'Üst kolun arkası diz için raf olur', en: 'The backs of the upper arms are a shelf for the knees', es: 'La parte alta del brazo es un estante' },
      at: 'crow', fit: { el: 62 }, pose: { kneeAt: 0.25, trunk: 62, thoracic: 14 }, view: { yaw: 60, pitch: 8 }, marks: ['kneeR', 'elbowR'], parts: ['thighR', 'upperR'] },
  ],
  cues: [{ tr: 'Bakış öne, ayaklara değil', en: 'Gaze forward, not at the feet', es: 'Mirada al frente, no a los pies' },
    { tr: 'Dizler üst kolları sarsın', en: 'Knees hug the upper arms', es: 'Rodillas abrazan los brazos' },
    { tr: 'Sırtı yuvarla, yeri it', en: 'Round the back, push the floor', es: 'Redondea la espalda, empuja el suelo' }],
};
}
