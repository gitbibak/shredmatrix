/* Yin Saddle (supported Supta Virasana). Kneel, knees together, feet wider than the hips, sit on a folded blanket between the
 * heels -> lean back onto the hands, then lie back on a lengthwise bolster -> long passive hold -> come back up.
 * - Two ground contacts [kneeR, ankleR] in every pose (shins flat, tops of the feet down, as child_pose): the legs never move;
 *   with both contacts on the legs the torso angle comes from `hip` (the solver rotates the body to keep the contacts).
 * - fitSaddle() (lazy, after the rig sets FB.BODY): the blanket height is read from the sitting pelvis; the recline bisects the
 *   hip so the upper back rests on the bolster, then the neck so the back of the head rests on it too.
 * - Knee flexion is 158 (spec 150): with the shins flat on the mat, 150° would put the sit bones 16 cm up; at 158 a normal
 *   folded blanket fits under them. Spec exit (roll to the side) is shown as a slow return to sitting; the text mentions it.
 * - Hands: world targets in every pose (beside the feet when sitting, on the mat beside the bolster when lying). */
{
const MAT = 0.012;
const G = [['kneeR', MAT], ['ankleR', MAT - 0.03]];
const BOL = { len: 0.8, r: 0.11 };
const TOP = MAT + 2 * BOL.r;
let BX0 = -0.25, BLH = 0.08, BLX = -0.2;
FB.PROPS._spineBolster = () => FB.PROPS.bolster(null, { at: [BX0 - BOL.len / 2, MAT + BOL.r, 0], axis: [1, 0, 0], length: BOL.len, r: BOL.r });
FB.PROPS._seatBlanket = () => FB.PROPS.blanket(null, { at: [BLX, MAT + BLH / 2 - 0.03, 0], size: [0.3, BLH, 0.4] });
const BASE = { knee: 158, ankle: -62, flat: false, abd: 0, hrot: -22, ground: G, handFlat: false, curl: 0.3, noAvoid: true };
const RAW = {
  sit: { ...BASE, trunk: 0, hip: 70, lumbar: -2, thoracic: 0, neck: 4, sh: 20, shAbd: 10, el: 40, palm: 'down', elbowPole: [-1, -0.3, 0.5] },
  lie: { ...BASE, trunk: 0, hip: -10, lumbar: -18, thoracic: -4, neck: 8, sh: 10, shAbd: 40, el: 8, palm: 'up', elbowPole: [-0.3, -1, 0.5] },
};
const CTX = { anchorX: ['kneeL', 'kneeR'], anchorAt: [0.3, 0] };

function fitSaddle(poses, extra) {
  const { solve, expand } = FB;
  const S = (p) => solve(expand(Object.assign({}, p, { ik: undefined })), CTX).J;
  const bis = (p, key, f, lo, hi) => { const up = f(hi) > f(lo);
    for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if ((f(m) > 0) === up) hi = m; else lo = m; } p[key] = +((lo + hi) / 2).toFixed(2); };
  const J0 = S(poses.sit);
  BLH = Math.max(0.03, J0.pelvis[1] - 0.1 - MAT + 0.03); BLX = J0.pelvis[0] - 0.03; BX0 = J0.pelvis[0] - 0.1;
  const fitLie = (p) => {
    bis(p, 'hip', (v) => S({ ...p, hip: v }).shoulderR[1] - (TOP + 0.075), -60, 60);
    bis(p, 'neck', (v) => S({ ...p, neck: v }).head[1] - (TOP + 0.1), -30, 40);
  };
  fitLie(poses.lie);
  const J1 = S(poses.lie);
  const thigh = (s) => FB.V.add(FB.V.lerp(J0['hip' + s], J0['knee' + s], 0.6), [0, 0.1, (s === 'R' ? 1 : -1) * 0.02]);   // palms on the thighs
  poses.sit.ik = { handL: { at: thigh('L') }, handR: { at: thigh('R') } };
  poses.lie.ik = { handL: { at: [J1.handL[0], MAT + 0.035, J1.handL[2]] }, handR: { at: [J1.handR[0], MAT + 0.035, J1.handR[2]] } };
  for (const [at, pose] of extra) if (pose.refit) { const m = Object.assign({}, poses[at], pose); fitLie(m); pose.hip = m.hip; pose.neck = m.neck; }
  return poses;
}

window.EXERCISE = {
  id: 'yin_saddle',
  name: { tr: 'Yin Eyer Pozu', en: 'Yin Saddle Pose', es: 'Silla de montar yin' },
  category: { tr: 'Yin Yoga · Ön bacak', en: 'Yin Yoga · Quads', es: 'Yin yoga · Cuádriceps' },
  equipmentLabel: { tr: 'Mat, bolster, battaniye', en: 'Mat, bolster, blanket', es: 'Esterilla, bolster, manta' },
  muscles: ['quads', 'core', 'tibialis'],
  tempo: '5-10-4',
  hold: true, holdDur: 3,
  view: { yaw: 90, pitch: 8 },
  alt: { yaw: 35, pitch: 20, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Dizler birleşik, sırt bolsterda', en: 'Knees together, back on the bolster', es: 'Rodillas juntas, espalda en el bolster' } },
  setupView: { yaw: 40, pitch: 18 },
  contacts: ['kneeR', 'kneeL', 'ankleR', 'ankleL'],
  props: [['mat', { at: [-0.15, 0, 0], length: 1.8, width: 0.75 }], ['_seatBlanket'], ['_spineBolster']],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fitSaddle(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'sit',
  rep: [
    { to: 'lie', dur: 4.0, phase: 0 },
    { to: 'lie', dur: 1.0, phase: 1 },
    { to: 'sit', dur: 3.5, phase: 2 },
  ],
  setup: { tr: 'Diz çök, dizler birleşik, ayaklar kalçadan geniş. Topukların arasında battaniyeye otur.',
    en: 'Kneel, knees together, feet wider than the hips. Sit on a blanket between the heels.',
    es: 'De rodillas, rodillas juntas, pies más anchos que la cadera. Siéntate en una manta entre los talones.' },
  phases: [
    { name: { tr: 'Bolstera uzan', en: 'Lie back on the bolster', es: 'Túmbate en el bolster' }, breath: 'out', slow: 1.0,
      text: { tr: 'Ellerle destek alıp yavaşça geriye in, sırtını bolstera bırak.', en: 'Lean back on the hands and slowly lower your back onto the bolster.', es: 'Apóyate en las manos y baja la espalda despacio al bolster.' } },
    { name: { tr: 'Bırak ve kal', en: 'Let go and stay', es: 'Suelta y quédate' }, breath: 'easy', line: ['kneeR', 'hipR', 'shoulderR'],
      text: { tr: 'Dizler birleşik, karna nefes al, çene yumuşak.', en: 'Knees together, breathe into the belly, soft jaw.', es: 'Rodillas juntas, respira al abdomen, mandíbula suave.' } },
    { name: { tr: 'Yavaşça çık', en: 'Come out slowly', es: 'Sal despacio' }, breath: 'in', slow: 1.0,
      text: { tr: 'Dirseklerle kalk ya da yana dön, bacakları uzat.', en: 'Press up on the elbows or roll to the side, stretch the legs.', es: 'Sube con los codos o gira de lado, estira las piernas.' } },
  ],
  tempoText: { tr: '5 sn uzan · 3-5 dk kal · 4 sn çık', en: '5 s down · stay 3-5 min · 4 s up', es: '5 s abajo · 3-5 min · 4 s arriba' },
  mistakes: [
    { title: { tr: 'Dizler açılıyor, diz zorlanıyor', en: 'Knees splay, knees strain', es: 'Rodillas abiertas y forzadas' },
      text: { tr: 'Dizler yana kayar, iç dize yük biner.', en: 'The knees slide apart and load the inner knee.', es: 'Las rodillas se separan y cargan el interior.' },
      fix: { tr: 'Daha yükseğe otur, dizler birleşik', en: 'Sit higher, knees together', es: 'Siéntate más alto, rodillas juntas' },
      fixText: { tr: 'Diz ağrısı varsa pozu bırak', en: 'If the knees hurt, skip the pose', es: 'Si duelen las rodillas, deja la postura' },
      at: 'lie', pose: { abd: 14, hrot: -8, refit: true }, view: { yaw: 20, pitch: 30 }, marks: ['kneeL', 'kneeR'], parts: ['thigh'] },
    { title: { tr: 'Bel sıkışıyor', en: 'Low back pinches', es: 'La lumbar se comprime' },
      text: { tr: 'Bel aşırı çukurlaşır, kaburgalar havaya kalkar.', en: 'The low back over-arches and the ribs flare up.', es: 'La lumbar se arquea de más y las costillas suben.' },
      fix: { tr: 'Bolsterı yükselt', en: 'Raise the bolster', es: 'Sube el bolster' },
      fixText: { tr: 'Altına blok ya da battaniye ekle, bel rahat', en: 'Add a block or blanket under it, the low back at ease', es: 'Añade un bloque o manta debajo, lumbar cómoda' },
      at: 'lie', pose: { lumbar: -40, thoracic: 6, refit: true }, line: ['pelvis', 'waist', 'neck'], parts: ['waist'] },
  ],
  cues: [{ tr: 'Sırtı desteklerle taşı', en: 'Support the back with props', es: 'Apoya la espalda con soportes' },
    { tr: 'Dizler birleşik', en: 'Knees together', es: 'Rodillas juntas' },
    { tr: 'Diz ağrısını asla zorlama', en: 'Never push through knee pain', es: 'Nunca fuerces con dolor de rodilla' }],
};
}
