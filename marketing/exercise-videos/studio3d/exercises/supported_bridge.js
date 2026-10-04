/* Supported Bridge (Setu Bandha Sarvangasana on a block). Supine, knees bent -> lift the hips, the block slides under the sacrum
 * -> rest the pelvis on the block -> hold -> lower back down.
 * - Built on glute_bridge.js: every pose rests on the same two ground contacts [shoulderR, heelR]; feet and hands are planted
 *   from the start pose. fitBridge() (lazy) bisects the hip angle so the sacrum rests on top of the block (pelvis centre
 *   = block top + 0.1 clearance).
 * - Block (custom prop _sacrumBlock): lies beside the right hip while the pelvis is low and slides under the sacrum once the
 *   pelvis is above block height (a function of the solved body, so it also slides out on the way down).
 *   For the "block under the lumbar spine" mistake the block shifts toward the head when the lumbar arch exceeds ~22°
 *   (props only see the solved skeleton, so the arch is the signal).
 * - Upper back rounded onto the mat (thoracic ~20) as in glute_bridge so the thorax tilt stays under the ponytail clamp limit. */
{
const { V } = FB;
const MAT = 0.012;
const BH = 0.13;                        // medium block height (block on its long side, long edge across the mat)
const G = (sh = 0) => [['shoulderR', MAT + sh], ['heelR', MAT]];
const BASE = { trunk: -90, abd: 4, hrot: 2, sh: -12, el: 0, palm: 'down', ground: G() };
let PEL0 = 0.1, PELB = 0.24;            // pelvis height at the start / resting on the block (set by the fit)
const D = 180 / Math.PI;
FB.PROPS._sacrumBlock = (sol) => {
  const P = sol.J.pelvis, W = sol.J.waist, N = sol.J.neck;
  const a = V.norm(V.sub(W, P)), b = V.norm(V.sub(N, W));
  const arch = Math.acos(Math.max(-1, Math.min(1, V.dot(a, b)))) * D;            // lumbar-thoracic bend
  const low = Math.max(P[1], W[1]);                                              // pelvis (or waist, when it sits higher)
  const f = FB.clamp((low - (PELB - 0.035)) / 0.03);                              // 0 = beside the hip, 1 = under the sacrum
  const s = f * f * (3 - 2 * f), toHead = FB.clamp((arch - 22) / 10);
  const y = MAT + BH / 2 - 0.04, under = [P[0] - 0.02 + (W[0] + 0.02 - P[0]) * toHead, y, 0], side = [P[0] + 0.02, y, 0.34];
  const c = V.lerp(side, under, s);
  return FB.PROPS.block(null, { at: c, size: [0.15, BH, 0.23] });
};

const RAW = {
  start: { ...BASE, hip: 55, knee: 120, thoracic: 10, lumbar: -4, neck: -8, ground: G(0.033) },
  lift: { ...BASE, hip: -4, knee: 105, thoracic: 22, lumbar: -6, neck: 20, ground: G(0.045) },
  block: { ...BASE, hip: 15, knee: 110, thoracic: 18, lumbar: -12, neck: 14, ground: G(0.04) },
};
const CTX = { anchorX: ['ankleL', 'ankleR'], plant: ['ankleL', 'ankleR', 'handL', 'handR'] };

function fitBridge(poses, extra) {
  const { solve, expand } = FB;
  const S = (p) => solve(expand(p), { anchorX: CTX.anchorX }).J;
  PEL0 = S(poses.start).pelvis[1];
  PELB = MAT + BH + 0.1;
  const p = poses.block; let lo = -10, hi = 50;          // more hip flexion -> pelvis lower
  for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (S({ ...p, hip: m }).pelvis[1] > PELB) lo = m; else hi = m; }
  p.hip = +((lo + hi) / 2).toFixed(2);
  // mistake 1: block under the lumbar spine -> the waist rests on the block, the sacrum hangs below it
  for (const m of extra) { lo = -10; hi = 60; for (let i = 0; i < 30; i++) { const h = (lo + hi) / 2; if (S({ ...p, ...m, hip: h }).waist[1] > PELB - 0.045) lo = h; else hi = h; } m.hip = +((lo + hi) / 2).toFixed(2); }
  return poses;
}

window.EXERCISE = {
  id: 'supported_bridge',
  name: { tr: 'Destekli Köprü', en: 'Supported Bridge', es: 'Puente con apoyo' },
  category: { tr: 'Yoga · Restoratif', en: 'Yoga · Restorative', es: 'Yoga · Restaurativo' },
  equipmentLabel: { tr: 'Mat, blok', en: 'Mat, block', es: 'Esterilla, bloque' },
  muscles: ['glutes', 'hamstrings', 'core'],
  tempo: '4-10-4',
  hold: true, holdDur: 2,
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 12, pitch: 24, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Ayaklar paralel, dizler ayak bileklerinin üstünde', en: 'Feet parallel, knees over the ankles', es: 'Pies paralelos, rodillas sobre los tobillos' } },
  setupView: { yaw: 40, pitch: 22 },
  contacts: ['shoulderR', 'pelvis', 'heelR', 'ballR', 'handR'],
  props: [['mat', { at: [-0.45, 0.006, 0], length: 1.85, width: 0.75 }], ['_sacrumBlock']],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fitBridge(RAW, this.mistakes.filter((m) => m.fitWaist).map((m) => m.pose))); },
  rest: 'start',
  rep: [
    { to: 'lift', dur: 2.0, phase: 0 },
    { to: 'block', dur: 2.0, phase: 1 },
    { to: 'block', dur: 1.0, phase: 2 },
    { to: 'start', dur: 3.0, phase: 3 },
  ],
  setup: { tr: 'Sırtüstü yat, dizler bükülü, ayaklar kalça genişliğinde ve paralel. Blok kalçanın yanında.',
    en: 'Lie on your back, knees bent, feet hip-width and parallel. Block beside the hip.',
    es: 'Boca arriba, rodillas flexionadas, pies paralelos al ancho de cadera. Bloque junto a la cadera.' },
  phases: [
    { name: { tr: 'Kalçayı kaldır', en: 'Lift the hips', es: 'Sube la cadera' }, breath: 'in',
      text: { tr: 'Ayaklara bas, kalçayı kaldır, bloğu sakrumun altına kaydır.', en: 'Press into the feet, lift the hips, slide the block under the sacrum.', es: 'Empuja con los pies, sube la cadera y pon el bloque bajo el sacro.' } },
    { name: { tr: 'Bloğa bırak', en: 'Rest on the block', es: 'Apóyate en el bloque' }, breath: 'out',
      text: { tr: 'Leğenin ağırlığını yavaşça bloğa bırak.', en: 'Slowly let the weight of the pelvis settle on the block.', es: 'Deja que el peso de la pelvis repose en el bloque.' } },
    { name: { tr: 'Dinlen', en: 'Rest', es: 'Descansa' }, breath: 'easy', line: ['shoulderR', 'hipR', 'kneeR'],
      text: { tr: 'Tamamen gevşe, karın yumuşak. Çene nötr.', en: 'Relax completely, soft belly. Chin neutral.', es: 'Relájate por completo, abdomen suave. Barbilla neutra.' } },
    { name: { tr: 'Yavaşça in', en: 'Lower slowly', es: 'Baja despacio' }, breath: 'out', slow: 1.0,
      text: { tr: 'Kalçayı kaldır, bloğu çek, omurgayı yavaşça yere indir.', en: 'Lift the hips, remove the block and roll the spine down.', es: 'Sube la cadera, quita el bloque y baja la columna despacio.' } },
  ],
  tempoText: { tr: '2 sn kaldır · bloğa bırak · 1-3 dk dinlen · in', en: '2 s lift · settle · rest 1-3 min · lower', es: '2 s sube · apoya · 1-3 min · baja' },
  mistakes: [
    { title: { tr: 'Blok belin altında', en: 'Block under the low back', es: 'Bloque bajo la lumbar' },
      text: { tr: 'Bel keskin kavis yapar ve sıkışır.', en: 'The low back bends sharply and pinches.', es: 'La lumbar se dobla y se comprime.' },
      fix: { tr: 'Bloğu sakruma indir', en: 'Slide the block down to the sacrum', es: 'Baja el bloque al sacro' },
      fixText: { tr: 'Blok kalçanın düz kemiğinde, belde değil', en: 'Block under the flat sacrum, not the low back', es: 'Bloque bajo el sacro plano, no la lumbar' },
      at: 'block', fitWaist: true, pose: { lumbar: -32, hip: 8, thoracic: 22, neck: 30 }, marks: ['waist'], parts: ['waist'] },
    { title: { tr: 'Dizler dışa açılıyor', en: 'Knees splay out', es: 'Rodillas se abren' },
      text: { tr: 'Dizler ayaklardan daha geniş.', en: 'The knees drift wider than the feet.', es: 'Las rodillas quedan más abiertas que los pies.' },
      fix: { tr: 'Ayakların içine bas', en: 'Press the inner feet down', es: 'Presiona el borde interno del pie' },
      fixText: { tr: 'Dizler ayakların üstünde; gerekirse uyluklara kemer', en: 'Knees over the feet; a strap around the thighs helps', es: 'Rodillas sobre los pies; una correa en los muslos ayuda' },
      at: 'block', pose: { abd: 16, hrot: 14 }, view: { yaw: 12, pitch: 24 }, marks: ['kneeL', 'kneeR'], parts: ['thigh'] },
  ],
  cues: [{ tr: 'Blok sakrumda, belde değil', en: 'Block under the sacrum, not the low back', es: 'Bloque en el sacro, no en la lumbar' },
    { tr: 'Ayaklar paralel, dizler bileklerin üstünde', en: 'Feet parallel, knees over ankles', es: 'Pies paralelos, rodillas sobre tobillos' },
    { tr: 'Nefes karnı yumuşatsın', en: 'Let the breath soften the belly', es: 'Que la respiración suavice el abdomen' }],
};
}
