/* Overhead cable triceps extension with a rope, facing away from a low-mid pulley, staggered stance (right foot
 * forward), torso leaning ~10°. Arms: IK holds from the shoulder joint (hands near the midline -> `noAvoid`, elbow pole
 * up/forward). Rope + cable + stack are a local prop (`_ropeCable`): the cable runs from the pulley behind the lifter to
 * the rope knot just behind the hands. Upper arm ~155-165° flexion, elbow 125 -> 5. */
{
const { V } = FB;
const PUL = [-0.62, 0.62, 0];
FB.PROPS._ropeCable = (sol) => {
  const hL = sol.J.handL, hR = sol.J.handR, mid = V.lerp(hL, hR, 0.5);
  const toP = V.norm(V.sub(PUL, mid)), knot = V.add(mid, V.mul(toP, 0.09));
  sol.grip = { L: [0, 1, 0], R: [0, 1, 0] }; sol.gripKind = 'neutral';
  const lift = Math.max(0, Math.min(0.4, (V.len(V.sub(PUL, mid)) - 1.2) * 0.5));
  return [
    { t: 'box', c: [PUL[0] - 0.12, 1.05, -0.75], s: [0.28, 2.1, 0.24], m: 'frameDark', round: 0.01 },
    { t: 'box', c: [PUL[0] - 0.02, PUL[1], -0.38], s: [0.08, 0.08, 0.76], m: 'frame' },
    { t: 'sph', c: PUL, r: 0.04, m: 'iron' },
    { t: 'tube', pts: [PUL, knot], r: 0.004, m: 'chrome' },
    { t: 'tube', pts: [knot, V.add(hL, [0, 0.04, 0]), V.add(hL, [0, -0.05, 0])], r: 0.011, m: 'rope' },
    { t: 'tube', pts: [knot, V.add(hR, [0, 0.04, 0]), V.add(hR, [0, -0.05, 0])], r: 0.011, m: 'rope' },
    { t: 'sph', c: V.add(hL, [0, -0.06, 0]), r: 0.02, m: 'rubber' }, { t: 'sph', c: V.add(hR, [0, -0.06, 0]), r: 0.02, m: 'rubber' },
    { t: 'box', c: [PUL[0] - 0.12, 0.3 + lift, -0.62], s: [0.2, 0.36, 0.04], m: 'plate' },
  ];
};
const ST = { trunk: 10, hipR: 26, kneeR: 16, hipL: -6, kneeL: 6, abd: 5, hrot: 6, neck: -2, flat: true, noAvoid: true, elbowPole: [0.5, 1, 0.15] };
const SH = () => { const s = FB.solve(FB.expand(ST), {}); const T = s.F.thorax, d = V.sub(s.J.shoulderR, s.J.chest); return [V.dot(d, T[0]), V.dot(d, T[1]), V.dot(d, T[2])]; };
const HOLD = (f, u, inward, extra) => { const s = SH(); const h = [s[0] + f, s[1] + u, s[2] - inward]; return Object.assign({}, ST, { holdL: h, holdR: h.slice() }, extra); };
window.EXERCISE = {
  id: 'overhead_cable_triceps_extension',
  name: { tr: 'Overhead Kablo Triceps Extension', en: 'Overhead Cable Triceps Extension', es: 'Extensión de tríceps con polea sobre la cabeza' },
  category: { tr: 'Kol', en: 'Arms', es: 'Brazos' },
  equipmentLabel: { tr: 'Kablo · Halat', en: 'Cable · Rope', es: 'Polea · Cuerda' },
  muscles: ['triceps', 'core'],
  tempo: '1.5-0-2',
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 25, pitch: 6, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' }, text: { tr: 'Dirsekler dar, öne bakar', en: 'Elbows narrow, pointing forward', es: 'Codos cerrados, hacia delante' } },
  setupView: { yaw: 50, pitch: 10 },
  props: [['_ropeCable']],
  ctx: { anchorX: ['ankleL', 'ankleR'], anchorAt: [0.1, 0], plant: ['ankleL', 'ankleR'] },
  get poses() {
    return this._p || (this._p = {
      start: HOLD(-0.175, 0.19, 0.1),
      top: HOLD(0.15, 0.57, 0.07),
    });
  },
  rest: 'start',
  rep: [
    { to: 'top', dur: 1.5, phase: 0 },
    { to: 'start', dur: 2.0, phase: 1 },
  ],
  setup: { tr: 'Makineye arkanı dön, bir ayak önde. Halatı başın arkasında tut, gövde hafif öne eğik.',
    en: 'Face away from the stack, one foot forward. Rope behind your head, torso leaning slightly.',
    es: 'De espaldas a la polea, un pie delante. Cuerda tras la cabeza, torso algo inclinado.' },
  phases: [
    { name: { tr: 'Uzat', en: 'Extend', es: 'Extiende' }, breath: 'out', line: ['shoulderR', 'elbowR'],
      text: { tr: 'Dirsekleri düzelt, halatı öne ve yukarı it. Üst kollar sabit.', en: 'Straighten the elbows, pushing the rope forward and up. Upper arms still.', es: 'Estira los codos, lleva la cuerda arriba y adelante. Brazos quietos.' } },
    { name: { tr: 'Geri bük', en: 'Bend back', es: 'Flexiona' }, breath: 'in', arc: ['shoulderR', 'elbowR', 'wristR'], line: ['shoulderR', 'elbowR'],
      text: { tr: 'Dirsekleri yavaşça bük, halat başın arkasına döner. Esnemeyi hisset.', en: 'Bend the elbows slowly; the rope returns behind your head. Feel the stretch.', es: 'Flexiona despacio; la cuerda vuelve tras la cabeza. Siente el estiramiento.' } },
  ],
  tempoText: { tr: '1,5 sn uzat · 2 sn bük', en: '1.5 s extend · 2 s bend', es: '1,5 s extiende · 2 s flexiona' },
  get mistakes() {
    return this._m || (this._m = [
      { title: { tr: 'Dirsekler yana açılıyor', en: 'Elbows flare out', es: 'Codos abiertos' },
        fix: { tr: 'Dirsekleri daralt', en: 'Bring the elbows in', es: 'Cierra los codos' },
        fixText: { tr: 'Dirsekler öne bakar, omuz genişliğinde', en: 'Elbows point forward, shoulder-width', es: 'Codos al frente, al ancho de hombros' },
        at: 'start', pose: { elbowPole: [0.2, 0.5, 1.3] }, view: { yaw: 25, pitch: 6 }, marks: ['elbowL', 'elbowR'], parts: ['upperR', 'upperL'] },
      { title: { tr: 'Bel kavisleniyor', en: 'Back arches', es: 'La espalda se arquea' },
        fix: { tr: 'Karnı sık, hafif öne eğil', en: 'Brace, lean slightly forward', es: 'Abdomen firme, inclínate un poco' },
        fixText: { tr: 'Kaburgalar aşağı, gövde ~10° önde', en: 'Ribs down, torso ~10° forward', es: 'Costillas abajo, torso ~10° adelante' },
        at: 'top', pose: { lumbar: -20, thoracic: -6 }, line: ['pelvis', 'waist', 'neck'], parts: ['waist', 'pelvis'] },
    ]);
  },
  cues: [{ tr: 'Dirsekler dar', en: 'Elbows narrow', es: 'Codos cerrados' }, { tr: 'Karın sıkı', en: 'Abs braced', es: 'Abdomen firme' }, { tr: 'Üst kol sabit', en: 'Upper arms still', es: 'Brazos quietos' }],
};
}
