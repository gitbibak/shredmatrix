/* Reformer Front Splits. Facing the footbar (+x). FRONT (right, near the camera) foot flat on the standing platform at the
 * foot end (fixed); BACK (left) foot on the carriage, ball of the foot on the pad and the raised heel against the shoulder
 * block; hands on the hips, trunk upright.
 * - Front foot: anchorX ankleR + flat heel on the platform top (0.38) -> it never moves.
 * - Back foot: per pose, the back-hip angle is solved so the ball of the foot rests on the pad (fit), then the ankle is pinned
 *   there with pose.ik (position + foot frame); between keys the pin slides only along the rail.
 * - Carriage centre = back of the shoe on the shoulder block face (min of heel + 0.335, ball + 0.30) in EVERY frame: the carriage rides with the back foot.
 * - Spec: "front foot on bar ... knees on carriage" (low lunge). With the front foot ON the footbar the spec angles need a
 *   back leg ~15 cm longer than the body; the platform version reproduces the defining angles (front hip 90 -> 60, front
 *   knee 90 -> ~10, trunk vertical, back knee hovering just above the pad at the start). Carriage travel comes out ~35 cm
 *   (spec 50 cm needs a deeper split than these end angles allow). Footbar set low so it stays clear of the front shin. */
{
const TOP = 0.38;
const CTX = { anchorX: ['ankleR'], anchorAt: [0.76, 0.09] };
const HANDS = { holdL: [-0.02, -0.25, 0.165], holdR: [-0.02, -0.25, 0.165], elbowPole: [-0.5, -0.2, 1], curl: 0.3, palm: 'in' };
const BASE = { trunk: 0, abd: 2, ground: [['heelR', TOP]], flatR: true, flatL: false, lumbar: 0, thoracic: 0, neck: 0, ankleL: -35, ...HANDS };
const P = (o) => Object.assign({}, BASE, o);
const RAW = {
  lunge: P({ hipR: 90, kneeR: 90, kneeL: 62, ankleL: -10 }),
  split: P({ hipR: 60, kneeR: 10, kneeL: 6, ankleL: 28 }),
};
function fit(poses, extra) {
  const { solve, expand } = FB;
  const go = (p) => {
    const at = (h) => solve(expand(Object.assign({}, p, { hipL: h, ik: undefined })), CTX);
    let lo = -80, hi = 10;   // the knee is bent: more extension (lower h) RAISES the back foot
    for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (at(m).J.ballL[1] > TOP) lo = m; else hi = m; }
    const h = (lo + hi) / 2, s = at(h);
    p.hipL = +h.toFixed(2);
    p.ik = { ankleL: { at: s.J.ankleL.slice(), foot: s.F.footL.map((c) => c.slice()) } };
  };
  for (const k in poses) go(poses[k]);
  for (const [at, pose] of extra) { const m = Object.assign({}, poses[at], pose); go(m); pose.hipL = m.hipL; pose.ik = m.ik; }
  return poses;
}

window.EXERCISE = {
  id: 'front_splits',
  name: { tr: 'Front Splits (Öne Açılma)', en: 'Front Splits', es: 'Front Splits (split frontal)' },
  category: { tr: 'Reformer · Kalça esnekliği', en: 'Reformer · Hip mobility', es: 'Reformer · Movilidad de cadera' },
  equipmentLabel: { tr: 'Reformer · 2 ağır yay · platform', en: 'Reformer · 2 heavy springs · platform', es: 'Reformer · 2 muelles fuertes · plataforma' },
  muscles: ['glutes', 'hamstrings', 'quads', 'core'],
  side: 'R',
  tempo: '2.5-0.5-2.5',
  view: { yaw: 90, pitch: 6, zoom: 1.05 },
  alt: { yaw: 20, pitch: 10, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Kalçalar footbar\'a dönük ve düz', en: 'Hips square to the footbar', es: 'Caderas cuadradas a la barra' } },
  setupView: { yaw: 50, pitch: 16 },
  props: [['reformer', { springs: 2, platform: true, footbarH: 0.12, carriage: (sol) => Math.min(sol.J.heelL[0] + 0.335, sol.J.ballL[0] + 0.30) }]],
  ctx: CTX,
  contacts: ['heelR', 'ballR', 'ballL'],
  get poses() { return this._poses || (this._poses = fit(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'lunge',
  rep: [
    { to: 'split', dur: 2.5, phase: 0 },
    { to: 'split', dur: 0.5, phase: 1 },
    { to: 'lunge', dur: 2.5, phase: 2 },
  ],
  setup: { tr: 'Sağ ayak platformda, sol ayak kızakta topuk bloğa yaslı. Alçak hamle, eller belde. Sonra taraf değiştir.',
    en: 'Right foot on the platform, left foot on the carriage, heel on the block. Low lunge, hands on hips. Then switch sides.',
    es: 'Pie derecho en la plataforma, izquierdo en el carro con el talón en el tope. Zancada baja, manos en la cadera. Luego cambia.' },
  phases: [
    { name: { tr: 'Kızağı aç', en: 'Open', es: 'Abre' }, breath: 'out',
      text: { tr: 'Arka ayakla bloğa bas, kızak açılır. Ön bacak uzar, gövde dik kalır.', en: 'Press the back foot into the block to open the carriage. Front leg lengthens, torso tall.', es: 'Presiona el pie de atrás en el tope y abre el carro. Pierna delantera larga, torso erguido.' } },
    { name: { tr: 'Açıklıkta dur', en: 'Pause open', es: 'Pausa abierta' }, breath: 'hold', arc: ['ankleR', 'hipR', 'ankleL'],
      text: { tr: 'Kalçalar düz, göğüs kalkık. Esnemeyi ön bacağın arkasında hisset.', en: 'Hips square, sternum lifted. Feel the stretch along the back of the front leg.', es: 'Caderas cuadradas, esternón alto. Siente la parte posterior de la pierna delantera.' } },
    { name: { tr: 'Kızağı kapat', en: 'Close', es: 'Cierra' }, breath: 'in',
      text: { tr: 'Göğsü kaldır, yaylara direnerek kızağı yavaşça kapat.', en: 'Lift the sternum and resist the springs to close the carriage slowly.', es: 'Eleva el esternón y resiste los muelles para cerrar despacio.' } },
  ],
  tempoText: { tr: '2,5 sn aç · 0,5 sn dur · 2,5 sn kapat', en: '2.5 s open · 0.5 s pause · 2.5 s close', es: '2,5 s abre · 0,5 s pausa · 2,5 s cierra' },
  mistakes: [
    { title: { tr: 'Pelvis yana dönüyor', en: 'Pelvis rotates', es: 'La pelvis rota' },
      fix: { tr: 'Kalçaları düz tut', en: 'Square the hips', es: 'Caderas cuadradas' },
      fixText: { tr: 'İki kalça kemiği footbar\'a baksın', en: 'Both hip bones face the footbar', es: 'Ambas crestas miran a la barra' },
      at: 'split', pose: { twist: -18, hrotL: 35, abdL: 10, roll: 4 }, view: { yaw: 25, pitch: 14 }, line: ['hipL', 'hipR'], marks: ['hipL'], parts: ['pelvis'] },
    { title: { tr: 'Gövde öne çöküyor', en: 'Torso collapses forward', es: 'El torso se hunde' },
      fix: { tr: 'Göğsü kaldır', en: 'Lift the sternum', es: 'Eleva el esternón' },
      fixText: { tr: 'Daha az aç; omuzlar kalçanın üstünde', en: 'Open less; shoulders over the hips', es: 'Abre menos; hombros sobre la cadera' },
      at: 'split', pose: { trunk: 22, hipR: 82, lumbar: 8, thoracic: 12, neck: 12 }, line: ['pelvis', 'waist', 'neck'], parts: ['waist', 'chest'] },
  ],
  cues: [{ tr: 'Göğüs kalkık', en: 'Lift the sternum', es: 'Esternón alto' },
    { tr: 'Kalçalar düz', en: 'Square hips', es: 'Caderas cuadradas' },
    { tr: 'İşi arka bacak yapar', en: 'The back leg does the work', es: 'Trabaja la pierna de atrás' }],
};
}
