/* Reformer Reverse Chest Expansion. Kneeling upright FACING THE FOOTBAR, feet/heels against the front of the shoulder blocks,
 * shins and tops of the feet on the pad (ground [kneeR, ankleR], knee 90, ankle -62). Ropes run from the risers BEHIND her
 * to the handles. Pressing the straight arms forward to shoulder height pulls the hands away from the pulleys, so the
 * carriage opens ~15 cm toward the risers (-x); lowering closes it. Ribs stay stacked over the pelvis.
 * - Body rides on the carriage: pos [-d] (yaw 0), carriage centre = knee x - KNEE_OFF (toes touch the blocks).
 * - Hands a little wider than the shoulders (shAbd 12) so the ropes pass outside the shoulders. */
{
const { V, M } = FB;
const TOP = 0.38, CX0 = 0.13, KNEE_OFF = 0.355;
const KX = CX0 + KNEE_OFF;
FB.PROPS._rceHandles = (sol, o = {}) => {
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
const BASE = { pos: [0, 0, 0], knee: 90, ankle: -62, flat: false, abd: 3, ground: G, hip: 0, lumbar: -2, thoracic: 0, neck: 2,
  shAbd: 12, el: 3, elbowPole: [-1, -0.3, 0.4] };
const OPEN = 0.15;
const RAW = {
  low: { ...BASE, sh: -8 },
  press: { ...BASE, sh: 90, shAbd: 20, pos: [-OPEN, 0, 0] },
};

window.EXERCISE = {
  id: 'reverse_chest_expansion',
  name: { tr: 'Ters Chest Expansion', en: 'Reverse Chest Expansion', es: 'Expansión de pecho inversa' },
  category: { tr: 'Reformer · Göğüs ve omuz', en: 'Reformer · Chest & shoulders', es: 'Reformer · Pecho y hombros' },
  equipmentLabel: { tr: 'Reformer · 1 kırmızı yay · kayışlar', en: 'Reformer · 1 red spring · straps', es: 'Reformer · 1 muelle rojo · correas' },
  muscles: ['chest', 'delts', 'triceps', 'core'],
  tempo: '2-2',
  view: { yaw: 90, pitch: 8, zoom: 1.15, dx: -30 },
  alt: { yaw: 30, pitch: 12, title: { tr: 'Önden çapraz', en: 'Front angle', es: 'Vista frontal' },
    text: { tr: 'Kollar omuz genişliğinde, omuz hizasına kadar', en: 'Arms shoulder-width, up to shoulder height', es: 'Brazos al ancho de hombros, hasta la altura del hombro' } },
  setupView: { yaw: 50, pitch: 18 },
  props: [['reformer', { springs: 1, carriage: (sol) => (sol.J.kneeL[0] + sol.J.kneeR[0]) / 2 - KNEE_OFF }], ['_rceHandles', { kind: 'pronated' }]],
  ctx: { anchorX: ['kneeL', 'kneeR'], anchorAt: [KX, 0] },
  contacts: ['kneeL', 'kneeR', 'ankleL', 'ankleR', 'handL', 'handR'],
  poses: RAW,
  rest: 'low',
  rep: [
    { to: 'press', dur: 2.0, phase: 0 },
    { to: 'low', dur: 2.0, phase: 1 },
  ],
  setup: { tr: 'Footbar\'a dönük diz çök, ayaklar omuz bloklarına dayalı. Uyluklar dik, tutamaklar yanlarda aşağıda.',
    en: 'Kneel facing the footbar, feet against the shoulder blocks. Thighs upright, handles low by your sides.',
    es: 'De rodillas mirando a la barra, pies contra los topes. Muslos verticales, asas abajo a los lados.' },
  phases: [
    { name: { tr: 'Öne it', en: 'Press forward', es: 'Empuja al frente' }, breath: 'out', arc: ['hipR', 'shoulderR', 'elbowR'],
      text: { tr: 'Düz kolları omuz hizasına kaldır. Kızak açılır, kaburgalar pelvisin üstünde kalır.', en: 'Raise the straight arms to shoulder height. The carriage opens, ribs stay over the pelvis.', es: 'Sube los brazos rectos a la altura del hombro. El carro se abre, costillas sobre la pelvis.' } },
    { name: { tr: 'Kontrollü indir', en: 'Lower with control', es: 'Baja con control' }, breath: 'in', line: ['kneeR', 'pelvis', 'neck'],
      text: { tr: 'Kolları yanlara indir, kızak sessizce kapansın. Gövde dik.', en: 'Lower the arms to your sides, let the carriage close quietly. Stay upright.', es: 'Baja los brazos y deja que el carro se cierre sin golpe. Erguida.' } },
  ],
  tempoText: { tr: '2 sn it · 2 sn indir', en: '2 s press · 2 s lower', es: '2 s empuja · 2 s baja' },
  mistakes: [
    { title: { tr: 'Gövde geriye yatıyor', en: 'Torso leans back', es: 'El torso se inclina atrás' },
      fix: { tr: 'Karnı sık, dik kal', en: 'Brace and stay upright', es: 'Abdomen firme, erguida' },
      fixText: { tr: 'Diz, kalça ve omuz tek çizgide', en: 'Knee, hip and shoulder in one line', es: 'Rodilla, cadera y hombro en línea' },
      at: 'press', pose: { hip: -14, lumbar: -6, neck: -6, sh: 98 }, line: ['kneeR', 'pelvis', 'neck'], parts: ['waist', 'pelvis'] },
    { title: { tr: 'Omuzlar kulaklara kalkıyor', en: 'Shoulders hike', es: 'Hombros a las orejas' },
      fix: { tr: 'Kürekler aşağı', en: 'Shoulder blades down', es: 'Escápulas abajo' },
      fixText: { tr: 'Boyun uzun, kollar sırttan uzansın', en: 'Long neck, reach from the back', es: 'Cuello largo, alarga desde la espalda' },
      at: 'press', pose: { shrug: 0.05, sh: 100, neck: 8 }, view: { yaw: 30, pitch: 8 }, marks: ['shoulderR', 'shoulderL'], parts: ['neck', 'upperR', 'upperL'] },
  ],
  cues: [{ tr: 'Kaburgalar pelvisin üstünde', en: 'Ribs over the pelvis', es: 'Costillas sobre la pelvis' },
    { tr: 'Sırttan it', en: 'Press from the back', es: 'Empuja desde la espalda' },
    { tr: 'Kızağı kontrol et', en: 'Control the carriage', es: 'Controla el carro' }],
};
}
