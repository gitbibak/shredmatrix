/* Triangle pose (Trikonasana), right side. Front view, stance along the character's z axis (like warrior_2.js).
 * rest = the pose itself (intro shows the finished triangle); the rep goes hold -> wide stance -> hold. With the stance as rest,
 * the mistake chapter's 0.9-1.2 s rest <-> pose jumps moved the hands > 6 cm/frame (qa limb-jump fail). Both feet stay planted.
 * Feet: back-foot spot = stance pose (front leg abducted 34° with 90° turn-out, straight left leg abducted until the flat
 * foot is on the mat, turned in 15°); ctx.plant = both ankles. Every pose re-fits the front-leg abduction (FK bisection,
 * straight knee) so the straight back leg exactly reaches its planted ankle -> the pelvis drops naturally as the body tips.
 * Side bend = `roll` (pelvis + trunk tip toward the front leg) + `side` (spine), arms keep their T line so the right hand
 * lands on the shin and the left arm points up. Spec lateral flexion 75 ~ roll -40 + side -34 (NOTE: in core.js roll/side + tip toward the character's LEFT (-z), opposite to the AUTHORING table).
 * Spec mistake 2 (front-knee hyperextension) cannot be shown: planted IK legs cap at straight (no hyperextension, and
 * AUTHORING forbids faking it with a pole). Replaced by "chest turns to the floor", the other classic triangle fault. */
{
const CTX = { anchorX: ['ankleR'], anchorAt: [0, 0.6] };
const G = [['heelR', 0]];
const LEGS = { kneePoleR: [0, 0, 1], hrotR: 90, hipL: 0, kneeR: 0, kneeL: 0, flatL: true, footOutL: -15, ground: G };
const RAW = {
  stance: Object.assign({ trunk: 0, abdR: 34, neck: 0, headTurn: -25, shAbd: 90, el: 2, palm: 'down', curl: 0.1 }, LEGS),
  hold: Object.assign({ trunk: 0, roll: -40, side: -34, fit: true, neck: 0, headTurn: 55, shAbdR: 82, shAbdL: 96, el: 2, palmR: 'back', palmL: 'forward', curl: 0.1 }, LEGS),
};
function stanceFeet(poses, mistakes) {
  const { V, solve, expand, BODY: B } = FB;
  const fk = (p) => solve(expand(Object.assign({}, p, { ik: undefined })), CTX);
  const bis = (f, lo, hi) => { let flo = f(lo); for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2, fm = f(m); if ((fm > 0) === (flo > 0)) { lo = m; flo = fm; } else hi = m; } return (lo + hi) / 2; };
  poses.stance.abdL = bis((a) => fk(Object.assign({}, poses.stance, { abdL: a })).J.ankleL[1] - B.ankleH, 0, 85);
  const s = fk(poses.stance);
  const BACK = { at: s.J.ankleL.slice(), foot: [s.F.footL[0].slice(), s.F.footL[1].slice(), s.F.footL[2].slice()] };
  const L = (B.thigh + B.shin) * 0.9996;
  const pin = (p) => {
    if (p.fit) p.abdR = bis((a) => V.len(V.sub(fk(Object.assign({}, p, { abdR: a })).J.hipL, BACK.at)) - L, 0, 130);
    const q = fk(p), d = V.sub(BACK.at, q.J.hipL), P = q.F.pelvis;
    p.abdL = Math.atan2(-V.dot(d, P[2]), -V.dot(d, P[1])) * 180 / Math.PI;
    p.hipL = Math.atan2(V.dot(d, P[0]), -V.dot(d, P[1])) * 180 / Math.PI;
    p.ik = Object.assign({}, p.ik, { ankleL: BACK });
    return p;
  };
  for (const k in poses) pin(poses[k]);
  for (const m of mistakes) {
    const mp = pin(Object.assign({}, poses[m.at], m.pose));
    for (const k of ['abdR', 'abdL', 'hipL', 'ik']) m.pose[k] = mp[k];
  }
  return poses;
}

window.EXERCISE = {
  id: 'triangle_pose',
  name: { tr: 'Üçgen Pozu', en: 'Triangle Pose', es: 'Postura del triángulo' },
  category: { tr: 'Yoga · Yan esneme', en: 'Yoga · Side stretch', es: 'Yoga · Estiramiento lateral' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['obliques', 'glutes', 'hamstrings', 'adductors'],
  tempo: '4-10-4',
  hold: true, holdDur: 4,
  view: { yaw: 0, pitch: 6 },
  alt: { yaw: 60, pitch: 10, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Göğüs öne açık, iki bacak düz', en: 'Chest open, both legs straight', es: 'Pecho abierto, piernas rectas' } },
  setupView: { yaw: 30, pitch: 16 },
  setupMarks: [{ type: 'span', joints: ['ankleL', 'ankleR'], label: { tr: 'Geniş duruş', en: 'Wide stance', es: 'Postura amplia' } }],
  contacts: ['heelR', 'ballR', 'heelL', 'ballL'],
  props: [['mat', { at: [0.02, 0, 0.0], length: 0.75, width: 1.9 }]],
  ctx: Object.assign({ plant: ['ankleL', 'ankleR'] }, CTX),
  get poses() { return this._poses || (this._poses = stanceFeet(RAW, this.mistakes)); },
  rest: 'hold',
  rep: [
    { to: 'stance', dur: 3.5, phase: 0 },
    { to: 'hold', dur: 4.0, phase: 1 },
    { to: 'hold', dur: 1.0, phase: 2 },
  ],
  setup: { tr: 'Ayaklar geniş, bacaklar düz. Sağ ayak 90° dışa, sol ayak hafif içe. Sonra taraf değiştir.',
    en: 'Wide stance, legs straight. Right foot out 90°, left foot slightly in. Then switch sides.',
    es: 'Pies abiertos, piernas rectas. Pie derecho a 90°, izquierdo hacia dentro. Luego cambia de lado.' },
  phases: [
    { name: { tr: 'Geniş duruş', en: 'Wide stance', es: 'Postura amplia' }, breath: 'in', slow: 1.0,
      text: { tr: 'Dik dur, kollar omuz hizasında yana açık.', en: 'Stand tall, arms out at shoulder height.', es: 'De pie, brazos abiertos a la altura de hombros.' } },
    { name: { tr: 'Uzan ve in', en: 'Reach and tilt', es: 'Alarga e inclina' }, breath: 'out', slow: 1.1,
      text: { tr: 'Nefes vererek sağa uzan, sağ eli kaval kemiğine indir.', en: 'Exhale, reach right and lower the right hand to the shin.', es: 'Exhala, alarga a la derecha y baja la mano a la espinilla.' } },
    { name: { tr: 'Pozda kal', en: 'Hold', es: 'Mantén' }, breath: 'easy', line: ['handR', 'shoulderR', 'shoulderL', 'handL'],
      text: { tr: 'Kollar tek çizgi, göğüs açık, yan bel uzun.', en: 'Arms in one line, chest open, side body long.', es: 'Brazos en línea, pecho abierto, costado largo.' } },
  ],
  tempoText: { tr: '4 sn in · 5 nefes kal · nefes alarak kalk', en: '4 s down · stay 5 breaths · inhale to rise', es: '4 s bajar · 5 respiraciones · inhala y sube' },
  mistakes: [
    { title: { tr: 'Kalça geride kalıyor', en: 'Hips shift back', es: 'La cadera se va atrás' },
      text: { tr: 'Kalça bacakların arkasına kaçar, gövde öne düşer.', en: 'Hips drift behind the legs, the torso falls forward.', es: 'La cadera queda detrás, el torso cae adelante.' },
      fix: { tr: 'Kalçayı bacakların üstüne diz', en: 'Stack the hips over the legs', es: 'Cadera sobre las piernas' },
      fixText: { tr: 'Gövde bacaklarla aynı düzlemde', en: 'Torso in the same plane as the legs', es: 'Torso en el plano de las piernas' },
      at: 'hold', pose: { trunk: 30, roll: -32 }, view: { yaw: 60, pitch: 10 }, marks: ['pelvis'], parts: ['pelvis', 'waist'] },
    { title: { tr: 'Göğüs yere dönüyor', en: 'Chest turns to the floor', es: 'El pecho mira al suelo' },
      text: { tr: 'Göğüs kapanır, üst kol öne düşer.', en: 'The chest closes, the top arm drops forward.', es: 'El pecho se cierra, el brazo cae adelante.' },
      fix: { tr: 'Üst kaburgaları yukarı çevir', en: 'Roll the top ribs up', es: 'Gira las costillas hacia arriba' },
      fixText: { tr: 'Göğüs öne bakar, üst kol tavana', en: 'Chest faces forward, top arm to the ceiling', es: 'Pecho al frente, brazo hacia el techo' },
      at: 'hold', pose: { twist: -32, headTurn: 20, neck: 10 }, view: { yaw: 25, pitch: 10 }, marks: ['shoulderL'], parts: ['chest', 'upperL'] },
  ],
  cues: [{ tr: 'Yan bel uzun', en: 'Long side body', es: 'Costado largo' },
    { tr: 'Göğüs açık', en: 'Open chest', es: 'Pecho abierto' },
    { tr: 'Bacaklar aktif ve düz', en: 'Legs engaged and straight', es: 'Piernas activas y rectas' }],
};
}
