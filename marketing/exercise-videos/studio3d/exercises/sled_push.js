/* Sled push, shown as driving steps in place against a stationary sled (no travel, no sliding feet).
 * There is no sled prop in the engine, so this file registers a local prop `pushSled` (skid base with plates, two
 * vertical handles at the hands). Hands are planted on the handles (captured from the rest pose).
 * Feet: every pose carries ankle IK targets. The stance foot of a step keeps the ball of the foot on its rest spot while
 * the ankle plantarflexes (toe-off); the swing foot uses its FK spot (knee driven forward). Steps go back through the
 * rest pose so the targets interpolate on short straight lines. */
(function () {
  const { V } = FB;
  FB.PROPS.pushSled = FB.PROPS.pushSled || function (sol) {
    const hL = sol.J.handL, hR = sol.J.handR, x0 = (hL[0] + hR[0]) / 2 + 0.04;
    const out = [];
    for (const h of [hL, hR]) {
      out.push({ t: 'cyl', a: [x0, 0.24, h[2]], b: [x0, h[1] + 0.12, h[2]], r: 0.019, m: 'chrome' });
      out.push({ t: 'cyl', a: [x0, h[1] + 0.12, h[2]], b: [x0 + 0.12, h[1] + 0.12, h[2]], r: 0.019, m: 'chrome' });
    }
    out.push({ t: 'box', c: [x0 + 0.42, 0.13, 0], s: [0.95, 0.16, 0.62], m: 'frameDark', round: 0.02 });
    for (const z of [-0.33, 0.33]) out.push({ t: 'box', c: [x0 + 0.42, 0.025, z], s: [1.05, 0.05, 0.06], m: 'frame', round: 0.01 });
    out.push({ t: 'cyl', a: [x0 + 0.5, 0.21, 0], b: [x0 + 0.5, 0.62, 0], r: 0.025, m: 'chrome' });
    out.push({ t: 'cyl', a: [x0 + 0.5, 0.22, 0], b: [x0 + 0.5, 0.34, 0], r: 0.225, m: 'plate' });
    sol.grip = { L: [0, 1, 0], R: [0, 1, 0] }; sol.gripKind = 'neutral';
    return out;
  };

  // the body hangs from the handles: the hands' mean x/z is anchored, so a different trunk angle (mistakes) moves the hips
  const CTX = { anchorX: ['handL', 'handR'], anchorAt: [0.7, 0] };
  const BASE = { trunk: 50, neck: 12, sh: 108, shAbd: 6, el: 17, bend: [0, 1, 0],   // explicit FK bend plane: the default flips when the arm points along the thorax (hand anchor would jump)
    elbowPole: [-0.3, -1, 0.4], abd: 3, flat: false };
  const REST = Object.assign({}, BASE, { hip: 22, knee: 30, ankle: -4 });
  const step = (S, O) => Object.assign({}, BASE, { ['hip' + S]: 72, ['knee' + S]: 92, ['ankle' + S]: 6, ['hip' + O]: 16, ['knee' + O]: 14, ['ankle' + O]: -26, _swing: S });

  function pin(poses, extra) {
    const { solve, expand } = FB;
    const frame = (F) => ({ 0: F[0].slice(), 1: F[1].slice(), 2: F[2].slice() });
    const s0 = solve(expand(poses.drive), CTX);
    const ballPin = (s, k) => { const d = V.sub(s0.J['ball' + k], s.J['ball' + k]); return { at: V.add(s.J['ankle' + k], d), foot: frame(s.F['foot' + k]) }; };
    const doPin = (p) => { const s = solve(expand(p), CTX); const t = {}; for (const k of ['L', 'R']) t['ankle' + k] = (p._swing || '').includes(k) ? { at: s.J['ankle' + k].slice(), foot: frame(s.F['foot' + k]) } : ballPin(s, k); return t; };
    // mistakes change the whole body line: both feet take their FK spots
    for (const [at, mp] of extra) mp.ik = doPin(Object.assign({}, poses[at], mp, { _swing: 'LR' }));
    for (const n in poses) { poses[n].ik = doPin(poses[n]); delete poses[n]._swing; }
    return poses;
  }

  window.EXERCISE = {
    id: 'sled_push',
    name: { tr: 'Sled Push', en: 'Sled Push', es: 'Empuje de trineo' },
    category: { tr: 'Kondisyon · Bacak', en: 'Conditioning · Legs', es: 'Acondicionamiento · Piernas' },
    equipmentLabel: { tr: 'İtme kızağı', en: 'Push sled', es: 'Trineo de empuje' },
    muscles: ['quads', 'glutes', 'calves', 'core'],
    tempo: '0.55-0.55',
    view: { yaw: 90, pitch: 6 },
    alt: { yaw: 38, pitch: 12, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
      text: { tr: 'Kollar kilitli, omuzlar tutamaklarda', en: 'Arms locked, shoulders into the handles', es: 'Brazos bloqueados, hombros en las asas' } },
    setupView: { yaw: 40, pitch: 12 },
    contacts: ['handR', 'ballR', 'ballL'],
    props: [['pushSled']],
    ctx: Object.assign({ plant: ['handL', 'handR'] }, CTX),
    get poses() { return this._poses || (this._poses = pin({ drive: Object.assign({}, REST), stepR: step('R', 'L'), stepL: step('L', 'R') }, this.mistakes.map((m) => [m.at, m.pose]))); },
    rest: 'drive',
    rep: [
      { to: 'stepR', dur: 0.4, phase: 0 },
      { to: 'drive', dur: 0.3, phase: 0 },
      { to: 'stepL', dur: 0.4, phase: 1 },
      { to: 'drive', dur: 0.3, phase: 1 },
    ],
    setup: { tr: 'Yüksek tutamakları tut, kollar neredeyse düz. ~45° öne eğil; topuktan başa düz bir çizgi.',
      en: 'Grip the high handles, arms nearly straight. Lean in about 45°, a straight line from heels to head.',
      es: 'Agarra las asas altas, brazos casi rectos. Inclínate ~45°, línea recta de talón a cabeza.' },
    phases: [
      { name: { tr: 'Sağ dizi sür', en: 'Drive the right knee', es: 'Impulsa la rodilla derecha' }, breath: 'easy', line: ['ankleL', 'hipL', 'neck'],
        text: { tr: 'Arka bacakla yeri it, ön dizi öne sür. Kısa ve hızlı adım.', en: 'Push the floor away with the back leg, drive the front knee. Short, quick step.', es: 'Empuja el suelo con la pierna trasera y lleva la rodilla adelante. Paso corto.' } },
      { name: { tr: 'Sol dizi sür', en: 'Drive the left knee', es: 'Impulsa la rodilla izquierda' }, breath: 'easy', line: ['ankleR', 'hipR', 'neck'],
        text: { tr: 'Gövde açısı sabit, kollar kilitli. Bakış 2 m ileride yerde.', en: 'Same torso angle, arms locked. Eyes on the floor 2 m ahead.', es: 'Mismo ángulo de tronco, brazos firmes. Mirada al suelo, 2 m adelante.' } },
    ],
    tempoText: { tr: 'Adım başına ~0,55 sn · 10-30 m', en: '~0.55 s per step · 10-30 m', es: '~0,55 s por paso · 10-30 m' },
    mistakes: [
      { title: { tr: 'Sırt yuvarlak, baş yukarıda', en: 'Rounded back, head up', es: 'Espalda redonda, cabeza arriba' },
        fix: { tr: 'Nötr omurga, bakış aşağı', en: 'Neutral spine, eyes down', es: 'Columna neutra, mirada abajo' },
        fixText: { tr: 'Baş gövdenin devamı, bakış 2 m ileride', en: 'Head in line with the torso, eyes 2 m ahead', es: 'Cabeza alineada, mirada 2 m adelante' },
        at: 'drive', pose: { trunk: 34, lumbar: 10, thoracic: 18, neck: -32, sh: 111 }, line: ['pelvis', 'waist', 'neck', 'head'], goodLine: ['pelvis', 'neck', 'head'], parts: ['waist', 'chest', 'neck'] },
      { title: { tr: 'Kollarla itmek', en: 'Pushing with the arms', es: 'Empujar con los brazos' },
        fix: { tr: 'Kollar kilitli, bacaklarla it', en: 'Arms locked, drive with the legs', es: 'Brazos firmes, empuja con las piernas' },
        fixText: { tr: 'Omuzlar tutamaklara yaslanır, dirsek bükülmez', en: 'Shoulders sit in the handles, elbows stay straight', es: 'Hombros apoyados en las asas, codos rectos' },
        at: 'drive', pose: { el: 95, sh: 72, shrug: 0.04 }, marks: ['elbowR'], line: ['shoulderR', 'elbowR', 'handR'], parts: ['upperR', 'foreR'] },
    ],
    cues: [{ tr: 'Topuktan başa düz çizgi', en: 'Straight line heel to head', es: 'Línea recta de talón a cabeza' },
      { tr: 'Kollar kilitli', en: 'Arms locked', es: 'Brazos bloqueados' },
      { tr: 'Kısa, hızlı adımlar', en: 'Short, quick steps', es: 'Pasos cortos y rápidos' }],
  };
})();
