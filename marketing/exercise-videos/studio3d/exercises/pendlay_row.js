/* Pendlay row (strength_pull). Bar starts and ends on the floor (dead stop, plates on the ground), torso ~80° from
 * vertical, explosive row to the lower chest. Hands use world IK targets (`ik`) like barbell_row.js; the bar targets for
 * the chest touch are computed at load from the solved body (thorax frame), so mistakes keep the bar on the body.
 * Limitation / spec mismatch: with this rig (shoulder -> grip 0.56 m) and 45 cm bumper plates (bar at 0.225 m) the bar
 * on the floor is only reachable with a deeper hip/knee bend: hip_flexion ~133 / knee ~59 (spec 115 / 45). Trunk (~80),
 * elbow at the top (~105-110), bar over mid-foot and the vertical bar path match the spec. */
{
const { V, M } = FB;
const Z = 0.27, BAR_Y = 0.225, BAR_X = 0.085;
const LEGS = { abd: 12, hrot: 14, flat: true, neck: -10, elbowPole: [-1, -0.15, 0.6] };
const BAR = (x, y) => ({ handL: { at: [x, y, -Z] }, handR: { at: [x, y, Z] } });
// bar touching the torso: chest-front point of the solved body, slightly toward the waist
const touch = (pose) => {
  const s = FB.solve(FB.expand(pose), { anchorX: ['ankleL', 'ankleR'] });
  const T = s.F.thorax, p = V.add(V.lerp(s.J.chest, s.J.waist, 0.7), M.apply(T, [0.13, 0, 0]));
  return BAR(+p[0].toFixed(3), +p[1].toFixed(3));
};
const startP = Object.assign({ trunk: 80, hip: 133, knee: 59, protract: 0.06, el: 4, ik: BAR(BAR_X, BAR_Y) }, LEGS);
const topBody = Object.assign({ trunk: 79, hip: 132, knee: 59, protract: -0.03, el: 105 }, LEGS);
const heaveBody = Object.assign({}, LEGS, { trunk: 46, hip: 92, knee: 52, protract: -0.03, el: 105, lumbar: -4 });
const roundBody = Object.assign({}, startP, { thoracic: 34, lumbar: 14, neck: -32, trunk: 56, hip: 112 });

// touch targets need the rig's real body dimensions (available only after FB3.init): build on first access
let _lazy = null;
const lazy = () => _lazy || (_lazy = {
  poses: { start: startP, top: Object.assign({}, topBody, { ik: touch(topBody) }) },
  mistakes: [
    { title: { tr: 'Gövde dikleşiyor', en: 'Torso rises during the pull', es: 'El torso se levanta' },
      fix: { tr: 'Gövde yere paralel kalsın', en: 'Keep the torso parallel', es: 'Torso paralelo' },
      fixText: { tr: 'Ağırlığı azalt, sadece kollar ve sırt çeker', en: 'Drop the load; only arms and back pull', es: 'Baja el peso; tiran brazos y espalda' },
      at: 'top', pose: Object.assign({}, heaveBody, { ik: touch(heaveBody) }), line: ['pelvis', 'neck'], parts: ['pelvis', 'waist', 'chest'] },
    { title: { tr: 'Sırt yuvarlak başlıyor', en: 'Rounded back at the start', es: 'Espalda redonda al inicio' },
      fix: { tr: 'Göğsü aç, karnı sık', en: 'Chest proud, brace', es: 'Pecho abierto, abdomen firme' },
      fixText: { tr: 'Çekmeden önce sırtı düzle, boyun nötr', en: 'Flatten the back before you pull, neck neutral', es: 'Endereza la espalda antes de tirar, cuello neutro' },
      at: 'start', pose: roundBody, line: ['pelvis', 'waist', 'neck'], goodLine: ['pelvis', 'neck'], parts: ['waist', 'chest', 'neck'] },
  ]
});

window.EXERCISE = {
  id: 'pendlay_row',
  name: { tr: 'Pendlay Row', en: 'Pendlay Row', es: 'Remo Pendlay' },
  category: { tr: 'Sırt', en: 'Back', es: 'Espalda' },
  equipmentLabel: { tr: 'Barbell', en: 'Barbell', es: 'Barra' },
  muscles: ['lats', 'upperback', 'delts', 'biceps'],
  tempo: '1-0.3-1.2',
  view: { yaw: 90, pitch: 8 },
  alt: { yaw: 36, pitch: 12, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Gövde yere paralel, bar dik çizgide', en: 'Torso parallel, the bar travels straight', es: 'Torso paralelo, la barra sube recta' } },
  setupView: { yaw: 32, pitch: 12 },
  setupMarks: [{ type: 'aline', joints: ['handL', 'handR'] }],
  props: [['barbell', { grip: 'pronated' }]],
  ctx: { anchorX: ['ankleL', 'ankleR'], plant: ['ankleL', 'ankleR'] },
  get poses() { return lazy().poses; },
  rest: 'start',
  repGap: 0.5,
  rep: [
    { to: 'top', dur: 0.6, phase: 0 },
    { to: 'top', dur: 0.3, phase: 1 },
    { to: 'start', dur: 1.2, phase: 2 },
  ],
  setup: { tr: 'Bar yerde, orta ayağın üstünde. Gövde yere paralel, sırt düz. Barı omuzdan geniş, üstten tut.',
    en: 'Bar on the floor over mid-foot. Torso parallel to the floor, flat back. Wide overhand grip.',
    es: 'Barra en el suelo sobre el medio del pie. Torso paralelo, espalda recta. Agarre prono ancho.' },
  phases: [
    { name: { tr: 'Patlayıcı çek', en: 'Rip it up', es: 'Tira explosivo' }, breath: 'out', line: ['pelvis', 'neck'],
      text: { tr: 'Barı yerden hızla alt göğse çek. Gövde açısı değişmez.', en: 'Row the bar fast to the lower chest. The torso angle stays.', es: 'Lleva la barra rápido al pecho bajo. El torso no se mueve.' } },
    { name: { tr: 'Göğse değdir', en: 'Touch & squeeze', es: 'Toca y aprieta' }, breath: 'hold', line: ['pelvis', 'neck'], marks: [{ type: 'mark', joint: 'elbowR' }],
      text: { tr: 'Bar gövdeye değer, kürek kemiklerini sık.', en: 'Bar touches the torso, squeeze the shoulder blades.', es: 'La barra toca el torso, junta las escápulas.' } },
    { name: { tr: 'Yere bırak', en: 'Back to the floor', es: 'Al suelo' }, breath: 'in', line: ['pelvis', 'neck'],
      text: { tr: 'Kontrollü indir, bar yerde tamamen dursun. Her tekrar sıfırdan.', en: 'Lower under control to a dead stop. Reset every rep.', es: 'Baja controlado hasta parar del todo. Reinicia cada rep.' } },
  ],
  tempoText: { tr: '0,6 sn çek · 0,3 sn sık · 1,2 sn indir · yerde dur', en: '0.6 s pull · 0.3 s squeeze · 1.2 s down · dead stop', es: '0,6 s tira · 0,3 s aprieta · 1,2 s baja · pausa' },
  get mistakes() { return lazy().mistakes; },
  cues: [{ tr: 'Sırt düz, gövde paralel', en: 'Back flat, torso parallel', es: 'Espalda recta, torso paralelo' },
    { tr: 'Yerden patlayarak çek', en: 'Rip it from the floor', es: 'Arranca del suelo' },
    { tr: 'Her tekrar yerde dur', en: 'Reset every rep', es: 'Reinicia cada rep' }],
};
}
