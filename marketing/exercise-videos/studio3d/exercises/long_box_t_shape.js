/* Reformer Pulling Straps II (T shape) on the long box. Same set-up as long_box_pulling_straps.js (long box against the
 * shoulder blocks, prone FACING THE RISERS: yaw 180 + trunk 90, ground [pelvis, kneeR] on the box top). From reaching forward
 * (shoulder flexion ~165) the straight arms open out to a T at shoulder height while the chest lifts (thoracic extension);
 * the carriage opens ~15 cm toward the risers.
 * - Arm path: sh fixed at 165 and shAbd 15 -> 90, i.e. the arms swing in (almost) the shoulder-height plane, never down
 *   past the box (with sh ~180 the abduction axis is the thorax's forward axis).
 * - Main camera is the front (she faces the camera, yaw 180), as the spec asks; side view as alt. */
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
const OPEN = 0.15;
const RAW = {
  reach: { ...BASE, sh: 165, shAbd: 15, palm: 'down' },
  open: { ...BASE, sh: 165, shAbd: 90, thoracic: -26, lumbar: -6, neck: -2, pos: [OPEN, 0, 0], palm: 'down' },
};

window.EXERCISE = {
  id: 'long_box_t_shape',
  name: { tr: 'Pulling Straps II (T Şekli)', en: 'Pulling Straps II (T Shape)', es: 'Pulling Straps II (forma de T)' },
  category: { tr: 'Reformer · Sırt', en: 'Reformer · Back', es: 'Reformer · Espalda' },
  equipmentLabel: { tr: 'Reformer · uzun kutu · 1 kırmızı + 1 mavi yay', en: 'Reformer · long box · 1 red + 1 blue spring', es: 'Reformer · caja larga · 1 muelle rojo + 1 azul' },
  muscles: ['upperback', 'delts', 'lowerback'],
  tempo: '2-2.5',
  view: { yaw: 180, pitch: 16, zoom: 1.0 },
  alt: { yaw: -90, pitch: 8, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
    text: { tr: 'Göğüs kalkar, bacaklar uzun ve bitişik', en: 'The chest lifts, legs long and together', es: 'El pecho se eleva, piernas largas y juntas' } },
  setupView: { yaw: -130, pitch: 22 },
  props: [['reformer', { springs: 2, footbar: false, box: 'long', boxOffset: BOX_OFF, carriage: (sol) => sol.J.pelvis[0] - PEL_OFF }], ['_lbHandles', { kind: 'pronated' }]],
  ctx: { anchorX: ['pelvis'], anchorAt: [PX, 0] },
  contacts: ['pelvis', 'chest', 'handL', 'handR'],
  poses: RAW,
  rest: 'reach',
  rep: [
    { to: 'open', dur: 2.0, phase: 0 },
    { to: 'reach', dur: 2.5, phase: 1 },
  ],
  setup: { tr: 'Uzun kutuya yüzüstü uzan, göğüs kutunun ucunda. Bacaklar bitişik, kollar öne uzanmış.',
    en: 'Lie face down on the long box, chest at its end. Legs together, arms reaching forward.',
    es: 'Boca abajo en la caja larga, pecho en el borde. Piernas juntas, brazos al frente.' },
  phases: [
    { name: { tr: 'T\'ye aç', en: 'Open to a T', es: 'Abre en T' }, breath: 'out', line: ['handL', 'shoulderL', 'shoulderR', 'handR'],
      text: { tr: 'Düz kolları omuz hizasında yana aç, göğüs kalkar. Kürekler birbirine yaklaşır.', en: 'Open the straight arms out at shoulder height as the chest lifts. Blades draw together.', es: 'Abre los brazos rectos a la altura del hombro y eleva el pecho. Escápulas juntas.' } },
    { name: { tr: 'Kontrollü uzan', en: 'Reach back forward', es: 'Vuelve al frente' }, breath: 'in',
      text: { tr: 'Kolları öne getir, göğsü indir. Kızak sessizce kapansın.', en: 'Bring the arms forward and lower the chest. Let the carriage close quietly.', es: 'Lleva los brazos al frente y baja el pecho. El carro se cierra sin golpe.' } },
  ],
  tempoText: { tr: '2 sn aç · 2,5 sn uzan', en: '2 s open · 2.5 s reach', es: '2 s abre · 2,5 s alarga' },
  mistakes: [
    { title: { tr: 'Omuzlar kulaklara kalkıyor', en: 'Shoulders shrug', es: 'Hombros a las orejas' },
      fix: { tr: 'Kürekler aşağı', en: 'Shoulder blades down', es: 'Escápulas abajo' },
      fixText: { tr: 'Boyun uzun, kollar sırttan açılsın', en: 'Long neck, open the arms from the back', es: 'Cuello largo, abre desde la espalda' },
      at: 'open', pose: { shrug: 0.05, neck: -12 }, marks: ['shoulderL', 'shoulderR'], parts: ['neck', 'upperL', 'upperR'] },
    { title: { tr: 'Kollar aşağı düşüyor', en: 'Arms sag', es: 'Los brazos caen' },
      fix: { tr: 'Kollar omuz hizasında', en: 'Arms at shoulder height', es: 'Brazos a la altura del hombro' },
      fixText: { tr: 'Parmak uçlarına kadar uzun bir T', en: 'One long T to the fingertips', es: 'Una T larga hasta los dedos' },
      at: 'open', pose: { sh: 100, shAbd: 62, el: 12 }, line: ['handL', 'shoulderL', 'shoulderR', 'handR'], parts: ['upperL', 'upperR', 'foreL', 'foreR'] },
  ],
  cues: [{ tr: 'Kollarla uzun uzan', en: 'Reach long through the arms', es: 'Alarga los brazos' },
    { tr: 'Kürekleri sık', en: 'Squeeze the shoulder blades', es: 'Junta las escápulas' },
    { tr: 'Boyun uzun', en: 'Neck long', es: 'Cuello largo' }],
};
}
