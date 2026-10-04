/* Hot Potato (Pilates mat, side kick series; side-lying on the RIGHT side, top = left leg works). Base copied from
 * side_kick_front_back.js / side_kick_circles.js (approved base): trunk 90 rolled -90, ground [hipR, shoulderR], head on the
 * bottom hand (elbow bent), top hand flat on the mat, bottom leg 30° forward and pressed into the mat.
 * - Spec version: the top leg is lifted to ~45° abduction (slight turn-out, hrot 10) and draws quick small circles
 *   (~15 cm at the ankle, ~2 per second): four card-less keys around abd 45 / hip 4 with a 5° radius, 0.12 s apart.
 *   Four circles one way, four the other.
 * - Only the first key of each direction carries the card; the quick circles play at real speed right after it. */
{
const G = [['hipR', 0.006], ['shoulderR', 0.006]];
const BASE = { trunk: 90, roll: -90, ground: G, flat: false, neck: 4,
  hipR: 30, kneeR: 0, abdR: -2, ankleR: -10,
  hipL: 4, kneeL: 0, abdL: 45, hrotL: 10, ankleL: -25,
  holdR: [0.06, 0.37, 0.083], elbowPoleR: [0.7, 1, -0.25], palmR: [0, 0, -1], curlR: 0.3,
  holdL: [0.25, 0, -0.2], elbowPoleL: [-0.2, 0.3, 1], handFlatL: true, handSurfaceL: 0.004, curlL: 0.1 };
const P = (o) => Object.assign({}, BASE, o);
const C = [4, 45], R = 5;
const pt = (dh, da) => P({ hipL: C[0] + dh * R, abdL: C[1] + da * R });
const K = (to, dur = 0.12) => ({ to, dur, card: false });

window.EXERCISE = {
  id: 'hot_potato',
  name: { tr: 'Sıcak Patates (Hot Potato)', en: 'Hot Potato', es: 'Patata caliente (hot potato)' },
  category: { tr: 'Pilates · Kalça', en: 'Pilates · Hips', es: 'Pilates · Cadera' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['glutes', 'obliques', 'core'],
  side: 'L',
  tempo: '1-1',
  view: { yaw: -62, pitch: 30, zoom: 1.12 },
  alt: { yaw: -100, pitch: 14, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
    text: { tr: 'Ayak hızlı, gövde sessiz', en: 'Quick foot, quiet body', es: 'Pie rápido, cuerpo quieto' } },
  setupView: { yaw: -100, pitch: 16 },
  setupMarks: [{ type: 'aline', joints: ['shoulderR', 'hipR'] }],
  contacts: ['shoulderR', 'hipR', 'kneeR', 'ankleR', 'handL'],
  props: [['mat', { at: [0, 0.006, -0.12], length: 1.95, width: 0.7 }]],
  ctx: { anchorX: ['pelvis'], anchorAt: [0, 0] },
  poses: {
    start: P({}),
    F: pt(1, 0), U: pt(0, 1), B: pt(-1, 0), D: pt(0, -1),
  },
  rest: 'start',
  rep: [
    { to: 'F', dur: 0.4, phase: 0 }, ...[0, 1, 2, 3].flatMap(() => [K('U'), K('B'), K('D'), K('F')]),
    { to: 'D', dur: 0.2, phase: 1 }, ...[0, 1, 2, 3].flatMap(() => [K('B'), K('U'), K('F'), K('D')]),
    { to: 'start', dur: 0.5, card: false },
  ],
  setup: { tr: 'Sağ yanına uzan, başını sağ eline koy. Alt bacak minderi bastırır, üst bacak 45° yukarıda. Sonra taraf değiştir.',
    en: 'Lie on your right side, head on your hand. Bottom leg presses down, top leg lifted to 45°. Then switch sides.',
    es: 'Túmbate sobre el lado derecho, cabeza en la mano. La pierna de abajo presiona, la de arriba a 45°. Luego cambia.' },
  phases: [
    { name: { tr: 'Hızlı küçük daireler', en: 'Quick small circles', es: 'Círculos rápidos y pequeños' }, breath: 'easy',
      text: { tr: 'Üst bacak sıcak patatese dokunur gibi hızlı, küçük daireler çizer.', en: 'The top leg draws quick small circles, as if tapping a hot potato.', es: 'La pierna de arriba hace círculos rápidos, como tocando una patata caliente.' } },
    { name: { tr: 'Yönü değiştir', en: 'Reverse', es: 'Cambia de sentido' }, breath: 'easy',
      text: { tr: 'Aynı hızla ters yöne. Gövde ve üst kalça kıpırdamaz.', en: 'Same speed, other direction. Torso and top hip stay still.', es: 'Misma velocidad, al revés. Tronco y cadera de arriba quietos.' } },
  ],
  tempoText: { tr: 'Saniyede 2 daire · 4-8 sayıda yön değiştir', en: '2 circles per second · switch every 4-8 counts', es: '2 círculos por segundo · cambia cada 4-8 tiempos' },
  mistakes: [
    { title: { tr: 'Üst gövde bacakla sallanıyor', en: 'Upper body moves with the leg', es: 'El tronco se mueve con la pierna' },
      fix: { tr: 'Üst eli minderde bastır', en: 'Press the top hand into the mat', es: 'Presiona la mano de arriba' },
      fixText: { tr: 'Baş ve göğüs sabit; sadece bacak hareket eder', en: 'Head and chest still; only the leg moves', es: 'Cabeza y pecho quietos; solo se mueve la pierna' },
      at: 'F', pose: { twist: -16, lumbar: 8, thoracic: 4, neck: -4, holdR: [0.04, 0.37, 0.06], elbowPoleR: [0.45, 1, -0.6] }, marks: ['chest'], parts: ['waist', 'chest'] },
    { title: { tr: 'Üst kalça geriye açılıyor', en: 'Top hip rolls back', es: 'La cadera de arriba se abre atrás' },
      fix: { tr: 'Karnı sık, kalçaları üst üste koy', en: 'Brace and stack the hips', es: 'Abdomen firme, caderas apiladas' },
      fixText: { tr: 'Üst kalça alt kalçanın tam üstünde kalır', en: 'Top hip stays right above the bottom hip', es: 'La cadera de arriba queda sobre la de abajo' },
      at: 'B', pose: { roll: -104, lumbar: -8, hrotL: 30 }, view: { yaw: -90, pitch: 64 }, line: ['hipL', 'hipR'], marks: ['hipL'], parts: ['pelvis', 'waist'] },
  ],
  cues: [{ tr: 'Ayak hızlı, gövde sessiz', en: 'Quick feet, quiet body', es: 'Pies rápidos, cuerpo quieto' },
    { tr: 'Alt bacak minderi bastırır', en: 'Press the bottom leg into the mat', es: 'Presiona la pierna de abajo' },
    { tr: 'Üst kalça alttakinin üstünde', en: 'Keep the top hip stacked', es: 'Cadera de arriba apilada' }],
};
}
