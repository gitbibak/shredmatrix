/* Prone resistance-band hamstring curl on a mat. Contacts: chest + knee on the mat (two-contact ground), pelvis anchored,
 * forehead resting on the hands (hand IK targets on the mat). The band is drawn with the `strap` prop as a loop from a low anchor
 * post behind the feet around both ankles (the `band` prop only runs to the hands). */
(function () {
  const MAT = 0.012;
  const POST = [-1.25, 0, 0];
  // hands flat on the mat under the forehead (palms down, fingers forward), elbows wide on the mat
  const HANDS = { handL: { at: [0.8, 0.012, -0.05] }, handR: { at: [0.8, 0.012, 0.05] } };
  const BASE = { trunk: 90, hip: 0, flat: false, abd: 3, neck: -14, sh: 150, shAbd: 60, el: 120, ik: HANDS, elbowPole: [-0.15, -0.2, 1], handSurface: 0.012,
    ground: [['chest', MAT], ['kneeR', MAT]] };
  window.EXERCISE = {
    id: 'band_hamstring_curl',
    name: { tr: 'Bantla Hamstring Curl', en: 'Band Hamstring Curl', es: 'Curl femoral con banda' },
    category: { tr: 'Bacak · Arka bacak', en: 'Legs · Hamstrings', es: 'Piernas · Isquios' },
    equipmentLabel: { tr: 'Direnç bandı · Mat', en: 'Resistance band · Mat', es: 'Banda elástica · Esterilla' },
    muscles: ['hamstrings', 'calves'],
    tempo: '1.5-0.5-2',
    view: { yaw: 90, pitch: 8, zoom: 1.05 },
    alt: { yaw: 140, pitch: 24, title: { tr: 'Arkadan çapraz', en: 'Rear angle', es: 'Vista trasera' },
      text: { tr: 'Kalça yerde, bant gergin', en: 'Hips down, band under tension', es: 'Cadera abajo, banda en tensión' } },
    setupView: { yaw: 130, pitch: 20 },
    contacts: ['chest', 'kneeR', 'pelvis'],
    props: [['mat', { at: [-0.12, 0.006, 0], length: 1.95 }], ['pole', { at: POST, height: 0.45 }],
      ['strap', { through: [[POST[0], 0.08, 0.015], 'ankleL', 'ankleR', [POST[0], 0.08, -0.015]] }]],
    ctx: { anchorX: ['pelvis'], anchorAt: [0, 0] },
    poses: {
      start: Object.assign({}, BASE, { knee: 6, ankle: -48 }),   // toes resting on the mat
      top: Object.assign({}, BASE, { knee: 110, ankle: 5 }),
    },
    rest: 'start',
    rep: [
      { to: 'top', dur: 1.5, phase: 0 },
      { to: 'top', dur: 0.5, phase: 1 },
      { to: 'start', dur: 2.0, phase: 2 },
    ],
    setup: { tr: 'Bandı ayakların arkasında alçak bir noktaya bağla, ayak bileklerine geçir. Yüzüstü yat, alnın ellerinde.',
      en: 'Anchor the band low behind your feet and loop it around both ankles. Lie face down, forehead on your hands.',
      es: 'Ata la banda baja detrás de los pies y pásala por los tobillos. Boca abajo, frente sobre las manos.' },
    phases: [
      { name: { tr: 'Bük', en: 'Curl', es: 'Flexiona' }, breath: 'out',
        text: { tr: 'Bandın direncine karşı topukları kalçana çek. Kalça yerde kalır.', en: 'Pull the heels toward your glutes against the band. Hips stay down.', es: 'Lleva los talones a los glúteos contra la banda. Cadera abajo.' } },
      { name: { tr: 'Sık', en: 'Squeeze', es: 'Aprieta' }, breath: 'hold', line: ['chest', 'pelvis', 'kneeR'],
        text: { tr: 'Arka bacağı 1 sn sık. Bel çukurlaşmaz.', en: 'Squeeze the hamstrings for 1 s. No lower-back arch.', es: 'Aprieta los isquios 1 s. Sin arquear la lumbar.' } },
      { name: { tr: 'Yavaşça aç', en: 'Lower slowly', es: 'Baja despacio' }, breath: 'in',
        text: { tr: 'Bacakları iki saniyede uzat; bant seni çekmesin.', en: 'Straighten over two seconds; don\'t let the band snap back.', es: 'Estira en dos segundos; que la banda no tire de golpe.' } },
    ],
    tempoText: { tr: '1,5 sn bük · 0,5 sn sık · 2 sn aç', en: '1.5 s curl · 0.5 s squeeze · 2 s lower', es: '1,5 s sube · 0,5 s aprieta · 2 s baja' },
    mistakes: [
      { title: { tr: 'Kalça kalkıyor, bel çukurlaşıyor', en: 'Hips lift, back arches', es: 'La cadera sube, la lumbar se arquea' },
        fix: { tr: 'Kalçayı yere bastır', en: 'Press the hips down', es: 'Cadera contra el suelo' },
        fixText: { tr: 'Karnı sık; gerekirse daha hafif bant', en: 'Brace; use a lighter band if needed', es: 'Abdomen firme; banda más suave si hace falta' },
        at: 'top', pose: { hip: 24, lumbar: -14, knee: 98 }, marks: ['pelvis'], line: ['chest', 'pelvis', 'kneeR'], parts: ['pelvis', 'waist'] },
      { title: { tr: 'Yarım hareket', en: 'Bending only part-way', es: 'Recorrido parcial' },
        fix: { tr: 'Tam aralıkta çalış', en: 'Use the full range', es: 'Recorrido completo' },
        fixText: { tr: 'Topukları kalçaya kadar getir', en: 'Bring the heels all the way up', es: 'Lleva los talones hasta arriba' },
        at: 'top', pose: { knee: 34, ankle: -12 }, marks: ['ankleR'], parts: ['thighR', 'shinR'] },
    ],
    cues: [{ tr: 'Topuklar kalçaya', en: 'Heels to glutes', es: 'Talones a los glúteos' },
      { tr: 'Kalça yerde', en: 'Hips stay flat', es: 'Cadera abajo' },
      { tr: 'Yavaş aç', en: 'Slow lowering', es: 'Baja despacio' }],
  };
})();
