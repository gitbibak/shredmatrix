/* Reformer Rowing 5 - Shave. Cross-legged on the carriage facing the footbar, hips against the shoulder blocks,
 * ropes from the rear risers to the handles. Pressing the hands up and away from the pulleys opens the carriage ~20 cm
 * toward the risers (-x); bending the elbows back behind the head lets it close again.
 * - The body rides on the carriage: pose.pos = [-carriage opening, 0, 0]; carriage centre = pelvis x + SEAT (the blocks stay
 *   behind the hips in every frame).
 * - Legs crossed: ankles are world IK targets on the pad, defined relative to the pelvis per pose, so the feet travel with
 *   the carriage. kneePole in every pose.
 * - Hands: holdL/holdR (thorax frame) behind the head -> high diagonal (index fingers and thumbs close together).
 * - Handles (_shaveHandles): a short grip across each fist; the rope (reformer straps) ends in the fist. */
{
const { V, M } = FB;
const TOP = 0.38, CX0 = 0.13, SEAT = 0.17;           // closed carriage centre; pelvis sits SEAT in front of it (hips touch the blocks)
const PX = CX0 - SEAT;                               // pelvis x with the carriage closed
FB.PROPS._shaveHandles = (sol, o = {}) => {
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
const LEGS = { hip: 70, hrot: 45, abd: 36, knee: 125, ankle: -12, flat: false, kneePole: [0.4, 0.5, 1] };
const BASE = { ...LEGS, pos: [0, 0, 0], trunk: 0, ground: [['pelvis', TOP - 0.035]], neck: 4, elbowPole: [-0.15, 0.25, 1], noAvoid: true };
const OPEN = 0.2;
const RAW = {
  // hands behind the head, elbows wide, palms toward the head
  bent: { ...BASE, holdL: [-0.08, 0.34, 0.07], holdR: [-0.08, 0.34, 0.07], lumbar: -2, thoracic: 0 },
  // long high diagonal, hands close together, carriage 20 cm open
  reach: { ...BASE, holdL: [0.25, 0.65, 0.03], holdR: [0.25, 0.65, 0.03], lumbar: -2, thoracic: 0, neck: 2, pos: [-OPEN, 0, 0] },
};
const CTX = { anchorX: ['pelvis'], anchorAt: [PX, 0] };

function fit(poses, extra) {
  // crossed shins: each ankle tucked under the opposite shin, right foot in front, both resting on the pad
  const foot = (s, dx) => {
    const sg = s === 'R' ? 1 : -1, x = V.norm([0.35, 0, -sg]), y = [0, 1, 0], z = V.cross(x, y);
    return { at: [PX + dx + (s === 'R' ? 0.3 : 0.17), TOP + 0.055, -sg * 0.12], foot: { 0: x, 1: y, 2: z } };
  };
  const legs = (p) => { const dx = p.pos ? p.pos[0] : 0; p.ik = Object.assign({}, p.ik, { ankleR: foot('R', dx), ankleL: foot('L', dx) }); };
  for (const k in poses) legs(poses[k]);
  for (const [at, pose] of extra) { const m = Object.assign({}, poses[at], pose); legs(m); pose.ik = m.ik; }
  return poses;
}

window.EXERCISE = {
  id: 'rowing_shaving',
  name: { tr: 'Rowing - Tıraş (Shave)', en: 'Rowing 5 - Shave', es: 'Remo - Afeitado (Shave)' },
  category: { tr: 'Reformer · Omuz ve sırt', en: 'Reformer · Shoulders & back', es: 'Reformer · Hombros y espalda' },
  equipmentLabel: { tr: 'Reformer · 1 kırmızı yay · kayışlar', en: 'Reformer · 1 red spring · straps', es: 'Reformer · 1 muelle rojo · correas' },
  muscles: ['delts', 'lats', 'triceps', 'lowerback', 'core'],
  tempo: '1.5-1.5',
  view: { yaw: 90, pitch: 8, zoom: 1.2, dx: -30 },
  alt: { yaw: 25, pitch: 10, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Eller birlikte yukarı, işaret ve başparmaklar yakın', en: 'Hands travel together, index fingers and thumbs close', es: 'Manos juntas, índices y pulgares cerca' } },
  setupView: { yaw: 40, pitch: 18 },
  props: [['reformer', { springs: 1, carriage: (sol) => sol.J.pelvis[0] + SEAT }], ['_shaveHandles', { kind: 'pronated' }]],
  ctx: CTX,
  contacts: ['pelvis', 'ankleL', 'ankleR', 'handL', 'handR'],
  get poses() { return this._poses || (this._poses = fit(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'bent',
  rep: [
    { to: 'reach', dur: 1.5, phase: 0 },
    { to: 'bent', dur: 1.5, phase: 1 },
  ],
  setup: { tr: 'Footbar\'a dönük bağdaş kur, kalçalar omuz bloklarına değsin. Tutamaklar avuçta, eller başın arkasında.',
    en: 'Sit cross-legged facing the footbar, hips against the shoulder blocks. Handles in the palms, hands behind the head.',
    es: 'Sentada con piernas cruzadas mirando a la barra, cadera contra los topes. Manos tras la cabeza.' },
  phases: [
    { name: { tr: 'Çapraz yukarı it', en: 'Press up the diagonal', es: 'Empuja en diagonal' }, breath: 'in', line: ['pelvis', 'neck'],
      text: { tr: 'Kolları yukarı-öne uzat, eller birlikte. Kızak açılır, gövde dik kalır.', en: 'Reach up and forward, hands together. The carriage opens, the spine stays tall.', es: 'Estira arriba y adelante, manos juntas. El carro se abre, columna erguida.' } },
    { name: { tr: 'Dirsekleri aç, bük', en: 'Bend the elbows wide', es: 'Flexiona abriendo codos' }, breath: 'out',
      text: { tr: 'Dirsekleri yana açarak elleri başın arkasına getir; kızak yavaşça kapanır.', en: 'Bend the elbows wide, hands back behind the head; the carriage closes slowly.', es: 'Abre los codos y lleva las manos tras la cabeza; el carro se cierra despacio.' } },
  ],
  tempoText: { tr: '1,5 sn uzat · 1,5 sn bük', en: '1.5 s reach · 1.5 s bend', es: '1,5 s estira · 1,5 s flexiona' },
  mistakes: [
    { title: { tr: 'Kaburgalar açılıyor', en: 'Ribs flare', es: 'Costillas abiertas' },
      fix: { tr: 'Kaburgaları indir', en: 'Knit the ribs down', es: 'Cierra las costillas' },
      fixText: { tr: 'Karın içeride, kolları biraz alçalt', en: 'Abs in, lower the arms a little', es: 'Abdomen adentro, baja un poco los brazos' },
      at: 'reach', pose: { lumbar: -9, thoracic: -8, neck: -6, holdL: [0.12, 0.66, 0.04], holdR: [0.12, 0.66, 0.04] },
      line: ['pelvis', 'waist', 'neck'], goodLine: ['pelvis', 'neck'], parts: ['waist', 'chest'] },
    { title: { tr: 'Omuzlar kulaklara kalkıyor', en: 'Shoulders hike', es: 'Hombros a las orejas' },
      fix: { tr: 'Kürekler aşağı', en: 'Shoulder blades down', es: 'Escápulas abajo' },
      fixText: { tr: 'Boyun uzun, kollar sırttan uzansın', en: 'Long neck, reach from the back', es: 'Cuello largo, alarga desde la espalda' },
      at: 'reach', pose: { shrug: 0.05, neck: 8, holdL: [0.25, 0.7, 0.03], holdR: [0.25, 0.7, 0.03] }, view: { yaw: 30, pitch: 8 }, marks: ['shoulderR', 'shoulderL'], parts: ['neck', 'upperR', 'upperL'] },
  ],
  cues: [{ tr: 'Avuçlar başa dönük', en: 'Palms face the head', es: 'Palmas hacia la cabeza' },
    { tr: 'Omurga uzun ve dik', en: 'Tall, long spine', es: 'Columna larga y erguida' },
    { tr: 'Uzun bir çapraza uzan', en: 'Reach long on the diagonal', es: 'Alarga en diagonal' }],
};
}
