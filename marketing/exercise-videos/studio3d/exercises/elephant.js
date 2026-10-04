/* Reformer Elephant. Standing on the carriage facing the footbar: hands flat on the footbar (handSurface = bar top), feet
 * flat on the pad with the heels against the shoulder blocks, legs straight, pelvis high, back rounded (lumbar/thoracic
 * flexion, head between the arms). The legs push the carriage out ~20 cm (hips stay high, hip angle opens slightly as the
 * feet travel back) and the abdominals pull it back in. Hands never move.
 * - Same two contacts [handR on the bar, heelR on the pad] in every pose (rigid rotation), feet forced flat.
 * - bar(): rail offset so the FK wrist sits on the flat-hand IK target (palm centre on the bar top).
 * - The carriage follows the heels (block front face at the back of the shoes every frame, offset corrected for the ankle
 *   angle as in up_stretch.js).
 * Spec trunk 60 with hip 90 and shoulders 160 assumes a lower bar: with straight arms on a bar 28 cm above the carriage the
 * shoulders cannot rise that high; the hip (~90 -> ~100), straight knees and round back follow the spec, the torso measures
 * ~115-120 pelvis->neck (head-down). */
(function () {
  const TOP = 0.38, BX = 1.0, FBH = 0.28, DA0 = -2, DA1 = 37, BAR_TOP = TOP + FBH + 0.022, HZ = 0.185;
  // block face against the back of the shoe; the skinned shoe heel sits ~4 cm ahead of J.heel when the ankle is neutral, flush when
  // it is dorsiflexed ~37 deg (plank), so the offset follows the ankle angle
  const dorsi = (J, k) => { const { V } = FB; return Math.asin(Math.max(-1, Math.min(1, V.dot(V.norm(V.sub(J['toe' + k], J['heel' + k])), V.norm(V.sub(J['knee' + k], J['ankle' + k])))))) * 180 / Math.PI; };
  const carriage = (sol) => { const a = (dorsi(sol.J, 'L') + dorsi(sol.J, 'R')) / 2, d = FB.clamp((a - DA0) / (DA1 - DA0));
    return (sol.J.heelL[0] + sol.J.heelR[0]) / 2 + 0.325 - 0.04 * d; };
  const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };
  const BASE = { trunk: 120, hip: 58, knee: 0, abd: 3, flat: true, lumbar: 20, thoracic: 16, neck: 18, shAbd: 4, el: 0,
    ground: [['handR', BAR_TOP], ['heelR', TOP]], handFlat: true, handSurface: BAR_TOP, elbowPole: [-0.3, -1, 0.75] };
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
  const IN = { hip: 58, sh: 148 };
  const OUT = { hip: 58, sh: 168 };

  window.EXERCISE = {
    id: 'elephant',
    name: { tr: 'Elephant (Fil)', en: 'Elephant', es: 'Elefante' },
    category: { tr: 'Reformer · Karın ve arka bacak', en: 'Reformer · Core & hamstrings', es: 'Reformer · Core e isquios' },
    equipmentLabel: { tr: 'Reformer · 1 kırmızı + 1 mavi yay', en: 'Reformer · 1 red + 1 blue spring', es: 'Reformer · 1 muelle rojo + 1 azul' },
    muscles: ['core', 'hamstrings', 'calves', 'delts'],
    tempo: '2-2',
    view: { yaw: 90, pitch: 6, zoom: 1.1, dx: -20 },
    alt: { yaw: 30, pitch: 14, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
      text: { tr: 'Topuklar bloklarda, kalça yüksek', en: 'Heels on the blocks, hips high', es: 'Talones en los topes, cadera alta' } },
    setupView: { yaw: 35, pitch: 18 },
    props: [['reformer', { springs: 2, carriage, footbarH: FBH }]],
    ctx: CTX,
    contacts: ['handL', 'handR', 'heelL', 'heelR'],
    get poses() { return { in: bar(IN), out: bar(OUT) }; },
    rest: 'in',
    rep: [
      { to: 'out', dur: 2.0, phase: 0 },
      { to: 'in', dur: 2.0, phase: 1 },
    ],
    setup: { tr: 'Kızağa çık, ayaklar düz basar, topuklar omuz bloklarına dayalı. Eller footbar’da, kalça yukarıda, sırt yuvarlak.',
      en: 'Stand on the carriage, feet flat, heels against the blocks. Hands on the footbar, hips high, back rounded.',
      es: 'De pie en el carro, pies planos, talones contra los topes. Manos en la barra, cadera alta, espalda redonda.' },
    phases: [
      { name: { tr: 'Kızağı geri it', en: 'Push the carriage out', es: 'Empuja el carro' }, breath: 'out', slow: 1.2, line: ['hipR', 'kneeR', 'ankleR'],
        text: { tr: 'Topuklardan iterek kızağı geri gönder. Bacaklar düz, kalça yüksek, göbek içeri.', en: 'Push through the heels to send the carriage out. Legs straight, hips high, belly in.', es: 'Empuja con los talones. Piernas rectas, cadera alta, abdomen dentro.' } },
      { name: { tr: 'Karınla geri çek', en: 'Pull in with the abs', es: 'Recoge con el abdomen' }, breath: 'in', slow: 1.2, arc: ['shoulderR', 'hipR', 'kneeR'],
        text: { tr: 'Göbeği omurgaya çekerek kızağı getir; sırt yuvarlak kalır.', en: 'Draw the navel to the spine to bring the carriage in; the back stays round.', es: 'Lleva el ombligo a la columna para recoger el carro; espalda redonda.' } },
    ],
    tempoText: { tr: '2 sn it · 2 sn çek · 5-8 tekrar', en: '2 s out · 2 s in · 5-8 reps', es: '2 s fuera · 2 s dentro · 5-8 repeticiones' },
    mistakes: [
      { title: { tr: 'Dizler bükülüyor', en: 'Knees bend', es: 'Las rodillas se doblan' },
        fix: { tr: 'Bacakları düz tut', en: 'Keep the legs straight', es: 'Piernas rectas' },
        fixText: { tr: 'Hareket kalçadan; dizler uzun, topuklar basık', en: 'Move from the hips; long knees, heels down', es: 'Mueve la cadera; rodillas largas, talones abajo' },
        at: 'out', get pose() { return bar(Object.assign({}, OUT, { hip: 76, knee: 30 })); },
        line: ['hipR', 'kneeR', 'ankleR'], marks: ['kneeR'], parts: ['thigh', 'shin'] },
      { title: { tr: 'Sırt düzleşiyor, kalça düşüyor', en: 'Back flattens, hips drop', es: 'La espalda se aplana, cadera baja' },
        fix: { tr: 'Göbek yukarı ve içeri', en: 'Belly lifts up and in', es: 'Abdomen arriba y dentro' },
        fixText: { tr: 'Kalça yüksek, sırt yuvarlak bir kemer', en: 'Hips high, back a round arch', es: 'Cadera alta, espalda en arco' },
        at: 'out', get pose() { return bar(Object.assign({}, OUT, { hip: 66, lumbar: -6, thoracic: -6, neck: -10, sh: 160 })); },
        line: ['pelvis', 'waist', 'neck'], parts: ['waist', 'chest'] },
    ],
    cues: [{ tr: 'Göbek yukarı ve içeri', en: 'Belly lifts up and in', es: 'Abdomen arriba y dentro' },
      { tr: 'Topuklardan it', en: 'Push through the heels', es: 'Empuja con los talones' },
      { tr: 'Bacaklar düz, hareket kalçadan', en: 'Legs straight, move from the hips', es: 'Piernas rectas, mueve la cadera' }],
  };
})();
