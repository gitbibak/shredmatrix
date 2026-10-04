/* Side bend (Pilates mat, right side down). Same solver setup as side_plank.js: trunk 90 rolled -90 onto the right side so the
 * frontal plane is the sagittal plane of the two-contact ground solver; contacts [handR (flat, straight arm), ankleR] in every
 * pose. Seated start = strong lateral flexion (`side`, + toward the character's LEFT) + leg adduction so the right hip sits on
 * the mat; lift = side 0 (straight diagonal line); arc over = side negative (rainbow, hips highest) with the top arm overhead.
 * Top foot slightly in front of the bottom foot. */
{
const G = [['handR', 0.006], ['ankleR', -0.018]];
const BASE = { trunk: 90, roll: -90, elR: 0, shRotR: 0, curlR: 0.1, elL: 0, palmL: 'in', curlL: 0.1,
  neck: 0, flat: false, ankle: 0, hipL: 8, hipR: -4, ground: G };
const P = (o) => Object.assign({}, BASE, o);
const CTX = { anchorX: ['handR', 'ankleR'], anchorAt: [-0.25, -0.05] };

// Feet pinned to one floor spot in every pose (pivot on the balls): each pose is solved without ankle targets, then its ankles are moved
// (x/z only) so the balls land on the reference pose's balls; ankle + foot frame are stored as IK targets and interpolate linearly.
function pinFeet(poses, refName, extra) {
  const { V, solve, expand } = FB;
  const fk = (p) => solve(expand(Object.assign({}, p, { ik: Object.assign({}, p.ik, { ankleL: undefined, ankleR: undefined }) })), CTX);
  const ref = fk(poses[refName]).J;
  const frame = (F) => ({ 0: F[0].slice(), 1: F[1].slice(), 2: F[2].slice() });
  const pin = (p, free) => {
    const sol = fk(p), ik = Object.assign({}, p.ik);
    for (const s of ['R', 'L']) {
      if (free === s) { ik['ankle' + s] = { at: sol.J['ankle' + s].slice(), foot: frame(sol.F['foot' + s]) }; continue; }
      const d = [ref['ball' + s][0] - sol.J['ball' + s][0], 0, ref['ball' + s][2] - sol.J['ball' + s][2]];
      ik['ankle' + s] = { at: V.add(sol.J['ankle' + s], d), foot: frame(sol.F['foot' + s]) };
    }
    p.ik = ik;
  };
  for (const k in poses) pin(poses[k]);
  for (const [at, pose, free] of extra) { const merged = Object.assign({}, poses[at], pose); pin(merged, free); pose.ik = merged.ik; }
  return poses;
}


const RAW = {
  seat: P({ side: 34, abdR: -18, abdL: 14, shAbdR: 66, shAbdL: 20 }),
  lift: P({ side: 0, abd: 0, shAbdR: 88, shAbdL: 78, palmL: 'forward' }),
  arc: P({ side: -22, abdR: 8, abdL: -8, shAbdR: 98, shAbdL: 172, palmL: 'down', neck: 6 }),
  
};

window.EXERCISE = {
  id: 'side_bend',
  name: { tr: 'Yan Bükülme (Side Bend)', en: 'Side Bend', es: 'Flexión lateral (side bend)' },
  category: { tr: 'Pilates · Yan karın', en: 'Pilates · Obliques', es: 'Pilates · Oblicuos' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['obliques', 'core', 'glutes', 'delts'],
  side: 'R',
  tempo: '2-2-2',
  view: { yaw: -90, pitch: 6 },
  alt: { yaw: 180, pitch: 14, title: { tr: 'Ayak tarafından', en: 'From the feet', es: 'Desde los pies' },
    text: { tr: 'Omuzlar üst üste, kalça öne arkaya devrilmez', en: 'Shoulders stacked, the pelvis does not roll', es: 'Hombros apilados, la pelvis no rueda' } },
  setupView: { yaw: -60, pitch: 18 },
  setupMarks: [{ type: 'aline', joints: ['wristR', 'shoulderR'] }],
  contacts: ['handR', 'hipR', 'ankleR', 'ankleL'],
  props: [['mat', { at: [-0.25, 0, -0.12], length: 1.9, width: 0.7 }]],
  ctx: { anchorX: ['handR', 'ankleR'], anchorAt: [-0.25, -0.05], plant: ['handR'] },
  get poses() { return this._poses || (this._poses = pinFeet(RAW, 'lift', this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'seat',
  rep: [
    { to: 'lift', dur: 2.0, phase: 0 },
    { to: 'arc', dur: 2.0, phase: 1 },
    { to: 'seat', dur: 2.0, phase: 2 },
  ],
  setup: { tr: 'Sağ kalçana otur, bacaklar düz ve üst üste. Sağ el kalçanın yanında, sol el kalçada. Sonra taraf değiştir.',
    en: 'Sit on your right hip, legs straight and stacked. Right hand beside the hip, left hand on the hip. Then switch sides.',
    es: 'Siéntate sobre la cadera derecha, piernas rectas. Mano derecha junto a la cadera, la izquierda en la cadera. Luego cambia.' },
  phases: [
    { name: { tr: 'Yan planka kalk', en: 'Lift to side plank', es: 'Sube a plancha lateral' }, breath: 'out', line: ['ankleR', 'hipR', 'shoulderR'],
      text: { tr: 'Nefes ver, sağ eli it, kalçayı kaldır; üst kol tavana. Ayaklar üst üste.', en: 'Exhale, press the right hand, lift the hips; top arm to the ceiling. Feet stacked.', es: 'Exhala, empuja con la mano y sube la cadera; brazo de arriba al techo.' } },
    { name: { tr: 'Kolla kavis çiz', en: 'Arc over', es: 'Arco por encima' }, breath: 'in',
      text: { tr: 'Nefes al, üst kolu başın üstünden uzat; kalça daha da yükselir.', en: 'Inhale and sweep the top arm overhead; the hips lift even higher.', es: 'Inhala y lleva el brazo por encima de la cabeza; la cadera sube más.' } },
    { name: { tr: 'Kontrollü in', en: 'Lower with control', es: 'Baja con control' }, breath: 'out',
      text: { tr: 'Nefes ver, kolu indir ve kalçayı başlangıca bırak.', en: 'Exhale, bring the arm down and lower the hips to the start.', es: 'Exhala, baja el brazo y la cadera al inicio.' } },
  ],
  tempoText: { tr: '2 sn kalk · 2 sn kavis · 2 sn in', en: '2 s lift · 2 s arc · 2 s lower', es: '2 s sube · 2 s arco · 2 s baja' },
  mistakes: [
    { title: { tr: 'Kalça çöküyor', en: 'Hips sag', es: 'La cadera se hunde' },
      fix: { tr: 'Eli it, bacakları birleştir', en: 'Press the hand, hug the legs', es: 'Empuja la mano, junta las piernas' },
      fixText: { tr: 'Tepeden ayağa uzun ve düz bir çizgi', en: 'One long straight line from crown to toe', es: 'Una línea larga de cabeza a pies' },
      at: 'lift', pose: { side: 14, abdR: -8, abdL: 8, shAbdR: 78 }, line: ['ankleR', 'hipR', 'shoulderR'], marks: ['hipR'], parts: ['pelvis', 'waist'] },
    { title: { tr: 'Omuz destek elinde çöküyor', en: 'Shoulder sinks into the hand', es: 'El hombro se hunde' },
      fix: { tr: 'Yeri kendinden uzaklaştır', en: 'Push the mat away', es: 'Aleja el suelo' },
      fixText: { tr: 'Omuzdan yukarı uzaklaş, boyun uzun', en: 'Lift out of the shoulder, long neck', es: 'Sal del hombro, cuello largo' },
      at: 'lift', pose: { shrugR: 0.055, protract: 0.03, neck: 14, shAbdR: 82 }, marks: ['shoulderR'], parts: ['upperR', 'neck'] },
  ],
  cues: [{ tr: 'Omuzdan değil, belden kalk', en: 'Lift from the waist, not the shoulder', es: 'Sube desde la cintura, no el hombro' },
    { tr: 'Tepeden ayağa uzun çizgi', en: 'Long line from crown to toe', es: 'Línea larga de cabeza a pies' },
    { tr: 'Yeri kendinden it', en: 'Press the floor away', es: 'Empuja el suelo' }],
};
}
