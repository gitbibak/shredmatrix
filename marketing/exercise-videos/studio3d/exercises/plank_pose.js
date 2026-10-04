/* Plank pose (Phalakasana). Side view. Built on push_up.js: hands planted (captured from the plank), toes anchored,
 * two ground contacts [shoulderR at arm height, toeR] so the body rotates rigidly about the toes.
 * rest = the plank itself; rep = plank -> knees down (toes stay, knees touch the mat) -> plank -> hold. A tabletop rest
 * would need the feet to step ~45 cm back, and the mistake chapter jumps rest <-> pose in ~1 s.
 * Shoulders stacked over the wrists (arms vertical) in the plank; spec trunk 82° / shoulder flexion ~90 / neck neutral. */
// kneeling pose: shoulder contact height, hip, knee, ankle (knee rests on the mat, toes stay on their spot, arms straight)
const KN = { g: 0.46, h: 30, k: 58, a: -20 };
window.EXERCISE = {
  id: 'plank_pose',
  name: { tr: 'Plank Pozu', en: 'Plank Pose', es: 'Plancha' },
  category: { tr: 'Yoga · Karın · Omuz', en: 'Yoga · Core · Shoulders', es: 'Yoga · Core · Hombros' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['core', 'delts', 'chest', 'triceps', 'quads'],
  tempo: '3-10-3',
  hold: true, holdDur: 5,
  view: { yaw: 90, pitch: 7 },
  alt: { yaw: 30, pitch: 16, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Eller omuz genişliğinde, omuzlar bileklerin üstünde', en: 'Hands shoulder-width, shoulders over the wrists', es: 'Manos al ancho de hombros, hombros sobre las muñecas' } },
  setupView: { yaw: 35, pitch: 16 },
  setupMarks: [{ type: 'aline', joints: ['wristR', 'shoulderR'] }],
  props: [['mat', { at: [0.4, 0, 0], length: 1.9 }]],
  ctx: { anchorX: ['toeL', 'toeR'], anchorAt: [-0.4, 0], plant: ['handL', 'handR'] },
  poses: {
    plank: { trunk: 82, sh: 80, shAbd: 2, el: 0, ankle: -36, flat: false, abd: 3, neck: -4, ground: [['shoulderR', 0.505], ['toeR', 0]], elbowPole: [-0.3, -1, 0.75] },
    knees: { trunk: 82, hip: KN.h, knee: KN.k, sh: 80, shAbd: 2, el: 0, ankle: KN.a, flat: false, abd: 3, neck: -4, ground: [['shoulderR', KN.g], ['toeR', 0]], elbowPole: [-0.3, -1, 0.75] },
  },
  rest: 'plank',
  rep: [
    { to: 'knees', dur: 3.0, phase: 0 },
    { to: 'plank', dur: 3.0, phase: 1 },
    { to: 'plank', dur: 1.0, phase: 2 },
  ],
  setup: { tr: 'Eller omuzların altında, parmaklar açık. Ayak parmakları yere basar.',
    en: 'Hands under the shoulders, fingers spread. Toes tucked on the mat.',
    es: 'Manos bajo los hombros, dedos abiertos. Dedos de los pies apoyados.' },
  phases: [
    { name: { tr: 'Dizler matta', en: 'Knees down', es: 'Rodillas abajo' }, breath: 'in', slow: 1.0,
      text: { tr: 'Başlangıç: dizler matta, bilekler omuzların altında.', en: 'Start: knees on the mat, wrists under the shoulders.', es: 'Inicio: rodillas abajo, muñecas bajo los hombros.' } },
    { name: { tr: 'Plank\'a uzan', en: 'Lengthen', es: 'Alarga' }, breath: 'out', slow: 1.0,
      text: { tr: 'Nefes vererek dizleri kaldır, baştan topuğa tek çizgi.', en: 'Exhale, lift the knees: one line from head to heels.', es: 'Exhala, eleva las rodillas: una línea de cabeza a talones.' } },
    { name: { tr: 'Pozda kal', en: 'Hold', es: 'Mantén' }, breath: 'easy', line: ['ankleR', 'pelvis', 'shoulderR'],
      text: { tr: 'Karın aktif, kaburgalar içeride, bakış ellerin arasında.', en: 'Core on, ribs in, gaze between the hands.', es: 'Abdomen activo, costillas dentro, mirada entre las manos.' } },
  ],
  tempoText: { tr: '3 sn uzan · 5 nefes kal', en: '3 s into plank · stay 5 breaths', es: '3 s a plancha · 5 respiraciones' },
  mistakes: [
    { title: { tr: 'Kalça çöküyor', en: 'Hips sag', es: 'La cadera se hunde' },
      text: { tr: 'Bel çukurlaşır, karın gevşer.', en: 'The lower back arches, the core lets go.', es: 'La zona lumbar se arquea, el abdomen se suelta.' },
      fix: { tr: 'Karnı topla, kuyruk sokumu hafif içe', en: 'Brace, tailbone slightly tucked', es: 'Activa el abdomen, coxis hacia dentro' },
      fixText: { tr: 'Omuz, kalça ve topuk aynı çizgide', en: 'Shoulder, hip and heel in one line', es: 'Hombro, cadera y talón alineados' },
      at: 'plank', pose: { hip: -18, lumbar: -12 }, line: ['ankleR', 'pelvis', 'shoulderR'], parts: ['pelvis', 'waist'] },
    { title: { tr: 'Kalça çok yüksek', en: 'Hips pike up', es: 'Cadera demasiado alta' },
      text: { tr: 'Kalça yukarı kalkar, çizgi bozulur.', en: 'The hips lift and break the line.', es: 'La cadera sube y rompe la línea.' },
      fix: { tr: 'Kalçayı çizgiye indir', en: 'Lower the hips into line', es: 'Baja la cadera a la línea' },
      fixText: { tr: 'Vücut tek bir tahta gibi', en: 'The body moves like one board', es: 'El cuerpo como una tabla' },
      at: 'plank', pose: { hip: 30, ankle: -30, ground: [['shoulderR', 0.47], ['toeR', 0]] }, line: ['ankleR', 'pelvis', 'shoulderR'], parts: ['pelvis', 'waist'] },
  ],
  cues: [{ tr: 'Baştan topuğa tek çizgi', en: 'One line head to heels', es: 'Una línea de cabeza a talones' },
    { tr: 'Omuzlar bileklerin üstünde', en: 'Shoulders over the wrists', es: 'Hombros sobre las muñecas' },
    { tr: 'Karın aktif', en: 'Core engaged', es: 'Abdomen activo' }],
};
