/* Machine leg extension. legExtension prop (seat + backrest reclined 10 deg, roller in front of the ankles on a lever
 * from the knee axis). Pelvis on the seat (single ground contact), pelvis anchored, trunk reclined 10 deg against the pad,
 * hands grip the side handles (fixed world targets beside the seat). Only the knees move. */
(function () {
  const SEAT = 0.5;
  const HANDS = { handL: { at: [-0.04, SEAT - 0.05, -0.29] }, handR: { at: [-0.04, SEAT - 0.05, 0.29] } };
  const BASE = { trunk: -10, hip: 80, abd: 2, flat: false, neck: 8, ground: [['pelvis', SEAT]], ik: HANDS, elbowPole: [-0.6, -0.4, 1], curl: 1 };
  window.EXERCISE = {
    id: 'leg_extension',
    name: { tr: 'Leg Extension', en: 'Leg Extension', es: 'Extensión de piernas' },
    category: { tr: 'Bacak · Ön bacak', en: 'Legs · Quads', es: 'Piernas · Cuádriceps' },
    equipmentLabel: { tr: 'Leg extension makinesi', en: 'Leg extension machine', es: 'Máquina de extensión' },
    muscles: ['quads'],
    tempo: '1.5-1-2.5',
    view: { yaw: 90, pitch: 6 },
    alt: { yaw: 22, pitch: 10, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
      text: { tr: 'Dizler kalça genişliğinde, düz yukarı', en: 'Knees hip-width, straight up', es: 'Rodillas al ancho de cadera, rectas' } },
    setupView: { yaw: 40, pitch: 14 },
    contacts: ['pelvis', 'kneeR', 'ankleR'],
    props: [['legExtension', { at: [-0.04, 0, 0], seatH: SEAT }]],
    ctx: { anchorX: ['pelvis'], anchorAt: [0, 0] },
    poses: {
      start: Object.assign({}, BASE, { knee: 90, ankle: 0 }),
      top: Object.assign({}, BASE, { knee: 6, ankle: 0 }),
    },
    rest: 'start',
    rep: [
      { to: 'top', dur: 1.5, phase: 0 },
      { to: 'top', dur: 1.0, phase: 1 },
      { to: 'start', dur: 2.5, phase: 2 },
    ],
    setup: { tr: 'Diz eklemi makinenin dönme noktasıyla aynı hizada. Sırt pedde, silindir ayak bileğinin hemen üstünde.',
      en: 'Line the knee up with the machine pivot. Back on the pad, roller just above the ankles.',
      es: 'Rodilla alineada con el eje de la máquina. Espalda en el respaldo, rodillo sobre los tobillos.' },
    phases: [
      { name: { tr: 'Uzat', en: 'Extend', es: 'Extiende' }, breath: 'out',
        text: { tr: 'Dizleri neredeyse düz olana kadar aç. Sırt pedde kalır.', en: 'Straighten the knees almost fully. Back stays on the pad.', es: 'Extiende casi del todo las rodillas. La espalda sigue apoyada.' } },
      { name: { tr: 'Sık', en: 'Squeeze', es: 'Aprieta' }, breath: 'hold', line: ['hipR', 'kneeR', 'ankleR'],
        text: { tr: 'Ön bacağı 1 sn sık. Dizi sertçe kilitleme.', en: 'Squeeze the quads for 1 s. Don\'t snap into lockout.', es: 'Aprieta el cuádriceps 1 s. Sin bloquear de golpe.' } },
      { name: { tr: 'Yavaşça indir', en: 'Lower slowly', es: 'Baja despacio' }, breath: 'in', arc: ['hipR', 'kneeR', 'ankleR'],
        text: { tr: '2-3 sn\'de 90°\'ye in, ağırlık yığını çarpmasın.', en: 'Take 2-3 s back to 90°; don\'t let the stack drop.', es: 'Baja a 90° en 2-3 s; que el peso no caiga.' } },
    ],
    tempoText: { tr: '1,5 sn uzat · 1 sn sık · 2,5 sn indir', en: '1.5 s up · 1 s squeeze · 2.5 s down', es: '1,5 s arriba · 1 s aprieta · 2,5 s abajo' },
    mistakes: [
      { title: { tr: 'Kalça kalkıyor, gövde savruluyor', en: 'Hips lift, torso swings', es: 'La cadera sube, el tronco se balancea' },
        fix: { tr: 'Kalça koltukta, kollar tutamakta', en: 'Hips down, hold the handles', es: 'Cadera en el asiento, agarra las asas' },
        fixText: { tr: 'Ağırlığı azalt; sadece dizler çalışır', en: 'Lower the load; only the knees move', es: 'Menos peso; solo se mueven las rodillas' },
        at: 'top', pose: { trunk: -28, hip: 70, ground: [['pelvis', SEAT + 0.06]], knee: 14 }, marks: ['pelvis'], line: ['pelvis', 'neck'], parts: ['pelvis', 'waist'] },
      { title: { tr: 'Dizi sertçe kilitlemek', en: 'Snapping into lockout', es: 'Bloquear la rodilla de golpe' },
        fix: { tr: '~5° önce dur', en: 'Stop ~5° short', es: 'Para ~5° antes' },
        fixText: { tr: 'Gerilim kasta kalır, eklemde değil', en: 'Tension stays in the muscle, not the joint', es: 'La tensión queda en el músculo, no en la articulación' },
        at: 'top', pose: { knee: 0, ankle: -12 }, marks: ['kneeR'], parts: ['thighR', 'shinR'] },
    ],
    cues: [{ tr: 'Yavaş ve kontrollü', en: 'Slow and controlled', es: 'Lento y controlado' },
      { tr: 'Tepede ön bacağı sık', en: 'Squeeze the quads at the top', es: 'Aprieta el cuádriceps arriba' },
      { tr: 'Sırt pedde', en: 'Back on the pad', es: 'Espalda en el respaldo' }],
  };
})();
