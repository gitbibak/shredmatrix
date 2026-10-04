/* Stomach Massage - Reach. Seated at the FRONT edge of the carriage facing the footbar (classical set-up, no box), balls
 * of the feet on the bar in a small Pilates V, heels lifted; tall flat back, arms reaching forward at shoulder height
 * (spec trunk 0, shoulder flexion 90); the legs press the carriage out and pull it in while the torso and arms stay still.
 * Feet: onBar() from footwork.js adapted to sitting: per key pose it bisects the hip angle so the ball of the foot rests on
 * the bar (bar radius included), shifts the body along the rail so the ball sits on the bar, and pins both ankles there.
 * The carriage follows the pelvis (carriage centre = pelvis x - SEAT). */
(function () {
  const BAR_R = 0.022, TOP = 0.38, SEAT = 0.25, FBH = 0.15;
  const carriage = (sol) => sol.J.pelvis[0] - SEAT;
  const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };
  const BASE = { trunk: -2, lumbar: 0, thoracic: 0, neck: 2, flat: false, abd: 5, footOut: 22, ground: [['pelvis', TOP]],
    sh: 90, shAbd: 4, el: 3, palm: 'in', curl: 0.15 };
  
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
    return Object.assign(q, { hip, pos: [dx, 0, 0], ik: { ankleL: pin('L'), ankleR: pin('R') } });
  }

  const IN = { knee: 112, ankle: -30 };
  const OUT = { knee: 8, ankle: -38 };

  window.EXERCISE = {
    id: 'stomach_massage_reach',
    name: { tr: 'Stomach Massage - Reach', en: 'Stomach Massage - Reach', es: 'Masaje abdominal - Alcance' },
    category: { tr: 'Reformer · Karın ve bacak', en: 'Reformer · Core & legs', es: 'Reformer · Core y piernas' },
    equipmentLabel: { tr: 'Reformer · 2 kırmızı yay', en: 'Reformer · 2 red springs', es: 'Reformer · 2 muelles rojos' },
    muscles: ['core', 'quads', 'hamstrings', 'calves'],
    tempo: '2-2',
    view: { yaw: 90, pitch: 8, zoom: 1.2, dx: -40 },
    alt: { yaw: 35, pitch: 16, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
      text: { tr: 'Kollar omuz hizasında, paralel', en: 'Arms at shoulder height, parallel', es: 'Brazos a la altura de los hombros, paralelos' } },
    setupView: { yaw: 40, pitch: 20 },
    props: [['reformer', { springs: 4, carriage, footbarH: FBH }]],
    ctx: CTX,
    contacts: ['ballL', 'ballR', 'pelvis'],
    get poses() { return { in: onBar(IN), out: onBar(OUT) }; },
    rest: 'in',
    rep: [
      { to: 'out', dur: 2.0, phase: 0 },
      { to: 'in', dur: 2.0, phase: 1 },
    ],
    setup: { tr: 'Kızağın ön ucuna, bara dönük dik otur. Ayak ön tabanları barda. Kolları omuz hizasında öne uzat.',
      en: 'Sit tall at the front edge of the carriage facing the bar. Balls of the feet on the bar. Reach the arms forward.',
      es: 'Sentada erguida en el borde delantero del carro. Metatarsos en la barra. Brazos al frente, a la altura de los hombros.' },
    phases: [
      { name: { tr: 'Dik kal, it', en: 'Sit tall, press out', es: 'Erguida, empuja' }, breath: 'out', slow: 1.1, line: ['pelvis', 'neck'],
        text: { tr: 'Bacakları uzatıp kızağı it. Sırt dik, kollar omuz hizasında sabit.', en: 'Straighten the legs to press out. Back tall, arms still at shoulder height.', es: 'Estira las piernas para empujar. Espalda erguida, brazos quietos.' } },
      { name: { tr: 'Kontrollü çek', en: 'Pull in slowly', es: 'Recoge despacio' }, breath: 'in', slow: 1.1, arc: ['hipR', 'kneeR', 'ankleR'], line: ['pelvis', 'neck'],
        text: { tr: 'Arka bacakla kızağı geri çek; çarpmadan kapansın. Göbek omurgaya yakın.', en: 'Draw the carriage back with the hamstrings; close it quietly. Navel to spine.', es: 'Recoge el carro con los isquios; ciérralo sin golpe. Ombligo a la columna.' } },
    ],
    tempoText: { tr: '2 sn it · 2 sn çek · 8-10 tekrar', en: '2 s press · 2 s pull in · 8-10 reps', es: '2 s empuja · 2 s recoge · 8-10 repeticiones' },
    mistakes: [
      { title: { tr: 'Sırt çöküyor', en: 'The back slumps', es: 'La espalda se hunde' },
        fix: { tr: 'Başın tepesinden uzan', en: 'Grow tall through the crown', es: 'Crece desde la coronilla' },
        fixText: { tr: 'Oturma kemiklerine bas, omurga dik ve uzun', en: 'Press into the sit bones, spine tall and long', es: 'Apoya los isquiones, columna erguida y larga' },
        at: 'out', get pose() { return onBar(Object.assign({}, OUT, { trunk: -26, lumbar: 24, thoracic: 22, neck: 14, sh: 72, protract: 0.03 })); },
        line: ['pelvis', 'waist', 'neck'], goodLine: ['pelvis', 'neck'], parts: ['chest', 'waist'], view: { yaw: 90, pitch: 8, zoom: 1.35, dx: -90 } },
      { title: { tr: 'Dizler kilitleniyor', en: 'Knees lock', es: 'Rodillas bloqueadas' },
        fix: { tr: 'Dizleri yumuşak tut', en: 'Keep the knees soft', es: 'Rodillas suaves' },
        fixText: { tr: 'Tam kilitlenmeden hemen önce dur', en: 'Stop just short of locking', es: 'Para justo antes de bloquear' },
        at: 'out', get pose() { return onBar(Object.assign({}, OUT, { knee: -2 })); },
        line: ['hipR', 'kneeR', 'ankleR'], marks: ['kneeR'], parts: ['thigh', 'shin'], view: { yaw: 90, pitch: 8, zoom: 1.35, dx: -60 } },
    ],
    cues: [{ tr: 'Dik otur, kollar sabit', en: 'Sit tall, arms still', es: 'Erguida, brazos quietos' },
      { tr: 'Gövde sabit, sadece bacaklar', en: 'Torso still, only the legs move', es: 'Torso quieto, solo las piernas' },
      { tr: 'Kızağı kontrol et', en: 'Control the carriage', es: 'Controla el carro' }],
  };
})();
