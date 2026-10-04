/* Warrior III (Virabhadrasana III), standing on the right leg (near the camera). Built on single_leg_hip_hinge.js: right foot
 * planted + anchored (ground = right heel), free left leg is FK and stays in line with the trunk, arms reach forward in line.
 * rest = the pose itself (intro shows the finished T); rep = hold -> stand on the right leg with arms up -> hold -> hold.
 * With standing as rest the mistake chapter's 0.9-1.2 s rest <-> pose jumps moved the hands ~2 m (> 6 cm/frame).
 * Spec mistake 2 (locked / hyperextended standing knee) cannot be shown: knee flexion < 0 is not supported by the rig and
 * 0° vs the 10° soft knee is invisible. Replaced by "chest drops, back rounds" (torso below the leg line). */
window.EXERCISE = {
  id: 'warrior_3',
  name: { tr: 'Savaşçı III', en: 'Warrior III', es: 'Guerrero III' },
  category: { tr: 'Yoga · Denge · Arka zincir', en: 'Yoga · Balance · Posterior chain', es: 'Yoga · Equilibrio · Cadena posterior' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['glutes', 'hamstrings', 'lowerback', 'core', 'delts'],
  tempo: '4-8-4',
  hold: true, holdDur: 4,
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 150, pitch: 14, title: { tr: 'Arkadan çapraz', en: 'Rear angle', es: 'Vista trasera' },
    text: { tr: 'Kalça düz, iki taraf aynı yükseklikte', en: 'Hips square, both sides level', es: 'Cadera recta, ambos lados nivelados' } },
  setupView: { yaw: 35, pitch: 12 },
  setupMarks: [{ type: 'aline', joints: ['handR', 'shoulderR', 'pelvis', 'ankleL'] }],
  contacts: ['heelR', 'ballR'],
  props: [['mat', { at: [0.05, 0, 0.05], length: 1.9 }]],
  ctx: { anchorX: ['ankleR'], anchorAt: [0, 0.1], plant: ['ankleR'] },
  poses: {
    hold: { trunk: 86, hipR: 88, kneeR: 10, hipL: 0, kneeL: 1, ankleL: 0, flatL: false, abd: 2, hrotR: 4, sh: 176, shAbd: 6, el: 3, palm: 'in', curl: 0.15, neck: -14, ground: [['heelR', 0]] },
    stand: { trunk: 0, hipR: 4, kneeR: 8, hipL: -16, kneeL: 34, ankleL: -24, flatL: false, abd: 2, hrotR: 4, sh: 174, shAbd: 8, el: 3, palm: 'in', curl: 0.15, neck: 0, ground: [['heelR', 0]] },
  },
  rest: 'hold',
  rep: [
    { to: 'stand', dur: 4.0, phase: 0 },
    { to: 'hold', dur: 4.0, phase: 1 },
    { to: 'hold', dur: 1.0, phase: 2 },
  ],
  setup: { tr: 'Ağırlık sağ ayakta, diz yumuşak. Gövde, kollar ve sol bacak tek çizgi. Sonra taraf değiştir.',
    en: 'Weight on the right foot, knee soft. Torso, arms and left leg in one line. Then switch sides.',
    es: 'Peso en el pie derecho, rodilla suave. Torso, brazos y pierna izquierda en línea. Cambia de lado.' },
  phases: [
    { name: { tr: 'Hazırlan', en: 'Get ready', es: 'Prepárate' }, breath: 'in', slow: 1.0,
      text: { tr: 'Nefes alarak sağ ayakta dikleş, kollar yukarı.', en: 'Inhale, stand tall on the right foot, arms up.', es: 'Inhala, de pie sobre la derecha, brazos arriba.' } },
    { name: { tr: 'Öne uzan', en: 'Tip forward', es: 'Inclínate' }, breath: 'out', slow: 1.0,
      text: { tr: 'Nefes vererek kalçadan katlan, sol bacak ve gövde birlikte.', en: 'Exhale, hinge at the hip; left leg and torso move as one.', es: 'Exhala, bisagra de cadera; pierna y torso juntos.' } },
    { name: { tr: 'Pozda kal', en: 'Hold', es: 'Mantén' }, breath: 'easy', line: ['handR', 'shoulderR', 'pelvis', 'ankleL'],
      text: { tr: 'Parmak uçlarından topuğa uzan, kalça düz.', en: 'Reach from fingertips to heel, hips level.', es: 'Alarga de los dedos al talón, cadera nivelada.' } },
  ],
  tempoText: { tr: '4 sn in · 3-5 nefes kal · nefes alarak kalk', en: '4 s down · stay 3-5 breaths · inhale to rise', es: '4 s bajar · 3-5 respiraciones · inhala y sube' },
  mistakes: [
    { title: { tr: 'Sol kalça açılıyor', en: 'Lifted hip opens', es: 'La cadera se abre' },
      text: { tr: 'Sol kalça yukarı döner, ayak yana bakar.', en: 'The left hip rolls up, the foot turns out.', es: 'La cadera izquierda gira arriba, el pie se abre.' },
      fix: { tr: 'Kalçayı yere paralel tut', en: 'Level the hips', es: 'Cadera paralela al suelo' },
      fixText: { tr: 'Sol ayak parmakları yere bakar', en: 'Left toes point at the floor', es: 'Dedos del pie izquierdo al suelo' },
      at: 'hold', pose: { roll: -14, hrotL: 34, abdL: 8, twist: 6 }, view: { yaw: 150, pitch: 14 }, marks: ['hipL'], parts: ['pelvis', 'thighL'] },
    { title: { tr: 'Göğüs düşüyor', en: 'Chest drops', es: 'El pecho cae' },
      text: { tr: 'Sırt yuvarlanır, gövde bacağın altına iner.', en: 'The back rounds and the torso sinks below the leg.', es: 'La espalda se redondea y el torso baja.' },
      fix: { tr: 'Göğsü öne uzat', en: 'Lengthen the chest forward', es: 'Alarga el pecho adelante' },
      fixText: { tr: 'Gövde ve bacak yere paralel', en: 'Torso and leg parallel to the floor', es: 'Torso y pierna paralelos al suelo' },
      at: 'hold', pose: { trunk: 88, lumbar: 6, thoracic: 18, hipL: -10, neck: 6, sh: 150 }, line: ['pelvis', 'waist', 'neck'], goodLine: ['pelvis', 'neck'], parts: ['waist', 'chest'] },
  ],
  cues: [{ tr: 'Parmaklardan topuğa uzan', en: 'Reach fingers to heel', es: 'Alarga de dedos a talón' },
    { tr: 'Kalça düz', en: 'Level hips', es: 'Cadera nivelada' },
    { tr: 'Duran diz yumuşak', en: 'Standing knee soft', es: 'Rodilla de apoyo suave' }],
};
