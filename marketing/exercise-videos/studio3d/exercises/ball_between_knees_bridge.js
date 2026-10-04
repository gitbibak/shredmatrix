/* Ball between knees bridge (Pilates mat, supine). Built on the approved glute_bridge.js (contacts [shoulderR, heelR], feet and
 * hands planted, same upper-back/ponytail workaround). Knees abducted a little more (abd 9) so a 22 cm soft ball fits between
 * the inner knees; the ball follows the knee midpoint (props.ball at = function). "Ball squeezes out" mistake: when the knee gap
 * opens past the ball, the ball slides down out of the knees (drop computed from the gap).
 * Top knee 105° / hip ~-4° (spec 90° / 0°: same trade-off as glute_bridge.js); incline of the shoulder-knee line ~25°. */
{
const MAT = 0.012;
const G = (sh = 0) => [['shoulderR', MAT + sh], ['heelR', MAT]];
const KG = (s) => Math.hypot(s.J.kneeL[0] - s.J.kneeR[0], s.J.kneeL[1] - s.J.kneeR[1], s.J.kneeL[2] - s.J.kneeR[2]);
const BALL = (s) => { const d = Math.max(0, Math.min(1, (KG(s) - 0.35) / 0.05)) * 0.16; return [(s.J.kneeL[0] + s.J.kneeR[0]) / 2 - 0.02, (s.J.kneeL[1] + s.J.kneeR[1]) / 2 - 0.01 - d, (s.J.kneeL[2] + s.J.kneeR[2]) / 2]; };
const BASE = { noAvoid: true, trunk: -90, abd: 9, hrot: 2, sh: -12, el: 0, palm: 'down', ground: G() };
window.EXERCISE = {
  id: 'ball_between_knees_bridge',
  name: { tr: 'Dizler Arasında Topla Köprü', en: 'Ball Between Knees Bridge', es: 'Puente con pelota entre rodillas' },
  category: { tr: 'Pilates · Kalça', en: 'Pilates · Glutes', es: 'Pilates · Glúteos' },
  equipmentLabel: { tr: 'Mat · Küçük top', en: 'Mat · Small ball', es: 'Esterilla · Pelota' },
  muscles: ['glutes', 'adductors', 'hamstrings'],
  tempo: '3-2-3.5',
  view: { yaw: 22, pitch: 20 },
  alt: { yaw: 90, pitch: 6, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
    text: { tr: 'Diz, kalça ve omuz tek çizgide', en: 'Knees, hips and shoulders in one line', es: 'Rodillas, cadera y hombros en línea' } },
  setupView: { yaw: 40, pitch: 22 },
  setupMarks: [{ type: 'span', joints: ['ankleR', 'ankleL'], label: { tr: 'Kalça genişliği', en: 'Hip width', es: 'Ancho de cadera' } }],
  contacts: ['shoulderR', 'pelvis', 'heelR', 'ballR', 'handR'],
  props: [['mat', { at: [-0.45, 0.006, 0], length: 1.85 }], ['ball', { at: BALL, r: 0.11 }]],
  ctx: { anchorX: ['ankleL', 'ankleR'], plant: ['ankleL', 'ankleR', 'handL', 'handR'] },
  poses: {
    start: Object.assign({}, BASE, { hip: 55, knee: 120, thoracic: 10, lumbar: -4, neck: -8, ground: G(0.033) }),
    top: Object.assign({}, BASE, { hip: -4, knee: 105, thoracic: 24, lumbar: -6, neck: 22, ground: G(0.045) }),
  },
  rest: 'start',
  tempoReps: 1,
  rep: [
    { to: 'top', dur: 3.0, phase: 0 },
    { to: 'top', dur: 2.0, phase: 1 },
    { to: 'start', dur: 3.5, phase: 2 },
  ],
  setup: { tr: 'Sırtüstü yat, dizler bükülü, ayaklar kalça genişliğinde. Küçük topu dizlerin arasına al.',
    en: 'Lie on your back, knees bent, feet hip-width. Place a small ball between the knees.',
    es: 'Boca arriba, rodillas flexionadas, pies al ancho de cadera. Pelota pequeña entre las rodillas.' },
  phases: [
    { name: { tr: 'Sık ve kalk', en: 'Squeeze and peel up', es: 'Aprieta y sube' }, breath: 'out', slow: 1.1,
      text: { tr: 'Nefes ver, topu hafifçe sık, omurgayı omur omur kaldır.', en: 'Exhale, squeeze the ball lightly and peel the spine up.', es: 'Exhala, aprieta suave la pelota y despega la columna.' } },
    { name: { tr: 'Tepede sık', en: 'Pulse at the top', es: 'Pulsa arriba' }, breath: 'easy', line: ['shoulderR', 'hipR', 'kneeR'],
      text: { tr: 'Kalça yüksek, topu küçük sıkışlarla sık. Diz, kalça, omuz tek çizgide.', en: 'Hips high, small squeezes of the ball. Knees, hips, shoulders in one line.', es: 'Cadera alta, pequeños apretones. Rodillas, cadera y hombros en línea.' } },
    { name: { tr: 'Omur omur in', en: 'Roll down', es: 'Baja vértebra a vértebra' }, breath: 'out', slow: 1.1,
      text: { tr: 'Nefes ver, topu bırakmadan omurgayı yavaşça mata indir.', en: 'Exhale and roll the spine down, still squeezing the ball.', es: 'Exhala y baja la columna sin soltar la pelota.' } },
  ],
  tempoText: { tr: '3 sn kalk · 2 sn sık · 3,5 sn in', en: '3 s up · 2 s pulse · 3.5 s down', es: '3 s sube · 2 s pulsa · 3,5 s baja' },
  mistakes: [
    { title: { tr: 'Top dizlerden kayıyor', en: 'Ball slips out', es: 'La pelota se escapa' },
      fix: { tr: 'Daha hafif ama sürekli sık', en: 'Squeeze lighter but steadily', es: 'Aprieta suave y constante' },
      fixText: { tr: 'Dizler topa değsin, yaklaşık %30 güçle sık', en: 'Knees stay on the ball, about 30% effort', es: 'Rodillas en la pelota, ~30% de fuerza' },
      at: 'top', pose: { abd: 17, hrot: 8 }, marks: ['kneeL', 'kneeR'], parts: ['thigh'] },
    { title: { tr: 'Dizler içe kapanıyor', en: 'Knees roll in', es: 'Rodillas hacia dentro' },
      fix: { tr: 'Ayak dış kenarından bas', en: 'Press through the outer feet', es: 'Empuja con el borde externo del pie' },
      fixText: { tr: 'Dizler kalça genişliğinde, ayakların üstünde', en: 'Knees hip-width, over the feet', es: 'Rodillas al ancho de cadera, sobre los pies' },
      at: 'top', pose: { abd: 8, hrot: -7 }, marks: ['kneeL', 'kneeR'], parts: ['thigh'] },
  ],
  cues: [{ tr: 'Topu sık, kalçayı kaldır', en: 'Squeeze the ball, lift the hips', es: 'Aprieta la pelota, sube la cadera' },
    { tr: 'Dizler kalça genişliğinde', en: 'Knees hip-width', es: 'Rodillas al ancho de cadera' },
    { tr: 'Omur omur hareket et', en: 'Move one vertebra at a time', es: 'Vértebra a vértebra' }],
};
}
