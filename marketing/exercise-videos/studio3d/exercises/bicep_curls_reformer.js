/* Reformer Biceps Curls. Cross-legged on the carriage FACING THE RISERS (yaw 180, character faces -x), ropes from the risers
 * in front to the handles, palms up. Curling the hands to the shoulders pulls the carriage ~15 cm toward the risers (-x);
 * lowering lets it close. Elbows stay pinned beside the ribs (shoulder flexion ~20 in both poses).
 * - Body rides on the carriage: pose.pos = [+opening, 0, 0] (pos is body-frame, yaw 180 -> world -x), carriage centre = pelvis x - 0.15 (sitting in front of the blocks).
 * - Legs crossed: ankle IK targets on the pad relative to the pelvis, mirrored for the -x facing.
 * - Side view from the character's LEFT (yaw -90) so she faces right; marks use the near (L) side. */
{
const { V, M } = FB;
const TOP = 0.38, CX0 = 0.13, SEAT = 0.15;
const PX = CX0 + SEAT;
FB.PROPS._curlHandles = (sol, o = {}) => {
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
const BASE = { ...LEGS, yaw: 180, pos: [0, 0, 0], trunk: 0, ground: [['pelvis', TOP - 0.035]], neck: 6, sh: 20, shAbd: 9, shRot: 0, lumbar: -2 };
const OPEN = 0.15;
const RAW = {
  long: { ...BASE, sh: 34, el: 10 },   // spec 20: lower hands would rest on the crossed knees
  curl: { ...BASE, el: 140, pos: [OPEN, 0, 0] },
};
const CTX = { anchorX: ['pelvis'], anchorAt: [PX, 0] };

function fit(poses, extra) {
  // facing -x: everything mirrored in x and z; right foot in front, each ankle tucked under the opposite shin
  const foot = (s, dx) => {
    const sg = s === 'R' ? 1 : -1, x = V.norm([-0.35, 0, sg]), y = [0, 1, 0], z = V.cross(x, y);
    return { at: [PX + dx - (s === 'R' ? 0.3 : 0.17), TOP + 0.055, sg * 0.12], foot: { 0: x, 1: y, 2: z } };
  };
  const legs = (p) => { const dx = p.pos ? -p.pos[0] : 0; /* pos is body-frame (yaw 180) */ p.ik = Object.assign({}, p.ik, { ankleR: foot('R', dx), ankleL: foot('L', dx) }); };
  for (const k in poses) legs(poses[k]);
  for (const [at, pose] of extra) { const m = Object.assign({}, poses[at], pose); legs(m); pose.ik = m.ik; }
  return poses;
}

window.EXERCISE = {
  id: 'bicep_curls_reformer',
  name: { tr: 'Biceps Curl (Reformer)', en: 'Biceps Curls (Reformer)', es: 'Curl de bíceps (reformer)' },
  category: { tr: 'Reformer · Kol', en: 'Reformer · Arms', es: 'Reformer · Brazos' },
  equipmentLabel: { tr: 'Reformer · 1 kırmızı yay · kayışlar', en: 'Reformer · 1 red spring · straps', es: 'Reformer · 1 muelle rojo · correas' },
  muscles: ['biceps', 'forearms', 'core'],
  tempo: '1.5-1.5',
  view: { yaw: -90, pitch: 8, zoom: 1.2, dx: 30 },
  alt: { yaw: -150, pitch: 10, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Dirsekler gövdenin yanında, bilekler düz', en: 'Elbows beside the body, wrists straight', es: 'Codos junto al cuerpo, muñecas rectas' } },
  setupView: { yaw: -130, pitch: 18 },
  props: [['reformer', { springs: 1, carriage: (sol) => sol.J.pelvis[0] - SEAT }], ['_curlHandles', { kind: 'supinated' }]],
  ctx: CTX,
  contacts: ['pelvis', 'ankleL', 'ankleR', 'handL', 'handR'],
  get poses() { return this._poses || (this._poses = fit(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'long',
  rep: [
    { to: 'curl', dur: 1.5, phase: 0 },
    { to: 'long', dur: 1.5, phase: 1 },
  ],
  setup: { tr: 'Kayışlara dönük bağdaş kur, dik otur. Tutamaklar avuçta, avuçlar yukarı, kollar önde uzun.',
    en: 'Sit cross-legged facing the straps, tall. Handles in the palms, palms up, arms long in front.',
    es: 'Piernas cruzadas mirando a las correas, erguida. Palmas arriba, brazos largos al frente.' },
  phases: [
    { name: { tr: 'Bük', en: 'Curl', es: 'Flexiona' }, breath: 'out', arc: ['shoulderL', 'elbowL', 'wristL'],
      text: { tr: 'Elleri omuzlara doğru bük; dirsekler yerinde kalır, kızak hafifçe açılır.', en: 'Curl the hands toward the shoulders; elbows stay put, the carriage opens a little.', es: 'Lleva las manos a los hombros; los codos quietos, el carro se abre un poco.' } },
    { name: { tr: 'Kontrollü indir', en: 'Lower with control', es: 'Baja con control' }, breath: 'in',
      text: { tr: 'Yaylara direnerek kolları uzat. Kızak sessizce kapansın.', en: 'Resist the springs as you straighten the arms. Let the carriage close quietly.', es: 'Resiste los muelles al estirar. El carro se cierra sin golpe.' } },
  ],
  tempoText: { tr: '1,5 sn bük · 1,5 sn indir', en: '1.5 s curl · 1.5 s lower', es: '1,5 s flexiona · 1,5 s baja' },
  mistakes: [
    { title: { tr: 'Dirsekler öne kayıyor', en: 'Elbows drift forward', es: 'Los codos se adelantan' },
      fix: { tr: 'Dirsekleri sabitle', en: 'Pin the elbows', es: 'Fija los codos' },
      fixText: { tr: 'Dirsekler kaburgaların yanında kalsın', en: 'Keep the elbows beside the ribs', es: 'Codos junto a las costillas' },
      at: 'curl', pose: { sh: 58, el: 128 }, line: ['shoulderL', 'elbowL'], marks: ['elbowL'], parts: ['upperL', 'upperR'] },
    { title: { tr: 'Gövdeyle geriye çekmek', en: 'Leaning back to pull', es: 'Inclinarse atrás para tirar' },
      fix: { tr: 'Gövde dik', en: 'Stay upright', es: 'Erguida' },
      fixText: { tr: 'Karın sıkı, işi sadece kollar yapsın', en: 'Brace the abs, let only the arms work', es: 'Abdomen firme, solo trabajan los brazos' },
      at: 'curl', pose: { trunk: -16, lumbar: 4, neck: 12 }, line: ['pelvis', 'neck'], parts: ['waist', 'chest'] },
  ],
  cues: [{ tr: 'Dirsekler sabit', en: 'Elbows still', es: 'Codos quietos' },
    { tr: 'Omuzlar aşağıda', en: 'Shoulders low', es: 'Hombros abajo' },
    { tr: 'Kızağı kontrol et', en: 'Control the carriage', es: 'Controla el carro' }],
};
}
