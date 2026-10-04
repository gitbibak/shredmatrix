/* Assisted single-leg squat on the right leg (planted + anchored, ground = right heel), holding suspension-strap handles
 * (spec support option) anchored high in front, so the hands move with the body at a constant arm angle (shoulder ~70,
 * elbow ~30) instead of sliding on a pole. Free left leg is FK, reaching forward.
 * Spec free hip 50° (to the trunk) at the bottom would put the free foot through the floor with the hips at ~0.55 m; the
 * free leg reaches forward to ~108° (near level) instead. Main view = front three-quarter per spec (knee tracking + pelvis level). */
{
const ANCHOR = [1.05, 2.25, 0];
const ARMS = { sh: 70, el: 30, shAbd: 10, palm: 'in', curl: 1 };
window.EXERCISE = {
  id: 'assisted_single_leg_squat',
  name: { tr: 'Destekli Tek Bacak Squat', en: 'Assisted Single-Leg Squat', es: 'Sentadilla a una pierna asistida' },
  category: { tr: 'Bacak · Kalça', en: 'Legs · Glutes', es: 'Piernas · Glúteos' },
  equipmentLabel: { tr: 'Askı kayışı', en: 'Suspension straps', es: 'Correas de suspensión' },
  muscles: ['quads', 'glutes', 'adductors', 'core'],
  tempo: '3-0-2',
  view: { yaw: 35, pitch: 8 },
  alt: { yaw: 90, pitch: 6, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
    text: { tr: 'Kalça geri, topuk yerde', en: 'Hips back, heel down', es: 'Cadera atrás, talón abajo' } },
  contacts: ['heelR', 'ballR'],
  props: [['strap', { through: [ANCHOR, 'handL'] }], ['strap', { through: [ANCHOR, 'handR'] }]],
  ctx: { anchorX: ['ankleR'], anchorAt: [0, 0.1], plant: ['ankleR'] },
  poses: {
    start: Object.assign({ trunk: 0, hipR: 2, kneeR: 2, hipL: 30, kneeL: 5, ankleL: -15, flatL: false, abd: 3, hrotR: 8, neck: 0, ground: [['heelR', 0]] }, ARMS),
    bottom: Object.assign({ trunk: 30, hipR: 110, kneeR: 105, hipL: 108, kneeL: 6, ankleL: -15, flatL: false, abd: 3, hrotR: 10, neck: -14, ground: [['heelR', 0]] }, ARMS),
  },
  rest: 'start',
  rep: [
    { to: 'bottom', dur: 3.0, phase: 0 },
    { to: 'start', dur: 2.0, phase: 1 },
  ],
  setup: { tr: 'Kayışları tut, sağ bacak üstünde dur. Sol ayak önde, yerden kalkık. Sonra taraf değiştir.',
    en: 'Hold the straps and stand on the right leg, left foot forward in the air. Switch sides after.',
    es: 'Sujeta las asas y apóyate en la pierna derecha, pie izquierdo al frente. Luego cambia de lado.' },
  phases: [
    { name: { tr: 'Aşağı in', en: 'Lower', es: 'Baja' }, breath: 'in', slow: 1.0, arc: ['hipR', 'kneeR', 'ankleR'],
      text: { tr: 'Kalça geri ve aşağı; diz ayak ucu yönünde, sol bacak öne uzanır.', en: 'Hips back and down; knee over the toes, left leg reaches forward.', es: 'Cadera atrás y abajo; rodilla sobre el pie, pierna izquierda al frente.' } },
    { name: { tr: 'Bacakla kalk', en: 'Stand up', es: 'Sube' }, breath: 'out',
      text: { tr: 'Tüm ayakla it. Kollar sadece denge için, çekme.', en: 'Push through the whole foot. Arms only balance; don’t pull.', es: 'Empuja con todo el pie. Brazos solo para equilibrio.' } },
  ],
  tempoText: { tr: '3 sn in · 2 sn kalk', en: '3 s down · 2 s up', es: '3 s abajo · 2 s arriba' },
  mistakes: [
    { title: { tr: 'Diz içe çöküyor', en: 'Knee caves in', es: 'La rodilla cae hacia dentro' },
      fix: { tr: 'Dizi dışa, kalçayı düz tut', en: 'Knee out, pelvis level', es: 'Rodilla fuera, pelvis nivelada' },
      fixText: { tr: 'Diz 2. parmak hizasında, kalça düşmez', en: 'Knee over the 2nd toe, hip stays level', es: 'Rodilla sobre el 2.º dedo, cadera nivelada' },
      at: 'bottom', pose: { abdR: -9, hrotR: -12, roll: -6 }, view: { yaw: 20, pitch: 8 }, marks: ['kneeR'], parts: ['thighR', 'shinR', 'pelvis'] },
    { title: { tr: 'Kollarla çekmek', en: 'Pulling with the arms', es: 'Tirar con los brazos' },
      fix: { tr: 'Kayışı hafif tut', en: 'Hold the straps lightly', es: 'Sujeta las correas suave' },
      fixText: { tr: 'İşi bacak yapar; gerekirse daha az in', en: 'The leg does the work; go less deep if needed', es: 'Trabaja la pierna; baja menos si hace falta' },
      at: 'bottom', pose: { trunk: 4, hipR: 88, kneeR: 112, hipL: 80, sh: 92, el: 0, shrug: 0.03, neck: 0 }, view: { yaw: 90, pitch: 6 }, marks: ['elbowR'], parts: ['upper', 'fore'] },
  ],
  cues: [{ tr: 'Kalça geri ve aşağı', en: 'Hips back and down', es: 'Cadera atrás y abajo' },
    { tr: 'Diz ayak ucu yönünde', en: 'Knee over the toes', es: 'Rodilla sobre el pie' },
    { tr: 'Kollar sadece denge', en: 'Arms only balance', es: 'Brazos solo equilibrio' }],
};
}
