/* Romanian deadlift (barbell; hands on world IK targets like barbell_row.js, feet planted).
 * Bar path: start (x 0.17, y 0.80) against the upper thighs -> bottom (x 0.085, y 0.495) just below the knees, close to the shins.
 * Spec bottom (trunk 70, hip 80, knee 15, bar at mid-shin, arms plumb) is not reachable on this rig: with knees at 15-20°
 * the hips sit only ~15 cm behind the ankles, so hanging arms put the bar ~25 cm in front of the shins, and the arms
 * (0.56 m) end ~4 cm above the knee joint when the bar is kept on the legs. We keep the defining features: hips pushed
 * back, soft fixed knees (~20°), trunk ~74°, bar on the legs (arms angled slightly back by the lats); depth = just below
 * the knees. Manifest lists dumbbells; the spec's primary version is the barbell, which shows the bar path best. */
{
const BAR = (x, y, z = 0.22) => ({ handL: { at: [x, y, -z] }, handR: { at: [x, y, z] } });
const EP = { elbowPole: [-1, -0.2, 0.35] };
window.EXERCISE = {
  id: 'romanian_deadlift',
  name: { tr: 'Romanian Deadlift', en: 'Romanian Deadlift', es: 'Peso muerto rumano' },
  category: { tr: 'Arka bacak · Kalça', en: 'Hamstrings · Glutes', es: 'Isquios · Glúteos' },
  equipmentLabel: { tr: 'Halter', en: 'Barbell', es: 'Barra' },
  muscles: ['hamstrings', 'glutes', 'lowerback', 'forearms'],
  tempo: '2.5-0.3-1.5',
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 140, pitch: 12, title: { tr: 'Arkadan çapraz', en: 'Rear angle', es: 'Vista trasera' },
    text: { tr: 'Sırt düz, bar bacaklara yakın', en: 'Flat back, bar close to the legs', es: 'Espalda recta, barra pegada a las piernas' } },
  setupView: { yaw: 32, pitch: 12 },
  setupMarks: [{ type: 'span', joints: ['ankleR', 'ankleL'], label: { tr: 'Kalça genişliği', en: 'Hip width', es: 'Ancho de cadera' } }],
  props: [['barbell', { grip: 'pronated' }]],
  ctx: { anchorX: ['ankleL', 'ankleR'], plant: ['ankleL', 'ankleR'] },
  poses: {
    start: Object.assign({ trunk: 0, hip: 0, knee: 10, abd: 6, hrot: 6, neck: 0, protract: -0.01, ik: BAR(0.17, 0.8) }, EP),
    bottom: Object.assign({ trunk: 74, hip: 96, knee: 22, abd: 6, hrot: 6, neck: -12, protract: 0.0, ik: BAR(0.085, 0.495) }, EP),
  },
  rest: 'start',
  rep: [
    { to: 'bottom', dur: 2.5, phase: 0 },
    { to: 'bottom', dur: 0.3, phase: 1 },
    { to: 'start', dur: 1.5, phase: 2 },
  ],
  setup: { tr: 'Ayaklar kalça genişliğinde, dizler hafif bükülü. Bar uylukların önünde, avuçlar sana dönük.',
    en: 'Feet hip-width, soft knees. Bar against the front of your thighs, overhand grip.',
    es: 'Pies al ancho de cadera, rodillas suaves. Barra pegada a los muslos, agarre prono.' },
  phases: [
    { name: { tr: 'Kalçayı geri it', en: 'Hips back', es: 'Cadera atrás' }, breath: 'in', line: ['pelvis', 'neck'],
      text: { tr: 'Kalçayı geriye it, dizler sabit. Bar bacaklara sürtünerek iner.', en: 'Push the hips back, knees fixed. The bar slides down the legs.', es: 'Lleva la cadera atrás, rodillas fijas. La barra baja rozando las piernas.' } },
    { name: { tr: 'Dipte dur', en: 'Pause', es: 'Pausa' }, breath: 'hold', arc: ['neck', 'pelvis', 'kneeR'], line: ['pelvis', 'neck'],
      text: { tr: 'Arka bacakta gerilme. Sırt düz, bar dizin hemen altında.', en: 'Feel the hamstring stretch. Flat back, bar just below the knees.', es: 'Siente el estiramiento. Espalda recta, barra bajo las rodillas.' } },
    { name: { tr: 'Kalçayı öne sür', en: 'Drive up', es: 'Sube' }, breath: 'out',
      text: { tr: 'Kalçayı öne sür, kalçanı sık ve dikleş. Bel geriye bükülmez.', en: 'Drive the hips forward, squeeze the glutes and stand tall. No leaning back.', es: 'Cadera al frente, aprieta glúteos y sube. Sin arquear atrás.' } },
  ],
  tempoText: { tr: '2,5 sn in · kısa dur · 1,5 sn kalk', en: '2.5 s down · brief pause · 1.5 s up', es: '2,5 s abajo · pausa · 1,5 s arriba' },
  mistakes: [
    { title: { tr: 'Squat yapmak', en: 'Squatting it', es: 'Convertirlo en sentadilla' },
      fix: { tr: 'Kalça geri, dizler sabit', en: 'Hips back, knees fixed', es: 'Cadera atrás, rodillas fijas' },
      fixText: { tr: 'Dizler hafif bükülü kalır, gövde öne eğilir', en: 'Knees stay softly bent, the torso tips forward', es: 'Rodillas apenas flexionadas, el torso se inclina' },
      at: 'bottom', pose: { trunk: 42, hip: 92, knee: 72, neck: -4, ik: BAR(0.24, 0.52) }, marks: ['kneeR'], parts: ['thigh', 'shin'] },
    { title: { tr: 'Bel yuvarlanıyor', en: 'Rounded back', es: 'Espalda redondeada' },
      fix: { tr: 'Göğsü aç, menzili kısalt', en: 'Chest proud, shorten the range', es: 'Pecho abierto, menos recorrido' },
      fixText: { tr: 'Gerilmeyi hissedince dur, sırt düz kalsın', en: 'Stop at the stretch while the back is flat', es: 'Para al sentir el estiramiento, espalda recta' },
      at: 'bottom', pose: { trunk: 52, hip: 74, lumbar: 18, thoracic: 22, neck: -2, protract: 0.04, ik: BAR(0.26, 0.33) },
      line: ['pelvis', 'waist', 'neck'], goodLine: ['pelvis', 'neck'], parts: ['waist', 'chest'] },
  ],
  cues: [{ tr: 'Kalça geri, dizler yumuşak', en: 'Hips back, soft knees', es: 'Cadera atrás, rodillas suaves' },
    { tr: 'Bar bacaklara yapışık', en: 'Bar glued to the legs', es: 'Barra pegada a las piernas' },
    { tr: 'Tepede kalçayı sık', en: 'Squeeze the glutes at the top', es: 'Aprieta glúteos arriba' }],
};
}
