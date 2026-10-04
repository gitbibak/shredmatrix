// Yoga hold template (quadruped / inverted family): tabletop -> pose -> hold -> tabletop, with hands AND feet fixed on the mat.
// - Hands: anchorX + plant (captured from the rest pose), so they never move.
// - Every pose rests on the same two ground contacts [handR, toeR] (no contact-set blending); the body rotates rigidly about them.
// - Feet: pinFeet() runs once the rig has set FB.BODY (lazy `poses` getter). It solves each pose and moves its ankle so the toe
//   lands on the reference pose's toe (the dog: straight knees are the most sensitive to a shifted ankle), then stores
//   ankle + foot frame as IK targets (`ik.ankleL/R`). Both interpolate linearly, so the toe tip stays on one spot through every
//   transition and the leg IK bends the knees as the hips pass (plain angle interpolation slid the toes ~12 cm; anchoring the
//   toes instead bent the elbows ~35 deg mid-transition). Mistakes with `pin: true` get their own foot target the same way.
//   The frame is stored as {0:[..],1:[..],2:[..]} (not nested arrays) so lerpPose/splineTrack interpolate it without mutating it.
// Copy for other holds: rest = entry pose, rep = [enter, hold (same pose; `hold: true` stretches it), exit].
const MAT_Y = 0.012; // mat top
const G = [['handR', MAT_Y], ['toeR', MAT_Y]];
const CTX = { anchorX: ['handL', 'handR'], anchorAt: [0.6, 0] };

const TABLE = { trunk: 90, hip: 78, knee: 113, ankle: 30, flat: false, sh: 78, el: 0, neck: -6, ground: G };
const DOG = { trunk: 135, hip: 104, knee: 3, ankle: 20, flat: false, sh: 170, el: 0, neck: -4, ground: G };
const RAW = { table: TABLE, dog: DOG };

function pinFeet(poses, refName, extra) {
  const { V, solve, expand } = FB;
  const fk = (p) => solve(expand(Object.assign({}, p, { ik: undefined })), CTX);
  const T = fk(poses[refName]).J.toeR;
  const frame = (F) => ({ 0: F[0].slice(), 1: F[1].slice(), 2: F[2].slice() });
  const pin = (p) => {
    const sol = fk(p), d = [T[0] - sol.J.toeR[0], 0, 0];
    p.ik = Object.assign({}, p.ik, {
      ankleR: { at: V.add(sol.J.ankleR, d), foot: frame(sol.F.footR) },
      ankleL: { at: V.add(sol.J.ankleL, d), foot: frame(sol.F.footL) },
    });
  };
  for (const k in poses) pin(poses[k]);
  for (const [at, pose] of extra) { const merged = Object.assign({}, poses[at], pose); pin(merged); pose.ik = merged.ik; }
  return poses;
}

window.EXERCISE = {
  id: 'downward_dog',
  name: { tr: 'Aşağı Bakan Köpek', en: 'Downward-Facing Dog', es: 'Perro boca abajo' },
  category: { tr: 'Yoga · Tüm vücut', en: 'Yoga · Full body', es: 'Yoga · Cuerpo completo' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['delts', 'triceps', 'lats', 'hamstrings', 'calves'],
  tempo: '3-8-3',
  hold: true, holdDur: 5,
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 32, pitch: 12, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Baş kolların arasında, eller omuz genişliğinde', en: 'Head between the arms, hands shoulder-width', es: 'Cabeza entre los brazos, manos al ancho de hombros' } },
  setupView: { yaw: 40, pitch: 14 },
  setupMarks: [{ type: 'aline', joints: ['wristR', 'shoulderR'] }, { type: 'aline', joints: ['kneeR', 'hipR'] }],
  contacts: ['handR', 'handL', 'kneeR', 'kneeL', 'toeR', 'toeL'],
  props: [['mat', { at: [0.05, 0, 0], length: 1.85 }]],
  ctx: Object.assign({ plant: ['handL', 'handR'] }, CTX),
  get poses() { return this._poses || (this._poses = pinFeet(RAW, 'dog', this.mistakes.filter((m) => m.pin).map((m) => [m.at, m.pose]))); },
  rest: 'table',
  rep: [
    { to: 'dog', dur: 2.6, phase: 0 },
    { to: 'dog', dur: 1.0, phase: 1 },
    { to: 'table', dur: 2.6, phase: 2 },
  ],
  setup: { tr: 'Masa pozisyonu: bilekler omuzların, dizler kalçanın altında. Ayak parmaklarını içe kıvır.',
    en: 'Tabletop: wrists under shoulders, knees under hips. Tuck your toes under.',
    es: 'Mesa: muñecas bajo los hombros, rodillas bajo la cadera. Apoya los dedos de los pies.' },
  phases: [
    { name: { tr: 'Kalçayı kaldır', en: 'Lift the hips', es: 'Eleva la cadera' }, breath: 'out', slow: 1.2,
      text: { tr: 'Elleri bastır, kalçayı yukarı ve geriye gönder.', en: 'Press the hands down, send the hips up and back.', es: 'Empuja con las manos, cadera arriba y atrás.' } },
    { name: { tr: 'Pozda kal', en: 'Hold', es: 'Mantén' }, breath: 'easy', line: ['wristR', 'shoulderR', 'hipR'],
      text: { tr: 'Bilekten kalçaya uzun çizgi, topuklar yere uzanır.', en: 'Long line from wrists to hips, heels reach down.', es: 'Línea larga de muñecas a cadera, talones abajo.' } },
    { name: { tr: 'Dizleri indir', en: 'Lower the knees', es: 'Baja las rodillas' }, breath: 'out', slow: 1.2,
      text: { tr: 'Dizleri bük ve yavaşça mata indir.', en: 'Bend the knees and lower them slowly.', es: 'Flexiona y baja las rodillas despacio.' } },
  ],
  tempoText: { tr: '3 sn çık · 5 nefes kal · 3 sn in', en: '3 s up · stay 5 breaths · 3 s down', es: '3 s arriba · 5 respiraciones · 3 s abajo' },
  mistakes: [
    { title: { tr: 'Sırt yuvarlanıyor', en: 'Rounded back', es: 'Espalda redondeada' },
      text: { tr: 'Bacakları zorla düzleştirince sırt kamburlaşır.', en: 'Forcing straight legs rounds the back.', es: 'Forzar las piernas rectas redondea la espalda.' },
      fix: { tr: 'Dizleri bük, omurgayı uzat', en: 'Soften the knees, lengthen the spine', es: 'Flexiona las rodillas, alarga la columna' },
      fixText: { tr: 'Önce uzun sırt, sonra düz bacak', en: 'Long spine first, straight legs second', es: 'Primero columna larga, luego piernas rectas' },
      at: 'dog', pin: true, pose: { knee: 0, ankle: 15, lumbar: 18, thoracic: 28, hip: 47.4, sh: 150, neck: 8 }, line: ['wristR', 'shoulderR', 'hipR'], parts: ['chest', 'waist', 'upper'] },
    { title: { tr: 'Omuzlar kulaklara kalkıyor', en: 'Shoulders up by the ears', es: 'Hombros hacia las orejas' },
      text: { tr: 'Göğüs yere çöker, baş öne kalkar.', en: 'The chest sinks and the head lifts.', es: 'El pecho se hunde y la cabeza se levanta.' },
      fix: { tr: 'Yeri it, omuzları kulaktan uzaklaştır', en: 'Push the floor, shoulders away from ears', es: 'Empuja el suelo, hombros lejos de las orejas' },
      fixText: { tr: 'Kollar düz, boyun uzun ve rahat', en: 'Straight arms, long relaxed neck', es: 'Brazos rectos, cuello largo y relajado' },
      at: 'dog', pin: true, pose: { shrug: 0.05, thoracic: -14, hip: 121, sh: 175, neck: -30 }, view: { yaw: 50, pitch: 8 }, marks: ['shoulderR', 'head'], parts: ['upper', 'neck', 'chest'] },
  ],
  cues: [{ tr: 'Elleri yere bastır, kalçayı kaldır', en: 'Press hands down, lift the hips', es: 'Empuja con las manos, sube la cadera' },
    { tr: 'Düz bacaktan önce uzun sırt', en: 'Long spine before straight legs', es: 'Columna larga antes que piernas rectas' },
    { tr: 'Topuklar yere uzansın, dizler yumuşak', en: 'Heels toward the floor, soft knees', es: 'Talones al suelo, rodillas suaves' }],
};
