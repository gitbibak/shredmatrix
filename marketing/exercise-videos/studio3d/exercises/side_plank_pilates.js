// Pilates side plank (forearm, right side down). Built from the approved side_plank.js (same solver setup); Pilates version:
// top arm reaches to the ceiling, front camera (spec primary), shoulder-collapse mistake instead of elbow placement.
// Body line from the mat ~14° (spec 10°: with elbow 90° the forearm height fixes the angle).
// Body = trunk 90 (horizontal) rolled -90 onto the right side, so the frontal plane is
// the sagittal plane of the two-contact ground solver: [elbowR, ankleR] rest on the mat and the body rotates rigidly about them.
// Lowered start = lateral flexion (`side`) + leg adduction of the same sign, which drops the bottom hip onto the mat.
// The upper arm is kept vertical under the shoulder by shAbdR (the trunk tilts ~16 deg, so ~73 deg instead of 90).
// Spec trunk_from_vertical 78 is measured shoulder->feet; with elbow 90 deg + upper arm 0.26 m it gives ~73-75 here.
const G = [['elbowR', 0.006], ['ankleR', -0.018]];
const BASE = { trunk: 90, roll: -90, elR: 90, shRotR: 0, palmR: 'down', curlR: 0.3, shAbdL: 90, elL: 0, palmL: 'forward', curlL: 0.1,
  neck: 0, flat: false, ankle: 0, ground: G };
const P = (o) => Object.assign({}, BASE, o);

window.EXERCISE = {
  id: 'side_plank_pilates',
  name: { tr: 'Pilates Yan Plank', en: 'Side Plank (Pilates)', es: 'Plancha lateral (Pilates)' },
  category: { tr: 'Pilates · Yan karın', en: 'Pilates · Obliques', es: 'Pilates · Oblicuos' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['obliques', 'core', 'glutes', 'delts'],
  tempo: '2-hold-2',
  hold: true, holdDur: 6,
  view: { yaw: -90, pitch: 6 },
  alt: { yaw: 180, pitch: 14, title: { tr: 'Ayak tarafından', en: 'From the feet', es: 'Desde los pies' },
    text: { tr: 'Kalçalar üst üste, öne ya da arkaya devrilmez', en: 'Hips stacked, no rolling forward or back', es: 'Caderas apiladas, sin rodar' } },
  setupView: { yaw: -60, pitch: 16 },
  setupMarks: [{ type: 'aline', joints: ['elbowR', 'shoulderR'] }],
  contacts: ['elbowR', 'handR', 'ankleR'],
  props: [['mat', { at: [-0.2, 0, -0.14], length: 1.9, width: 0.7 }]],
  ctx: { anchorX: ['elbowR', 'ankleR'], anchorAt: [-0.2, -0.05] },
  poses: {
    down: P({ side: 18, abdR: -12, abdL: 12, shAbdR: 58, shAbdL: 12, palmL: 'in' }),
    plank: P({ side: 0, abd: 0, shAbdR: 73 }),
  },
  rest: 'down',
  rep: [
    { to: 'plank', dur: 2.0, phase: 0 },
    { to: 'plank', dur: 1.0, phase: 1 },
    { to: 'down', dur: 2.0, phase: 2 },
  ],
  setup: { tr: 'Sağ yanına uzan. Dirsek omzun altında, ön kol yerde, bacaklar düz, ayaklar üst üste. Sonra taraf değiştir.',
    en: 'Lie on your right side. Elbow right under the shoulder, forearm down, legs straight, feet stacked. Then switch sides.',
    es: 'Túmbate sobre el lado derecho. Codo bajo el hombro, antebrazo apoyado, piernas rectas, pies juntos. Luego cambia de lado.' },
  phases: [
    { name: { tr: 'Kalçayı kaldır', en: 'Lift the hips', es: 'Sube la cadera' }, breath: 'out',
      text: { tr: 'Nefes ver, ön kolu it, kalçayı kaldır; üst kol tavana uzansın.', en: 'Exhale, press the forearm, lift the hips; the top arm reaches up.', es: 'Exhala, empuja el antebrazo, sube la cadera; el brazo de arriba al techo.' } },
    { name: { tr: 'Pozda kal', en: 'Hold', es: 'Mantén' }, breath: 'easy', line: ['ankleR', 'hipR', 'shoulderR'], arc: ['hipR', 'shoulderR', 'elbowR'],
      text: { tr: 'Kulaktan ayak bileğine düz çizgi. Omuzdan uzaklaş, sakin nefes al.', en: 'Straight line ears to ankles. Lift away from the shoulder, breathe calmly.', es: 'Línea recta de orejas a tobillos. Aléjate del hombro, respira tranquilo.' } },
    { name: { tr: 'Yavaşça in', en: 'Lower slowly', es: 'Baja despacio' }, breath: 'in',
      text: { tr: 'Nefes al, kolu indir ve kalçayı kontrollü şekilde mata bırak.', en: 'Inhale, lower the arm and bring the hips down with control.', es: 'Inhala, baja el brazo y la cadera con control.' } },
  ],
  tempoText: { tr: '2 sn kalk · 20-30 sn kal · 2 sn in', en: '2 s up · hold 20-30 s · 2 s down', es: '2 s arriba · 20-30 s · 2 s abajo' },
  mistakes: [
    { title: { tr: 'Kalça çöküyor', en: 'Hips sag', es: 'La cadera se hunde' },
      fix: { tr: 'Ön kolu it, kalçayı kaldır', en: 'Press the forearm, lift the hips', es: 'Empuja el antebrazo, sube la cadera' },
      fixText: { tr: 'Kulak, omuz, kalça ve topuk tek çizgide', en: 'Ear, shoulder, hip and heel in one line', es: 'Oreja, hombro, cadera y talón en línea' },
      at: 'plank', pose: { side: 10, abdR: -7, abdL: 7, shAbdR: 66 }, line: ['ankleR', 'hipR', 'shoulderR'], marks: ['hipR'], parts: ['pelvis', 'waist'] },
    { title: { tr: 'Omuz çöküyor', en: 'Shoulder collapses', es: 'El hombro se hunde' },
      fix: { tr: 'Ön kolu yerden it', en: 'Push the floor away', es: 'Empuja el suelo' },
      fixText: { tr: 'Köprücük kemikleri geniş, omuz kulaktan uzak', en: 'Wide collarbones, shoulder away from the ear', es: 'Clavículas anchas, hombro lejos de la oreja' },
      at: 'plank', pose: { shrugR: 0.055, protract: 0.03, shAbdR: 66, neck: 12 }, marks: ['shoulderR'], parts: ['upperR', 'neck'] },
  ],
  cues: [{ tr: 'Kulaktan topuğa düz çizgi', en: 'Straight line ears to heels', es: 'Línea recta de orejas a talones' },
    { tr: 'Omuzdan yukarı uzaklaş', en: 'Lift away from the shoulder', es: 'Aléjate del hombro' },
    { tr: 'Kalçalar üst üste', en: 'Hips stacked', es: 'Caderas apiladas' }],
};
