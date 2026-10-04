/* Magic Circle Inner Thigh Press (Pilates mat, supine). Supine base copied from the approved ball_between_knees_bridge.js start
 * pose (contacts [shoulderR, heelR], feet and hands planted, ankles anchored).
 * Ring: a custom prop (_circleThigh) drawn as a torus between the two inner-thigh surfaces just above the knees (knee centre
 * offset 5.5 cm toward the other knee, 88 % down the thigh) with two small pads. The ring diameter therefore follows the knee
 * gap: rest = light contact (~31 cm ring), press = knees adduct (abd 14 -> 10.5) and the ring squeezes ~4 cm (spec 3-5 cm).
 * Front view (from the feet) shows the compression and the knees staying in line with the feet.
 * Knees over the ankles: abd 14 with hrot -10 places the feet ~38 cm apart (in line with the knees around the ring).
 * Spec hip 55 (leg elevation from the mat) / knee 100; measure reports the thigh elevation. */
{
const MAT = 0.012;
const G = (sh = 0) => [['shoulderR', MAT + sh], ['heelR', MAT]];
const inner = (s, side) => {
  const { V } = FB, o = side === 'R' ? 'L' : 'R';
  const P = V.lerp(s.J['hip' + side], s.J['knee' + side], 0.88), Q = V.lerp(s.J['hip' + o], s.J['knee' + o], 0.88);
  return V.add(P, V.mul(V.norm(V.sub(Q, P)), 0.055));
};
FB.PROPS._circleThigh = (sol) => {
  const a = inner(sol, 'R'), b = inner(sol, 'L'), { V } = FB, ax = V.norm(V.sub(b, a));
  return [{ t: 'torus', a: V.add(a, V.mul(ax, 0.019)), b: V.sub(b, V.mul(ax, 0.019)), r: 0.012, m: 'ring' },
    { t: 'cyl', a, b: V.add(a, V.mul(ax, 0.022)), r: 0.04, m: 'pad' }, { t: 'cyl', a: V.sub(b, V.mul(ax, 0.022)), b, r: 0.04, m: 'pad' }];
};
const BASE = { noAvoid: true, trunk: -90, hrot: -10, sh: -12, el: 0, palm: 'down', ground: G(0.04), hip: 55, knee: 104, thoracic: 10, lumbar: -4, neck: -8 };
window.EXERCISE = {
  id: 'magic_circle_inner_thigh',
  name: { tr: 'Magic Circle ile İç Bacak', en: 'Magic Circle Inner Thigh Press', es: 'Aductores con magic circle' },
  category: { tr: 'Pilates · İç bacak', en: 'Pilates · Inner thighs', es: 'Pilates · Aductores' },
  equipmentLabel: { tr: 'Mat · Pilates çemberi', en: 'Mat · Pilates ring', es: 'Esterilla · Aro de pilates' },
  muscles: ['adductors', 'core', 'glutes'],
  tempo: '1-1',
  view: { yaw: 8, pitch: 26 },
  alt: { yaw: 90, pitch: 6, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
    text: { tr: 'Leğen nötr, bel matta sabit', en: 'Pelvis neutral, low back still on the mat', es: 'Pelvis neutra, lumbar quieta' } },
  setupView: { yaw: 40, pitch: 22 },
  setupMarks: [{ type: 'aline', joints: ['kneeR', 'ankleR'] }, { type: 'aline', joints: ['kneeL', 'ankleL'] }],
  contacts: ['shoulderR', 'pelvis', 'heelR', 'ballR', 'handR'],
  props: [['mat', { at: [-0.45, 0.006, 0], length: 1.85 }], ['_circleThigh']],
  ctx: { anchorX: ['ankleL', 'ankleR'], plant: ['ankleL', 'ankleR', 'handL', 'handR'] },
  poses: {
    rest: Object.assign({}, BASE, { abd: 14 }),
    press: Object.assign({}, BASE, { abd: 10.5 }),
  },
  rest: 'rest',
  rep: [
    { to: 'press', dur: 1.0, phase: 0 },
    { to: 'rest', dur: 1.0, phase: 1 },
  ],
  setup: { tr: 'Sırtüstü yat, dizler bükülü. Ayaklar dizlerin hizasında, çember dizlerin hemen üstünde.',
    en: 'Lie on your back, knees bent, feet in line with the knees. Ring between the thighs, just above the knees.',
    es: 'Boca arriba, rodillas flexionadas, pies en línea con las rodillas. Aro entre los muslos.' },
  phases: [
    { name: { tr: 'Sık', en: 'Press', es: 'Aprieta' }, breath: 'out', slow: 2.2, marks: ['kneeL', 'kneeR'],
      text: { tr: 'Nefes ver, iç bacaklarla çemberi 3-5 cm sık. Karın aktif, leğen sabit.', en: 'Exhale, squeeze the ring 3-5 cm with the inner thighs. Abs on, pelvis still.', es: 'Exhala, aprieta el aro 3-5 cm con los aductores. Abdomen activo, pelvis quieta.' } },
    { name: { tr: 'Yarıya bırak', en: 'Release halfway', es: 'Suelta a medias' }, breath: 'in', slow: 2.2, line: ['kneeR', 'kneeL'],
      text: { tr: 'Nefes al, yavaşça bırak ama çemberle teması kaybetme.', en: 'Inhale, release slowly but keep light contact with the ring.', es: 'Inhala, suelta despacio sin perder el contacto.' } },
  ],
  tempoText: { tr: '1 sn sık · 1 sn bırak · 15-20 tekrar', en: '1 s press · 1 s release · 15-20 reps', es: '1 s aprieta · 1 s suelta · 15-20 rep.' },
  mistakes: [
    { title: { tr: 'Leğen sıkışla oynuyor', en: 'Pelvis tilts with the squeeze', es: 'La pelvis se mueve' },
      text: { tr: 'Her sıkışta bel kavislenir, kalça sallanır.', en: 'The low back arches and the hips rock with every squeeze.', es: 'La lumbar se arquea y la cadera se balancea.' },
      fix: { tr: 'Karnı aktif tut', en: 'Keep the abs engaged', es: 'Mantén el abdomen activo' },
      fixText: { tr: 'Leğen nötr, sadece bacaklar sıkar', en: 'Pelvis neutral, only the legs squeeze', es: 'Pelvis neutra, solo aprietan las piernas' },
      at: 'press', pose: { lumbar: -13, hip: 52, thoracic: 10, neck: 2, ground: G(0.06) }, view: { yaw: 90, pitch: 6 }, line: ['pelvis', 'waist'], parts: ['waist', 'pelvis'] },
    { title: { tr: 'Dizler içe kapanıyor', en: 'Knees roll inward', es: 'Las rodillas se cierran' },
      text: { tr: 'Sadece dizlerle sıkılır, dizler ayakların içine düşer.', en: 'Squeezing with the knees only; they collapse inside the feet.', es: 'Aprietas solo con las rodillas; caen hacia dentro.' },
      fix: { tr: 'Ayaklardan bas', en: 'Press through the feet', es: 'Empuja con los pies' },
      fixText: { tr: 'Diz, ayak bileği hizasında; sıkış iç bacaktan', en: 'Knees over the ankles; squeeze from the inner thighs', es: 'Rodillas sobre los tobillos; aprieta con los aductores' },
      at: 'press', pose: { abd: 6, hrot: -26, ground: G(0.06) }, marks: ['kneeL', 'kneeR'], parts: ['thigh'] },
  ],
  cues: [{ tr: 'İç bacaktan pelvik tabana sık', en: 'Squeeze from the inner thighs to the pelvic floor', es: 'Aprieta desde los aductores al suelo pélvico' },
    { tr: 'Leğen nötr', en: 'Pelvis stays neutral', es: 'Pelvis neutra' },
    { tr: 'Sadece dizlerle sıkma', en: 'Don\'t squeeze with the knees only', es: 'No aprietes solo con las rodillas' }],
};
}
