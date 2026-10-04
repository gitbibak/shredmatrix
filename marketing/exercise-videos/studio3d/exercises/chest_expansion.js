/* Reformer Chest Expansion. Kneeling upright FACING THE RISERS (yaw 180, she faces -x), knees against the back of the
 * shoulder blocks, shins and tops of the feet on the pad (camel_pose.js kneel: ground [kneeR, ankleR], knee 90, ankle -62).
 * Ropes from the risers in front to the handles. Pressing the straight arms back to ~45 deg opens the carriage ~20 cm toward
 * the risers; the head turns right and left while the arms stay back; the arms return and the carriage closes.
 * - pos is body-frame (yaw 180): pos [+d] = carriage d metres open toward the risers. Carriage centre = knee x + KNEE_OFF.
 * - Side view from her LEFT (yaw -90) so she faces right; arcs/marks on the near (L) side. */
{
const { V, M } = FB;
const TOP = 0.38, CX0 = 0.13, KNEE_OFF = 0.23;
const KX = CX0 - KNEE_OFF;
FB.PROPS._ceHandles = (sol, o = {}) => {
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
const G = [['kneeR', TOP], ['ankleR', TOP - 0.03]];
const BASE = { yaw: 180, pos: [0, 0, 0], knee: 90, ankle: -62, flat: false, abd: 3, ground: G, hip: 0, lumbar: -2, thoracic: 0, neck: 2,
  shAbd: 8, el: 3, headTurn: 0, elbowPole: [-1, -0.3, 0.4] };
const OPEN = 0.2;
const BACK = { sh: -45, shAbd: 15, thoracic: -4, pos: [OPEN, 0, 0] };   // hands wide enough that the ropes pass beside the hips
const RAW = {
  kneel: { ...BASE, sh: 4 },
  back: { ...BASE, ...BACK },
  lookR: { ...BASE, ...BACK, headTurn: -45 },
  lookL: { ...BASE, ...BACK, headTurn: 45 },
};

window.EXERCISE = {
  id: 'chest_expansion',
  name: { tr: 'Chest Expansion (Göğüs Genişletme)', en: 'Chest Expansion', es: 'Expansión de pecho' },
  category: { tr: 'Reformer · Sırt ve kol', en: 'Reformer · Back & arms', es: 'Reformer · Espalda y brazos' },
  equipmentLabel: { tr: 'Reformer · 1 kırmızı yay · kayışlar', en: 'Reformer · 1 red spring · straps', es: 'Reformer · 1 muelle rojo · correas' },
  muscles: ['triceps', 'delts', 'upperback', 'core'],
  tempo: '2-1.5-2',
  view: { yaw: -90, pitch: 8, zoom: 1.15, dx: 30 },
  alt: { yaw: -170, pitch: 10, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Baş sağa ve sola döner, omuzlar kıpırdamaz', en: 'The head turns right and left, shoulders stay still', es: 'La cabeza gira a ambos lados, hombros quietos' } },
  setupView: { yaw: -130, pitch: 18 },
  props: [['reformer', { springs: 1, carriage: (sol) => (sol.J.kneeL[0] + sol.J.kneeR[0]) / 2 + KNEE_OFF }], ['_ceHandles', { kind: 'neutral' }]],
  ctx: { anchorX: ['kneeL', 'kneeR'], anchorAt: [KX, 0] },
  contacts: ['kneeL', 'kneeR', 'ankleL', 'ankleR', 'handL', 'handR'],
  poses: RAW,
  rest: 'kneel',
  rep: [
    { to: 'back', dur: 2.0, phase: 0 },
    { to: 'lookR', dur: 0.75, phase: 1 },
    { to: 'lookL', dur: 1.2, card: false },
    { to: 'kneel', dur: 2.0, phase: 2 },
  ],
  setup: { tr: 'Kayışlara dönük diz çök, dizler omuz bloklarına yaslı. Uyluklar dik, kollar yanlarda uzun.',
    en: 'Kneel facing the straps, knees against the shoulder blocks. Thighs upright, arms long by your sides.',
    es: 'De rodillas mirando a las correas, rodillas contra los topes. Muslos verticales, brazos largos.' },
  phases: [
    { name: { tr: 'Kolları geriye it', en: 'Press the arms back', es: 'Empuja los brazos atrás' }, breath: 'out', arc: ['hipL', 'shoulderL', 'elbowL'],
      text: { tr: 'Düz kolları 45° geriye bastır, göğüs açılır. Kızak açılır, gövde dik kalır.', en: 'Press the straight arms back to 45°, chest open. The carriage opens, you stay upright.', es: 'Lleva los brazos rectos a 45° atrás, pecho abierto. El carro se abre, tú erguida.' } },
    { name: { tr: 'Başı sağa, sola çevir', en: 'Turn the head right, left', es: 'Gira la cabeza' }, breath: 'hold',
      text: { tr: 'Kollar geride kalırken başı sağa, sonra sola çevir.', en: 'Keep the arms back and turn the head right, then left.', es: 'Brazos atrás; gira la cabeza a la derecha y luego a la izquierda.' } },
    { name: { tr: 'Kontrollü dön', en: 'Return slowly', es: 'Vuelve despacio' }, breath: 'in',
      text: { tr: 'Başı ortala, kolları yanlara getir. Kızak sessizce kapansın.', en: 'Head to centre, arms back to your sides. Let the carriage close quietly.', es: 'Cabeza al centro, brazos a los lados. El carro se cierra sin golpe.' } },
  ],
  tempoText: { tr: '2 sn it · 1,5 sn baş · 2 sn dön', en: '2 s press · 1.5 s head turns · 2 s return', es: '2 s empuja · 1,5 s cabeza · 2 s vuelve' },
  mistakes: [
    { title: { tr: 'Bel çukurlaşıyor', en: 'Lower back arches', es: 'La zona lumbar se arquea' },
      fix: { tr: 'Kaburgaları indir', en: 'Knit the ribs down', es: 'Cierra las costillas' },
      fixText: { tr: 'Karın sıkı, kuyruk sokumu aşağı uzar', en: 'Brace the abs, tailbone long', es: 'Abdomen firme, coxis largo' },
      at: 'back', pose: { hip: -5, lumbar: -13, thoracic: -8, neck: -6 }, line: ['kneeL', 'pelvis', 'waist', 'neck'], goodLine: ['kneeL', 'pelvis', 'neck'], parts: ['waist', 'chest'] },
    { title: { tr: 'Kalçadan öne kırılmak', en: 'Breaking at the hips', es: 'Doblarse por la cadera' },
      fix: { tr: 'Diz-kalça-omuz tek çizgi', en: 'Knee, hip, shoulder in line', es: 'Rodilla, cadera y hombro alineados' },
      fixText: { tr: 'Kalçayı öne it, işi kollar yapsın', en: 'Hips forward, let the arms do the work', es: 'Cadera adelante, que trabajen los brazos' },
      at: 'back', pose: { hip: 24, lumbar: 4, sh: -34 }, line: ['kneeL', 'pelvis', 'neck'], parts: ['pelvis', 'waist'] },
  ],
  cues: [{ tr: 'Omurga uzun ve dik', en: 'Tall spine', es: 'Columna erguida' },
    { tr: 'Kaburgalar içeride', en: 'Ribs knit down', es: 'Costillas cerradas' },
    { tr: 'Göğsü bele yüklenmeden aç', en: 'Open the chest without arching', es: 'Abre el pecho sin arquear' }],
};
}
