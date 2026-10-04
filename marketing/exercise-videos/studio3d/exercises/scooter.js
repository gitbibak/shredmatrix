/* Reformer Scooter. Standing BESIDE the reformer facing the footbar (+x): standing foot flat on the floor outside the
 * frame (RIGHT foot, near side, so the camera sees both legs), LEFT (working) foot flat on the carriage with the heel against the shoulder block, both hands flat on
 * the footbar, trunk hinged ~45° with a flat back. The working leg pushes the carriage back (hip and knee extend) and
 * draws it back in under the hip.
 * - Standing foot: anchorX ankleR + flat heel on the floor -> it never moves; standing knee soft.
 * - Working foot: per pose the left-hip angle is solved so the flat foot rests on the pad, then the ankle is pinned
 *   (pose.ik); carriage centre = left heel x + 0.30 (shoulder block face) in EVERY frame, so the carriage rides the foot.
 * - Spec vs geometry: with the standing foot on the floor (classical set-up) the carriage pad is 38 cm higher, so the
 *   working knee cannot reach 0° (spec) without lifting the hips off the standing leg; it opens 90° -> ~25°, the thigh going
 *   back in line with the trunk. Standing knee ~30° (spec 15°) so the hips are low enough for the carriage foot. */
{
const TOP = 0.38, BARY = TOP + 0.36 + 0.022, BX = 1.0;
const CTX = { anchorX: ['ankleR'], anchorAt: [0.2, 0.47] };
const HANDS = { ik: { handL: { at: [BX - 0.01, BARY + 0.03, 0.05] }, handR: { at: [BX - 0.01, BARY + 0.03, 0.29] } }, handFlat: true, handSurface: BARY };
const BASE = { trunk: 45, hipR: 50, kneeR: 30, abdR: 7, abdL: -5, ground: [['heelR', 0]], flatL: true, flatR: true, lumbar: 0, thoracic: 0,
  neck: -4, sh: 70, el: 5, noAvoid: true, pole: { kneeL: [1, 0.2, 0] }, ...HANDS };
const P = (o) => Object.assign({}, BASE, o);
const RAW = {
  in: P({ kneeL: 92 }),
  back: P({ kneeL: 24, trunk: 47, hipR: 52 }),
};
function fit(poses, extra) {
  const { solve, expand } = FB;
  const go = (p) => {
    const at = (h) => solve(expand(Object.assign({}, p, { hipL: h, ik: { handL: p.ik.handL, handR: p.ik.handR } })), CTX);
    // between "foot behind the hip" solutions the heel height falls as the hip flexes
    let lo = -40, hi = 60;
    for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (at(m).J.heelL[1] > TOP) lo = m; else hi = m; }
    const h = (lo + hi) / 2, s = at(h);
    p.hipL = +h.toFixed(2);
    p.ik = { handL: p.ik.handL, handR: p.ik.handR, ankleL: { at: s.J.ankleL.slice(), foot: s.F.footL.map((c) => c.slice()) } };
  };
  for (const k in poses) go(poses[k]);
  for (const [at, pose] of extra) { const m = Object.assign({}, poses[at], pose); go(m); Object.assign(pose, { hipL: m.hipL, ik: m.ik }); }
  return poses;
}

window.EXERCISE = {
  id: 'scooter',
  name: { tr: 'Scooter', en: 'Scooter', es: 'Scooter' },
  category: { tr: 'Reformer · Kalça ve bacak', en: 'Reformer · Glutes & legs', es: 'Reformer · Glúteos y piernas' },
  equipmentLabel: { tr: 'Reformer · 1 kırmızı + 1 mavi yay', en: 'Reformer · 1 red + 1 blue spring', es: 'Reformer · 1 muelle rojo + 1 azul' },
  muscles: ['glutes', 'hamstrings', 'quads', 'core'],
  side: 'L',
  tempo: '2-0.5-2',
  view: { yaw: 90, pitch: 6, zoom: 1.05 },
  alt: { yaw: 20, pitch: 10, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Kalçalar düz, destek dizi ayak hizasında', en: 'Hips square, standing knee over the foot', es: 'Caderas cuadradas, rodilla sobre el pie' } },
  setupView: { yaw: 50, pitch: 16 },
  props: [['reformer', { springs: 2, carriage: (sol) => sol.J.heelL[0] + 0.30 }]],
  ctx: CTX,
  contacts: ['heelR', 'ballR', 'heelL', 'ballL', 'handL', 'handR'],
  get poses() { return this._poses || (this._poses = fit(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'in',
  rep: [
    { to: 'back', dur: 2.0, phase: 0 },
    { to: 'back', dur: 0.5, phase: 1 },
    { to: 'in', dur: 2.0, phase: 2 },
  ],
  setup: { tr: 'Reformer\'ın yanında dur: sağ ayak yerde, sol ayak kızakta bloğa yaslı. Eller footbar\'da, sırt düz. Sonra taraf değiştir.',
    en: 'Stand beside the reformer: right foot on the floor, left foot on the carriage by the block. Hands on the bar, flat back. Then switch.',
    es: 'De pie junto al reformer: pie derecho en el suelo, izquierdo en el carro junto al tope. Manos en la barra, espalda plana. Luego cambia.' },
  phases: [
    { name: { tr: 'Kızağı geri it', en: 'Push back', es: 'Empuja atrás' }, breath: 'out',
      text: { tr: 'Sol bacakla kızağı geri it; uyluk gövdeyle aynı çizgiye gelir.', en: 'Push the carriage back with the left leg until the thigh lines up with the trunk.', es: 'Empuja el carro con la pierna izquierda hasta alinear el muslo con el tronco.' } },
    { name: { tr: 'Kalçayı sık', en: 'Squeeze the glute', es: 'Aprieta el glúteo' }, breath: 'hold', line: ['shoulderL', 'hipL', 'kneeL'],
      text: { tr: 'Kalça arkası çalışır, bel düz kalır. Destek bacağı sabit.', en: 'The glute works, the lower back stays flat. Standing leg steady.', es: 'Trabaja el glúteo, la lumbar plana. Pierna de apoyo firme.' } },
    { name: { tr: 'Kızağı içeri al', en: 'Draw in', es: 'Trae el carro' }, breath: 'in',
      text: { tr: 'Dizi kalçanın altına getirerek kızağı yavaşça geri çek.', en: 'Bring the knee back under the hip and draw the carriage in slowly.', es: 'Lleva la rodilla bajo la cadera y trae el carro despacio.' } },
  ],
  tempoText: { tr: '2 sn it · 0,5 sn dur · 2 sn içeri', en: '2 s push · 0.5 s hold · 2 s draw in', es: '2 s empuja · 0,5 s pausa · 2 s trae' },
  mistakes: [
    { title: { tr: 'Kalçalar dönüyor', en: 'Hips twist', es: 'La cadera gira' },
      fix: { tr: 'Kalçaları düz tut', en: 'Keep the hips square', es: 'Caderas cuadradas' },
      fixText: { tr: 'İki kalça kemiği footbar\'a baksın', en: 'Both hip bones face the footbar', es: 'Ambas crestas miran a la barra' },
      at: 'back', pose: { roll: -6, hrotL: 22, twist: -4 }, view: { yaw: 155, pitch: 14 }, line: ['hipL', 'hipR'], marks: ['hipL'], parts: ['pelvis'] },
    { title: { tr: 'Bel çukurlaşıyor', en: 'Lower back arches', es: 'La lumbar se arquea' },
      fix: { tr: 'Karın içeride, bel düz', en: 'Abs in, flat back', es: 'Abdomen dentro, espalda plana' },
      fixText: { tr: 'Bacağı yalnızca bel düz kalana kadar it', en: 'Push only as far as the back stays flat', es: 'Empuja solo mientras la espalda siga plana' },
      at: 'back', pose: { lumbar: -14, thoracic: -4, neck: -12, trunk: 60, hipR: 65 }, line: ['pelvis', 'waist', 'neck'], parts: ['waist'] },
  ],
  cues: [{ tr: 'Kalçalar düz', en: 'Square hips', es: 'Caderas cuadradas' },
    { tr: 'Destek bacağı güçlü', en: 'Strong standing leg', es: 'Pierna de apoyo fuerte' },
    { tr: 'Sırt düz, boyun uzun', en: 'Flat back, long neck', es: 'Espalda plana, cuello largo' }],
};
}
