/* Knee push-up. Copied from push_up.js: two-point ground contact (shoulder height / chest + knee), hands planted.
 * Spec note: trunk 70° from vertical at the bottom is impossible with the knees as the pivot and the chest ~3 cm off
 * the floor (shoulder-knee line ~0.95 m); the chest-to-floor depth and the straight head-to-knee line define the
 * technique, so the bottom measures ~78° trunk. Elbow ~95° and ~35-45° flare match the spec. */
window.EXERCISE = {
  id: 'knee_push_up',
  name: { tr: 'Diz Üstü Şınav', en: 'Knee Push-Up', es: 'Flexión con rodillas' },
  category: { tr: 'Göğüs · Kol', en: 'Chest · Arms', es: 'Pecho · Brazos' },
  equipmentLabel: { tr: 'Vücut ağırlığı · Mat', en: 'Bodyweight · Mat', es: 'Peso corporal · Esterilla' },
  muscles: ['chest', 'triceps', 'delts', 'core'],
  tempo: '2-0-1',
  view: { yaw: 90, pitch: 7 },
  alt: { yaw: 35, pitch: 18, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' }, text: { tr: 'Dirsekler gövdeye yakın, ~40°', en: 'Elbows close to the body, ~40°', es: 'Codos cerca del cuerpo, ~40°' } },
  props: [['mat', { at: [0.3, 0.006, 0], length: 1.6 }]],
  ctx: { anchorX: ['kneeL', 'kneeR'], anchorAt: [-0.3, 0], plant: ['handL', 'handR'] },
  poses: {
    top: { trunk: 62, sh: 60, shAbd: 12, el: 0, knee: 90, ankle: -45, abd: 4, neck: -8, ground: [['shoulderR', 0.475], ['kneeR', 0]], elbowPole: [-0.4, -1, 0.6] },
    bottom: { trunk: 78, sh: 30, shAbd: 22, el: 95, knee: 90, ankle: -45, abd: 4, neck: -6, ground: [['chest', 0.13], ['kneeR', 0]], elbowPole: [-0.4, -1, 0.6] },
  },
  rest: 'top',
  rep: [
    { to: 'bottom', dur: 2.0, phase: 0 },
    { to: 'top', dur: 1.0, phase: 1 },
  ],
  setup: { tr: 'Dizler matta, ayaklar havada. Eller omuzların altında; baştan dizlere düz bir çizgi.',
    en: 'Knees on the mat, feet up. Hands under the shoulders; a straight line from head to knees.',
    es: 'Rodillas en la esterilla, pies arriba. Manos bajo los hombros; línea recta de cabeza a rodillas.' },
  setupMarks: [{ type: 'aline', joints: ['kneeR', 'pelvis', 'shoulderR'], color: '#22d38a' }],
  phases: [
    { name: { tr: 'İniş', en: 'Lower', es: 'Baja' }, breath: 'in', arc: ['shoulderR', 'elbowR', 'wristR'], line: ['kneeR', 'pelvis', 'shoulderR'],
      text: { tr: 'Dirsekleri geriye bük, gövde tek parça halinde göğüs yere yaklaşana kadar insin.', en: 'Bend the elbows back and lower as one piece until the chest nearly touches the floor.', es: 'Flexiona los codos hacia atrás y baja en bloque hasta casi tocar el suelo.' } },
    { name: { tr: 'İtiş', en: 'Push', es: 'Empuja' }, breath: 'out', line: ['kneeR', 'pelvis', 'shoulderR'],
      text: { tr: 'Yeri it, kollar düzleşsin. Kalça omuzlarla birlikte yükselir.', en: 'Push the floor away until the arms are straight. Hips rise with the shoulders.', es: 'Empuja el suelo hasta estirar los brazos. La cadera sube con los hombros.' } },
  ],
  tempoText: { tr: '2 sn in · 1 sn çık', en: '2 s down · 1 s up', es: '2 s abajo · 1 s arriba' },
  mistakes: [
    { title: { tr: 'Kalça yukarı kalkıyor', en: 'Hips pike up', es: 'La cadera se eleva' },
      fix: { tr: 'Kalçayı öne it', en: 'Drive the hips forward', es: 'Lleva la cadera adelante' },
      fixText: { tr: 'Omuz, kalça ve diz aynı çizgide', en: 'Shoulder, hip and knee in one line', es: 'Hombro, cadera y rodilla alineados' },
      at: 'top', pose: { hip: 32, knee: 104, ground: [['shoulderR', 0.45], ['kneeR', 0]] }, line: ['kneeR', 'pelvis', 'shoulderR'], parts: ['pelvis', 'waist'] },
    { title: { tr: 'Yarım tekrar', en: 'Half rep', es: 'Media repetición' },
      fix: { tr: 'Göğsü yere yaklaştır', en: 'Chest close to the floor', es: 'Pecho cerca del suelo' },
      fixText: { tr: 'Göğüs yerden birkaç santim yukarıda dursun', en: 'Stop with the chest a few cm off the floor', es: 'Para con el pecho a pocos cm del suelo' },
      at: 'bottom', pose: { sh: 48, el: 50, ground: [['chest', 0.24], ['kneeR', 0]] }, marks: ['chest'], parts: ['upperR', 'foreR'] },
  ],
  cues: [{ tr: 'Baştan dizlere tek çizgi', en: 'Head to knees in one line', es: 'Cabeza a rodillas en línea' }, { tr: 'Dirsekler gövdeye yakın', en: 'Elbows tucked', es: 'Codos pegados' }, { tr: 'Göğüs yere kadar', en: 'Chest to the floor', es: 'Pecho al suelo' }],
};
