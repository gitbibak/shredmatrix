/* Toes to bar (strict). Hanging setup from pull_up.js: hands are world IK targets on the bar, a lazy `pos` getter lifts the body
 * so the shoulders hang at the distance that gives the wanted elbow angle (here ~straight arms), `dx` = shoulder behind the bar.
 * Straight legs, pointed feet. Top: hip flexion ~150 with lumbar flexion and the body leaning back so the toes reach the bar.
 * Mistakes are shown on hang/rise poses: after each mistake the engine returns to the rest pose in 0.9 s, and from the
 * toes-at-bar pose that is >6 cm per frame (qa limb-jump check). */
{
const BAR_Y = 2.3, GZ = 0.26;
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
  id: 'toes_to_bar',
  name: { tr: 'Toes to Bar', en: 'Toes to Bar', es: 'Pies a la barra (toes to bar)' },
  category: { tr: 'Karın · Core', en: 'Core', es: 'Core' },
  equipmentLabel: { tr: 'Barfiks barı', en: 'Pull-up bar', es: 'Barra de dominadas' },
  muscles: ['core', 'obliques', 'lats', 'forearms'],
  tempo: '1.2-0-1.8',
  view: { yaw: 90, pitch: 4 },
  alt: { yaw: 25, pitch: 4, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Bacaklar bitişik ve düz', en: 'Legs together and straight', es: 'Piernas juntas y rectas' } },
  setupView: { yaw: 35, pitch: 8 },
  setupMarks: [{ type: 'aline', joints: ['handL', 'shoulderL', 'shoulderR', 'handR'] }],
  props: [['_backPostBar', { y: BAR_Y }]],
  ctx: CTX,
  contacts: ['handL', 'handR'],
  poses: {
    hang: hang({ trunk: 0, hip: 2, lumbar: 2, shrug: -0.01, neck: 0 }, 6, 0.0),
    rise: hang({ trunk: -7, hip: 46, lumbar: 8, shrug: -0.01, neck: 4, ankle: -25 }, 6, 0.08),
    top: hang({ trunk: -34, hip: 124, lumbar: 20, thoracic: 10, shrug: -0.015, neck: 18, ankle: -20, sh: 162 }, 8, 0.2),
  },
  rest: 'hang',
  rep: [
    { to: 'top', dur: 2.4, phase: 0 },
    { to: 'hang', dur: 2.8, phase: 1 },
  ],
  setup: { tr: 'Barı omuzdan biraz geniş, avuçlar öne tut. Omuzlar aktif, bacaklar düz ve bitişik.',
    en: 'Grip the bar a bit wider than the shoulders, palms forward. Active shoulders, legs straight and together.',
    es: 'Agarra la barra algo más ancha que los hombros. Hombros activos, piernas rectas y juntas.' },
  phases: [
    { name: { tr: 'Ayakları bara getir', en: 'Toes to the bar', es: 'Pies a la barra' }, breath: 'out', arc: ['neck', 'hipR', 'ankleR'],
      text: { tr: 'Barı aşağı bastır, hafif geriye yaslan ve düz bacakları bara kadar kaldır.', en: 'Press the bar down, lean back a little and pike straight legs up to the bar.', es: 'Empuja la barra, inclínate un poco atrás y sube las piernas rectas a la barra.' } },
    { name: { tr: 'Kontrollü indir', en: 'Lower with control', es: 'Baja con control' }, breath: 'in',
      text: { tr: 'Bacakları sallanmadan asılı pozisyona indir.', en: 'Lower the legs to the hang without swinging.', es: 'Baja las piernas a colgado sin balanceo.' } },
  ],
  tempoText: { tr: 'Gerçekte 1,2 sn kaldır · 1,8 sn indir · burada yavaş', en: 'Real pace 1.2 s up · 1.8 s down · shown slower', es: 'Ritmo real 1,2 s sube · 1,8 s baja · aquí más lento' },
  mistakes: [
    { title: { tr: 'Dizler bükülüyor', en: 'Bent knees', es: 'Rodillas dobladas' },
      fix: { tr: 'Bacakları düz tut', en: 'Keep the legs straight', es: 'Piernas rectas' },
      fixText: { tr: 'Düz bacak, karın daha çok çalışır', en: 'Straight legs make the abs do the work', es: 'Piernas rectas: trabaja el abdomen' },
      at: 'rise', pose: hang({ trunk: -4, hip: 72, knee: 100, lumbar: 6, shrug: -0.01, neck: 4, ankle: -25 }, 6, 0.06),
      line: ['hipR', 'kneeR', 'ankleR'], marks: ['kneeR'], parts: ['thigh', 'shin'] },
    { title: { tr: 'Kontrolsüz sallanma', en: 'Uncontrolled swinging', es: 'Balanceo sin control' },
      fix: { tr: 'Gövdeyi sık', en: 'Tighten the body', es: 'Aprieta el cuerpo' },
      fixText: { tr: 'Her tekrar hareketsiz asılıştan başlar', en: 'Every rep starts from a still hang', es: 'Cada repetición empieza quieta' },
      at: 'hang', pose: hang({ trunk: -13, hip: 20, lumbar: -6, shrug: -0.01, neck: -2, ankle: -25 }, 6, 0.13),
      line: ['handR', 'shoulderR', 'hipR'], marks: ['ankleR'], parts: ['thigh', 'shin', 'waist'] },
  ],
  cues: [{ tr: 'Barı aşağı bastır', en: 'Press down on the bar', es: 'Empuja la barra hacia abajo' },
    { tr: 'Düz bacaklar', en: 'Straight legs', es: 'Piernas rectas' },
    { tr: 'İnişi kontrol et', en: 'Control the descent', es: 'Controla la bajada' }],
};
}
