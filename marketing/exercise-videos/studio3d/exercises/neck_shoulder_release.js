/* Neck and Shoulder Release (seated). Front view. Seat copied from the approved seated_meditation.js: easy cross-legged seat on
 * a folded-blanket cushion, one ground contact [pelvis], feet = world IK targets tucked under the opposite shins, hands = world
 * targets resting on the knees (palms down here).
 * Sequence: shrug and drop -> shoulder roll (up, back, down) -> ear-to-shoulder stretch -> look over each shoulder.
 * ENGINE LIMIT: the head has flexion (`neck`) and rotation (`headTurn`) but no lateral tilt (ear to shoulder), and spine `side`
 * would lean the whole torso. The stretch is therefore shown as the closest available head motion: head turned ~30° toward
 * the right shoulder and nodded down (right upper-trap / levator line) with the LEFT shoulder dropping (shrugL < 0); the card
 * text describes the ear-to-shoulder tilt. In the stretch the right hand rests on the head (spec 'optional gentle pressure');
 * mistakes: the hand pulling the head (same contact, deeper nod + shrug), shoulders shrugged during the stretch. */
{
const { V } = FB;
const MAT = 0.012, CH = 0.1;
const G = (d = 0) => [['pelvis', MAT + CH + d]];
FB.PROPS._seatCushionNSR = (sol) => {
  const h = Math.min(CH, sol.J.pelvis[1] - 0.1 - MAT) * (CH + 0.045) / CH;
  if (h < 0.006) return [];
  return FB.PROPS.blanket(null, { at: [sol.J.pelvis[0] + 0.04, MAT + h / 2 - 0.03, 0], size: [0.34, h, 0.42] });
};
const LEGS = { hip: 62, hrot: 45, abd: 38, knee: 128, ankle: -12, flat: false, kneePole: [0.4, 0.5, 1] };
const BASE = { ...LEGS, trunk: 2, lumbar: -4, thoracic: -3, neck: 4, headTurn: 0, ground: G(), handFlat: false, palm: 'down', curl: 0.35,
  shAbd: 14, elbowPole: [-0.3, -0.4, 1], elbowPoleR: [-0.3, -0.4, 1], shrug: -0.005, protract: -0.01, noAvoid: true };
const RAW = {
  tall: { ...BASE },
  shrug: { ...BASE, shrug: 0.035, neck: 2 },
  rollUp: { ...BASE, shrug: 0.03, protract: 0.015 },
  rollBack: { ...BASE, shrug: 0.012, protract: -0.035 },
  tilt: { ...BASE, headTurn: -30, neck: 22, shrugL: -0.022, shrugR: -0.005, palmR: 'down' },
  turnR: { ...BASE, headTurn: -50, neck: 2 },
  turnL: { ...BASE, headTurn: 50, neck: 2 },
};
const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };

function fitSeat(poses, mistakes) {
  const { solve, expand } = FB;
  const foot = (s) => {
    const sg = s === 'R' ? 1 : -1, x = V.norm([0.35, 0, -sg]), y = V.norm(V.sub([0, 1, 0], V.mul(x, V.dot([0, 1, 0], x)))), z = V.cross(x, y);
    return { at: [s === 'R' ? 0.3 : 0.17, MAT + 0.06, -sg * 0.12], foot: { 0: x, 1: y, 2: z } };
  };
  // hands on the knees: computed once from the tall seat and shared by every pose (the knees never move)
  const J = solve(expand(Object.assign({}, poses.tall, { ik: { ankleR: foot('R'), ankleL: foot('L') } })), CTX).J;
  const t = (s) => V.add(J['knee' + s], [-0.035, 0.07, (s === 'R' ? -1 : 1) * 0.02]);
  const ik = { ankleR: foot('R'), ankleL: foot('L'), handL: { at: t('L') }, handR: { at: t('R') } };
  for (const k in poses) poses[k].ik = ik;
  // tilt: the right hand rests on the head (left side, over the ear) -- only its weight; the 'pulling' mistake uses the same
  // contact with a deeper nod, so the hand never has to travel during the mistake chapter
  const onHead = (q) => { const H = solve(expand(Object.assign({}, q, { ik })), CTX).J.head; return Object.assign({}, ik, { handR: { at: V.add(H, [0.01, 0.1, -0.02]) } }); };
  poses.tilt.ik = onHead(poses.tilt);
  for (const m of mistakes) m.pose.ik = m.at === 'tilt' ? onHead(Object.assign({}, poses[m.at], m.pose)) : ik;
  return poses;
}

window.EXERCISE = {
  id: 'neck_shoulder_release',
  name: { tr: 'Boyun ve Omuz Gevşetme', en: 'Neck and Shoulder Release', es: 'Liberación de cuello y hombros' },
  category: { tr: 'Pilates · Esneme', en: 'Pilates · Stretch', es: 'Pilates · Estiramiento' },
  equipmentLabel: { tr: 'Mat, minder', en: 'Mat, cushion', es: 'Esterilla, cojín' },
  muscles: ['upperback', 'delts'],
  tempo: 'yavaş',
  tempoReps: 1,
  cuesReplay: false,
  repLabel: { tr: 'TUR', en: 'ROUND', es: 'RONDA' },
  view: { yaw: 10, pitch: 8 },
  alt: { yaw: 90, pitch: 6, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
    text: { tr: 'Omurga dik, omuzlar kulaklardan uzak', en: 'Spine tall, shoulders away from the ears', es: 'Columna erguida, hombros lejos de las orejas' } },
  setupMarks: [{ type: 'aline', joints: ['shoulderL', 'shoulderR'] }],
  contacts: ['pelvis', 'ankleR', 'ankleL'],
  props: [['mat', { at: [0.1, 0, 0], length: 1.2, width: 0.9 }], ['_seatCushionNSR']],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fitSeat(RAW, this.mistakes)); },
  rest: 'tall',
  rep: [
    { to: 'shrug', dur: 1.0, phase: 0 },
    { to: 'tall', dur: 0.8, phase: 0, card: false },
    { to: 'rollUp', dur: 0.7, phase: 0, card: false },
    { to: 'rollBack', dur: 0.7, phase: 0, card: false },
    { to: 'tall', dur: 0.7, phase: 0, card: false },
    { to: 'tilt', dur: 1.5, phase: 1 },
    { to: 'tall', dur: 1.1, phase: 1, card: false },
    { to: 'turnR', dur: 1.1, phase: 2 },
    { to: 'turnL', dur: 1.7, phase: 2, card: false },
    { to: 'tall', dur: 1.1, phase: 2, card: false },
  ],
  setup: { tr: 'Mindere bağdaş kurarak otur. Omurga uzun, kaburgalar içeride, eller dizlerde, bakış önde.',
    en: 'Sit cross-legged on a cushion. Long spine, ribs knit, hands on the knees, gaze forward.',
    es: 'Siéntate con las piernas cruzadas en un cojín. Columna larga, manos en las rodillas, mirada al frente.' },
  phases: [
    { name: { tr: 'Kaldır, bırak, çevir', en: 'Shrug, drop, roll', es: 'Eleva, suelta, gira' }, breath: 'in', marks: ['shoulderL', 'shoulderR'],
      text: { tr: 'Al: omuzlar yukarı. Ver: bırak. Sonra geriye ve aşağı çevir.', en: 'Inhale up, exhale drop. Then roll back and down.', es: 'Inhala arriba, exhala suelta. Luego gira atrás y abajo.' } },
    { name: { tr: 'Kulak omza', en: 'Ear to shoulder', es: 'Oreja al hombro' }, breath: 'out', hold: 3.4,
      text: { tr: 'Sağ kulağı sağ omza eğ, el başta hafifçe. Sol omuz ağır, 3 nefes.', en: 'Tilt the right ear to the shoulder, hand resting lightly. Left shoulder heavy, 3 breaths.', es: 'Oreja derecha al hombro, mano apoyada. Hombro izquierdo pesado, 3 respiraciones.' } },
    { name: { tr: 'Omuzdan bak', en: 'Look over the shoulder', es: 'Mira sobre el hombro' }, breath: 'easy',
      text: { tr: 'Başı yavaşça önce sağa, sonra sola çevir. Sonunda çeneyi hafifçe indir.', en: 'Turn the head slowly right, then left. Finish with a gentle nod.', es: 'Gira la cabeza a la derecha y luego a la izquierda.' } },
  ],
  tempoText: { tr: 'Yavaş · her esnemede 3-5 nefes', en: 'Slow · 3-5 breaths in each stretch', es: 'Lento · 3-5 respiraciones por estiramiento' },
  mistakes: [
    { title: { tr: 'Başı elle çekmek', en: 'Pulling on the head', es: 'Tirar de la cabeza' },
      text: { tr: 'El başı aşağı çeker, boyun zorlanır.', en: 'The hand drags the head down and strains the neck.', es: 'La mano tira de la cabeza y fuerza el cuello.' },
      fix: { tr: 'Elin sadece ağırlığı kalsın', en: 'Just rest the hand\'s weight', es: 'Solo el peso de la mano' },
      fixText: { tr: 'Nazik esneme, zorlama yok', en: 'Gentle stretch, no force', es: 'Estiramiento suave, sin forzar' },
      at: 'tilt', pose: { neck: 36, headTurn: -38, shrugR: 0.025 }, marks: ['head', 'handR'], parts: ['neck', 'foreR'] },
    { title: { tr: 'Omuzlar kalkık', en: 'Shoulders shrugged', es: 'Hombros elevados' },
      text: { tr: 'Esnerken ve dönerken omuzlar kulaklara kalkar.', en: 'The shoulders creep up while you stretch and turn.', es: 'Los hombros suben al estirar y girar.' },
      fix: { tr: 'Karşı omzu aşağı bastır', en: 'Press the opposite shoulder down', es: 'Baja el hombro contrario' },
      fixText: { tr: 'Boyun uzun, omuzlar ağır', en: 'Long neck, heavy shoulders', es: 'Cuello largo, hombros pesados' },
      at: 'turnR', pose: { shrugL: 0.045, shrugR: 0.045, neck: -2 }, marks: ['shoulderL', 'shoulderR'], parts: ['upper', 'neck'] },
  ],
  cues: [{ tr: 'Omuzlar eriyip aşağı insin', en: 'Shoulders melt down', es: 'Hombros que se derriten' },
    { tr: 'Dik otur', en: 'Stay tall', es: 'Siéntate erguida' },
    { tr: 'Nazik hareket, zorlama yok', en: 'Move gently, no force', es: 'Suave, sin forzar' }],
};
}
