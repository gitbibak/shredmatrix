/* Chaturanga (Chaturanga Dandasana). Side view. Copy of plank_pose.js / push_up.js: hands planted (captured from the plank),
 * toe tips anchored, two ground contacts [shoulderR at height, toeR] so the body pivots rigidly about the toes.
 * rest = high plank; rep = plank -> chaturanga (lower as one piece) -> hold -> back to plank (spec exit options are Up Dog /
 * Down Dog / belly; returning to plank keeps the hands and toes planted and the clip readable).
 * Forward shift: rigid-foot model cannot roll over the toes (pointing the ankle did not move the shoulders), so the start
 * plank already has the shoulders ~15 cm ahead of the wrists (sh 64) and the elbows land over the wrists at the bottom; shoulder contact height puts the shoulders level with the elbows (upper arms ~parallel to the floor).
 * Elbows hug the ribs: elbowPole points back toward the feet (thorax -x) with a small outward part. */
const POLE = [-1, -0.25, 0.22];
window.EXERCISE = {
  id: 'chaturanga',
  name: { tr: 'Chaturanga', en: 'Chaturanga', es: 'Chaturanga' },
  category: { tr: 'Yoga · Kol · Karın', en: 'Yoga · Arms · Core', es: 'Yoga · Brazos · Core' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['triceps', 'chest', 'delts', 'core'],
  tempo: '3-4-3',
  hold: true, holdDur: 2,
  view: { yaw: 90, pitch: 7 },
  alt: { yaw: 30, pitch: 18, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Dirsekler kaburgalara yakın, geriye bakar', en: 'Elbows hug the ribs, pointing back', es: 'Codos pegados a las costillas, hacia atrás' } },
  setupView: { yaw: 35, pitch: 16 },
  setupMarks: [{ type: 'aline', joints: ['wristR', 'shoulderR'] }],
  props: [['mat', { at: [0.45, 0, 0], length: 1.9 }]],
  ctx: { anchorX: ['toeL', 'toeR'], anchorAt: [-0.4, 0], plant: ['handL', 'handR'] },
  poses: {
    plank: { trunk: 82, sh: 64, shAbd: 2, el: 0, ankle: -36, flat: false, abd: 3, neck: -4, ground: [['shoulderR', 0.45], ['toeR', 0]], elbowPole: POLE },
    low: { trunk: 82, sh: 10, shAbd: 4, el: 90, ankle: -50, flat: false, abd: 3, neck: -8, ground: [['shoulderR', 0.215], ['toeR', 0]], elbowPole: POLE },
  },
  rest: 'plank',
  rep: [
    { to: 'low', dur: 3.0, phase: 0 },
    { to: 'low', dur: 1.0, phase: 1 },
    { to: 'plank', dur: 3.0, phase: 2 },
  ],
  setup: { tr: 'Yüksek plank, ayak parmak uçlarında. Omuzlar bileklerin biraz önünde, vücut tek çizgi.',
    en: 'High plank on the tips of the toes. Shoulders just ahead of the wrists, body in one line.',
    es: 'Plancha alta en la punta de los pies. Hombros algo por delante de las muñecas.' },
  phases: [
    { name: { tr: 'Öne kay ve in', en: 'Shift and lower', es: 'Avanza y baja' }, breath: 'out', slow: 1.1,
      text: { tr: 'Nefes vererek öne kay, dirsekleri geriye bükerek tek parça in.', en: 'Exhale, shift forward and lower as one piece, elbows back.', es: 'Exhala, avanza y baja en bloque, codos atrás.' } },
    { name: { tr: 'Pozda kal', en: 'Hold', es: 'Mantén' }, breath: 'hold', arc: ['shoulderR', 'elbowR', 'wristR'], line: ['ankleR', 'pelvis', 'shoulderR'],
      text: { tr: 'Dirsek 90°, omuzlar dirsek hizasında, göğüs geniş.', en: 'Elbows 90°, shoulders level with the elbows, chest wide.', es: 'Codos a 90°, hombros a la altura de los codos.' } },
    { name: { tr: 'Plank\'a dön', en: 'Press back up', es: 'Vuelve a plancha' }, breath: 'in', slow: 1.0,
      text: { tr: 'Nefes alarak yeri it, yüksek plank\'a dön.', en: 'Inhale, push the floor away back to high plank.', es: 'Inhala, empuja el suelo a plancha alta.' } },
  ],
  tempoText: { tr: '3 sn in · kısa kal · 3 sn çık', en: '3 s down · brief hold · 3 s up', es: '3 s abajo · pausa · 3 s arriba' },
  mistakes: [
    { title: { tr: 'Omuzlar dirseğin altına düşüyor', en: 'Shoulders sink below the elbows', es: 'Hombros bajo los codos' },
      text: { tr: 'Çok aşağı inilir, göğüs öne çöker.', en: 'Going too low, the chest collapses forward.', es: 'Bajar demasiado hunde el pecho.' },
      fix: { tr: '90°de dur', en: 'Stop at 90°', es: 'Para a 90°' },
      fixText: { tr: 'Omuzlar dirsek hizasında, üst kol yere paralel', en: 'Shoulders at elbow height, upper arms level', es: 'Hombros a la altura de los codos' },
      at: 'low', pose: { sh: -14, el: 122, shrug: 0.03, neck: -2, ground: [['shoulderR', 0.155], ['toeR', 0]] }, marks: ['shoulderR', 'elbowR'], parts: ['upperR', 'chest'] },
    { title: { tr: 'Kalça çöküyor', en: 'Hips sag', es: 'La cadera se hunde' },
      text: { tr: 'Gövde çizgisi kırılır, bel çukurlaşır.', en: 'The body line breaks, the lower back arches.', es: 'La línea se rompe, la zona lumbar se arquea.' },
      fix: { tr: 'Karın ve bacaklar aktif', en: 'Engage core and thighs', es: 'Activa abdomen y muslos' },
      fixText: { tr: 'Omuzdan topuğa tek çizgi', en: 'One line from shoulders to heels', es: 'Una línea de hombros a talones' },
      at: 'low', pose: { hip: -12, lumbar: -10, ground: [['shoulderR', 0.25], ['toeR', 0]] }, line: ['ankleR', 'pelvis', 'shoulderR'], parts: ['pelvis', 'waist'] },
  ],
  cues: [{ tr: 'Dirsekler kaburgalara yakın', en: 'Elbows hug the ribs', es: 'Codos pegados a las costillas' },
    { tr: 'Vücut tek çizgi', en: 'Body in one line', es: 'Cuerpo en línea' },
    { tr: 'Omuzlar dirsekten aşağı inmez', en: 'Shoulders no lower than elbows', es: 'Hombros no más bajos que los codos' }],
};
