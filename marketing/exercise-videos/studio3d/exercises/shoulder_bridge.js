/* Shoulder bridge (Pilates mat, supine; right leg kicks). Built on glute_bridge.js: ground contacts [shoulderR, heelL] in
 * every pose (the LEFT foot is the standing foot, so the right foot can leave the mat without changing the contact set);
 * left foot and both hands planted from the start pose; the right leg is FK (same hip/knee as the left in the two-feet poses,
 * so it rests next to the left foot). Same upper-back / ponytail notes as glute_bridge.js (thoracic 24 at the top, shoulder
 * contact 4.5 cm up). Top knee 105° (spec 90): with the hands planted from the start pose, a smaller knee angle
 * moves the shoulders out of the hands' reach; spec tempo 3-1.5-2-3 shortened to 2.5-1.5-1.5-2.5 to stay under 60 s. Leg: extend to the ceiling (hipR 55 from the trunk line, knee straight, foot pointed), lower until in line
 * with the other thigh (the kicks are named in the card; one lower per rep keeps the video under 60 s). */
{
const MAT = 0.012;
const AS = -27, AT = -18;   // right ankle angles that keep the (FK, never 'flat') right foot flat on the mat in start/top
const G = (sh = 0) => [['shoulderR', MAT + sh], ['heelL', MAT]];
const BASE = { trunk: -90, abd: 4, hrot: 2, sh: -12, el: 0, palm: 'down', flatR: false, ground: G() };
const TOP = Object.assign({}, BASE, { ankleR: AT, hip: -4, knee: 105, thoracic: 24, lumbar: -6, neck: 22, ground: G(0.045) });
window.EXERCISE = {
  id: 'shoulder_bridge',
  name: { tr: 'Omuz Köprüsü (Shoulder Bridge)', en: 'Shoulder Bridge', es: 'Puente de hombros' },
  category: { tr: 'Pilates · Kalça', en: 'Pilates · Glutes', es: 'Pilates · Glúteos' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['glutes', 'hamstrings', 'core'],
  tempo: '2.5-1.5-1.5-2.5',
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 12, pitch: 22, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Kalça masa gibi düz, düşmüyor', en: 'Hips level like a tabletop', es: 'Cadera nivelada como una mesa' } },
  setupView: { yaw: 40, pitch: 22 },
  setupMarks: [{ type: 'span', joints: ['ankleR', 'ankleL'], label: { tr: 'Kalça genişliği', en: 'Hip width', es: 'Ancho de cadera' } }],
  contacts: ['shoulderR', 'pelvis', 'heelL', 'heelR', 'handR'],
  side: 'R',
  props: [['mat', { at: [-0.45, 0.006, 0], length: 1.85 }]],
  ctx: { anchorX: ['ankleL'], anchorAt: [0, -0.1], plant: ['ankleL', 'handL', 'handR'] },
  poses: {
    start: Object.assign({}, BASE, { ankleR: AS, hip: 55, knee: 120, thoracic: 10, lumbar: -4, neck: -8, ground: G(0.033) }),
    top: TOP,
    extend: Object.assign({}, TOP, { hipR: 44, kneeR: 2, ankleR: -35, flatR: false }),
    low: Object.assign({}, TOP, { hipR: -2, kneeR: 2, ankleR: -35, flatR: false }),
  },
  rest: 'start',
  rep: [
    { to: 'top', dur: 2.5, phase: 0 },
    { to: 'extend', dur: 1.5, phase: 1 },
    { to: 'low', dur: 1.5, phase: 2 },
    { to: 'start', dur: 2.5, phase: 3 },
  ],
  tempoReps: 1,
  setup: { tr: 'Sırtüstü yat, dizler bükülü, ayaklar kalça genişliğinde. Kollar yanda, avuçlar yere bakar.',
    en: 'Lie on your back, knees bent, feet hip-width. Arms long by your sides, palms down.',
    es: 'Boca arriba, rodillas flexionadas, pies al ancho de cadera. Brazos largos, palmas abajo.' },
  phases: [
    { name: { tr: 'Köprüye kalk', en: 'Bridge up', es: 'Sube al puente' }, breath: 'out', slow: 1.1, line: ['shoulderR', 'hipR', 'kneeR'],
      text: { tr: 'Nefes ver, omurgayı omur omur kaldır: omuz, kalça ve diz tek çizgide.', en: 'Exhale and peel the spine up: shoulders, hips and knees in one line.', es: 'Exhala y despega la columna: hombros, cadera y rodillas en línea.' } },
    { name: { tr: 'Bacağı uzat', en: 'Extend the leg', es: 'Extiende la pierna' }, breath: 'in',
      text: { tr: 'Nefes al, sağ bacağı tavana uzat. Kalça seviyesi düşmez.', en: 'Inhale and extend the right leg to the ceiling. The pelvis stays level.', es: 'Inhala y extiende la pierna derecha al techo. Pelvis nivelada.' } },
    { name: { tr: 'İndir ve tekme', en: 'Lower and kick', es: 'Baja y patea' }, breath: 'out', slow: 1.1, arc: ['ankleR', 'hipR', 'kneeL'],
      text: { tr: 'Bacağı diğer uyluk hizasına indir, sonra yukarı tekmele. Kalça yüksekte.', en: 'Lower the leg in line with the other thigh, then kick up. Hips stay high.', es: 'Baja la pierna a la línea del otro muslo y patea arriba. Cadera alta.' } },
    { name: { tr: 'Bük ve in', en: 'Bend and roll down', es: 'Flexiona y baja' }, breath: 'out', slow: 1.1,
      text: { tr: 'Dizi bük, ayağı yere koy ve omur omur yere in. Sonra diğer bacak.', en: 'Bend the knee, place the foot and roll down. Then the other leg.', es: 'Flexiona, apoya el pie y baja vértebra a vértebra. Luego la otra.' } },
  ],
  tempoText: { tr: '2,5 sn kalk · 1,5 sn uzat · 1,5 sn indir · 2,5 sn in', en: '2.5 s up · 1.5 s extend · 1.5 s lower · 2.5 s down', es: '2,5 s sube · 1,5 s extiende · 1,5 s baja · 2,5 s abajo' },
  mistakes: [
    { title: { tr: 'Kalça kalkan bacak tarafına düşüyor', en: 'Hip drops on the lifted side', es: 'La cadera cae del lado elevado' },
      fix: { tr: 'Kalçayı yüksek ve düz tut', en: 'Keep the hips high and level', es: 'Cadera alta y nivelada' },
      fixText: { tr: 'Destek bacağın kalçasını sık', en: 'Squeeze the glute of the standing leg', es: 'Aprieta el glúteo de la pierna de apoyo' },
      at: 'low', pose: { roll: -8, twist: 8 }, view: { yaw: 12, pitch: 22 }, line: ['hipL', 'hipR'], marks: ['hipR'], parts: ['pelvis'] },
    { title: { tr: 'Bel aşırı kavisleniyor', en: 'Over-arching the low back', es: 'Lumbar arqueada' },
      fix: { tr: 'Kaburgaları indir', en: 'Ribs down', es: 'Costillas abajo' },
      fixText: { tr: 'Pelvisi hafif içe çevir, kalça kaldırsın', en: 'Tuck the pelvis slightly; the glutes do the lift', es: 'Pelvis un poco hacia dentro; suben los glúteos' },
      at: 'top', pose: { hip: -16, lumbar: -22, knee: 100, neck: 30, ground: G(0.058) }, line: ['shoulderR', 'hipR', 'kneeR'], parts: ['waist', 'pelvis'] },
  ],
  cues: [{ tr: 'Kalça masa gibi düz', en: 'Hips level like a tabletop', es: 'Cadera como una mesa' },
    { tr: 'Belden değil, kalçadan kalk', en: 'Glutes lift, not the low back', es: 'Suben los glúteos, no la lumbar' },
    { tr: 'Uzun bacaktan uzan', en: 'Reach through the long leg', es: 'Alarga la pierna' }],
};
}
