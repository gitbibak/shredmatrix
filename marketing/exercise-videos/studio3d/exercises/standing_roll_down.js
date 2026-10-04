/* Standing Roll Down at the wall (Pilates mat). Side view, wall behind the character (-x).
 * Stand with the heels ~15 cm from the wall, sacrum / ribs / back of the head on the wall -> nod and peel the spine off the
 * wall -> hang -> stack back up. Feet planted (ctx.plant ankles, anchored); one ground contact [heelR].
 * build() (lazy, after the rig sets FB.BODY):
 *   - stand: slight backward lean (`trunk` bisected) so the back of the pelvis and the back of the head line up on one vertical
 *     plane = the wall face (box near face at WALL_X); the heels end ~4 cm in front of it (spec 10-15 cm: this rig's glutes/back
 *     are flatter than a real body, a 15 cm gap would need a backward lean that takes the head off the wall).
 *   - fold / hang: the sacrum keeps light contact (spec): a root shift `pos` puts the back of the pelvis on the wall face, the
 *     planted ankles make the knees soften by IK (the tailbone slides down the wall). Arms hang vertically (sh = thorax angle).
 *   - the back-of-body points are the joint centres offset 10-11 cm along the segment's -x axis (rig clearances).
 * Spec hang: trunk 105 / hip 115 / thoracic 50 / lumbar 35 / neck 45 / knee 12 (pelvis->neck line in measure). */
{
const CTX = { anchorX: ['ankleL', 'ankleR'], anchorAt: [0, 0] };
const G = [['heelR', 0]];
const ARM = { el: 4, shAbd: 4, palm: 'in', curl: 0.2, elbowPole: [-1, -0.2, 0.3] };
const LEG = { flat: true, abd: 2, ground: G };
const RAW = {
  stand: { ...LEG, ...ARM, trunk: -3, hip: -3, knee: 4, lumbar: 0, thoracic: 0, neck: 0, sh: 0, pos: [0, 0, 0] },
    hang: { ...LEG, ...ARM, trunk: 40, hip: 54, knee: 12, lumbar: 35, thoracic: 50, neck: 45, sh: 103, pos: [0, 0, 0] },
};
let WALL_X = -0.3;

function build(poses, mistakes) {
  const { V, M, solve, expand } = FB;
  const S = (p) => solve(expand(Object.assign({}, p, { ik: undefined })), CTX);
  const bis = (f, lo, hi) => { let flo = f(lo); for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2, fm = f(m); if ((fm > 0) === (flo > 0)) { lo = m; flo = fm; } else hi = m; } return +((lo + hi) / 2).toFixed(3); };
  const backPelvis = (s) => V.add(s.J.pelvis, M.apply(s.F.pelvis, [-0.1, -0.04, 0]))[0];
  const backHead = (s) => V.add(s.J.head, M.apply(s.F.head, [-0.105, 0, 0]))[0];
  const backRibs = (s) => V.add(s.J.chest, M.apply(s.F.thorax, [-0.1, 0, 0]))[0];
  // stand: lean so the head and the pelvis touch the same vertical plane
  { const p = poses.stand; p.trunk = bis((t) => { const s = S(Object.assign({}, p, { trunk: t, hip: t })); return backHead(s) - backPelvis(s); }, -12, 6); p.hip = p.trunk; }
  const s0 = S(poses.stand);
  WALL_X = Math.min(backPelvis(s0), backRibs(s0), backHead(s0)) - 0.004;
  // fold poses: root shift so the sacrum rests on the wall face
  const onWall = (p) => { const s = S(Object.assign({}, p, { pos: [0, 0, 0] })); p.pos = [+(WALL_X + 0.004 - backPelvis(s)).toFixed(4), 0, 0]; };
  onWall(poses.hang);
  // mistakes: sacrum back on the wall; 'locked knees' keeps the legs straight instead (the pelvis then sits further forward,
  // a small root shift that the planted ankles absorb at the ankle, not the knee)
  for (const m of mistakes) { const q = Object.assign({}, poses[m.at], m.pose); if (m.free) { q.pos = [0, 0, 0]; m.pose.hip = q.hip = bis((h) => backPelvis(S(Object.assign({}, q, { hip: h }))) - WALL_X - 0.004, 20, 90); } else onWall(q); m.pose.pos = q.pos;
    m.wallGap = +(backPelvis(S(q)) - WALL_X).toFixed(3); }
  return poses;
}

window.EXERCISE = {
  id: 'standing_roll_down',
  name: { tr: 'Duvarda Roll Down', en: 'Wall Roll Down', es: 'Roll down en la pared' },
  category: { tr: 'Pilates · Omurga', en: 'Pilates · Spine', es: 'Pilates · Columna' },
  equipmentLabel: { tr: 'Duvar · Mat', en: 'Wall · Mat', es: 'Pared · Esterilla' },
  muscles: ['core', 'hamstrings', 'lowerback'],
  tempo: '4-1.5-4',
  tempoReps: 1,
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 35, pitch: 10, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Ağırlık iki ayağa eşit, kollar ağır', en: 'Weight even on both feet, arms heavy', es: 'Peso igual en ambos pies, brazos pesados' } },
  setupView: { yaw: 40, pitch: 10 },
  setupMarks: [{ type: 'aline', joints: ['pelvis', 'neck', 'head'] }],
  contacts: ['heelR', 'ballR', 'heelL', 'ballL'],
  get props() { void this.poses; return [['mat', { at: [0.05, 0, 0], length: 0.9, width: 0.8 }], ['wall', { x: WALL_X }]]; },
  ctx: Object.assign({ plant: ['ankleL', 'ankleR'] }, CTX),
  get poses() { return this._poses || (this._poses = build(RAW, this.mistakes)); },
  rest: 'stand',
  rep: [
    { to: 'hang', dur: 4.0, phase: 0 },
    { to: 'hang', dur: 1.5, phase: 1 },
    { to: 'stand', dur: 4.0, phase: 2 },
  ],
  setup: { tr: 'Topuklar duvarın hemen önünde, ayaklar kalça genişliğinde. Kalça, kaburgalar ve baş duvarda.',
    en: 'Heels just in front of the wall, feet hip-width. Sacrum, ribs and head touch the wall.',
    es: 'Talones justo delante de la pared, pies al ancho de cadera. Sacro, costillas y cabeza en la pared.' },
  phases: [
    { name: { tr: 'Başı eğ ve soy', en: 'Nod and peel', es: 'Asiente y despega' }, breath: 'out', slow: 1.0,
      text: { tr: 'Nefes ver, çeneyi indir. Omurgayı duvardan omur omur soyarak in.', en: 'Exhale, nod the chin. Peel the spine off the wall one vertebra at a time.', es: 'Exhala, baja la barbilla. Despega la columna vértebra a vértebra.' } },
    { name: { tr: 'Asılı kal', en: 'Hang', es: 'Cuelga' }, breath: 'in', hold: 3.0,
      text: { tr: 'Kollar ve baş ağır, eller yere uzanır. Dizler yumuşak.', en: 'Arms and head heavy, hands reach to the floor. Knees soft.', es: 'Brazos y cabeza pesados, manos hacia el suelo. Rodillas suaves.' } },
    { name: { tr: 'Omur omur diz', en: 'Stack up', es: 'Apila la columna' }, breath: 'in', slow: 1.0, line: ['pelvis', 'neck', 'head'],
      text: { tr: 'Ayaklara bas, karnı içe çek. Omurları tek tek duvara diz.', en: 'Press the feet, scoop the belly. Stack each vertebra back onto the wall.', es: 'Presiona los pies, mete el abdomen. Apila cada vértebra en la pared.' } },
  ],
  tempoText: { tr: '4 sn in · 1,5 sn asılı · 4 sn kalk', en: '4 s down · 1.5 s hang · 4 s up', es: '4 s abajo · 1,5 s cuelga · 4 s arriba' },
  mistakes: [
    { title: { tr: 'Düz sırtla katlanmak', en: 'Hinging with a flat back', es: 'Bisagra con espalda plana' },
      text: { tr: 'Gövde kalçadan tek parça katlanır, omurga hareket etmez.', en: 'The torso folds from the hips in one piece; the spine stays rigid.', es: 'El torso se pliega desde la cadera; la columna no se mueve.' },
      fix: { tr: 'Çeneyle başla, omurgayı yuvarla', en: 'Start with the chin, curl the spine', es: 'Empieza con la barbilla, curva la columna' },
      fixText: { tr: 'Önce baş, sonra göğüs, en son bel', en: 'Head first, then chest, then low back', es: 'Primero cabeza, luego pecho y lumbar' },
      at: 'hang', pose: { trunk: 95, hip: 100, lumbar: 2, thoracic: 0, neck: -10, sh: 92 }, line: ['pelvis', 'waist', 'neck'], parts: ['waist', 'chest'] },
    { title: { tr: 'Dizler kilitli', en: 'Locked knees', es: 'Rodillas bloqueadas' },
      text: { tr: 'Bacaklar kaskatı, arka bacak ve bel gerilir.', en: 'Stiff legs pull on the hamstrings and the low back.', es: 'Piernas rígidas que tiran de isquios y lumbar.' },
      fix: { tr: 'Dizleri hafif bük', en: 'Soften the knees', es: 'Flexiona un poco las rodillas' },
      fixText: { tr: 'Dizler yumuşak, ağırlık ayak ortasında', en: 'Soft knees, weight over mid-foot', es: 'Rodillas suaves, peso en el centro del pie' },
      at: 'hang', free: true, pose: { knee: 0 }, marks: ['kneeR'], parts: ['thigh', 'shin'] },
  ],
  cues: [{ tr: 'Önce başını eğ, sonra soy', en: 'Nod, then peel', es: 'Asiente y luego despega' },
    { tr: 'Karın içeride', en: 'Keep the abs scooped', es: 'Abdomen hacia dentro' },
    { tr: 'Omurları inci gibi diz', en: 'Stack each vertebra like pearls', es: 'Apila las vértebras como perlas' }],
};
}
