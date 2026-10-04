/* Dancer pose (Natarajasana), standing on the right leg (near the camera), left hand holding the inside of the left foot.
 * Side view. Pelvis tilt (`trunk`) lifts the back thigh; the standing hip gets the same flexion so the standing leg stays
 * vertical (hipR = trunk), and the lumbar/thoracic backbend brings the chest up (measured trunk ~35). rest = the pose itself; rep = hold -> prep (upright, heel to buttock, hand on the foot) -> hold -> hold.
 * Right foot: ctx.plant + anchor, ground = right heel. Left hand: world IK target on the inner left ankle/instep, computed
 * per pose from the FK left foot (lazy `poses`), so the hand stays on the foot through every transition and mistake.
 * Left elbow pole points back and slightly down/in (shoulder externally rotated, elbow toward the floor-back); the mistake
 * "turned hand" swings the elbow out to the side. */
{
const CTX = { anchorX: ['ankleR'], anchorAt: [0, 0.1] };
const G = [['heelR', 0]];
const ARML = { elbowPoleL: [-1, -0.6, 0.1], palmL: 'in', curlL: 0.85, noAvoid: true };
const RAW = {
  hold: Object.assign({ trunk: 60, lumbar: -18, thoracic: -14, neck: -16, hipR: 60, kneeR: 6, hipL: -28, kneeL: 112, ankleL: -30, flatL: false, abd: 2, abdL: 4,
    shR: 92, shAbdR: 6, elR: 3, palmR: 'down', curlR: 0.1, ground: G }, ARML),
  prep: Object.assign({ trunk: 6, lumbar: -4, thoracic: 0, neck: 0, hipR: 8, kneeR: 4, hipL: 0, kneeL: 128, ankleL: -30, flatL: false, abd: 2, abdL: 3,
    shR: 92, shAbdR: 4, elR: 3, palmR: 'down', curlR: 0.1, ground: G }, ARML),
};
function leftHand(poses, mistakes) {
  const { V, solve, expand } = FB;
  const fk = (p) => solve(expand(Object.assign({}, p, { ik: undefined })), CTX);
  const tgt = (p) => { const s = fk(p); const F = s.F.footL; return { at: V.add(V.add(s.J.ankleL, V.mul(F[0], 0.05)), V.mul(F[2], 0.045)) }; };
  for (const k in poses) poses[k].ik = Object.assign({}, poses[k].ik, { handL: tgt(poses[k]) });
  for (const m of mistakes) { const mp = Object.assign({}, poses[m.at], m.pose); m.pose.ik = Object.assign({}, m.pose.ik, { handL: tgt(mp) }); }
  return poses;
}

window.EXERCISE = {
  id: 'dancer_pose',
  name: { tr: 'Dansçı Pozu', en: 'Dancer Pose', es: 'Postura del bailarín' },
  category: { tr: 'Yoga · Denge · Esneme', en: 'Yoga · Balance · Backbend', es: 'Yoga · Equilibrio · Extensión' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['glutes', 'quads', 'lowerback', 'delts'],
  tempo: '4-8-3',
  hold: true, holdDur: 4,
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 20, pitch: 8, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Kalça düz, duran ayak sabit', en: 'Hips level, standing foot rooted', es: 'Cadera nivelada, pie de apoyo firme' } },
  setupView: { yaw: 40, pitch: 12 },
  contacts: ['heelR', 'ballR'],
  props: [['mat', { at: [0, 0, 0.05], length: 1.9 }]],
  ctx: Object.assign({ plant: ['ankleR'] }, CTX),
  get poses() { return this._poses || (this._poses = leftHand(RAW, this.mistakes)); },
  rest: 'hold',
  rep: [
    { to: 'prep', dur: 4.0, phase: 0 },
    { to: 'hold', dur: 4.0, phase: 1 },
    { to: 'hold', dur: 1.0, phase: 2 },
  ],
  setup: { tr: 'Sağ ayak sabit, sol el sol ayağın iç kenarını tutar. Sonra taraf değiştir.',
    en: 'Right foot rooted, left hand holds the inside of the left foot. Then switch sides.',
    es: 'Pie derecho firme, mano izquierda sujeta el interior del pie izquierdo.' },
  phases: [
    { name: { tr: 'Ayağı tut', en: 'Catch the foot', es: 'Toma el pie' }, breath: 'in', slow: 1.0,
      text: { tr: 'Nefes al, sol topuk kalçaya, sağ kol öne uzanır.', en: 'Inhale, left heel to the buttock, right arm reaches forward.', es: 'Inhala, talón a la nalga, brazo derecho adelante.' } },
    { name: { tr: 'Ayağı ele it', en: 'Kick into the hand', es: 'Empuja el pie' }, breath: 'out', slow: 1.0,
      text: { tr: 'Nefes vererek ayağı ele it, göğüs öne ve yukarı.', en: 'Exhale, kick the foot into the hand, chest forward and up.', es: 'Exhala, empuja el pie a la mano, pecho adelante.' } },
    { name: { tr: 'Pozda kal', en: 'Hold', es: 'Mantén' }, breath: 'easy', line: ['handR', 'shoulderR'],
      text: { tr: 'Kalça düz, duran diz yumuşak, bakış sabit.', en: 'Hips level, standing knee soft, steady gaze.', es: 'Cadera nivelada, rodilla suave, mirada fija.' } },
  ],
  tempoText: { tr: '4 sn gir · 3-5 nefes kal', en: '4 s in · stay 3-5 breaths', es: '4 s entrar · 3-5 respiraciones' },
  mistakes: [
    { title: { tr: 'Bel sıkışıyor', en: 'Low back crunches', es: 'La zona lumbar se comprime' },
      text: { tr: 'Kalça öne kayar, bel aşırı çukurlaşır.', en: 'Pelvis tips forward, the low back over-arches.', es: 'La pelvis cae adelante, la lumbar se arquea.' },
      fix: { tr: 'Kuyruk sokumu hafif aşağı', en: 'Tailbone slightly down', es: 'Coxis un poco abajo' },
      fixText: { tr: 'Esneme göğüsten gelir, bel uzun', en: 'Lift from the chest, keep the low back long', es: 'Abre el pecho, lumbar larga' },
      at: 'hold', pose: { trunk: 46, hipR: 46, lumbar: -34, thoracic: -6, hipL: -24, neck: -18 }, line: ['pelvis', 'waist', 'neck'], parts: ['waist', 'pelvis'] },
    { title: { tr: 'Dirsek yana açılıyor', en: 'Elbow points out', es: 'El codo se abre' },
      text: { tr: 'El ters döner, omuz öne kapanır.', en: 'The hand turns, the shoulder rolls forward.', es: 'La mano gira, el hombro cae adelante.' },
      fix: { tr: 'Omzu dışa çevir', en: 'Rotate the shoulder out', es: 'Rota el hombro hacia fuera' },
      fixText: { tr: 'Dirsek geriye bakar, göğüs açık', en: 'Elbow points back, chest open', es: 'Codo atrás, pecho abierto' },
      at: 'hold', pose: { elbowPoleL: [0.1, -0.2, 1], twist: 10 }, view: { yaw: 150, pitch: 14 }, marks: ['elbowL'], parts: ['upperL', 'foreL'] },
  ],
  cues: [{ tr: 'Ayağı ele it', en: 'Kick the foot into the hand', es: 'Empuja el pie a la mano' },
    { tr: 'Göğsü kaldır', en: 'Lift the chest', es: 'Eleva el pecho' },
    { tr: 'Duran ayak sabit', en: 'Ground the standing foot', es: 'Pie de apoyo firme' }],
};
}
