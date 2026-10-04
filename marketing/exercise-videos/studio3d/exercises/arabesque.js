/* Reformer Arabesque (one-leg Elephant). Facing the footbar (+x), hands flat on the footbar, LEFT foot flat on the carriage
 * with the heel against the shoulder block, RIGHT leg lifted long behind (near the camera in the side view).
 * - Two ground contacts (left heel on the pad, right hand on top of the bar): the body rotates rigidly so both rest on their
 *   surfaces; anchorX on the hands pins them over the bar; both hands also get world IK targets on the bar top.
 * - Carriage centre = left heel x + 0.29 (shoulder block face) in EVERY frame: the carriage moves with the standing foot.
 * - Spec trunk "60 from vertical" is the angle from vertical-DOWN for this inverted pike: measured trunk_from_vertical is
 *   ~117-122 (= 58-63° from vertical-down). Hip flexion 90 -> ~100 while the carriage rolls ~15 cm further out: the shoulders
 *   travel forward over the hands (shoulder angle closes), as in Elephant with the hips staying high.
 * - Lifted leg: in line with the spine or slightly higher (hip ~ -8 to -12 relative to the trunk line, i.e. the thigh
 *   ~35-40° above horizontal); spec "hip extension 40" read as the leg lifted 40° above the floor line. */
{
const TOP = 0.38, BARY = TOP + 0.36 + 0.022, BX = 1.0;
const HANDS = { handL: { at: [BX - 0.005, BARY + 0.03, -0.12] }, handR: { at: [BX - 0.005, BARY + 0.03, 0.12] } };
const CTX = { anchorX: ['handL', 'handR'], anchorAt: [BX - 0.02, 0] };
const BASE = { trunk: 115, hipL: 90, kneeL: 0, hipR: -10, kneeR: 2, ankleR: -30, flatL: true, flatR: false, abd: 3, lumbar: 0, thoracic: 0,
  neck: -8, sh: 178, shAbd: 8, el: 3, handFlat: true, handSurface: BARY, ground: [['heelL', TOP], ['handR', BARY]], ik: HANDS };
const P = (o) => Object.assign({}, BASE, o);

window.EXERCISE = {
  id: 'arabesque',
  name: { tr: 'Arabesque (Tek Bacak Elephant)', en: 'Arabesque (one-leg Elephant)', es: 'Arabesque (Elephant a una pierna)' },
  category: { tr: 'Reformer · Kalça ve arka bacak', en: 'Reformer · Glutes & hamstrings', es: 'Reformer · Glúteos e isquios' },
  equipmentLabel: { tr: 'Reformer · 1 kırmızı + 1 mavi yay', en: 'Reformer · 1 red + 1 blue spring', es: 'Reformer · 1 muelle rojo + 1 azul' },
  muscles: ['glutes', 'hamstrings', 'delts', 'core'],
  side: 'R',
  tempo: '2-0.5-2',
  view: { yaw: 90, pitch: 6, zoom: 1.08 },
  alt: { yaw: 150, pitch: 12, title: { tr: 'Arkadan çapraz', en: 'Rear angle', es: 'Vista trasera' },
    text: { tr: 'Kalçalar düz, kaldırılan bacak uzun', en: 'Hips square, the lifted leg long', es: 'Caderas niveladas, pierna larga' } },
  setupView: { yaw: 40, pitch: 18 },
  props: [['reformer', { springs: 2, carriage: (sol) => sol.J.heelL[0] + 0.29 }]],
  ctx: CTX,
  contacts: ['heelL', 'ballL', 'handL', 'handR'],
  poses: {
    start: P({}),
    out: P({ trunk: 124, hipL: 95, hipR: -14, sh: 212 }),
  },
  rest: 'start',
  rep: [
    { to: 'out', dur: 2.0, phase: 0 },
    { to: 'out', dur: 0.5, phase: 1 },
    { to: 'start', dur: 2.0, phase: 2 },
  ],
  setup: { tr: 'Eller footbar\'da, sol ayak kızakta topuk bloğa yaslı. Sağ bacak arkada uzun. Sonra taraf değiştir.',
    en: 'Hands on the footbar, left foot on the carriage, heel against the block. Right leg long behind. Then switch sides.',
    es: 'Manos en la barra, pie izquierdo en el carro con el talón en el tope. Pierna derecha larga atrás. Luego cambia.' },
  phases: [
    { name: { tr: 'Kızağı dışarı it', en: 'Roll out', es: 'Desliza hacia fuera' }, breath: 'out',
      text: { tr: 'Destek bacağı kızağı geri iter, kalçalar yukarıda. Arka bacak uzun kalır.', en: 'The standing leg pushes the carriage back, hips stay high. The back leg stays long.', es: 'La pierna de apoyo empuja el carro, cadera alta. La pierna de atrás sigue larga.' } },
    { name: { tr: 'Uzun çizgide dur', en: 'Hold the line', es: 'Mantén la línea' }, breath: 'hold', line: ['handR', 'shoulderR', 'hipR', 'ankleR'],
      text: { tr: 'Ellerden kaldırılan topuğa uzun bir çizgi. Kalçalar yere paralel.', en: 'One long line from the hands to the lifted heel. Hips level.', es: 'Una línea larga de las manos al talón elevado. Caderas niveladas.' } },
    { name: { tr: 'Kontrollü dön', en: 'Return slowly', es: 'Vuelve despacio' }, breath: 'in',
      text: { tr: 'Karını içeri çekerek kızağı geri getir; arka bacak düşmesin.', en: 'Draw the abs in to bring the carriage back; keep the back leg up.', es: 'Abdomen adentro para traer el carro; la pierna de atrás no cae.' } },
  ],
  tempoText: { tr: '2 sn dışarı · 0,5 sn dur · 2 sn dön', en: '2 s out · 0.5 s pause · 2 s return', es: '2 s fuera · 0,5 s pausa · 2 s vuelve' },
  mistakes: [
    { title: { tr: 'Kalça açılıp kalkıyor', en: 'Hip hikes and opens', es: 'La cadera sube y se abre' },
      fix: { tr: 'Kalçaları düz tut', en: 'Keep the hips square', es: 'Caderas cuadradas' },
      fixText: { tr: 'İki kalça kemiği aşağıya, footbar\'a bakar', en: 'Both hip bones face down toward the bar', es: 'Ambas crestas miran hacia la barra' },
      at: 'out', pose: { roll: -12, abdR: 16, hrotR: 30, hipR: -16 }, view: { yaw: 150, pitch: 14 },
      line: ['hipL', 'hipR'], marks: ['hipR'], parts: ['pelvis'] },
    { title: { tr: 'Arka bacak düşüyor', en: 'Back leg drops', es: 'La pierna de atrás cae' },
      fix: { tr: 'Arka bacak uzun', en: 'Back leg long', es: 'Pierna de atrás larga' },
      fixText: { tr: 'Topuktan uzan, kalçayı sık', en: 'Reach through the heel, squeeze the glute', es: 'Alarga desde el talón, aprieta el glúteo' },
      at: 'out', pose: { hipR: 30, kneeR: 35 }, line: ['hipR', 'kneeR', 'ankleR'], marks: ['kneeR'], parts: ['thighR', 'shinR'] },
  ],
  cues: [{ tr: 'Kalçalar düz', en: 'Hips square', es: 'Caderas cuadradas' },
    { tr: 'Arka bacak uzun', en: 'Back leg long', es: 'Pierna de atrás larga' },
    { tr: 'Omuzlar kulaktan uzak', en: 'Shoulders away from the ears', es: 'Hombros lejos de las orejas' }],
};
}
