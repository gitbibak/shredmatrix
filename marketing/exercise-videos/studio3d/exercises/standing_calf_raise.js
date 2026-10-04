/* Standing calf raise on a step edge with a dumbbell in each hand. Balls of the feet rest on the step (ground contact
 * ballR at the step top, balls anchored), heels hang off (`flat: false`), so the ankle angle alone lowers/raises the body
 * about the balls of the feet. Knees stay straight.
 * Spec ankle values are foot-vs-shin (0 = foot square to the shin): stretch +15 (heel ~4 cm below the step),
 * top -50 (heel ~13 cm above the step). */
(function () {
  const STEP = 0.2;
  const BASE = { trunk: 0, hip: 0, knee: 0, abd: 3, flat: false, neck: 0, sh: -3, shAbd: 9, el: 2, palm: 'in', ground: [['ballR', STEP]] };
  window.EXERCISE = {
    id: 'standing_calf_raise',
    name: { tr: 'Ayakta Calf Raise', en: 'Standing Calf Raise', es: 'Elevación de talones de pie' },
    category: { tr: 'Bacak · Baldır', en: 'Legs · Calves', es: 'Piernas · Gemelos' },
    equipmentLabel: { tr: 'Step · Dambıl', en: 'Step · Dumbbells', es: 'Step · Mancuernas' },
    muscles: ['calves'],
    tempo: '1.5-1-1',
    view: { yaw: 90, pitch: 4, zoom: 1.0 },
    alt: { yaw: 150, pitch: 10, title: { tr: 'Arkadan çapraz', en: 'Rear angle', es: 'Vista trasera' },
      text: { tr: 'Topuklar düz yukarı, bilek dışa kaçmaz', en: 'Heels rise straight, ankles don\'t roll out', es: 'Talones rectos, sin rodar el tobillo' } },
    setupView: { yaw: 140, pitch: 14 },
    contacts: ['ballR', 'ballL'],
    props: [['step', { at: [0.17, 0, 0], size: [0.4, STEP, 0.7] }], ['dumbbell', { grip: 'neutral' }]],
    ctx: { anchorX: ['ballL', 'ballR'], anchorAt: [0, 0] },
    poses: {
      start: Object.assign({}, BASE, { ankle: 0 }),
      bottom: Object.assign({}, BASE, { ankle: 15 }),
      // the rig has no toe joint: on tiptoe the rigid shoe tip would dip into the step, so the ball rides 1.8 cm higher at the top
      top: Object.assign({}, BASE, { ankle: -50, ground: [['ballR', STEP + 0.018]] }),
    },
    rest: 'start',
    rep: [
      { to: 'bottom', dur: 1.5, phase: 0 },
      { to: 'top', dur: 1.0, phase: 1 },
      { to: 'top', dur: 1.0, phase: 2 },
    ],
    setup: { tr: 'Ayak tabanının ön kısmı step kenarında, topuklar boşta. Ayaklar kalça genişliğinde, dizler düz.',
      en: 'Balls of the feet on the step edge, heels hanging off. Feet hip-width, knees straight.',
      es: 'Metatarsos en el borde del step, talones en el aire. Pies al ancho de cadera, rodillas rectas.' },
    phases: [
      { name: { tr: 'Esnet', en: 'Stretch', es: 'Estira' }, breath: 'in', line: ['heelR', 'ballR'],
        text: { tr: 'Topukları stepin altına yavaşça indir. Dizler düz.', en: 'Slowly lower the heels below the step. Knees straight.', es: 'Baja los talones bajo el step despacio. Rodillas rectas.' } },
      { name: { tr: 'Yüksel', en: 'Rise', es: 'Sube' }, breath: 'out', line: ['heelR', 'ballR'],
        text: { tr: 'Parmak uçlarına olabildiğince yüksel, ağırlık başparmak tarafında.', en: 'Rise as high as you can, weight on the big-toe side.', es: 'Sube lo más alto posible, peso en el lado del dedo gordo.' } },
      { name: { tr: 'Tepede tut', en: 'Hold the top', es: 'Mantén arriba' }, breath: 'hold', line: ['kneeR', 'ankleR', 'ballR'],
        text: { tr: 'Baldırı 1 sn sık, sonra kontrollü in.', en: 'Squeeze the calves for 1 s, then lower with control.', es: 'Aprieta 1 s y baja con control.' } },
    ],
    tempoText: { tr: '1,5 sn in · 1 sn yüksel · 1 sn tut', en: '1.5 s down · 1 s up · 1 s hold', es: '1,5 s abajo · 1 s arriba · 1 s mantén' },
    mistakes: [
      { title: { tr: 'Yarım hareket, sekme', en: 'Bouncing, partial range', es: 'Rebotes, recorrido corto' },
        fix: { tr: 'Tam esnet, tam yüksel', en: 'Full stretch, full rise', es: 'Estira y sube del todo' },
        fixText: { tr: 'Altta ve üstte bir an dur', en: 'Pause at the bottom and the top', es: 'Pausa abajo y arriba' },
        at: 'top', pose: { ankle: -12, ground: [['ballR', STEP + 0.005]] }, marks: ['heelR'], line: ['heelR', 'ballR'], parts: ['shinR'] },
      { title: { tr: 'Dizleri bükerek hile', en: 'Bending the knees to cheat', es: 'Doblar las rodillas para ayudarte' },
        fix: { tr: 'Dizler düz', en: 'Keep the legs straight', es: 'Piernas rectas' },
        fixText: { tr: 'Hareket sadece ayak bileğinden', en: 'Move only at the ankles', es: 'Solo se mueve el tobillo' },
        at: 'top', pose: { knee: 26, hip: 14, trunk: 6, ankle: -32 }, line: ['hipR', 'kneeR', 'ankleR'], goodLine: ['hipR', 'kneeR', 'ankleR'], parts: ['thighR', 'shinR'] },
    ],
    cues: [{ tr: 'Altta tam esnet', en: 'Full stretch at the bottom', es: 'Estira del todo abajo' },
      { tr: 'Başparmak tarafından yüksel', en: 'Rise onto the big-toe side', es: 'Sube sobre el dedo gordo' },
      { tr: 'Tepede bir an tut', en: 'Hold the top for a beat', es: 'Mantén arriba un instante' }],
  };
})();
