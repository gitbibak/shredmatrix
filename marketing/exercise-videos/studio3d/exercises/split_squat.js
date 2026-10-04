/* Split squat, right leg in front (near the camera). Dumbbells hang at the sides.
 * Feet: the front (right) foot is planted flat (ctx.plant from the start pose). The rear (left) foot stands on its toes:
 * every pose has an ankleL IK target that pivots the rigid shoe about a fixed toe point on the floor by `rear` degrees
 * (heel up 50° at the top, 62° at the bottom as the rear shin comes down), so the toe never slides and the heel rises.
 * Body height: single ground contact on the front heel; anchor = pelvis (x/z fixed: the hips go straight down).
 * Spec start (front hip 0, rear hip -20, stride 1.0 m) is not self-consistent: with a 1 m stride the front thigh must
 * already be ~22° forward at the top. The bottom (front hip ~88, knee ~95, rear knee ~90 just above the floor, trunk 5)
 * is matched. */
{
const REAR_TOE = [-0.40, 0, -0.17];   // rear toe tip on the floor (pelvis is anchored at x = z = 0: straight down)
const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };
const G = [['heelR', 0]];
const DB = { sh: 2, shAbd: 9, el: 6, palm: 'in' };
const RAW = {
  start: Object.assign({ trunk: 1, hipR: 32, kneeR: 24, hipL: -28, kneeL: 18, abd: 3, hrotR: 6, hrotL: 4, neck: 0, rear: 50, ground: G }, DB),
  bottom: Object.assign({ trunk: 5, hipR: 90, kneeR: 102, hipL: -10, kneeL: 90, abd: 3, hrotR: 8, hrotL: 4, neck: -4, rear: 62, ground: G }, DB),
};
// rear foot on its toes: ankle target = fixed toe point - rotated foot offset (rigid shoe pivoting on the toe tip)
function rearFoot(poses, mistakes) {
  const { V, BODY: B } = FB;
  const P = REAR_TOE, side = [0, 0, 1];
  const tgt = (deg) => {
    const a = -deg * Math.PI / 180, fw = V.rot([1, 0, 0], side, a), up = V.rot([0, 1, 0], side, a);
    return { at: V.sub(P, V.add(V.mul(fw, B.toe), V.mul(up, -B.ankleH))), foot: { 0: fw, 1: up, 2: side } };
  };
  for (const k in poses) poses[k].ik = Object.assign({}, poses[k].ik, { ankleL: tgt(poses[k].rear) });
  for (const m of mistakes) if (m.pose.rear !== undefined) m.pose.ik = Object.assign({}, m.pose.ik, { ankleL: tgt(m.pose.rear) });
  return poses;
}

window.EXERCISE = {
  id: 'split_squat',
  name: { tr: 'Split Squat', en: 'Split Squat', es: 'Sentadilla dividida' },
  category: { tr: 'Bacak · Kalça', en: 'Legs · Glutes', es: 'Piernas · Glúteos' },
  equipmentLabel: { tr: 'Dambıl', en: 'Dumbbells', es: 'Mancuernas' },
  muscles: ['quads', 'glutes', 'adductors'],
  tempo: '2-0-1.5',
  view: { yaw: 90, pitch: 5 },
  alt: { yaw: 22, pitch: 8, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Ön diz ayak ucu yönünde, kalça düz', en: 'Front knee over the toes, hips level', es: 'Rodilla sobre el pie, cadera nivelada' } },
  setupView: { yaw: 40, pitch: 12 },
  setupMarks: [{ type: 'span', joints: ['toeL', 'heelR'], label: { tr: 'Uzun adım', en: 'Long stride', es: 'Paso largo' } }],
  contacts: ['heelR', 'ballR', 'toeL'],
  props: [['dumbbell', { grip: 'neutral' }]],
  ctx: Object.assign({ plant: ['ankleR'] }, CTX),
  get poses() { return this._poses || (this._poses = rearFoot(RAW, this.mistakes)); },
  rest: 'start',
  rep: [
    { to: 'bottom', dur: 2.0, phase: 0 },
    { to: 'start', dur: 1.5, phase: 1 },
  ],
  setup: { tr: 'Sağ ayak önde, sol ayak geride parmak ucunda. Ayaklar kalça genişliğinde. Sonra taraf değiştir.',
    en: 'Right foot forward, left foot back on its toes, hip-width apart. Switch sides after the set.',
    es: 'Pie derecho delante, izquierdo atrás de puntillas, al ancho de cadera. Luego cambia de lado.' },
  phases: [
    { name: { tr: 'Dik in', en: 'Straight down', es: 'Baja recta' }, breath: 'in', arc: ['hipR', 'kneeR', 'ankleR'], line: ['pelvis', 'neck'],
      text: { tr: 'Gövde dik, arka diz yere yaklaşana kadar düz aşağı in.', en: 'Torso tall, drop straight down until the back knee nearly touches.', es: 'Torso erguido, baja recto hasta casi tocar con la rodilla trasera.' } },
    { name: { tr: 'Ön ayakla it', en: 'Drive up', es: 'Sube' }, breath: 'out',
      text: { tr: 'Ön ayağın ortası ve topuğuyla it. Ayakların yerini değiştirme.', en: 'Push through the front mid-foot and heel. Keep the stance.', es: 'Empuja con el mediopié y talón delantero. Mantén la postura.' } },
  ],
  tempoText: { tr: '2 sn in · 1,5 sn kalk', en: '2 s down · 1.5 s up', es: '2 s abajo · 1,5 s arriba' },
  mistakes: [
    { title: { tr: 'Öne eğiliyor', en: 'Leaning forward', es: 'Inclinarse adelante' },
      fix: { tr: 'Göğüs dik, düz aşağı', en: 'Chest tall, straight down', es: 'Pecho arriba, baja recta' },
      fixText: { tr: 'Ağırlık ön ayağın ortasında, gövde dik', en: 'Weight on the front mid-foot, torso upright', es: 'Peso en el mediopié delantero, torso erguido' },
      at: 'bottom', pose: { trunk: 38, hipR: 108, kneeR: 84, hipL: 18, kneeL: 72, neck: -8, rear: 50 }, line: ['pelvis', 'neck'], parts: ['waist', 'chest'] },
    { title: { tr: 'Ön diz içe kaçıyor', en: 'Front knee caves in', es: 'Rodilla delantera hacia dentro' },
      fix: { tr: 'Diz ayak ucu yönünde', en: 'Knee over the toes', es: 'Rodilla sobre el pie' },
      fixText: { tr: 'Diz 2. ve 3. parmak hizasında kalır', en: 'Knee stays over the 2nd–3rd toe', es: 'Rodilla sobre el 2.º y 3.er dedo' },
      at: 'bottom', pose: { abdR: -8, hrotR: -12 }, view: { yaw: 22, pitch: 8 }, marks: ['kneeR'], parts: ['thighR', 'shinR'] },
  ],
  cues: [{ tr: 'Düz aşağı, düz yukarı', en: 'Straight down, straight up', es: 'Abajo y arriba en recto' },
    { tr: 'Gövde dik', en: 'Torso tall', es: 'Torso erguido' },
    { tr: 'Ön ayakla it', en: 'Drive through the front foot', es: 'Empuja con el pie delantero' }],
};
}
