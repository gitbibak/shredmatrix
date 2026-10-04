/* Straight-arm pulldown (high pulley, straight bar). Standing hinge ~30°, feet planted, elbows locked at ~15°.
 * FK shoulder flexion sweeps the bar on an arc from eye height to the front of the thighs.
 * The cable station + straight bar is a prop defined in this file (FB.PROPS._cableBar): cable from the high pulley to
 * the bar centre, bar through both hands (overhand). Spec note: hip 40° with knee 15° would tilt the shins backwards,
 * so the hip is 45° (shin vertical). */
{
const { V } = FB;
const PUL = [1.0, 2.12, 0];
FB.PROPS._cableBar = (sol) => {
  const hL = sol.J.handL, hR = sol.J.handR, ax = V.norm(V.sub(hR, hL)), mid = V.lerp(hL, hR, 0.5);
  sol.grip = { L: ax, R: ax }; sol.gripKind = 'pronated';
  return [
    { t: 'box', c: [PUL[0] + 0.16, 1.15, 0], s: [0.2, 2.3, 0.48], m: 'frameDark', round: 0.01 },
    { t: 'box', c: [PUL[0] + 0.04, PUL[1] + 0.05, 0], s: [0.24, 0.05, 0.08], m: 'frame' },
    { t: 'sph', c: PUL, r: 0.045, m: 'iron' },
    { t: 'tube', pts: [PUL, mid], r: 0.004, m: 'chrome' },
    { t: 'cyl', a: V.add(hL, V.mul(ax, -0.08)), b: V.add(hR, V.mul(ax, 0.08)), r: 0.014, m: 'chrome' },
    { t: 'sph', c: mid, r: 0.022, m: 'iron' },
  ];
};
const ST = { trunk: 30, hip: 45, knee: 15, abd: 4, hrot: 6, neck: -4, el: 15, shAbd: 4, bend: [0, 1, 0] };

window.EXERCISE = {
  id: 'straight_arm_pulldown',
  name: { tr: 'Düz Kol Pulldown', en: 'Straight-Arm Pulldown', es: 'Jalón con brazos rectos' },
  category: { tr: 'Sırt', en: 'Back', es: 'Espalda' },
  equipmentLabel: { tr: 'Kablo, düz bar', en: 'Cable, straight bar', es: 'Polea, barra recta' },
  muscles: ['lats', 'upperback', 'core'],
  tempo: '1-0.5-2',
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 52, pitch: 12, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Kollar düz ve simetrik, omuzlar aşağıda', en: 'Arms straight and even, shoulders down', es: 'Brazos rectos y simétricos, hombros abajo' } },
  setupView: { yaw: 40, pitch: 10 },
  setupMarks: [{ type: 'span', joints: ['ankleR', 'ankleL'], label: { tr: 'Kalça genişliği', en: 'Hip width', es: 'Ancho de cadera' } }],
  props: [['_cableBar']],
  ctx: { anchorX: ['ankleL', 'ankleR'], plant: ['ankleL', 'ankleR'] },
  poses: {
    // hinge 30°, soft knees, arms long in front, bar at eye height
    top: { ...ST, sh: 125, protract: 0.015 },
    // bar swept to the front of the thighs, lats shortened, shoulders down
    bottom: { ...ST, sh: 24, shrug: -0.01, protract: -0.015 },
  },
  rest: 'top',
  rep: [
    { to: 'bottom', dur: 1.3, phase: 0 },
    { to: 'bottom', dur: 0.5, phase: 1 },
    { to: 'top', dur: 2.0, phase: 2 },
  ],
  setup: { tr: 'Makineden bir adım geri dur. Kalçadan hafif öne eğil, barı omuz genişliğinde, avuçlar aşağı tut.',
    en: 'Step back from the stack. Hinge slightly, overhand grip at shoulder width.',
    es: 'Da un paso atrás. Inclínate un poco desde la cadera, agarre prono al ancho de hombros.' },
  phases: [
    { name: { tr: 'Aşağı süpür', en: 'Sweep down', es: 'Barre hacia abajo' }, breath: 'out',
      text: { tr: 'Dirsek açısı sabit, barı bir yay çizerek uyluklara indir.', en: 'Elbows fixed, sweep the bar in an arc down to your thighs.', es: 'Codos fijos, baja la barra en arco hasta los muslos.' } },
    { name: { tr: 'Sık', en: 'Squeeze', es: 'Aprieta' }, breath: 'hold', arc: ['shoulderR', 'elbowR', 'wristR'],
      text: { tr: 'Kanatları sık, omuzlar aşağıda. Sırt düz.', en: 'Squeeze the lats, shoulders down. Back flat.', es: 'Aprieta los dorsales, hombros abajo. Espalda recta.' } },
    { name: { tr: 'Kontrollü kaldır', en: 'Raise slowly', es: 'Sube despacio' }, breath: 'in',
      text: { tr: 'İki saniyede, kollar düz, bar göz hizasına döner.', en: 'Two seconds, arms straight, bar back to eye height.', es: 'Dos segundos, brazos rectos, barra a la altura de los ojos.' } },
  ],
  tempoText: { tr: '1 sn indir · 0,5 sn sık · 2 sn kaldır', en: '1 s down · 0.5 s squeeze · 2 s up', es: '1 s abajo · 0,5 s aprieta · 2 s arriba' },
  mistakes: [
    { title: { tr: 'Dirsekleri bükmek', en: 'Bending the elbows', es: 'Doblar los codos' },
      fix: { tr: 'Dirsek açısını kilitle', en: 'Lock the elbow angle', es: 'Bloquea el ángulo del codo' },
      fixText: { tr: 'Hafif ağırlık seç; hareket omuzdan, triceps itişi değil', en: 'Go lighter; move from the shoulder, not a triceps push', es: 'Menos peso; mueve el hombro, no empujes con tríceps' },
      at: 'bottom', pose: { sh: 38, el: 82 }, marks: ['elbowR'], parts: ['upper', 'fore'] },
    { title: { tr: 'Bel yuvarlanıyor', en: 'Rounded lower back', es: 'Espalda baja redonda' },
      fix: { tr: 'Kalçadan menteşe', en: 'Hinge, don’t round', es: 'Bisagra, no redondees' },
      fixText: { tr: 'Gövde açısı sabit, sırt baştan kalçaya düz', en: 'Fixed torso angle, back flat from head to hips', es: 'Ángulo de torso fijo, espalda recta' },
      at: 'bottom', pose: { trunk: 30, hip: 46, lumbar: 12, thoracic: 12, neck: 6, sh: 34 },
      line: ['pelvis', 'waist', 'neck'], goodLine: ['pelvis', 'neck'], parts: ['waist', 'chest'] },
  ],
  cues: [{ tr: 'Kollar düz kalsın', en: 'Arms stay straight', es: 'Brazos rectos' },
    { tr: 'Barı uyluklara süpür', en: 'Sweep the bar to your thighs', es: 'Barre la barra a los muslos' },
    { tr: 'Kanatları hisset', en: 'Feel the lats', es: 'Siente los dorsales' }],
};
}
