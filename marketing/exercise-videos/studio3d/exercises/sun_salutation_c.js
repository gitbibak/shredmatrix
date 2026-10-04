/* Sun Salutation C (Surya Namaskar C). Side view. A flow (maxDuration 80, cuesReplay false), built on surya_namaskar_a.js /
 * surya_namaskar_b.js. Condensed loop in the true order, starting in the second low lunge (rest; the mistake chapter morphs
 * rest <-> mistake, so the rest sits on the lunge mistakes):
 *   Low lunge R forward, arms up (8) -> hands down, step left forward -> fold (9) -> rise, arms up (10 = 1) -> fold (2)
 *   -> step right back, low lunge, arms up (3) -> hands down, step left back -> plank (4) -> Chaturanga (5) -> Up Dog (6)
 *   -> Down Dog (7) -> step right forward -> low lunge, arms up (8).   Skipped: Samasthiti. Steps only (no jumps).
 * Geometry (build(), lazy, after the rig sets FB.BODY): A's base (fold <-> up with the body-relative overhead target, hand
 * spot H, chaturanga / up dog / down dog on the toe spot DX), then, as in B:
 *   - FEET NEVER GLIDE: every pose carries ankle IK targets (ankle + foot frame); each step goes through an in-between key
 *     (card: false) with the stepping foot 40 cm up halfway between its two spots while the other foot stays pinned.
 *   - Low lunge (Anjaneyasana, knee down): front foot on the fold foot spot (shin ~vertical), back toes on the Down Dog toe
 *     spot (Down Dog foot frame, toes tucked), back knee on the mat (fitted with the leg IK). The Down Dog toe spot is only
 *     ~0.96 m behind the fold feet, too short for a straight-back-leg high lunge with a vertical front shin, so the spec's
 *     "drop the back knee" variant is shown (front hip/knee ~90, trunk ~5).
 *   - Arms up: world IK targets = the FK hands of the pose, with an in-between key (arms forward) so the hands sweep in front
 *     of the body; handFlat false there, the palm flattens at the hands-down lunge key (arm reach fitted so the switch is small).
 *   - playback: pelvis placed directly (anchor = pelvis, contact 'pelvis' at its height), hands and feet world IK targets.
 *   - flat/flatL/flatR never switch between neighbouring poses (the build-time toe anchor uses the FK toes).
 * Mistakes: spec 1 (front knee past the toes, lunge) is shown. Spec 2 (hips sag in plank) cannot sit next to the lunge rest
 * without the feet sliding in the mistake morph (plank feet are both back), so the other classic low-lunge fault is shown:
 * arching the low back with the arms overhead. */
{
const MAT = 0.012;
const CTX = { anchorX: ['toeL', 'toeR'], anchorAt: [0, 0] };          // build-time solving (A's construction)
const CTX_RUN = { anchorX: ['pelvis'], anchorAt: [0, 0] };            // playback: pelvis placed explicitly (see toPelvis)
const POLE = [-1, -0.25, 0.22];
const GS = [['toeR', MAT]];
const GF = [['toeR', MAT], ['wristR', MAT + 0.012]];
const ARM = { elbowPole: POLE, curl: 0.12, pos: [0, 0, 0] };
const UPARM = { sh: 172, shAbd: 8, el: 3, palm: 'in', handFlat: false };
const LEGS0 = { flat: false, ankleR: 0, ankleL: 0 };
const RAW = {
  up: Object.assign({ trunk: -4, hip: -4, knee: 0, thoracic: -10, neck: -20, sh: 172, shAbd: 6, el: 2, palm: 'in', handFlat: false, ground: GS }, ARM),
  fold: Object.assign({ trunk: 110, hip: 112, knee: 6, lumbar: 20, thoracic: 20, neck: 8, sh: 120, el: 2, ground: GS }, ARM),
  plank: Object.assign({ trunk: 82, hip: 0, knee: 0, ankle: -40, flat: false, sh: 80, shAbd: 6, el: 0, neck: -4, ground: GF }, ARM),
  chat: Object.assign({ trunk: 82, hip: 0, knee: 0, ankle: -50, flat: false, sh: 10, shAbd: 6, el: 90, neck: -6, ground: GF }, ARM),
  updog: Object.assign({ trunk: 50, hip: -22, knee: 0, ankle: -42, flat: false, lumbar: -20, thoracic: -14, neck: -20, sh: 40, shAbd: 6, el: 0, ground: GF }, ARM),
  dd: Object.assign({ trunk: 135, hip: 104, knee: 3, ankle: 18, flat: false, sh: 168, shAbd: 6, el: 0, neck: -4, ground: GF }, ARM),
};
// lunge family, by front side F / back side K (built in build())
const LUNGE = (F, K) => Object.assign({ trunk: 70, ['hip' + F]: 120, ['knee' + F]: 100, ['hip' + K]: -10, ['knee' + K]: 80, lumbar: 6, thoracic: 6, neck: -10, sh: 70, shAbd: 6, el: 0, ground: GS }, LEGS0, ARM);
const LMID = (F, K) => Object.assign({ trunk: 30, ['hip' + F]: 100, ['knee' + F]: 92, ['hip' + K]: -20, ['knee' + K]: 80, neck: -6, sh: 95, shAbd: 6, el: 3, palm: 'in', handFlat: false, ground: GS }, LEGS0, ARM);
const LUP = (F, K) => Object.assign({ trunk: 2, ['hip' + F]: 95, ['knee' + F]: 92, ['hip' + K]: -25, ['knee' + K]: 80, thoracic: -10, neck: -15, ground: GS }, LEGS0, ARM, UPARM);
let MAT_AT = [-0.55, 0, 0];

function build(poses, mistakes) {
  const { V, solve, expand, BODY: B } = FB;
  const S = (p) => solve(expand(Object.assign({}, p, { holdL: undefined, holdR: undefined, ik: undefined })), CTX);
  const SI = (p, ik) => solve(expand(Object.assign({}, p, { holdL: undefined, holdR: undefined, ik })), CTX);   // with leg pins
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
  // damped Gauss-Newton over pose keys (finite differences); 'px'/'py' = root offset (pos). res(p) -> residuals
  const fitP = (q, keys, res) => {
    const P = (x) => { const p = Object.assign({}, q, { pos: (q.pos || [0, 0, 0]).slice() }); keys.forEach((k, i) => { if (k === 'px') p.pos[0] = x[i]; else if (k === 'py') p.pos[1] = x[i]; else p[k] = x[i]; }); return p; };
    const R = (x) => res(P(x));
    const st = (k) => (k === 'px' || k === 'py' ? 0.001 : 0.02), lim = (k) => (k === 'px' || k === 'py' ? 0.05 : 6);
    let x = keys.map((k) => (k === 'px' ? (q.pos || [0])[0] : k === 'py' ? (q.pos || [0, 0])[1] : q[k] ?? 0));
    for (let it = 0; it < 80; it++) {
      const r0 = R(x), n = x.length; if (Math.hypot(...r0) < 1e-5) break;
      const Jm = keys.map((k, j) => { const xx = x.slice(); xx[j] += st(k); return R(xx).map((v, i) => (v - r0[i]) / st(k)); });
      const A = Jm.map((a) => Jm.map((c) => a.reduce((s2, v, i) => s2 + v * c[i], 0)));
      A.forEach((row, i) => { row[i] += 1e-7; });
      const bb = Jm.map((a) => a.reduce((s2, v, i) => s2 + v * r0[i], 0));
      for (let c = 0; c < n; c++) { for (let r = c + 1; r < n; r++) { const f = A[r][c] / A[c][c]; for (let k = c; k < n; k++) A[r][k] -= f * A[c][k]; bb[r] -= f * bb[c]; } }
      const d = new Array(n).fill(0); for (let r = n - 1; r >= 0; r--) { let s2 = bb[r]; for (let k = r + 1; k < n; k++) s2 -= A[r][k] * d[k]; d[r] = s2 / A[r][r]; }
      let sc = 1; d.forEach((v, i) => { if (Math.abs(v) * sc > lim(keys[i])) sc = lim(keys[i]) / Math.abs(v); });
      x = x.map((v, i) => v - d[i] * sc);
    }
    const rr = Math.hypot(...R(x)); if (rr > 1e-3) console.warn('fit residual', keys.join(','), rr.toFixed(4));
    return P(x);
  };
  const fit = (q, keys, res) => fitP(q, keys, (p) => res(S(p).J));
  const frame = (F) => [F[0].slice(), F[1].slice(), F[2].slice()];
  // ---- A's base
  const holdOf = (q, s, at) => { const d = V.sub(at, q.J.chest), T = q.F.thorax, sg = s === 'R' ? 1 : -1; return [V.dot(d, T[0]), V.dot(d, T[1]), V.dot(d, T[2]) * sg]; };
  const qu = S(poses.up);
  poses.up.holdR = holdOf(qu, 'R', qu.J.handR); poses.up.holdL = holdOf(qu, 'L', qu.J.handL);
  const HZ = poses.up.holdR[2];
  const tgt = (p) => { const q = S(p); return V.add(q.J.chest, FB.M.apply(q.F.thorax, poses.up.holdR)); };
  { const p = poses.fold; p.trunk = bis((t) => tgt(Object.assign({}, p, { trunk: t, hip: t + 2 }))[1] - MAT - 0.05, 60, 140); p.hip = p.trunk + 2; }
  const P = tgt(poses.fold), SH = S(poses.fold).J.shoulderR;
  const HX = bis((x) => V.len(V.sub(SH, [x - B.hand * 0.6, MAT + 0.042, SH[2]])) - (B.upper + B.fore - 0.0006), P[0] - 0.2, P[0] + 0.05);
  const HAND = (sg) => [HX, MAT + 0.03, sg * HZ];
  const W = [HX - B.hand * 0.6, MAT + 0.042, HZ];
  { const p = poses.chat; p.sh = bis((v) => { const J = S(Object.assign({}, p, { sh: v })).J; return J.elbowR[0] - J.wristR[0]; }, -30, 60);
    const J = S(p).J; p.pos = [W[0] - J.wristR[0], 0, 0]; }
  const DX = poses.chat.pos[0];
  { const p = poses.plank; p.pos = [DX, 0, 0]; p.sh = bis((v) => S(Object.assign({}, p, { sh: v })).J.wristR[0] - W[0], 40, 120); }
  { const p = poses.updog; p.pos = [DX, 0, 0];
    const x = n2((x) => { const J = S(Object.assign({}, p, { hip: x[0], sh: x[1] })).J; return [J.wristR[0] - W[0], J.shoulderR[0] - J.wristR[0] - 0.09]; }, [p.hip, p.sh]);
    p.hip = x[0]; p.sh = x[1]; }
  { const p = poses.dd; p.pos = [DX, 0, 0]; p.hip = bis((h) => S(Object.assign({}, p, { hip: h })).J.wristR[0] - W[0], 60, 140); }
  const toSingle = (p) => {
    const Wy = S(p).J.wristR[1], q = Object.assign({}, p, { ground: GS }), t0 = p.trunk;
    p.trunk = bis((t) => S(Object.assign({}, q, { trunk: t })).J.wristR[1] - Wy, t0 - 60, t0 + 60); p.ground = GS;
  };
  for (const k of ['plank', 'chat', 'updog', 'dd']) toSingle(poses[k]);
  // ---- foot pins
  const pinOf = (q, s) => ({ at: q.J['ankle' + s].slice(), foot: frame(q.F['foot' + s]) });
  const pinFK = (p) => { const q = S(p); p.ik = Object.assign({}, p.ik, { ankleL: pinOf(q, 'L'), ankleR: pinOf(q, 'R') }); };
  const qdd = S(poses.dd), qfold = S(poses.fold), qplank = S(poses.plank);
  const FOLD_P = { R: pinOf(qfold, 'R'), L: pinOf(qfold, 'L') };      // front foot spots (flat)
  const DD_P = { R: pinOf(qdd, 'R'), L: pinOf(qdd, 'L') };            // back foot spots (toes tucked, heel up)
  const PLANK_P = { R: pinOf(qplank, 'R'), L: pinOf(qplank, 'L') };
  // back thigh pointed at its pin, then the back knee bends by the given FK angle (pole for the IK knee: down/forward)
  const aimBack = (p, K, pin) => { const q = S(Object.assign({}, p, { ['knee' + K]: 0 })), d = V.sub(pin.at, q.J['hip' + K]); const up = V.norm(V.sub(q.J.neck, q.J.pelvis)), f = q.F.pelvis[0]; p['hip' + K] = Math.atan2(V.dot(d, f), -V.dot(d, up)) * 180 / Math.PI + (p['knee' + K] || 0) * 0.45; };
  const fitAim = (p, keys, res, K, pin, viaIk) => { const F = viaIk ? fitP : fit; for (let i = 0; i < 5; i++) { Object.assign(p, F(p, keys, res)); aimBack(p, K, pin); p.pos[2] -= S(p).J.pelvis[2]; } Object.assign(p, F(p, keys, res)); };
  const pinsOf = (F, K, back) => ({ ['ankle' + F]: FOLD_P[F], ['ankle' + K]: back });
  const KNEE_Y = MAT + 0.05;          // back knee resting on the mat (knee joint centre)
  // lunge, hands down (back knee lifted on the way in/out): front foot on the fold spot, straight (free-hand) arms to H,
  // trunk ~80, hips at a fixed height; back leg by IK on its pin
  const lunge = (F, K) => { const p = LUNGE(F, K); p.pos = [DX / 2, 0, 0]; const pins = pinsOf(F, K, DD_P[K]);
    fitAim(p, ['trunk', 'hip' + F, 'knee' + F, 'px', 'py'], (J) => [J['ankle' + F][0] - FOLD_P[F].at[0], J['ankle' + F][1] - FOLD_P[F].at[1],
      J['knee' + F][0] - J['ankle' + F][0] - 0.10, V.len(V.sub(J['shoulder' + F], HAND(F === 'R' ? 1 : -1))) - (B.upper + B.fore + B.hand * 0.55 - 0.004), J.pelvis[1] - 0.56], K, DD_P[K]);
    p.ik = Object.assign({ handL: { at: HAND(-1) }, handR: { at: HAND(1) } }, pins); p.handSurface = MAT; return p; };
  // low lunge, arms up: trunk ~upright, front shin ~vertical, back knee on the mat
  const lup = (F, K, base, trunk, shin = 0.03, kneeY = KNEE_Y) => { const p = base; p.trunk = trunk; p.pos = [DX / 2, 0, 0]; const pins = pinsOf(F, K, DD_P[K]);
    const kp = { ['ankle' + K]: DD_P[K] };
    fitAim(p, ['hip' + F, 'knee' + F, 'px', 'py'], (q) => { const J = SI(q, kp).J; return [J['ankle' + F][0] - FOLD_P[F].at[0], J['ankle' + F][1] - FOLD_P[F].at[1],
      J['knee' + F][0] - J['ankle' + F][0] - shin, J['knee' + K][1] - kneeY]; }, K, DD_P[K], true);
    const q = SI(p, pins); p.ik = Object.assign({ handL: { at: q.J.handL.slice() }, handR: { at: q.J.handR.slice() } }, pins); return p; };
  // step: the moving foot 40 cm up halfway between two spots, the other foot pinned, straight arms on H, hips at a given height
  const t15 = 15 * Math.PI / 180, sfw = [Math.cos(t15), -Math.sin(t15), 0], sup = [Math.sin(t15), Math.cos(t15), 0];
  const SFRAME = [sfw, sup, V.cross(sfw, sup)];
  const step = (a, b, M, from, to, fixedSide, fixedPin, hipY, kLeg = 0.96) => {
    const p = Object.assign({}, b);
    for (const k of ['trunk', 'lumbar', 'thoracic', 'neck', 'sh']) p[k] = ((a[k] || 0) + (b[k] || 0)) / 2;
    p['hip' + M] = 120; p['knee' + M] = 110; p.flat = false;
    // a toes-tucked foot (Down Dog / plank spot) keeps its angle in the air, so its toes lift off / land straight
    const tucked = (pin) => pin === DD_P[M] || pin === PLANK_P[M];
    const mv = { at: [(from.at[0] + to.at[0]) / 2, 0.40, to.at[2]], foot: tucked(from) ? frame(from.foot) : tucked(to) ? frame(to.foot) : SFRAME };
    const pins = { ['ankle' + M]: mv, ['ankle' + fixedSide]: fixedPin };
    p.pos = [((a.pos || [0])[0] + (b.pos || [0])[0]) / 2, 0, 0];
    Object.assign(p, fitP(p, ['trunk', 'px', 'py'], (q) => { const J = SI(q, pins).J; return [V.len(V.sub(J.shoulderR, W)) - (B.upper + B.fore - 0.004), J.pelvis[1] - hipY, V.len(V.sub(J['hip' + fixedSide], fixedPin.at)) - kLeg * (B.thigh + B.shin)]; }));
    // the stepping foot passes just behind the hips (knee drawn in under the body), between its two spots
    const px = S(p).J.pelvis[0], lo = Math.min(from.at[0], to.at[0]), hi = Math.max(from.at[0], to.at[0]);
    mv.at[0] = Math.max(lo + 0.1, Math.min(hi - 0.1, px - 0.12)); mv.at[1] = 0.5;
    p.ik = Object.assign({ handL: { at: HAND(-1) }, handR: { at: HAND(1) } }, pins); p.handSurface = MAT; return p; };
  // ---- hands / feet of the A poses
  const IK = { handL: { at: HAND(-1) }, handR: { at: HAND(1) } };
  for (const k of ['fold', 'plank', 'chat', 'updog', 'dd']) { poses[k].ik = Object.assign({}, IK); poses[k].handSurface = MAT; }
  poses.up.handSurface = MAT;
  for (const k of ['up', 'fold', 'plank', 'chat', 'updog', 'dd']) pinFK(poses[k]);
  for (const k of ['fold', 'plank', 'dd']) poses[k]._px = S(poses[k]).J.pelvis[0];
  // ---- lunges: 8 = right foot forward (from Down Dog), 3 = right foot back (from the fold, left foot in front)
  poses.l8 = lunge('R', 'L'); poses.l8._px = S(poses.l8).J.pelvis[0];
  poses.l3 = lunge('L', 'R'); poses.l3._px = S(poses.l3).J.pelvis[0];
  poses.l8up = lup('R', 'L', LUP('R', 'L'), 2); poses.l8mid = lup('R', 'L', LMID('R', 'L'), 30, 0.06);
  poses.l3up = lup('L', 'R', LUP('L', 'R'), 2); poses.l3mid = lup('L', 'R', LMID('L', 'R'), 30, 0.06);
  for (const k of ['l8mid', 'l3mid']) { const q = S(poses[k]); /* arms forward: FK hands already set by lup */ void q; }
  // steps
  poses.s8 = step(poses.dd, poses.l8, 'R', DD_P.R, FOLD_P.R, 'L', DD_P.L, 0.72);        // Down Dog -> lunge 8
  poses.s9 = step(poses.l8, poses.fold, 'L', DD_P.L, FOLD_P.L, 'R', FOLD_P.R, 0.72, 0.9);     // lunge 8 -> fold
  poses.s3 = step(poses.fold, poses.l3, 'R', FOLD_P.R, DD_P.R, 'L', FOLD_P.L, 0.72, 0.9);     // fold -> lunge 3
  poses.s4 = step(poses.l3, poses.plank, 'L', FOLD_P.L, PLANK_P.L, 'R', DD_P.R, 0.66);   // lunge 3 -> plank
  // ---- mistakes (at the lunge 8 arms-up rest)
  for (const [at, mp] of mistakes) {
    const base = poses[at];
    if (mp.shinTilt) {   // front knee past the toes: hips slide forward, the back knee lifts off the mat a little
      const q = lup('R', 'L', Object.assign({}, base, { hipR: base.hipR + 5, kneeR: base.kneeR + 15 }), base.trunk, Math.sin(mp.shinTilt * Math.PI / 180) * B.shin, KNEE_Y + 0.14);
      Object.assign(mp, { hipR: q.hipR, kneeR: q.kneeR, hipL: q.hipL, pos: q.pos, ik: q.ik }); delete mp.shinTilt;
    } else { const q = SI(Object.assign({}, base, mp), base.ik); mp.ik = Object.assign({}, base.ik, { handL: { at: q.J.handL.slice() }, handR: { at: q.J.handR.slice() } }); }
  }
  // ---- playback representation (see B): pelvis placed directly, all hands/feet world IK targets
  const toPelvis = (p) => { const P = S(p).J.pelvis; p.pos = [P[0], 0, P[2]]; p.ground = [['pelvis', P[1] - 0.1]]; return p; };
  for (const [at, mp] of mistakes) { const m = toPelvis(Object.assign({}, poses[at], mp)); mp.pos = m.pos; mp.ground = m.ground; }
  for (const k in poses) { toPelvis(poses[k]); delete poses[k]._px; }
  MAT_AT = [DX + 0.62, 0, 0];
  return poses;
}

window.EXERCISE = {
  id: 'sun_salutation_c',
  name: { tr: 'Güneşe Selam C (Surya Namaskar C)', en: 'Sun Salutation C (Surya Namaskar C)', es: 'Saludo al sol C' },
  category: { tr: 'Yoga · Akış', en: 'Yoga · Flow', es: 'Yoga · Secuencia' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['quads', 'delts', 'triceps', 'core', 'hamstrings'],
  tempo: '1 nefes / hareket',
  tempoReps: 1,
  maxDuration: 80,
  cuesReplay: false,
  repLabel: { tr: 'TUR', en: 'ROUND', es: 'RONDA' },
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 30, pitch: 12, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Ön diz bileğin üstünde, eller omuz genişliğinde', en: 'Front knee over the ankle, hands shoulder-width', es: 'Rodilla sobre el tobillo, manos al ancho de hombros' } },
  contacts: ['heelR', 'ballR', 'kneeL', 'ballL'],
  get props() { void this.poses; return [['mat', { at: MAT_AT, length: 1.95 }]]; },
  ctx: CTX_RUN,
  get poses() { return this._poses || (this._poses = build(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'l8up',
  rep: [
    { to: 'l8mid', dur: 1.0, phase: 0, card: false },
    { to: 'l8', dur: 0.8, phase: 0, card: false },
    { to: 's9', dur: 0.75, phase: 0, card: false },
    { to: 'fold', dur: 0.9, phase: 0, card: false },
    { to: 'up', dur: 2.6, phase: 0 },
    { to: 'fold', dur: 2.4, phase: 1 },
    { to: 's3', dur: 0.75, phase: 2, card: false },
    { to: 'l3', dur: 0.6, phase: 2, card: false },
    { to: 'l3mid', dur: 1.0, phase: 2, card: false },
    { to: 'l3up', dur: 1.0, phase: 2 },
    { to: 'l3mid', dur: 1.0, phase: 3, card: false },
    { to: 'l3', dur: 0.8, phase: 3, card: false },
    { to: 's4', dur: 0.75, phase: 3, card: false },
    { to: 'plank', dur: 0.6, phase: 3 },
    { to: 'chat', dur: 0.9, phase: 4 },
    { to: 'updog', dur: 0.8, phase: 4, card: false },
    { to: 'dd', dur: 0.8, phase: 4, card: false },
    { to: 's8', dur: 0.75, phase: 5, card: false },
    { to: 'l8', dur: 0.6, phase: 5, card: false },
    { to: 'l8mid', dur: 1.0, phase: 5, card: false },
    { to: 'l8up', dur: 1.0, phase: 5 },
  ],
  setup: { tr: 'Döngü sağ ayak öndeki alçak hamlede başlar. Her turda öndeki bacağı değiştir.',
    en: 'The loop starts in the low lunge, right foot forward. Switch the front leg each round.',
    es: 'El ciclo empieza en zancada baja, pie derecho delante. Alterna la pierna cada ronda.' },
  phases: [
    { name: { tr: 'Kollar yukarı', en: 'Arms up', es: 'Brazos arriba' }, breath: 'in', slow: 1.0,
      text: { tr: 'Sol ayak öne, katlan; düz sırtla kalk.', en: 'Step left forward, fold, rise tall.', es: 'Pie izquierdo adelante, pliégate, sube.' } },
    { name: { tr: 'Öne katlan', en: 'Fold', es: 'Flexión' }, breath: 'out', slow: 1.05,
      text: { tr: 'Kalçadan katlan, avuçlar yere.', en: 'Hinge at the hips, palms down.', es: 'Flexiona desde la cadera.' } },
    { name: { tr: 'Alçak hamle', en: 'Low lunge', es: 'Zancada baja' }, breath: 'in', slow: 1.0, line: ['kneeL', 'ankleL'],
      text: { tr: 'Sağ ayak geri, kollar yukarı.', en: 'Right foot back, arms up.', es: 'Pie derecho atrás, brazos arriba.' } },
    { name: { tr: 'Plank', en: 'Plank', es: 'Plancha' }, breath: 'out', slow: 1.2, line: ['ankleR', 'pelvis', 'shoulderR'],
      text: { tr: 'Eller yere, sol ayak geri.', en: 'Hands down, step left back.', es: 'Manos abajo, pie izquierdo atrás.' } },
    { name: { tr: 'Vinyasa', en: 'Vinyasa', es: 'Vinyasa' }, breath: 'out', slow: 1.2,
      text: { tr: 'Chaturanga, yukarı ve aşağı köpek.', en: 'Chaturanga, Up Dog, Down Dog.', es: 'Chaturanga, perro arriba y abajo.' } },
    { name: { tr: 'Diğer taraf', en: 'Other side', es: 'Otro lado' }, breath: 'in', slow: 1.0, line: ['kneeR', 'ankleR'],
      text: { tr: 'Sağ ayak öne, kollar yukarı.', en: 'Right foot forward, arms up.', es: 'Pie derecho delante, brazos arriba.' } },
  ],
  tempoText: { tr: 'Her harekete bir nefes', en: 'One breath per movement', es: 'Una respiración por movimiento' },
  mistakes: [
    { title: { tr: 'Ön diz parmakları geçiyor', en: 'Front knee past the toes', es: 'Rodilla pasa los dedos' },
      text: { tr: 'Kalça öne kayar, diz ayak ucunun önüne çıkar.', en: 'The hips slide forward, the knee passes the toes.', es: 'La cadera va adelante, la rodilla pasa los dedos.' },
      fix: { tr: 'Ön ayağı biraz öne al', en: 'Step the front foot out', es: 'Adelanta el pie' },
      fixText: { tr: 'Diz bileğin üstünde, kaval dik', en: 'Knee over the ankle, shin vertical', es: 'Rodilla sobre el tobillo' },
      at: 'l8up', pose: { shinTilt: 32 }, marks: ['kneeR', 'toeR'], parts: ['thighR', 'shinR'] },
    { title: { tr: 'Bel çukurlaşıyor', en: 'Low back arches', es: 'La lumbar se arquea' },
      text: { tr: 'Kollar yukarıdayken kaburgalar öne açılır.', en: 'With the arms up the ribs flare forward.', es: 'Con los brazos arriba, las costillas se abren.' },
      fix: { tr: 'Kaburgaları indir, karın aktif', en: 'Ribs down, core on', es: 'Costillas abajo, abdomen activo' },
      fixText: { tr: 'Kuyruk sokumu aşağı, bel uzun', en: 'Tailbone down, long low back', es: 'Coxis abajo, lumbar larga' },
      at: 'l8up', pose: { lumbar: -16, thoracic: -8, neck: -24 }, line: ['pelvis', 'waist', 'neck'], goodLine: ['pelvis', 'neck'], parts: ['waist', 'pelvis'] },
  ],
  cues: [{ tr: 'Nefes hareketi yönetir', en: 'Breath leads movement', es: 'La respiración guía' },
    { tr: 'Ön diz bileğin üstünde', en: 'Front knee over the ankle', es: 'Rodilla sobre el tobillo' },
    { tr: 'Chaturanga\'da karın güçlü', en: 'Core strong in Chaturanga', es: 'Abdomen firme en Chaturanga' }],
};
}
