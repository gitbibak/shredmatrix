/* Single-arm dumbbell row (strength_pull), right arm works (near the camera). Mirror of the spec's support side:
 * LEFT knee and LEFT hand on the bench, right foot on the floor. Contacts: ground [kneeL, handL] at bench height
 * (rigid sagittal fit), anchor on the left knee, right ankle planted. Right hand: world IK targets computed at load from
 * the solved body (thorax frame), so the dumbbell hangs under the shoulder at the start and sits beside the lower ribs at
 * the top; the twist/flare mistakes recompute their targets the same way.
 * Spec: trunk ~70-75, elbow 0 -> 100-105, neutral grip, dumbbell to the lower ribs, elbow above the torso line.
 * The spec's upper_arm_from_vertical -55/-60 contradicts "elbow above the torso line" with a 75° trunk (that needs the
 * upper arm ~115-120° from vertical, i.e. along the torso toward the hip); the elbow/dumbbell position is matched. */
{
const { V, M } = FB;
const H = 0.45, CTX = { anchorX: ['kneeL'], anchorAt: [0, -0.1] };
const BODY = { trunk: 74, hipL: 74, kneeL: 92, hipR: 72, kneeR: 12, abdR: 8, neck: -4, flatR: true, ankleL: -55, flatL: false,
  shL: 76, shAbdL: 4, elL: 0, ground: [['kneeL', H], ['handL', H]], elbowPoleR: [-1, -0.35, 0.25] };
const hand = (pose, rel) => {             // right-hand target in the thorax frame of the solved body
  const s = FB.solve(FB.expand(pose), CTX), T = s.F.thorax;
  const p = rel === 'hang' ? V.add(s.J.shoulderR, [0.0, -0.556, 0.01]) : V.add(s.J.waist, M.apply(T, rel));
  return { handR: { at: p.map((x) => +x.toFixed(3)) } };
};
const startB = Object.assign({}, BODY, { protractR: 0.05 });
const topB = Object.assign({}, BODY, { trunk: 72, hipL: 72, protractR: -0.03, twist: -5 });
const TOP_REL = [0.07, -0.04, 0.2];
const twistB = Object.assign({}, topB, { twist: -28, protractR: -0.05 });
const flareB = Object.assign({}, topB, { shrugR: 0.05, elbowPoleR: [-0.3, -0.05, 1] });

// targets need the rig's real body dimensions, which exist only after FB3.init: build poses/mistakes on first access
let _lazy = null;
const lazy = () => _lazy || (_lazy = {
  poses: {
    start: Object.assign({}, startB, { ik: hand(startB, 'hang') }),
    top: Object.assign({}, topB, { ik: hand(topB, TOP_REL) }),
  },
  mistakes: [
    { title: { tr: 'Gövdeyi döndürmek', en: 'Twisting the torso', es: 'Girar el torso' },
      fix: { tr: 'Omuzlar yere paralel', en: 'Keep shoulders square', es: 'Hombros paralelos al suelo' },
      fixText: { tr: 'Daha hafif dambıl seç, göğüs bench’e baksın', en: 'Go lighter, chest faces the bench', es: 'Usa menos peso, pecho hacia el banco' },
      at: 'top', pose: Object.assign({}, twistB, { ik: hand(twistB, TOP_REL) }), view: { yaw: 25, pitch: 18 }, line: ['shoulderL', 'shoulderR'], goodLine: ['shoulderL', 'shoulderR'], parts: ['chest', 'waist'] },
    { title: { tr: 'Dirsek dışa açılıyor', en: 'Elbow flares out', es: 'El codo se abre' },
      fix: { tr: 'Dirsek kalçaya doğru', en: 'Elbow toward the hip', es: 'Codo hacia la cadera' },
      fixText: { tr: 'Kol gövdeye yakın, omuz kulağa kalkmaz', en: 'Arm close to the body, no shrug', es: 'Brazo pegado, sin encoger' },
      at: 'top', pose: Object.assign({}, flareB, { ik: hand(flareB, [0.06, 0.2, 0.26]) }), view: { yaw: -20, pitch: 55 }, marks: ['elbowR'], line: ['shoulderR', 'elbowR'], parts: ['upperR', 'neck'] },
  ]
});

window.EXERCISE = {
  id: 'dumbbell_row',
  name: { tr: 'Tek Kol Dumbbell Row', en: 'Single-Arm Dumbbell Row', es: 'Remo a una mano con mancuerna' },
  category: { tr: 'Sırt', en: 'Back', es: 'Espalda' },
  equipmentLabel: { tr: 'Dambıl · Düz bench', en: 'Dumbbell · Flat bench', es: 'Mancuerna · Banco plano' },
  muscles: ['lats', 'upperback', 'delts', 'biceps'],
  tempo: '1-0.5-2',
  view: { yaw: 90, pitch: 8 },
  alt: { yaw: 40, pitch: 14, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Dirsek gövdeye yakın, kalçaya doğru gider', en: 'Elbow stays close and drives to the hip', es: 'Codo pegado, va hacia la cadera' } },
  props: [['bench', { at: [0.0, 0, -0.1], length: 1.25, height: H }], ['dumbbell', { grip: 'neutral', sides: ['R'] }]],
  ctx: Object.assign({ plant: ['ankleR'] }, CTX),
  get poses() { return lazy().poses; },
  rest: 'start',
  rep: [
    { to: 'top', dur: 1.2, phase: 0 },
    { to: 'top', dur: 0.5, phase: 1 },
    { to: 'start', dur: 1.8, phase: 2 },
  ],
  setup: { tr: 'Sol diz ve sol el bench’te, sağ ayak yerde. Sırt düz, dambıl omzun altında sarkar. Sonra taraf değiştir.',
    en: 'Left knee and hand on the bench, right foot down. Flat back, bell under the shoulder. Then switch sides.',
    es: 'Rodilla y mano izquierdas en el banco, pie derecho al suelo. Espalda recta. Luego cambia.' },
  phases: [
    { name: { tr: 'Çek', en: 'Row', es: 'Tira' }, breath: 'out', line: ['pelvis', 'neck'],
      text: { tr: 'Dirseği geriye, kalçaya doğru çek. Dambıl alt kaburgaya gelir.', en: 'Drive the elbow back toward your hip. Bell to the lower ribs.', es: 'Lleva el codo hacia la cadera. Mancuerna a las costillas.' } },
    { name: { tr: 'Sık', en: 'Squeeze', es: 'Aprieta' }, breath: 'hold', marks: [{ type: 'mark', joint: 'elbowR' }],
      text: { tr: 'Kürek kemiğini omurgaya doğru sık. Omuzlar düz kalır.', en: 'Pull the shoulder blade to the spine. Shoulders stay square.', es: 'Junta la escápula a la columna. Hombros nivelados.' } },
    { name: { tr: 'Uzat', en: 'Stretch', es: 'Estira' }, breath: 'in', line: ['pelvis', 'neck'],
      text: { tr: 'Kol düzleşene kadar indir, kanat kası gerilsin.', en: 'Lower until the arm is straight and the lat stretches.', es: 'Baja hasta estirar el brazo y el dorsal.' } },
  ],
  tempoText: { tr: '1,2 sn çek · 0,5 sn sık · 1,8 sn indir', en: '1.2 s row · 0.5 s squeeze · 1.8 s lower', es: '1,2 s tira · 0,5 s aprieta · 1,8 s baja' },
  get mistakes() { return lazy().mistakes; },
  cues: [{ tr: 'Dirsek kalçaya', en: 'Elbow to your hip', es: 'Codo a la cadera' },
    { tr: 'Sırt düz, dönme yok', en: 'Flat back, no twist', es: 'Espalda recta, sin girar' },
    { tr: 'Altta gerin', en: 'Stretch at the bottom', es: 'Estira abajo' }],
};
}
