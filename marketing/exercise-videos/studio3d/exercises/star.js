/* Star (Pilates mat, side plank on the RIGHT hand). Solver setup from side_bend.js (approved): trunk 90 rolled -90 onto the
 * right side, contacts [handR (flat, straight arm), ankleR] in every pose (the support hand is a fixed flat-palm IK target, see fit()).
 * - Rest = straight-arm side plank, legs stacked, top arm resting along the side (spec start).
 * - Star = top leg abducted ~50° and top arm lifted overhead on a long diagonal (spec shoulder abduction 170 is measured
 *   from the side of the body; with the arm "straight up" read as a diagonal past the ceiling it makes the star shape).
 * - Mistakes: hips drop is shown in the plank; the forward-drifting leg on a leg-only reference pose (legUp), because a
 *   mistake shown on the full star returns to the rest pose in <1 s and the long top-arm sweep then moves too fast.
 * - The body line stays the same in both poses (same contacts, side 0), only the free limbs move. */
{
const G = [['handR', 0.006], ['ankleR', -0.018]];
const BASE = { trunk: 90, roll: -90, elR: 0, shRotR: 0, curlR: 0.1, elL: 0, palmL: 'in', curlL: 0.1,
  neck: 0, flat: false, ankle: 0, hipL: 0, hipR: 0, side: 0, abd: 0, shAbdR: 88, shAbdL: 8, ground: G };
const P = (o) => Object.assign({}, BASE, o);
const CTX = { anchorX: ['handR', 'ankleR'], anchorAt: [-0.25, -0.05] };
const RAW = {
  plank: P({}),
  star: P({ abdL: 50, shAbdL: 150, palmL: 'forward' }),
  legUp: P({ abdL: 50 }),          // mistake reference only (top arm down, so the return to the rest pose stays slow)
};
// support hand: flat palm on the mat under the shoulder, one world IK target for every pose (a plant taken from the
// straight-arm rest pose would sit under the fingertips and bend the elbow)
function fit(poses) {
  const { solve, expand } = FB;
  const w = solve(expand(poses.plank), CTX).J.wristR;
  const ik = { handR: { at: [w[0] + 0.072, -0.007, w[2]] } };
  for (const k in poses) poses[k].ik = ik;
  return poses;
}

window.EXERCISE = {
  id: 'star',
  name: { tr: 'Yıldız (Star)', en: 'Star', es: 'Estrella (star)' },
  category: { tr: 'Pilates · Yan karın', en: 'Pilates · Obliques', es: 'Pilates · Oblicuos' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['obliques', 'glutes', 'core', 'delts'],
  side: 'R',
  tempo: '2-3',
  view: { yaw: -90, pitch: 6 },
  alt: { yaw: 180, pitch: 14, title: { tr: 'Ayak tarafından', en: 'From the feet', es: 'Desde los pies' },
    text: { tr: 'Bacak kalça hizasında, öne kaymaz', en: 'The leg stays in line with the hip, not forward', es: 'La pierna en línea con la cadera, no adelante' } },
  setupView: { yaw: -60, pitch: 18 },
  setupMarks: [{ type: 'aline', joints: ['wristR', 'shoulderR'] }],
  contacts: ['handR', 'ankleR', 'ankleL'],
  props: [['mat', { at: [-0.25, 0, -0.12], length: 1.9, width: 0.7 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fit(RAW)); },
  rest: 'plank',
  rep: [
    { to: 'star', dur: 2.0, phase: 0 },
    { to: 'plank', dur: 3.0, phase: 1 },
  ],
  setup: { tr: 'Sağ elinin üstünde yan plankta kal. Bacaklar düz ve üst üste, sol kol yanda. Sonra taraf değiştir.',
    en: 'Hold a side plank on your right hand. Legs straight and stacked, left arm by your side. Then switch sides.',
    es: 'Plancha lateral sobre la mano derecha. Piernas rectas y juntas, brazo izquierdo al costado. Luego cambia.' },
  phases: [
    { name: { tr: 'Nefes ver, yıldızı aç', en: 'Exhale, open the star', es: 'Exhala, abre la estrella' }, breath: 'out', arc: ['ankleR', 'hipL', 'ankleL'],
      text: { tr: 'Üst bacak ve üst kol birlikte kalkar; zıt yönlere uzan.', en: 'Top leg and top arm lift together; reach in opposite directions.', es: 'Pierna y brazo de arriba suben juntos; alarga en direcciones opuestas.' } },
    { name: { tr: 'Nefes al, kapat', en: 'Inhale, close', es: 'Inhala, cierra' }, breath: 'in', line: ['ankleR', 'hipR', 'shoulderR'],
      text: { tr: 'Kısa bekle, sonra kolu ve bacağı indir. Kalça yukarıda kalır.', en: 'Pause, then lower the arm and leg. The hips stay lifted.', es: 'Pausa y baja brazo y pierna. La cadera sigue arriba.' } },
  ],
  tempoText: { tr: '2 sn aç · 3 sn kapat', en: '2 s open · 3 s close', es: '2 s abre · 3 s cierra' },
  mistakes: [
    { title: { tr: 'Kalça düşüyor', en: 'Hips drop', es: 'La cadera cae' },
      fix: { tr: 'Kalçayı kaldır, yeri it', en: 'Lift the hips, press the floor', es: 'Sube la cadera, empuja el suelo' },
      fixText: { tr: 'Tepeden alt ayağa düz bir çizgi', en: 'One straight line from crown to bottom foot', es: 'Línea recta de cabeza al pie de abajo' },
      at: 'plank', pose: { side: 14, abdR: -8, abdL: 8, shAbdR: 78 }, line: ['ankleR', 'hipR', 'shoulderR'], marks: ['hipR'], parts: ['pelvis', 'waist'] },
    { title: { tr: 'Üst bacak öne kayıyor', en: 'Top leg drifts forward', es: 'La pierna de arriba va adelante' },
      fix: { tr: 'Bacağı kalça hizasında kaldır', en: 'Lift the leg in line with the hip', es: 'Sube la pierna en línea con la cadera' },
      fixText: { tr: 'Bacak gövdeyle aynı düzlemde, hafif geride', en: 'Leg in the same plane as the body, slightly back', es: 'Pierna en el plano del cuerpo, algo atrás' },
      at: 'legUp', pose: { hipL: 38, abdL: 40 }, view: { yaw: 180, pitch: 20 }, line: ['hipL', 'ankleL'], marks: ['ankleL'], parts: ['thighL', 'shinL'] },
  ],
  cues: [{ tr: 'Zıt yönlere uzan', en: 'Reach in opposite directions', es: 'Alarga en direcciones opuestas' },
    { tr: 'Kalçalar üst üste ve yukarıda', en: 'Hips stacked and lifted', es: 'Caderas apiladas y arriba' },
    { tr: 'Kol ve bacak birlikte kalkar', en: 'Arm and leg lift together', es: 'Brazo y pierna suben juntos' }],
};
}
