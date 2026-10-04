/* Resistance band pull-apart. Standing, FK arms at shoulder height (sh 90) open from shoulder width (shAbd 4) to a T (shAbd 90).
 * The band is a prop defined in this file (FB.PROPS._bandApart): a tube from hand to hand that wraps across the front of the
 * chest once the hands pass behind the chest line (band touches the chest at the end). Overhand grip = free hands with
 * palm 'down' and curled fingers (bend [0,-1,0] keeps the soft elbow stable through sh 90). */
{
const { V, M } = FB;
FB.PROPS._bandApart = (sol) => {
  const T = sol.F.thorax, c = sol.J.chest, hL = sol.J.handL, hR = sol.J.handR;
  const loc = (p) => [V.dot(V.sub(p, c), T[0]), V.dot(V.sub(p, c), T[1]), V.dot(V.sub(p, c), T[2])];
  const a = loc(hL), b = loc(hR), FX = 0.15, pts = [hL];
  if (Math.min(a[0], b[0]) < FX) {
    const y = (a[1] + b[1]) / 2 - 0.02, w = 0.11;
    pts.push(V.add(c, M.apply(T, [FX, y, -w])), V.add(c, M.apply(T, [FX + 0.005, y, 0])), V.add(c, M.apply(T, [FX, y, w])));
  }
  pts.push(hR);
  return [{ t: 'tube', pts, r: 0.009, m: 'band' }];
};
const ST = { abd: 5, hrot: 6, knee: 5, hip: 2, neck: 0, sh: 90, el: 5, bend: [0, -1, 0], palm: 'down', curl: 0.85 };

window.EXERCISE = {
  id: 'band_pull_apart',
  name: { tr: 'Direnç Bandı Pull-Apart', en: 'Resistance Band Pull-Apart', es: 'Apertura con banda de resistencia' },
  category: { tr: 'Omuz · Sırt', en: 'Shoulders · Back', es: 'Hombros · Espalda' },
  equipmentLabel: { tr: 'Direnç bandı', en: 'Resistance band', es: 'Banda elástica' },
  muscles: ['delts', 'upperback'],
  tempo: '1-0.5-2',
  view: { yaw: 14, pitch: 6 },
  alt: { yaw: 80, pitch: 6, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
    text: { tr: 'Kollar omuz hizasında, kaburgalar aşağıda', en: 'Arms at shoulder height, ribs down', es: 'Brazos a la altura del hombro, costillas abajo' } },
  setupView: { yaw: 40, pitch: 10 },
  setupMarks: [{ type: 'aline', joints: ['handL', 'handR'] }],
  props: [['_bandApart']],
  ctx: { anchorX: ['ankleL', 'ankleR'], plant: ['ankleL', 'ankleR'] },
  poses: {
    // tall, arms straight in front at shoulder height, band taut at shoulder width, palms down
    front: { ...ST, shAbd: 4, protract: 0.015 },
    // arms opened into a T, band across the chest, blades squeezed, shoulders down
    open: { ...ST, shAbd: 90, protract: -0.03 },
  },
  rest: 'front',
  rep: [
    { to: 'open', dur: 1.2, phase: 0 },
    { to: 'open', dur: 0.5, phase: 1 },
    { to: 'front', dur: 2.0, phase: 2 },
  ],
  setup: { tr: 'Dik dur, kaburgalar aşağıda. Bandı omuz genişliğinde, avuçlar aşağı bakacak tut; kollar omuz hizasında.',
    en: 'Stand tall, ribs down. Hold the band shoulder-width, palms down, arms at shoulder height.',
    es: 'De pie, costillas abajo. Banda al ancho de hombros, palmas abajo, brazos a la altura del hombro.' },
  phases: [
    { name: { tr: 'Aç', en: 'Pull apart', es: 'Abre' }, breath: 'out',
      text: { tr: 'Kollar düz, bandı yanlara açarak göğsüne getir.', en: 'Arms straight, pull the band apart until it reaches your chest.', es: 'Brazos rectos, abre la banda hasta que toque el pecho.' } },
    { name: { tr: 'Tut', en: 'Hold', es: 'Mantén' }, breath: 'hold', line: ['handL', 'shoulderL', 'shoulderR', 'handR'],
      text: { tr: 'Kollar T şeklinde. Kürekleri sık, omuzlar aşağıda.', en: 'Arms in a T. Squeeze the blades, shoulders down.', es: 'Brazos en T. Junta las escápulas, hombros abajo.' } },
    { name: { tr: 'Yavaş dön', en: 'Return slowly', es: 'Vuelve despacio' }, breath: 'in',
      text: { tr: 'İki saniyede öne dön. Bant birden kapanmasın.', en: 'Two seconds back to the front. Don’t let the band snap.', es: 'Dos segundos al frente. Que la banda no se cierre de golpe.' } },
  ],
  tempoText: { tr: '1 sn aç · 0,5 sn tut · 2 sn dön', en: '1 s open · 0.5 s hold · 2 s return', es: '1 s abre · 0,5 s mantén · 2 s vuelve' },
  mistakes: [
    { title: { tr: 'Bel çukurlaşıyor', en: 'Arching the lower back', es: 'Arquear la zona lumbar' },
      fix: { tr: 'Kaburgalar kalçanın üstünde', en: 'Ribs over the hips', es: 'Costillas sobre la cadera' },
      fixText: { tr: 'Karnı sık; hareket sadece kollarda', en: 'Brace the core; only the arms move', es: 'Abdomen firme; solo se mueven los brazos' },
      at: 'open', pose: { lumbar: -13, thoracic: -5, trunk: 3, hip: -3, neck: -6 }, view: { yaw: 80, pitch: 6 },
      line: ['pelvis', 'waist', 'neck'], goodLine: ['pelvis', 'neck'], parts: ['waist', 'chest'] },
    { title: { tr: 'Omuzlar kulağa kalkıyor', en: 'Shrugging', es: 'Encoger los hombros' },
      fix: { tr: 'Omuzları aşağı indir', en: 'Shoulders down', es: 'Hombros abajo' },
      fixText: { tr: 'Boyun uzun, kürekler aşağı ve geriye', en: 'Long neck; blades down and back', es: 'Cuello largo; escápulas abajo y atrás' },
      at: 'open', pose: { shrug: 0.06, neck: -4, sh: 100 }, marks: ['shoulderL', 'shoulderR'], parts: ['upper', 'neck'] },
  ],
  cues: [{ tr: 'Kollar düz, bandı aç', en: 'Straight arms, pull apart', es: 'Brazos rectos, abre' },
    { tr: 'Kürekleri sık', en: 'Squeeze the blades', es: 'Junta las escápulas' },
    { tr: 'Kaburgalar aşağı', en: 'Ribs down', es: 'Costillas abajo' }],
};
}
