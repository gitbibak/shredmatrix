/* Bent-knee (soleus) calf raise, bodyweight, on the floor. Quarter-squat held (knee 40, trunk 25), balls of the feet
 * anchored and grounded, heels rise by ankle angle only (flat:false). Hands rest lightly on two rails in front (`pole`
 * props: a `wall` prop is 2.6 m tall and would shrink the framing); hands on fixed world targets.
 * Spec note: ankle -40 at the top is read as foot-vs-shin; with the shin kept at its 15 deg forward tilt that is a 55 deg
 * foot pitch (~14 cm heel rise), contradicting "heels rise ~8-10 cm". The heel rise is matched instead (ankle -18:
 * ~9 cm). */
(function () {
  const RAILX = 0.52, RAILZ = 0.3;
  const H = (y) => ({ handL: { at: [RAILX - 0.035, y, -RAILZ + 0.02] }, handR: { at: [RAILX - 0.035, y, RAILZ - 0.02] } });
  const HANDS = { handL: { at: [RAILX - 0.035, 1.08, -RAILZ + 0.02] }, handR: { at: [RAILX - 0.035, 1.08, RAILZ - 0.02] } };
  const BASE = { trunk: 25, hip: 50, knee: 40, abd: 5, hrot: 6, flat: false, neck: -12, ik: HANDS, elbowPole: [-0.3, -1, 0.5], palm: 'in', curl: 0.5,
    ground: [['ballR', 0]] };
  window.EXERCISE = {
    id: 'bent_knee_calf_raise',
    name: { tr: 'Dizler Bükülü Calf Raise', en: 'Bent-Knee Calf Raise', es: 'Elevación de talones con rodillas flexionadas' },
    category: { tr: 'Bacak · Baldır', en: 'Legs · Calves', es: 'Piernas · Gemelos' },
    equipmentLabel: { tr: 'Vücut ağırlığı · Destek', en: 'Bodyweight · Rail', es: 'Peso corporal · Apoyo' },
    muscles: ['calves'],
    tempo: '1-0.7-2',
    view: { yaw: 90, pitch: 5 },
    alt: { yaw: 22, pitch: 8, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
      text: { tr: 'Dizler ayak uçları yönünde, bükülü kalır', en: 'Knees over the toes, stay bent', es: 'Rodillas sobre los pies, siguen flexionadas' } },
    setupView: { yaw: 35, pitch: 12 },
    contacts: ['ballR', 'ballL', 'handR'],
    props: [['pole', { at: [RAILX, 0, RAILZ], height: 1.15 }], ['pole', { at: [RAILX, 0, -RAILZ], height: 1.15 }]],
    ctx: { anchorX: ['ballL', 'ballR'], anchorAt: [0, 0] },
    poses: {
      start: Object.assign({}, BASE, { ankle: 15 }),
      // no toe joint in the rig: on the balls of the feet the ball rides 2.5 cm up so the rigid shoe tip stays out of the floor
      top: Object.assign({}, BASE, { ankle: -18, ground: [['ballR', 0.025]] }),
    },
    rest: 'start',
    rep: [
      { to: 'top', dur: 1.0, phase: 0 },
      { to: 'top', dur: 0.7, phase: 1 },
      { to: 'start', dur: 2.0, phase: 2 },
    ],
    setup: { tr: 'Ayaklar kalça genişliğinde, dizler ~40° bükülü, gövde hafif önde. Eller desteğe hafifçe dokunur.',
      en: 'Feet hip-width, knees bent ~40°, torso slightly forward. Hands rest lightly on the rail.',
      es: 'Pies al ancho de cadera, rodillas a ~40°, tronco un poco adelante. Manos apoyadas suavemente.' },
    phases: [
      { name: { tr: 'Yüksel', en: 'Rise', es: 'Sube' }, breath: 'out', line: ['heelR', 'ballR'],
        text: { tr: 'Diz açısını koruyarak topukları olabildiğince kaldır.', en: 'Keep the knee bend and lift the heels as high as you can.', es: 'Mantén la flexión y sube los talones al máximo.' } },
      { name: { tr: 'Tepede sık', en: 'Squeeze', es: 'Aprieta' }, breath: 'hold', arc: ['hipR', 'kneeR', 'ankleR'],
        text: { tr: 'Baldırı 1 sn sık. Dizler hâlâ bükülü.', en: 'Squeeze for 1 s. Knees still bent.', es: 'Aprieta 1 s. Rodillas aún flexionadas.' } },
      { name: { tr: 'Yavaşça in', en: 'Lower slowly', es: 'Baja despacio' }, breath: 'in',
        text: { tr: 'Topukları iki saniyede yere indir; dizler bükülü kalır.', en: 'Take two seconds to lower the heels; knees stay bent.', es: 'Baja los talones en dos segundos; rodillas flexionadas.' } },
    ],
    tempoText: { tr: '1 sn yüksel · 0,7 sn sık · 2 sn in', en: '1 s up · 0.7 s squeeze · 2 s down', es: '1 s arriba · 0,7 s aprieta · 2 s abajo' },
    mistakes: [
      { title: { tr: 'Kalkarken dizleri düzleştirmek', en: 'Straightening the knees', es: 'Estirar las rodillas al subir' },
        fix: { tr: 'Diz açısını koru', en: 'Hold the knee angle', es: 'Mantén el ángulo de rodilla' },
        fixText: { tr: 'Bükülü diz, işi soleus kasına verir', en: 'Bent knees keep the work in the soleus', es: 'La rodilla flexionada carga el sóleo' },
        at: 'top', pose: { knee: 8, hip: 18, trunk: 12, ankle: -30, neck: -6, ground: [['ballR', 0.035]], ik: H(1.17) }, line: ['hipR', 'kneeR', 'ankleR'], goodLine: ['hipR', 'kneeR', 'ankleR'], parts: ['thighR', 'shinR'] },
      { title: { tr: 'Desteğe yaslanmak', en: 'Leaning on the rail', es: 'Apoyarse en la barra' },
        fix: { tr: 'Eller sadece dokunur', en: 'Light touch only', es: 'Solo un toque ligero' },
        fixText: { tr: 'Ağırlık ayak uçlarında, gövde yerinde', en: 'Weight on the feet, torso stays put', es: 'Peso en los pies, tronco quieto' },
        at: 'top', pose: { trunk: 44, hip: 64, neck: -22, shrug: 0.03 }, marks: ['handR', 'shoulderR'], line: ['shoulderR', 'handR'], parts: ['upperR', 'foreR', 'chest'] },
    ],
    cues: [{ tr: 'Dizler bükülü kalsın', en: 'Keep the knees bent', es: 'Rodillas flexionadas' },
      { tr: 'Yükseğe çık', en: 'Rise high', es: 'Sube alto' },
      { tr: 'Yavaş in, sekme', en: 'Lower slowly, no bounce', es: 'Baja despacio, sin rebote' }],
  };
})();
