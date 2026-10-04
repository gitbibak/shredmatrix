// JM press (flat bench, barbell, grip ~0.9x shoulder width). Bench contacts from dumbbell_bench_press.js. Hands are body
// holds (thorax frame [up from the chest, toward the head, outward]); the bar sits between the fists (stock barbell prop).
// Bottom: bar ~7 cm above the throat, upper arms close to vertical (shoulder flexion ~75 in the trunk frame), elbows ~105,
// elbows pointing toward the feet/ceiling and tucked ~35-40 deg.
const G = [['shoulderR', 0.45], ['pelvis', 0.45]];
const BASE = { trunk: -90, hip: -10, knee: 92, neck: 14, abd: 12, ground: G };
window.EXERCISE = {
  id: 'jm_press',
  name: { tr: 'JM Press', en: 'JM Press', es: 'Press JM' },
  category: { tr: 'Kol · Triceps', en: 'Arms · Triceps', es: 'Brazos · Tríceps' },
  equipmentLabel: { tr: 'Barbell · Düz bench', en: 'Barbell · Flat bench', es: 'Barra · Banco plano' },
  muscles: ['triceps', 'chest', 'delts'],
  tempo: '2-0-1.2',
  view: { yaw: 90, pitch: 9, zoom: 1.1 },
  alt: { yaw: 30, pitch: 30, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Dirsekler içeride, ayaklara doğru bakıyor', en: 'Elbows tucked, pointing toward the feet', es: 'Codos cerrados, apuntando a los pies' } },
  setupView: { yaw: 25, pitch: 34 },
  setupMarks: [{ type: 'aline', joints: ['handL', 'handR'] }],
  props: [['bench', { at: [-0.4, 0, 0], length: 1.2, height: 0.45 }], ['bench', { at: [-0.4, 0, 0], length: 1.2, height: 0.39 }], ['barbell', { plateR: 0.2 }]],
  ctx: { anchorX: ['pelvis'], anchorAt: [0, 0], plant: ['ankleL', 'ankleR'] },
  poses: {
    top: Object.assign({}, BASE, { holdL: [0.64, 0.06, 0.15], holdR: [0.64, 0.06, 0.15], elbowPole: [1, -0.5, 0.4] }),
    bottom: Object.assign({}, BASE, { holdL: [0.24, 0.2, 0.15], holdR: [0.24, 0.2, 0.15], elbowPole: [1, -0.5, 0.4] }),
  },
  rest: 'top',
  rep: [
    { to: 'bottom', dur: 2.0, phase: 0 },
    { to: 'top', dur: 1.2, phase: 1 },
  ],
  setup: { tr: 'Benchte yat, ayaklar yerde. Barı omuz genişliğinden biraz dar tut, kollar omuzların üstünde dik.',
    en: 'Lie on the bench, feet flat. Grip a bit narrower than the shoulders, arms straight over the shoulders.',
    es: 'Túmbate en el banco, pies en el suelo. Agarre algo más estrecho que los hombros, brazos rectos.' },
  phases: [
    { name: { tr: 'Çeneye indir', en: 'Lower to the chin', es: 'Baja hacia la barbilla' }, breath: 'in', arc: ['shoulderR', 'elbowR', 'wristR'],
      text: { tr: 'Dirsekleri bük, barı göğse değil çene-boyun hizasına indir. Boyundan 5-10 cm önce dur.', en: 'Lower toward the chin, not the chest. Stop 5-10 cm above the neck.', es: 'Flexiona y baja hacia la barbilla, no al pecho. Para a 5-10 cm del cuello.' } },
    { name: { tr: 'Yukarı it', en: 'Press up', es: 'Empuja' }, breath: 'out',
      text: { tr: 'Dirsekleri açarak barı aynı yoldan omuzların üstüne it.', en: 'Extend the elbows and press back up over the shoulders.', es: 'Extiende los codos y vuelve sobre los hombros.' } },
  ],
  tempoText: { tr: '2 sn in · 1,2 sn it', en: '2 s down · 1.2 s up', es: '2 s abajo · 1,2 s arriba' },
  mistakes: [
    { title: { tr: 'Barı göğse indirmek', en: 'Lowering to the chest', es: 'Bajar al pecho' },
      fix: { tr: 'Çeneye doğru indir', en: 'Aim for the chin', es: 'Apunta a la barbilla' },
      fixText: { tr: 'Üst kol neredeyse dik, dirsekler öne', en: 'Upper arms near vertical, elbows forward', es: 'Brazos casi verticales, codos al frente' },
      at: 'bottom', pose: { holdL: [0.13, 0.0, 0.17], holdR: [0.13, 0.0, 0.17], elbowPole: [-0.3, -0.6, 0.75] }, line: ['shoulderR', 'elbowR'], marks: ['elbowR'], parts: ['upperR'] },
    { title: { tr: 'Dirsekler yana açılıyor', en: 'Elbows flare wide', es: 'Codos abiertos' },
      fix: { tr: 'Dirsekleri içeride tut', en: 'Keep the elbows tucked', es: 'Codos cerrados' },
      fixText: { tr: 'Gövdeye 30-45°, triceps çalışır', en: '30-45° from the torso; triceps do the work', es: '30-45° del torso; trabaja el tríceps' },
      at: 'bottom', pose: { elbowPole: [0.1, -0.15, 1] }, view: { yaw: 10, pitch: 40 }, marks: ['elbowL', 'elbowR'], parts: ['upperR', 'upperL'] },
  ],
  cues: [{ tr: 'Dirsekler içeride', en: 'Elbows tucked', es: 'Codos cerrados' },
    { tr: 'Bar çeneye, göğse değil', en: 'Bar to the chin, not the chest', es: 'Barra a la barbilla, no al pecho' },
    { tr: 'İnişi kontrol et', en: 'Control the descent', es: 'Controla la bajada' }],
};
