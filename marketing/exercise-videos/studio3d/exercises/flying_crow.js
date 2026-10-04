/* Flying Crow / Flying Pigeon (Eka Pada Galavasana), right shin across the arms. Side view. Built on crow_pose.js
 * (explicit pelvis placement, palms = fixed world IK spots, ankles = IK targets in every pose so feet lift instead of sliding).
 * prep = standing figure 4 folded forward: left foot flat on the mat, right ankle resting on the left thigh above the knee,
 * hands on the mat. hold = right shin across the backs of both upper arms (right knee on the right arm, right foot hooked
 * outside the left arm), left leg straight back, elbows ~90°.
 * Right leg in the hold: hip flexion/abduction aim the thigh at the knee target on the right upper arm; the ankle is an IK
 * target one shin length from the knee toward the left-arm hook point, with a world knee pole toward the knee target, so the
 * leg IK puts the knee exactly on the right arm. Newton on the pelvis (x, y): thigh length to the knee target + elbow flexion.
 * Prep: pelvis (x, y) so the flat left foot stands on the mat and the soft arms reach the palms; the right ankle IK target
 * sits on top of the left thigh. Blocks / strap from the spec are left out (bare mat, clearer silhouette). */
{
const MAT = 0.012;
const HX = 0.32, HZ = 0.17;
const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };
const POLE = [0.15, -1, 0.35];
const ARM = { elbowPole: POLE, curl: 0.05, handFlat: true, handSurface: MAT, shAbd: 4, sh: 60, el: 30 };
const RAW = {
  prep: Object.assign({ trunk: 70, lumbar: 14, thoracic: 18, neck: -18, hipL: 118, kneeL: 112, abdL: 4, flatL: true, hipR: 100, abdR: 40, hrotR: 60, kneeR: 110, ankleR: 0, flatR: false }, ARM),
  hold: Object.assign({ trunk: 76, lumbar: 8, thoracic: 14, neck: -26, hipL: -16, kneeL: 0, abdL: 2, ankleL: -30, flatL: false, hipR: 110, abdR: 30, hrotR: 60, kneeR: 100, ankleR: 0, flatR: false }, ARM),
};

function build(poses, mistakes) {
  const { V, solve, expand, BODY: B } = FB;
  const H = { handL: { at: [HX, MAT, -HZ] }, handR: { at: [HX, MAT, HZ] } };
  const sol = (p, x, extra) => solve(expand(Object.assign({}, p, { ground: [['pelvis', x[1] - FB.CLEAR.pelvis]], pos: [x[0], 0, 0], ik: Object.assign({}, H, extra) })), CTX);
  const D = 180 / Math.PI, ang = (a, b, c) => Math.acos(Math.max(-1, Math.min(1, V.dot(V.norm(V.sub(a, b)), V.norm(V.sub(c, b)))))) * D;
  const elb = (J) => (360 - ang(J.shoulderR, J.elbowR, J.wristR) - ang(J.shoulderL, J.elbowL, J.wristL)) / 2;
  const solveN = (f, x, eps = 1e-3, it = 40) => {
    for (let k = 0; k < it; k++) {
      const r = f(x); if (Math.max(...r.map(Math.abs)) < 1e-4) break;
      const n = x.length, Jm = [];
      for (let j = 0; j < n; j++) { const y = x.slice(); y[j] += eps; const rj = f(y); Jm.push(rj.map((v, i) => (v - r[i]) / eps)); }
      const A = r.map((_, i) => Jm.map((c) => c[i]).concat([r[i]]));
      for (let c = 0; c < n; c++) { let pv = c; for (let q = c + 1; q < n; q++) if (Math.abs(A[q][c]) > Math.abs(A[pv][c])) pv = q; [A[c], A[pv]] = [A[pv], A[c]];
        for (let q = 0; q < n; q++) if (q !== c) { const m = A[q][c] / A[c][c]; for (let w = c; w <= n; w++) A[q][w] -= m * A[c][w]; } }
      const nx = x.map((v, j) => v - Math.max(-0.05, Math.min(0.05, A[j][n] / A[j][j])));
      if (nx.some((v) => !Number.isFinite(v))) break;
      x = nx;
    }
    return x;
  };
  const grid = (f, ys, xs) => { let best = null; for (const a of xs) for (const b of ys) { const e = f([a, b]).reduce((u, v) => u + v * v, 0); if (!best || e < best.e) best = { e, y: [a, b] }; } return best.y; };
  const range = (a, b, st) => { const o = []; for (let v = a; v <= b + 1e-9; v += st) o.push(v); return o; };
  // point on the back/outside of an upper arm (0 = elbow, 1 = shoulder)
  const armPt = (J, s, at, off = 0.08) => {
    const sh = J['shoulder' + s], el = J['elbow' + s], ax = V.norm(V.sub(sh, el)), sg = s === 'R' ? 1 : -1;
    let n = [0, 0.8, 0.6 * sg]; n = V.norm(V.sub(n, V.mul(ax, V.dot(n, ax))));
    return V.add(V.lerp(el, sh, at), V.mul(n, off));
  };
  const frame = (F) => ({ 0: F[0].slice(), 1: F[1].slice(), 2: F[2].slice() });
  // hold: right thigh -> knee point on the right arm; right ankle target toward the hook point on the left arm
  const shinAcross = (p, q) => {
    const at = p.kneeAt ?? 0.7, K = armPt(q.J, 'R', at), Hk = armPt(q.J, 'L', at, 0.07);
    const d = V.norm(V.sub(K, q.J.hipR)), P = q.F.pelvis, dp = [V.dot(d, P[0]), V.dot(d, P[1]), V.dot(d, P[2])];
    p.abdR = Math.asin(Math.max(-1, Math.min(1, dp[2]))) * D;
    p.hipR = Math.atan2(dp[0], -dp[1]) * D;
    const A = V.add(K, V.mul(V.norm(V.sub(Hk, K)), B.shin));
    return { r: V.len(V.sub(K, q.J.hipR)) - B.thigh, ankleR: A, K };
  };
  const placeHold = (p, el) => {
    const f = (x) => { const pp = Object.assign({}, p); const s0 = shinAcross(pp, sol(pp, x)); const q = sol(pp, x); return [s0.r, (elb(q.J) - el) / 300]; };
    let x = solveN(f, grid(f, range(0.3, 0.8, 0.04), range(-0.4, 0.2, 0.04)));
    let s0; for (let k = 0; k < 3; k++) s0 = shinAcross(p, sol(p, x));
    const extra = { ankleR: { at: s0.ankleR } }, q = sol(Object.assign({}, p, { pole: { kneeR: V.sub(s0.K, V.lerp(sol(p, x).J.hipR, s0.ankleR, 0.5)) } }), x, extra);
    p.pole = { kneeR: V.sub(s0.K, V.lerp(q.J.hipR, s0.ankleR, 0.5)) };
    p.ground = [['pelvis', x[1] - FB.CLEAR.pelvis]]; p.pos = [x[0], 0, 0];
    const qf = sol(p, x, extra);
    p.ik = Object.assign({}, H, { ankleR: { at: s0.ankleR, foot: frame(qf.F.footR) }, ankleL: { at: qf.J.ankleL.slice(), foot: frame(qf.F.footL) } });
    return x;
  };
  placeHold(poses.hold, 90);
  // prep: flat left foot on the mat, soft arms; right ankle on top of the left thigh, knee pointing out
  { const p = poses.prep;
    const restOnThigh = (J) => V.add(V.lerp(J.hipL, J.kneeL, 0.78), [0, 0.09, 0.02]);
    const f = (x) => { const q = sol(p, x); return [q.J.ankleL[1] - B.ankleH, (elb(q.J) - 12) / 300]; };
    const x = solveN(f, grid(f, range(0.3, 0.8, 0.04), range(-0.5, -0.12, 0.04)));   // pelvis behind the feet (squat side)
    const q = sol(p, x), A = restOnThigh(q.J);
    p.pole = { kneeR: [0.3, 0.2, 1] };
    p.ground = [['pelvis', x[1] - FB.CLEAR.pelvis]]; p.pos = [x[0], 0, 0];
    const qf = sol(p, x, { ankleR: { at: A } });
    p.ik = Object.assign({}, H, { ankleR: { at: A, foot: frame(qf.F.footR) }, ankleL: { at: q.J.ankleL.slice(), foot: frame(q.F.footL) } }); }
  for (const m of mistakes) {
    const base = Object.assign({}, poses[m.at], m.pose);
    if (m.fit) placeHold(base, m.fit.el);
    for (const k of ['hipR', 'abdR', 'ground', 'pos', 'ik', 'pole']) if (base[k] !== undefined) m.pose[k] = base[k];
  }
  return poses;
}

window.EXERCISE = {
  id: 'flying_crow',
  name: { tr: 'Uçan Karga (Eka Pada Galavasana)', en: 'Flying Crow (Eka Pada Galavasana)', es: 'Cuervo volador' },
  category: { tr: 'Yoga · Kol dengesi', en: 'Yoga · Arm balance', es: 'Yoga · Equilibrio de brazos' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['triceps', 'delts', 'core', 'glutes', 'chest'],
  side: 'R',
  tempo: '4-6-4',
  hold: true, holdDur: 3,
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 35, pitch: 14, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Sağ kaval kolların arkasında, ayak kancalı', en: 'Right shin across the arms, foot hooked', es: 'Espinilla derecha sobre los brazos, pie enganchado' } },
  setupView: { yaw: 40, pitch: 14 },
  contacts: ['handR', 'handL', 'heelL', 'ballL'],
  props: [['mat', { at: [0.0, 0, 0], length: 1.9 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = build(RAW, this.mistakes)); },
  rest: 'prep',
  rep: [
    { to: 'hold', dur: 4.0, phase: 0 },
    { to: 'hold', dur: 1.0, phase: 1 },
    { to: 'prep', dur: 4.0, phase: 2 },
  ],
  setup: { tr: 'Sağ ayak bileği sol uyluğun üstünde (4 şekli). Öne katlan, avuçlar matta. Sonra taraf değiştir.',
    en: 'Right ankle over the left thigh (figure 4). Fold forward, palms on the mat. Then switch sides.',
    es: 'Tobillo derecho sobre el muslo izquierdo (figura 4). Pliégate, palmas abajo. Luego cambia de lado.' },
  phases: [
    { name: { tr: 'Kancala ve uç', en: 'Hook and fly', es: 'Engancha y vuela' }, breath: 'out', slow: 1.0,
      text: { tr: 'Sağ kaval kolların arkasına, dirsekler 90°, sol bacağı geri uzat.', en: 'Right shin onto the arms, elbows 90°, extend the left leg back.', es: 'Espinilla a los brazos, codos 90°, estira la izquierda atrás.' } },
    { name: { tr: 'Pozda kal', en: 'Hold', es: 'Mantén' }, breath: 'easy', arc: ['shoulderR', 'elbowR', 'wristR'],
      text: { tr: 'Kalça yüksek, bakış öne, dirsekler içe.', en: 'Hips high, gaze forward, elbows in.', es: 'Cadera alta, mirada al frente, codos adentro.' } },
    { name: { tr: 'Yavaşça in', en: 'Come down', es: 'Baja' }, breath: 'out', slow: 1.0,
      text: { tr: 'Sol ayağı yere bas, 4 şekline dön.', en: 'Left foot down, back to the figure 4.', es: 'Pie izquierdo abajo, vuelve a la figura 4.' } },
  ],
  tempoText: { tr: '4 sn gir · 3-5 nefes kal · 4 sn in', en: '4 s in · stay 3-5 breaths · 4 s out', es: '4 s entrar · 3-5 respiraciones · 4 s salir' },
  mistakes: [
    { title: { tr: 'Kaval kolda alçak', en: 'Shin low on the arms', es: 'Espinilla baja en los brazos' },
      text: { tr: 'Bacak dirseğe kayar, kalça düşer.', en: 'The leg slips toward the elbows, the hips drop.', es: 'La pierna resbala al codo, la cadera cae.' },
      fix: { tr: 'Kavalı koltuk altına yakın kancala', en: 'Hook the shin near the armpits', es: 'Engancha la espinilla cerca de las axilas' },
      fixText: { tr: 'Dizler ve ayak üst kolların arkasında', en: 'Knee and foot high on the backs of the arms', es: 'Rodilla y pie arriba en los brazos' },
      at: 'hold', fit: { el: 105 }, pose: { kneeAt: 0.3, trunk: 84, hipL: 0 }, marks: ['kneeR', 'elbowR'], parts: ['shinR', 'upperR'] },
    { title: { tr: 'Aşağı bakıyor', en: 'Looking down', es: 'Mirar abajo' },
      text: { tr: 'Çene düşer, ağırlık geri kayar, denge kaybolur.', en: 'The chin drops, the weight shifts back, balance goes.', es: 'La barbilla cae, el peso va atrás.' },
      fix: { tr: 'Bakış öne', en: 'Gaze forward', es: 'Mirada al frente' },
      fixText: { tr: 'Çene hafif yukarı, göğüs öne', en: 'Chin slightly up, chest forward', es: 'Barbilla un poco arriba, pecho adelante' },
      at: 'hold', pose: { neck: 40, thoracic: 24 }, view: { yaw: 70, pitch: 8 }, marks: ['head'], parts: ['neck'] },
  ],
  cues: [{ tr: 'Kaval kolda yukarıda', en: 'Shin high on the arms', es: 'Espinilla alta en los brazos' },
    { tr: 'Bakış öne', en: 'Gaze forward', es: 'Mirada al frente' },
    { tr: 'Dirsekler içe', en: 'Hug the elbows in', es: 'Codos hacia dentro' }],
};
}
