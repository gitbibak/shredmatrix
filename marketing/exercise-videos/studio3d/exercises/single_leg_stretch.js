/* Single Leg Stretch (Pilates mat, supine curl-up). the_hundred base: pelvis + waist contacts in every pose so the lower
 * back stays on the mat; thoracic 30 + neck 40 keep head and shoulder blades lifted and do not change between poses.
 * - Rest pose = left leg long at ~45° from the mat, right knee drawn in (spec 'extend_left'); the switch is a separate
 *   move, so right and left are two moves of one rep (no return to a tabletop between switches). Spec start (both legs
 *   tabletop) is only described in the setup text.
 * - Hands: outside hand on the ankle, inside hand on top of the knee of the bent leg (world IK targets from the solved
 *   leg, fit() lazily). The knee hand sits higher than the ankle hand, so during the switch the two hands pass each other
 *   ~7 cm apart instead of colliding. Mistake poses get reach-clamped targets (hands slide toward the knee). */
{
const MAT = 0.008;
const G = (w = -0.016) => [['pelvis', MAT], ['waist', MAT + w]];
const BASE = { trunk: -90, abd: 2, hrot: 6, lumbar: 6, thoracic: 30, neck: 40, sh: 40, shAbd: 20, el: 60,
  elbowPole: [0, 0.35, 1], protract: 0.04, handFlat: false, palm: 'in', curl: 0.45, flat: false, ground: G() };
const LEG = (inS, longS) => ({ ['hip' + inS]: 118, ['knee' + inS]: 148, ['ankle' + inS]: -25,
  ['hip' + longS]: 33, ['knee' + longS]: 0, ['ankle' + longS]: -32 });
const RAW = { extL: { ...BASE, ...LEG('R', 'L'), _in: 'R' }, extR: { ...BASE, ...LEG('L', 'R'), _in: 'L' } };
const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };

function fit(poses, extra) {
  const { V, solve, expand } = FB;
  const S = (p) => solve(expand(Object.assign({}, p, { ik: undefined })), CTX).J;
  const REACH = FB.BODY.upper + FB.BODY.fore + FB.BODY.hand * 0.55 - 0.012;
  const hands = (p, legPose) => {
    const s = legPose._in, o = s === 'L' ? 'R' : 'L', sg = s === 'R' ? 1 : -1;
    const JL = S(legPose), J = S(p);
    const ankleT = V.add(V.lerp(JL['ankle' + s], JL['knee' + s], 0.1), [0.0, 0.0, sg * 0.07]);   // outside of the ankle / low shin
    const kneeT = V.add(V.lerp(JL['knee' + s], JL['ankle' + s], 0.22), [0, 0.035, -sg * 0.055]);         // on top of the knee, slightly inside
    const clampT = (sh, t) => { const d = V.sub(t, sh), L = V.len(d); return L > REACH ? V.add(sh, V.mul(d, REACH / L)) : t; };
    p.ik = { ['hand' + s]: { at: clampT(J['shoulder' + s], ankleT) }, ['hand' + o]: { at: clampT(J['shoulder' + o], kneeT) } };
  };
  for (const k in poses) hands(poses[k], poses[k]);
  for (const [at, pose] of extra) { const m = Object.assign({}, poses[at], pose); hands(m, m); pose.ik = m.ik; }
  return poses;
}

window.EXERCISE = {
  id: 'single_leg_stretch',
  name: { tr: 'Tek Bacak Esnetme (Single Leg Stretch)', en: 'Single Leg Stretch', es: 'Estiramiento de una pierna (single leg stretch)' },
  category: { tr: 'Pilates · Karın', en: 'Pilates · Core', es: 'Pilates · Core' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['core', 'obliques', 'quads'],
  tempo: '1-1',
  view: { yaw: 90, pitch: 6, zoom: 1.1 },
  alt: { yaw: 18, pitch: 22, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Dirsekler geniş, kürek kemikleri havada', en: 'Elbows wide, shoulder blades lifted', es: 'Codos abiertos, escápulas elevadas' } },
  setupView: { yaw: 45, pitch: 20 },
  contacts: ['pelvis', 'waist'],
  props: [['mat', { at: [0.1, 0.006, 0], length: 1.9 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fit(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'extL',
  rep: [
    { to: 'extR', dur: 1.0, phase: 0 },
    { to: 'extL', dur: 1.0, phase: 1 },
  ],
  setup: { tr: 'Baş ve kürek kemiklerini kaldır, bel minderde. Sağ dizi göğse çek, sol bacağı 45°ye uzat.',
    en: 'Curl head and shoulder blades up, lower back down. Hug the right knee in, left leg long at 45°.',
    es: 'Eleva cabeza y escápulas, lumbar abajo. Rodilla derecha al pecho, pierna izquierda larga a 45°.' },
  phases: [
    { name: { tr: 'Değiştir: sağ bacak uzun', en: 'Switch: right leg long', es: 'Cambia: pierna derecha larga' }, breath: 'out', line: ['pelvis', 'waist'],
      text: { tr: 'Sol diz göğse, sağ bacak 45°ye uzar. Eller sol kavala geçer.', en: 'Left knee in, right leg reaches out at 45°. Hands move to the left shin.', es: 'Rodilla izquierda adentro, pierna derecha a 45°. Manos a la espinilla izquierda.' } },
    { name: { tr: 'Değiştir: sol bacak uzun', en: 'Switch: left leg long', es: 'Cambia: pierna izquierda larga' }, breath: 'in',
      text: { tr: 'Sağ diz göğse, sol bacak uzar. Gövde kıvrımı hiç değişmez.', en: 'Right knee in, left leg long. The curl of the trunk never changes.', es: 'Rodilla derecha adentro, pierna izquierda larga. El tronco no cambia.' } },
  ],
  tempoText: { tr: 'Her değişim 1 sn · makas ritmi', en: '1 s per switch · scissor rhythm', es: '1 s por cambio · ritmo de tijera' },
  mistakes: [
    { title: { tr: 'Bel minderden kalkıyor', en: 'Lower back arches', es: 'La lumbar se arquea' },
      fix: { tr: 'Uzun bacağı yükselt', en: 'Raise the long leg', es: 'Sube la pierna larga' },
      fixText: { tr: 'Bel düz kaldığı kadar alçak; gerekirse 60-70°', en: 'Only as low as the back stays flat; 60-70° if needed', es: 'Solo tan baja como la lumbar aguante; 60-70° si hace falta' },
      at: 'extL', pose: { lumbar: -10, thoracic: 22, ground: G(0.03), hipL: 46 }, marks: ['waist'], parts: ['waist', 'pelvis'] },
    { title: { tr: 'Göğüs minderde düşüyor', en: 'Chest drops to the mat', es: 'El pecho cae a la esterilla' },
      fix: { tr: 'Kıvrımı koru', en: 'Stay curled', es: 'Mantén la flexión' },
      fixText: { tr: 'Kürek kemikleri havada, bakış dizlerde', en: 'Shoulder blades up, eyes on the knees', es: 'Escápulas arriba, mirada a las rodillas' },
      at: 'extL', pose: { thoracic: 6, neck: 14 }, marks: ['shoulderR', 'head'], parts: ['chest', 'neck'] },
  ],
  cues: [{ tr: 'Havlu gibi kıvrık kal', en: 'Stay curled like a rolled towel', es: 'Enrollada como una toalla' },
    { tr: 'Dirsekler geniş', en: 'Elbows wide', es: 'Codos abiertos' },
    { tr: 'Bel minderde, düzgün makas', en: 'Back down, smooth scissor', es: 'Lumbar abajo, tijera fluida' }],
};
}
