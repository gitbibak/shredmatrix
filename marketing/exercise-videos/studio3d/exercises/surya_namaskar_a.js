/* Surya Namaskar A (Sun Salutation A). Side view. A flow: one rep move (= one step card) per vinyasa.
 * (Old budget note, before card:false/maxDuration existed:) every rep move costs a step card (>= 2.9 s) + its tempo time + its cues-replay time and qa caps the video
 * at 60 s, so the loop has 6 moves and starts in Down Dog (rest; the 5-breath hub, and the mistake poses are close to it):
 *   dd -> jump forward + fold -> rise, arms up (Ekam/Nava) -> fold -> chaturanga (jump back) -> up dog -> dd.
 * Skipped as own cards: Samasthiti and both half lifts (Trini/Sapta). The swan dive needs >= 2.6 s or the hands move faster
 * than qa's 6 cm/frame limit, which is what pushed the half lift out of the 60 s budget.
 * Geometry (build(), lazy, after the rig sets FB.BODY):
 *   - toes anchored; every pose rests on the single contact [toeR] (one contact set, no solution blending). Floor poses are
 *     first solved on [toeR, wristR] (toes + wrists on the mat), then converted to the equivalent trunk angle.
 *   - floor poses are shifted back by DX (pos) = the jump back / forward. Feet never glide: both jumps pass through the
 *     in-between key 'air' (card: false; hands on their spot, hips high, knees tucked, toe contact raised to 30 cm, halfway
 *     between the two foot spots, fitted with fit()). Jump back lands in 'plank' (card: false), then the Chaturanga card
 *     lowers. Jump forward: dd breath -> air -> fold (all card: false), then a hold card on the fold explains it.
 *     Jump keys are 0.8 s up / 0.6 s down: faster keys move the knees > 6 cm per 30 fps frame (qa pop limit).
 *   - maxDuration 80 and cuesReplay false (flow).
 *   - hands: world IK targets on one mat spot H in every hands-down pose (fold, chaturanga, up dog, down dog;
 *     palms flat). 'up' uses a body-relative target (holdL/R): it stays active through the whole up <-> fold transitions
 *     (engine carries a missing nested value), so the arms swing with the trunk like a swan dive; the fold is fitted
 *     (trunk + thoracic) so that this same body-relative target lands exactly on H -> no pop when the world target takes over.
 *   - handFlat is false in 'up' and unset elsewhere (engine: target on the mat = flat palm). 'false' is carried through the
 *     whole up <-> fold segment, so the palm turns flat exactly at the fold key while the hand is at rest.
 *   - KNOWN LIMIT: in the fold the straight arm is ~5 cm short of the mat (the fold trunk is fitted so the body-relative
 *     target lands ~5 cm above the mat; deeper fits made the flag flip pop the elbow > 6 cm). The palm therefore hovers
 *     a few cm above the mat in Uttanasana only.
 * Spec mistake 2 (locked knees = hyperextension) cannot be shown (IK legs stop at straight); replaced by the other
 * classic Sun Salutation fault: shoulders sinking toward the ears in Up Dog. */
{
const MAT = 0.012;
const CTX = { anchorX: ['toeL', 'toeR'], anchorAt: [0, 0] };
const POLE = [-1, -0.25, 0.22];
const GS = [['toeR', MAT]];
const GF = [['toeR', MAT], ['wristR', MAT + 0.012]];     // floor poses: toe tips + wrists (centre MAT + 0.042) on the mat
const ARM = { elbowPole: POLE, curl: 0.12, pos: [0, 0, 0] };
const RAW = {
  up: Object.assign({ trunk: -4, hip: -4, knee: 0, thoracic: -10, neck: -20, sh: 172, shAbd: 6, el: 2, palm: 'in', handFlat: false, ground: GS }, ARM),
  fold: Object.assign({ trunk: 110, hip: 112, knee: 6, lumbar: 20, thoracic: 20, neck: 8, sh: 120, el: 2, ground: GS }, ARM),
  plank: Object.assign({ trunk: 82, hip: 0, knee: 0, ankle: -40, flat: false, sh: 80, shAbd: 6, el: 0, neck: -4, ground: GF }, ARM),
  air: Object.assign({ trunk: 120, hip: 125, knee: 80, ankle: -35, flat: false, lumbar: 12, thoracic: 10, neck: -12, sh: 120, shAbd: 6, el: 0, ground: GS }, ARM),
  chat: Object.assign({ trunk: 82, hip: 0, knee: 0, ankle: -50, flat: false, sh: 10, shAbd: 6, el: 90, neck: -6, ground: GF }, ARM),
  updog: Object.assign({ trunk: 50, hip: -22, knee: 0, ankle: -42, flat: false, lumbar: -20, thoracic: -14, neck: -20, sh: 40, shAbd: 6, el: 0, ground: GF }, ARM),
  dd: Object.assign({ trunk: 135, hip: 104, knee: 3, ankle: 18, flat: false, sh: 168, shAbd: 6, el: 0, neck: -4, ground: GF }, ARM),
};
let MAT_AT = [-0.55, 0, 0];

function build(poses, mistakes) {
  const { V, solve, expand, BODY: B } = FB;
  const S = (p) => solve(expand(Object.assign({}, p, { holdL: undefined, holdR: undefined, ik: undefined })), CTX);
  const n2 = (f, x, e = [0.3, 0.3], cl = [5, 5]) => {   // 2x2 Newton with finite differences
    for (let it = 0; it < 40; it++) {
      const r = f(x);
      if (Math.abs(r[0]) < 2e-4 && Math.abs(r[1]) < 2e-4) break;
      const a = f([x[0] + e[0], x[1]]), b = f([x[0], x[1] + e[1]]);
      const J = [[(a[0] - r[0]) / e[0], (b[0] - r[0]) / e[1]], [(a[1] - r[1]) / e[0], (b[1] - r[1]) / e[1]]];
      const det = J[0][0] * J[1][1] - J[0][1] * J[1][0]; if (Math.abs(det) < 1e-12) break;
      const dx0 = (J[1][1] * r[0] - J[0][1] * r[1]) / det, dx1 = (-J[1][0] * r[0] + J[0][0] * r[1]) / det;
      x = [x[0] - Math.max(-cl[0], Math.min(cl[0], dx0)), x[1] - Math.max(-cl[1], Math.min(cl[1], dx1))];
    }
    return x;
  };
  const bis = (f, lo, hi) => { let flo = f(lo); for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2, fm = f(m); if ((fm > 0) === (flo > 0)) { lo = m; flo = fm; } else hi = m; } return (lo + hi) / 2; };
  // damped Gauss-Newton over pose keys (finite differences): res(J) -> residuals
  const fit = (q, keys, res) => {
    const P = (x) => { const p = Object.assign({}, q); keys.forEach((k, i) => { p[k] = x[i]; }); return p; };
    const R = (x) => res(S(P(x)).J);
    let x = keys.map((k) => q[k] ?? 0);
    for (let it = 0; it < 60; it++) {
      const r0 = R(x), n = x.length, m = r0.length; if (Math.hypot(...r0) < 1e-5) break;
      const Jm = keys.map((_, j) => { const xx = x.slice(); xx[j] += 0.02; return R(xx).map((v, i) => (v - r0[i]) / 0.02); });
      const A = Jm.map((a) => Jm.map((c) => a.reduce((s2, v, i) => s2 + v * c[i], 0)));
      A.forEach((row, i) => { row[i] += 1e-6; });
      const bb = Jm.map((a) => a.reduce((s2, v, i) => s2 + v * r0[i], 0));
      for (let c = 0; c < n; c++) { for (let r = c + 1; r < n; r++) { const f = A[r][c] / A[c][c]; for (let k = c; k < n; k++) A[r][k] -= f * A[c][k]; bb[r] -= f * bb[c]; } }
      const d = new Array(n).fill(0); for (let r = n - 1; r >= 0; r--) { let s2 = bb[r]; for (let k = r + 1; k < n; k++) s2 -= A[r][k] * d[k]; d[r] = s2 / A[r][r]; }
      let sc = 1; d.forEach((v) => { if (Math.abs(v) * sc > 6) sc = 6 / Math.abs(v); });
      x = x.map((v, i) => v - d[i] * sc);
    }
    return P(x);
  };
  const REACH = B.upper + B.fore - 0.0006;                 // shoulder -> wrist target, nearly straight arm
  // body-relative overhead hand target of 'up' (also used through the swan dive)
  const holdOf = (q, s, at) => { const d = V.sub(at, q.J.chest), T = q.F.thorax, sg = s === 'R' ? 1 : -1; return [V.dot(d, T[0]), V.dot(d, T[1]), V.dot(d, T[2]) * sg]; };
  const qu = S(poses.up);
  poses.up.holdR = holdOf(qu, 'R', qu.J.handR); poses.up.holdL = holdOf(qu, 'L', qu.J.handL);
  // fold: trunk so that the 'up' body-relative target reaches the mat; that point becomes the hand spot H (a little ahead
  // of the feet). Spine flexion is kept moderate so the chest still faces the shins and the flat palms point forward.
  const HZ = poses.up.holdR[2];
  const tgt = (p) => { const q = S(p); return V.add(q.J.chest, FB.M.apply(q.F.thorax, poses.up.holdR)); };
  // fold trunk: the 'up' body-relative target lands ~5 cm above the mat at P; the flat palm spot H is where the flat-hand
  // wrist is at arm's reach, behind P (bisect, capped).
  { const p = poses.fold; p.trunk = bis((t) => tgt(Object.assign({}, p, { trunk: t, hip: t + 2 }))[1] - MAT - 0.05, 60, 140); p.hip = p.trunk + 2; }
  const P = tgt(poses.fold), SH = S(poses.fold).J.shoulderR;
  const HX = bis((x) => V.len(V.sub(SH, [x - B.hand * 0.6, MAT + 0.042, SH[2]])) - (B.upper + B.fore - 0.0006), P[0] - 0.2, P[0] + 0.05);
  const HAND = (sg) => [HX, MAT + 0.03, sg * HZ];   // y only matters for a free hand (flag flip at the dd key)
  const W = [HX - B.hand * 0.6, MAT + 0.042, HZ];          // flat-hand wrist (fingers forward)
  // chaturanga: forearm vertical (bisect shoulder flexion); its wrist spot defines the jump-back distance DX
  { const p = poses.chat; p.sh = bis((v) => { const J = S(Object.assign({}, p, { sh: v })).J; return J.elbowR[0] - J.wristR[0]; }, -30, 60);
    const J = S(p).J; p.pos = [W[0] - J.wristR[0], 0, 0]; }
  const DX = poses.chat.pos[0];
  // plank (landing of the jump back, before lowering): straight arms, toes on the chaturanga spot, wrist on its spot
  { const p = poses.plank; p.pos = [DX, 0, 0]; p.sh = bis((v) => S(Object.assign({}, p, { sh: v })).J.wristR[0] - W[0], 40, 120); }
  // airborne in-between pose of both jumps (no card): hands stay on their spot (straight arms, shoulders a little ahead of
  // the wrists), hips high, knees tucked, toes ~AIR_H above the mat halfway between the fold and the chaturanga spots
  { const AIR_H = 0.30, q = poses.air;
    const rel = (J) => [J.wristR[0] - J.toeR[0], J.wristR[1] - J.toeR[1]];
    const sol = fit(q, ['trunk', 'hip', 'sh'], (J) => { const r = rel(J); return [r[0] - (W[0] - DX / 2), r[1] - (W[1] - AIR_H), J.shoulderR[0] - J.wristR[0] - 0.06]; });
    Object.assign(q, sol);
    const J = S(q).J, r = rel(J);
    q.ground = [['toeR', W[1] - r[1]]]; q.pos = [W[0] - r[0] - (J.toeR[0] - (J.toeR[0] + J.toeL[0]) / 2), 0, 0]; }
  // up dog: hip extension + shoulder flexion: wrist on its spot, straight arm, shoulder 9 cm ahead of the wrist
  { const p = poses.updog; p.pos = [DX, 0, 0];
    const x = n2((x) => { const J = S(Object.assign({}, p, { hip: x[0], sh: x[1] })).J; return [J.wristR[0] - W[0], J.shoulderR[0] - J.wristR[0] - 0.09]; }, [p.hip, p.sh]);
    p.hip = x[0]; p.sh = x[1]; }
  // down dog: arms in line with the trunk (sh 168), hip flexion puts the wrist on its spot
  { const p = poses.dd; p.pos = [DX, 0, 0]; p.hip = bis((h) => S(Object.assign({}, p, { hip: h })).J.wristR[0] - W[0], 60, 140); }
  // two-contact floor poses -> equivalent trunk angle on the single [toeR] contact
  const RAW_GF = {}; for (const k in poses) if (poses[k].ground === GF) RAW_GF[k] = Object.assign({}, poses[k]);
  const toSingle = (p) => {
    const Wy = S(p).J.wristR[1], q = Object.assign({}, p, { ground: GS }), t0 = p.trunk;
    p.trunk = bis((t) => S(Object.assign({}, q, { trunk: t })).J.wristR[1] - Wy, t0 - 60, t0 + 60); p.ground = GS;
  };
  for (const k in RAW_GF) toSingle(poses[k]);
  for (const [at, mp] of mistakes) if (RAW_GF[at]) { const m = Object.assign({}, RAW_GF[at], mp, { ground: GF }); toSingle(m); mp.trunk = m.trunk; mp.ground = GS; }
  // world hand targets in the hands-down poses
  const IK = { handL: { at: HAND(-1) }, handR: { at: HAND(1) } };
  for (const k in poses) if (k !== 'up') { poses[k].ik = IK; poses[k].handSurface = MAT; }
  poses.up.handSurface = MAT;
  MAT_AT = [DX + 0.62, 0, 0];
  return poses;
}

window.EXERCISE = {
  id: 'surya_namaskar_a',
  name: { tr: 'Surya Namaskar A (Güneşe Selam A)', en: 'Surya Namaskar A (Sun Salutation A)', es: 'Saludo al sol A' },
  category: { tr: 'Yoga · Akış', en: 'Yoga · Flow', es: 'Yoga · Secuencia' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['delts', 'triceps', 'quads', 'core', 'hamstrings'],
  tempo: '1 nefes / hareket',
  tempoReps: 1,
  repLabel: { tr: 'TUR', en: 'ROUND', es: 'RONDA' },
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 30, pitch: 12, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Eller omuz genişliğinde, ayaklar birleşik', en: 'Hands shoulder-width, feet together', es: 'Manos al ancho de hombros, pies juntos' } },
  contacts: ['heelR', 'ballR', 'heelL', 'ballL'],
  get props() { void this.poses; return [['mat', { at: MAT_AT, length: 1.95 }]]; },
  ctx: CTX,
  get poses() { return this._poses || (this._poses = build(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'dd',
  maxDuration: 80,
  cuesReplay: false,
  rep: [
    { to: 'dd', dur: 0.8, phase: 0, card: false },     // last breath in Down Dog (also clears the chapter banner)
    { to: 'air', dur: 0.8, phase: 0, card: false },   // jump forward: feet lift off ...
    { to: 'fold', dur: 0.6, phase: 0, card: false },   // ... and land between the hands
    { to: 'fold', dur: 0.4, phase: 0 },
    { to: 'up', dur: 2.6, phase: 1 },
    { to: 'fold', dur: 2.6, phase: 2 },
    { to: 'air', dur: 0.8, phase: 3, card: false },   // jump back: feet lift off ...
    { to: 'plank', dur: 0.6, phase: 3, card: false },  // ... and land in plank
    { to: 'chat', dur: 0.9, phase: 3 },
    { to: 'updog', dur: 0.9, phase: 4 },
    { to: 'dd', dur: 0.9, phase: 5 },
  ],
  setup: { tr: 'Döngü Aşağı Köpek\'ten başlar. Öne zıpla, kalk ve akışı nefesle tekrarla.',
    en: 'The loop starts in Down Dog. Jump forward, rise, and repeat the flow with the breath.',
    es: 'El ciclo empieza en perro abajo. Salta adelante, sube y repite con la respiración.' },
  phases: [
    { name: { tr: 'Öne zıpla', en: 'Jump forward', es: 'Salta adelante' }, breath: 'out', slow: 1.2,
      text: { tr: 'Ayakları ellerin arasına zıpla, öne katlan.', en: 'Jump the feet between the hands and fold.', es: 'Salta con los pies entre las manos y pliégate.' } },
    { name: { tr: 'Kalk', en: 'Rise', es: 'Sube' }, breath: 'in', slow: 1.0,
      text: { tr: 'Kollar yukarı.', en: 'Arms up.', es: 'Brazos arriba.' } },
    { name: { tr: 'Öne katlan', en: 'Fold', es: 'Flexión' }, breath: 'out', slow: 1.0,
      text: { tr: 'Avuçlar yere.', en: 'Palms down.', es: 'Palmas al suelo.' } },
    { name: { tr: 'Chaturanga', en: 'Chaturanga', es: 'Chaturanga' }, breath: 'out', slow: 1.2,
      text: { tr: 'Plank\'a geri zıpla, dirsekleri 90 derece bükerek in.', en: 'Jump back to plank, lower to 90° elbows.', es: 'Salta atrás a plancha, baja a codos 90°.' } },
    { name: { tr: 'Yukarı köpek', en: 'Up Dog', es: 'Perro arriba' }, breath: 'in', slow: 1.1,
      text: { tr: 'Göğsü aç.', en: 'Open the chest.', es: 'Abre el pecho.' } },
    { name: { tr: 'Aşağı köpek', en: 'Down Dog', es: 'Perro abajo' }, breath: 'out', slow: 1.1,
      text: { tr: 'Kalça yukarı.', en: 'Hips up.', es: 'Cadera arriba.' } },
  ],
  tempoText: { tr: 'Her harekete bir nefes', en: 'One breath per movement', es: 'Una respiración por movimiento' },
  mistakes: [
    { title: { tr: 'Chaturanga\'da kalça düşüyor', en: 'Hips drop in Chaturanga', es: 'La cadera cae en Chaturanga' },
      text: { tr: 'Kalça omuz-topuk çizgisinin altına iner.', en: 'Hips sag below the shoulder-heel line.', es: 'La cadera baja de la línea hombro-talón.' },
      fix: { tr: 'Karın aktif, tek parça in', en: 'Brace and lower as one piece', es: 'Activa el abdomen, baja en bloque' },
      fixText: { tr: 'Omuzdan topuğa düz çizgi', en: 'Straight line from shoulders to heels', es: 'Línea recta de hombros a talones' },
      at: 'chat', pose: { hip: -10, lumbar: -8 }, line: ['ankleR', 'pelvis', 'shoulderR'], parts: ['pelvis', 'waist'] },
    { title: { tr: 'Omuzlar kulaklara çöküyor', en: 'Shoulders sink to the ears', es: 'Hombros hacia las orejas' },
      text: { tr: 'Yukarı köpekte göğüs kolların arasına düşer.', en: 'In Up Dog the chest drops between the arms.', es: 'En perro arriba el pecho cae entre los brazos.' },
      fix: { tr: 'Yeri it, göğsü öne aç', en: 'Push the floor, open the chest', es: 'Empuja el suelo, abre el pecho' },
      fixText: { tr: 'Omuzlar geride ve aşağıda', en: 'Shoulders back and down', es: 'Hombros atrás y abajo' },
      at: 'updog', pose: { shrug: 0.05, thoracic: 4, neck: 10, ground: GF }, marks: ['shoulderR', 'head'], parts: ['upper', 'neck'] },
  ],
  cues: [{ tr: 'Bir nefes, bir hareket', en: 'One breath, one movement', es: 'Una respiración, un movimiento' },
    { tr: 'Eller ve ayaklar yere bassın', en: 'Ground through hands and feet', es: 'Apoya bien manos y pies' },
    { tr: 'Chaturanga\'da karın güçlü', en: 'Strong core in Chaturanga', es: 'Abdomen firme en Chaturanga' }],
};
}
