/* Wall Shoulder Opener (wall hang / half forward fold at the wall). Side view, wall in front of the character (+x).
 * rest = the hold (like warrior_3.js); rep = hold -> soft knees, hips and hands ~15 cm lower on the wall -> hold -> hold.
 * (With the feet ~1 m from the wall an upright 'hands at chest height' pose is out of reach, so the moving step is the
 * classic soften-the-knees / straighten-and-sink-the-chest cycle.)
 * Feet are planted on their spot (the spec's "walk the feet back ~1 m" happens before the clip: the setup card says so and the
 * stance is already at the hold distance, so the feet never slide). The palms slide up/down the wall: world IK targets on the
 * wall face in every pose (hold: where the straight overhead arms reach; prep: trunk bisected so the straight arms reach the
 * wall at shoulder height). Legs: hip = trunk + 2 keeps the hips stacked over the heels.
 * ENGINE LIMIT: a free hand always points its fingers along the forearm (no wrist extension for a vertical support), so the
 * palms cannot lie flat on the wall with the fingers up; the hands touch the wall with the finger pads, palms down. */
{
const LEGS = { knee: 2, flat: true, abd: 2, ground: [['heelR', 0]] };
const ARM = { el: 1, shAbd: 4, palm: 'down', curl: 0.18, elbowPole: [-0.6, -1, 0.3] };
const RAW = {
  hold: Object.assign({ trunk: 91, hip: 93, lumbar: 0, thoracic: -4, neck: 4, sh: 172 }, LEGS, ARM),
  prep: Object.assign({ trunk: 72, hip: 96, lumbar: 4, thoracic: 8, neck: -6, sh: 150 }, LEGS, ARM, { knee: 36, ankle: 18 }),
};
const CTX = { anchorX: ['ankleL', 'ankleR'], anchorAt: [0, 0] };
let WALL_X = 1.2;
function build(poses, mistakes) {
  const { solve, expand, BODY: B } = FB;
  const fk = (p) => solve(expand(Object.assign({}, p, { ik: undefined })), CTX);
  const bis = (f, lo, hi) => { let flo = f(lo); for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2, fm = f(m); if ((fm > 0) === (flo > 0)) { lo = m; flo = fm; } else hi = m; } return (lo + hi) / 2; };
  const s = fk(poses.hold);
  const FACE = s.J.handR[0] + B.hand * 0.4;           // fingertips touch the wall face
  WALL_X = FACE + 0.1;                                 // wall prop: 10 cm box whose near face is at x - 0.1
  const reach = B.upper + B.fore + B.hand * 0.55 - 0.004;
  // prep (soft knees): trunk bisected so the straight arms reach the same wall line 16 cm lower
  const p = poses.prep, yT = s.J.handR[1] - 0.16;
  const reachAt = (t) => { const J = fk(Object.assign({}, p, { trunk: t })).J; return Math.hypot(s.J.handR[0] - J.shoulderR[0], yT - J.shoulderR[1]) - reach; };
  p.trunk = bis(reachAt, 40, 89);
  const q = { J: { handL: [0, yT, s.J.handL[2]], handR: [0, yT, s.J.handR[2]] } };
  const T = (sol) => ({ handL: { at: [s.J.handL[0], sol.J.handL[1], sol.J.handL[2]] }, handR: { at: [s.J.handR[0], sol.J.handR[1], sol.J.handR[2]] } });
  poses.hold.ik = T(s); poses.prep.ik = T(q);
  for (const m of mistakes) m.pose.ik = poses.hold.ik;
  return poses;
}

window.EXERCISE = {
  id: 'wall_shoulder_opener',
  name: { tr: 'Duvar Omuz Açıcı', en: 'Wall Shoulder Opener', es: 'Apertura de hombros en la pared' },
  category: { tr: 'Yoga · Omuz · Esneme', en: 'Yoga · Shoulders · Stretch', es: 'Yoga · Hombros · Estiramiento' },
  equipmentLabel: { tr: 'Duvar', en: 'Wall', es: 'Pared' },
  muscles: ['lats', 'chest', 'delts', 'hamstrings'],
  tempo: '4-8-3',
  hold: true, holdDur: 5,
  view: { yaw: 108, pitch: 6 },   // slightly from behind: the wall never sits between the camera and the body
  alt: { yaw: 145, pitch: 14, title: { tr: 'Arkadan çapraz', en: 'Rear angle', es: 'Vista trasera' },
    text: { tr: 'Eller omuz genişliğinde, kollar kulak hizasında', en: 'Hands shoulder-width, arms by the ears', es: 'Manos al ancho de hombros, brazos junto a las orejas' } },
  setupView: { yaw: 140, pitch: 12 },
  setupMarks: [{ type: 'aline', joints: ['hipR', 'ankleR'] }],
  contacts: ['heelR', 'ballR', 'heelL', 'ballL', 'handR', 'handL'],
  props: [['wall', { get x() { return WALL_X; } }]],
  ctx: Object.assign({ plant: ['ankleL', 'ankleR'] }, CTX),
  get poses() { return this._poses || (this._poses = build(RAW, this.mistakes)); },
  rest: 'hold',
  rep: [
    { to: 'prep', dur: 3.0, phase: 0 },
    { to: 'hold', dur: 4.0, phase: 1 },
    { to: 'hold', dur: 1.0, phase: 2 },
  ],
  setup: { tr: 'Duvara dön, elleri duvara koy ve ayakları ~1 m geri yürüt. Ayaklar kalça genişliğinde.',
    en: 'Face the wall, hands on it, and walk your feet back about 1 m. Feet hip-width.',
    es: 'Frente a la pared, manos en ella, camina los pies ~1 m atrás. Pies al ancho de cadera.' },
  phases: [
    { name: { tr: 'Dizleri yumuşat', en: 'Soften the knees', es: 'Suaviza las rodillas' }, breath: 'in', slow: 1.0,
      text: { tr: 'Dizleri bük, elleri duvarda biraz aşağı kaydır, sırt uzun.', en: 'Bend the knees, slide the hands a little down the wall, long back.', es: 'Flexiona rodillas, baja un poco las manos, espalda larga.' } },
    { name: { tr: 'Göğsü indir', en: 'Sink the chest', es: 'Baja el pecho' }, breath: 'out', slow: 1.0,
      text: { tr: 'Bacakları uzat, elleri baş hizasına kaydır, göğüs yere insin.', en: 'Lengthen the legs, slide the hands to head height, chest sinks.', es: 'Estira las piernas, manos a la altura de la cabeza, el pecho baja.' } },
    { name: { tr: 'Pozda kal', en: 'Hold', es: 'Mantén' }, breath: 'easy', line: ['handR', 'shoulderR', 'hipR'],
      text: { tr: 'Kalça topukların üstünde, avuçlar duvara bastırır.', en: 'Hips over the heels, palms press into the wall.', es: 'Cadera sobre los talones, palmas contra la pared.' } },
  ],
  tempoText: { tr: '4 sn eğil · 5-8 nefes kal · 3 sn doğrul', en: '4 s hinge · stay 5-8 breaths · 3 s rise', es: '4 s bisagra · 5-8 respiraciones · 3 s sube' },
  mistakes: [
    { title: { tr: 'Bel çukurlaşıyor', en: 'Low back sags', es: 'La zona lumbar se hunde' },
      text: { tr: 'Kaburgalar açılır, bel aşırı kavis yapar.', en: 'The ribs flare and the lower back over-arches.', es: 'Las costillas se abren y la lumbar se arquea.' },
      fix: { tr: 'Kaburgaları içeri topla', en: 'Draw the ribs in', es: 'Recoge las costillas' },
      fixText: { tr: 'Dizleri hafif bük, omurga düz ve uzun', en: 'Soften the knees, spine long and flat', es: 'Rodillas suaves, columna larga y plana' },
      at: 'hold', pose: { lumbar: -20, thoracic: -14, neck: -14 }, line: ['pelvis', 'waist', 'neck'], goodLine: ['pelvis', 'neck'], parts: ['waist', 'pelvis'] },
    { title: { tr: 'Omuzlar kulaklara kalkıyor', en: 'Shoulders shrug to the ears', es: 'Hombros hacia las orejas' },
      text: { tr: 'Trapezler kasılır, boyun kısalır.', en: 'The traps tense and the neck shortens.', es: 'Los trapecios se tensan y el cuello se acorta.' },
      fix: { tr: 'Omuzları kulaklardan uzaklaştır', en: 'Shoulders away from the ears', es: 'Hombros lejos de las orejas' },
      fixText: { tr: 'Avuçlarla duvarı it, kürek kemikleri aşağı', en: 'Press the palms, shoulder blades slide down', es: 'Empuja con las palmas, escápulas abajo' },
      at: 'hold', pose: { shrug: 0.05, neck: 16 }, view: { yaw: 130, pitch: 12 }, marks: ['shoulderR', 'head'], parts: ['upper', 'neck'] },
  ],
  cues: [{ tr: 'Kalça topukların üstünde', en: 'Hips over heels', es: 'Cadera sobre los talones' },
    { tr: 'Avuçlar duvara, göğüs yere', en: 'Palms into the wall, chest down', es: 'Palmas a la pared, pecho abajo' },
    { tr: 'Kaburgalar içeride, omurga uzun', en: 'Ribs in, long spine', es: 'Costillas dentro, columna larga' }],
};
}
