/* Eagle pose (Garudasana): standing on the LEFT leg (spec: right leg wraps over the left), front view.
 * rest = the pose itself; rep = hold -> stand (palms at the heart) -> hold -> hold. A standing rest would make the mistake
 * chapter's ~1 s rest <-> pose jumps unwrap the arms and legs faster than the qa limb limit.
 * Left foot: ctx.plant + anchor, ground = left heel. Right foot: world IK target (ankle + foot frame) per pose: stand = its
 * FK spot on the floor, hold = hooked behind the left calf (toes pointing down/back). Right knee pole forward + inward so
 * the right thigh crosses over the left.
 * Arms: hold targets in the thorax frame; hands meet in front of the face, right elbow under the left (elbow poles), elbows at
 * shoulder height. The engine has no forearm-wrap: forearms cross at the elbows and the palms meet, which reads as eagle arms
 * from the front (limitation: no true double wrap). */
{
const CTX = { anchorX: ['ankleL'], anchorAt: [0, -0.06] };
const G = [['heelL', 0]];
const ARMS = { holdR: [0.35, 0.39, 0.0], holdL: [0.36, 0.41, 0.0], elbowPoleR: [0.7, -0.6, -0.75], elbowPoleL: [0.7, -0.35, -0.6], palm: 'in', curl: 0.05, noAvoid: true };
const HEART = { holdR: [0.16, 0.0, 0.012], holdL: [0.16, 0.0, 0.012], elbowPoleR: [-0.2, -1, 0.9], elbowPoleL: [-0.2, -1, 0.9], palm: 'in', curl: 0.05, noAvoid: true };
const RAW = {
  hold: Object.assign({ trunk: 12, hipL: 62, kneeL: 62, hipR: 82, abdR: -28, hrotR: -6, kneeR: 105, thoracic: 8, neck: -8, kneePoleR: [1, 0, -0.45], ground: G, foot: 'calf' }, ARMS),
  stand: Object.assign({ trunk: 0, hip: 2, knee: 3, abd: 2, neck: 0, kneePoleR: [1, 0, -0.45], ground: G, foot: 'floor' }, HEART),
};
function rightFoot(poses, mistakes) {
  const { V, solve, expand, BODY: B } = FB;
  const fk = (p) => solve(expand(Object.assign({}, p, { ik: undefined })), CTX);
  const tgt = (p, where) => {
    const s = fk(p);
    if (where === 'floor') return { at: s.J.ankleR.slice(), foot: s.F.footR.map((c) => c.slice()) };
    // behind the left calf: toes point down and back, the instep hugs the calf
    const fw = V.norm([-0.35, -1, -0.15]), up = V.norm(V.sub([1, 0, 0], V.mul(fw, V.dot([1, 0, 0], fw))));
    const C = V.add(V.lerp(s.J.kneeL, s.J.ankleL, 0.5), [-0.085, 0, -0.01]);
    return { at: V.add(C, V.mul(fw, -0.07)), foot: [fw, up, V.cross(fw, up)] };
  };
  for (const k in poses) poses[k].ik = Object.assign({}, poses[k].ik, { ankleR: tgt(poses[k], poses[k].foot) });
  for (const m of mistakes) { const mp = Object.assign({}, poses[m.at], m.pose); m.pose.ik = Object.assign({}, m.pose.ik, { ankleR: tgt(mp, 'calf') }); }
  return poses;
}

window.EXERCISE = {
  id: 'eagle_pose',
  name: { tr: 'Kartal Pozu', en: 'Eagle Pose', es: 'Postura del águila' },
  category: { tr: 'Yoga · Denge', en: 'Yoga · Balance', es: 'Yoga · Equilibrio' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['quads', 'glutes', 'upperback', 'delts'],
  tempo: '5-10-3',
  hold: true, holdDur: 3,
  view: { yaw: 0, pitch: 6 },
  alt: { yaw: 70, pitch: 8, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
    text: { tr: 'Kalça geride, gövde dik', en: 'Hips back, torso upright', es: 'Cadera atrás, torso erguido' } },
  setupView: { yaw: 30, pitch: 12 },
  contacts: ['heelL', 'ballL'],
  props: [['mat', { at: [0.02, 0, -0.05], length: 0.75, width: 1.5 }]],
  ctx: Object.assign({ plant: ['ankleL'] }, CTX),
  get poses() { return this._poses || (this._poses = rightFoot(RAW, this.mistakes)); },
  rest: 'hold',
  rep: [
    { to: 'stand', dur: 3.5, phase: 0 },
    { to: 'hold', dur: 4.5, phase: 1 },
    { to: 'hold', dur: 1.0, phase: 2 },
  ],
  setup: { tr: 'Sol ayak sabit, dizler bükülü. Sağ bacak solun üstünden sarılır. Sonra taraf değiştir.',
    en: 'Left foot rooted, knees bent. The right leg wraps over the left. Then switch sides.',
    es: 'Pie izquierdo firme, rodillas flexionadas. La pierna derecha envuelve la izquierda.' },
  phases: [
    { name: { tr: 'Dik dur', en: 'Stand tall', es: 'De pie' }, breath: 'in', slow: 1.0,
      text: { tr: 'Nefes al, avuçlar göğüste birleşik.', en: 'Inhale, palms together at the heart.', es: 'Inhala, palmas juntas al pecho.' } },
    { name: { tr: 'Otur ve sarıl', en: 'Sit and wrap', es: 'Siéntate y envuelve' }, breath: 'out', slow: 1.0,
      text: { tr: 'Dizleri bük, sağ bacağı sola sar. Sağ dirsek solun altında.', en: 'Bend the knees, wrap right leg over left. Right elbow under left.', es: 'Flexiona, envuelve la pierna derecha. Codo derecho bajo el izquierdo.' } },
    { name: { tr: 'Pozda kal', en: 'Hold', es: 'Mantén' }, breath: 'easy',
      text: { tr: 'Dirsekler omuz hizasında, kalça geride, bakış sabit.', en: 'Elbows at shoulder height, hips back, steady gaze.', es: 'Codos a la altura de hombros, cadera atrás.' } },
  ],
  tempoText: { tr: '5 sn gir · 5 nefes kal', en: '5 s in · stay 5 breaths', es: '5 s entrar · 5 respiraciones' },
  mistakes: [
    { title: { tr: 'Dirsekler düşüyor', en: 'Elbows drop', es: 'Los codos caen' },
      text: { tr: 'Dirsekler omuzların altına iner.', en: 'The elbows sink below the shoulders.', es: 'Los codos bajan de los hombros.' },
      fix: { tr: 'Dirsekleri omuz hizasına kaldır', en: 'Lift the elbows to shoulder height', es: 'Sube los codos a la altura de hombros' },
      fixText: { tr: 'Parmaklar tavana, omuzlar geniş', en: 'Fingers to the ceiling, shoulders wide', es: 'Dedos al techo, hombros anchos' },
      at: 'hold', pose: { holdR: [0.23, 0.14, -0.02], holdL: [0.25, 0.17, -0.025], elbowPoleR: [0.5, -1, 0.05], elbowPoleL: [0.6, -0.8, 0.2], thoracic: 14, neck: 4 }, marks: ['elbowR', 'elbowL'], parts: ['upperR', 'upperL'] },
    { title: { tr: 'Duran diz içe kaçıyor', en: 'Standing knee caves in', es: 'La rodilla de apoyo cae' },
      text: { tr: 'Sol diz orta hatta doğru kayar.', en: 'The left knee drifts toward the midline.', es: 'La rodilla izquierda se va al centro.' },
      fix: { tr: 'Dizi ayak ucu yönüne it', en: 'Knee over the toes', es: 'Rodilla sobre el pie' },
      fixText: { tr: 'Sol diz 2. parmak hizasında', en: 'Left knee over the 2nd toe', es: 'Rodilla izquierda sobre el 2.º dedo' },
      at: 'hold', pose: { abdL: -9, hrotL: -12 }, view: { yaw: 10, pitch: 8 }, marks: ['kneeL'], parts: ['thighL', 'shinL'] },
  ],
  cues: [{ tr: 'Sandalyeye oturur gibi', en: 'Sit low like a chair', es: 'Siéntate como en una silla' },
    { tr: 'Dirsekler yukarı', en: 'Elbows lifted', es: 'Codos arriba' },
    { tr: 'Bakış sabit', en: 'Fix the gaze', es: 'Mirada fija' }],
};
}
