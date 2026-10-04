/* Single-arm landmine press (right arm), staggered stance with the LEFT foot forward.
 * The right hand gets world IK targets (start: bar end in front of the shoulder, elbow ~100; top: arm straight up and forward).
 * The landmine anchor is placed on the floor in front so both hand positions lie on one circle around it (the bar keeps its
 * length; the straight-line interpolation between the two keys leaves the arc by < 1.5 cm). The bar + plate is a prop defined
 * in this file (FB.PROPS._landmine), drawn from the anchor through the fist. */
(function () {
  const { V } = FB;
  const L = { A: [1.7, 0.03, 0.08] };   // anchor, replaced by build()
  FB.PROPS._landmine = (sol) => {
    const h = sol.J.handR, d = V.norm(V.sub(h, L.A));
    sol.grip = { R: d }; sol.gripKind = 'neutral';
    const end = V.add(h, V.mul(d, 0.06)), pl = V.add(h, V.mul(d, -0.36));
    return [
      { t: 'box', c: [L.A[0] + 0.02, 0.02, L.A[2]], s: [0.34, 0.04, 0.34], m: 'frameDark', round: 0.01 },
      { t: 'cyl', a: L.A, b: V.add(L.A, V.mul(d, 0.12)), r: 0.04, m: 'frame' },
      { t: 'cyl', a: V.add(L.A, V.mul(d, 0.05)), b: V.add(h, V.mul(d, -0.42)), r: 0.0145, m: 'chrome' },
      { t: 'cyl', a: V.add(h, V.mul(d, -0.42)), b: end, r: 0.025, m: 'chrome' },
      { t: 'cyl', a: V.add(pl, V.mul(d, -0.02)), b: V.add(pl, V.mul(d, 0.02)), r: 0.115, m: 'iron' },
    ];
  };
  const CTX = { anchorX: ['ankleL', 'ankleR'], plant: ['ankleL', 'ankleR'] };
  const LEGS = { hipL: 26, kneeL: 24, hipR: -12, kneeR: 22, ankleR: 16, flatR: false, abd: 4, hrot: 6, neck: -4,
    sh: 10, shL: 20, elL: 30, shAbdL: 12, palmL: 'in', elbowPoleR: [-0.3, -1, 0.45] };

  function build(mistakes) {
    const { solve, expand } = FB;
    const P0 = Object.assign({}, LEGS, { trunk: 10, lumbar: 0 });
    const P1 = Object.assign({}, LEGS, { trunk: 15, hipL: 31, hipR: -7, protract: 0.03 });
    const s0 = solve(expand(P0), CTX), s1 = solve(expand(P1), CTX);
    const S0 = s0.J.shoulderR, S1 = s1.J.shoulderR;
    const h0 = V.add(S0, [0.3, -0.01, -0.08]);
    const reach = FB.BODY.upper + FB.BODY.fore + FB.BODY.hand * 0.55 - 0.004;
    const e = 30 * Math.PI / 180;
    const h1 = V.add(S1, V.mul(V.norm([Math.cos(e), Math.sin(e), -0.12]), reach));
    // anchor on the floor (y 0.03, z 0.08) equidistant from h0 and h1: solve the linear equation in x
    const y = 0.03, z = 0.08;
    const c = (h) => (y - h[1]) ** 2 + (z - h[2]) ** 2 + h[0] * h[0];
    L.A = [(c(h1) - c(h0)) / (2 * (h1[0] - h0[0])), y, z];
    P0.ik = { handR: { at: h0 } }; P1.ik = { handR: { at: h1 } };
    for (const [at, mp] of mistakes) {
      if (mp.lean !== undefined) { const m = Object.assign({}, at === 'top' ? P1 : P0, mp); const s = solve(expand(Object.assign({}, m, { ik: undefined })), CTX);
        const d = V.sub(s.J.shoulderR, at === 'top' ? S1 : S0); mp.ik = { handR: { at: V.add(at === 'top' ? h1 : h0, [d[0], d[1], 0]) } }; delete mp.lean; }
    }
    return { start: P0, top: P1 };
  }

  window.EXERCISE = {
    id: 'landmine_press',
    name: { tr: 'Landmine Press', en: 'Landmine Press', es: 'Press landmine' },
    category: { tr: 'Omuz · Göğüs', en: 'Shoulders · Chest', es: 'Hombros · Pecho' },
    equipmentLabel: { tr: 'Barbell, landmine', en: 'Barbell, landmine', es: 'Barra, landmine' },
    muscles: ['delts', 'chest', 'triceps', 'core'],
    tempo: '1.5-0-2',
    view: { yaw: 90, pitch: 6 },
    alt: { yaw: 30, pitch: 10, title: { tr: 'Önden çapraz', en: 'Front angle', es: 'Vista frontal' },
      text: { tr: 'Omuzlar önde kare, gövde dönmüyor', en: 'Shoulders square, torso not twisting', es: 'Hombros de frente, sin girar' } },
    setupView: { yaw: 40, pitch: 12 },
    setupMarks: [{ type: 'span', joints: ['ankleR', 'ankleL'], label: { tr: 'Adım duruşu', en: 'Staggered stance', es: 'Postura escalonada' } }],
    props: [['_landmine']],
    ctx: CTX,
    get poses() { return this._poses || (this._poses = build(this.mistakes.map((m) => [m.at, m.pose]))); },
    rest: 'start',
    rep: [
      { to: 'top', dur: 1.5, phase: 0 },
      { to: 'start', dur: 2.0, phase: 1 },
    ],
    setup: { tr: 'Barın ucunu sağ omzun önünde tut. Sol ayak önde, gövde hafif öne eğik. Sonra kol değiştir.',
      en: 'Hold the bar end in front of the right shoulder. Left foot forward, torso leaning slightly forward. Then switch arms.',
      es: 'Sujeta el extremo de la barra frente al hombro derecho. Pie izquierdo adelante, torso algo inclinado. Luego cambia.' },
    phases: [
      { name: { tr: 'Yukarı ve öne it', en: 'Press up and forward', es: 'Empuja arriba y adelante' }, breath: 'out', arc: ['hipR', 'shoulderR', 'wristR'],
        text: { tr: 'Barı yay boyunca kol düzleşene kadar it. Kürek kemiği öne kayar.', en: 'Press along the arc until the arm is straight. Let the shoulder blade reach.', es: 'Empuja siguiendo el arco hasta estirar el brazo. La escápula avanza.' } },
      { name: { tr: 'Omza indir', en: 'Lower to the shoulder', es: 'Baja al hombro' }, breath: 'in',
        text: { tr: 'Barı aynı yoldan omzun önüne geri getir. Kaburgalar aşağıda.', en: 'Bring the bar back along the same path. Ribs down.', es: 'Vuelve por el mismo camino. Costillas abajo.' } },
    ],
    tempoText: { tr: '1,5 sn it · 2 sn indir', en: '1.5 s press · 2 s lower', es: '1,5 s empuja · 2 s baja' },
    mistakes: [
      { title: { tr: 'Gövde dönüyor', en: 'Torso rotates', es: 'El torso gira' },
        fix: { tr: 'Omuzları öne kare tut', en: 'Keep the shoulders square', es: 'Hombros de frente' },
        fixText: { tr: 'Kalçayı ve karnı sık, sadece kol hareket eder', en: 'Brace hips and abs; only the arm moves', es: 'Aprieta cadera y abdomen; solo se mueve el brazo' },
        at: 'top', pose: { twist: 26 }, view: { yaw: 20, pitch: 14 }, line: ['shoulderL', 'shoulderR'], marks: ['shoulderL'], parts: ['chest', 'waist'] },
      { title: { tr: 'Geriye yaslanmak', en: 'Leaning back', es: 'Inclinarse atrás' },
        fix: { tr: 'Hafif öne eğil', en: 'Lean slightly forward', es: 'Inclínate un poco adelante' },
        fixText: { tr: 'Gövde 10-15° önde, kaburgalar aşağıda', en: 'Torso 10-15° forward, ribs down', es: 'Torso 10-15° adelante, costillas abajo' },
        at: 'top', pose: { trunk: 6, hipL: 22, hipR: -16, lumbar: -16, thoracic: -10, neck: -8, lean: true }, line: ['hipR', 'neck'], marks: ['neck'], parts: ['waist', 'chest'] },
    ],
    cues: [{ tr: 'Kaburgalar aşağıda', en: 'Ribs down', es: 'Costillas abajo' },
      { tr: 'Yukarı ve öne it', en: 'Press up and forward', es: 'Empuja arriba y adelante' },
      { tr: 'Gövdeyi döndürme', en: 'Don\'t twist the torso', es: 'No gires el torso' }],
  };
})();
