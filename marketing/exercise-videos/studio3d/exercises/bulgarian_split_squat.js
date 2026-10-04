/* Bulgarian split squat, right leg in front (near the camera), left foot laces-down on a 42 cm bench, dumbbells at the sides.
 * Front foot: ctx.plant from the start pose. Rear foot: a fixed IK target on the bench pad in every pose (ankle + foot frame
 * with the sole up and the toes pointing back), so it never moves. Pelvis anchored at x = z = 0 (straight down), body height
 * from the front heel. Spec rear knee 100° at the bottom cannot put the rear knee near the floor with the foot on a 42 cm
 * bench; the rear knee bends ~125° instead (knee ~9 cm off the floor). Front leg/trunk match the spec. */
{
const BENCH_H = 0.42;
const REAR = (() => {   // laces down on the pad: foot X (toes) back and slightly down, foot Y (sole -> ankle) pointing down
  const a = 26 * Math.PI / 180, X = [-Math.cos(a), -Math.sin(a), 0], Y = [Math.sin(a), -Math.cos(a), 0];
  return { at: [-0.48, BENCH_H + 0.05, -0.1], foot: { 0: X, 1: Y, 2: [0, 0, 1] } };
})();
const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };
const G = [['heelR', 0]];
const DB = { sh: 2, shAbd: 9, el: 6, palm: 'in', ik: { ankleL: REAR } };
window.EXERCISE = {
  id: 'bulgarian_split_squat',
  name: { tr: 'Bulgar Split Squat', en: 'Bulgarian Split Squat', es: 'Sentadilla búlgara' },
  category: { tr: 'Bacak · Kalça', en: 'Legs · Glutes', es: 'Piernas · Glúteos' },
  equipmentLabel: { tr: 'Bench · Dambıl', en: 'Bench · Dumbbells', es: 'Banco · Mancuernas' },
  muscles: ['quads', 'glutes', 'adductors'],
  tempo: '2-0-1.5',
  view: { yaw: 90, pitch: 5 },
  alt: { yaw: 35, pitch: 10, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Ön diz ayak ucu yönünde, kalça düz', en: 'Front knee over the toes, hips square', es: 'Rodilla sobre el pie, cadera recta' } },
  setupView: { yaw: 40, pitch: 12 },
  contacts: ['heelR', 'ballR', 'ankleL'],
  props: [['bench', { at: [-0.6, 0, -0.08], length: 0.6, height: BENCH_H }], ['dumbbell', { grip: 'neutral' }]],
  ctx: Object.assign({ plant: ['ankleR'] }, CTX),
  poses: {
    start: Object.assign({ trunk: 5, hipR: 25, kneeR: 6, hipL: -30, kneeL: 70, abd: 3, hrotR: 6, hrotL: 4, neck: 0, ground: G }, DB),
    bottom: Object.assign({ trunk: 15, hipR: 100, kneeR: 108, hipL: -20, kneeL: 125, abd: 3, hrotR: 8, hrotL: 4, neck: -8, ground: G }, DB),
  },
  rest: 'start',
  rep: [
    { to: 'bottom', dur: 2.0, phase: 0 },
    { to: 'start', dur: 1.5, phase: 1 },
  ],
  setup: { tr: 'Sol ayağın üstü benchte, sağ ayak bir adım önde. Dambıllar yanda. Sonra taraf değiştir.',
    en: 'Left foot laces-down on the bench, right foot a stride ahead. Switch sides after the set.',
    es: 'Empeine izquierdo sobre el banco, pie derecho delante. Luego cambia de lado.' },
  phases: [
    { name: { tr: 'Aşağı in', en: 'Lower', es: 'Baja' }, breath: 'in', arc: ['hipR', 'kneeR', 'ankleR'],
      text: { tr: 'Düz aşağı in; ön diz ayak ucu yönünde, gövde hafif önde.', en: 'Drop straight down; front knee over the toes, slight forward lean.', es: 'Baja recto; rodilla sobre el pie, torso algo inclinado.' } },
    { name: { tr: 'Ön ayakla kalk', en: 'Drive up', es: 'Sube' }, breath: 'out',
      text: { tr: 'Ön topuk ve orta ayakla it. Arka ayak sadece denge için.', en: 'Push through the front heel and mid-foot. The back foot only balances.', es: 'Empuja con el talón delantero. El pie trasero solo equilibra.' } },
  ],
  tempoText: { tr: '2 sn in · 1,5 sn kalk', en: '2 s down · 1.5 s up', es: '2 s abajo · 1,5 s arriba' },
  mistakes: [
    { title: { tr: 'Gövde çöküyor', en: 'Torso collapses', es: 'El torso se cae' },
      fix: { tr: 'Dik kal, ön bacak çalışsın', en: 'Stay tall, front leg works', es: 'Erguida, trabaja la pierna delantera' },
      fixText: { tr: 'Gövde ~15° önde; arka ayakla itme', en: 'Torso ~15° forward; don’t push off the back foot', es: 'Torso ~15° adelante; no empujes con el pie trasero' },
      at: 'bottom', pose: { trunk: 44, hipR: 118, kneeR: 92, hipL: 8, kneeL: 112, thoracic: 10, neck: -6 }, line: ['pelvis', 'neck'], parts: ['waist', 'chest'] },
    { title: { tr: 'Ön diz içe kaçıyor', en: 'Front knee caves in', es: 'Rodilla delantera hacia dentro' },
      fix: { tr: 'Dizi küçük parmağa doğru it', en: 'Knee toward the little toe', es: 'Rodilla hacia el dedo pequeño' },
      fixText: { tr: 'Diz ayak ucu yönünde kalır', en: 'Knee stays over the toes', es: 'Rodilla sobre el pie' },
      at: 'bottom', pose: { abdR: -8, hrotR: -12 }, view: { yaw: 22, pitch: 8 }, marks: ['kneeR'], parts: ['thighR', 'shinR'] },
  ],
  cues: [{ tr: 'Düz aşağı, öne değil', en: 'Straight down, not forward', es: 'Abajo, no adelante' },
    { tr: 'Ön diz ayak ucu yönünde', en: 'Front knee over the toes', es: 'Rodilla sobre el pie' },
    { tr: 'Ön ayakla it', en: 'Drive through the front foot', es: 'Empuja con el pie delantero' }],
};
}
