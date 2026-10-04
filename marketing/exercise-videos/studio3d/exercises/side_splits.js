/* Reformer Side Splits (standing). Standing sideways across the reformer: RIGHT foot on the standing platform at the foot
 * end (fixed), LEFT foot on the carriage with the outer edge against the shoulder block. Body yaw 90 = she faces -z, her
 * right side toward the foot end (+x). Footbar removed (it would cross the standing leg).
 * - Right ankle anchored on the platform (anchorX ankleR) + flat heel on the platform top (0.38 = carriage top), so the
 *   platform foot never moves; symmetric abduction keeps both feet at the same height.
 * - Carriage centre = left ankle x + 0.245 (shoulder block face beside the left foot) in EVERY frame, so the carriage moves
 *   exactly with the foot that stands on it (nothing slides).
 * - Start abduction ~22° each (carriage closed against the platform), out ~37° each = carriage ~39 cm open (spec 20 -> 35°,
 *   40 cm). Arms long to the sides for balance.
 * - Front view (spec). The pelvic tuck mistake is shown from the side. */
{
const TOP = 0.38;
const CTX = { anchorX: ['ankleR'], anchorAt: [0.95, 0.05] };
const BASE = { yaw: 90, trunk: 0, hip: 0, knee: 2, abd: 22, ground: [['heelR', TOP]], flat: true, lumbar: 0, thoracic: 0, neck: 0,
  sh: 4, shAbd: 84, el: 6, palm: 'down', curl: 0.1 };
const P = (o) => Object.assign({}, BASE, o);

window.EXERCISE = {
  id: 'side_splits',
  name: { tr: 'Side Splits (Ayakta Yana Açılma)', en: 'Side Splits (Standing)', es: 'Aperturas laterales (Side Splits)' },
  category: { tr: 'Reformer · İç ve dış bacak', en: 'Reformer · Inner & outer thighs', es: 'Reformer · Aductores y abductores' },
  equipmentLabel: { tr: 'Reformer · 1 mavi + 1 kırmızı yay · platform', en: 'Reformer · 1 blue + 1 red spring · platform', es: 'Reformer · 1 muelle azul + 1 rojo · plataforma' },
  muscles: ['adductors', 'glutes', 'core'],
  tempo: '2-0.5-2',
  view: { yaw: -90, pitch: 6, zoom: 1.05 },
  alt: { yaw: -150, pitch: 10, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Pelvis nötr, omurga uzun ve dik', en: 'Pelvis neutral, spine long and tall', es: 'Pelvis neutra, columna larga' } },
  setupView: { yaw: -125, pitch: 20 },
  setupMarks: [{ type: 'span', joints: ['ankleR', 'ankleL'], label: { tr: 'platform · kızak', en: 'platform · carriage', es: 'plataforma · carro' } }],
  props: [['reformer', { springs: 2, footbar: false, platform: true, carriage: (sol) => sol.J.ankleL[0] + 0.245 }]],
  ctx: CTX,
  contacts: ['heelR', 'ballR', 'heelL', 'ballL'],
  poses: {
    stand: P({}),
    out: P({ abd: 37, knee: 3 }),
  },
  rest: 'stand',
  rep: [
    { to: 'out', dur: 2.0, phase: 0 },
    { to: 'out', dur: 0.5, phase: 1 },
    { to: 'stand', dur: 2.0, phase: 2 },
  ],
  setup: { tr: 'Yan dön: sağ ayak platformda, sol ayak kızakta bloğa yaslı. Dik dur, kollar yanlarda. Sonra taraf değiştir.',
    en: 'Stand sideways: right foot on the platform, left foot on the carriage by the block. Stand tall, arms out. Then switch.',
    es: 'De lado: pie derecho en la plataforma, izquierdo en el carro junto al tope. Erguida, brazos abiertos. Luego cambia.' },
  phases: [
    { name: { tr: 'Kızağı dışarı it', en: 'Push out', es: 'Empuja hacia fuera' }, breath: 'out',
      text: { tr: 'Sol bacakla kızağı dışarı it, iki bacak eşit açılır. Gövde ortada ve dik.', en: 'Press the carriage out with the left leg; both legs open evenly. Torso centred and tall.', es: 'Empuja el carro con la pierna izquierda; ambas se abren igual. Torso centrado.' } },
    { name: { tr: 'Genişte dur', en: 'Pause wide', es: 'Pausa abierta' }, breath: 'hold', arc: ['ankleR', 'pelvis', 'ankleL'],
      text: { tr: 'Pelvis nötr kalabildiği kadar aç; dizler uzun ama kilitli değil.', en: 'Open only as far as the pelvis stays neutral; knees long, not locked.', es: 'Abre solo hasta donde la pelvis siga neutra; rodillas sin bloquear.' } },
    { name: { tr: 'İç bacakla çek', en: 'Pull in', es: 'Cierra con los aductores' }, breath: 'in',
      text: { tr: 'İç bacakları sıkarak kızağı yavaşça geri çek, çarpmadan kapat.', en: 'Squeeze the inner thighs to draw the carriage back slowly, no banging.', es: 'Aprieta los aductores y cierra el carro despacio, sin golpe.' } },
  ],
  tempoText: { tr: '2 sn aç · 0,5 sn dur · 2 sn kapat', en: '2 s open · 0.5 s pause · 2 s close', es: '2 s abre · 0,5 s pausa · 2 s cierra' },
  mistakes: [
    { title: { tr: 'Pelvis içe kıvrılıyor', en: 'Pelvis tucks', es: 'La pelvis se mete' },
      fix: { tr: 'Açıklığı sınırla', en: 'Limit the range', es: 'Limita el rango' },
      fixText: { tr: 'Pelvis nötr kalabildiği kadar aç', en: 'Open only as far as the pelvis stays neutral', es: 'Abre solo mientras la pelvis siga neutra' },
      at: 'out', pose: { trunk: -9, hip: -9, lumbar: 16, thoracic: 6, neck: 6, knee: 10 }, view: { yaw: 180, pitch: 8 },
      line: ['pelvis', 'waist', 'neck'], parts: ['pelvis', 'waist'] },
    { title: { tr: 'Gövde yana kayıyor', en: 'Torso leans sideways', es: 'El torso se inclina' },
      fix: { tr: 'Gövde iki ayağın ortasında', en: 'Torso centred between the feet', es: 'Torso centrado entre los pies' },
      fixText: { tr: 'Başın tepesi tavana uzar, omuzlar düz', en: 'Crown reaches up, shoulders level', es: 'Coronilla arriba, hombros nivelados' },
      at: 'out', pose: { side: -16, neck: 0 }, line: ['shoulderL', 'shoulderR'], marks: ['shoulderR'], parts: ['waist', 'chest'] },
  ],
  cues: [{ tr: 'Omurga uzun ve dik', en: 'Tall spine', es: 'Columna larga' },
    { tr: 'Pelvis nötr', en: 'Pelvis neutral', es: 'Pelvis neutra' },
    { tr: 'İki bacak eşit açılır', en: 'Both legs open evenly', es: 'Ambas piernas abren igual' }],
};
}
