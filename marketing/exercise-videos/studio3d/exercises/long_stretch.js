/* Reformer Long Stretch. Plank facing the footbar: hands flat on the footbar (weight-bearing, handSurface = bar top), balls
 * of the feet on the carriage with the heels lifted against the front of the shoulder blocks. The body stays one rigid line;
 * the shoulders flex (90 -> ~105) to press the carriage out ~15 cm and extend to pull it back in. Hands never move.
 * - Every pose rests on the same two contacts [handR on the bar, toeR on the pad] so the body rotates rigidly about them.
 * - bar(): per pose, shifts the body along the rail so the FK wrist sits where the flat-hand IK puts it (palm centre on the
 *   bar top), then pins both hands there (identical targets in every pose).
 * - The carriage follows the heels: block front face (carriage centre - 0.29) stays at the back of the heels every frame.
 * Spec trunk 80 (near-horizontal plank) needs a bar at carriage height; with the bar 28 cm above the carriage and arms ~90 deg
 * to the trunk the plank measures ~60-64 from vertical. The technique angles (straight body, shoulder 88 -> 106, carriage
 * ~14 cm) match the spec. */
(function () {
  const TOP = 0.38, BX = 1.0, FBH = 0.28, BAR_TOP = TOP + FBH + 0.022, HZ = 0.185;
  const carriage = (sol) => (sol.J.heelL[0] + sol.J.heelR[0]) / 2 + 0.285;
  const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };
  const BASE = { trunk: 80, hip: 0, knee: 0, abd: 2, flat: false, neck: -2, shAbd: 2, el: 0,
    ground: [['handR', BAR_TOP], ['toeR', TOP]], handFlat: true, handSurface: BAR_TOP, elbowPole: [-0.3, -1, 0.75] };
  const HANDS = { handL: { at: [BX, BAR_TOP, -HZ] }, handR: { at: [BX, BAR_TOP, HZ] } };
  function bar(p) {
    const { solve, expand } = FB;
    const q = Object.assign({}, BASE, p);
    const s = solve(expand(Object.assign({}, q, { ik: undefined, pos: undefined })), CTX);
    // wrist target of the flat-hand IK (palm centre on the bar top, fingers along the thorax 'up' direction)
    const t = s.F.thorax[1], hl = Math.hypot(t[0], t[2]);
    const dx = (BX - FB.BODY.hand * 0.6 * t[0] / hl) - s.J.wristR[0];
    return Object.assign(q, { pos: [dx, 0, 0], ik: Object.assign({}, HANDS, p.ik || {}) });
  }
  const PLANK = { sh: 88, ankle: 36 };
  const OUT = { sh: 106, ankle: 42 };

  window.EXERCISE = {
    id: 'long_stretch',
    name: { tr: 'Long Stretch', en: 'Long Stretch', es: 'Long Stretch' },
    category: { tr: 'Reformer · Karın ve omuz', en: 'Reformer · Core & shoulders', es: 'Reformer · Core y hombros' },
    equipmentLabel: { tr: 'Reformer · 1 kırmızı yay', en: 'Reformer · 1 red spring', es: 'Reformer · 1 muelle rojo' },
    muscles: ['core', 'delts', 'chest', 'triceps', 'glutes'],
    tempo: '2-2',
    view: { yaw: 90, pitch: 6, zoom: 1.1, dx: -20 },
    alt: { yaw: 30, pitch: 14, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
      text: { tr: 'Eller omuz genişliğinde, kollar düz', en: 'Hands shoulder-width, arms straight', es: 'Manos al ancho de hombros, brazos rectos' } },
    setupView: { yaw: 35, pitch: 18 },
    setupMarks: [{ type: 'aline', joints: ['ankleR', 'pelvis', 'shoulderR'] }],
    props: [['reformer', { springs: 1, carriage, footbarH: FBH }]],
    ctx: CTX,
    contacts: ['handL', 'handR', 'toeL', 'toeR'],
    get poses() { return { plank: bar(PLANK), out: bar(OUT) }; },
    rest: 'plank',
    rep: [
      { to: 'out', dur: 2.0, phase: 0 },
      { to: 'plank', dur: 2.0, phase: 1 },
    ],
    setup: { tr: 'Plank: eller footbar’da omuz genişliğinde, ayak ön tabanları kızakta, topuklar omuz bloklarına dayalı.',
      en: 'Plank: hands on the footbar shoulder-width apart, balls of the feet on the carriage, heels against the blocks.',
      es: 'Plancha: manos en la barra al ancho de hombros, metatarsos en el carro, talones contra los topes.' },
    phases: [
      { name: { tr: 'Kızağı geri it', en: 'Press the carriage out', es: 'Empuja el carro' }, breath: 'out', slow: 1.2, line: ['ankleR', 'pelvis', 'shoulderR'],
        text: { tr: 'Omuzlardan it, vücut tek parça geriye kayar. Kalça ne düşer ne kalkar.', en: 'Push from the shoulders; the body slides back as one piece. Hips stay level.', es: 'Empuja desde los hombros; el cuerpo va atrás en bloque. Cadera nivelada.' } },
      { name: { tr: 'Omuzların üstüne gel', en: 'Return over the hands', es: 'Vuelve sobre las manos' }, breath: 'in', slow: 1.2, arc: ['hipR', 'shoulderR', 'elbowR'],
        text: { tr: 'Kızağı kolların gücüyle geri çek; omuzlar bileklerin üstüne gelir.', en: 'Draw the carriage back with the arms; shoulders come over the wrists.', es: 'Recoge el carro con los brazos; hombros sobre las muñecas.' } },
    ],
    tempoText: { tr: '2 sn it · 2 sn dön · 5-8 tekrar', en: '2 s out · 2 s in · 5-8 reps', es: '2 s fuera · 2 s dentro · 5-8 repeticiones' },
    mistakes: [
      { title: { tr: 'Kalça çöküyor', en: 'Hips sag', es: 'La cadera se hunde' },
        fix: { tr: 'Karnı derinden topla', en: 'Brace the deep abs', es: 'Activa el abdomen profundo' },
        fixText: { tr: 'Omuz, kalça ve topuk aynı çizgide', en: 'Shoulder, hip and heel in one line', es: 'Hombro, cadera y talón alineados' },
        at: 'out', get pose() { return bar(Object.assign({}, OUT, { hip: -16, lumbar: -12 })); },
        line: ['ankleR', 'pelvis', 'shoulderR'], parts: ['pelvis', 'waist'] },
      { title: { tr: 'Kalça yukarı kalkıyor', en: 'Hips pike up', es: 'La cadera sube' },
        fix: { tr: 'Düz bir çizgi koru', en: 'Keep one straight line', es: 'Mantén una línea recta' },
        fixText: { tr: 'Vücut tek bir tahta gibi hareket eder', en: 'The body moves like one board', es: 'El cuerpo se mueve como una tabla' },
        at: 'out', get pose() { return bar(Object.assign({}, OUT, { hip: 26, sh: 118 })); },
        line: ['ankleR', 'pelvis', 'shoulderR'], parts: ['pelvis', 'waist'] },
    ],
    cues: [{ tr: 'Tek parça, sert bir plank', en: 'One rigid plank', es: 'Una plancha rígida' },
      { tr: 'Bel çukurlaşmasın', en: 'Don’t sag in the low back', es: 'Sin hundir la zona lumbar' },
      { tr: 'Elleri bara bastır', en: 'Press down into the bar', es: 'Empuja la barra hacia abajo' }],
  };
})();
