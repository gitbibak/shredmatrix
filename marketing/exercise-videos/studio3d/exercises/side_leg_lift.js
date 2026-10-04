/* Side-lying leg lift (Pilates mat, side-lying on the RIGHT side, top = left leg works). Built from side_kick_up_down.js.
 * Side-lying base as side_kick_front_back.js: trunk 90 rolled -90 (roll + tips toward the character's LEFT), ground contacts
 * [hipR, shoulderR], head on the bottom hand (elbow forward on the mat), top hand flat on the mat in front of the chest.
 * Top leg parallel (no turn-out), heel leading (foot flexed), lifted in the frontal plane to 40° and lowered to 5°.
 * The spec's optional pulse series (small pulses / circles at the top) is named in the cues and tempo text, not animated.
 * Abduction is not in measure.mjs; it was measured as the angle between the two thighs (see report). */
{
const G = [['hipR', 0.006], ['shoulderR', 0.006]];
const BASE = { trunk: 90, roll: -90, ground: G, flat: false, neck: 4,
  hipR: 20, kneeR: 0, abdR: -2, ankleR: -10,
  hipL: 18, kneeL: 0, abdL: 5, hrotL: 0, ankleL: 12,
  holdR: [0.06, 0.37, 0.083], elbowPoleR: [0.7, 1, -0.25], palmR: [0, 0, -1], curlR: 0.3,
  holdL: [0.25, 0, -0.2], elbowPoleL: [-0.2, 0.3, 1], handFlatL: true, handSurfaceL: 0.004, curlL: 0.1 };
const P = (o) => Object.assign({}, BASE, o);

window.EXERCISE = {
  id: 'side_leg_lift',
  name: { tr: 'Yan Yatış Bacak Kaldırma', en: 'Side-Lying Leg Lift', es: 'Elevación de pierna lateral' },
  category: { tr: 'Pilates · Kalça', en: 'Pilates · Hips', es: 'Pilates · Cadera' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['glutes', 'obliques', 'core'],
  side: 'L',
  tempo: '2-2',
  view: { yaw: -68, pitch: 16, zoom: 1.12 },
  alt: { yaw: -118, pitch: 14, title: { tr: 'Ayak tarafından', en: 'From the feet', es: 'Desde los pies' },
    text: { tr: 'Ayak kalça hizasında, kalça devrilmez', en: 'Foot in line with the hip, no rolling back', es: 'Pie en línea con la cadera, sin rodar atrás' } },
  setupView: { yaw: -95, pitch: 14 },
  setupMarks: [{ type: 'aline', joints: ['shoulderR', 'hipR'] }],
  contacts: ['shoulderR', 'hipR', 'kneeR', 'ankleR', 'handL'],
  props: [['mat', { at: [0, 0.006, -0.1], length: 1.95, width: 0.7 }]],
  ctx: { anchorX: ['pelvis'], anchorAt: [0, 0] },
  poses: {
    low: P({}),
    up: P({ abdL: 40 }),
  },
  rest: 'low',
  rep: [
    { to: 'up', dur: 2.0, phase: 0 },
    { to: 'low', dur: 2.0, phase: 1 },
  ],
  setup: { tr: 'Sağ yanına uzan, başını sağ eline koy. Alt bacak hafif önde, üst bacak düz ve kalça hizasında. Sonra taraf değiştir.',
    en: 'Lie on your right side, head on your right hand. Bottom leg slightly forward, top leg long at hip height. Then switch sides.',
    es: 'Túmbate sobre el lado derecho, cabeza en la mano. Pierna de abajo algo adelante, la de arriba larga. Luego cambia de lado.' },
  phases: [
    { name: { tr: 'Kaldır', en: 'Lift', es: 'Eleva' }, breath: 'out', arc: ['ankleR', 'hipR', 'ankleL'],
      text: { tr: 'Nefes ver, düz bacağı topukla önderlik ederek yaklaşık 40° kaldır.', en: 'Exhale and lift the straight leg to about 40°, leading with the heel.', es: 'Exhala y sube la pierna recta a unos 40°, guiando con el talón.' } },
    { name: { tr: 'İndir', en: 'Lower', es: 'Baja' }, breath: 'in',
      text: { tr: 'Nefes al, bacağı kontrollü indir; alt bacağa dayanma.', en: 'Inhale and lower with control; do not rest on the bottom leg.', es: 'Inhala y baja con control; no apoyes en la otra pierna.' } },
  ],
  tempoText: { tr: '2 sn kaldır · 2 sn indir · sonra 2×10 küçük nabız', en: '2 s up · 2 s down · then 2×10 small pulses', es: '2 s arriba · 2 s abajo · luego 2×10 pulsos' },
  mistakes: [
    { title: { tr: 'Üst kalça geriye açılıyor', en: 'Top hip rolls back', es: 'La cadera de arriba rueda atrás' },
      fix: { tr: 'Kalçaları üst üste diz', en: 'Stack the hips', es: 'Apila las caderas' },
      fixText: { tr: 'Ayak parmakları öne baksın; biraz daha alçak kaldır', en: 'Toes face forward; lift a little lower', es: 'Dedos al frente; sube algo menos' },
      at: 'up', pose: { roll: -104, abdL: 48, hrotL: 42 }, view: { yaw: -118, pitch: 14 }, line: ['hipL', 'hipR'], marks: ['hipL'], parts: ['pelvis'] },
    { title: { tr: 'Bel çukurlaşıyor', en: 'Lower back arches', es: 'La lumbar se arquea' },
      fix: { tr: 'Karnı içeri çek', en: 'Brace the abs', es: 'Activa el abdomen' },
      fixText: { tr: 'Kaburgalar içeride, omuz-kalça-ayak tek çizgide', en: 'Ribs in, shoulder-hip-foot in one line', es: 'Costillas adentro, hombro-cadera-pie en línea' },
      at: 'up', pose: { lumbar: -18, thoracic: -8 }, view: { yaw: -100, pitch: 62 }, line: ['shoulderL', 'waist', 'hipL'], goodLine: ['shoulderL', 'hipL'], parts: ['waist'] },
  ],
  cues: [{ tr: 'Kalçalar üst üste, bel uzun', en: 'Stack the hips, waist long', es: 'Caderas apiladas, cintura larga' },
    { tr: 'Topukla önderlik et', en: 'Lead with the heel', es: 'Guía con el talón' },
    { tr: 'Bacağın ağırlığını kontrol et', en: 'Control the weight of the leg', es: 'Controla el peso de la pierna' }],
};
}
