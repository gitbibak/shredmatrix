/* Pallof press. Standing side-on to a cable column on the character's LEFT (world -z). Hands held at the body with
 * holdL/holdR (thorax frame), so a trunk rotation mistake carries the handle with it. The cable station + two-hand handle is
 * a prop defined in this file (FB.PROPS._pallofCable): column + pulley at sternum height, cable from the pulley to the handle,
 * one short vertical grip in each fist joined by a crossbar (reads as a double-D handle). */
{
const { V } = FB;
const PUL = [0.2, 1.22, -1.0];
FB.PROPS._pallofCable = (sol) => {
  const hL = sol.J.handL, hR = sol.J.handR, mid = V.lerp(hL, hR, 0.5);
  sol.grip = { L: [0, 1, 0], R: [0, 1, 0] }; sol.gripKind = 'neutral';
  const top = (h) => V.add(h, [0, 0.055, 0]);
  const clip = V.add(mid, [0, 0.075, 0]);
  return [
    { t: 'box', c: [PUL[0], 1.15, PUL[2] - 0.12], s: [0.48, 2.3, 0.2], m: 'frameDark', round: 0.01 },
    { t: 'sph', c: PUL, r: 0.045, m: 'iron' },
    { t: 'tube', pts: [PUL, clip], r: 0.004, m: 'chrome' },
    { t: 'sph', c: clip, r: 0.016, m: 'iron' },
    { t: 'tube', pts: [top(hL), clip, top(hR)], r: 0.008, m: 'iron' },
    { t: 'cyl', a: V.add(hL, [0, -0.06, 0]), b: top(hL), r: 0.015, m: 'rubber' },
    { t: 'cyl', a: V.add(hR, [0, -0.06, 0]), b: top(hR), r: 0.015, m: 'rubber' },
  ];
};
const EP = [-0.2, -1, 0.35];
const LEGS = { trunk: 0, hip: 9, knee: 15, ankle: 0, abd: 3, hrot: 6, neck: 0, palm: 'in', elbowPole: EP };
const CHEST = Object.assign({}, LEGS, { holdL: [0.33, -0.01, 0.05], holdR: [0.33, -0.01, 0.05] });
const OUT = Object.assign({}, LEGS, { holdL: [0.57, 0.08, 0.05], holdR: [0.57, 0.08, 0.05] });

window.EXERCISE = {
  id: 'pallof_press',
  name: { tr: 'Pallof Press', en: 'Pallof Press', es: 'Press Pallof' },
  category: { tr: 'Karın · Core', en: 'Core', es: 'Core' },
  equipmentLabel: { tr: 'Kablo', en: 'Cable', es: 'Polea' },
  muscles: ['core', 'obliques', 'delts'],
  tempo: '1.5-2-1.5',
  view: { yaw: 0, pitch: 6 },
  alt: { yaw: 90, pitch: 6, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
    text: { tr: 'Kollar göğüsten düz bir çizgide öne', en: 'Arms press straight out from the chest', es: 'Brazos al frente en línea recta' } },
  setupView: { yaw: 30, pitch: 14 },
  setupMarks: [{ type: 'span', joints: ['ankleR', 'ankleL'], label: { tr: 'Kalça genişliği', en: 'Hip width', es: 'Ancho de cadera' } }],
  props: [['_pallofCable']],
  ctx: { anchorX: ['ankleL', 'ankleR'], plant: ['ankleL', 'ankleR'] },
  poses: { chest: CHEST, out: OUT },
  rest: 'chest',
  rep: [
    { to: 'out', dur: 1.5, phase: 0 },
    { to: 'out', dur: 1.2, phase: 1 },
    { to: 'chest', dur: 1.5, phase: 2 },
  ],
  setup: { tr: 'Kabloya yan dur, makara göğüs hizasında. Sapı iki elle göğüste tut, ayaklar kalça genişliğinde. Sonra yön değiştir.',
    en: 'Stand side-on to the cable, pulley at chest height. Hold the handle at the chest, feet hip-width. Then switch sides.',
    es: 'De lado a la polea, a la altura del pecho. Agarre en el pecho, pies al ancho de cadera. Luego cambia de lado.' },
  phases: [
    { name: { tr: 'İleri it', en: 'Press out', es: 'Empuja' }, breath: 'out',
      text: { tr: 'Kolları göğüsten düz öne uzat. Kablo seni çevirmeye çalışır, izin verme.', en: 'Press the arms straight out. The cable tries to turn you; don\'t let it.', es: 'Estira los brazos al frente. La polea intenta girarte: no lo permitas.' } },
    { name: { tr: 'Tut', en: 'Hold', es: 'Mantén' }, breath: 'hold', line: ['shoulderR', 'shoulderL'],
      text: { tr: 'Kollar düz, omuzlar ve kalça önde kare. 2 sn dönmeden kal.', en: 'Arms straight, shoulders and hips square. Resist for 2 s.', es: 'Brazos rectos, hombros y cadera de frente. Resiste 2 s.' } },
    { name: { tr: 'Göğse getir', en: 'Back to chest', es: 'Vuelve al pecho' }, breath: 'in',
      text: { tr: 'Sapı yavaşça göğse geri getir, gövde hep önde.', en: 'Bring the handle slowly back to the chest, torso still square.', es: 'Vuelve despacio al pecho, el torso sigue de frente.' } },
  ],
  tempoText: { tr: '1,5 sn it · 2 sn tut · 1,5 sn geri', en: '1.5 s out · 2 s hold · 1.5 s back', es: '1,5 s fuera · 2 s mantén · 1,5 s vuelve' },
  mistakes: [
    { title: { tr: 'Gövde kabloya dönüyor', en: 'Torso turns to the cable', es: 'El torso gira hacia la polea' },
      fix: { tr: 'Karnı sık, gerekirse hafiflet', en: 'Brace; go lighter if needed', es: 'Aprieta el abdomen; baja el peso' },
      fixText: { tr: 'Omuzlar ve kalça hep önde kare', en: 'Shoulders and hips stay square', es: 'Hombros y cadera siempre de frente' },
      at: 'out', pose: { twist: 26 }, line: ['shoulderR', 'shoulderL'], marks: ['shoulderR'], parts: ['chest', 'waist'] },
    { title: { tr: 'Kablodan uzağa yaslanmak', en: 'Leaning away', es: 'Inclinarse lejos de la polea' },
      fix: { tr: 'Dik dur', en: 'Stand tall', es: 'Mantente erguida' },
      fixText: { tr: 'Baş, gövde ve kalça tek dik çizgide', en: 'Head, torso and hips stacked vertically', es: 'Cabeza, torso y cadera en vertical' },
      at: 'out', pose: { side: 17 }, line: ['pelvis', 'neck'], marks: ['neck'], parts: ['waist', 'chest'] },
  ],
  cues: [{ tr: 'Omuz ve kalça kare', en: 'Shoulders and hips square', es: 'Hombros y cadera de frente' },
    { tr: 'Düz çizgide ileri it', en: 'Press straight out', es: 'Empuja en línea recta' },
    { tr: 'Dik dur, kaburgalar aşağıda', en: 'Stand tall, ribs down', es: 'Erguida, costillas abajo' }],
};
}
