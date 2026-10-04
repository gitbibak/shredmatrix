/* Bird dog (right arm + left leg). Quadruped on two ground contacts [handL, kneeR] (the support hand and knee, identical in
 * every pose, so no contact blending). Left hand: ctx.plant. Right hand: a per-pose IK target that stays a flat palm
 * (`handFlatR: true`) and only changes its support height (`handSurfaceR`): on the mat in the tabletop, at shoulder height
 * in the reach, so the palm faces down with the fingers forward and the target travels on a straight line (no flat/free switch pop).
 * With hands under the shoulders the arms (0.5 m) are longer than the thighs, so the trunk sits ~8 deg head-up (spec says 90);
 * thighs are kept vertical (hip 82) as the spec's "knees under hips" defines the setup. */
(function () {
  const MAT = 0.006;
  const CTX = { anchorX: ['handL'], anchorAt: [0.45, -0.08] };
  const G = [['handL', MAT], ['kneeR', MAT]];
  const TABLE = { trunk: 90, hip: 82, knee: 97, ankle: -78, flat: false, sh: 80, el: 0, neck: -4, ground: G, handFlatR: true, handSurfaceR: MAT, elbowPole: [1, -1, 0.3] };
  const REACH = Object.assign({}, TABLE, { shR: 172, hipL: -2, kneeL: 0, ankleL: 0, neck: -2 });

  function build(mistakes) {
    const { solve, expand, V } = FB;
    const t0 = solve(expand(TABLE), CTX);
    const floorHand = [t0.J.handL[0], MAT, t0.J.shoulderR[2]];
    const reachHand = (p) => {
      const s = solve(expand(Object.assign({}, p, { ik: undefined })), CTX);
      const palm = V.add(s.J.shoulderR, [0.58, -0.04, 0]);
      p.ik = { handR: { at: palm } }; p.handSurfaceR = palm[1] - 0.022;
    };
    const poses = { table: Object.assign({}, TABLE, { ik: { handR: { at: floorHand } } }), reach: Object.assign({}, REACH) };
    reachHand(poses.reach);
    for (const [at, mp] of mistakes) { const m = Object.assign({}, poses[at], mp); if (at === 'reach') { reachHand(m); mp.ik = m.ik; mp.handSurfaceR = m.handSurfaceR; } }
    // supporting (right) knee pinned to its tabletop spot in every pose (and mistake): the right ankle gets an IK target shifted by the
    // knee's drift, the foot frame is kept, so the knee cannot slide along the mat while the trunk/hips turn
    const fr = (F) => ({ 0: F[0].slice(), 1: F[1].slice(), 2: F[2].slice() });
    const K0 = t0.J.kneeR;
    const pin = (p) => { const s = solve(expand(Object.assign({}, p, { ik: Object.assign({}, p.ik, { ankleR: undefined }) })), CTX);
      const d = [K0[0] - s.J.kneeR[0], 0, K0[2] - s.J.kneeR[2]];
      p.ik = Object.assign({}, p.ik, { ankleR: { at: V.add(s.J.ankleR, d), foot: fr(s.F.footR) } }); return p; };
    for (const k in poses) pin(poses[k]);
    for (const [at, mp] of mistakes) { const m = pin(Object.assign({}, poses[at], mp)); mp.ik = m.ik; }
    return poses;
  }

  window.EXERCISE = {
    id: 'bird_dog',
    name: { tr: 'Bird Dog', en: 'Bird Dog', es: 'Bird dog (perro de caza)' },
    category: { tr: 'Karın · Core', en: 'Core', es: 'Core' },
    equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
    muscles: ['core', 'lowerback', 'glutes', 'delts'],
    tempo: '2-2-2',
    view: { yaw: 90, pitch: 6 },
    alt: { yaw: 155, pitch: 22, title: { tr: 'Arkadan çapraz', en: 'Back angle', es: 'Vista trasera' },
      text: { tr: 'Kalça kare, iki yana da devrilmiyor', en: 'Hips square, no tipping to the side', es: 'Cadera nivelada, sin girar' } },
    setupView: { yaw: 40, pitch: 14 },
    setupMarks: [{ type: 'aline', joints: ['wristL', 'shoulderL'] }, { type: 'aline', joints: ['kneeR', 'hipR'] }],
    contacts: ['handL', 'handR', 'kneeL', 'kneeR'],
    props: [['mat', { at: [0.05, 0, 0], length: 1.85 }]],
    ctx: Object.assign({ plant: ['handL'] }, CTX),
    get poses() { return this._poses || (this._poses = build(this.mistakes.map((m) => [m.at, m.pose]))); },
    rest: 'table',
    rep: [
      { to: 'reach', dur: 2.0, phase: 0 },
      { to: 'reach', dur: 1.2, phase: 1 },
      { to: 'table', dur: 2.0, phase: 2 },
    ],
    setup: { tr: 'Dört ayak: eller omuzların, dizler kalçaların altında. Sırt düz, bakış yere. Sonra taraf değiştir.',
      en: 'All fours: hands under shoulders, knees under hips. Flat back, eyes down. Then switch sides.',
      es: 'Cuadrupedia: manos bajo hombros, rodillas bajo la cadera. Espalda plana, mirada al suelo. Luego cambia de lado.' },
    phases: [
      { name: { tr: 'Uzan', en: 'Reach', es: 'Extiende' }, breath: 'out',
        text: { tr: 'Sağ kolu öne, sol bacağı geriye aynı anda uzat. Kalça yere paralel.', en: 'Reach the right arm forward and the left leg back together. Hips stay level.', es: 'Brazo derecho adelante y pierna izquierda atrás a la vez. Cadera nivelada.' } },
      { name: { tr: 'Tut', en: 'Hold', es: 'Mantén' }, breath: 'hold', line: ['wristR', 'shoulderR', 'hipL', 'ankleL'],
        text: { tr: 'Elden topuğa uzun bir çizgi. Kol ve bacak kalça hizasında, daha yukarı değil.', en: 'One long line hand to heel. Arm and leg at hip height, no higher.', es: 'Línea larga de mano a talón. Brazo y pierna a la altura de la cadera.' } },
      { name: { tr: 'Geri dön', en: 'Return', es: 'Vuelve' }, breath: 'in',
        text: { tr: 'Kol ve bacağı kontrollü şekilde başlangıca getir.', en: 'Bring the arm and leg back to the start with control.', es: 'Vuelve brazo y pierna al inicio con control.' } },
    ],
    tempoText: { tr: '2 sn uzan · 2 sn tut · 2 sn dön', en: '2 s reach · 2 s hold · 2 s return', es: '2 s extiende · 2 s mantén · 2 s vuelve' },
    mistakes: [
      { title: { tr: 'Bacak çok yüksek, bel çöküyor', en: 'Leg too high, back arches', es: 'Pierna alta, lumbar arqueada' },
        fix: { tr: 'Bacak kalça hizasına kadar', en: 'Leg only to hip height', es: 'Pierna solo a la altura de la cadera' },
        fixText: { tr: 'Yükseğe değil, uzağa uzan', en: 'Reach long, not high', es: 'Alarga, no subas' },
        at: 'reach', pose: { hipL: -26, lumbar: -14, neck: -18 }, line: ['pelvis', 'waist', 'neck'], marks: ['ankleL'], parts: ['waist', 'thighL'] },
      { title: { tr: 'Kalça yana açılıyor', en: 'Hips rotate open', es: 'La cadera se abre' },
        fix: { tr: 'Kalçayı kare tut', en: 'Keep the hips square', es: 'Cadera cuadrada' },
        fixText: { tr: 'İki kalça kemiği de yere aynı uzaklıkta', en: 'Both hip bones the same height off the floor', es: 'Ambas caderas a la misma altura' },
        at: 'reach', pose: { roll: -14, twist: -14 }, view: { yaw: 160, pitch: 18 }, line: ['hipL', 'hipR'], marks: ['hipL'], parts: ['pelvis'] },
    ],
    cues: [{ tr: 'Sırt masa gibi düz', en: 'Back flat as a table', es: 'Espalda plana como una mesa' },
      { tr: 'Yükseğe değil, uzağa uzan', en: 'Reach long, not high', es: 'Alarga, no subas' },
      { tr: 'Yavaş ve kontrollü', en: 'Slow and controlled', es: 'Lento y controlado' }],
  };
})();
