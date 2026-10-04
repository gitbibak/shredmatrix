/* Reformer Standing Lunge / Eve's Lunge. Facing the footbar (+x): FRONT (right, near the camera) foot flat on the standing
 * platform (fixed), BACK (left) toes tucked on the carriage with the sole against the shoulder block, both hands flat on
 * the footbar. The back leg pushes the carriage away and straightens; the front knee opens.
 * - Front foot: anchorX ankleR + flat heel on the platform (0.38). Hands: world IK targets on top of the bar.
 * - Back foot: the back-hip angle is solved per pose so the ball rests on the pad, then the ankle is pinned (pose.ik).
 * - Carriage centre follows the back of the back foot (block face) in EVERY frame, so the carriage moves with that foot.
 * - Spec angles vs reach: with the front foot on the platform (carriage height) the hands only reach a footbar at its
 *   high position with the trunk inclined ~45-55° (spec 15°); the front knee keeps its spec range and stays over the ankle
 *   (90° -> 70°, shin vertical). Measured hip flexion is the trunk-thigh angle (~125-135°), larger than the spec's 70-80°
 *   because of that trunk inclination. Carriage travel ~23 cm (spec 40): the back leg goes from a deep bend under the hip to straight; more travel would need a lower front hip than the spec's knee angles. */
{
const TOP = 0.38, BARY = TOP + 0.36 + 0.022, BX = 1.0;
const CTX = { anchorX: ['ankleR'], anchorAt: [0.78, 0.09] };
const HANDS = { ik: { handL: { at: [BX - 0.01, BARY + 0.03, -0.11] }, handR: { at: [BX - 0.01, BARY + 0.03, 0.11] } }, handFlat: true, handSurface: BARY, elbowPole: [-0.6, -0.4, 0.6] };
const BASE = { trunk: 45, abd: 2, ground: [['heelR', TOP]], flatR: true, flatL: false, lumbar: 0, thoracic: 0, neck: -4, sh: 70, el: 5, ...HANDS };
const P = (o) => Object.assign({}, BASE, o);
const RAW = {
  lunge: P({ trunk: 42, hipR: 132, kneeR: 90, kneeL: 100, ankleL: -12 }),
  push: P({ trunk: 55, hipR: 125, kneeR: 70, kneeL: 5, ankleL: 22 }),
};
function fit(poses, extra) {
  const { solve, expand } = FB;
  const go = (p) => {
    const at = (h) => solve(expand(Object.assign({}, p, { hipL: h, ik: { handL: p.ik.handL, handR: p.ik.handR } })), CTX);
    let lo = -80, hi = 60;   // the knee is bent: more extension (lower h) RAISES the back foot
    for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (at(m).J.ballL[1] > TOP) lo = m; else hi = m; }
    const h = (lo + hi) / 2, s = at(h);
    p.hipL = +h.toFixed(2);
    p.ik = Object.assign({}, p.ik, { ankleL: { at: s.J.ankleL.slice(), foot: s.F.footL.map((c) => c.slice()) } });
  };
  for (const k in poses) go(poses[k]);
  for (const [at, pose] of extra) { const m = Object.assign({}, poses[at], pose); go(m); pose.hipL = m.hipL; pose.ik = m.ik; }
  return poses;
}

window.EXERCISE = {
  id: 'standing_lunge',
  name: { tr: 'Standing Lunge / Eve\'s Lunge', en: 'Standing Lunge / Eve\'s Lunge', es: 'Zancada de pie / Eve\'s Lunge' },
  category: { tr: 'Reformer · Bacak ve kalça', en: 'Reformer · Legs & hips', es: 'Reformer · Piernas y cadera' },
  equipmentLabel: { tr: 'Reformer · 2 yay · platform', en: 'Reformer · 2 springs · platform', es: 'Reformer · 2 muelles · plataforma' },
  muscles: ['quads', 'glutes', 'hamstrings', 'core'],
  side: 'R',
  tempo: '2-0.5-2',
  view: { yaw: 90, pitch: 6, zoom: 1.05 },
  alt: { yaw: 25, pitch: 10, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Ön diz ikinci parmak hizasında', en: 'Front knee tracks over the 2nd toe', es: 'Rodilla delantera sobre el 2.º dedo' } },
  setupView: { yaw: 50, pitch: 16 },
  setupMarks: [{ type: 'aline', joints: ['kneeR', 'ankleR'] }],
  props: [['reformer', { springs: 2, platform: true, carriage: (sol) => Math.min(sol.J.heelL[0] + 0.335, sol.J.ballL[0] + 0.30) }]],
  ctx: CTX,
  contacts: ['heelR', 'ballR', 'ballL', 'handL', 'handR'],
  get poses() { return this._poses || (this._poses = fit(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'lunge',
  rep: [
    { to: 'push', dur: 2.0, phase: 0 },
    { to: 'push', dur: 0.5, phase: 1 },
    { to: 'lunge', dur: 2.0, phase: 2 },
  ],
  setup: { tr: 'Sağ ayak platformda, sol parmaklar kızakta bloğa dayalı. Eller footbar\'da, ön diz bileğin üstünde. Sonra taraf değiştir.',
    en: 'Right foot on the platform, left toes on the carriage against the block. Hands on the footbar, front knee over the ankle. Then switch.',
    es: 'Pie derecho en la plataforma, dedos izquierdos en el carro contra el tope. Manos en la barra, rodilla sobre el tobillo. Luego cambia.' },
  phases: [
    { name: { tr: 'Kızağı geri it', en: 'Push back', es: 'Empuja atrás' }, breath: 'out',
      text: { tr: 'Arka bacakla kızağı it, arka diz uzar. Ön diz bileğin üstünde kalır.', en: 'Push the carriage back with the back leg until it is long. Front knee stays over the ankle.', es: 'Empuja el carro con la pierna de atrás hasta estirarla. Rodilla delantera sobre el tobillo.' } },
    { name: { tr: 'Uzun dur', en: 'Hold long', es: 'Mantén' }, breath: 'hold', line: ['kneeR', 'ankleR'],
      text: { tr: 'Arka kalçanın önü açılır. Göğüs uzun, omuzlar kulaktan uzak.', en: 'The front of the back hip opens. Chest long, shoulders away from the ears.', es: 'Se abre la cadera de atrás. Pecho largo, hombros lejos de las orejas.' } },
    { name: { tr: 'Kızağı içeri al', en: 'Draw in', es: 'Trae el carro' }, breath: 'in',
      text: { tr: 'Arka dizi bükerek kızağı yavaşça geri getir.', en: 'Bend the back knee and draw the carriage in slowly.', es: 'Flexiona la rodilla de atrás y trae el carro despacio.' } },
  ],
  tempoText: { tr: '2 sn it · 0,5 sn dur · 2 sn içeri', en: '2 s push · 0.5 s hold · 2 s draw in', es: '2 s empuja · 0,5 s pausa · 2 s trae' },
  mistakes: [
    { title: { tr: 'Ön diz içe çöküyor', en: 'Front knee collapses in', es: 'La rodilla se va hacia dentro' },
      fix: { tr: 'Diz parmak hizasında', en: 'Knee tracks over the toes', es: 'Rodilla sobre los dedos' },
      fixText: { tr: 'Ön dizi ikinci parmağa doğru yönlendir', en: 'Aim the front knee at the 2nd toe', es: 'Dirige la rodilla al 2.º dedo' },
      at: 'push', pose: { hrotR: -14, abdR: -6, kneePoleR: [1, 0, -0.55] }, view: { yaw: 20, pitch: 10 }, line: ['kneeR', 'ankleR'], marks: ['kneeR'], parts: ['thighR', 'shinR'] },
    { title: { tr: 'Gövde çöküyor', en: 'Chest sinks', es: 'El pecho se hunde' },
      fix: { tr: 'Göğsü uzat', en: 'Lengthen the chest', es: 'Alarga el pecho' },
      fixText: { tr: 'Ellerle bara bas, omuzlar aşağıda', en: 'Press the bar away, shoulders down', es: 'Empuja la barra, hombros abajo' },
      at: 'push', pose: { thoracic: 12, lumbar: 4, neck: 14, shrug: 0.045 }, line: ['pelvis', 'waist', 'neck'], parts: ['chest', 'waist'] },
  ],
  cues: [{ tr: 'Göğüs uzun', en: 'Long chest', es: 'Pecho largo' },
    { tr: 'Ön diz bileğin üstünde', en: 'Front knee over the ankle', es: 'Rodilla sobre el tobillo' },
    { tr: 'İşi arka bacak yapar', en: 'The back leg does the work', es: 'Trabaja la pierna de atrás' }],
};
}
