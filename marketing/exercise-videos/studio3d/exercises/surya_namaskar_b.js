/* Surya Namaskar B (Sun Salutation B). Side view. A flow (maxDuration 80, cuesReplay false), built on surya_namaskar_a.js.
 * Condensed loop in the true order, starting in Warrior I right (rest; both spec mistakes are Warrior/Chair faults and the
 * mistake chapter morphs rest <-> mistake, so the rest must sit next to them):
 *   Warrior I R (7) -> hands down, step back -> Chaturanga (8) -> Up Dog (9) -> Down Dog (10/14) -> jump forward -> fold (16)
 *   -> Chair (17 = 1) -> fold (2) -> jump back -> Chaturanga (4) -> Up Dog (5) -> Down Dog (6) -> step forward -> Warrior I R (7).
 *   Skipped: Samasthiti, both half lifts, Warrior I left + its vinyasa (said in the setup card).
 * Geometry (build(), lazy, after the rig sets FB.BODY), same base as A:
 *   - toes anchored, single contact [toeR] (heights change only); floor poses solved on [toeR, wristR] then converted.
 *   - hands: world IK targets on one mat spot H in every hands-down pose; Chair uses A's 'up' trick (body-relative overhead
 *     target carried through fold <-> chair, fold fitted so the target lands on H). Warrior: world IK targets = the FK hands
 *     of the pose (arms overhead), with an in-between key 'warMid' (arms forward at shoulder height) so the hands sweep in
 *     front of the body; handFlat false there (the palm flattens at the lunge key).
 *   - FEET NEVER GLIDE: every pose carries ankle IK targets (ankle + foot frame). Feet-together poses take them from their
 *     own FK solution; jumps pass through 'air' (card: false, toes 30 cm up). Steps: 'step' (card: false) lifts the right
 *     foot halfway between the back spot (Down Dog / plank toes) and the front spot (fold feet, between the hands) while the
 *     left foot stays. Warrior I: the left foot pivots on the ball (same ball point as in Down Dog) to flat + 50° turnout,
 *     so its ball never moves; the right foot sits exactly on the fold foot spot.
 *   - the toe anchor uses the FK toes, so flat/flatL/flatR never change inside the step/lunge/warrior group (a boolean
 *     switches at mid-transition and would shift the whole body); those poses use flat: false (feet come from the pins).
 *   - lunge / warrior bodies are solved numerically (trunk, hips, knee, root x/y): front foot on its spot, straight back leg
 *     reaching its pin, straight arms reaching the hand spot (lunge) or front shin vertical (warrior).
 * Spec notes: stance ~1 m (Down Dog length); Warrior back-hip extension is set by the geometry (see warrior_1.js). */
{
const MAT = 0.012;
const CTX = { anchorX: ['toeL', 'toeR'], anchorAt: [0, 0] };          // build-time solving (A's construction)
const CTX_RUN = { anchorX: ['pelvis'], anchorAt: [0, 0] };            // playback: pelvis placed explicitly (see toPelvis)
const POLE = [-1, -0.25, 0.22];
const GS = [['toeR', MAT]];
const GF = [['toeR', MAT], ['wristR', MAT + 0.012]];
const ARM = { elbowPole: POLE, curl: 0.12, pos: [0, 0, 0] };
const UPARM = { sh: 172, shAbd: 8, el: 3, palm: 'in', handFlat: false };
const RAW = {
  chair: Object.assign({ trunk: 39, hip: 94, knee: 88, abd: 2, thoracic: -6, neck: -14, ground: GS }, ARM, UPARM),
  fold: Object.assign({ trunk: 110, hip: 112, knee: 6, lumbar: 20, thoracic: 20, neck: 8, sh: 120, el: 2, ground: GS }, ARM),
  plank: Object.assign({ trunk: 82, hip: 0, knee: 0, ankle: -40, flat: false, sh: 80, shAbd: 6, el: 0, neck: -4, ground: GF }, ARM),
  air: Object.assign({ trunk: 120, hip: 125, knee: 80, ankle: -35, flat: false, lumbar: 12, thoracic: 10, neck: -12, sh: 120, shAbd: 6, el: 0, ground: GS }, ARM),
  chat: Object.assign({ trunk: 82, hip: 0, knee: 0, ankle: -50, flat: false, sh: 10, shAbd: 6, el: 90, neck: -6, ground: GF }, ARM),
  updog: Object.assign({ trunk: 50, hip: -22, knee: 0, ankle: -42, flat: false, lumbar: -20, thoracic: -14, neck: -20, sh: 40, shAbd: 6, el: 0, ground: GF }, ARM),
  dd: Object.assign({ trunk: 135, hip: 104, knee: 3, ankle: 18, flat: false, sh: 168, shAbd: 6, el: 0, neck: -4, ground: GF }, ARM),
  // right leg forward, left leg back (pinned); trunk/hips/root solved in build()
  lunge: Object.assign({ trunk: 60, hipR: 125, kneeR: 95, hipL: -10, kneeL: 4, flat: false, ankleL: 10, lumbar: 6, thoracic: 6, neck: -10, sh: 70, shAbd: 6, el: 0, ground: GS }, ARM),
  warMid: Object.assign({ trunk: 22, hipR: 105, kneeR: 92, hipL: -30, kneeL: 2, hrotL: 20, flat: false, footOutL: 30, neck: -6, sh: 95, shAbd: 6, el: 3, palm: 'in', handFlat: false, ground: GS }, ARM),
  war: Object.assign({ trunk: 0, hipR: 97, kneeR: 92, hipL: -40, kneeL: 0, abd: 3, hrotR: 4, hrotL: 34, footOutL: 50, flat: false, thoracic: -5, neck: -18, ground: GS }, ARM, UPARM),
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
  // damped Gauss-Newton over pose keys (finite differences); 'px'/'py' = root offset (pos). res(J) -> residuals
  let lastRes = 0;
  const fit = (q, keys, res) => {
    const P = (x) => { const p = Object.assign({}, q, { pos: (q.pos || [0, 0, 0]).slice() }); keys.forEach((k, i) => { if (k === 'px') p.pos[0] = x[i]; else if (k === 'py') p.pos[1] = x[i]; else p[k] = x[i]; }); return p; };
    const R = (x) => res(S(P(x)).J);
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
    lastRes = Math.hypot(...R(x)); if (lastRes > 1e-3) console.warn('fit residual', keys.join(','), lastRes.toFixed(4));
    return P(x);
  };
  const LEG = B.thigh + B.shin;
  const frame = (F) => [F[0].slice(), F[1].slice(), F[2].slice()];
  // ---- A's base: chair (instead of 'up') body-relative overhead target, fold fitted to it, hand spot H
  const holdOf = (q, s, at) => { const d = V.sub(at, q.J.chest), T = q.F.thorax, sg = s === 'R' ? 1 : -1; return [V.dot(d, T[0]), V.dot(d, T[1]), V.dot(d, T[2]) * sg]; };
  const qc = S(poses.chair);
  poses.chair.holdR = holdOf(qc, 'R', qc.J.handR); poses.chair.holdL = holdOf(qc, 'L', qc.J.handL);
  const HZ = poses.chair.holdR[2];
  const tgt = (p) => { const q = S(p); return V.add(q.J.chest, FB.M.apply(q.F.thorax, poses.chair.holdR)); };
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
  { const AIR_H = 0.30, q = poses.air;
    const rel = (J) => [J.wristR[0] - J.toeR[0], J.wristR[1] - J.toeR[1]];
    Object.assign(q, fit(q, ['trunk', 'hip', 'sh'], (J) => { const r = rel(J); return [r[0] - (W[0] - DX / 2), r[1] - (W[1] - AIR_H), J.shoulderR[0] - J.wristR[0] - 0.06]; }));
    const J = S(q).J; q.ground = [['toeR', MAT + W[1] - J.wristR[1]]]; q.pos = [W[0] - J.wristR[0], 0, 0]; }
  const toSingle = (p) => {
    const Wy = S(p).J.wristR[1], q = Object.assign({}, p, { ground: GS }), t0 = p.trunk;
    p.trunk = bis((t) => S(Object.assign({}, q, { trunk: t })).J.wristR[1] - Wy, t0 - 60, t0 + 60); p.ground = GS;
  };
  for (const k of ['plank', 'chat', 'updog', 'dd']) toSingle(poses[k]);
  // ---- foot pins
  const pinOf = (q, s) => ({ at: q.J['ankle' + s].slice(), foot: frame(q.F['foot' + s]) });
  const pinFK = (p) => { const q = S(p); p.ik = Object.assign({}, p.ik, { ankleL: pinOf(q, 'L'), ankleR: pinOf(q, 'R') }); };
  const qdd = S(poses.dd), qfold = S(poses.fold);
  const BACK_DD = pinOf(qdd, 'L');                 // left foot in Down Dog (on the ball, heel up)
  // right foot stepped between the hands (toes level with the palm centres): flat, pointing forward
  const FRONT = pinOf(qfold, 'R'); FRONT.at[0] += HX - 0.12 - qfold.J.toeR[0];
  // Warrior back foot: flat, turned out 50°, pivoted about the Down Dog ball point
  const ballDD = qdd.J.ballL;
  const a50 = 50 * Math.PI / 180, fw = [Math.cos(a50), 0, -Math.sin(a50)], upv = [0, 1, 0];
  const FB50 = [fw, upv, V.cross(fw, upv)];
  const BACK_W = { at: V.sub(ballDD, FB.M.apply(FB50, [B.toe * 0.72, -B.ankleH, 0])), foot: FB50 };
  BACK_W.at[1] = MAT + B.ankleH;
  // back thigh pointed at its pin (stable knee pole, consistent measure)
  const aimBack = (p, pin) => { const q = S(p), d = V.sub(pin.at, q.J.hipL); const up = V.norm(V.sub(q.J.neck, q.J.pelvis)), f = q.F.pelvis[0]; p.hipL = Math.atan2(V.dot(d, f), -V.dot(d, up)) * 180 / Math.PI; };
  // fit + aim the back thigh, repeated: aiming moves the FK back toe, which moves the toe anchor (and so the root)
  const fitAim = (p, keys, res, pin) => { for (let i = 0; i < 5; i++) { Object.assign(p, fit(p, keys, res)); aimBack(p, pin); p.pos[2] -= S(p).J.pelvis[2]; } Object.assign(p, fit(p, keys, res)); };
  const frontRes = (J) => [J.ankleR[0] - FRONT.at[0], J.ankleR[1] - FRONT.at[1]];
  const backLen = (J, pin, k = 0.996) => V.len(V.sub(J.hipL, pin.at)) - LEG * k;
  // lunge: front foot on its spot, straight arms on W, back leg (nearly straight) on the Down Dog pin
  { const p = poses.lunge; p.pos = [DX / 2, 0, 0];
    // arms: the free (non-flat) hand of the warMid <-> lunge sweep reaches the hand target almost straight, so the
    // palm-flattening switch at the lunge key moves the elbow only a few cm
    fitAim(p, ['trunk', 'hipR', 'px', 'py'], (J) => [...frontRes(J), V.len(V.sub(J.shoulderR, HAND(1))) - (B.upper + B.fore + B.hand * 0.55 - 0.004), backLen(J, BACK_DD, 0.99)], BACK_DD); }
  // warrior: trunk upright, front shin vertical, front foot on its spot, straight back leg on the pivoted pin
  { const p = poses.war; p.pos = [DX / 2, 0, 0];
    fitAim(p, ['hipR', 'kneeR', 'px', 'py'], (J) => [...frontRes(J), J.kneeR[0] - J.ankleR[0] - 0.02, backLen(J, BACK_W)], BACK_W); }
  // warMid: halfway up, front foot on its spot, back leg on the pivoted pin
  { const p = poses.warMid; p.pos = poses.war.pos.slice();
    fitAim(p, ['hipR', 'px', 'py'], (J) => [...frontRes(J), backLen(J, BACK_W, 0.993)], BACK_W); }
  // step: body between Down Dog and lunge, right foot lifted halfway (knee drawn in), left foot on its pin
  { const a = poses.dd, b = poses.lunge, p = Object.assign({}, b);
    for (const k of ['trunk', 'lumbar', 'thoracic', 'neck', 'sh']) p[k] = ((a[k] || 0) + (b[k] || 0)) / 2;
    p.hipR = 120; p.kneeR = 110; p.ankleR = -10; p.pos = [(a.pos[0] + b.pos[0]) / 2, (b.pos[1] || 0) / 2 + 0.06, 0];
    // hips high (knee drawn in under the chest), straight arms on W, back leg on its pin
    fitAim(p, ['trunk', 'px', 'py'], (J) => [V.len(V.sub(J.shoulderR, W)) - (B.upper + B.fore - 0.004), backLen(J, BACK_DD, 0.985), J.pelvis[1] - 0.70], BACK_DD); poses.step = p; }
  // stepping foot: halfway between its Down Dog spot and FRONT, ankle 40 cm up, foot nearly flat (toes 15° down) so the
  // toes leave the mat together with the heel (no toe drag)
  const t15 = 15 * Math.PI / 180, sfw = [Math.cos(t15), -Math.sin(t15), 0], sup = [Math.sin(t15), Math.cos(t15), 0];
  const STEP_R = { at: [(qdd.J.ankleR[0] + FRONT.at[0]) / 2, 0.40, FRONT.at[2]], foot: [sfw, sup, V.cross(sfw, sup)] };
  // ---- hands
  const IK = { handL: { at: HAND(-1) }, handR: { at: HAND(1) } };
  for (const k of ['fold', 'plank', 'air', 'chat', 'updog', 'dd', 'lunge', 'step']) { poses[k].ik = Object.assign({}, IK); poses[k].handSurface = MAT; }
  poses.chair.handSurface = MAT;
  const fkHands = (p) => { const q = S(p); p.ik = Object.assign({}, p.ik, { handL: { at: q.J.handL.slice() }, handR: { at: q.J.handR.slice() } }); };
  fkHands(poses.war); fkHands(poses.warMid);
  // ---- feet
  for (const k of ['chair', 'fold', 'plank', 'air', 'chat', 'updog', 'dd']) pinFK(poses[k]);
  poses.lunge.ik.ankleL = BACK_DD; poses.lunge.ik.ankleR = FRONT;
  poses.step.ik.ankleL = BACK_DD; poses.step.ik.ankleR = STEP_R;
  for (const k of ['war', 'warMid']) { poses[k].ik.ankleL = BACK_W; poses[k].ik.ankleR = FRONT; }
  // ---- mistakes (Warrior I): re-fit with the same pins, hands = FK hands of the mistake body
  for (const [at, mp] of mistakes) {
    const base = poses[at], m = Object.assign({}, base, mp);
    if (mp.heelUp) {      // back heel lifted: the left foot back on the ball (Down Dog foot), back knee soft
      const q = Object.assign({}, m, { hrotL: 4, footOutL: 0 }); fitAim(q, ['hipR', 'px', 'py'], (J) => [...frontRes(J), backLen(J, BACK_DD, 0.985)], BACK_DD); Object.assign(mp, { hipR: q.hipR, hipL: q.hipL, hrotL: 4, footOutL: 0, kneeL: m.kneeL, pos: q.pos });
      mp.ik = Object.assign({}, base.ik, { ankleL: BACK_DD }); delete mp.heelUp;
    } else mp.ik = Object.assign({}, base.ik);   // knee caving in: FK hip rotation only (the IK knee follows the FK knee direction)
    const qm = S(Object.assign({}, base, mp)); mp.ik.handL = { at: qm.J.handL.slice() }; mp.ik.handR = { at: qm.J.handR.slice() };
  }
  // ---- playback representation: the pelvis is placed directly (anchor = pelvis, single contact 'pelvis' at its height,
  // pos = its x/z), every hand and foot is a world IK target. Between keys the hips then move on a near-straight line, so
  // a pinned leg never over-reaches (with the toe anchor the root swung with the FK leg angles and the pinned feet/hands
  // were pulled 6-12 cm off their spots mid-transition).
  const toPelvis = (p) => { const P = S(p).J.pelvis; p.pos = [P[0], 0, P[2]]; p.ground = [['pelvis', P[1] - 0.1]]; return p; };
  for (const [at, mp] of mistakes) { const m = toPelvis(Object.assign({}, poses[at], mp)); mp.pos = m.pos; mp.ground = m.ground; }
  for (const k in poses) toPelvis(poses[k]);
  MAT_AT = [DX + 0.62, 0, 0];
  return poses;
}

window.EXERCISE = {
  id: 'surya_namaskar_b',
  name: { tr: 'Surya Namaskar B (Güneşe Selam B)', en: 'Surya Namaskar B (Sun Salutation B)', es: 'Saludo al sol B' },
  category: { tr: 'Yoga · Akış', en: 'Yoga · Flow', es: 'Yoga · Secuencia' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['quads', 'glutes', 'delts', 'triceps', 'core'],
  tempo: '1 nefes / hareket',
  tempoReps: 1,
  maxDuration: 80,
  cuesReplay: false,
  repLabel: { tr: 'TUR', en: 'ROUND', es: 'RONDA' },
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 30, pitch: 12, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Arka ayak dışa dönük, topuk yerde', en: 'Back foot turned out, heel down', es: 'Pie trasero girado, talón abajo' } },
  contacts: ['heelR', 'ballR', 'heelL', 'ballL'],
  get props() { void this.poses; return [['mat', { at: MAT_AT, length: 1.95 }]]; },
  ctx: CTX_RUN,
  get poses() { return this._poses || (this._poses = build(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'war',
  rep: [
    { to: 'warMid', dur: 0.8, phase: 0, card: false },
    { to: 'lunge', dur: 0.8, phase: 0 },
    { to: 'step', dur: 0.6, phase: 1, card: false },
    { to: 'plank', dur: 0.6, phase: 1, card: false },
    { to: 'chat', dur: 0.9, phase: 1 },
    { to: 'updog', dur: 0.9, phase: 2 },
    { to: 'dd', dur: 0.9, phase: 3 },
    { to: 'air', dur: 0.8, phase: 4, card: false },
    { to: 'fold', dur: 0.6, phase: 4, card: false },
    { to: 'chair', dur: 2.6, phase: 4 },
    { to: 'fold', dur: 2.4, phase: 5 },
    { to: 'air', dur: 0.8, phase: 6, card: false },
    { to: 'plank', dur: 0.6, phase: 6, card: false },
    { to: 'chat', dur: 0.9, phase: 6 },
    { to: 'updog', dur: 0.9, phase: 6, card: false },
    { to: 'dd', dur: 0.9, phase: 6, card: false },
    { to: 'step', dur: 0.6, phase: 7, card: false },
    { to: 'lunge', dur: 0.6, phase: 7, card: false },
    { to: 'warMid', dur: 0.9, phase: 7, card: false },
    { to: 'war', dur: 1.2, phase: 7 },
  ],
  setup: { tr: 'Döngü sağ Savaşçı I\'den başlar. Tam akışta sol tarafı da yap, sonra öne zıpla.',
    en: 'The loop starts in Warrior I right. In the full flow do the left side too, then jump forward.',
    es: 'El ciclo empieza en guerrero I derecho. En la serie completa haz también el izquierdo.' },
  phases: [
    { name: { tr: 'Eller yere', en: 'Hands down', es: 'Manos al suelo' }, breath: 'out', slow: 1.0,
      text: { tr: 'Kollar öne, eller yere.', en: 'Arms sweep down to the mat.', es: 'Brazos abajo al suelo.' } },
    { name: { tr: 'Chaturanga', en: 'Chaturanga', es: 'Chaturanga' }, breath: 'out', slow: 1.2,
      text: { tr: 'Sağ ayak geri, plank\'tan in.', en: 'Step back, lower from plank.', es: 'Pie atrás, baja desde plancha.' } },
    { name: { tr: 'Yukarı köpek', en: 'Up Dog', es: 'Perro arriba' }, breath: 'in', slow: 1.1,
      text: { tr: 'Göğsü aç, kollar düz.', en: 'Open the chest, arms straight.', es: 'Abre el pecho, brazos rectos.' } },
    { name: { tr: 'Aşağı köpek', en: 'Down Dog', es: 'Perro abajo' }, breath: 'out', slow: 1.1,
      text: { tr: 'Kalça yukarı. Sonda 5 nefes.', en: 'Hips up. 5 breaths at the end.', es: 'Cadera arriba, 5 respiraciones.' } },
    { name: { tr: 'Sandalye', en: 'Chair', es: 'Silla' }, breath: 'in', slow: 1.0, arc: ['hipR', 'kneeR', 'ankleR'],
      text: { tr: 'Öne zıpla, otur, kollar yukarı.', en: 'Jump forward, sit back, arms up.', es: 'Salta, siéntate, brazos arriba.' } },
    { name: { tr: 'Öne katlan', en: 'Fold', es: 'Flexión' }, breath: 'out', slow: 1.0,
      text: { tr: 'Bacakları düzelt, avuçlar yere.', en: 'Straighten the legs, palms down.', es: 'Estira las piernas, palmas al suelo.' } },
    { name: { tr: 'Vinyasa', en: 'Vinyasa', es: 'Vinyasa' }, breath: 'out', slow: 1.2,
      text: { tr: 'Geri zıpla, chaturanga, iki köpek.', en: 'Jump back, Chaturanga, Up and Down Dog.', es: 'Salta atrás, chaturanga, perros.' } },
    { name: { tr: 'Savaşçı I', en: 'Warrior I', es: 'Guerrero I' }, breath: 'in', slow: 1.0, arc: ['hipR', 'kneeR', 'ankleR'],
      text: { tr: 'Sağ ayak öne, arka topuk yere, kollar yukarı.', en: 'Right foot forward, back heel down, arms up.', es: 'Pie adelante, talón abajo, brazos arriba.' } },
  ],
  tempoText: { tr: 'Her harekete bir nefes', en: 'One breath per movement', es: 'Una respiración por movimiento' },
  mistakes: [
    { title: { tr: 'Arka topuk havada', en: 'Back heel lifted', es: 'Talón trasero levantado' },
      text: { tr: 'Savaşçı I\'de arka topuk yerden kalkar.', en: 'In Warrior I the back heel hovers.', es: 'En guerrero I el talón trasero se levanta.' },
      fix: { tr: 'Ayağı dışa çevir, topuğu bastır', en: 'Turn the foot out, press the heel', es: 'Gira el pie y apoya el talón' },
      fixText: { tr: 'Arka ayak 45-60° dışa, topuk yerde', en: 'Back foot out 45-60°, heel grounded', es: 'Pie trasero a 45-60°, talón abajo' },
      at: 'war', pose: { heelUp: true, kneeL: 6 }, view: { yaw: 120, pitch: 8 }, marks: ['heelL'], parts: ['footL', 'shinL'] },
    { title: { tr: 'Ön diz içe kaçıyor', en: 'Front knee caves in', es: 'Rodilla delantera hacia dentro' },
      text: { tr: 'Savaşçı I\'de ön diz orta hatta doğru kayar.', en: 'In Warrior I the front knee drifts toward the midline.', es: 'En guerrero I la rodilla se va hacia el centro.' },
      fix: { tr: 'Dizi 2. parmağa yönelt', en: 'Knee over the 2nd toe', es: 'Rodilla sobre el 2.º dedo' },
      fixText: { tr: 'Diz ayak ucu yönünde, bileğin üstünde', en: 'Knee tracks the toes, over the ankle', es: 'Rodilla sobre el pie y el tobillo' },
      at: 'war', pose: { hrotR: -16 }, view: { yaw: 14, pitch: 8 }, marks: ['kneeR'], parts: ['thighR', 'shinR'] },
  ],
  cues: [{ tr: 'Sandalyede kalça geri', en: 'Sink back into Chair', es: 'Cadera atrás en la silla' },
    { tr: 'Savaşçı I\'de kalça öne dönük', en: 'Warrior I with square hips', es: 'Guerrero I con cadera al frente' },
    { tr: 'Akıcı bir chaturanga', en: 'Smooth Chaturanga', es: 'Chaturanga fluida' }],
};
}
