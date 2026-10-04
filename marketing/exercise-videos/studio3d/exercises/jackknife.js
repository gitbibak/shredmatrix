/* Jackknife (Pilates mat, supine inversion). Same solver setup as rollover.js:
 * - Every pose rests on [neck, head]: the upper back (C7 joint at its lying clearance + shoulder blades) carries the weight,
 *   the back of the head only rests on the mat. Spine curl + neck angle decide how high the pelvis rolls.
 * - anchorX = shoulders; hands are world-IK targets on the mat beside the hips (arms long, pressing) in every pose.
 * - fit() bisects the hip flexion so the legs point at _legs (thigh angle from the floor, 90 = vertical, 180 = over the head).
 * - Press-up: spec asks for a body line 85° from the mat with the head down; with the head resting on the mat that would put
 *   the load on the cervical spine, so the press stops at ~75° (neck 64, legs vertical over the shoulders/face).
 * - Roll down ends with the legs at 45° (spec), then they return to 90° for the next rep. */
{
const G = [['neck', -0.006], ['head', 0.008]];
const BASE = { ground: G, trunk: -90, knee: 0, ankle: -30, flat: false, abd: 0, hrot: 2, palm: 'down', curl: 0.1 };
const RAW = {
  flat: { ...BASE, lumbar: 8, thoracic: 3, neck: 6, _legs: 95 },
  over: { ...BASE, lumbar: 62, thoracic: 28, neck: 46, _legs: 174 },
  press: { ...BASE, lumbar: 4, thoracic: 10, neck: 64, ankle: -40, _legs: 92 },
  mid: { ...BASE, lumbar: 30, thoracic: 14, neck: 34, _legs: 150 },
  low: { ...BASE, lumbar: 6, thoracic: 3, neck: 6, _legs: 45 },
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
  id: 'jackknife',
  name: { tr: 'Çakı (Jackknife)', en: 'Jackknife', es: 'Navaja (jackknife)' },
  category: { tr: 'Pilates · Karın', en: 'Pilates · Core', es: 'Pilates · Core' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['core', 'obliques', 'glutes'],
  tempo: '2-2-4',
  tempoReps: 1,
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 20, pitch: 16, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Bacaklar bitişik, tek bir çizgi', en: 'Legs together, one straight line', es: 'Piernas juntas, una sola línea' } },
  contacts: ['neck', 'head', 'pelvis', 'handR'],
  props: [['mat', { at: [-0.1, 0.006, 0], length: 2.0 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fit(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'flat',
  rep: [
    { to: 'over', dur: 2.0, phase: 0 },
    { to: 'press', dur: 2.0, phase: 1 },
    { to: 'mid', dur: 2.0, phase: 2 },
    { to: 'low', dur: 2.0, phase: 3 },
    { to: 'flat', dur: 1.2, phase: 3, card: false },
  ],
  setup: { tr: 'Sırtüstü yat, bacaklar bitişik ve tavana dik. Kollar yanda, avuçlar mindere bastırır.',
    en: 'Lie on your back, legs together straight up. Arms long by your sides, palms pressing down.',
    es: 'Boca arriba, piernas juntas hacia el techo. Brazos largos a los lados, palmas presionan el suelo.' },
  phases: [
    { name: { tr: 'Nefes ver, geriye yuvarlan', en: 'Exhale, roll over', es: 'Exhala, rueda atrás' }, breath: 'out',
      text: { tr: 'Bacaklar başın üstünden geçer, yere paralel durur.', en: 'Legs go over the head and stop parallel to the floor.', es: 'Las piernas pasan sobre la cabeza, paralelas al suelo.' } },
    { name: { tr: 'Nefes al, yukarı it', en: 'Inhale, press up', es: 'Inhala, empuja arriba' }, breath: 'in', line: ['neck', 'hipR', 'ankleR'],
      text: { tr: 'Kollar mindere basar; kalça ve bacaklar tavana uzanır.', en: 'Arms press down; hips and legs reach to the ceiling.', es: 'Brazos presionan; cadera y piernas al techo.' } },
    { name: { tr: 'Omur omur in', en: 'Roll down', es: 'Baja vértebra a vértebra' }, breath: 'out',
      text: { tr: 'Nefes ver, fermuar gibi omur omur in; bacaklar yukarıda.', en: 'Exhale, roll down like a zipper; legs stay up.', es: 'Exhala, baja como una cremallera; piernas arriba.' } },
    { name: { tr: 'Bacaklar 45°ye', en: 'Legs to 45°', es: 'Piernas a 45°' }, breath: 'out',
      text: { tr: 'Pelvis mindere iner, bacaklar 45°ye uzanır; bel minderde.', en: 'Pelvis lands, legs reach to 45°; low back down.', es: 'La pelvis apoya, piernas a 45°; lumbar abajo.' } },
  ],
  tempoText: { tr: '2 sn yuvarlan · 2 sn it · 4 sn yavaşça in', en: '2 s roll over · 2 s press · 4 s slowly down', es: '2 s rueda · 2 s empuja · 4 s baja despacio' },
  mistakes: [
    { title: { tr: 'Bacakları fırlatmak', en: 'Kicking up with momentum', es: 'Patear con impulso' },
      fix: { tr: 'Yavaş, karından it', en: 'Slow, press from the belly', es: 'Despacio, empuja desde el abdomen' },
      fixText: { tr: 'Kollar mindere basar, bacaklar düz bir çizgide durur', en: 'Arms press down; the legs stop in one straight line', es: 'Brazos presionan; las piernas paran en línea recta' },
      at: 'press', pose: { lumbar: -16, thoracic: 4, _legs: 62 }, line: ['neck', 'hipR', 'ankleR'], parts: ['waist', 'thigh'] },
    { title: { tr: 'Ağırlık boyunda', en: 'Weight on the neck', es: 'Peso en el cuello' },
      fix: { tr: 'Kürek kemiklerinde kal', en: 'Stay on the shoulder blades', es: 'Quédate en las escápulas' },
      fixText: { tr: 'Baş düz ve sabit, bakış bacaklarda', en: 'Head straight and still, eyes on the legs', es: 'Cabeza recta y quieta, mirada a las piernas' },
      at: 'press', pose: { neck: 70, headTurn: 30, shrug: 0.03 }, view: { yaw: 40, pitch: 18 }, marks: ['neck'], parts: ['neck', 'face'] },
  ],
  cues: [{ tr: 'Kollar mindere bastırır', en: 'Press the arms into the mat', es: 'Brazos presionan la esterilla' },
    { tr: 'Omuzdan ayağa düz çizgi', en: 'Straight line shoulders to toes', es: 'Línea recta de hombros a pies' },
    { tr: 'Fermuar gibi omur omur in', en: 'Roll down like a zipper', es: 'Baja como una cremallera' }],
};
}
