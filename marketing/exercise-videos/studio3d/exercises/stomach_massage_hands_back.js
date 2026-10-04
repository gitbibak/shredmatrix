/* Stomach Massage - Hands Back. Seated at the FRONT edge of the carriage facing the footbar (classical set-up, no box),
 * balls of the feet on the bar in a small Pilates V, heels lifted; hands flat on the carriage behind the hips, chest open,
 * long flat back; the legs press the carriage out and pull it in while the torso stays still.
 * Spec trunk -10 with ~40 deg shoulder extension and hands on the seat is out of reach for this rig (arms too short for a
 * near-upright trunk with straight arms to the pad): the trunk leans back ~22 deg so the shoulder extension (~40) and the
 * long arms match; documented here.
 * Feet: onBar() from footwork.js adapted to sitting: per key pose it bisects the hip angle so the ball of the foot rests on
 * the bar (bar radius included), shifts the body along the rail so the ball sits on the bar, and pins both ankles there.
 * The carriage follows the pelvis (carriage centre = pelvis x - SEAT); hands are world IK targets on the carriage edge,
 * recomputed per pose from the solved pelvis, so they ride with the carriage. */
(function () {
  const BAR_R = 0.022, TOP = 0.38, SEAT = 0.25, FBH = 0.15;
  const carriage = (sol) => sol.J.pelvis[0] - SEAT;
  const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };
  const BASE = { trunk: -21, lumbar: 0, thoracic: -4, neck: 4, flat: false, abd: 5, footOut: 22, ground: [['pelvis', TOP]],
    handFlat: true, handSurface: TOP, shrug: -0.025, elbowPole: [-1, 0, 0.5], noAvoid: true };
  const HAND = (sol, s) => [sol.J.pelvis[0] - 0.33, TOP + 0.03, s * 0.21];

  function onBar(p) {
    const { solve, expand } = FB, R = FB.REFORMER;
    const bx = R.footbarX, by = TOP + FBH;
    const q = Object.assign({}, BASE, p);
    const at = (h) => solve(expand(Object.assign({}, q, { hip: h, ik: undefined })), CTX);
    const dy = (s) => s.J.ballR[1] - (by + BAR_R * s.F.footR[1][1]);
    let lo = -20, hi = 170;
    for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (dy(at(m)) > 0) hi = m; else lo = m; }
    const hip = (lo + hi) / 2, s = at(hip);
    const dx = bx + BAR_R * s.F.footR[1][0] - s.J.ballR[0];
    const pin = (k) => ({ at: [s.J['ankle' + k][0] + dx, s.J['ankle' + k][1], s.J['ankle' + k][2]], foot: s.F['foot' + k].map((c) => c.slice()) });
    const sh = { J: { pelvis: [s.J.pelvis[0] + dx] } };
    return Object.assign(q, { hip, pos: [dx, 0, 0], ik: { ankleL: pin('L'), ankleR: pin('R'), handL: { at: HAND(sh, -1) }, handR: { at: HAND(sh, 1) } } });
  }

  const IN = { knee: 112, ankle: -30 };
  const OUT = { knee: 8, ankle: -38 };

  window.EXERCISE = {
    id: 'stomach_massage_hands_back',
    name: { tr: 'Stomach Massage - Hands Back', en: 'Stomach Massage - Hands Back', es: 'Masaje abdominal - Manos atrás' },
    category: { tr: 'Reformer · Karın ve bacak', en: 'Reformer · Core & legs', es: 'Reformer · Core y piernas' },
    equipmentLabel: { tr: 'Reformer · 2 kırmızı yay', en: 'Reformer · 2 red springs', es: 'Reformer · 2 muelles rojos' },
    muscles: ['core', 'quads', 'hamstrings', 'calves'],
    tempo: '2-2',
    view: { yaw: 90, pitch: 8, zoom: 1.2, dx: -40 },
    alt: { yaw: 35, pitch: 16, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
      text: { tr: 'Göğüs açık, eller kalçanın arkasında', en: 'Chest open, hands behind the hips', es: 'Pecho abierto, manos detrás de la cadera' } },
    setupView: { yaw: 40, pitch: 20 },
    props: [['reformer', { springs: 4, carriage, footbarH: FBH }]],
    ctx: CTX,
    contacts: ['ballL', 'ballR', 'pelvis', 'handL', 'handR'],
    get poses() { return { in: onBar(IN), out: onBar(OUT) }; },
    rest: 'in',
    rep: [
      { to: 'out', dur: 2.0, phase: 0 },
      { to: 'in', dur: 2.0, phase: 1 },
    ],
    setup: { tr: 'Kızağın ön ucuna, bara dönük otur. Ayak ön tabanları barda. Eller kalçanın arkasında kızakta, göğüs açık.',
      en: 'Sit at the front edge of the carriage facing the bar. Balls of the feet on the bar. Hands on the carriage behind you, chest open.',
      es: 'Sentada en el borde delantero del carro, mirando a la barra. Metatarsos en la barra. Manos detrás en el carro, pecho abierto.' },
    phases: [
      { name: { tr: 'Göğsü açık tut, it', en: 'Chest open, press out', es: 'Pecho abierto, empuja' }, breath: 'out', slow: 1.1, line: ['pelvis', 'neck'],
        text: { tr: 'Bacakları uzatıp kızağı it. Sırt düz, göğüs açık; omuzlar kulaklardan uzak.', en: 'Straighten the legs to press out. Flat back, open chest; shoulders away from the ears.', es: 'Estira las piernas y empuja. Espalda recta, pecho abierto, hombros abajo.' } },
      { name: { tr: 'Kontrollü çek', en: 'Pull in slowly', es: 'Recoge despacio' }, breath: 'in', slow: 1.1, arc: ['hipR', 'kneeR', 'ankleR'], line: ['pelvis', 'neck'],
        text: { tr: 'Arka bacakla kızağı geri çek; çarpmadan kapansın. Göbek omurgaya yakın.', en: 'Draw the carriage back with the hamstrings; close it quietly. Navel to spine.', es: 'Recoge el carro con los isquios; ciérralo sin golpe. Ombligo a la columna.' } },
    ],
    tempoText: { tr: '2 sn it · 2 sn çek · 8-10 tekrar', en: '2 s press · 2 s pull in · 8-10 reps', es: '2 s empuja · 2 s recoge · 8-10 repeticiones' },
    mistakes: [
      { title: { tr: 'Bel çukurlaşıyor', en: 'Lower back arches', es: 'La zona lumbar se arquea' },
        fix: { tr: 'Kaburgaları indir', en: 'Knit the ribs down', es: 'Cierra las costillas' },
        fixText: { tr: 'Göğüs açık ama kaburgalar içeride, karın aktif', en: 'Chest open but ribs in, abs on', es: 'Pecho abierto, costillas dentro, abdomen activo' },
        at: 'out', get pose() { return onBar(Object.assign({}, OUT, { trunk: -17, lumbar: -14, thoracic: -6, neck: -10 })); },
        line: ['pelvis', 'waist', 'neck'], goodLine: ['pelvis', 'neck'], parts: ['waist', 'chest'], view: { yaw: 90, pitch: 8, zoom: 1.35, dx: -90 } },
      { title: { tr: 'Dizler kilitleniyor', en: 'Knees lock', es: 'Rodillas bloqueadas' },
        fix: { tr: 'Dizleri yumuşak tut', en: 'Keep the knees soft', es: 'Rodillas suaves' },
        fixText: { tr: 'Tam kilitlenmeden hemen önce dur', en: 'Stop just short of locking', es: 'Para justo antes de bloquear' },
        at: 'out', get pose() { return onBar(Object.assign({}, OUT, { knee: -2 })); },
        line: ['hipR', 'kneeR', 'ankleR'], marks: ['kneeR'], parts: ['thigh', 'shin'], view: { yaw: 90, pitch: 8, zoom: 1.35, dx: -60 } },
    ],
    cues: [{ tr: 'Göğüs açık, sırt uzun', en: 'Chest open, long back', es: 'Pecho abierto, espalda larga' },
      { tr: 'Gövde sabit, sadece bacaklar', en: 'Torso still, only the legs move', es: 'Torso quieto, solo las piernas' },
      { tr: 'Kızağı kontrol et', en: 'Control the carriage', es: 'Controla el carro' }],
  };
})();
