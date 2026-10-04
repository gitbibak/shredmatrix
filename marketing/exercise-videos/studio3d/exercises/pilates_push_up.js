/* Pilates Push-Up. Side view. A flow (maxDuration 80, cuesReplay false), patterned on surya_namaskar_a.js. The loop starts in
 * the plank (rest; the mistake chapter jumps rest <-> mistake pose, a standing rest would morph stand <-> plank in ~1 s):
 *   plank -> 2 push-ups (elbows tucked) -> walk the hands back -> roll up -> roll down -> walk out -> plank.
 * - Toes anchored; every pose rests on the single contact [toeR] (one contact set). Floor poses are first solved on
 *   [toeR, wristR] (toe tips + wrists on the mat) and converted to the equivalent trunk angle on [toeR] (toSingle).
 * - Feet: flat:false everywhere, the ankle is fitted so the heel rests on the mat in stand / fold / walk poses (no flat-flag
 *   switch); in plank and push-up the heels lift (ankle plantarflexed) while the toe tips stay on their spot.
 * - Hands: world IK targets (handL/R) in every pose. stand = the FK hands by the thighs (handFlat false, carried through the
 *   whole roll-down, so the palm turns flat exactly at the fold key while the hand rests on the mat). Walk: each hand moves
 *   on its own between mat spots (H0 near the feet -> A -> B -> C = plank); the step = an in-between
 *   key without a card (`card: false`) with that hand lifted (handSurface raised 6 cm, target kept < 7.5 cm so it stays a flat
 *   palm). The supporting hand never moves, so nothing slides.
 * - Body per walk stage: fold/plank parameters blended by the stage fraction, then the trunk is bisected so the shoulders are
 *   at full reach from the wrist spots (straight arms). Push-up bottom: [toeR, chest 11 cm] then converted; the elbows bend
 *   by IK on the fixed hand targets with a pole toward the feet (elbows hug the ribs, spec elbow abduction ~10°).
 * - Plank: shoulders ~14 cm ahead of the wrists (sh 56, as push_up.js / chaturanga.js): with the toe pivot the shoulders cannot
 *   travel forward, and stacked shoulders made the bottom fold the arms in a vertical plane (elbow 140° at chest height 0.2).
 *   Bottom: chest joint 0.315 m -> elbow flexion ~99 (spec 90), chest lowers ~21 cm (spec 25-30).
 * - Roll-down: the rig's hands only reach the mat with knees ~40° and the pelvis->neck line ~137° from vertical (spec 110 / knees
 *   10 is a very flexible mover); spine flexion lumbar 12 / thoracic 22 keeps the shoulders ahead of the toes.
 * - The palm-flattening switch (handFlat false -> auto) happens at the fold key; the fold hand target sits 1.15 cm above the
 *   floor (the flat palm ignores its height) so the free hand reaches almost straight and the switch moves the elbow < 3 cm. */
{
const MAT = 0.012;
const CTX = { anchorX: ['toeL', 'toeR'], anchorAt: [-0.55, 0] };
const GS = [['toeR', MAT]];
const GF = [['toeR', MAT], ['wristR', MAT + 0.012]];
const POLE = [-1, -0.2, 0.25];
const HZ = 0.2;            // hands a little wider than the shoulders
const CHEST_Y = 0.315;    // push-up bottom: chest joint height -> elbow flexion ~95 (arc ~85°), chest lowers ~21 cm
const LIFT = 0.06;         // hand step height (palm)
const COMMON = { flat: false, elbowPole: POLE, abd: 2, curl: 0.12, ground: GS };
const STAND = { ...COMMON, trunk: 0, hip: 0, knee: 2, ankle: 0, neck: 0, sh: 0, shAbd: 6, el: 4, palm: 'in', handFlat: false };
const FOLD = { ...COMMON, trunk: 100, hip: 104, knee: 42, ankle: 0, lumbar: 12, thoracic: 22, neck: 30, sh: 150, shAbd: 4, el: 0 };
const PLANK = { ...COMMON, trunk: 82, hip: 0, knee: 0, ankle: -36, lumbar: 0, thoracic: 0, neck: -4, sh: 56, shAbd: 4, el: 0 };
const BLEND = ['trunk', 'hip', 'knee', 'lumbar', 'thoracic', 'neck', 'sh'];

function build(ex) {
  const { V, solve, expand, BODY: B } = FB;
  const S = (p, g = GS) => solve(expand(Object.assign({}, p, { ik: undefined, ground: g, holdL: undefined, holdR: undefined })), CTX);
  const bis = (f, lo, hi) => { let flo = f(lo); for (let i = 0; i < 44; i++) { const m = (lo + hi) / 2, fm = f(m); if ((fm > 0) === (flo > 0)) { lo = m; flo = fm; } else hi = m; } return +((lo + hi) / 2).toFixed(3); };
  const REACH = B.upper + B.fore - 0.0008;
  // root nearest to 0: scan outward in 1° steps for a sign change, then bisect inside that bracket
  const near0 = (f, lim = 40) => { const f0 = f(0); if (Math.abs(f0) < 1e-5) return 0;
    for (let k = 1; k <= lim; k++) for (const sg of [1, -1]) { const a = sg * (k - 1), b = sg * k; if ((f(b) > 0) !== (f0 > 0) || (f(b) > 0) !== (f(a) > 0)) return bis(f, a, b); }
    return 0; };
  const wristOf = (x, z) => [x - B.hand * 0.6, MAT + 0.042, z];           // flat-hand wrist for a palm centred at x
  // heel on the mat: fit the ankle
  const heelDown = (p) => { const a0 = p.ankle || 0; p.ankle = +(a0 + near0((d) => { const J = S(Object.assign({}, p, { ankle: a0 + d })).J; return J.heelR[1] - J.toeR[1]; }, 60)).toFixed(3); };
  // two-contact floor pose -> equivalent trunk on [toeR]
  const toSingle = (p) => { const Wy = S(p, GF).J.wristR[1], t0 = p.trunk; p.trunk = +(t0 + near0((d) => S(Object.assign({}, p, { trunk: t0 + d })).J.wristR[1] - Wy)).toFixed(3); };
  // plank: shoulders over the wrists; its wrist spot defines C
  const plank = Object.assign({}, PLANK); const Jp = S(plank, GF).J; const CX = Jp.wristR[0] + B.hand * 0.6; toSingle(plank);
  // fold: trunk so the shoulder is at full reach from the near wrist spot H0 (a little ahead of the toes)
  const fold = Object.assign({}, FOLD); heelDown(fold);
  const toe = S(fold).J.toeR;
  // fold: trunk (with hip, so the legs stay) bisected until the shoulder is one straight arm above the mat; the hands land
  // under the shoulders (arms hang vertically), H0 = that spot
  { const t0 = fold.trunk, h0 = fold.hip;
    const d = near0((dt) => S(Object.assign({}, fold, { trunk: t0 + dt, hip: h0 + dt })).J.shoulderR[1] - (MAT + 0.042 + REACH * 0.995));
    fold.trunk = +(t0 + d).toFixed(2); fold.hip = +(h0 + d).toFixed(2); heelDown(fold); }
  const H0 = S(fold).J.shoulderR[0] + B.hand * 0.6 + 0.14;   // a little ahead of the shoulders: the arm slopes forward, which keeps the palm-flattening step at the fold key small
  const fitReach = (p, x) => { const t0 = p.trunk, h0 = p.hip;
    const d = near0((dt) => V.len(V.sub(wristOf(x, HZ), S(Object.assign({}, p, { trunk: t0 + dt, hip: h0 + dt })).J.shoulderR)) - REACH);
    p.trunk = +(t0 + d).toFixed(2); p.hip = +(h0 + d).toFixed(2); };
  fitReach(fold, H0);
  const stand = Object.assign({}, STAND); heelDown(stand);
  // walk stages: f along fold -> plank, hand spots
  const A = H0 + (CX - H0) * 0.45, Bx = H0 + (CX - H0) * 0.8;
  const stage = (f, xr, xl) => {
    const p = Object.assign({}, COMMON);
    for (const k of BLEND) p[k] = FOLD[k] + (PLANK[k] - FOLD[k]) * f;
    p.trunk = fold.trunk + (plank.trunk - fold.trunk) * f; p.hip = fold.hip + (PLANK.hip - fold.hip) * f;
    p.shAbd = 4; p.el = 0;
    if (f < 0.75) { heelDown(p); } else p.ankle = -36 * (f - 0.75) / 0.25;
    fitReach(p, Math.max(xr, xl));
    if (f < 0.75) heelDown(p);
    return p;
  };
  const tgt = (x, z, up = 0) => ({ at: [x, MAT + 0.03 + (up ? 0.02 : 0), z] });
  const hands = (p, xr, xl, upR = 0, upL = 0) => {
    p.ik = { handR: tgt(xr, HZ, upR), handL: tgt(xl, -HZ, upL) };
    p.handSurfaceR = MAT + upR * LIFT; p.handSurfaceL = MAT + upL * LIFT;
    return p;
  };
  const poses = {};
  // stand: FK hands as world targets (palms in, beside the thighs)
  { const J = S(stand).J; stand.ik = { handR: { at: J.handR.slice() }, handL: { at: J.handL.slice() } }; stand.handSurfaceR = MAT; stand.handSurfaceL = MAT; poses.stand = stand; }
  poses.fold = hands(fold, H0, H0);
  // fold target 1.8 cm lower: the palm (flat) ignores it, but the free hand of the roll-down/up (handFlat false until this
  // key) then reaches almost straight, so the palm-flattening switch at the fold key moves the elbow only ~3 cm
  for (const s of ['R', 'L']) fold.ik['hand' + s].at[1] = 0.0115;
  // walk out: R -> A, L -> B, R -> C, L -> C ; each with a lifted in-between key
  const s1 = stage(0.3, A, H0), s2 = stage(0.62, A, Bx), s3 = stage(0.88, CX, Bx);
  poses.o1u = hands(Object.assign({}, fold), (H0 + A) / 2, H0, 1, 0);
  poses.o1 = hands(s1, A, H0);
  poses.o2u = hands(Object.assign({}, s1), A, (H0 + Bx) / 2, 0, 1);
  poses.o2 = hands(s2, A, Bx);
  poses.o3u = hands(Object.assign({}, s2), (A + CX) / 2, Bx, 1, 0);
  poses.o3 = hands(s3, CX, Bx);
  poses.o4u = hands(Object.assign({}, s3), CX, (Bx + CX) / 2, 0, 1);
  poses.plank = hands(plank, CX, CX);
  // push-up bottom: lowered as one piece about the toes until the elbows reach ~92° (IK on the fixed hand targets)
  { const p = hands(Object.assign({}, PLANK, { trunk: plank.trunk, ankle: -30, neck: -6, sh: 30, el: 90 }), CX, CX), t0 = p.trunk;
    const elb = (q) => { const J = solve(expand(q), CTX).J; return 180 - Math.acos(V.dot(V.norm(V.sub(J.shoulderR, J.elbowR)), V.norm(V.sub(J.wristR, J.elbowR)))) * 180 / Math.PI; };
    p.trunk = +(t0 + near0((d) => solve(expand(Object.assign({}, p, { trunk: t0 + d })), CTX).J.chest[1] - CHEST_Y)).toFixed(3);
    poses.bottom = p; }
  // walk back: mirror (L -> B, R -> B... keeps the same stage bodies)
  poses.i1u = hands(Object.assign({}, plank), CX, (CX + Bx) / 2, 0, 1);
  poses.i1 = hands(Object.assign({}, s3), CX, Bx);
  poses.i2u = hands(Object.assign({}, s3), (CX + A) / 2, Bx, 1, 0);
  poses.i2 = hands(Object.assign({}, s2), A, Bx);
  poses.i3u = hands(Object.assign({}, s2), A, (Bx + H0) / 2, 0, 1);
  poses.i3 = hands(Object.assign({}, s1), A, H0);
  poses.i4u = hands(Object.assign({}, s1), (A + H0) / 2, H0, 1, 0);
  // mistakes: re-solve on the same hand targets
  for (const mk of ex.mistakes) {
    const mp = mk.pose, base = poses[mk.at];
    if (mk.at === 'plank') { const q = Object.assign({}, PLANK, mp); q.trunk = PLANK.trunk; const Wy = S(q, GF).J.wristR[1];
      mp.trunk = +(q.trunk + near0((d) => S(Object.assign({}, q, { trunk: q.trunk + d })).J.wristR[1] - Wy)).toFixed(3); }
    mp.ik = base.ik;
  }
  MAT_AT = [toe[0] + 0.85, 0, 0];
  return poses;
}
let MAT_AT = [0.3, 0, 0];

window.EXERCISE = {
  id: 'pilates_push_up',
  name: { tr: 'Pilates Şınav', en: 'Pilates Push-Up', es: 'Flexión Pilates' },
  category: { tr: 'Pilates · Kol · Karın', en: 'Pilates · Arms · Core', es: 'Pilates · Brazos · Core' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['triceps', 'chest', 'delts', 'core', 'hamstrings'],
  tempo: '6-5-4-3',
  tempoReps: 1,
  repLabel: { tr: 'TUR', en: 'ROUND', es: 'RONDA' },
  maxDuration: 80,
  cuesReplay: false,
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 28, pitch: 12, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Dirsekler kaburgalara yakın, geriye bakar', en: 'Elbows hug the ribs, pointing back', es: 'Codos pegados a las costillas' } },
  contacts: ['heelR', 'ballR', 'heelL', 'ballL'],
  get props() { void this.poses; return [['mat', { at: MAT_AT, length: 2.0 }]]; },
  ctx: CTX,
  get poses() { return this._poses || (this._poses = build(this)); },
  rest: 'plank',
  rep: [
    { to: 'bottom', dur: 1.5, phase: 0 },
    { to: 'plank', dur: 1.0, phase: 0, card: false },
    { to: 'bottom', dur: 1.5, phase: 0, card: false },
    { to: 'plank', dur: 1.0, phase: 0, card: false },
    { to: 'i1u', dur: 0.55, phase: 1 },
    { to: 'i1', dur: 0.55, phase: 1, card: false },
    { to: 'i2u', dur: 0.55, phase: 1, card: false },
    { to: 'i2', dur: 0.55, phase: 1, card: false },
    { to: 'i3u', dur: 0.55, phase: 1, card: false },
    { to: 'i3', dur: 0.55, phase: 1, card: false },
    { to: 'i4u', dur: 0.55, phase: 1, card: false },
    { to: 'fold', dur: 0.5, phase: 1, card: false },
    { to: 'stand', dur: 3.2, phase: 2 },
    { to: 'fold', dur: 3.2, phase: 3 },
    { to: 'o1u', dur: 0.45, phase: 4 },
    { to: 'o1', dur: 0.45, phase: 4, card: false },
    { to: 'o2u', dur: 0.45, phase: 4, card: false },
    { to: 'o2', dur: 0.45, phase: 4, card: false },
    { to: 'o3u', dur: 0.45, phase: 4, card: false },
    { to: 'o3', dur: 0.45, phase: 4, card: false },
    { to: 'o4u', dur: 0.45, phase: 4, card: false },
    { to: 'plank', dur: 0.5, phase: 4, card: false },
  ],
  setup: { tr: 'Ayakta başla, omur omur ellere in, plank\'a yürü. Döngü burada plank\'ta başlar.',
    en: 'Start standing, roll down and walk out to a plank. The loop starts here in the plank.',
    es: 'Empieza de pie, baja y camina a la plancha. El ciclo empieza aquí, en plancha.' },
  phases: [
    { name: { tr: 'Şınav', en: 'Push-ups', es: 'Flexiones' }, breath: 'in', slow: 1.0, arc: ['shoulderR', 'elbowR', 'wristR'], line: ['ankleR', 'pelvis', 'shoulderR'],
      text: { tr: 'Dirsekler kaburgalara yakın, göğsü mata yaklaştır, it. 3 tekrar.', en: 'Elbows hug the ribs; lower the chest near the mat, press. 3 reps.', es: 'Codos pegados; baja el pecho cerca del suelo y empuja. 3 veces.' } },
    { name: { tr: 'Geri yürü', en: 'Walk back', es: 'Vuelve caminando' }, breath: 'in', slow: 1.0,
      text: { tr: 'Elleri sırayla ayaklara doğru geri yürüt.', en: 'Walk the hands back toward the feet, one by one.', es: 'Camina con las manos hacia los pies.' } },
    { name: { tr: 'Omur omur kalk', en: 'Roll up', es: 'Sube vértebra a vértebra' }, breath: 'out', slow: 1.2,
      text: { tr: 'Nefes ver, karnı içe çek, omurgayı alttan üste dizerek kalk.', en: 'Exhale, scoop the belly and stack the spine up to standing.', es: 'Exhala, mete el abdomen y apila la columna hasta estar de pie.' } },
    { name: { tr: 'Omur omur in', en: 'Roll down', es: 'Baja vértebra a vértebra' }, breath: 'out', slow: 1.2,
      text: { tr: 'Nefes ver, çeneyi indir, omurgayı yuvarlayarak ellere in. Dizler yumuşak.', en: 'Exhale, nod the chin and roll down to the hands. Knees soft.', es: 'Exhala, baja la barbilla y rueda hasta las manos. Rodillas suaves.' } },
    { name: { tr: 'Ellerle yürü', en: 'Walk out', es: 'Camina con las manos' }, breath: 'in', slow: 1.0,
      text: { tr: 'Nefes al, elleri sırayla öne yürüt. Plank\'a uzan.', en: 'Inhale, walk the hands forward one by one into a plank.', es: 'Inhala, camina con las manos hasta la plancha.' } },
  ],
  tempoText: { tr: 'Şınavlar · geri yürü · kalk · in · öne yürü', en: 'Push-ups · walk back · roll up · roll down · walk out', es: 'Flexiones · vuelve · sube · baja · camina' },
  mistakes: [
    { title: { tr: 'Kalça çöküyor', en: 'Hips sag', es: 'La cadera se hunde' },
      text: { tr: 'Plank\'ta bel çukurlaşır, karın gevşer.', en: 'In the plank the low back sags and the abs let go.', es: 'En la plancha la lumbar se hunde y el abdomen se suelta.' },
      fix: { tr: 'Karnı topla, kalçayı çizgiye kaldır', en: 'Brace and lift the hips into line', es: 'Activa el abdomen, sube la cadera' },
      fixText: { tr: 'Omuz, kalça ve topuk aynı çizgide', en: 'Shoulder, hip and heel in one line', es: 'Hombro, cadera y talón alineados' },
      at: 'plank', pose: { hip: -18, lumbar: -12 }, line: ['ankleR', 'pelvis', 'shoulderR'], parts: ['pelvis', 'waist'] },
    { title: { tr: 'Dirsekler yana açılıyor', en: 'Elbows flare', es: 'Los codos se abren' },
      text: { tr: 'Dirsekler gövdeden uzaklaşır, omuz zorlanır.', en: 'The elbows move away from the body and load the shoulders.', es: 'Los codos se separan y cargan los hombros.' },
      fix: { tr: 'Dirsekleri kaburgalara çek', en: 'Draw the elbows to the ribs', es: 'Lleva los codos a las costillas' },
      fixText: { tr: 'Dirsekler geriye, ayaklara doğru bakar', en: 'Elbows point back toward the feet', es: 'Codos hacia atrás, hacia los pies' },
      at: 'bottom', pose: { elbowPole: [-0.45, -0.15, 1] }, view: { yaw: 25, pitch: 30 }, marks: ['elbowR', 'elbowL'], parts: ['upperR', 'upperL'] },
  ],
  cues: [{ tr: 'Dirsekler kaburgalara yakın', en: 'Elbows tight to the ribs', es: 'Codos pegados a las costillas' },
    { tr: 'Vücut tek çizgi', en: 'Body in one straight line', es: 'Cuerpo en una línea' },
    { tr: 'Bir tekerlek gibi in ve kalk', en: 'Roll down and up like a wheel', es: 'Baja y sube como una rueda' }],
};
}
