/* Reformer Rowing 1 - Into the Sternum (Rowing Back), representative of the Rowing Series.
 * Seated FACING THE RISERS (yaw 180, she faces -x), legs long and slightly apart, straddling the shoulder blocks, heels on the
 * headrest end (engine carriage pad is shorter than a real one: the calves rest on the pad end, heels just beyond). Ropes from the risers in front to the handles. Pulling the handles to the sternum while rolling back into a
 * C-curve opens the carriage ~25 cm toward the risers; it stays open while the arms press wide and the spine rounds forward;
 * the arms circle up while the spine stacks and the carriage closes; the hands come back to the chest.
 * - pos is body-frame (yaw 180): pos [+d] = carriage d metres open toward the risers. Carriage centre = pelvis x - SEAT.
 * - fit(): per pose, bisects the hip angle so the left heel rests on the headrest (y = HEEL_Y) whatever the pelvis tilt.
 * - Spine: the C-curve = pelvis rolled back (trunk) + lumbar/thoracic flexion; measured trunk (pelvis->neck) ~ -35 as specced.
 * - Hands: holdL/R (thorax frame), elbows out (elbowPole in every pose), noAvoid (arms never cross the torso here). */
{
const { V, M } = FB;
const TOP = 0.38, CX0 = 0.13, SEAT = 0.29, HEEL_Y = 0.385;
const PX = CX0 + SEAT;
FB.PROPS._rowHandles = (sol, o = {}) => {
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
const BASE = { yaw: 180, pos: [0, 0, 0], ground: [['pelvis', TOP - 0.035]], knee: 5, abd: 13, ankle: 8, flat: false,
  elbowPole: [-0.3, -0.1, 1], noAvoid: true, neck: 4 };
const OPEN = 0.25;
const CHEST = { holdL: [0.2, 0.03, 0.09], holdR: [0.2, 0.03, 0.09] };
const RAW = {
  sit: { ...BASE, ...CHEST, trunk: 0, lumbar: 0, thoracic: 0 },
  back: { ...BASE, ...CHEST, trunk: -94, lumbar: 40, thoracic: 28, neck: 30, pos: [OPEN, 0, 0] },
  round: { ...BASE, trunk: 6, lumbar: 21, thoracic: 19, neck: 18, holdL: [0.14, 0.04, 0.7], holdR: [0.14, 0.04, 0.7], pos: [OPEN, 0, 0] },
  up: { ...BASE, trunk: 0, lumbar: 0, thoracic: 0, neck: 2, holdL: [0.54, 0.31, 0.17], holdR: [0.54, 0.31, 0.17] },
};
const CTX = { anchorX: ['pelvis'], anchorAt: [PX, 0] };

function fit(poses, extra) {
  const { solve, expand } = FB;
  const heel = (p) => {
    const at = (h) => solve(expand(Object.assign({}, p, { hip: h, ik: undefined })), CTX).J.heelL[1] - HEEL_Y;
    let lo = -40, hi = 160;                               // more hip flexion (legs relative to pelvis) -> heel higher
    for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (at(m) > 0) hi = m; else lo = m; }
    p.hip = +((lo + hi) / 2).toFixed(2);
  };
  for (const k in poses) heel(poses[k]);
  for (const [at, pose] of extra) { const m = Object.assign({}, poses[at], pose); heel(m); pose.hip = m.hip; }
  return poses;
}

window.EXERCISE = {
  id: 'rowing_series',
  name: { tr: 'Rowing Serisi (Rowing 1 - Sternuma)', en: 'Rowing Series (Rowing 1, Into the Sternum)', es: 'Serie de remo (Rowing 1, hacia el esternón)' },
  category: { tr: 'Reformer · Sırt ve karın', en: 'Reformer · Back & core', es: 'Reformer · Espalda y core' },
  equipmentLabel: { tr: 'Reformer · 1-2 kırmızı yay · kayışlar', en: 'Reformer · 1-2 red springs · straps', es: 'Reformer · 1-2 muelles rojos · correas' },
  muscles: ['core', 'lats', 'upperback', 'delts'],
  tempo: '2-2-2.5',
  cuesReplay: false,
  view: { yaw: -90, pitch: 8, zoom: 1.15, dx: 30 },
  alt: { yaw: -140, pitch: 14, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Kollar geniş açılır, kızak açık kalır', en: 'Arms open wide, the carriage stays open', es: 'Brazos abiertos, el carro sigue abierto' } },
  setupView: { yaw: -130, pitch: 20 },
  props: [['reformer', { springs: 2, carriage: (sol) => sol.J.pelvis[0] - SEAT }], ['_rowHandles', { kind: 'pronated' }]],
  ctx: CTX,
  contacts: ['pelvis', 'heelL', 'heelR', 'handL', 'handR'],
  get poses() { return this._poses || (this._poses = fit(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'sit',
  rep: [
    { to: 'back', dur: 2.0, phase: 0 },
    { to: 'round', dur: 2.0, phase: 1 },
    { to: 'up', dur: 2.5, phase: 2 },
    { to: 'sit', dur: 1.0, card: false },
  ],
  setup: { tr: 'Kayışlara dönük otur, bacaklar omuz bloklarının iki yanında uzun. Tutamaklar göğüste, avuçlar aşağı.',
    en: 'Sit facing the straps, legs long on either side of the shoulder blocks. Handles at the chest, palms down.',
    es: 'Sentada mirando a las correas, piernas largas a los lados de los topes. Manos al pecho, palmas abajo.' },
  phases: [
    { name: { tr: 'C-kıvrımıyla geri', en: 'Roll back in a C', es: 'Rueda atrás en C' }, breath: 'out', line: ['pelvis', 'waist', 'neck'],
      text: { tr: 'Tutamakları sternuma çekerek geriye kıvrıl; kızak açılır, sen onu açık tut.', en: 'Pull the handles to the sternum and curl back; the carriage opens, keep it there.', es: 'Lleva las manos al esternón y rueda atrás; el carro se abre, mantenlo.' } },
    { name: { tr: 'Kolları aç, öne kıvrıl', en: 'Open and round forward', es: 'Abre y redondea adelante' }, breath: 'in',
      text: { tr: 'Kolları yana aç, öne doğru kıvrıl. Kızak kapanmasın.', en: 'Press the arms wide and round forward. Don\'t let the carriage close.', es: 'Abre los brazos y redondea adelante. Que el carro no se cierre.' } },
    { name: { tr: 'Daire çiz, doğrul', en: 'Circle up, stack', es: 'Círculo y sube' }, breath: 'out',
      text: { tr: 'Kollarla yukarı daire çiz, omur omur dik otur; kızak yavaşça kapanır.', en: 'Circle the arms up and stack the spine; the carriage closes slowly.', es: 'Círculo con los brazos y apila la columna; el carro se cierra despacio.' } },
  ],
  tempoText: { tr: '2 sn geri · 2 sn aç · 2,5 sn doğrul', en: '2 s back · 2 s open · 2.5 s stack', es: '2 s atrás · 2 s abre · 2,5 s sube' },
  mistakes: [
    { title: { tr: 'Kızak çarparak kapanıyor', en: 'Carriage slams closed', es: 'El carro se cierra de golpe' },
      fix: { tr: 'Kızağı açık tut', en: 'Keep the carriage open', es: 'Mantén el carro abierto' },
      fixText: { tr: 'Tutamaklara bastır, kollar geniş kalsın', en: 'Press into the handles, arms stay wide', es: 'Presiona las asas, brazos abiertos' },
      at: 'round', pose: { pos: [0, 0, 0], protract: 0.05, holdL: [0.42, -0.02, 0.36], holdR: [0.42, -0.02, 0.36] },
      marks: ['handL', 'pelvis'], parts: ['upperL', 'upperR', 'foreL', 'foreR'] },
    { title: { tr: 'Sırt düz geriye yatıyor', en: 'Leaning back with a flat back', es: 'Inclinarse atrás con espalda recta' },
      fix: { tr: 'C-kıvrımını koru', en: 'Keep the C-curve', es: 'Mantén la curva en C' },
      fixText: { tr: 'Göbek içeri, pelvis geriye yuvarlanır', en: 'Navel in, pelvis rolls back', es: 'Ombligo adentro, la pelvis rueda atrás' },
      at: 'back', pose: { trunk: -33, lumbar: -2, thoracic: -6, neck: -4 }, line: ['pelvis', 'waist', 'neck'], parts: ['waist', 'chest'] },
  ],
  cues: [{ tr: 'Sırttan çek', en: 'Pull from the back', es: 'Tira desde la espalda' },
    { tr: 'Omurga tek uzun bir C', en: 'One long C through the spine', es: 'Una C larga en la columna' },
    { tr: 'Kızağı kontrol et', en: 'Control the carriage', es: 'Controla el carro' }],
};
}
