/* Snake and Twist (classical Pilates mat; right hand down). Built on twist.js (same batch) and side_bend.js (approved):
 * trunk 90 rolled -90 onto the right side, ground [handR, ankleR] in every pose.
 * - Support hand: one fixed flat-palm world IK target in every pose (from the straight-arm side plank, as in star.js), so
 *   the rest pose can be the side plank itself (spec start) without the elbow bending.
 * - Snake (thread): the pelvis and chest turn toward the floor (roll -14, twist -15), hips lift (hip flexion ~45), top arm
 *   threads under the waist. Twist (pike): hips as high as the fixed hand-to-foot distance allows (hip ~75, pelvis
 *   ~0.62 m), spine slightly extended, top arm reaching through toward the legs, standing on the balls of the feet.
 *   Spec asks for hip flexion 100 / body line 60°: with the hand and feet fixed on the mat the rig's leg + trunk + arm
 *   lengths cap the pike at ~75-80° (apex geometry), so the highest reachable pike is used.
 * - Turning between side and front goes through a card-less in-between (turn) whose support-arm angles were fitted so
 *   the hand stays on its target during the rotation. Support-arm angles of thread/pike were fitted the same way. */
{
const G = [['handR', 0.006], ['ankleR', -0.018]];
const BASE = { trunk: 90, roll: -90, elR: 0, shRotR: 0, curlR: 0.1, elL: 0, palmL: 'in', curlL: 0.1,
  neck: 0, flat: false, ankle: 0, hipL: 8, hipR: -4, ground: G };
const P = (o) => Object.assign({}, BASE, o);
const CTX = { anchorX: ['handR', 'ankleR'], anchorAt: [-0.25, -0.05] };
const RAW = {
  plank: P({ side: 0, abd: 0, shAbdR: 88, shAbdL: 82, palmL: 'forward' }),
  turn: P({ roll: -52, side: 0, abd: 0, hipL: 26, hipR: 18, twist: -7.5, lumbar: 3, thoracic: 3, neck: 4, shR: 111, shAbdR: -2,
    shL: 30, shAbdL: 60, elL: 10, palmL: 'down', curlL: 0.15, ankle: 18, ground: [['handR', 0.006], ['ankleR', 0.04]] }),
  thread: P({ roll: -14, side: 0, abd: 0, hipL: 44.5, hipR: 40.5, twist: -15, lumbar: 6, thoracic: 6, neck: 8, shR: 151.5, shAbdR: -35,
    shL: 60, shAbdL: -40, elL: 10, palmL: 'back', curlL: 0.2, ankle: 30, ground: [['handR', 0.006], ['ankleR', 0.088]] }),
  pike: P({ roll: -3.5, side: 0, abd: 0, hipL: 74, hipR: 72, twist: -8, lumbar: -4, thoracic: -8, neck: 4, shR: 165, shAbdR: -28.5,
    shL: 40, shAbdL: -22, elL: 4, palmL: 'back', curlL: 0.2, ankle: 40, ground: [['handR', 0.006], ['ankleR', 0.1]] }),
};
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

function fit(poses) {
  const { solve, expand } = FB;
  const w = solve(expand(poses.plank), CTX).J.wristR;
  const ik = { handR: { at: [w[0] + 0.072, -0.007, w[2]] } };
  for (const k in poses) poses[k].ik = ik;
  return pinFeet(poses, 'plank', []);
}

window.EXERCISE = {
  id: 'snake_twist',
  name: { tr: 'Yılan ve Dönüş (Snake and Twist)', en: 'Snake and Twist', es: 'Serpiente y giro' },
  category: { tr: 'Pilates · Yan karın', en: 'Pilates · Obliques', es: 'Pilates · Oblicuos' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['obliques', 'core', 'delts', 'hamstrings'],
  side: 'R',
  tempo: '2.5-2-3',
  tempoReps: 1,
  view: { yaw: -60, pitch: 14 },
  alt: { yaw: -90, pitch: 6, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
    text: { tr: 'Omuz bileğin üstünde, kalça yukarıda', en: 'Shoulder over the wrist, hips lifted', es: 'Hombro sobre la muñeca, cadera arriba' } },
  setupView: { yaw: -40, pitch: 18 },
  setupMarks: [{ type: 'aline', joints: ['wristR', 'shoulderR'] }],
  contacts: ['handR', 'ankleR', 'ankleL'],
  props: [['mat', { at: [-0.25, 0, -0.12], length: 1.9, width: 0.7 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fit(RAW)); },
  rest: 'plank',
  rep: [
    { to: 'turn', dur: 0.9, card: false },
    { to: 'thread', dur: 1.6, phase: 0 },
    { to: 'pike', dur: 2.0, phase: 1 },
    { to: 'turn', dur: 1.6, card: false },
    { to: 'plank', dur: 1.4, phase: 2 },
  ],
  setup: { tr: 'Sağ elinin üstünde yan plankta kal, kol düz. Bacaklar düz ve bitişik. Sonra taraf değiştir.',
    en: 'Hold a side plank on your right hand, arm straight. Legs straight and together. Then switch sides.',
    es: 'Plancha lateral sobre la mano derecha, brazo recto. Piernas rectas y juntas. Luego cambia.' },
  phases: [
    { name: { tr: 'Nefes ver, yılan', en: 'Exhale, snake', es: 'Exhala, serpiente' }, breath: 'out',
      text: { tr: 'Merkezden kalk; göğüs yere döner, üst kol belin altından geçer.', en: 'Lift from the centre; the chest turns down, the top arm threads under.', es: 'Sube desde el centro; el pecho gira abajo, el brazo pasa por debajo.' } },
    { name: { tr: 'Nefes al, kalçayı yükselt', en: 'Inhale, hips up', es: 'Inhala, cadera arriba' }, breath: 'in', line: ['wristR', 'shoulderR'],
      text: { tr: 'Kalça en yükseğe çıkar, topuklar yere uzanır. Omuz bileğin üstünde.', en: 'Hips rise as high as they go, heels reach down. Shoulder over the wrist.', es: 'La cadera sube al máximo, talones abajo. Hombro sobre la muñeca.' } },
    { name: { tr: 'Nefes ver, açıl', en: 'Exhale, unwind', es: 'Exhala, abre' }, breath: 'out', line: ['ankleR', 'hipR', 'shoulderR'],
      text: { tr: 'Kontrollü şekilde dönüp yan plankaya geri gel.', en: 'Rotate back to the side plank with control.', es: 'Gira de vuelta a la plancha lateral con control.' } },
  ],
  tempoText: { tr: '2,5 sn yılan · 2 sn kalça yukarı · 3 sn açıl', en: '2.5 s snake · 2 s hips up · 3 s unwind', es: '2,5 s serpiente · 2 s cadera arriba · 3 s abre' },
  mistakes: [
    { title: { tr: 'Kalça çöküyor', en: 'Hips collapse', es: 'La cadera se hunde' },
      fix: { tr: 'Karından yukarı kalk', en: 'Lift from the belly', es: 'Sube desde el abdomen' },
      fixText: { tr: 'Göbek içeri, kalça yukarıda; sonra yılana geç', en: 'Navel in, hips lifted; then move into the snake', es: 'Ombligo dentro, cadera arriba; luego la serpiente' },
      at: 'plank', pose: { side: 14, abdR: -8, abdL: 8, shAbdR: 78 }, line: ['ankleR', 'hipR', 'shoulderR'], marks: ['pelvis'], parts: ['pelvis', 'waist'] },
    { title: { tr: 'Ağırlık bileğe yükleniyor', en: 'Weight dumped on the wrist', es: 'Peso sobre la muñeca' },
      fix: { tr: 'Omzu bileğin üstüne diz', en: 'Stack the shoulder over the wrist', es: 'Hombro sobre la muñeca' },
      fixText: { tr: 'Kol dik, omuz bileğin tam üstünde; yeri it', en: 'Arm vertical, shoulder right over the wrist; push the floor', es: 'Brazo vertical, hombro sobre la muñeca; empuja' },
      at: 'plank', pose: { shAbdR: 62, shrugR: 0.035 }, view: { yaw: -90, pitch: 8 }, line: ['wristR', 'shoulderR'], marks: ['wristR'], parts: ['upperR', 'foreR'] },
  ],
  cues: [{ tr: 'Merkezden kalk', en: 'Lift from the centre', es: 'Sube desde el centro' },
    { tr: 'Ağırlık bilekte değil', en: 'Keep the weight off the wrist', es: 'El peso fuera de la muñeca' },
    { tr: 'İnişi kontrol et', en: 'Control the descent', es: 'Controla la bajada' }],
};
}
