/* Reformer Rowing 6 - Hug a Tree. Same seat as rowing_shaving.js: cross-legged on the carriage facing the footbar, hips against
 * the shoulder blocks, ropes from the rear risers to the handles. The carriage stays ~20 cm open the whole time (pos -0.2 in
 * every pose); the arms travel between a soft T (horizontal abduction ~80) and a rounded hug in front (fingertips almost touch).
 * - Hands: holdL/holdR (thorax frame), elbows point out and a little down (elbowPole in every pose).
 * - Ankles: world IK targets on the pad relative to the pelvis (feet ride with the carriage). */
{
const { V, M } = FB;
const TOP = 0.38, CX0 = 0.13, SEAT = 0.17;           // closed carriage centre; pelvis sits SEAT in front of it (hips touch the blocks)
const PX = CX0 - SEAT;                               // pelvis x with the carriage closed
FB.PROPS._hugHandles = (sol, o = {}) => {
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
const BASE = { ...LEGS, pos: [0, 0, 0], trunk: 0, ground: [['pelvis', TOP - 0.035]], neck: 4, elbowPole: [-0.3, -0.45, 1], noAvoid: true };
const OPEN = 0.2;
const RAW = {
  // arms long in a T, ~10 deg in front of the shoulder line, elbows soft and a touch lower than the shoulders
  open: { ...BASE, holdL: [0.12, 0.06, 0.712], holdR: [0.12, 0.06, 0.712], lumbar: -2, pos: [-OPEN, 0, 0] },
  // hug: arms rounded forward as if around a tree trunk, fingertips almost touching
  hug: { ...BASE, holdL: [0.555, 0.06, 0.05], holdR: [0.555, 0.06, 0.05], lumbar: -2, pos: [-OPEN, 0, 0] },
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
  id: 'rowing_hug_a_tree',
  name: { tr: 'Rowing - Ağaç Sarma (Hug a Tree)', en: 'Rowing 6 - Hug a Tree', es: 'Remo - Abrazar un árbol (Hug a Tree)' },
  category: { tr: 'Reformer · Omuz ve göğüs', en: 'Reformer · Shoulders & chest', es: 'Reformer · Hombros y pecho' },
  equipmentLabel: { tr: 'Reformer · 1 kırmızı yay · kayışlar', en: 'Reformer · 1 red spring · straps', es: 'Reformer · 1 muelle rojo · correas' },
  muscles: ['delts', 'chest', 'upperback', 'core'],
  tempo: '2-2',
  view: { yaw: 38, pitch: 12, zoom: 1.15 },
  alt: { yaw: 70, pitch: 58, title: { tr: 'Üstten bak', en: 'Top view', es: 'Vista superior' },
    text: { tr: 'Kollar yuvarlak bir yay çizer, dirsekler yumuşak', en: 'The arms draw a round arc, elbows soft', es: 'Los brazos trazan un arco redondo, codos suaves' } },
  setupView: { yaw: 70, pitch: 20 },
  props: [['reformer', { springs: 1, carriage: (sol) => sol.J.pelvis[0] + SEAT }], ['_hugHandles', { kind: 'neutral' }]],
  ctx: CTX,
  contacts: ['pelvis', 'ankleL', 'ankleR', 'handL', 'handR'],
  get poses() { return this._poses || (this._poses = fit(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'open',
  rep: [
    { to: 'hug', dur: 2.0, phase: 0 },
    { to: 'open', dur: 2.0, phase: 1 },
  ],
  setup: { tr: 'Footbar\'a dönük bağdaş kur, kalçalar bloklara değsin. Kollar yanlarda T, kızak 20 cm açık.',
    en: 'Sit cross-legged facing the footbar, hips against the blocks. Arms in a T, carriage open about 20 cm.',
    es: 'Piernas cruzadas mirando a la barra, cadera contra los topes. Brazos en T, carro abierto 20 cm.' },
  phases: [
    { name: { tr: 'Ağaca sarıl', en: 'Hug the tree', es: 'Abraza el árbol' }, breath: 'out',
      text: { tr: 'Kolları yuvarlak tutarak öne getir, parmak uçları buluşsun. Kızak yerinde kalır.', en: 'Bring the rounded arms forward until the fingertips meet. The carriage stays still.', es: 'Lleva los brazos redondos al frente hasta juntar los dedos. El carro no se mueve.' } },
    { name: { tr: 'Kolları aç', en: 'Open the arms', es: 'Abre los brazos' }, breath: 'in',
      text: { tr: 'Yaylara direnerek kolları T\'ye aç. Göğüs açık, kaburgalar sabit.', en: 'Resist the springs back to the T. Chest open, ribs still.', es: 'Resiste los muelles y vuelve a la T. Pecho abierto, costillas quietas.' } },
  ],
  tempoText: { tr: '2 sn sarıl · 2 sn aç', en: '2 s hug · 2 s open', es: '2 s abraza · 2 s abre' },
  mistakes: [
    { title: { tr: 'Omuzlar kulaklara kalkıyor', en: 'Shoulders hike', es: 'Hombros a las orejas' },
      fix: { tr: 'Kürekler aşağı', en: 'Shoulder blades down', es: 'Escápulas abajo' },
      fixText: { tr: 'Boyun uzun, kollar sırttan uzansın', en: 'Long neck, reach from the back', es: 'Cuello largo, alarga desde la espalda' },
      at: 'hug', pose: { shrug: 0.05, neck: 8 }, view: { yaw: 20, pitch: 8, zoom: 1.05 }, marks: ['shoulderR', 'shoulderL'], parts: ['neck', 'upperR', 'upperL'] },
    { title: { tr: 'Gövde öne yığılıyor', en: 'Torso collapses forward', es: 'El torso se hunde adelante' },
      fix: { tr: 'Gövde dik, kollar çalışsın', en: 'Stay tall, let the arms work', es: 'Erguida, que trabajen los brazos' },
      fixText: { tr: 'Kaburgalar sabit, sadece kollar hareket eder', en: 'Ribs still, only the arms move', es: 'Costillas quietas, solo se mueven los brazos' },
      at: 'hug', pose: { trunk: 4, lumbar: 6, thoracic: 13, neck: 10, protract: 0.04, holdL: [0.555, 0.14, 0.05], holdR: [0.555, 0.14, 0.05] },
      view: { yaw: 80, pitch: 8, zoom: 1.25, dx: -30 }, line: ['pelvis', 'waist', 'neck'], goodLine: ['pelvis', 'neck'], parts: ['waist', 'chest'] },
  ],
  cues: [{ tr: 'Hareket sırttan başlar', en: 'Reach from the back', es: 'Alarga desde la espalda' },
    { tr: 'Kaburgalar sabit', en: 'Ribs stay still', es: 'Costillas quietas' },
    { tr: 'Omuzlar aşağıda', en: 'Shoulders low', es: 'Hombros abajo' }],
};
}
