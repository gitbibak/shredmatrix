/* Rollover (Pilates mat, supine inversion).
 * - Every pose rests on the same two contacts [shoulderR, head]: the shoulders and the back of the head stay on the mat,
 *   so the spine curl (lumbar + thoracic flexion) and the neck angle alone decide how far the pelvis rolls up. Weight sits on
 *   the upper back (base of the neck = C7 joint at its 6 cm lying clearance, shoulder blades); the back of the head only
 *   rests on the mat (head contact), the cervical spine carries no load.
 * - anchorX = shoulders: the shoulders do not slide; arms are world-IK targets on the mat beside the hips (palms down,
 *   pressing) in every pose, so they stay put while the body rolls over them.
 * - fit() (lazy) bisects the hip flexion per pose so the legs point where the phase wants them (_legs = thigh angle from the
 *   floor, + = up; 180 = horizontal over the head).
 * - Spec tempo 3-1.5-4 (+2 s reset): the reset is merged into the roll down (legs close at 90° as the pelvis lands). */
{
const G = [['neck', -0.006], ['head', 0.008]];
const BASE = { ground: G, trunk: -90, knee: 0, ankle: -30, flat: false, abd: 0, hrot: 2, palm: 'down', curl: 0.1 };
const RAW = {
  flat: { ...BASE, lumbar: 8, thoracic: 3, neck: 6, _legs: 95 },
  over: { ...BASE, trunk: -150, lumbar: 62, thoracic: 28, neck: 46, _legs: 174 },
  open: { ...BASE, trunk: -150, lumbar: 62, thoracic: 28, neck: 46, abd: 15, ankle: 12, _legs: 184 },
  mid: { ...BASE, trunk: -120, lumbar: 30, thoracic: 14, neck: 34, abd: 15, ankle: 12, _legs: 150 },
};
const CTX = { anchorX: ['shoulderL', 'shoulderR'], anchorAt: [-0.55, 0] };

function fit(poses, extra) {
  const { V, solve, expand } = FB;
  const S = (p) => solve(expand(p), CTX);
  // hands: on the mat beside the hips of the flat pose, fixed in the world
  const s0 = S({ ...poses.flat, hip: 90 });
  const ik = {};
  for (const sd of ['L', 'R']) { const h = s0.J['shoulder' + sd]; ik['hand' + sd] = { at: [h[0] + 0.56, 0.03, h[2] + (sd === 'R' ? 0.06 : -0.06)] }; }
  const legs = (p) => {
    p.trunk = -90 - (p.lumbar + p.thoracic + p.neck);        // head axis starts level: the 2-contact solve only nudges it (no branch flip)
    if (p._legs == null) return;
    // thigh angle from the +x floor direction (feet side), measured toward up and over the head
    const f = (hip) => { const J = S({ ...p, hip }).J; const d = V.sub(J.kneeR, J.hipR); return Math.atan2(d[1], d[0]) * 180 / Math.PI; };
    const want = p._legs;
    let lo = 0, hi = 230;
    for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; const d = ((f(m) - want + 540) % 360) - 180; if (d < 0) lo = m; else hi = m; }
    p.hip = +((lo + hi) / 2).toFixed(1);
  };
  for (const k in poses) { legs(poses[k]); poses[k].ik = ik; }
  for (const [at, pose] of extra) { const m = Object.assign({}, poses[at], pose); legs(m); pose.hip = m.hip; pose.trunk = m.trunk; pose.ik = ik; }
  return poses;
}

window.EXERCISE = {
  id: 'rollover',
  name: { tr: 'Geriye Yuvarlanma (Rollover)', en: 'Rollover', es: 'Rollover (voltereta atrás)' },
  category: { tr: 'Pilates · Karın', en: 'Pilates · Core', es: 'Pilates · Core' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['core', 'obliques', 'hamstrings'],
  tempo: '3-1.5-2-2',
  tempoReps: 1,
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 40, pitch: 18, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Ağırlık kürek kemiklerinde, boyun serbest', en: 'Weight on the shoulder blades, neck free', es: 'Peso en las escápulas, cuello libre' } },
  setupView: { yaw: 45, pitch: 18 },
  contacts: ['shoulderR', 'head', 'pelvis', 'handR'],
  props: [['mat', { at: [-0.1, 0.006, 0], length: 2.0 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fit(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'flat',
  rep: [
    { to: 'over', dur: 3.0, phase: 0 },
    { to: 'open', dur: 1.5, phase: 1 },
    { to: 'mid', dur: 2.0, phase: 2 },
    { to: 'flat', dur: 2.0, phase: 3 },
  ],
  setup: { tr: 'Sırtüstü yat, bacaklar bitişik ve tavana dik. Kollar yanda, avuçlar mindere bastırır.',
    en: 'Lie on your back, legs together straight up. Arms long by your sides, palms pressing down.',
    es: 'Boca arriba, piernas juntas hacia el techo. Brazos largos a los lados, palmas presionan el suelo.' },
  phases: [
    { name: { tr: 'Nefes ver, geriye yuvarlan', en: 'Exhale, roll over', es: 'Exhala, rueda atrás' }, breath: 'out', line: ['pelvis', 'waist', 'neck'],
      text: { tr: 'Kuyruk sokumu kalkar, bacaklar başın üstünden yere paralel gelir.', en: 'Tailbone lifts; legs go over the head, parallel to the floor.', es: 'El coxis sube; las piernas pasan sobre la cabeza, paralelas al suelo.' } },
    { name: { tr: 'Bacakları aç', en: 'Open the legs', es: 'Abre las piernas' }, breath: 'in',
      text: { tr: 'Nefes al, bacaklar kalça genişliğinde, ayaklar bükülü.', en: 'Inhale, legs hip-width apart, feet flexed.', es: 'Inhala, piernas al ancho de cadera, pies flexionados.' } },
    { name: { tr: 'Omur omur in', en: 'Roll down', es: 'Baja vértebra a vértebra' }, breath: 'out',
      text: { tr: 'Nefes ver, sırtı omur omur indir; bacaklar başın üstünde kalır.', en: 'Exhale, lower the spine bone by bone; legs stay over you.', es: 'Exhala, baja la columna vértebra a vértebra; piernas arriba.' } },
    { name: { tr: 'Bacakları kapat', en: 'Close the legs', es: 'Cierra las piernas' }, breath: 'in',
      text: { tr: 'Pelvis mindere iner, bacaklar birleşip 90°ye döner.', en: 'Pelvis lands; legs close and return to 90°.', es: 'La pelvis apoya; las piernas se juntan a 90°.' } },
  ],
  tempoText: { tr: '3 sn yuvarlan · 1,5 sn aç · 4 sn yavaşça in', en: '3 s roll over · 1.5 s open · 4 s slowly down', es: '3 s rueda · 1,5 s abre · 4 s baja despacio' },
  mistakes: [
    { title: { tr: 'Ağırlık boyunda', en: 'Weight on the neck', es: 'Peso en el cuello' },
      fix: { tr: 'Kürek kemiklerinde kal', en: 'Stay on the shoulder blades', es: 'Quédate en las escápulas' },
      fixText: { tr: 'Daha az yuvarlan; kollar mindere bastırır, baş düz kalır', en: 'Roll less; arms press down, the head stays straight', es: 'Rueda menos; brazos presionan, la cabeza recta' },
      at: 'over', pose: { lumbar: 58, thoracic: 44, neck: 66, _legs: 180, headTurn: 18 }, marks: ['neck'], parts: ['neck', 'chest'] },
    { title: { tr: 'Bacakları savurmak', en: 'Throwing the legs', es: 'Lanzar las piernas' },
      fix: { tr: 'Yavaş, karından kalk', en: 'Slow, from the belly', es: 'Despacio, desde el abdomen' },
      fixText: { tr: 'Karın içe; bacaklar yere paralel durur, düşmez', en: 'Belly scooped; the legs stop parallel to the floor', es: 'Abdomen adentro; las piernas paran paralelas al suelo' },
      at: 'over', pose: { knee: 55, ankle: -10, _legs: 212 }, marks: ['ankleR'], parts: ['thigh', 'shin'] },
  ],
  cues: [{ tr: 'Kollar mindere bastırır', en: 'Press the arms into the mat', es: 'Brazos presionan la esterilla' },
    { tr: 'Karından yuvarlan, savurma', en: 'Roll from the belly, no swing', es: 'Rueda desde el abdomen, sin impulso' },
    { tr: 'Ağırlık boyunda değil', en: 'Keep the weight off the neck', es: 'Sin peso en el cuello' }],
};
}
