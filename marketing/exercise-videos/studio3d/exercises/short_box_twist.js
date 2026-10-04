/* Reformer Short Box - Twist. Same set-up as short_box_round_back.js (short box crosswise against the shoulder blocks,
 * carriage locked, feet hooked under the foot strap), no pole: hands behind the head, elbows wide. Sitting tall, the
 * ribcage rotates ~60 deg to the right, through centre to the left, and back to centre; the pelvis stays square.
 * - `twist` (+ = chest to the left) is split by the engine over lumbar/thoracic; hands are holdL/R in the thorax frame, so
 *   the elbows ride with the ribcage.
 * - Spec camera says "side" but its reason is the rotation (top/front), so the main view is a high front three-quarter. */
{
const { V } = FB;
const TOP = 0.38, CX0 = 0.13, BOX_H = 0.3, BOX_TOP = TOP + BOX_H;
const BAR = [1.0, TOP + 0.36];                       // footbar (default height), the foot strap hangs from it
const PX = 0.07;                                     // pelvis x on the box
const ANK = (s) => [0.915, 0.655, (s === 'R' ? 1 : -1) * 0.1];
// short box placed crosswise on the carriage, against the front of the shoulder blocks; foot strap looped over the footbar
// and across the insteps; optional pole between the hands
FB.PROPS._shortBox = (sol, o = {}) => {
  const out = [{ t: 'box', c: [CX0 - 0.08, TOP + BOX_H / 2, 0], s: [0.42, BOX_H, 0.6], m: 'woodLight', round: 0.02 },
    { t: 'box', c: [CX0 - 0.08, BOX_TOP - 0.012, 0], s: [0.4, 0.025, 0.58], m: 'pad', round: 0.01 }];
  const inst = (s) => { const a = sol.J['ankle' + s], f = sol.F['foot' + s]; return V.add(V.add(a, V.mul(f[0], 0.075)), V.mul(f[1], 0.035)); };
  const iL = inst('L'), iR = inst('R');
  out.push({ t: 'tube', pts: [[BAR[0] + 0.01, BAR[1] + 0.02, -0.2], [BAR[0] + 0.005, iL[1] + 0.012, -0.17], [iL[0], iL[1] + 0.012, iL[2] - 0.05],
    [iL[0], iL[1] + 0.014, 0], [iR[0], iR[1] + 0.012, iR[2] + 0.05], [BAR[0] + 0.005, iR[1] + 0.012, 0.17], [BAR[0] + 0.01, BAR[1] + 0.02, 0.2]], r: 0.012, m: 'strapMat' });
  if (o.pole) {
    const a = sol.J.handL, b = sol.J.handR, d = V.norm(V.sub(b, a));
    out.push({ t: 'cyl', a: V.add(a, V.mul(d, -0.28)), b: V.add(b, V.mul(d, 0.28)), r: 0.014, m: 'wood' });
    sol.grip = { L: d, R: d }; sol.gripKind = 'pronated';
  }
  return out;
};
const FEET = { ankleL: { at: ANK('L'), foot: { 0: [1, 0, 0], 1: [0, 1, 0], 2: [0, 0, 1] } }, ankleR: { at: ANK('R'), foot: { 0: [1, 0, 0], 1: [0, 1, 0], 2: [0, 0, 1] } } };
const SB = { ground: [['pelvis', BOX_TOP - 0.035]], hip: 80, knee: 8, abd: 2, flat: false, kneePole: [0.2, 1, 0], ik: FEET };
const CTX = { anchorX: ['pelvis'], anchorAt: [PX, 0] };
const REFORMER = ['reformer', { springs: 1, carriage: () => CX0 }];
// kneePole is read in the pelvis frame: convert a world "knees up" direction per pose, so a rolled-back pelvis never flips the knees
function fitPoles(poses, extra) {
  const { solve, expand } = FB;
  const fix = (p) => {
    const F = solve(expand(Object.assign({}, p, { ik: undefined })), CTX).F.pelvis;
    const w = [0.25, 1, 0];
    p.kneePole = [0, 1, 2].map((i) => { const e = [0, 0, 0]; e[i] = 1; return +V.dot(w, FB.M.apply(F, e)).toFixed(4); });
  };
  for (const k in poses) fix(poses[k]);
  for (const [at, pose] of extra) { const m = Object.assign({}, poses[at], pose); fix(m); pose.kneePole = m.kneePole; }
  return poses;
}
const ARMS = { holdL: [-0.07, 0.35, 0.08], holdR: [-0.07, 0.35, 0.08], elbowPole: [-0.15, 0.25, 1], noAvoid: true };
const BASE = { ...SB, ...ARMS, trunk: 0, lumbar: -3, thoracic: 0, neck: 2, twist: 0, yaw: 0 };
const POSES = {
  tall: { ...BASE },
  right: { ...BASE, twist: -60 },
  left: { ...BASE, twist: 60 },
};

window.EXERCISE = {
  id: 'short_box_twist',
  name: { tr: 'Short Box - Twist', en: 'Short Box - Twist', es: 'Caja corta - Giro' },
  category: { tr: 'Reformer · Yan karın', en: 'Reformer · Obliques', es: 'Reformer · Oblicuos' },
  equipmentLabel: { tr: 'Reformer · short box · ayak kayışı', en: 'Reformer · short box · foot strap', es: 'Reformer · caja corta · correa de pies' },
  muscles: ['obliques', 'core'],
  tempo: '2-2.5-1.5',
  view: { yaw: 25, pitch: 26, zoom: 1.1 },
  alt: { yaw: 70, pitch: 62, title: { tr: 'Üstten bak', en: 'Top view', es: 'Vista superior' },
    text: { tr: 'Göğüs döner, kalçalar ve dizler öne bakar', en: 'The chest turns, hips and knees face front', es: 'Gira el pecho; cadera y rodillas al frente' } },
  setupView: { yaw: 45, pitch: 18 },
  props: [REFORMER, ['_shortBox', {}]],
  ctx: CTX,
  contacts: ['pelvis', 'ankleL', 'ankleR'],
  get poses() { return this._poses || (this._poses = fitPoles(POSES, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'tall',
  rep: [
    { to: 'right', dur: 2.0, phase: 0 },
    { to: 'left', dur: 2.5, phase: 1 },
    { to: 'tall', dur: 1.5, phase: 2 },
  ],
  setup: { tr: 'Kutuya dik otur, ayaklar kayışın altında. Eller başın arkasında, dirsekler geniş.',
    en: 'Sit tall on the box, feet under the strap. Hands behind the head, elbows wide.',
    es: 'Sentada erguida en la caja, pies bajo la correa. Manos tras la cabeza, codos abiertos.' },
  phases: [
    { name: { tr: 'Sağa dön', en: 'Twist right', es: 'Gira a la derecha' }, breath: 'out', line: ['pelvis', 'neck'],
      text: { tr: 'Uzayarak göğsü belden sağa çevir. Dirsekler geniş, kalçalar sabit.', en: 'Lift tall and turn the ribcage right from the waist. Elbows wide, hips still.', es: 'Crece y gira el tórax a la derecha. Codos abiertos, cadera quieta.' } },
    { name: { tr: 'Ortadan sola', en: 'Through centre to the left', es: 'Por el centro a la izquierda' }, breath: 'out',
      text: { tr: 'Ortadan geçip sola dön. Baş göğüsle birlikte döner.', en: 'Pass through centre and turn left. The head turns with the chest.', es: 'Pasa por el centro y gira a la izquierda. La cabeza sigue al pecho.' } },
    { name: { tr: 'Ortaya dön', en: 'Back to centre', es: 'Vuelve al centro' }, breath: 'in',
      text: { tr: 'Nefes alarak ortaya dön, omurga uzun kalsın.', en: 'Inhale back to centre, keep the spine long.', es: 'Inhala y vuelve al centro con la columna larga.' } },
  ],
  tempoText: { tr: '2 sn sağa · 2,5 sn sola · 1,5 sn orta', en: '2 s right · 2.5 s left · 1.5 s centre', es: '2 s derecha · 2,5 s izquierda · 1,5 s centro' },
  mistakes: [
    { title: { tr: 'Kalçalar da dönüyor', en: 'Hips turn too', es: 'La cadera también gira' },
      fix: { tr: 'Oturma kemiklerini sabitle', en: 'Anchor the sit bones', es: 'Fija los isquiones' },
      fixText: { tr: 'Dizler öne bakar, dönüş belden yukarı', en: 'Knees face front, rotate from the waist up', es: 'Rodillas al frente, gira de la cintura hacia arriba' },
      at: 'right', pose: { yaw: -18, twist: -44 }, marks: ['kneeR', 'kneeL'], parts: ['pelvis', 'thighR', 'thighL'] },
    { title: { tr: 'Gövde çöküyor', en: 'Slumping into the twist', es: 'Hundirse al girar' },
      fix: { tr: 'Önce uza, sonra dön', en: 'Lift tall, then rotate', es: 'Crece y luego gira' },
      fixText: { tr: 'Göğüs açık, dirsekler geniş kalır', en: 'Chest open, elbows stay wide', es: 'Pecho abierto, codos abiertos' },
      at: 'right', pose: { trunk: 8, lumbar: 10, thoracic: 18, neck: 16, protract: 0.04, holdL: [0.0, 0.33, 0.04], holdR: [0.0, 0.33, 0.04] },
      line: ['pelvis', 'waist', 'neck'], goodLine: ['pelvis', 'neck'], parts: ['waist', 'chest'], view: { yaw: 60, pitch: 12, zoom: 1.2 } },
  ],
  cues: [{ tr: 'Belden dön', en: 'Rotate from the waist', es: 'Gira desde la cintura' },
    { tr: 'Uzun ve dik kal', en: 'Lift tall', es: 'Crece hacia arriba' },
    { tr: 'Kalçalar sabit', en: 'Hips stay square', es: 'Cadera quieta' }],
};
}
