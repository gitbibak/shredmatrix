/* Side kick front-back (Pilates mat, side-lying on the RIGHT side, top = left leg works).
 * Side-lying base: trunk 90 (prone) rolled -90 onto the right side (roll + tips toward the character's LEFT), so the body lies
 * along +x (head) facing -z. Two ground contacts [hipR, shoulderR] keep the bottom hip and shoulder on the mat (same names in
 * every pose); the spine rises ~7° toward the head because the shoulders are wider than the hips (waist lifted off the mat).
 * Head rests on the bottom hand (holdR under the ear, elbow forward on the mat): with the rig's shoulder width a straight
 * bottom arm leaves the head ~5 cm above it, so the spec's "elbow bent, head in hand" variant is used.
 * Top leg stays at hip height (abdL 0 = parallel to the bottom leg) and swings in the horizontal plane.
 * Spec start lists hip_flexion_top 0 while the bottom leg is 30° forward: start pose uses top 0 / bottom 30.
 * measure.mjs prints hip flexion unsigned: the sweep-back "20" is 20° of extension. */
{
const G = [['hipR', 0.006], ['shoulderR', 0.006]];
const BASE = { trunk: 90, roll: -90, ground: G, flat: false, neck: 4,
  hipR: 30, kneeR: 0, abdR: -2, ankleR: -10,
  hipL: 0, kneeL: 0, abdL: 0, ankleL: -10,
  holdR: [0.06, 0.37, 0.083], elbowPoleR: [0.7, 1, -0.25], palmR: [0, 0, -1], curlR: 0.3,
  holdL: [0.25, 0, -0.2], elbowPoleL: [-0.2, 0.3, 1], handFlatL: true, handSurfaceL: 0.004, curlL: 0.1 };
const P = (o) => Object.assign({}, BASE, o);

window.EXERCISE = {
  id: 'side_kick_front_back',
  name: { tr: 'Yan Tekme Ön-Arka', en: 'Side Kick Front-Back', es: 'Patada lateral adelante-atrás' },
  category: { tr: 'Pilates · Kalça', en: 'Pilates · Hips', es: 'Pilates · Cadera' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['glutes', 'obliques', 'core'],
  side: 'L',
  tempo: '1-1.5',
  view: { yaw: -62, pitch: 30, zoom: 1.12 },
  alt: { yaw: -90, pitch: 64, title: { tr: 'Üstten bak', en: 'Top view', es: 'Vista superior' },
    text: { tr: 'Bacak öne ve geriye, gövde sabit', en: 'Leg swings forward and back, torso still', es: 'La pierna va y viene, el tronco quieto' } },
  setupView: { yaw: -100, pitch: 16 },
  setupMarks: [{ type: 'aline', joints: ['shoulderR', 'hipR'] }],
  contacts: ['shoulderR', 'hipR', 'kneeR', 'ankleR', 'handL'],
  props: [['mat', { at: [0, 0.006, -0.12], length: 1.95, width: 0.7 }]],
  ctx: { anchorX: ['pelvis'], anchorAt: [0, 0] },
  poses: {
    start: P({}),
    front: P({ hipL: 75, ankleL: 12 }),
    back: P({ hipL: -20, ankleL: -40 }),
  },
  rest: 'start',
  rep: [
    { to: 'front', dur: 1.0, phase: 0 },
    { to: 'back', dur: 1.5, phase: 1 },
  ],
  setup: { tr: 'Sağ yanına uzan, başını sağ eline koy. Bacaklar hafif önde, üst bacak kalça hizasında. Sonra taraf değiştir.',
    en: 'Lie on your right side, head on your right hand. Legs slightly forward, top leg at hip height. Then switch sides.',
    es: 'Túmbate sobre el lado derecho, cabeza en la mano. Piernas un poco adelante, la de arriba a la altura de la cadera. Luego cambia.' },
  phases: [
    { name: { tr: 'Öne tekme', en: 'Kick forward', es: 'Patada adelante' }, breath: 'in',
      text: { tr: 'Ayak bileği bükülü, üst bacağı öne savur. Gövde kıpırdamaz.', en: 'Flex the foot and swing the top leg forward. The torso stays still.', es: 'Pie flexionado, lleva la pierna adelante. El tronco no se mueve.' } },
    { name: { tr: 'Geriye uzat', en: 'Sweep back', es: 'Barre atrás' }, breath: 'out', arc: ['shoulderL', 'hipL', 'ankleL'],
      text: { tr: 'Ayak ucunu uzat, bacağı kalçanın gerisine süpür. Bel çukurlaşmaz.', en: 'Point the foot and sweep the leg behind the hip. No arch in the lower back.', es: 'Pie en punta, lleva la pierna detrás de la cadera. Sin arquear la zona lumbar.' } },
  ],
  tempoText: { tr: '1 sn öne · 1,5 sn geriye', en: '1 s forward · 1.5 s back', es: '1 s adelante · 1,5 s atrás' },
  mistakes: [
    { title: { tr: 'Kalça geriye devriliyor', en: 'Pelvis rolls back', es: 'La pelvis rueda atrás' },
      fix: { tr: 'Geri hareketi kısalt', en: 'Shorten the back sweep', es: 'Acorta el barrido atrás' },
      fixText: { tr: 'Kalçalar üst üste; karnı içeri çek, bel düz kalsın', en: 'Hips stacked; brace the abs, keep the back long', es: 'Caderas apiladas; abdomen firme, espalda larga' },
      at: 'back', pose: { roll: -104, lumbar: -14, hipL: -32 }, view: { yaw: -90, pitch: 64 }, line: ['hipL', 'hipR'], marks: ['hipL'], parts: ['pelvis', 'waist'] },
    { title: { tr: 'Gövde bacakla sallanıyor', en: 'Torso rocks with the leg', es: 'El tronco se balancea' },
      fix: { tr: 'Gövdeyi sabitle', en: 'Keep the torso still', es: 'Tronco inmóvil' },
      fixText: { tr: 'Baş sabit, üst eli mata bastır; sadece bacak hareket eder', en: 'Head still, press the top hand down; only the leg moves', es: 'Cabeza quieta, mano de arriba firme; solo se mueve la pierna' },
      at: 'front', pose: { twist: -16, lumbar: 8, thoracic: 4, neck: -4, holdR: [0.04, 0.37, 0.06], elbowPoleR: [0.45, 1, -0.6] }, marks: ['chest'], parts: ['waist', 'chest'] },
  ],
  cues: [{ tr: 'Bel mattan hafif yukarıda', en: 'Waist lifted off the mat', es: 'Cintura despegada de la esterilla' },
    { tr: 'Öne savur, geriye uzun süpür', en: 'Kick forward, sweep back long', es: 'Patada adelante, barrido largo atrás' },
    { tr: 'Üst bacak kalça hizasında', en: 'Top leg at hip height', es: 'Pierna de arriba a la altura de la cadera' }],
};
}
