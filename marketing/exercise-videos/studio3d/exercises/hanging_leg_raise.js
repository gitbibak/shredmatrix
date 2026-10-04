/* Hanging leg raise. Hanging setup from pull_up.js: hands are world IK targets on the bar, a lazy `pos` getter lifts the body
 * so the shoulders hang at the distance that gives the wanted elbow angle (here ~straight arms), `dx` = shoulder behind the bar.
 * Straight legs (knee 2-5), pointed feet. Top: hip ~95 with a posterior pelvic tilt (lumbar flexion) and a slight lean back. */
{
const BAR_Y = 2.3, GZ = 0.22;
const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };
// bar with the uprights set 0.4 m behind it (the stock pullupBar posts stand at the bar and hide the body in the side view)
FB.PROPS._backPostBar = (sol, o = {}) => {
  const y = o.y, px = -0.42, w = 0.75;
  const out = [{ t: 'cyl', a: [0, y, -w], b: [0, y, w], r: 0.018, m: 'chrome' }];
  for (const z of [-w, w]) {
    out.push({ t: 'box', c: [px, (y + 0.06) / 2, z], s: [0.07, y + 0.06, 0.07], m: 'frame' });
    out.push({ t: 'box', c: [px / 2, y + 0.03, z], s: [-px + 0.07, 0.05, 0.05], m: 'frame' });
    out.push({ t: 'box', c: [px, 0.02, z], s: [0.5, 0.04, 0.09], m: 'frame' });
  }
  return out;
};
const IK = { handL: { at: [0, BAR_Y, -GZ] }, handR: { at: [0, BAR_Y, GZ] } };
function hang(p, el, dx) {
  const o = Object.assign({ elbowPole: [0.25, -1, 0.7], ik: IK, noAvoid: true, ground: [['pelvis', 0]], palm: 'forward', curl: 0.85,
    abd: -2, knee: 2, ankle: -30, flat: false, sh: 172 }, p);
  Object.defineProperty(o, 'pos', { enumerable: true, configurable: true, get() {
    const B = FB.BODY, q = {}; for (const k of Object.keys(o)) if (k !== 'pos' && k !== 'ik') q[k] = Object.getOwnPropertyDescriptor(o, k).value;
    const s = FB.solve(FB.expand(q), CTX), S = s.J.shoulderR;
    const f = B.fore + B.hand * 0.55, e = (180 - el) * Math.PI / 180;
    const d = Math.sqrt(B.upper * B.upper + f * f - 2 * B.upper * f * Math.cos(e));
    const dz = GZ - S[2], dy = Math.sqrt(Math.max(0, d * d - dx * dx - dz * dz));
    return [-dx - S[0], BAR_Y - dy - S[1], 0];
  } });
  return o;
}

window.EXERCISE = {
  id: 'hanging_leg_raise',
  name: { tr: 'Asılı Bacak Kaldırma', en: 'Hanging Leg Raise', es: 'Elevación de piernas colgado' },
  category: { tr: 'Karın · Core', en: 'Core', es: 'Core' },
  equipmentLabel: { tr: 'Barfiks barı', en: 'Pull-up bar', es: 'Barra de dominadas' },
  muscles: ['core', 'obliques', 'forearms', 'lats'],
  tempo: '1.5-0-2.5',
  view: { yaw: 90, pitch: 4 },
  alt: { yaw: 25, pitch: 4, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Bacaklar bitişik, omuzlar kulaktan uzak', en: 'Legs together, shoulders away from the ears', es: 'Piernas juntas, hombros lejos de las orejas' } },
  setupView: { yaw: 35, pitch: 8 },
  setupMarks: [{ type: 'aline', joints: ['handL', 'shoulderL', 'shoulderR', 'handR'] }],
  props: [['_backPostBar', { y: BAR_Y }]],
  ctx: CTX,
  contacts: ['handL', 'handR'],
  poses: {
    hang: hang({ trunk: 0, hip: 2, shrug: -0.01, neck: 0 }, 6, 0.0),
    top: hang({ trunk: -6, hip: 88, lumbar: 14, thoracic: 6, shrug: -0.01, neck: 6, ankle: -25 }, 8, 0.05),
  },
  rest: 'hang',
  rep: [
    { to: 'top', dur: 1.5, phase: 0 },
    { to: 'hang', dur: 2.5, phase: 1 },
  ],
  setup: { tr: 'Barı avuçlar öne bakacak şekilde omuz genişliğinde tut. Omuzları aşağı çek, bacaklar düz ve bitişik.',
    en: 'Overhand grip, shoulder-width. Pull the shoulders down, legs straight and together.',
    es: 'Agarre prono al ancho de hombros. Hombros abajo, piernas rectas y juntas.' },
  phases: [
    { name: { tr: 'Kaldır', en: 'Raise', es: 'Sube' }, breath: 'out', arc: ['neck', 'hipR', 'ankleR'],
      text: { tr: 'Düz bacakları en az yere paralel olana kadar kaldır. Leğeni yukarı kıvır.', en: 'Raise straight legs to at least parallel. Curl the pelvis up at the top.', es: 'Sube las piernas rectas al menos a paralelo. Enrolla la pelvis arriba.' } },
    { name: { tr: 'Yavaşça indir', en: 'Lower slowly', es: 'Baja despacio' }, breath: 'in',
      text: { tr: 'Bacakları sallanmadan, yavaşça aşağı indir.', en: 'Lower the legs slowly, without swinging.', es: 'Baja las piernas despacio, sin balanceo.' } },
  ],
  tempoText: { tr: '1,5 sn kaldır · 2,5 sn indir', en: '1.5 s up · 2.5 s down', es: '1,5 s sube · 2,5 s baja' },
  mistakes: [
    { title: { tr: 'Sallanmak', en: 'Swinging', es: 'Balancearse' },
      fix: { tr: 'Kontrol et, altta dur', en: 'Control it, pause at the bottom', es: 'Controla, pausa abajo' },
      fixText: { tr: 'Her tekrar hareketsiz asılıştan başlar', en: 'Every rep starts from a still hang', es: 'Cada repetición empieza quieta' },
      at: 'hang', pose: hang({ trunk: -16, hip: 24, lumbar: -6, shrug: -0.01, neck: -2, ankle: -25 }, 6, 0.17), view: { yaw: 90, pitch: 4 },
      line: ['handR', 'shoulderR', 'hipR'], marks: ['ankleR'], parts: ['thigh', 'shin', 'waist'] },
    { title: { tr: 'Omuzlar kulaklara kalkıyor', en: 'Shoulders shrug up', es: 'Hombros hacia las orejas' },
      fix: { tr: 'Omuzları aşağı çek', en: 'Pull the shoulders down', es: 'Baja los hombros' },
      fixText: { tr: 'Aktif omuz: boyun uzun, kürek kemikleri aşağıda', en: 'Active shoulders: long neck, shoulder blades down', es: 'Hombros activos: cuello largo, escápulas abajo' },
      at: 'hang', pose: hang({ trunk: 0, hip: 2, shrug: 0.055, neck: 4 }, 6, 0.0), view: { yaw: 25, pitch: 4 },
      marks: ['shoulderR', 'shoulderL'], parts: ['neck', 'upper'] },
  ],
  cues: [{ tr: 'Omuzlar aktif', en: 'Shoulders active', es: 'Hombros activos' },
    { tr: 'Tepede leğeni kıvır', en: 'Curl the pelvis at the top', es: 'Enrolla la pelvis arriba' },
    { tr: 'Sallanma, bacaklar bitişik', en: 'No swing, legs together', es: 'Sin balanceo, piernas juntas' }],
};
}
