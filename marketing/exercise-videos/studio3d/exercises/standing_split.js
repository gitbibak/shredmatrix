/* Standing Split (Urdhva Prasarita Eka Padasana), standing on the right leg (near the camera). Side view.
 * rest = the split itself (like warrior_3.js: the intro shows the finished shape and the mistake chapter only moves a little);
 * rep = split -> forward fold on both feet (left foot back on the mat beside the right) -> split -> hold.
 * Right foot planted + anchored; torso, standing leg and arms are the same in the fold and the split, so the palms stay on the
 * mat without any reach change. Palms: world IK targets on the mat where the straight arms reach (shoulder flexion bisected in
 * build()). Blocks (spec) are left out: the rig's deep fold reaches the floor with straight arms.
 * Mistake poses pivot about the standing hip (pos compensation) so the planted standing knee keeps its shape.
 * Spec mistake 2 (locked / hyperextended standing knee) cannot be shown: knee flexion < 0 is not supported by the rig.
 * Replaced by "back rounds, torso hangs away from the leg", the classic tight-hamstring fault. */
{
const BASE = { trunk: 158, hipR: 156, kneeR: 3, abd: 2, flatR: true, lumbar: 4, thoracic: 4, neck: 4, sh: 166, shAbd: 4, el: 2, curl: 0.1, elbowPole: [-1, 0, 0.45], noAvoid: true, pos: [0, 0, 0], ground: [['heelR', 0]] };
const RAW = {
  split: Object.assign({}, BASE, { hipL: -40, kneeL: 0, ankleL: -30, flatL: false, hrotL: 0 }),
  fold: Object.assign({}, BASE, { hipL: 156, kneeL: 3, ankleL: 0, flatL: true, hrotL: 0 }),
};
const CTX = { anchorX: ['ankleR'], anchorAt: [0, 0.1] };
function build(poses, mistakes) {
  const { solve, expand, BODY: B } = FB;
  const fk = (p) => solve(expand(Object.assign({}, p, { ik: undefined })), CTX);
  const bis = (f, lo, hi) => { let flo = f(lo); for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2, fm = f(m); if ((fm > 0) === (flo > 0)) { lo = m; flo = fm; } else hi = m; } return (lo + hi) / 2; };
  // straight arms reach the mat: shoulder flexion that puts the FK wrist at flat-hand height; palms flat just ahead of it
  const sh = bis((v) => fk(Object.assign({}, poses.split, { sh: v })).J.wristR[1] - 0.05, 110, 179);
  for (const k in poses) poses[k].sh = sh;
  const s = fk(poses.split);
  // same finger direction as the engine's flat hand (thorax 'up' projected on the floor)
  let hf = [s.F.thorax[1][0], 0, s.F.thorax[1][2]];
  if (FB.V.len(hf) < 0.3) hf = [s.F.thorax[0][0], 0, s.F.thorax[0][2]];   // engine: chest direction when the trunk is inverted
  hf = FB.V.norm(hf);
  // palms a little closer under the shoulders than the straight-arm reach (beside the foot instead of behind the heel; soft elbows)
  const P = (side) => FB.V.add([(s.J['wrist' + side][0] * 0.6 + s.J['shoulder' + side][0] * 0.4), 0, s.J['wrist' + side][2]], FB.V.mul(hf, B.hand * 0.6));
  const H = { handL: { at: P('L') }, handR: { at: P('R') } };
  for (const k in poses) Object.assign(poses[k], { ik: Object.assign({}, poses[k].ik, H), handFlat: true, handSurface: 0 });
  // foldAir: the swing foot hovers 13 cm straight above its landing spot (hip + knee of the left leg searched numerically), so it is
  // set down / lifted off vertically instead of sliding along the mat. Played as a card-less key before landing / after take-off.
  const T0 = fk(poses.fold).J.ankleL;
  let best = null;
  for (let h = 100; h <= 200; h += 0.5) for (let k = 3; k <= 90; k += 0.5) {
    const J = fk(Object.assign({}, poses.fold, { hipL: h, kneeL: k })).J.ankleL;
    const e = Math.hypot(J[0] - T0[0], J[1] - T0[1] - 0.13, J[2] - T0[2]);
    if (!best || e < best.e) best = { e, h, k };
  }
  poses.foldAir = Object.assign({}, poses.fold, { hipL: best.h, kneeL: best.k });
  for (const m of mistakes) {
    m.pose.ik = Object.assign({}, m.pose.ik, H);
    // pivot about the standing hip (the right hip stays where it is, so the planted standing leg keeps its shape)
    const q = fk(Object.assign({}, poses[m.at], m.pose, { pos: [0, 0, 0] }));
    m.pose.pos = FB.V.sub(s.J.hipR, q.J.hipR);
  }
  return poses;
}

window.EXERCISE = {
  id: 'standing_split',
  name: { tr: 'Ayakta Split (Urdhva Prasarita Eka Padasana)', en: 'Standing Split (Urdhva Prasarita Eka Padasana)', es: 'Spagat de pie' },
  category: { tr: 'Yoga · Esneme · Denge', en: 'Yoga · Stretch · Balance', es: 'Yoga · Estiramiento · Equilibrio' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['hamstrings', 'glutes', 'quads', 'core'],
  side: 'R',
  tempo: '4-8-4',
  hold: true, holdDur: 2.3,
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 160, pitch: 12, title: { tr: 'Arkadan bak', en: 'Rear view', es: 'Vista trasera' },
    text: { tr: 'Kalçalar düz, kalkan ayak yere bakar', en: 'Hips square, lifted toes point down', es: 'Cadera recta, dedos del pie elevado abajo' } },
  setupView: { yaw: 45, pitch: 14 },
  contacts: ['heelR', 'ballR', 'handR', 'handL'],
  props: [['mat', { at: [0.05, 0, 0.1], length: 1.6 }]],
  ctx: Object.assign({ plant: ['ankleR'] }, CTX),
  get poses() { return this._poses || (this._poses = build(RAW, this.mistakes)); },
  rest: 'split',
  rep: [
    { to: 'foldAir', dur: 4.0, phase: 0 },
    { to: 'fold', dur: 0.3, card: false },
    { to: 'foldAir', dur: 0.3, card: false },
    { to: 'split', dur: 4.0, phase: 1 },
    { to: 'split', dur: 1.0, phase: 2 },
  ],
  setup: { tr: 'Öne katlan, eller sağ ayağın iki yanında matta. Ağırlık sağ ayakta. Sonra taraf değiştir.',
    en: 'Fold forward, hands on the mat either side of the right foot. Weight on the right foot. Then switch sides.',
    es: 'Pliégate, manos en la esterilla a los lados del pie derecho. Peso en el pie derecho. Luego cambia de lado.' },
  phases: [
    { name: { tr: 'Öne katlan', en: 'Forward fold', es: 'Flexión adelante' }, breath: 'out', slow: 1.0,
      text: { tr: 'İki ayak yan yana, gövde bacaklara yakın, eller matta.', en: 'Feet together, torso close to the legs, hands on the mat.', es: 'Pies juntos, torso cerca de las piernas, manos en la esterilla.' } },
    { name: { tr: 'Sol bacağı kaldır', en: 'Lift the left leg', es: 'Eleva la pierna izquierda' }, breath: 'in', slow: 1.0,
      text: { tr: 'Ağırlık sağ ayakta, sol bacağı geriye ve yukarı uzat.', en: 'Weight on the right foot, reach the left leg back and up.', es: 'Peso en el pie derecho, lleva la izquierda atrás y arriba.' } },
    { name: { tr: 'Pozda kal', en: 'Hold', es: 'Mantén' }, breath: 'easy', line: ['ankleR', 'hipR', 'ankleL'],
      text: { tr: 'İki bacak uzun, kalçalar düz, gövde sağ bacağa.', en: 'Both legs long, hips square, torso toward the right leg.', es: 'Piernas largas, cadera recta, torso hacia la pierna derecha.' } },
  ],
  tempoText: { tr: '4 sn kaldır · 3-5 nefes kal · 4 sn indir', en: '4 s lift · stay 3-5 breaths · 4 s lower', es: '4 s eleva · 3-5 respiraciones · 4 s baja' },
  mistakes: [
    { title: { tr: 'Kalkan kalça açılıyor', en: 'Lifted hip opens', es: 'La cadera elevada se abre' },
      text: { tr: 'Sol kalça yana döner, ayak dışa bakar.', en: 'The left hip turns out, the foot points sideways.', es: 'La cadera izquierda gira, el pie mira al lado.' },
      fix: { tr: 'Kalçaları düz tut', en: 'Keep the hips square', es: 'Cadera recta' },
      fixText: { tr: 'Sol uyluğu içe çevir, ayak parmakları yere', en: 'Turn the left thigh in, toes point down', es: 'Gira el muslo izquierdo adentro, dedos abajo' },
      at: 'split', pose: { roll: 12, hrotL: 45, abdL: 12, twist: -8, lumbar: 10 }, view: { yaw: 160, pitch: 12 }, marks: ['hipL'], parts: ['pelvis', 'thighL'] },
    { title: { tr: 'Sırt yuvarlanıyor', en: 'Rounded back', es: 'Espalda redondeada' },
      text: { tr: 'Gövde bacaktan uzaklaşır, sırt kamburlaşır.', en: 'The torso hangs away from the leg, the back hunches.', es: 'El torso se aleja de la pierna, la espalda se curva.' },
      fix: { tr: 'Dizi hafif bük, omurgayı uzat', en: 'Soften the knee, lengthen the spine', es: 'Flexiona un poco, alarga la columna' },
      fixText: { tr: 'Göğüs uyluğa, omurga uzun', en: 'Chest toward the thigh, long spine', es: 'Pecho al muslo, columna larga' },
      at: 'split', pose: { trunk: 130, hipR: 128, lumbar: 18, thoracic: 32, neck: 6, hipL: -10, kneeL: 25 }, line: ['pelvis', 'waist', 'neck'], goodLine: ['pelvis', 'neck'], parts: ['waist', 'chest'] },
  ],
  cues: [{ tr: 'Kalçalar düz', en: 'Square the hips', es: 'Cadera recta' },
    { tr: 'Uzun omurga, uzun bacaklar', en: 'Long spine, long legs', es: 'Columna larga, piernas largas' },
    { tr: 'Duran ayağı yere bastır', en: 'Press the standing foot down', es: 'Presiona el pie de apoyo' }],
};
}
