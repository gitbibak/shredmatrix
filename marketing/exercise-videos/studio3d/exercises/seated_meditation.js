/* Seated Meditation (easy cross-legged seat, Sukhasana) on a folded-blanket cushion. Settle -> sit tall (roll the shoulders
 * back, hands on the knees, Jnana mudra) -> stillness -> soften.
 * - One ground contact [pelvis] on the cushion top. Feet are world IK targets (ankle + foot frame) on the mat, each tucked under
 *   the opposite shin, right foot in front; knees point out and up (kneePole in every pose).
 * - Cushion (_seatCushion) rests on the mat; when the pelvis drops (mistake "no cushion, knees above hips") it sinks out of
 *   sight, so the bad pose reads as sitting on the floor.
 * - Hands: world targets on the knees in every pose (palms up, fingers softly curled = mudra), so `ik` interpolates. */
{
const { V } = FB;
const MAT = 0.012, CH = 0.1;                            // cushion height
const G = (d = 0) => [['pelvis', MAT + CH + d]];
let SEAT_Y = MAT + CH + 0.1;
FB.PROPS._seatCushion = (sol) => {
  // the sit bones sit ~4.5 cm below the pelvis-contact clearance in this cross-legged seat: cushion is that much taller;
  // it squashes away when the pelvis drops to the floor
  const h = Math.min(CH, sol.J.pelvis[1] - 0.1 - MAT) * (CH + 0.045) / CH;
  if (h < 0.006) return [];
  return FB.PROPS.blanket(null, { at: [sol.J.pelvis[0] + 0.04, MAT + h / 2 - 0.03, 0], size: [0.34, h, 0.42] });
};
const LEGS = { hip: 62, hrot: 45, abd: 38, knee: 128, ankle: -12, flat: false, kneePole: [0.4, 0.5, 1] };
const BASE = { ...LEGS, trunk: 0, ground: G(), handFlat: false, palm: 'up', curl: 0.45, shAbd: 14, elbowPole: [-0.6, -1, 0.5] };
const RAW = {
  settle: { ...BASE, trunk: 6, lumbar: 8, thoracic: 10, neck: 10, shrug: 0.01, protract: 0.02 },
  tall: { ...BASE, trunk: 2, lumbar: -4, thoracic: -3, neck: 6, shrug: -0.005, protract: -0.012 },
};
const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };

function newton(p, keys, res, iters = 40) {
  const n = keys.length, e = 0.4;
  for (let it = 0; it < iters; it++) {
    const r0 = res(p);
    const Jm = keys.map((k) => { const r = res({ ...p, [k]: p[k] + e }); return r.map((v, i) => (v - r0[i]) / e); });
    const A = r0.map((_, i) => keys.map((_, j) => Jm[j][i]).concat([r0[i]]));
    for (let c = 0; c < n; c++) {
      let piv = c; for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r;
      [A[c], A[piv]] = [A[piv], A[c]]; if (Math.abs(A[c][c]) < 1e-9) return;
      for (let r = 0; r < n; r++) if (r !== c) { const f = A[r][c] / A[c][c]; for (let k = c; k <= n; k++) A[r][k] -= f * A[c][k]; }
    }
    keys.forEach((k, j) => { p[k] -= Math.max(-4, Math.min(4, A[j][n] / A[j][j])); });
  }
  keys.forEach((k) => { p[k] = +p[k].toFixed(2); });
}

function fitSeat(poses, extra) {
  const { solve, expand } = FB;
  const S = (p) => solve(expand(Object.assign({}, p, { ik: undefined })), CTX).J;
  // feet: world IK targets on the mat, each tucked under the opposite shin (right foot in front), knees point out and up
  const foot = (s) => {
    const sg = s === 'R' ? 1 : -1, x = V.norm([0.35, 0, -sg]), y = V.norm(V.sub([0, 1, 0], V.mul(x, V.dot([0, 1, 0], x)))), z = V.cross(x, y);
    return { at: [s === 'R' ? 0.3 : 0.17, MAT + 0.06, -sg * 0.12], foot: { 0: x, 1: y, 2: z } };
  };
  const legs = (p) => { p.ik = Object.assign({}, p.ik, { ankleR: foot('R'), ankleL: foot('L') }); };
  const hands = (p) => { const J = solve(expand(p), CTX).J, t = (s) => V.add(J['knee' + s], [-0.03, 0.075, (s === 'R' ? -1 : 1) * 0.02]);
    p.ik = Object.assign({}, p.ik, { handL: { at: t('L') }, handR: { at: t('R') } }); };
  legs(poses.tall); legs(poses.settle);
  hands(poses.tall); hands(poses.settle);
  for (const [at, pose] of extra) { const m = Object.assign({}, poses[at], pose); hands(m); pose.ik = m.ik; }
  return poses;
}

window.EXERCISE = {
  id: 'seated_meditation',
  name: { tr: 'Oturarak Meditasyon', en: 'Seated Meditation', es: 'Meditación sentada' },
  category: { tr: 'Yoga · Nefes', en: 'Yoga · Breath', es: 'Yoga · Respiración' },
  equipmentLabel: { tr: 'Mat, minder', en: 'Mat, cushion', es: 'Esterilla, cojín' },
  muscles: ['core', 'lowerback'],
  tempo: '5-14-5',
  hold: true, holdDur: 4,
  view: { yaw: 14, pitch: 8 },
  alt: { yaw: 90, pitch: 6, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
    text: { tr: 'Omurga dik, baş tepeden yukarı uzar', en: 'Spine tall, crown reaching up', es: 'Columna erguida, coronilla hacia arriba' } },
  setupView: { yaw: 45, pitch: 14 },
  contacts: ['pelvis', 'ankleR', 'ankleL'],
  props: [['mat', { at: [0.1, 0, 0], length: 1.2, width: 0.9 }], ['_seatCushion']],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fitSeat(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'settle',
  rep: [
    { to: 'tall', dur: 3.0, phase: 0 },
    { to: 'tall', dur: 1.5, phase: 1 },
    { to: 'settle', dur: 3.0, phase: 2 },
  ],
  setup: { tr: 'Mindere otur, kalçalar dizlerden yüksek. Bacakları rahatça çaprazla, eller dizlerde.',
    en: 'Sit on a cushion, hips higher than the knees. Cross the legs loosely, hands on the knees.',
    es: 'Siéntate en un cojín, cadera más alta que las rodillas. Cruza las piernas, manos en las rodillas.' },
  phases: [
    { name: { tr: 'Dik otur', en: 'Sit tall', es: 'Siéntate erguida' }, breath: 'out', slow: 1.0, line: ['pelvis', 'neck', 'head'],
      text: { tr: 'Omurgayı uzat, omuzları geriye ve aşağı bırak. Başparmak ve işaret parmağı birleşsin.', en: 'Lengthen the spine, roll the shoulders back and down. Thumb and index touch.', es: 'Alarga la columna, hombros atrás y abajo. Pulgar e índice se tocan.' } },
    { name: { tr: 'Sakin kal', en: 'Be still', es: 'Quédate quieta' }, breath: 'easy',
      text: { tr: 'Çene hafif içeride, gözler kapalı. Nefesi sadece izle.', en: 'Chin slightly tucked, eyes closed. Just watch the breath.', es: 'Barbilla un poco adentro, ojos cerrados. Solo observa la respiración.' } },
    { name: { tr: 'Yavaşça çık', en: 'Come out slowly', es: 'Sal despacio' }, breath: 'in', slow: 1.0,
      text: { tr: 'Nefesi derinleştir, gözleri aç, bacakları uzat.', en: 'Deepen the breath, open the eyes, stretch the legs.', es: 'Respira hondo, abre los ojos, estira las piernas.' } },
  ],
  tempoText: { tr: 'Dik otur · 5-30 dk sakin nefes', en: 'Sit tall · 5-30 min natural breath', es: 'Erguida · 5-30 min respiración natural' },
  mistakes: [
    { title: { tr: 'Sırt çöküyor', en: 'Slouching', es: 'Espalda encorvada' },
      text: { tr: 'Sırt yuvarlanır, baş öne kayar.', en: 'The back rounds and the head drifts forward.', es: 'La espalda se redondea y la cabeza se adelanta.' },
      fix: { tr: 'Minderi yükselt', en: 'Raise the cushion', es: 'Sube el cojín' },
      fixText: { tr: 'Leğen hafif öne, tepe tavana uzansın', en: 'Pelvis tipped slightly forward, crown up', es: 'Pelvis un poco adelante, coronilla arriba' },
      at: 'tall', pose: { trunk: 9, lumbar: 14, thoracic: 18, neck: -12, protract: 0.03 }, view: { yaw: 90, pitch: 6 }, line: ['pelvis', 'waist', 'neck'], parts: ['waist', 'chest', 'neck'] },
    { title: { tr: 'Dizler kalçadan yüksek', en: 'Knees higher than hips', es: 'Rodillas más altas que la cadera' },
      text: { tr: 'Yerde oturunca leğen geriye düşer, bel yuvarlanır.', en: 'On the floor the pelvis tips back and the low back rounds.', es: 'En el suelo la pelvis cae atrás y la lumbar se redondea.' },
      fix: { tr: 'Daha yükseğe otur', en: 'Sit higher', es: 'Siéntate más alto' },
      fixText: { tr: 'Minder ya da dizlerin altına blok', en: 'A cushion, or blocks under the knees', es: 'Un cojín o bloques bajo las rodillas' },
      at: 'tall', pose: { ground: G(-CH - 0.03), trunk: -12, lumbar: 16, thoracic: 10, neck: 4 }, view: { yaw: 70, pitch: 8 }, marks: ['kneeR', 'pelvis'], parts: ['waist', 'pelvis'] },
  ],
  cues: [{ tr: 'Dik otur', en: 'Sit tall', es: 'Siéntate erguida' },
    { tr: 'Omuzlar ve çene gevşek', en: 'Relax shoulders and jaw', es: 'Hombros y mandíbula sueltos' },
    { tr: 'Doğal nefes', en: 'Natural breath', es: 'Respiración natural' }],
};
}
