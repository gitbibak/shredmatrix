/* Glute bridge (supine on a mat). Both poses rest on the same two ground contacts [shoulderR, heelR] (no contact-set
 * blending); feet and hands are planted from the start pose, so lifting the hips only rotates the trunk about the
 * shoulders and the knees open from 120° to ~105°. Top: shoulder-hip-knee in one line (hip ~0°), shins near vertical.
 * Start: upper-back contact 3.3 cm up + thoracic 10 / lumbar -4 so the spine joints clear the qa floor check (its chest
 * clearance is the prone 11 cm); visually the back lies on the mat. Neck flexes as the hips rise so the head stays on the mat. The shoulder-joint contact rises 4.5 cm at the top: the
 * trunk pivots on the upper back (scapulae), which sits behind/above the shoulder joint; with the plain contact the rig's
 * neck joint went ~5 cm into the mat. The upper back is rounded onto the mat (thoracic 24) so the thorax tilts <18° and the
 * engine's ponytail clamp ('lying') stays active; with the anatomical ~28° tilt the ponytail hung through the mat. Cost:
 * the shoulder-hip-knee line bends ~9° at the top instead of 0°. */
{
const MAT = 0.012;
const G = (sh = 0) => [['shoulderR', MAT + sh], ['heelR', MAT]];
const BASE = { noAvoid: true, trunk: -90, abd: 4, hrot: 2, sh: -12, el: 0, palm: 'down', ground: G() };
window.EXERCISE = {
  id: 'glute_bridge',
  name: { tr: 'Glute Bridge', en: 'Glute Bridge', es: 'Puente de glúteos' },
  category: { tr: 'Kalça', en: 'Glutes', es: 'Glúteos' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['glutes', 'hamstrings', 'core'],
  tempo: '1.5-1-2',
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 12, pitch: 24, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Dizler kalça genişliğinde, ayakların üstünde', en: 'Knees hip-width, over the feet', es: 'Rodillas al ancho de cadera, sobre los pies' } },
  setupView: { yaw: 40, pitch: 22 },
  setupMarks: [{ type: 'span', joints: ['ankleR', 'ankleL'], label: { tr: 'Kalça genişliği', en: 'Hip width', es: 'Ancho de cadera' } }],
  contacts: ['shoulderR', 'pelvis', 'heelR', 'ballR', 'handR'],
  props: [['mat', { at: [-0.45, 0.006, 0], length: 1.85 }]],
  ctx: { anchorX: ['ankleL', 'ankleR'], plant: ['ankleL', 'ankleR', 'handL', 'handR'] },
  poses: {
    start: Object.assign({}, BASE, { hip: 55, knee: 120, thoracic: 10, lumbar: -4, neck: -8, ground: G(0.033) }),
    top: Object.assign({}, BASE, { hip: -4, knee: 105, thoracic: 24, lumbar: -6, neck: 22, ground: G(0.045) }),
  },
  rest: 'start',
  rep: [
    { to: 'top', dur: 1.5, phase: 0 },
    { to: 'top', dur: 1.0, phase: 1 },
    { to: 'start', dur: 2.0, phase: 2 },
  ],
  setup: { tr: 'Sırtüstü yat, dizler bükülü, ayaklar kalça genişliğinde. Kollar yanda, avuçlar yere bakar.',
    en: 'Lie on your back, knees bent, feet flat hip-width apart. Arms by your sides, palms down.',
    es: 'Boca arriba, rodillas flexionadas, pies al ancho de cadera. Brazos a los lados, palmas abajo.' },
  phases: [
    { name: { tr: 'Kalçayı kaldır', en: 'Lift', es: 'Eleva' }, breath: 'out',
      text: { tr: 'Topuklardan it, kalçanı sıkarak kalçayı kaldır.', en: 'Press through the heels and squeeze the glutes to lift the hips.', es: 'Empuja con los talones y aprieta glúteos para subir la cadera.' } },
    { name: { tr: 'Tepede sık', en: 'Squeeze', es: 'Aprieta' }, breath: 'hold', line: ['shoulderR', 'hipR', 'kneeR'],
      text: { tr: 'Diz, kalça ve omuz tek çizgide. Kaburgalar aşağıda, bel kavislenmez.', en: 'Knees, hips and shoulders in one line. Ribs down, no arch.', es: 'Rodillas, cadera y hombros en línea. Costillas abajo, sin arquear.' } },
    { name: { tr: 'Kontrollü indir', en: 'Lower slowly', es: 'Baja despacio' }, breath: 'in',
      text: { tr: 'Kalçayı iki saniyede yere indir, hafifçe dokun ve tekrarla.', en: 'Lower the hips over two seconds, tap the floor and go again.', es: 'Baja la cadera en dos segundos, toca el suelo y repite.' } },
  ],
  tempoText: { tr: '1,5 sn kaldır · 1 sn sık · 2 sn indir', en: '1.5 s up · 1 s squeeze · 2 s down', es: '1,5 s arriba · 1 s aprieta · 2 s abajo' },
  mistakes: [
    { title: { tr: 'Bel aşırı kavisleniyor', en: 'Arching the lower back', es: 'Arquear la zona lumbar' },
      fix: { tr: 'Kaburgaları indir, kalçayı sık', en: 'Ribs down, squeeze the glutes', es: 'Costillas abajo, aprieta glúteos' },
      fixText: { tr: 'Diz–kalça–omuz çizgisinde dur, daha yükseğe itme', en: 'Stop at the knee–hip–shoulder line; no higher', es: 'Para en la línea rodilla–cadera–hombro' },
      at: 'top', pose: { hip: -16, lumbar: -22, knee: 100, neck: 30, ground: G(0.058) }, line: ['shoulderR', 'hipR', 'kneeR'], parts: ['waist', 'pelvis'] },
    { title: { tr: 'Dizler içe kapanıyor', en: 'Knees cave in', es: 'Rodillas hacia dentro' },
      fix: { tr: 'Dizler ayakların üstünde', en: 'Knees over the feet', es: 'Rodillas sobre los pies' },
      fixText: { tr: 'Dizleri hafif dışa it, topuklardan bas', en: 'Press the knees slightly out, drive through the heels', es: 'Rodillas un poco hacia fuera, empuja con los talones' },
      at: 'top', pose: { abd: -3, hrot: -9 }, view: { yaw: 12, pitch: 24 }, marks: ['kneeL', 'kneeR'], parts: ['thigh'] },
  ],
  cues: [{ tr: 'Topuklardan it', en: 'Press through the heels', es: 'Empuja con los talones' },
    { tr: 'Tepede kalçayı sık', en: 'Squeeze at the top', es: 'Aprieta arriba' },
    { tr: 'Kaburgalar aşağıda, bel düz', en: 'Ribs down, no arch', es: 'Costillas abajo, sin arquear' }],
};
}
