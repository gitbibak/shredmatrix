/* Prone Y-T-W. Prone base as prone_w_isometric.js (pelvis + toes on the mat, trunk 82 so the thicker chest rests on the mat,
 * chin slightly tucked). Arm angles in the prone thorax frame: shAbd from "toward the feet", sh moves the arm toward the
 * floor/ceiling (sign flips past shAbd 90). Y = shAbd 140, T = shAbd 95, W = shAbd 45 + elbow 90 with the forearms toward
 * the head (bend [0,1,0]). Bodyweight version (the spec lists light dumbbells as optional). */
{
const PRONE = { trunk: 82, hip: -8, knee: 0, ankle: -35, flat: false, abd: 3, neck: 15, bend: [0, 1, 0], palm: 'down', curl: 0.2,
  ground: [['pelvis', 0.012], ['toeR', 0.012]] };

window.EXERCISE = {
  id: 'prone_ytw',
  name: { tr: 'Prone Y-T-W', en: 'Prone Y-T-W Raises', es: 'Elevaciones Y-T-W en prono' },
  category: { tr: 'Üst sırt', en: 'Upper back', es: 'Espalda alta' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['upperback', 'delts'],
  tempo: '2-2-2-2',
  tempoReps: 1,
  view: { yaw: 65, pitch: 24 },
  alt: { yaw: 10, pitch: 45, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Y, T ve W harfleri net görünür', en: 'The Y, T and W shapes, clearly', es: 'Las formas Y, T y W, claras' } },
  setupView: { yaw: 25, pitch: 45 },
  props: [['mat', { at: [-0.25, 0.006, 0], length: 2.1, width: 0.7 }]],
  ctx: { anchorX: ['pelvis'], anchorAt: [-0.2, 0] },
  contacts: ['chest', 'pelvis', 'toeL', 'toeR'],
  poses: {
    // arms long overhead in a Y just above the mat, forehead hovering
    rest: { ...PRONE, shAbd: 140, sh: -24, el: 0, thoracic: -2 },
    // Y lifted ~15 cm from the shoulder blades
    Y: { ...PRONE, shAbd: 140, sh: -11, el: 0, thoracic: -7, protract: -0.025 },
    // T: arms out in line with the shoulders, lifted
    T: { ...PRONE, shAbd: 95, sh: 0, el: 0, thoracic: -7, protract: -0.03 },
    // W: elbows drawn down toward the ribs, hands at head height, blades squeezed
    W: { ...PRONE, shAbd: 45, sh: -4, el: 90, thoracic: -7, protract: -0.03 },
  },
  rest: 'rest',
  rep: [
    { to: 'Y', dur: 2.0, phase: 0 },
    { to: 'T', dur: 2.0, phase: 1 },
    { to: 'W', dur: 2.0, phase: 2 },
    { to: 'rest', dur: 2.0, phase: 3 },
  ],
  setup: { tr: 'Yüzüstü yat, bacaklar düz. Kolları başının üstünde Y yap, alın minderin hemen üstünde.',
    en: 'Lie face down, legs straight. Arms overhead in a Y, forehead just above the mat.',
    es: 'Boca abajo, piernas rectas. Brazos sobre la cabeza en Y, frente justo sobre la esterilla.' },
  phases: [
    { name: { tr: 'Y kaldır', en: 'Y raise', es: 'Eleva en Y' }, breath: 'out', line: ['handL', 'shoulderL', 'shoulderR', 'handR'],
      text: { tr: 'Düz kolları Y şeklinde kaldır, kürekler aşağı ve geriye. 2 sn tut.', en: 'Lift the straight arms in a Y, blades down and back. Hold 2 s.', es: 'Eleva los brazos rectos en Y, escápulas abajo y atrás. 2 s.' } },
    { name: { tr: 'T’ye aç', en: 'Sweep to T', es: 'Abre a T' }, breath: 'easy', line: ['handL', 'shoulderL', 'shoulderR', 'handR'],
      text: { tr: 'Kolları yanlara, omuz hizasına getir. Havada 2 sn tut.', en: 'Sweep the arms out to shoulder level. Hold 2 s in the air.', es: 'Lleva los brazos a la altura del hombro. 2 s en el aire.' } },
    { name: { tr: 'W’ye çek', en: 'Pull to W', es: 'Lleva a W' }, breath: 'easy', line: ['handL', 'elbowL', 'shoulderL', 'shoulderR', 'elbowR', 'handR'],
      text: { tr: 'Dirsekleri bük, kaburgalara çek. Kürekleri sık, 2 sn tut.', en: 'Bend the elbows and draw them to the ribs. Squeeze, hold 2 s.', es: 'Dobla los codos hacia las costillas. Aprieta 2 s.' } },
    { name: { tr: 'Y’ye dön, indir', en: 'Back to Y, lower', es: 'Vuelve a Y y baja' }, breath: 'in',
      text: { tr: 'Kolları uzatıp Y’ye dön ve kontrollü indir.', en: 'Reach back into the Y and lower with control.', es: 'Estira de nuevo a la Y y baja con control.' } },
  ],
  tempoText: { tr: 'Her harfte 2 sn · Y → T → W → indir', en: '2 s per letter · Y → T → W → lower', es: '2 s por letra · Y → T → W → baja' },
  repLabel: { tr: 'SERİ', en: 'ROUND', es: 'SERIE' },
  mistakes: [
    { title: { tr: 'Baş kalkıyor, bel çukurlaşıyor', en: 'Head up, low back arched', es: 'Cabeza arriba, lumbar arqueada' },
      fix: { tr: 'Alın minderin yakınında', en: 'Forehead near the mat', es: 'Frente cerca de la esterilla' },
      fixText: { tr: 'Karın ve kalça sıkı; kalkış küreklerden, belden değil', en: 'Abs and glutes tight; lift from the blades, not the low back', es: 'Abdomen y glúteos firmes; eleva desde las escápulas' },
      at: 'Y', pose: { thoracic: -12, lumbar: -6, neck: -4 },
      line: ['pelvis', 'waist', 'neck', 'head'], goodLine: ['pelvis', 'neck'], parts: ['waist', 'neck'] },
    { title: { tr: 'Omuzlar kulağa kalkıyor', en: 'Shrugging into the ears', es: 'Hombros hacia las orejas' },
      fix: { tr: 'Kürekleri kalçaya doğru çek', en: 'Draw the blades toward the hips', es: 'Lleva las escápulas hacia la cadera' },
      fixText: { tr: 'Boyun uzun, omuzlar kulaktan uzak', en: 'Long neck, shoulders away from the ears', es: 'Cuello largo, hombros lejos de las orejas' },
      at: 'T', pose: { shrug: 0.06, protract: 0.01, neck: 8 }, view: { yaw: 10, pitch: 45 }, marks: ['shoulderL', 'shoulderR'], parts: ['upper', 'neck'] },
  ],
  cues: [{ tr: 'Küreklerle kaldır', en: 'Lift with the shoulder blades', es: 'Eleva con las escápulas' },
    { tr: 'Çene içeride', en: 'Chin tucked', es: 'Barbilla adentro' },
    { tr: 'Y, T, W: 2’şer saniye', en: 'Y, T, W: 2 s each', es: 'Y, T, W: 2 s cada una' }],
};
}
