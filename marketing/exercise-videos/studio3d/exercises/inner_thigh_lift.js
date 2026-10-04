/* Inner thigh lift (Pilates mat, side-lying on the RIGHT side; the BOTTOM = right leg works).
 * Side-lying base as side_kick_front_back.js: trunk 90 rolled -90 (roll + tips toward the character's LEFT), ground contacts
 * [hipR, shoulderR], head on the bottom hand, top hand flat on the mat in front of the chest.
 * Top (left) leg bent, foot flat on the mat in front of the bottom knee: world IK target for ankleL (same in every pose) with a
 * knee pole forward/up. Bottom leg straight, turned out 20° (hrotR), lifted by adduction (abdR negative = toward the ceiling
 * in this orientation) ~25° / ~20 cm and lowered to just above the mat. */
{
const G = [['hipR', 0.006], ['shoulderR', 0.006]];
const FOOT = [-0.36, 0.075, -0.33];   // top foot flat on the mat in front of the bottom knee
const BASE = { trunk: 90, roll: -90, ground: G, flat: false, neck: 4,
  hipR: 4, kneeR: 0, abdR: -4, hrotR: 16, ankleR: 8,
  hipL: 80, kneeL: 90, abdL: -20, flatL: true, kneePoleL: [1, 0.2, 0.7], ik: { ankleL: { at: FOOT } },
  holdR: [0.06, 0.37, 0.083], elbowPoleR: [0.7, 1, -0.25], palmR: [0, 0, -1], curlR: 0.3,
  holdL: [0.25, 0, -0.2], elbowPoleL: [-0.2, 0.3, 1], handFlatL: true, handSurfaceL: 0.004, curlL: 0.1 };
const P = (o) => Object.assign({}, BASE, o);

window.EXERCISE = {
  id: 'inner_thigh_lift',
  name: { tr: 'İç Bacak Kaldırma', en: 'Inner Thigh Lift', es: 'Elevación de aductores' },
  category: { tr: 'Pilates · İç bacak', en: 'Pilates · Inner thigh', es: 'Pilates · Aductores' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['adductors', 'core', 'obliques'],
  side: 'R',
  tempo: '2-2',
  view: { yaw: -95, pitch: 12, zoom: 1.12 },
  alt: { yaw: -150, pitch: 26, title: { tr: 'Ayak tarafından', en: 'From the feet', es: 'Desde los pies' },
    text: { tr: 'Alt bacak düz ve uzun, kalçalar üst üste', en: 'Bottom leg long and straight, hips stacked', es: 'Pierna de abajo larga y recta, caderas apiladas' } },
  setupView: { yaw: -60, pitch: 30 },
  setupMarks: [{ type: 'aline', joints: ['shoulderR', 'hipR'] }],
  contacts: ['shoulderR', 'hipR', 'ankleR', 'heelL', 'toeL', 'handL'],
  props: [['mat', { at: [0, 0.006, -0.12], length: 1.95, width: 0.75 }]],
  ctx: { anchorX: ['pelvis'], anchorAt: [0, 0] },
  poses: {
    low: P({}),
    up: P({ abdR: -17, ankleR: 10 }),
  },
  rest: 'low',
  rep: [
    { to: 'up', dur: 2.0, phase: 0 },
    { to: 'low', dur: 2.0, phase: 1 },
  ],
  setup: { tr: 'Sağ yanına uzan, başını sağ eline koy. Üst ayağı alt dizin önüne bas, alt bacak uzun. Sonra taraf değiştir.',
    en: 'Lie on your right side, head on your hand. Top foot flat in front of the bottom knee, bottom leg long. Then switch sides.',
    es: 'Túmbate sobre el lado derecho, cabeza en la mano. Pie de arriba delante de la rodilla, pierna de abajo larga. Luego cambia.' },
  phases: [
    { name: { tr: 'Alt bacağı kaldır', en: 'Lift the bottom leg', es: 'Sube la pierna de abajo' }, breath: 'out',
      text: { tr: 'Nefes ver, hafif dışa dönük alt bacağı iç bacaktan yukarı kaldır.', en: 'Exhale and lift the slightly turned-out bottom leg from the inner thigh.', es: 'Exhala y sube la pierna de abajo, algo rotada, desde el aductor.' } },
    { name: { tr: 'Yavaşça indir', en: 'Lower slowly', es: 'Baja despacio' }, breath: 'in',
      text: { tr: 'Nefes al, bacağı yavaşça indir; mata bırakma.', en: 'Inhale and lower slowly; do not rest it on the mat.', es: 'Inhala y baja despacio; no la apoyes.' } },
  ],
  tempoText: { tr: '2 sn kaldır · 2 sn indir', en: '2 s up · 2 s down', es: '2 s arriba · 2 s abajo' },
  mistakes: [
    { title: { tr: 'Alt kalça öne devriliyor', en: 'Hips roll forward', es: 'La cadera rueda adelante' },
      fix: { tr: 'Kalçaları üst üste tut', en: 'Keep the hips stacked', es: 'Caderas apiladas' },
      fixText: { tr: 'Daha az kaldır, gövde dik kalsın', en: 'Lift less and keep the torso stacked', es: 'Sube menos y mantén el tronco apilado' },
      at: 'up', pose: { roll: -76, abdR: -20, holdR: [0.04, 0.37, 0.06], elbowPoleR: [0.45, 1, -0.6] }, view: { yaw: -150, pitch: 26 }, line: ['hipL', 'hipR'], marks: ['hipL'], parts: ['pelvis'] },
    { title: { tr: 'Alt ayak tavana dönüyor', en: 'Bottom foot rolls up', es: 'El pie gira hacia arriba' },
      fix: { tr: 'Hafif dışa çevir', en: 'Turn out slightly', es: 'Rota un poco hacia fuera' },
      fixText: { tr: 'Topuk önden gelsin, iç bacak tavana baksın', en: 'Heel leads, the inner thigh faces the ceiling', es: 'Guía el talón, el aductor mira al techo' },
      at: 'up', pose: { hrotR: -30, ankleR: -30 }, marks: ['ankleR'], parts: ['shinR', 'thighR'] },
  ],
  cues: [{ tr: 'İç bacaktan kaldır', en: 'Lift from the inner thigh', es: 'Eleva desde el aductor' },
    { tr: 'Kalçalar üst üste', en: 'Keep hips stacked', es: 'Caderas apiladas' },
    { tr: 'Bacağı uzat', en: 'Lengthen the leg', es: 'Alarga la pierna' }],
};
}
