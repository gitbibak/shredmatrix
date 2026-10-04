/* Half moon (Ardha Chandrasana), standing on the right leg, right hand on a block. Front view, body tipped toward +z.
 * rest = the pose itself; rep = hold -> prep (standing knee bent, torso lower, left leg low) -> hold -> hold. The right
 * foot is planted; the right palm is a world IK target on the block top (block placed under the hold-pose shoulder) in
 * every pose, so the hand stays on the block through every transition. The left (lifted) leg is plain FK.
 * core.js: negative `roll`/`side` tip the body toward the character's right; with the pelvis rolled ~85° the standing leg
 * needs ~85° relative abduction to stay vertical, the free left leg at ~0° points straight back (parallel to the floor). */
{
const BLOCK_H = 0.23;
let BLOCK = [0.03, 0.075, 0.5];
const BASE = { ground: [['heelR', 0]], hipR: 0, kneeR: 4, hrotR: 0, hipL: 0, kneeL: 0, ankleL: 0, flatL: false, el: 2,
  shAbdR: 88, shAbdL: 92, palmL: 'forward', curl: 0.1, handFlatR: true, handSurfaceR: BLOCK_H };
const RAW = {
  hold: Object.assign({}, BASE, { roll: -84, side: -26, twist: 8, abdR: 86, abdL: 2, neck: 0, headTurn: 40 }),
  prep: Object.assign({}, BASE, { roll: -84, side: -26, twist: 0, abdR: 84, kneeR: 16, hipR: 10, abdL: -38, kneeL: 8, neck: 0, headTurn: 0 }),
};
function build(poses, mistakes) {
  const { solve, expand } = FB;
  const s = solve(expand(Object.assign({}, poses.hold, { ik: undefined })), { anchorX: ['ankleR'], anchorAt: [0, 0] });
  // block right under the bottom shoulder; the palm is an IK target on its top in every pose (and every mistake)
  BLOCK = [s.J.shoulderR[0] + 0.02, 0.075, s.J.shoulderR[2] - 0.03];
  const H = { handR: { at: [BLOCK[0], BLOCK_H, BLOCK[2]] } };
  for (const k in poses) poses[k].ik = Object.assign({}, poses[k].ik, H);
  for (const m of mistakes) m.pose.ik = Object.assign({}, m.pose.ik, H);
  return poses;
}

window.EXERCISE = {
  id: 'half_moon',
  name: { tr: 'Yarım Ay Pozu', en: 'Half Moon', es: 'Media luna' },
  category: { tr: 'Yoga · Denge · Yan', en: 'Yoga · Balance · Side', es: 'Yoga · Equilibrio · Lateral' },
  equipmentLabel: { tr: 'Mat · Blok', en: 'Mat · Block', es: 'Esterilla · Bloque' },
  muscles: ['glutes', 'quads', 'obliques', 'core'],
  tempo: '5-8-4',
  hold: true, holdDur: 4,
  view: { yaw: 0, pitch: 6 },
  alt: { yaw: -40, pitch: 14, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Kalkan bacak yere paralel, topuktan it', en: 'Lifted leg level, press through the heel', es: 'Pierna elevada paralela, empuja con el talón' } },
  setupView: { yaw: 30, pitch: 14 },
  setupMarks: [{ type: 'aline', joints: ['handR', 'shoulderR', 'shoulderL', 'handL'] }],
  contacts: ['heelR', 'ballR', 'handR'],
  props: [['mat', { at: [0.02, 0, 0.0], length: 0.75, width: 1.9 }], ['block', { at: () => BLOCK, size: [0.1, 0.23, 0.15] }]],
  ctx: { anchorX: ['ankleR'], anchorAt: [0, 0], plant: ['ankleR'] },
  get poses() { return this._poses || (this._poses = build(RAW, this.mistakes)); },
  rest: 'hold',
  rep: [
    { to: 'prep', dur: 4.0, phase: 0 },
    { to: 'hold', dur: 4.0, phase: 1 },
    { to: 'hold', dur: 1.0, phase: 2 },
  ],
  setup: { tr: 'Sağ el bloğun üstünde, sağ ayağın ~30 cm önünde. Sonra taraf değiştir.',
    en: 'Right hand on a block about 30 cm ahead of the right foot. Then switch sides.',
    es: 'Mano derecha en un bloque, ~30 cm delante del pie derecho. Luego cambia de lado.' },
  phases: [
    { name: { tr: 'Hazırlan', en: 'Prepare', es: 'Prepárate' }, breath: 'in', slow: 1.0,
      text: { tr: 'Sağ diz bükülü, sağ el blokta, sol bacak alçakta.', en: 'Right knee bent, right hand on the block, left leg low.', es: 'Rodilla derecha flexionada, mano en el bloque, pierna izquierda baja.' } },
    { name: { tr: 'Kaldır', en: 'Lift', es: 'Eleva' }, breath: 'out', slow: 1.0,
      text: { tr: 'Nefes vererek sağ bacağı düzelt, sol bacağı yere paralel kaldır.', en: 'Exhale, straighten the right leg and lift the left leg level.', es: 'Exhala, estira la pierna derecha y eleva la izquierda.' } },
    { name: { tr: 'Pozda kal', en: 'Hold', es: 'Mantén' }, breath: 'easy', line: ['handR', 'shoulderR', 'shoulderL', 'handL'],
      text: { tr: 'Kalçalar üst üste, kollar tek çizgi, göğüs açık.', en: 'Hips stacked, arms in one line, chest open.', es: 'Caderas apiladas, brazos en línea, pecho abierto.' } },
  ],
  tempoText: { tr: '4 sn kalk · 3-5 nefes kal', en: '4 s up · stay 3-5 breaths', es: '4 s arriba · 3-5 respiraciones' },
  mistakes: [
    { title: { tr: 'Üst kalça öne düşüyor', en: 'Top hip rolls forward', es: 'La cadera de arriba cae' },
      text: { tr: 'Kalçalar üst üste değil, gövde yere döner.', en: 'Hips are not stacked, the torso turns down.', es: 'Caderas no apiladas, el torso mira al suelo.' },
      fix: { tr: 'Üst kalçayı yukarı aç', en: 'Open the top hip up', es: 'Abre la cadera hacia arriba' },
      fixText: { tr: 'Sol kalça sağın tam üstünde', en: 'Left hip right above the right hip', es: 'Cadera izquierda sobre la derecha' },
      at: 'hold', pose: { yaw: -26, twist: -10, headTurn: 0, neck: 10 }, view: { yaw: 60, pitch: 30 }, marks: ['hipL'], parts: ['pelvis', 'chest'] },
    { title: { tr: 'Alttaki kola çöküyor', en: 'Collapsing on the bottom hand', es: 'Hundirse sobre la mano' },
      text: { tr: 'Omuz kulağa çöker, göğüs düşer.', en: 'The shoulder sinks to the ear, the chest drops.', es: 'El hombro se hunde, el pecho cae.' },
      fix: { tr: 'Bloğu it, omzu uzaklaştır', en: 'Press the block away', es: 'Empuja el bloque' },
      fixText: { tr: 'Alttaki omuz elin tam üstünde', en: 'Bottom shoulder right above the hand', es: 'Hombro de abajo sobre la mano' },
      at: 'hold', pose: { side: -38, shrugR: 0.05, neck: 14, headTurn: 0 }, marks: ['shoulderR'], parts: ['upperR', 'chest'] },
  ],
  cues: [{ tr: 'Kalçalar ve omuzlar üst üste', en: 'Stack hips and shoulders', es: 'Apila caderas y hombros' },
    { tr: 'Kalkan topuktan it', en: 'Press through the lifted heel', es: 'Empuja con el talón elevado' },
    { tr: 'Blok elin altında', en: 'Block under the hand', es: 'Bloque bajo la mano' }],
};
}
