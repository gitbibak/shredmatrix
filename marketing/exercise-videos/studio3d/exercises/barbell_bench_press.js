/* Barbell bench press. Body set-up copied from dumbbell_bench_press.js (shoulder + pelvis on the pad, feet planted).
 * The bar is the midpoint of the hands; hands use thorax-frame hold targets (the trunk does not move, so the bar path is
 * fixed): lockout over the shoulders -> touch at the lower sternum, a shallow J. Grip ~1.5x shoulder width.
 * With the bar touching the chest and the forearms vertical the elbow measures ~116° (spec 95°): the touch point and
 * vertical forearms define the technique, the elbows sit just below pad level. */
{
const GRIP = 0.37;   // hand distance from the midline
const H = (f, u, extra) => Object.assign({ holdL: [f, u, GRIP], holdR: [f, u, GRIP] }, extra);
const BODY = { trunk: -90, hip: -10, knee: 92, neck: 14, abd: 12, ground: [['shoulderR', 0.45], ['pelvis', 0.45]] };
window.EXERCISE = {
  id: 'barbell_bench_press',
  name: { tr: 'Bench Press', en: 'Barbell Bench Press', es: 'Press de banca con barra' },
  category: { tr: 'Göğüs · Kol', en: 'Chest · Arms', es: 'Pecho · Brazos' },
  equipmentLabel: { tr: 'Halter · Düz bench', en: 'Barbell · Flat bench', es: 'Barra · Banco plano' },
  muscles: ['chest', 'delts', 'triceps'],
  tempo: '2-0.5-1',
  view: { yaw: 90, pitch: 9 },
  alt: { yaw: 22, pitch: 36, zoom: 1.08, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' }, text: { tr: 'Dirsekler gövdeye 45-60° açıyla', en: 'Elbows 45-60° from the torso', es: 'Codos a 45-60° del torso' } },
  setupView: { yaw: 24, pitch: 34 },
  setupMarks: [{ type: 'aline', joints: ['handL', 'handR'] }],
  props: [['bench', { at: [-0.4, 0, 0], length: 1.2, height: 0.45 }], ['bench', { at: [-0.4, 0, 0], length: 1.2, height: 0.39 }], ['barbell', { grip: 'pronated' }]],
  ctx: { anchorX: ['pelvis'], anchorAt: [0, 0], plant: ['ankleL', 'ankleR'] },
  poses: {
    top: Object.assign({}, BODY, H(0.575, 0.07, { elbowPole: [-0.25, -0.6, 0.75] })),
    bottom: Object.assign({}, BODY, H(0.15, -0.07, { elbowPole: [-0.25, -0.6, 0.75] })),
  },
  rest: 'top',
  rep: [
    { to: 'bottom', dur: 2.0, phase: 0 },
    { to: 'bottom', dur: 0.5, phase: 1 },
    { to: 'top', dur: 1.0, phase: 2 },
  ],
  setup: { tr: 'Gözler barın altında, kürek kemikleri sıkışık. Ayaklar yerde, tutuş omzun ~1,5 katı.',
    en: 'Eyes under the bar, shoulder blades pinned. Feet flat, grip ~1.5x shoulder width.',
    es: 'Ojos bajo la barra, escápulas juntas. Pies en el suelo, agarre ~1,5 veces los hombros.' },
  phases: [
    { name: { tr: 'İniş', en: 'Lower', es: 'Baja' }, breath: 'in',
      text: { tr: 'Nefes al, karnı sık. Barı göğsün alt kısmına kontrollü indir.', en: 'Breathe in and brace. Lower the bar under control to the lower chest.', es: 'Inhala y aprieta. Baja la barra con control a la parte baja del pecho.' } },
    { name: { tr: 'Dokun', en: 'Touch', es: 'Toca' }, breath: 'hold', arc: ['shoulderR', 'elbowR', 'wristR'], line: ['elbowR', 'wristR'],
      text: { tr: 'Bar göğse hafifçe değer. Ön kollar dik, sekme yok.', en: 'The bar touches lightly. Forearms vertical, no bounce.', es: 'La barra toca suave. Antebrazos verticales, sin rebote.' } },
    { name: { tr: 'İtiş', en: 'Press', es: 'Empuja' }, breath: 'out',
      text: { tr: 'Ayaklarla yeri it, barı omuzların üstüne geri it.', en: 'Drive the feet into the floor; press the bar back over the shoulders.', es: 'Empuja el suelo con los pies; lleva la barra sobre los hombros.' } },
  ],
  tempoText: { tr: '2 sn in · 0,5 sn dur · 1 sn it', en: '2 s down · 0.5 s pause · 1 s up', es: '2 s abajo · 0,5 s pausa · 1 s arriba' },
  mistakes: [
    { title: { tr: 'Dirsekler 90° açılıyor', en: 'Elbows flare to 90°', es: 'Codos abiertos a 90°' },
      fix: { tr: 'Dirsekleri 45-60° topla', en: 'Tuck the elbows to 45-60°', es: 'Cierra los codos a 45-60°' },
      fixText: { tr: 'Bar göğsün altına iner, omuz korunur', en: 'Bar to the lower chest, shoulders protected', es: 'Barra al pecho bajo, hombros protegidos' },
      at: 'bottom', pose: H(0.135, 0.06, { elbowPole: [-0.25, -0.05, 1] }), view: { yaw: 22, pitch: 36, zoom: 1.08 }, marks: ['elbowL', 'elbowR'], parts: ['upperR', 'upperL'] },
    { title: { tr: 'Kalça benchten kalkıyor', en: 'Hips lift off the bench', es: 'La cadera se despega' },
      fix: { tr: 'Kalça bench üstünde', en: 'Glutes stay on the bench', es: 'Glúteos en el banco' },
      fixText: { tr: 'Ayaklarla it ama kalçayı kaldırma', en: 'Drive with the legs, keep the hips down', es: 'Empuja con las piernas sin levantar la cadera' },
      at: 'bottom', pose: { hip: 12, lumbar: -14, ground: [['shoulderR', 0.45], ['pelvis', 0.56]] }, marks: ['pelvis'], parts: ['pelvis', 'waist'] },
  ],
  cues: [{ tr: 'Kürek kemiklerini sık', en: 'Pin the shoulder blades', es: 'Escápulas juntas' }, { tr: 'Bar göğsün altına', en: 'Bar to the lower chest', es: 'Barra al pecho bajo' }, { tr: 'Ön kollar dik', en: 'Forearms vertical', es: 'Antebrazos verticales' }],
};
}
