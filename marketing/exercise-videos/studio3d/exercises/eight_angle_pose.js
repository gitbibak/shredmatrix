/* Eight-Angle Pose (Astavakrasana) - PREP VERSION (spec app name "Eight Angle Pose Prep"), legs to the RIGHT, right arm
 * between the legs. Front three-quarter view, side view in the tempo chapter.
 * Why the prep version: in the full pose the right upper arm is squeezed between the thighs (right thigh on top, left thigh
 * under it) with both legs straight and the ankles crossed. With this rig (hip joints 19 cm apart, thighs ~9 cm radius, upper
 * arm ~5 cm) the two thigh axes would need >= 26 cm of clearance at the arm and still converge at the ankles: impossible
 * without the thighs passing through the arm (checked numerically). So the legs stay bent (knees ~70-80) and the LEFT SHIN,
 * not the thigh, passes under the right upper arm in front of the right forearm; the hold card says so.
 * Built like crow_pose.js / firefly_pose.js: pelvis placed directly (ground 'pelvis' + pos), palms = two fixed world spots in
 * every pose, ankles pinned at their FK place in every pose (they blend in world space, planted feet do not slide), knee IK
 * pole = the FK knee direction. All pose numbers (P below) come from an offline numeric solve (scratch tools, not shipped):
 *   - capsule model of thighs/shins/feet/arms/hands + elliptic torso, no pair closer than ~1 cm except the intended contacts
 *     (right thigh resting on the back of the right upper arm, left ankle resting on the right shin),
 *   - hold: right thigh crosses ABOVE the right upper arm (35 % up from the elbow), left leg passes UNDER it, ankles crossed
 *     left over right outside the right arm, feet >= 10 cm up, elbows ~68, head up (neck -50), centre of mass over the palms,
 *   - set-up (rest): low crouch, both feet on the mat, right thigh hooked on the right arm, left foot beside the right foot in
 *     front of the right hand; optimised so that the DIRECT (engine Hermite) blend to the hold and to both mistake poses
 *     stays collision free and the feet lift without sliding (the mistake chapter blends rest <-> hold/mistake directly),
 *   - verified on the skinned mesh over the whole timeline (per-vertex test against per-bone radial profiles).
 * Spec notes: start is a low crouch (hips ~24 cm up) instead of sitting, so the weight shift onto the hands is believable;
 *   hold trunk reads ~100 (hips slightly higher than the shoulders), elbows ~68 (spec 90), knees ~70-80 (spec 0). */
{
const MAT = 0.012;
const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };
const POLE = [0.15, -1, 0.35];
const ARM = { elbowPole: POLE, curl: 0.05, handFlat: true, handSurface: MAT, shAbd: 4, sh: 40, el: 60, noAvoid: true, kneePole: [0.2, 1, 0], ankle: 12, flat: false };
const KEYS = ['yaw', 'roll', 'trunk', 'twist', 'side', 'lumbar', 'thoracic', 'hipR', 'abdR', 'hipL', 'abdL', 'kneeR', 'kneeL', 'hrotR', 'hrotL'];
const P = {"hands":[-0.114,-0.213,-0.088,-0.698],"poses":{"prep":{"x":[-0.294,0.238,-0.327,3.87,26.654,-18.58,37.245,-28.603,30.294,41.012,83.739,49.715,73.136,-2.998,115.504,114.008,47.946,44.642],"extra":{"neck":-25}},"hold":{"x":[0.051,0.396,-0.589,34.904,50.134,95.463,51.602,-32.399,3.37,30.942,115.765,31.779,111.904,-14.137,66.081,74.881,25.286,45.536],"extra":{"neck":-50}}},"mist":{"low":[0.064,0.379,-0.513,40.115,43.29,74.843,54.036,-30.44,18.953,29.89,86.009,34.265,90.337,-16.283,77.393,88.676,25.075,37.811],"bent":[0.09,0.395,-0.522,37.699,40.52,81.476,46.514,-32.45,21.079,29.869,101.709,41.456,92.311,-14.57,88.572,85.77,26.514,40.627]}};
const RAW = {};
for (const n in P.poses) { const x = P.poses[n].x, p = Object.assign({}, ARM, P.poses[n].extra || {}); KEYS.forEach((k, i) => { p[k] = x[3 + i]; }); p._X = x.slice(0, 3); RAW[n] = p; }
function build(poses, mistakes) {
  const { V, solve, expand } = FB;
  const H = { handR: { at: [P.hands[0], MAT, P.hands[1]] }, handL: { at: [P.hands[2], MAT, P.hands[3]] } };
  const frame = (F) => ({ 0: F[0].slice(), 1: F[1].slice(), 2: F[2].slice() });
  // pelvis placed directly; palms = fixed world spots; ankles pinned at their FK place (so they blend in world space and
  // planted feet never slide), knee IK pole = the FK knee direction (pelvis frame)
  const place = (p) => { const X = p._X; delete p._X; p.ground = [['pelvis', X[1] - FB.CLEAR.pelvis]]; p.pos = [X[0], 0, X[2]]; p.ik = Object.assign({}, H);
    const q = solve(expand(p), CTX), J = q.J, Pf = q.F.pelvis;
    for (const s of ['L', 'R']) { const sg = s === 'R' ? 1 : -1; let d = V.sub(J['knee' + s], V.lerp(J['hip' + s], J['ankle' + s], 0.5));
      d = V.len(d) < 0.01 ? q.F['thigh' + s][0] : V.norm(d); p['kneePole' + s] = [V.dot(d, Pf[0]), V.dot(d, Pf[1]), sg * V.dot(d, Pf[2])];
      p.ik['ankle' + s] = { at: J['ankle' + s].slice(), foot: frame(q.F['foot' + s]) }; } };
  for (const n in poses) place(poses[n]);
  for (const m of mistakes) { const x = P.mist[m.key], p = m.pose; Object.assign(p, ARM, P.poses.hold.extra || {}); KEYS.forEach((k, i) => { p[k] = x[3 + i]; }); p._X = x.slice(0, 3); place(p); }
  return poses;
}
window.EXERCISE = {
  id: 'eight_angle_pose',
  name: { tr: 'Sekiz Açı Pozu (Astavakrasana)', en: 'Eight-Angle Pose (Astavakrasana)', es: 'Postura de los ocho ángulos' },
  category: { tr: 'Yoga · Kol dengesi · Dönüş', en: 'Yoga · Arm balance · Twist', es: 'Yoga · Equilibrio · Torsión' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['triceps', 'obliques', 'core', 'chest', 'adductors'],
  side: 'R',
  tempo: '4-6-3',
  hold: true, holdDur: 3,
  view: { yaw: 35, pitch: 14 },
  alt: { yaw: 90, pitch: 6, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
    text: { tr: 'Dirsekler bükülü, göğüs öne, ayaklar havada', en: 'Elbows bent, chest forward, feet in the air', es: 'Codos flexionados, pecho al frente, pies arriba' } },
  contacts: ['handR', 'handL', 'pelvis'],
  props: [['mat', { at: [0.07, 0, -0.22], length: 1.5, width: 1.2 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = build(RAW, this.mistakes)); },
  rest: 'prep',
  rep: [
    { to: 'hold', dur: 4.0, phase: 0 },
    { to: 'hold', dur: 1.0, phase: 1 },
    { to: 'prep', dur: 3.0, phase: 2 },
  ],






  setup: { tr: 'Hazırlık versiyonu: sağ uyluk sağ üst kolda, sol ayak sağ ayağın yanında. Sonra taraf değiştir.',
    en: 'Prep version: right thigh on the right upper arm, left foot by the right. Then switch sides.',
    es: 'Versión previa: muslo derecho sobre el brazo, pie izquierdo junto al derecho. Luego cambia.' },
  phases: [
    { name: { tr: 'Ayakları kaldır', en: 'Lift the feet', es: 'Eleva los pies' }, breath: 'out', slow: 1.0,
      text: { tr: 'Öne eğil, ayakları kaldır, bilekleri çaprazla: sol üstte.', en: 'Lean forward, lift the feet, cross the ankles: left on top.', es: 'Inclínate, eleva los pies y cruza los tobillos: izquierdo arriba.' } },
    { name: { tr: 'Pozda kal', en: 'Hold', es: 'Mantén' }, breath: 'easy', arc: ['shoulderR', 'elbowR', 'wristR'],
      text: { tr: 'Hazırlık versiyonu: dizler bükülü. Tam pozda bacaklar sağa düzleşir.', en: 'Prep version: knees bent. In the full pose the legs straighten to the right.', es: 'Versión previa: rodillas flexionadas. En la completa se estiran.' } },
    { name: { tr: 'İn', en: 'Come down', es: 'Baja' }, breath: 'out', slow: 1.0,
      text: { tr: 'Ayakları yere indir, kalçayı geri al.', en: 'Lower the feet to the mat, sit the hips back.', es: 'Baja los pies y lleva la cadera atrás.' } },
  ],
  tempoText: { tr: '4 sn gir · 3-5 nefes kal · 3 sn in', en: '4 s in · stay 3-5 breaths · 3 s down', es: '4 s entrar · 3-5 respiraciones · 3 s bajar' },
  mistakes: [
    { key: 'low', title: { tr: 'Uyluk kolda çok aşağıda', en: 'Thigh too low on the arm', es: 'Muslo muy bajo en el brazo' },
      text: { tr: 'Bacak koldan kayar, kalça düşer.', en: 'The leg slips and the hips drop.', es: 'La pierna resbala y la cadera cae.' },
      fix: { tr: 'Uyluğu omza yakın as', en: 'Hook the thigh near the shoulder', es: 'Engancha el muslo cerca del hombro' },
      fixText: { tr: 'Uyluk üst kolda yüksek', en: 'Thigh high on the upper arm', es: 'Muslo alto en el brazo' },
      at: 'hold', pose: {}, marks: ['hipR', 'elbowR'], parts: ['thighR', 'upperR'] },
    { key: 'bent', title: { tr: 'Bacaklar sarkıyor', en: 'Legs sag', es: 'Las piernas caen' },
      text: { tr: 'Dizler fazla bükülür, ayaklar yere düşer.', en: 'The knees bend more and the feet drop toward the mat.', es: 'Las rodillas se doblan más y los pies caen.' },
      fix: { tr: 'Bacakları kaldır ve sık', en: 'Lift and squeeze the legs', es: 'Eleva y aprieta las piernas' },
      fixText: { tr: 'Ayaklar yukarıda, bilekler çapraz', en: 'Feet up, ankles crossed', es: 'Pies arriba, tobillos cruzados' },
      at: 'hold', pose: {}, marks: ['kneeR', 'ankleR'], parts: ['shinR', 'shinL'] },
  ],
  cues: [{ tr: 'Uyluk kolda yüksek', en: 'Thigh high on the upper arm', es: 'Muslo alto en el brazo' },
    { tr: 'Bacakları birbirine sık', en: 'Squeeze the legs together', es: 'Aprieta las piernas' },
    { tr: 'Dirsekleri bük, karşı yöne dön', en: 'Bend the elbows and twist away', es: 'Flexiona los codos y gira' }],
};
}
