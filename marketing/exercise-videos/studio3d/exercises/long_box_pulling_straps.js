/* Reformer Long Box - Pulling Straps. Long box lengthwise on the carriage, its short end against the shoulder blocks; prone on
 * the box FACING THE RISERS (yaw 180 + trunk 90), sternum at the box end, legs long and together off the far end. Ropes from
 * the risers in front to the handles. The straight arms sweep from overhead (shoulder flexion ~160) down past the box and back
 * along the body (extension ~25 from the lifted trunk) while the chest lifts into thoracic extension: the carriage opens ~20 cm toward the risers.
 * - Ground [pelvis, kneeR] on the box top in every pose (thighs stay on the box), so the chest is free to lift.
 * - pos is in the body frame; WORLD_OPEN() converts a world -x opening into it (checked with eval).
 * - Arms swing a little wide (shAbd 18) so they pass outside the box sides. Footbar down (footbar: false). */
{
const { V, M } = FB;
const TOP = 0.38, CX0 = 0.13, BOX_TOP = TOP + 0.32, BOX_OFF = 0.135, PEL_OFF = 0.11;
const PX = CX0 + PEL_OFF;
FB.PROPS._lbHandles = (sol, o = {}) => {
  const out = [];
  for (const s of ['L', 'R']) {
    const sg = s === 'R' ? 1 : -1, A = sol.F['arm' + s], fd = A.fd;
    let pn = o.kind === 'supinated' ? A.b : o.kind === 'pronated' ? V.mul(A.b, -1) : M.apply(sol.F.thorax, [0, 0, -sg]);
    pn = V.sub(pn, V.mul(fd, V.dot(pn, fd))); if (V.len(pn) < 1e-4) pn = A.b; pn = V.norm(pn);
    const ax = V.norm(V.cross(fd, pn)), h = V.add(sol.J['hand' + s], V.mul(pn, 0.012));
    out.push({ t: 'cyl', a: V.add(h, V.mul(ax, -0.062)), b: V.add(h, V.mul(ax, 0.062)), r: 0.016, m: 'rubber' });
    // rope from the riser pulley on the same world side as the hand (the engine's straps map by joint name, wrong when yaw = 180)
    out.push({ t: 'tube', pts: [[-1.23, 0.8, Math.sign(sol.J['hand' + s][2]) * 0.33], sol.J['hand' + s]], r: 0.005, m: 'rope' });
  }
  sol.grip = { L: [0, 1, 0], R: [0, 1, 0] }; sol.gripKind = o.kind || 'neutral';
  return out;
};
const G = [['pelvis', BOX_TOP], ['kneeR', BOX_TOP + 0.045]];   // thighs stay on the box, the chest is free
const BASE = { yaw: 180, trunk: 90, pos: [0, 0, 0], ground: G, hip: 0, knee: 0, ankle: -30, flat: false, abd: 0, lumbar: 0, thoracic: 0, neck: 6,
  shAbd: 18, el: 3, elbowPole: [-0.3, -1, 0.3], noAvoid: true };
const OPEN = 0.2;
const RAW = {
  reach: { ...BASE, sh: 160 },
  pull: { ...BASE, sh: -22, shAbd: 14, thoracic: -26, lumbar: -8, neck: -2, hip: 0, pos: [OPEN, 0, 0] },
  // mistakes are shown here: chest fully lifted, arms half-way down the sweep (the composer's fixed-time return from a mistake
  // to the rest pose would otherwise swing the arms 180 deg in ~1 s, which reads as a pop)
  lift: { ...BASE, sh: 60, shAbd: 16, thoracic: -26, lumbar: -8, neck: -2, hip: 0, pos: [OPEN * 0.6, 0, 0] },
};

window.EXERCISE = {
  id: 'long_box_pulling_straps',
  name: { tr: 'Uzun Kutuda Pulling Straps', en: 'Long Box Pulling Straps', es: 'Caja larga - Pulling Straps' },
  category: { tr: 'Reformer · Sırt', en: 'Reformer · Back', es: 'Reformer · Espalda' },
  equipmentLabel: { tr: 'Reformer · uzun kutu · 1 kırmızı + 1 mavi yay', en: 'Reformer · long box · 1 red + 1 blue spring', es: 'Reformer · caja larga · 1 muelle rojo + 1 azul' },
  muscles: ['lowerback', 'upperback', 'lats', 'delts'],
  tempo: '2-0.5-2.5',
  view: { yaw: -90, pitch: 8, zoom: 1.15, dx: 20 },
  alt: { yaw: -140, pitch: 18, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Kollar kutunun yanından geçer, boyun uzun', en: 'The arms pass beside the box, neck long', es: 'Los brazos pasan junto a la caja, cuello largo' } },
  setupView: { yaw: -130, pitch: 22 },
  props: [['reformer', { springs: 2, footbar: false, box: 'long', boxOffset: BOX_OFF, carriage: (sol) => sol.J.pelvis[0] - PEL_OFF }], ['_lbHandles', { kind: 'neutral' }]],
  ctx: { anchorX: ['pelvis'], anchorAt: [PX, 0] },
  contacts: ['pelvis', 'chest', 'handL', 'handR'],
  poses: RAW,
  rest: 'reach',
  rep: [
    { to: 'pull', dur: 2.0, phase: 0 },
    { to: 'pull', dur: 0.5, phase: 1 },
    { to: 'reach', dur: 2.5, phase: 2 },
  ],
  setup: { tr: 'Uzun kutuya yüzüstü uzan, göğüs kutunun ucunda. Bacaklar bitişik ve uzun, kollar öne uzanmış.',
    en: 'Lie face down on the long box, chest at its end. Legs long and together, arms reaching forward.',
    es: 'Boca abajo en la caja larga, pecho en el borde. Piernas juntas y largas, brazos al frente.' },
  phases: [
    { name: { tr: 'Çek ve göğsü kaldır', en: 'Pull and lift', es: 'Tira y eleva' }, breath: 'out', line: ['pelvis', 'waist', 'neck'],
      text: { tr: 'Düz kolları yanlardan kalçalara çek, göğüs kalkar. Kızak açılır.', en: 'Sweep the straight arms down to the hips as the chest lifts. The carriage opens.', es: 'Lleva los brazos rectos hacia la cadera y eleva el pecho. El carro se abre.' } },
    { name: { tr: 'Uzun dur', en: 'Hold long', es: 'Mantén largo' }, breath: 'hold',
      text: { tr: 'Kürekler aşağıda, boyun uzun, bakış aşağıda.', en: 'Shoulder blades down, neck long, eyes down.', es: 'Escápulas abajo, cuello largo, mirada abajo.' } },
    { name: { tr: 'Kontrollü uzan', en: 'Reach back out', es: 'Vuelve a alargar' }, breath: 'in',
      text: { tr: 'Göğsü indir, kolları öne uzat. Kızak sessizce kapansın.', en: 'Lower the chest and reach the arms forward. Let the carriage close quietly.', es: 'Baja el pecho y alarga los brazos. El carro se cierra sin golpe.' } },
  ],
  tempoText: { tr: '2 sn çek · 0,5 sn dur · 2,5 sn uzan', en: '2 s pull · 0.5 s hold · 2.5 s reach', es: '2 s tira · 0,5 s pausa · 2,5 s alarga' },
  mistakes: [
    { title: { tr: 'Boyun geriye bükülüyor', en: 'Neck cranks up', es: 'El cuello se dobla atrás' },
      fix: { tr: 'Aşağı bak', en: 'Look down', es: 'Mira abajo' },
      fixText: { tr: 'Baş omurganın devamı, çene hafif içeride', en: 'Head in line with the spine, chin slightly in', es: 'Cabeza en línea con la columna' },
      at: 'lift', pose: { neck: -40 }, marks: ['head'], parts: ['neck'] },
    { title: { tr: 'Bele yükleniyor', en: 'Dumping into the low back', es: 'Carga en la zona lumbar' },
      fix: { tr: 'Önce uza, sonra kalk', en: 'Lengthen before lifting', es: 'Alarga antes de elevar' },
      fixText: { tr: 'Karın içeride, kalkış göğüs kafesinden', en: 'Belly in, lift from the upper back', es: 'Abdomen adentro, eleva desde la espalda alta' },
      at: 'lift', pose: { lumbar: -20, thoracic: -10, hip: -8, neck: -10 }, line: ['pelvis', 'waist', 'neck'], parts: ['waist'] },
  ],
  cues: [{ tr: 'Kalkmadan önce uza', en: 'Lengthen before lifting', es: 'Alarga antes de elevar' },
    { tr: 'Sırttan çek', en: 'Pull from the back', es: 'Tira desde la espalda' },
    { tr: 'Boyun uzun', en: 'Neck long', es: 'Cuello largo' }],
};
}
