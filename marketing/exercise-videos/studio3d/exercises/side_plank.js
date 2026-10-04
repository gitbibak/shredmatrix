// Side plank (forearm, right side down). Body = trunk 90 (horizontal) rolled -90 onto the right side, so the frontal plane is
// the sagittal plane of the two-contact ground solver: [elbowR, ankleR] rest on the mat and the body rotates rigidly about them.
// Lowered start = lateral flexion (`side`) + leg adduction of the same sign, which drops the bottom hip onto the mat.
// The upper arm is kept vertical under the shoulder by shAbdR (the trunk tilts ~16 deg, so ~73 deg instead of 90).
// Spec trunk_from_vertical 78 is measured shoulder->feet; with elbow 90 deg + upper arm 0.26 m it gives ~73-75 here.
const G = [['elbowR', 0.006], ['ankleR', -0.018]];
const BASE = { trunk: 90, roll: -90, elR: 90, shRotR: 0, palmR: 'down', curlR: 0.3, shAbdL: 90, elL: 0, palmL: 'forward', curlL: 0.1,
  neck: 0, flat: false, ankle: 0, ground: G };
const P = (o) => Object.assign({}, BASE, o);

window.EXERCISE = {
  id: 'side_plank',
  name: { tr: 'Yan Plank', en: 'Side Plank', es: 'Plancha lateral' },
  category: { tr: 'Karın · Core', en: 'Core', es: 'Core' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['obliques', 'core', 'glutes', 'delts'],
  tempo: '1.5-hold-1.5',
  hold: true, holdDur: 6,
  view: { yaw: -90, pitch: 6 },
  alt: { yaw: -40, pitch: 42, title: { tr: 'Üstten bak', en: 'Top view', es: 'Vista superior' },
    text: { tr: 'Omuzlar ve kalçalar üst üste', en: 'Shoulders and hips stacked', es: 'Hombros y caderas apilados' } },
  setupView: { yaw: -60, pitch: 16 },
  setupMarks: [{ type: 'aline', joints: ['elbowR', 'shoulderR'] }],
  contacts: ['elbowR', 'handR', 'ankleR'],
  props: [['mat', { at: [-0.2, 0, -0.14], length: 1.9, width: 0.7 }]],
  ctx: { anchorX: ['elbowR', 'ankleR'], anchorAt: [-0.2, -0.05] },
  poses: {
    down: P({ side: 18, abdR: -12, abdL: 12, shAbdR: 58 }),
    plank: P({ side: 0, abd: 0, shAbdR: 73 }),
  },
  rest: 'down',
  rep: [
    { to: 'plank', dur: 1.5, phase: 0 },
    { to: 'plank', dur: 1.0, phase: 1 },
    { to: 'down', dur: 1.5, phase: 2 },
  ],
  setup: { tr: 'Sağ yanına uzan. Dirsek omzun tam altında, ön kol yerde, bacaklar düz ve ayaklar üst üste. Sonra taraf değiştir.',
    en: 'Lie on your right side. Elbow right under the shoulder, forearm down, legs straight, feet stacked. Then switch sides.',
    es: 'Túmbate sobre el lado derecho. Codo bajo el hombro, antebrazo apoyado, piernas rectas, pies juntos. Luego cambia de lado.' },
  phases: [
    { name: { tr: 'Kalçayı kaldır', en: 'Lift the hips', es: 'Sube la cadera' }, breath: 'out',
      text: { tr: 'Ön kolu yere bastır, kalçayı kulaktan topuğa düz çizgi olana kadar kaldır.', en: 'Press the forearm down and lift the hips until ears to heels form a straight line.', es: 'Empuja con el antebrazo y sube la cadera hasta alinear orejas y talones.' } },
    { name: { tr: 'Pozda kal', en: 'Hold', es: 'Mantén' }, breath: 'easy', line: ['ankleR', 'hipR', 'shoulderR'], arc: ['hipR', 'shoulderR', 'elbowR'],
      text: { tr: 'Kalça yüksek, kalçalar üst üste. Sakin ve düzenli nefes al.', en: 'Hips high and stacked. Breathe slowly and steadily.', es: 'Cadera alta y apilada. Respira lento y constante.' } },
    { name: { tr: 'Yavaşça in', en: 'Lower slowly', es: 'Baja despacio' }, breath: 'in',
      text: { tr: 'Kalçayı kontrollü şekilde mata indir.', en: 'Lower the hips to the mat with control.', es: 'Baja la cadera a la esterilla con control.' } },
  ],
  tempoText: { tr: '1,5 sn kalk · 20-40 sn kal · 1,5 sn in', en: '1.5 s up · hold 20-40 s · 1.5 s down', es: '1,5 s arriba · 20-40 s · 1,5 s abajo' },
  mistakes: [
    { title: { tr: 'Kalça çöküyor', en: 'Hips sag', es: 'La cadera se hunde' },
      fix: { tr: 'Ön kolu it, kalçayı kaldır', en: 'Press the forearm, lift the hips', es: 'Empuja el antebrazo, sube la cadera' },
      fixText: { tr: 'Kulak, omuz, kalça ve topuk tek çizgide', en: 'Ear, shoulder, hip and heel in one line', es: 'Oreja, hombro, cadera y talón en línea' },
      at: 'plank', pose: { side: 10, abdR: -7, abdL: 7, shAbdR: 66 }, line: ['ankleR', 'hipR', 'shoulderR'], marks: ['hipR'], parts: ['pelvis', 'waist'] },
    { title: { tr: 'Dirsek omzun önünde', en: 'Elbow ahead of the shoulder', es: 'Codo delante del hombro' },
      fix: { tr: 'Dirseği omzun altına al', en: 'Elbow under the shoulder', es: 'Codo bajo el hombro' },
      fixText: { tr: 'Kol dik durunca omuz yüklenmez', en: 'A vertical upper arm protects the shoulder', es: 'Brazo vertical, hombro protegido' },
      at: 'plank', pose: { shAbdR: 100 }, line: ['shoulderR', 'elbowR'], marks: ['elbowR'], parts: ['upperR'] },
  ],
  cues: [{ tr: 'Kulaktan topuğa düz çizgi', en: 'Straight line ears to heels', es: 'Línea recta de orejas a talones' },
    { tr: 'Dirsek omzun altında', en: 'Elbow under the shoulder', es: 'Codo bajo el hombro' },
    { tr: 'Kalça yüksek, kalçayı sık', en: 'Hips high, glutes tight', es: 'Cadera alta, glúteos firmes' }],
};
