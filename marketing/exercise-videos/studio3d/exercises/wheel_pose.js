/* Wheel Pose (Urdhva Dhanurasana). Supine, knees bent, heels near the hips, palms flat beside the ears -> lift the hips
 * (bridge, head still down) -> press through the crown and straighten the arms, hips high, head hangs -> hold -> tuck the
 * chin and lower down. (The crown-of-the-head stop is mentioned in the card; a separate crown pose made the head dip
 * through the mat while blending.)
 * - One ground contact [heelR] in every pose; the feet are planted from the start pose (ctx.plant) and are the anchor.
 *   `trunk` (rotation about the feet) is solved per pose.
 * - Hands: world IK targets, the SAME spot in every pose (so the palms never slide). fitWheel() (lazy): the wheel is solved
 *   first (sh puts the wrists under the shoulders, trunk puts the palms on the mat); then the start bisects the knee bend
 *   (heel-to-hip distance) so the ears lie next to those palm spots, the hip so the pelvis rests on the mat.
 * - Hold keeps 75% of the spec spine numbers (lumbar -30, thoracic -25, hip -10): with the full values the hands land only
 *   ~60 cm from the feet, which needs the heels far closer than "near the hips". measure trunk_from_vertical >90 = inverted.
 * - Engine limit: weight-bearing palms always point the fingers toward the head side of the thorax, so the fingers point
 *   away from the feet (the spec wants them toward the shoulders). */
{
const MAT = 0.012;
const BASE = { trunk: -90, abd: 3, hrot: 0, flat: true, handFlat: true, handSurface: 0, curl: 0.1, noAvoid: true, shAbd: 12, elbowPole: [1, 0.3, 0.25] };
const G = [['heelR', MAT]];
const RAW = {
  start: { ...BASE, ground: G, trunk: -90, hip: 60, knee: 100, lumbar: -4, thoracic: 10, neck: -8, sh: 150, el: 120 },
  bridge: { ...BASE, ground: G, trunk: -60, hip: 0, knee: 100, lumbar: -10, thoracic: 14, neck: 12, sh: 150, el: 120 },
  wheel: { ...BASE, ground: G, trunk: -75, hip: -10, knee: 66, lumbar: -30, thoracic: -25, neck: -40, sh: 175, el: 2 },
};
const CTX = { anchorX: ['ankleL', 'ankleR'], anchorAt: [0.25, 0], plant: ['ankleL', 'ankleR'] };

function newton(p, keys, res, iters = 50) {
  const n = keys.length, e = 0.3;
  for (let it = 0; it < iters; it++) {
    const r0 = res(p);
    const Jm = keys.map((k) => { const r = res({ ...p, [k]: p[k] + e }); return r.map((v, i) => (v - r0[i]) / e); });
    const A = r0.map((_, i) => keys.map((_, j) => Jm[j][i]).concat([r0[i]]));
    for (let c = 0; c < n; c++) {
      let piv = c; for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r;
      [A[c], A[piv]] = [A[piv], A[c]]; if (Math.abs(A[c][c]) < 1e-9) return;
      for (let r = 0; r < n; r++) if (r !== c) { const f = A[r][c] / A[c][c]; for (let k = c; k <= n; k++) A[r][k] -= f * A[c][k]; }
    }
    keys.forEach((k, j) => { p[k] -= Math.max(-3, Math.min(3, A[j][n] / A[j][j])); });
  }
  keys.forEach((k) => { p[k] = +p[k].toFixed(2); });
}

function fitWheel(poses, extra) {
  const { V, solve, expand } = FB;
  const S = (p) => solve(expand(Object.assign({}, p, { ik: undefined })), { anchorX: CTX.anchorX, anchorAt: CTX.anchorAt }).J;
  const bis = (f, lo, hi, n = 22) => { const up = f(hi) > f(lo);
    for (let i = 0; i < n; i++) { const m = (lo + hi) / 2; if ((f(m) > 0) === up) hi = m; else lo = m; } return +((lo + hi) / 2).toFixed(2); };
  // wheel: sh puts the wrist under the shoulder, trunk (rotation about the planted feet) puts the palm on the mat
  const armDown = (q) => { q.sh = bis((v) => { const J = S({ ...q, sh: v }); return J.shoulderR[0] - J.wristR[0]; }, 120, 260); return q; };
  const place = (q) => { q.trunk = bis((v) => S(armDown({ ...q, trunk: v })).wristR[1] - 0.038, -150, -30); return armDown(q); };
  const W = poses.wheel; Object.assign(W, place({ ...W }));
  const Jw = S(W);
  const H = (s) => [Jw.handR[0], 0, (s === 'R' ? 1 : -1) * Math.abs(Jw.handR[2])];
  // start: lying, feet flat, palms on those same spots beside the ears: knee (heel-to-hip distance) so the ear is over the
  // palm, hip so the pelvis rests on the mat, trunk so the upper back rests on the mat
  const st = poses.start;
  const lie = (q) => { q.trunk = bis((v) => S({ ...q, trunk: v }).shoulderR[1] - (MAT + 0.103), -130, -50); return q; };
  const seat = (q) => { q.hip = bis((v) => S(lie({ ...q, hip: v })).pelvis[1] - (MAT + 0.1), 30, 120); return lie(q); };
  st.knee = bis((k) => S(seat({ ...st, knee: k })).head[0] - 0.03 - H('R')[0], 95, 150);
  Object.assign(st, seat({ ...st }));
  // bridge: hips up, upper back and head still on the mat
  const Bp = poses.bridge; Bp.knee = st.knee; Bp.trunk = bis((v) => S({ ...Bp, trunk: v }).shoulderR[1] - (MAT + 0.103), -120, -20);
  const ik = { handL: { at: H('L') }, handR: { at: H('R') } };
  for (const k of ['start', 'bridge', 'wheel']) poses[k].ik = ik;
  for (const [at, pose] of extra) if (pose.refit) {
    const m = Object.assign({}, poses[at], pose);
    m.trunk = bis((v) => { const J = S({ ...m, trunk: v }); return V.len(V.sub(J.shoulderR, H('R'))) - 0.535; }, -150, -30);
    pose.trunk = m.trunk;
  }
  return poses;
}

window.EXERCISE = {
  id: 'wheel_pose',
  name: { tr: 'Tekerlek Pozu (Urdhva Dhanurasana)', en: 'Wheel Pose (Urdhva Dhanurasana)', es: 'Postura de la rueda' },
  category: { tr: 'Yoga · Geriye eğilme', en: 'Yoga · Backbend', es: 'Yoga · Extensión' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['glutes', 'quads', 'triceps', 'delts', 'lowerback'],
  tempo: '5-6-4',
  hold: true, holdDur: 3,
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 20, pitch: 14, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Ayaklar paralel, dirsekler omuz genişliğinde', en: 'Feet parallel, elbows shoulder-width', es: 'Pies paralelos, codos al ancho de hombros' } },
  setupView: { yaw: 40, pitch: 20 },
  contacts: ['heelR', 'ballR', 'handR', 'handL'],
  props: [['mat', { at: [-0.3, 0.006, 0], length: 1.9, width: 0.75 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fitWheel(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'start',
  rep: [
    { to: 'bridge', dur: 1.8, phase: 0 },
    { to: 'wheel', dur: 2.2, phase: 1 },
    { to: 'wheel', dur: 1.0, phase: 2 },
    { to: 'start', dur: 3.0, phase: 3 },
  ],
  setup: { tr: 'Sırtüstü uzan, ayaklar kalçaya yakın. Avuçlar kulakların yanında.',
    en: 'Lie on your back, feet close to the hips. Palms beside the ears.',
    es: 'Boca arriba, pies cerca de la cadera. Palmas junto a las orejas.' },
  phases: [
    { name: { tr: 'Kalçayı kaldır', en: 'Lift the hips', es: 'Sube la cadera' }, breath: 'in',
      text: { tr: 'Ellere ve ayaklara bas, kalçayı kaldır.', en: 'Press hands and feet, lift the hips.', es: 'Empuja manos y pies, sube la cadera.' } },
    { name: { tr: 'Kolları uzat', en: 'Straighten the arms', es: 'Estira los brazos' }, breath: 'in',
      text: { tr: 'Başın tepesinden geçip kolları uzat, göğsü aç.', en: 'Pass through the crown, then straighten the arms.', es: 'Pasa por la coronilla y estira los brazos.' } },
    { name: { tr: 'Tekerlekte kal', en: 'Hold the wheel', es: 'Mantén la rueda' }, breath: 'easy', line: ['wristR', 'shoulderR'],
      text: { tr: 'Eller ve ayaklara eşit bas, baş gevşek.', en: 'Press evenly through hands and feet, head relaxed.', es: 'Presiona igual manos y pies, cabeza suelta.' } },
    { name: { tr: 'Kontrollü in', en: 'Lower with control', es: 'Baja con control' }, breath: 'out', slow: 1.0,
      text: { tr: 'Çeneyi içeri al, omurgayı yavaşça indir.', en: 'Tuck the chin and roll the spine down slowly.', es: 'Mete la barbilla y baja la columna despacio.' } },
  ],
  tempoText: { tr: '5 sn kalk · 5-10 sn kal · 4 sn in · 3-5 tekrar', en: '5 s up · hold 5-10 s · 4 s down · 3-5 reps', es: '5 s arriba · 5-10 s · 4 s abajo · 3-5 rep.' },
  mistakes: [
    { title: { tr: 'Dizler ve dirsekler açılıyor', en: 'Knees and elbows splay', es: 'Rodillas y codos abiertos' },
      text: { tr: 'Dizler ayaklardan, dirsekler omuzlardan geniş.', en: 'Knees wider than the feet, elbows wider than the shoulders.', es: 'Rodillas más abiertas que los pies, codos más que los hombros.' },
      fix: { tr: 'Dizler ve dirsekler paralel', en: 'Knees and elbows parallel', es: 'Rodillas y codos paralelos' },
      fixText: { tr: 'Uyluklar arasında blok yardımcı olur', en: 'A block between the thighs helps', es: 'Un bloque entre los muslos ayuda' },
      at: 'wheel', pose: { abd: 18, hrot: 16, shAbd: 30 }, view: { yaw: 15, pitch: 16 }, marks: ['kneeL', 'kneeR', 'elbowL', 'elbowR'], parts: ['thigh', 'upper'] },
    { title: { tr: 'Kavis sadece belde', en: 'Arch only in the low back', es: 'Arco solo en la lumbar' },
      text: { tr: 'Bel ezilir, omuzlar kapalı, kollar eğik.', en: 'The low back crunches, the shoulders stay closed, arms slanted.', es: 'La lumbar se comprime, hombros cerrados, brazos inclinados.' },
      fix: { tr: 'Omuzları ve göğsü aç', en: 'Open the shoulders and chest', es: 'Abre hombros y pecho' },
      fixText: { tr: 'Omuzlar bileklerin üstüne, göğüs ellere doğru', en: 'Shoulders over the wrists, chest toward the hands', es: 'Hombros sobre las muñecas, pecho hacia las manos' },
      at: 'wheel', pose: { lumbar: -50, thoracic: -4, hip: -4, sh: 200, refit: true }, line: ['pelvis', 'waist', 'neck'], parts: ['waist'] },
  ],
  cues: [{ tr: 'Eller ve ayaklara eşit bas', en: 'Press evenly through hands and feet', es: 'Presiona igual manos y pies' },
    { tr: 'Kuyruk sokumunu uzat', en: 'Lengthen the tailbone', es: 'Alarga el coxis' },
    { tr: 'Dirsekler omuz genişliğinde', en: 'Elbows shoulder-width', es: 'Codos al ancho de hombros' }],
};
}
