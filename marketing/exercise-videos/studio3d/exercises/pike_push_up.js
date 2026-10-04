/* Pike push-up. Inverted V on the floor: toes anchored (anchorX), hands planted from the top pose.
 * All poses rest on [head height, toeR] (one contact set, no blend). Spec trunk 25° from vertical needs elevated feet;
 * on the floor with straight legs the torso measures ~41° (hip 114°). Bottom: elbow ~92°, crown 10 cm ahead of the hands. */
window.EXERCISE = {
  id: 'pike_push_up',
  name: { tr: 'Pike Şınav', en: 'Pike Push-Up', es: 'Flexión pike' },
  category: { tr: 'Omuz · Kol', en: 'Shoulders · Arms', es: 'Hombros · Brazos' },
  equipmentLabel: { tr: 'Vücut ağırlığı · Mat', en: 'Bodyweight · Mat', es: 'Peso corporal · Esterilla' },
  muscles: ['delts', 'triceps', 'upperback', 'core'],
  tempo: '2-0-1',
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 25, pitch: 10, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' }, text: { tr: 'Dirsekler 45-60° açıda kalır', en: 'Elbows stay at 45-60°', es: 'Codos a 45-60°' } },
  props: [['mat', { at: [0.05, 0.006, 0], length: 1.85 }]],
  ctx: { anchorX: ['toeL', 'toeR'], anchorAt: [-0.55, 0], plant: ['handL', 'handR'] },
  poses: {
    top: { trunk: 155, hip: 114, knee: 6, ankle: 25, flat: false, sh: 170, shAbd: 8, el: 0, abd: 4, neck: 0, ground: [['head', 0.169], ['toeR', 0.012]], handFlat: true, handSurface: 0.012, elbowPole: [-0.3, 0.2, 1] },
    bottom: { trunk: 152, hip: 100, knee: 6, ankle: 20, flat: false, sh: 125, shAbd: 30, el: 100, abd: 4, neck: 0, ground: [['head', 0.04], ['toeR', 0.012]], handFlat: true, handSurface: 0.012, elbowPole: [-0.3, 0.2, 1] },
  },
  rest: 'top',
  rep: [
    { to: 'bottom', dur: 2.0, phase: 0 },
    { to: 'top', dur: 1.0, phase: 1 },
  ],
  setup: { tr: 'Eller omuz genişliğinde, kalça yukarıda: ters V. Bacaklar düze yakın, baş kolların arasında.',
    en: 'Hands shoulder-width, hips high: an upside-down V. Legs nearly straight, head between the arms.',
    es: 'Manos al ancho de hombros, cadera arriba: una V invertida. Piernas casi rectas.' },
  setupMarks: [{ type: 'aline', joints: ['wristR', 'shoulderR', 'hipR'] }],
  phases: [
    { name: { tr: 'İniş', en: 'Lower', es: 'Baja' }, breath: 'in', arc: ['shoulderR', 'elbowR', 'wristR'],
      text: { tr: 'Dirsekleri bük, başın tepesini ellerin biraz önüne doğru indir.', en: 'Bend the elbows and lower the crown just ahead of the hands.', es: 'Flexiona los codos y baja la coronilla justo delante de las manos.' } },
    { name: { tr: 'İtiş', en: 'Press', es: 'Empuja' }, breath: 'out', line: ['wristR', 'shoulderR', 'hipR'],
      text: { tr: 'Aynı yoldan geri it. Kalça hep yukarıda kalır.', en: 'Press back along the same path. Hips stay high.', es: 'Empuja por el mismo camino. La cadera sigue arriba.' } },
  ],
  tempoText: { tr: '2 sn in · 1 sn it', en: '2 s down · 1 s up', es: '2 s abajo · 1 s arriba' },
  mistakes: [
    { title: { tr: 'Kalça düşüyor', en: 'Hips drop', es: 'La cadera baja' },
      fix: { tr: 'Ayakları ellere yaklaştır', en: 'Walk the feet in', es: 'Acerca los pies' },
      fixText: { tr: 'Kalça yüksek, gövde dike yakın', en: 'Hips high, torso close to vertical', es: 'Cadera alta, torso casi vertical' },
      at: 'top', pose: { trunk: 130, hip: 65, sh: 150, ground: [['head', 0.24], ['toeR', 0.012]] }, line: ['wristR', 'shoulderR', 'hipR'], parts: ['pelvis', 'waist'] },
    { title: { tr: 'Baş düz aşağı iniyor', en: 'Head drops straight down', es: 'La cabeza baja en vertical' },
      fix: { tr: 'Başı ellerin önüne getir', en: 'Head slightly ahead of the hands', es: 'Cabeza algo delante de las manos' },
      fixText: { tr: 'Baş ve eller bir üçgen oluşturur', en: 'Head and hands form a triangle', es: 'Cabeza y manos forman un triángulo' },
      at: 'bottom', pose: { trunk: 152, hip: 114, ground: [['head', 0.04], ['toeR', 0.012]] }, marks: ['head'], parts: ['upper', 'neck'] },
  ],
  cues: [{ tr: 'Kalça yukarıda, ters V', en: 'Hips high, upside-down V', es: 'Cadera alta, V invertida' }, { tr: 'Baş ellerin arasından öne', en: 'Head travels between the hands', es: 'La cabeza pasa entre las manos' }, { tr: 'Dirsekler 45-60°', en: 'Elbows 45-60°', es: 'Codos a 45-60°' }],
};
