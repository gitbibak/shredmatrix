/* Conventional barbell deadlift (dead-stop reps from the floor). Hands on world IK targets (barbell_row.js), feet planted.
 * Bar centre y = plate radius 0.225 on the floor; the bar path is vertical at x = BX (over the front half of the mid-foot,
 * just clear of the shins). A 'knee' keyframe (bar just above the knees, shins vertical) makes the bar clear the knees on the
 * way up and down instead of cutting through them.
 * Rig limit: shoulder-to-grip is 0.56 m, so with a 0.225 m bar the shoulders must be at ~0.78 m. The spec setup
 * (trunk 55, hip 100, knee 60) leaves the shoulders at ~1.05 m (bar out of reach by ~25 cm). The setup keeps what defines
 * the technique: hips above the knees and below the shoulders, shoulders just in front of the bar, arms straight, flat back,
 * shins near the bar; this needs a flatter trunk (~66°) and more hip/knee flexion (~132/76) plus a slight scapular reach. */
{
const BX = 0.095;
const BAR = (x, y, z = 0.25) => ({ handL: { at: [x, y, -z] }, handR: { at: [x, y, z] } });
const EP = { elbowPole: [-1, -0.2, 0.35] };
window.EXERCISE = {
  id: 'conventional_deadlift',
  name: { tr: 'Deadlift', en: 'Conventional Deadlift', es: 'Peso muerto convencional' },
  category: { tr: 'Kalça · Arka bacak', en: 'Glutes · Hamstrings', es: 'Glúteos · Isquios' },
  equipmentLabel: { tr: 'Halter', en: 'Barbell', es: 'Barra' },
  muscles: ['glutes', 'hamstrings', 'lowerback', 'quads', 'forearms'],
  tempo: '2-0.5-2',
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 140, pitch: 12, title: { tr: 'Arkadan çapraz', en: 'Rear angle', es: 'Vista trasera' },
    text: { tr: 'Sırt düz, iki taraf eşit', en: 'Flat back, both sides even', es: 'Espalda recta, ambos lados iguales' } },
  setupView: { yaw: 32, pitch: 12 },
  setupMarks: [{ type: 'aline', joints: ['shoulderR', 'handR'] },
    { type: 'span', joints: ['ankleR', 'ankleL'], label: { tr: 'Kalça genişliği', en: 'Hip width', es: 'Ancho de cadera' } }],
  props: [['barbell', { grip: 'pronated' }]],
  ctx: { anchorX: ['ankleL', 'ankleR'], plant: ['ankleL', 'ankleR'] },
  poses: {
    floor: Object.assign({ trunk: 66, hip: 132, knee: 76, abd: 6, hrot: 8, neck: -22, protract: 0.06, shrug: -0.05, ik: BAR(BX, 0.225) }, EP),
    knee: Object.assign({ trunk: 55, hip: 80, knee: 25, abd: 4, hrot: 6, neck: -14, protract: 0.03, shrug: -0.02, ik: BAR(BX, 0.568) }, EP),
    top: Object.assign({ trunk: 0, hip: 0, knee: 0, abd: 3, hrot: 4, neck: 0, protract: -0.01, shrug: 0, ik: BAR(BX, 0.8) }, EP),
  },
  rest: 'floor',
  rep: [
    { to: 'knee', dur: 1.0, phase: 0 },
    { to: 'top', dur: 1.0, phase: 1 },
    { to: 'top', dur: 0.5, phase: 2 },
    { to: 'knee', dur: 1.0, phase: 3 },
    { to: 'floor', dur: 1.0, phase: 4 },
  ],
  setup: { tr: 'Bar orta ayağın üstünde, kaval kemiğine yakın. Kalça dizden yüksek, omuzlar barın biraz önünde.',
    en: 'Bar over mid-foot, close to the shins. Hips above the knees, shoulders just ahead of the bar.',
    es: 'Barra sobre el mediopié, cerca de las tibias. Cadera sobre rodillas, hombros algo delante.' },
  phases: [
    { name: { tr: 'Yerden çek', en: 'Break the floor', es: 'Despega' }, breath: 'hold', line: ['pelvis', 'neck'],
      text: { tr: 'Karnı sık, yeri it. Kalça ve omuz birlikte yükselir.', en: 'Brace and push the floor away. Hips and shoulders rise together.', es: 'Aprieta y empuja el suelo. Cadera y hombros suben juntos.' } },
    { name: { tr: 'Kalçayı öne sür', en: 'Hips through', es: 'Cadera al frente' }, breath: 'hold',
      text: { tr: 'Bar dizi geçince kalçayı öne sür.', en: 'Past the knees, drive the hips forward.', es: 'Pasadas las rodillas, cadera al frente.' } },
    { name: { tr: 'Kilitle', en: 'Lockout', es: 'Bloquea' }, breath: 'out', arc: ['neck', 'pelvis', 'kneeR'],
      text: { tr: 'Dik dur, kalçanı sık. Geriye yaslanma.', en: 'Stand tall and squeeze the glutes. Do not lean back.', es: 'Erguida, aprieta glúteos. No te eches atrás.' } },
    { name: { tr: 'Kalça geri', en: 'Hips back', es: 'Cadera atrás' }, breath: 'in', line: ['pelvis', 'neck'],
      text: { tr: 'Önce kalça geri; bar uyluktan kayar.', en: 'Hips back first; bar slides down the thighs.', es: 'Primero cadera atrás; la barra baja por los muslos.' } },
    { name: { tr: 'Yere bırak', en: 'Set it down', es: 'Apoya la barra' }, breath: 'hold',
      text: { tr: 'Dizleri bük, barı kontrollü yere koy.', en: 'Bend the knees and set the bar down.', es: 'Flexiona las rodillas y apoya la barra.' } },
  ],
  tempoText: { tr: '2 sn çek · 0,5 sn dur · 2 sn indir', en: '2 s pull · 0.5 s lockout · 2 s lower', es: '2 s tirón · 0,5 s arriba · 2 s bajada' },
  mistakes: [
    { title: { tr: 'Bel yuvarlanıyor', en: 'Rounded lower back', es: 'Espalda baja redondeada' },
      fix: { tr: 'Göğüs yukarı, kanatlar sıkı', en: 'Chest up, lats tight', es: 'Pecho arriba, dorsales firmes' },
      fixText: { tr: 'Daha hafif ağırlık; çekmeden önce karnı sık', en: 'Go lighter; brace before you pull', es: 'Menos peso; aprieta el core antes de tirar' },
      at: 'floor', pose: { trunk: 34, hip: 96, lumbar: 20, thoracic: 22, neck: -6 },
      line: ['pelvis', 'waist', 'neck'], goodLine: ['pelvis', 'neck'], parts: ['waist', 'chest'] },
    { title: { tr: 'Kalça önce kalkıyor', en: 'Hips shoot up first', es: 'La cadera sube primero' },
      fix: { tr: 'Kalça ve göğüs birlikte', en: 'Hips and chest together', es: 'Cadera y pecho a la vez' },
      fixText: { tr: 'Yeri bacaklarla it, gövde açısı korunur', en: 'Push with the legs; keep the torso angle', es: 'Empuja con las piernas; mantén el torso' },
      at: 'knee', pose: { trunk: 85, hip: 102, knee: 15, neck: -18, protract: 0.05, shrug: -0.04, ik: BAR(BX, 0.36) },
      line: ['pelvis', 'neck'], parts: ['pelvis', 'thigh'] },
  ],
  cues: [{ tr: 'Bar orta ayağın üstünde', en: 'Bar over mid-foot', es: 'Barra sobre el mediopié' },
    { tr: 'Yeri it, bar bacaklara yakın', en: 'Push the floor, bar close', es: 'Empuja el suelo, barra cerca' },
    { tr: 'Tepede kalçayı sık', en: 'Hips through at the top', es: 'Cadera al frente arriba' }],
};
}
