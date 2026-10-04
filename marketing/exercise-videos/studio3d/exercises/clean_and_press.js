/* Barbell clean and press. Feet planted, both hands on world IK targets in EVERY pose (conventional_deadlift.js), so the
 * bar follows one interpolated path: floor -> knees -> hips (power position) -> high pull (chest) -> front-rack catch in a
 * quarter squat -> stand -> overhead -> rack -> hips -> knees -> floor.
 * Elbow pole (thorax frame [fwd, up, out]) given in every pose and rotated smoothly through the clean: back (arms hang in
 * the pull) -> up/out (high pull, elbows lead) -> forward (front rack, elbows high) -> forward/out (press). On the way down
 * the extra `card:false` key 'drop' (bar at the chest, elbows up/out) turns the elbows back around the bar, so no pole is
 * ever interpolated through the arm axis (that flipped the elbow in the earlier draft).
 * Rack / pull / overhead targets are built lazily from the shoulder joint in the thorax frame of each body (FB.BODY is
 * only valid after the rig loads), then used as world points.
 * Floor setup uses the deadlift template geometry (trunk ~66, hip ~132, knee ~76): with the rig's 0.56 m shoulder-to-grip
 * the spec setup (trunk 45, hip 85, knee 105) leaves the bar ~25 cm out of reach (see conventional_deadlift.js).
 * Rack = press rack (barbell_overhead_press.js): bar on the collarbones/front delts, forearms near vertical, elbows just in
 *   front of the bar (measured shoulder flexion ~20°, elbow ~145°; spec 80/140). Rig limit: a gripping hand continues the
 *   forearm (no wrist extension), and with the rig's forearm+hand length a high-elbow front rack (sh 80) puts the palm, and
 *   so the bar, at mouth height ~15 cm above the shoulder joint. Tried: a local prop drawing the bar 6-10 cm below the
 *   palms -> fists visibly float above the bar. The press rack is also the usual catch in a clean & press.
 * Heels stay down at the top of the pull (planted feet; spec ankle -30 = rising on the toes is not shown).
 * The clean is shown ~2.5x slower than real (qa rejects > 6 cm per 1/30 s; tempo card says so). noAvoid in every pose
 * (the rack needs it, as in front_squat.js; a boolean that changed between keys would snap mid-move). */
(function () {
  const { V } = FB;
  const BX = 0.095, Z = 0.215;
  const BAR = (x, y) => ({ handL: { at: [x, y, -Z] }, handR: { at: [x, y, Z] } });
  const CTX = { anchorX: ['ankleL', 'ankleR'], plant: ['ankleL', 'ankleR'] };
  const P_TURN = [0.4, -0.2, 1], P_SIDE = [0.15, -0.3, 1], P_BACK = [-1, -0.2, 0.35], P_UP = [-0.1, 0.7, 1], P_RACK = [1, -0.3, 0.45], P_PRESS = [1, -0.3, 0.8];
  const C = { abd: 6, hrot: 8, noAvoid: true, palm: 'down', curl: 1 };
  const pose = (o, pole) => Object.assign({}, C, o, { elbowPole: pole });

  function build() {
    const { solve, expand, V } = FB;
    // world bar point from the right shoulder joint of body p, offsets in its thorax frame [fwd, up]
    const fromSh = (p, f, u) => { const s = solve(expand(Object.assign({}, p, { ik: undefined })), CTX); const T = s.F.thorax;
      const o = V.add(s.J.shoulderR, V.add(V.mul(T[0], f), V.mul(T[1], u))); return { ik: BAR(o[0], o[1]) }; };
    // bar at x on a (slightly bent, ~15°) arm's reach below the shoulders of body p: the hands stay on the bar target
    // (no out-of-reach lag that would snap the elbow when the arm unlocks)
    const hang = (p, x, reach = 0.553) => { const s = solve(expand(Object.assign({}, p, { ik: undefined })), CTX); const sh = s.J.shoulderR;
      return { ik: BAR(x, sh[1] - Math.sqrt(reach * reach - (x - sh[0]) ** 2 - (Z - sh[2]) ** 2)) }; };
    const P = {};
    P.floor = pose({ trunk: 66, hip: 132, knee: 76, neck: -22, protract: 0.06, shrug: -0.05, ik: BAR(BX, 0.225) }, P_BACK);
    P.knee = pose({ trunk: 55, hip: 80, knee: 25, neck: -14, protract: 0.03, shrug: -0.02 }, P_BACK);
    Object.assign(P.knee, hang(P.knee, BX));
    // second pull: bar at mid-thigh, trunk rising, knees re-bend under the bar
    P.thigh = pose({ trunk: 28, hip: 36, knee: 20, neck: -6, protract: 0.015, shrug: 0 }, P_BACK);
    Object.assign(P.thigh, hang(P.thigh, 0.1));
    // power position -> full extension: trunk vertical, hips through, shrug, bar at the upper thigh
    P.hip = pose({ trunk: -4, hip: -6, knee: 4, neck: 0, shrug: 0.035 }, P_BACK);
    Object.assign(P.hip, hang(P.hip, 0.11, 0.548));
    // high pull: body still tall, bar rises close to the torso to the lower chest, elbows high and out
    P.pull = pose({ trunk: -2, hip: -3, knee: 6, neck: 0, shrug: 0.04 }, P_UP);
    Object.assign(P.pull, fromSh(P.pull, 0.13, -0.17));
    // elbows whip around the bar (up/out -> forward), bar at the upper chest, dropping under it
    P.turn = pose({ trunk: 2, hip: 14, knee: 18, neck: 0, shrug: 0.03 }, P_TURN);
    Object.assign(P.turn, fromSh(P.turn, 0.16, -0.04));
    // catch: quarter squat, bar on the front delts, elbows forward and high
    P.catch = pose({ trunk: 6, hip: 34, knee: 34, neck: 2, shrug: 0.01 }, P_RACK);
    Object.assign(P.catch, fromSh(P.catch, 0.15, 0.05));
    P.rack = pose({ trunk: 1, hip: 2, knee: 4, neck: 2, shrug: 0.01 }, P_RACK);
    Object.assign(P.rack, fromSh(P.rack, 0.15, 0.05));
    P.top = pose({ trunk: -3, hip: -3, knee: 2, neck: 4, shrug: 0.03 }, P_PRESS);
    Object.assign(P.top, fromSh(P.top, -0.03, 0.575));
    // lowering: bar drops off the shoulders to the chest (elbows turn up/out around the bar), then to the hips
    P.drop = pose({ trunk: 0, hip: 2, knee: 8, neck: 0, shrug: 0.02 }, P_SIDE);
    Object.assign(P.drop, fromSh(P.drop, 0.14, -0.2));
    P.hang = pose({ trunk: 2, hip: 4, knee: 8, neck: 0, shrug: 0 }, P_BACK);
    Object.assign(P.hang, hang(P.hang, 0.11));
    return P;
  }

  window.EXERCISE = {
    id: 'clean_and_press',
    name: { tr: 'Clean & Press', en: 'Barbell Clean and Press', es: 'Cargada y press' },
    category: { tr: 'Kondisyon · Tüm vücut', en: 'Conditioning · Full body', es: 'Acondicionamiento · Cuerpo completo' },
    equipmentLabel: { tr: 'Barbell', en: 'Barbell', es: 'Barra' },
    muscles: ['quads', 'glutes', 'hamstrings', 'upperback', 'delts', 'triceps'],
    tempo: '1-1.5-1.5-1.5',
    tempoReps: 1,
    maxDuration: 80,
    view: { yaw: 90, pitch: 6 },
    alt: { yaw: 30, pitch: 8, title: { tr: 'Önden çapraz', en: 'Front angle', es: 'Vista frontal' },
      text: { tr: 'Bar vücuda yakın, dik bir yolda', en: 'Bar close to the body, straight path', es: 'Barra pegada al cuerpo, trayectoria recta' } },
    setupView: { yaw: 32, pitch: 12 },
    setupMarks: [{ type: 'span', joints: ['ankleR', 'ankleL'], label: { tr: 'Kalça genişliği', en: 'Hip width', es: 'Ancho de cadera' } }],
    props: [['barbell', { grip: 'pronated' }]],
    ctx: CTX,
    get poses() { return this._poses || (this._poses = build()); },
    rest: 'floor',
    rep: [
      { to: 'knee', dur: 1.0, phase: 0 },
      { to: 'thigh', dur: 0.4, phase: 0, card: false },
      { to: 'hip', dur: 0.4, phase: 1 },
      { to: 'pull', dur: 0.45, phase: 1, card: false },
      { to: 'turn', dur: 0.4, phase: 2 },
      { to: 'catch', dur: 0.55, phase: 2, card: false },
      { to: 'rack', dur: 0.8, phase: 2, card: false },
      { to: 'top', dur: 1.5, phase: 3 },
      { to: 'rack', dur: 1.5, phase: 4 },
      { to: 'drop', dur: 0.9, phase: 4, card: false },
      { to: 'hang', dur: 0.7, phase: 5 },
      { to: 'knee', dur: 0.9, phase: 6 },
      { to: 'floor', dur: 0.9, phase: 6, card: false },
    ],
    setup: { tr: 'Bar orta ayak üstünde, kaval bara yakın. Tutuş omuzdan biraz geniş, sırt düz, kollar düz.',
      en: 'Bar over mid-foot, shins close. Grip a bit wider than the shoulders, flat back, straight arms.',
      es: 'Barra sobre el mediopié, tibias cerca. Agarre algo más ancho que los hombros, espalda recta.' },
    phases: [
      { name: { tr: 'Dizlere çek', en: 'Pull to the knees', es: 'Tira a las rodillas' }, breath: 'hold', line: ['pelvis', 'neck'],
        text: { tr: 'Yeri bacaklarla it, sırt açısı aynı kalsın.', en: 'Push the floor with the legs, keep the back angle.', es: 'Empuja el suelo con las piernas, misma espalda.' } },
      { name: { tr: 'Kalçayı patlat', en: 'Snap the hips', es: 'Cadera explosiva' }, breath: 'hold', line: ['ankleR', 'hipR', 'shoulderR'],
        text: { tr: 'Kalçayı öne patlat, omuz silk. Bar vücuda yakın yükselir.', en: 'Drive the hips through and shrug. The bar rises close.', es: 'Cadera al frente y encoge. La barra sube pegada.' } },
      { name: { tr: 'Barın altına gir', en: 'Get under the bar', es: 'Métete bajo la barra' }, breath: 'out',
        text: { tr: 'Dirsekleri hızla öne çevir, barı omuzlarda karşıla, dik kalk.', en: 'Whip the elbows forward, catch it on the shoulders, stand up.', es: 'Gira los codos al frente, recíbela en los hombros, sube.' } },
      { name: { tr: 'Başın üstüne it', en: 'Press overhead', es: 'Press arriba' }, breath: 'out', arc: ['hipR', 'shoulderR', 'elbowR'],
        text: { tr: 'Yüze yakın dik it, kollar kilitli, baş içeri.', en: 'Press up close to the face, lock out, head through.', es: 'Empuja cerca de la cara, bloquea, cabeza adentro.' } },
      { name: { tr: 'Omuzlara indir', en: 'Back to the shoulders', es: 'Baja a los hombros' }, breath: 'in',
        text: { tr: 'Barı kontrollü şekilde omuzlara indir.', en: 'Lower the bar to the shoulders with control.', es: 'Baja la barra a los hombros con control.' } },
      { name: { tr: 'Kalçaya indir', en: 'Down to the hips', es: 'Baja a la cadera' }, breath: 'in',
        text: { tr: 'Dirsekleri çevir, barı uyluklara indir.', en: 'Turn the elbows over, lower the bar to the thighs.', es: 'Gira los codos y baja la barra a los muslos.' } },
      { name: { tr: 'Yere bırak', en: 'Back to the floor', es: 'Al suelo' }, breath: 'in', line: ['pelvis', 'neck'],
        text: { tr: 'Kalçadan katlan, sırt düz, barı yere koy.', en: 'Hinge with a flat back, set the bar down.', es: 'Bisagra con espalda recta, apoya la barra.' } },
    ],
    tempoText: { tr: 'Gerçekte clean ~1 sn · burada yavaş çekim', en: 'Real clean ~1 s · shown in slow motion', es: 'Cargada real ~1 s · a cámara lenta' },
    get mistakes() {
      return this._m || (this._m = [
        { title: { tr: 'Çekişte sırt yuvarlanıyor', en: 'Rounded back in the pull', es: 'Espalda redonda al tirar' },
          fix: { tr: 'Karnı sık, göğüs yukarı', en: 'Brace, chest up', es: 'Abdomen firme, pecho arriba' },
          fixText: { tr: 'Omurga nötr, kalça ve omuz birlikte yükselir', en: 'Neutral spine; hips and shoulders rise together', es: 'Columna neutra; cadera y hombros suben juntos' },
          at: 'floor', pose: { trunk: 60, hip: 124, lumbar: 12, thoracic: 15, neck: -14 }, line: ['pelvis', 'waist', 'neck'], goodLine: ['pelvis', 'neck'], parts: ['waist', 'chest'] },
        { title: { tr: 'Kollarla çekmek, bar önde', en: 'Arm pull, bar loops out', es: 'Tirar con brazos, barra lejos' },
          fix: { tr: 'Önce kalça, bar yakın', en: 'Hips first, bar close', es: 'Primero cadera, barra cerca' },
          fixText: { tr: 'Kalça tam açılır, bar gövdeye yakın dik yükselir', en: 'Hips fully open, the bar rises straight and close', es: 'Cadera extendida, la barra sube recta y pegada' },
          at: 'pull', pose: Object.assign({ trunk: 18, hip: 40, knee: 20, neck: -4, shrug: 0.01, ik: BAR(0.33, 1.0) }), marks: ['handR'], parts: ['upperR', 'foreR', 'pelvis'] },
      ]);
    },
    cues: [{ tr: 'Nötr omurga', en: 'Neutral spine', es: 'Columna neutra' },
      { tr: 'Kalçayla patlat, bar yakın', en: 'Explode with the hips, bar close', es: 'Explota con la cadera, barra cerca' },
      { tr: 'Tepede kollar kilitli', en: 'Lock out overhead', es: 'Bloquea arriba' }],
  };
})();
