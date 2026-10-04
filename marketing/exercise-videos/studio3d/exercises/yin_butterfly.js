/* Yin Butterfly (seated Baddha Konasana fold). Sit on a folded blanket, soles together, knees open, hands on the feet ->
 * round forward, forehead rests on a bolster laid across the feet, arms long on the mat -> long passive hold -> roll up.
 * - One ground contact [pelvis] on the blanket top in every pose; `trunk` is the pelvis tilt, lumbar/thoracic the yin rounding.
 * - fitButterfly() (lazy, after the rig sets FB.BODY): hrot bisected so the soles meet, hip bisected so the feet rest on
 *   the mat; the fold solves (trunk, thoracic) with a small Newton so the forehead rests on the bolster top.
 * - Blanket (_hipBlanket) squashes out of sight when the pelvis drops (mistake "pelvis tips back": sitting on the floor).
 * - measure: trunk_from_vertical uses the pelvis->neck chord, so the rounded fold reads ~60 as in the spec even though the
 *   pelvis itself only tilts ~25°. hip_flexion includes the 50° abduction (thigh vs trunk line). */
{
const { V } = FB;
const MAT = 0.012, BLH = 0.06;                          // folded blanket under the sit bones
const G = (d = 0) => [['pelvis', MAT + BLH + d]];
let BOL = [0.6, 0.12, 0]; const BR = 0.11;               // bolster across the mat in front of the toes (set by the fit)
FB.PROPS._hipBlanket = (sol) => {
  const h = Math.min(BLH, sol.J.pelvis[1] - 0.1 - MAT) * (BLH + 0.04) / BLH;
  if (h < 0.006) return [];
  return FB.PROPS.blanket(null, { at: [sol.J.pelvis[0] - 0.02, MAT + h / 2 - 0.03, 0], size: [0.34, h, 0.44] });
};
FB.PROPS._feetBolster = () => FB.PROPS.bolster(null, { at: BOL, axis: [0, 0, 1], length: 0.4, r: BR });
const LEGS = { flat: false, abd: 50, knee: 125, hrot: 40, ankle: -12, kneePole: [0.3, 0.55, 1] };
const BASE = { ...LEGS, ground: G(), curl: 0.4, handFlat: true, handSurface: 0 };   // flat palms everywhere; handSurface interpolates (no mode switch)
const RAW = {
  sit: { ...BASE, trunk: 6, hip: 60, lumbar: 4, thoracic: 6, neck: 6, sh: 30, shAbd: 10, el: 30, elbowPole: [0, -1, 0.6] },
  fold: { ...BASE, trunk: 28, hip: 60, lumbar: 22, thoracic: 26, neck: 22, sh: 120, shAbd: 18, el: 12, curl: 0.15, elbowPole: [0, -1, 0.6] },
};
const CTX = { anchorX: ['pelvis'], anchorAt: [-0.1, 0] };

function newton(p, keys, res, iters = 40) {
  const n = keys.length, e = 0.4;
  for (let it = 0; it < iters; it++) {
    const r0 = res(p);
    const Jm = keys.map((k) => { const r = res({ ...p, [k]: p[k] + e }); return r.map((v, i) => (v - r0[i]) / e); });
    const A = r0.map((_, i) => keys.map((_, j) => Jm[j][i]).concat([r0[i]]));
    for (let c = 0; c < n; c++) {
      let piv = c; for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r;
      [A[c], A[piv]] = [A[piv], A[c]]; if (Math.abs(A[c][c]) < 1e-9) return;
      for (let r = 0; r < n; r++) if (r !== c) { const f = A[r][c] / A[c][c]; for (let k = c; k <= n; k++) A[r][k] -= f * A[c][k]; }
    }
    keys.forEach((k, j) => { p[k] -= Math.max(-4, Math.min(4, A[j][n] / A[j][j])); });
  }
  keys.forEach((k) => { p[k] = +p[k].toFixed(2); });
}

function fitButterfly(poses, extra) {
  const { solve, expand } = FB;
  const S = (p) => solve(expand(Object.assign({}, p, { ik: undefined })), CTX).J;
  const bis = (p, key, f, lo, hi) => { const up = f(hi) > f(lo);
    for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if ((f(m) > 0) === up) hi = m; else lo = m; } p[key] = +((lo + hi) / 2).toFixed(2); };
  const legs = (p) => {
    for (let k = 0; k < 3; k++) {
      bis(p, 'hrot', (v) => S({ ...p, hrot: v }).ballR[2] - 0.035, -20, 80);                       // soles together
      bis(p, 'hip', (v) => { const J = S({ ...p, hip: v }); return Math.min(J.ballR[1], J.heelR[1]) - (MAT + 0.03); }, 10, 178);  // feet on the mat
    }
  };
  legs(poses.sit);
  // fold: one scale s on (pelvis tilt, lumbar, thoracic, neck) so the forehead rests on a bolster lying across the mat
  // just in front of the toes; the hip follows the pelvis tilt so the thighs keep their angle to the floor
  const J0 = S(poses.sit), f = poses.fold, F0 = { trunk: f.trunk, lumbar: f.lumbar, thoracic: f.thoracic, neck: f.neck };
  const top = MAT + 2 * BR;
  const scaled = (s) => { const q = { ...f }; for (const k in F0) q[k] = F0[k] * s; q.hip = poses.sit.hip + (q.trunk - poses.sit.trunk); return q; };
  let lo = 0.3, hi = 1.4; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (S(scaled(m)).head[1] > top + 0.095) lo = m; else hi = m; }
  Object.assign(f, scaled((lo + hi) / 2)); for (const k of ['trunk', 'lumbar', 'thoracic', 'neck', 'hip']) f[k] = +f[k].toFixed(2);
  legs(f);
  { const Jf = S(f), toe = Math.max(Jf.toeR[0], Jf.toeL[0]); BOL = [Math.max(Jf.head[0] + 0.03, toe + BR + 0.015), MAT + BR, 0]; }
  // hands: on the feet when sitting, flat on the mat in front when folded (beside the bolster)
  const onFeet = (J, s) => V.add(V.lerp(J['ankle' + s], J['knee' + s], 0.12), [0, 0.06, (s === 'R' ? 1 : -1) * 0.02]);   // hands around the ankles
  const Jf = S(f);
  poses.sit.ik = { handL: { at: onFeet(J0, 'L') }, handR: { at: onFeet(J0, 'R') } }; poses.sit.handSurface = +(poses.sit.ik.handR.at[1] - 0.022).toFixed(3);
  f.ik = { handL: { at: [BOL[0] + 0.04, 0, -0.29] }, handR: { at: [BOL[0] + 0.04, 0, 0.29] } };
  for (const [at, pose] of extra) {
    const m = Object.assign({}, poses[at], pose, { ik: undefined });
    if (pose.fitLegs) { legs(m); pose.hip = m.hip; pose.hrot = m.hrot; }
    if (pose.handsOnKnees) { const J = S(m); const k = (s) => V.add(J['knee' + s], [-0.02, 0.07, 0]); pose.ik = { handL: { at: k('L') }, handR: { at: k('R') } }; pose.handSurface = +(pose.ik.handR.at[1] - 0.022).toFixed(3); }
    if (pose.handsFwd) { pose.handSurface = 0; const J = S(m); pose.ik = { handL: { at: [J.shoulderL[0] + 0.32, 0, J.shoulderL[2] - 0.06] }, handR: { at: [J.shoulderR[0] + 0.32, 0, J.shoulderR[2] + 0.06] } }; }
  }
  return poses;
}

window.EXERCISE = {
  id: 'yin_butterfly',
  name: { tr: 'Yin Kelebek Pozu', en: 'Yin Butterfly', es: 'Mariposa yin' },
  category: { tr: 'Yin Yoga · Kalça', en: 'Yin Yoga · Hips', es: 'Yin yoga · Cadera' },
  equipmentLabel: { tr: 'Mat, battaniye, bolster', en: 'Mat, blanket, bolster', es: 'Esterilla, manta, bolster' },
  muscles: ['adductors', 'lowerback', 'hamstrings'],
  tempo: '4-10-4',
  hold: true, holdDur: 3,
  view: { yaw: 90, pitch: 8 },
  alt: { yaw: 35, pitch: 34, title: { tr: 'Üstten bak', en: 'View from above', es: 'Vista desde arriba' },
    text: { tr: 'Tabanlar birleşik, dizler kendiliğinden açık', en: 'Soles together, knees falling open on their own', es: 'Plantas juntas, rodillas abiertas sin forzar' } },
  setupView: { yaw: 40, pitch: 16 },
  contacts: ['pelvis', 'heelR', 'heelL'],
  props: [['mat', { at: [0.15, 0, 0], length: 1.5, width: 0.8 }], ['_hipBlanket'], ['_feetBolster']],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fitButterfly(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'sit',
  rep: [
    { to: 'fold', dur: 4.0, phase: 0 },
    { to: 'fold', dur: 1.0, phase: 1 },
    { to: 'sit', dur: 3.5, phase: 2 },
  ],
  setup: { tr: 'Katlanmış battaniyeye otur, ayak tabanlarını birleştir. Bolsterı ayaklarının önüne koy.',
    en: 'Sit on a folded blanket, soles together. Lay a bolster in front of your feet.',
    es: 'Siéntate sobre una manta doblada, plantas juntas. Pon un bolster delante de los pies.' },
  phases: [
    { name: { tr: 'Öne yuvarlan', en: 'Round forward', es: 'Redondéate' }, breath: 'out', slow: 1.0,
      text: { tr: 'Nefes verirken sırtı yuvarla, elleri öne kaydır, alnı bolstera bırak.', en: 'Exhale, round the back, slide the hands forward, rest the forehead on the bolster.', es: 'Exhala, redondea la espalda, desliza las manos y apoya la frente en el bolster.' } },
    { name: { tr: 'Bırak ve bekle', en: 'Let go and wait', es: 'Suelta y espera' }, breath: 'easy', line: ['pelvis', 'waist', 'neck'],
      text: { tr: 'Kaslar gevşek, yerçekimi çalışsın. Çene ve karın yumuşak.', en: 'Muscles soft, let gravity work. Soft jaw and belly.', es: 'Músculos sueltos, deja que actúe la gravedad. Mandíbula y abdomen suaves.' } },
    { name: { tr: 'Yavaşça doğrul', en: 'Roll up slowly', es: 'Sube despacio' }, breath: 'in', slow: 1.0,
      text: { tr: 'Elleri geri yürüt, omurgayı yavaşça kaldır, sonra bacakları uzat.', en: 'Walk the hands back, roll the spine up, then stretch the legs out.', es: 'Camina las manos atrás, sube la columna y luego estira las piernas.' } },
  ],
  tempoText: { tr: '4 sn gir · 3-5 dk bekle · 4 sn çık', en: '4 s in · stay 3-5 min · 4 s out', es: '4 s entrar · 3-5 min · 4 s salir' },
  mistakes: [
    { title: { tr: 'Dizleri yere bastırmak', en: 'Pushing the knees down', es: 'Empujar las rodillas' },
      text: { tr: 'Eller dizleri zorla aşağı iter, kasık gerilir.', en: 'The hands force the knees down and the groin strains.', es: 'Las manos fuerzan las rodillas y la ingle se tensa.' },
      fix: { tr: 'Dizleri bırak, gerekirse destekle', en: 'Let the knees be, support them', es: 'Suelta las rodillas, apóyalas' },
      fixText: { tr: 'Dizlerin altına blok ya da yastık koy', en: 'Put blocks or cushions under the knees', es: 'Pon bloques o cojines bajo las rodillas' },
      at: 'sit', pose: { abd: 66, hrot: 50, trunk: 4, fitLegs: true, handsOnKnees: true, sh: 40, el: 20, shrug: 0.03, curl: 0.2, palm: 'down' },
      view: { yaw: 15, pitch: 20 }, marks: ['kneeL', 'kneeR'], parts: ['thigh'] },
    { title: { tr: 'Leğen geriye düşüyor', en: 'Pelvis tips back', es: 'La pelvis cae atrás' },
      text: { tr: 'Yerde oturunca bel ezilir, öne zorla katlanılır.', en: 'Sitting on the floor, the low back crunches into a forced fold.', es: 'En el suelo, la lumbar se comprime en un pliegue forzado.' },
      fix: { tr: 'Battaniyeye otur', en: 'Sit on a blanket', es: 'Siéntate en una manta' },
      fixText: { tr: 'Kalça yükselince leğen öne devrilir, sırt rahat yuvarlanır', en: 'Raised hips let the pelvis tip forward and the back round easily', es: 'Con la cadera elevada, la pelvis bascula y la espalda se redondea fácil' },
      at: 'fold', pose: { ground: G(-BLH - 0.02), trunk: -6, hip: 46, lumbar: 34, thoracic: 32, neck: 6, handsFwd: true, fitLegs: true },
      line: ['pelvis', 'waist', 'neck'], parts: ['waist', 'pelvis'] },
  ],
  cues: [{ tr: 'Sırtı yuvarla, yerçekimi çalışsın', en: 'Round the spine, let gravity work', es: 'Redondea la espalda, deja actuar la gravedad' },
    { tr: 'Çene ve karın yumuşak', en: 'Soft jaw and belly', es: 'Mandíbula y abdomen suaves' },
    { tr: 'Dizleri destekle', en: 'Support the knees', es: 'Apoya las rodillas' }],
};
}
