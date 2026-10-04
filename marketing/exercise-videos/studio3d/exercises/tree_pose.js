/* Tree pose (Vrksasana): standing on the LEFT leg (spec), right sole pressed against the inner left thigh, knee open to
 * the side. Front view (yaw 0): the bent right knee opens toward the camera's left.
 * Standing leg: ctx.plant + anchor on the left ankle, single ground contact on the left heel.
 * Right foot: world IK target (ankle + foot frame) in every pose, computed once the rig has set FB.BODY (lazy `poses`):
 *   rest  = flat on the floor where FK puts it,  lift = knee up and out, foot beside the left shin (toes down),
 *   hold  = sole flat on the inner left thigh (mid-thigh, toes down), foot frame up-axis = +z so the sole faces the thigh.
 *   Mistakes with `foot` get their own target (e.g. on the side of the knee).
 * Hands stay at the heart (spec allows heart or overhead; a quick arm sweep in the mistake chapter would be > 6 cm/frame). */
{
const CTX = { anchorX: ['ankleL'], anchorAt: [0, -0.1] };
const G = [['heelL', 0]];
const HEART = { holdL: [0.16, 0.0, 0.012], holdR: [0.16, 0.0, 0.012], elbowPole: [-0.2, -1, 0.9], palm: 'in', curl: 0.05 };
const RAW = {
  start: Object.assign({ trunk: 0, hip: 0, knee: 2, abd: 2, neck: 0, kneePoleR: [0.45, 0, 1], ground: G, foot: 'floor' }, HEART),
  lift: Object.assign({ trunk: 0, hipL: 0, kneeL: 4, hipR: 60, abdR: 30, hrotR: 45, kneeR: 110, neck: 0, kneePoleR: [0.45, 0, 1], ground: G, foot: 'lift' }, HEART),
  hold: Object.assign({ trunk: 0, hipL: 0, kneeL: 4, hipR: 40, abdR: 50, hrotR: 72, kneeR: 125, neck: 0, kneePoleR: [0.45, 0, 1], ground: G, foot: 'thigh' }, HEART),
};
function rightFoot(poses, mistakes) {
  const { V, solve, expand, BODY: B } = FB;
  const fk = (p) => solve(expand(Object.assign({}, p, { ik: undefined })), CTX);
  const n = (a) => V.norm(a);
  const tgt = (p, where) => {
    const s = fk(p);
    if (where === 'floor') return { at: s.J.ankleR.slice(), foot: s.F.footR.map((c) => c.slice()) };
    const up = [0, 0, 1];                                         // sole faces the left leg
    if (where === 'lift') {                                       // toes down, foot beside the left shin, knee out
      const fw = n([0.25, -1, 0.15]), upL = n(V.sub(up, V.mul(fw, V.dot(up, fw))));
      const C = V.lerp(s.J.kneeL, s.J.ankleL, 0.4);
      return { at: V.add(C, [0.05, 0.06, 0.16]), foot: [fw, upL, V.cross(fw, upL)] };
    }
    const fw = n([0.12, -1, 0]), upT = n(V.sub(up, V.mul(fw, V.dot(up, fw))));
    const frac = where === 'knee' ? 0.97 : 0.48;
    const P = V.lerp(s.J.hipL, s.J.kneeL, frac);
    const C = V.add(P, [0.012, 0, where === 'knee' ? 0.06 : 0.07]);   // medial skin of the left thigh / knee
    return { at: V.add(V.add(C, V.mul(fw, -0.055)), V.mul(upT, B.ankleH)), foot: [fw, upT, V.cross(fw, upT)] };
  };
  for (const k in poses) poses[k].ik = Object.assign({}, poses[k].ik, { ankleR: tgt(poses[k], poses[k].foot) });
  for (const m of mistakes) if (m.foot) { const mp = Object.assign({}, poses[m.at], m.pose); m.pose.ik = Object.assign({}, m.pose.ik, { ankleR: tgt(mp, m.foot) }); }
  return poses;
}

window.EXERCISE = {
  id: 'tree_pose',
  name: { tr: 'Ağaç Pozu', en: 'Tree Pose', es: 'Postura del árbol' },
  category: { tr: 'Yoga · Denge', en: 'Yoga · Balance', es: 'Yoga · Equilibrio' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['glutes', 'quads', 'calves', 'core'],
  tempo: '4-10-3',
  hold: true, holdDur: 4,
  view: { yaw: 0, pitch: 6 },
  alt: { yaw: 90, pitch: 6, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
    text: { tr: 'Gövde dik, kalça seviyesi düz', en: 'Torso tall, hips level', es: 'Torso erguido, cadera nivelada' } },
  setupView: { yaw: 30, pitch: 12 },
  contacts: ['heelL', 'ballL'],
  props: [['mat', { at: [0.02, 0, -0.05], length: 0.75, width: 1.5 }]],
  ctx: Object.assign({ plant: ['ankleL'] }, CTX),
  get poses() { return this._poses || (this._poses = rightFoot(RAW, this.mistakes)); },
  rest: 'start',
  rep: [
    { to: 'lift', dur: 1.8, phase: 0 },
    { to: 'hold', dur: 1.8, phase: 1 },
    { to: 'hold', dur: 1.0, phase: 2 },
    { to: 'lift', dur: 1.4, phase: 3 },
    { to: 'start', dur: 1.2, phase: 3 },
  ],
  setup: { tr: 'Dik dur, eller göğüs hizasında birleşik. Sabit bir noktaya bak. Sonra taraf değiştir.',
    en: 'Stand tall, palms together at the heart. Fix your gaze on one point. Then switch sides.',
    es: 'De pie, palmas juntas al pecho. Mira un punto fijo. Luego cambia de lado.' },
  phases: [
    { name: { tr: 'Ağırlığı sola al', en: 'Shift and lift', es: 'Carga y eleva' }, breath: 'in',
      text: { tr: 'Ağırlığı sol ayağa ver, sağ dizi kaldır.', en: 'Shift onto the left foot, lift the right knee.', es: 'Carga el pie izquierdo, eleva la rodilla derecha.' } },
    { name: { tr: 'Tabanı yerleştir', en: 'Place the foot', es: 'Coloca el pie' }, breath: 'out',
      text: { tr: 'Sağ tabanı iç uyluğa koy, diz yana açılır.', en: 'Sole on the inner thigh, knee opens to the side.', es: 'Planta en el muslo interno, rodilla hacia fuera.' } },
    { name: { tr: 'Pozda kal', en: 'Hold', es: 'Mantén' }, breath: 'easy', line: ['ankleL', 'pelvis', 'neck'],
      text: { tr: 'Ayak ve uyluk birbirine bastırır, kalça düz.', en: 'Foot and thigh press together, hips level.', es: 'Pie y muslo se presionan, cadera nivelada.' } },
    { name: { tr: 'Bırak', en: 'Release', es: 'Suelta' }, breath: 'out',
      text: { tr: 'Ayağı yavaşça yere indir.', en: 'Lower the foot slowly to the floor.', es: 'Baja el pie despacio al suelo.' } },
  ],
  tempoText: { tr: '4 sn gir · 5-8 nefes kal · 3 sn çık', en: '4 s in · stay 5-8 breaths · 3 s out', es: '4 s entrar · 5-8 respiraciones · 3 s salir' },
  mistakes: [
    { title: { tr: 'Ayak dizin üstünde', en: 'Foot on the knee', es: 'Pie sobre la rodilla' },
      text: { tr: 'Taban diz ekleminin yanına basar.', en: 'The sole presses on the side of the knee.', es: 'La planta presiona el lateral de la rodilla.' },
      fix: { tr: 'Dizin üstüne ya da altına koy', en: 'Above or below the knee', es: 'Encima o debajo de la rodilla' },
      fixText: { tr: 'Taban iç uylukta ya da baldırda', en: 'Sole on the inner thigh or calf', es: 'Planta en el muslo interno o la pantorrilla' },
      at: 'hold', foot: 'knee', pose: { hipR: 30, abdR: 46, kneeR: 112 }, marks: ['kneeL'], parts: ['shinR', 'footR'] },
    { title: { tr: 'Göğüs çöküyor', en: 'Chest collapses', es: 'El pecho se hunde' },
      text: { tr: 'Sırt yuvarlanır, omuzlar öne düşer.', en: 'The back rounds, shoulders drop forward.', es: 'La espalda se redondea, hombros adelante.' },
      fix: { tr: 'Göğüs kemiğini kaldır', en: 'Lift the sternum', es: 'Eleva el esternón' },
      fixText: { tr: 'Başın tepesi yukarı uzar', en: 'Crown of the head reaches up', es: 'La coronilla crece hacia arriba' },
      at: 'hold', pose: { thoracic: 16, lumbar: 3, neck: 10, trunk: -2, protract: 0.03 }, view: { yaw: 90, pitch: 6 }, line: ['pelvis', 'waist', 'neck'], goodLine: ['pelvis', 'neck'], parts: ['chest', 'waist'] },
  ],
  cues: [{ tr: 'Ayak uyluğa, uyluk ayağa', en: 'Foot into thigh, thigh into foot', es: 'Pie al muslo, muslo al pie' },
    { tr: 'Kalça düz', en: 'Level hips', es: 'Cadera nivelada' },
    { tr: 'Bakış sabit', en: 'Steady gaze', es: 'Mirada fija' }],
};
}
