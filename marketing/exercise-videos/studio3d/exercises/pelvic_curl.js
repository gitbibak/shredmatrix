/* Pelvic Curl / articulating bridge (Pilates mat, supine). glute_bridge base: every pose rests on the same two contacts
 * [shoulderR, heelR]; feet and hands are planted from the start pose, so the bridge only rotates the trunk about the
 * upper back. Pilates detail: an imprint key first (pelvis tilts back, lower back flattens: lumbar +6), then the peel up to
 * the knee-hip-shoulder line with ribs knitted (lumbar ~0, no arch), hold, and the roll down.
 * Tempo shortened to 1-2.5-1-3 s (spec 1.5-3-1.5-3.5) to stay under 60 s.
 * Shoulder contact heights and the rounded upper back follow glute_bridge.js (neck and ponytail clear of the mat). */
{
const MAT = 0.012;
const G = (sh = 0) => [['shoulderR', MAT + sh], ['heelR', MAT]];
const BASE = { trunk: -90, abd: 4, hrot: 2, sh: -12, el: 0, palm: 'down' };
const RAW = {
  start: { ...BASE, hip: 46, knee: 104, thoracic: 10, lumbar: -4, neck: -8, ground: G(0.033) },
  imprint: { ...BASE, hip: 42, knee: 104, thoracic: 10, lumbar: 6, neck: -6, ground: G(0.033) },
  top: { ...BASE, hip: -10, knee: 92, thoracic: 24, lumbar: 2, neck: 22, ground: G(0.045) },
};
window.EXERCISE = {
  id: 'pelvic_curl',
  name: { tr: 'Pelvik Kıvrılma (Pelvic Curl)', en: 'Pelvic Curl (Articulating Bridge)', es: 'Curl pélvico (puente articulado)' },
  category: { tr: 'Pilates · Kalça', en: 'Pilates · Glutes', es: 'Pilates · Glúteos' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['glutes', 'hamstrings', 'core'],
  tempo: '1-2.5-1-3',
  tempoReps: 1,
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 12, pitch: 24, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Dizler kalça genişliğinde kalır', en: 'Knees stay hip-width', es: 'Rodillas al ancho de cadera' } },
  setupView: { yaw: 40, pitch: 22 },
  setupMarks: [{ type: 'span', joints: ['ankleR', 'ankleL'], label: { tr: 'Kalça genişliği', en: 'Hip width', es: 'Ancho de cadera' } }],
  contacts: ['shoulderR', 'pelvis', 'heelR', 'ballR', 'handR'],
  props: [['mat', { at: [-0.45, 0.006, 0], length: 1.85 }]],
  ctx: { anchorX: ['ankleL', 'ankleR'], plant: ['ankleL', 'ankleR', 'handL', 'handR'] },
  poses: RAW,
  rest: 'start',
  rep: [
    { to: 'imprint', dur: 1.0, phase: 0 },
    { to: 'top', dur: 2.5, phase: 1 },
    { to: 'top', dur: 1.0, phase: 2 },
    { to: 'start', dur: 3.0, phase: 3 },
  ],
  setup: { tr: 'Sırtüstü yat, dizler bükülü, ayaklar kalça genişliğinde. Pelvis nötr, kollar yanda uzun.',
    en: 'Lie on your back, knees bent, feet hip-width. Neutral pelvis, arms long by your sides.',
    es: 'Boca arriba, rodillas flexionadas, pies al ancho de cadera. Pelvis neutra, brazos largos.' },
  phases: [
    { name: { tr: 'Nefes ver, beli bastır', en: 'Exhale, imprint', es: 'Exhala, imprime' }, breath: 'out', marks: [{ type: 'mark', joint: 'waist', color: '#00e676' }],
      text: { tr: 'Pelvisi hafifçe geri devir; bel minderde.', en: 'Tilt the pelvis back; the low back presses into the mat.', es: 'Bascula la pelvis; la lumbar contra la esterilla.' } },
    { name: { tr: 'Omur omur kalk', en: 'Peel up', es: 'Sube vértebra a vértebra' }, breath: 'out',
      text: { tr: 'Kuyruk sokumu, bel, sırt sırayla kalkar. Kalça ve arka bacak iter.', en: 'Tailbone, low back, mid back peel up in turn. Glutes and hamstrings lift.', es: 'Cóccix, lumbar y espalda suben en orden; glúteos e isquios empujan.' } },
    { name: { tr: 'Tepede kal', en: 'Hold', es: 'Mantén' }, breath: 'in', line: ['shoulderR', 'hipR', 'kneeR'],
      text: { tr: 'Diz, kalça, omuz tek çizgide. Kaburgalar içeride.', en: 'Knees, hips and shoulders in one line. Ribs knitted.', es: 'Rodillas, cadera y hombros en línea. Costillas adentro.' } },
    { name: { tr: 'Omur omur in', en: 'Roll down', es: 'Baja vértebra a vértebra' }, breath: 'out',
      text: { tr: 'Önce sırt, sonra bel, en son kuyruk sokumu iner.', en: 'Upper back first, then the low back, tailbone last.', es: 'Primero la espalda, luego la lumbar, el cóccix al final.' } },
  ],
  tempoText: { tr: 'Bastır · 2,5 sn kalk · kal · 3 sn in', en: 'Imprint · 2.5 s up · hold · 3 s down', es: 'Imprime · 2,5 s sube · mantén · 3 s baja' },
  mistakes: [
    { title: { tr: 'Bel tepede kavisleniyor', en: 'Low back arches at the top', es: 'La lumbar se arquea arriba' },
      fix: { tr: 'Çizgide dur', en: 'Stop at the line', es: 'Para en la línea' },
      fixText: { tr: 'Diz–kalça–omuz çizgisinden yükseğe itme', en: 'No higher than the knee–hip–shoulder line', es: 'No más alto que la línea rodilla–cadera–hombro' },
      at: 'top', pose: { hip: -24, lumbar: -20, knee: 88, neck: 30, ground: G(0.058) }, line: ['shoulderR', 'hipR', 'kneeR'], parts: ['waist', 'pelvis'] },
    { title: { tr: 'Dizler açılıyor', en: 'Knees splay out', es: 'Las rodillas se abren' },
      fix: { tr: 'Dizler kalça genişliğinde', en: 'Knees hip-width', es: 'Rodillas al ancho de cadera' },
      fixText: { tr: 'Ayaklara eşit bas, gerekirse dizlerin arasına top', en: 'Press evenly through the feet; a ball between the knees helps', es: 'Presiona igual con ambos pies; usa una pelota' },
      at: 'top', pose: { abd: 12, hrot: 10 }, view: { yaw: 12, pitch: 24 }, marks: ['kneeL', 'kneeR'], parts: ['thigh'] },
  ],
  cues: [{ tr: 'Omur omur kalk ve in', en: 'Peel and stack one vertebra at a time', es: 'Vértebra a vértebra' },
    { tr: 'Kalça ve arka bacak kaldırır', en: 'Glutes and hamstrings lift', es: 'Glúteos e isquios elevan' },
    { tr: 'Dizler kalça genişliğinde, kaburgalar içeride', en: 'Knees hip-width, ribs knitted', es: 'Rodillas al ancho de cadera, costillas adentro' }],
};
}
