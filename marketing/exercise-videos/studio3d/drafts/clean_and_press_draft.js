/* Barbell clean and press. Feet planted, hands on world IK targets in every pose (conventional_deadlift.js), so the bar
 * follows one interpolated path: floor -> just above the knees (shins vertical, bar clears the knees) -> front rack ->
 * overhead -> rack -> knees -> floor. Rack and overhead targets are built lazily from thorax-frame offsets of the standing
 * body (front_squat.js rack idea: elbows forward and high), then converted to world points.
 * Floor setup uses the deadlift template's geometry (trunk ~66, hip ~132, knee ~76): with the rig's 0.56 m shoulder-to-grip
 * the spec setup (trunk 45, hip 85, knee 105) leaves the bar ~25 cm out of reach (see conventional_deadlift.js).
 * The clean is shown ~2x slower than real (qa rejects > 6 cm per 1/30 s); noAvoid in every pose (a boolean that changed
 * between keys would snap mid-move; the rack needs it, as in front_squat.js). */
(function () {
  const BX = 0.095, Z = 0.25;
  const BAR = (x, y) => ({ handL: { at: [x, y, -Z] }, handR: { at: [x, y, Z] } });
  const CTX = { anchorX: ['ankleL', 'ankleR'], plant: ['ankleL', 'ankleR'] };
  const C = { abd: 6, hrot: 8, noAvoid: true, palm: 'down' };
  const floor = Object.assign({}, C, { trunk: 66, hip: 132, knee: 76, neck: -22, protract: 0.06, shrug: -0.05, elbowPole: [0.35, -0.15, 1], ik: BAR(BX, 0.225) });
  const knee = Object.assign({}, C, { trunk: 55, hip: 80, knee: 25, neck: -14, protract: 0.03, shrug: -0.02, elbowPole: [0.35, -0.15, 1], ik: BAR(BX, 0.568) });

  function build(mistakes) {
    const { solve, expand, V } = FB;
    const world = (p, h) => { const s = solve(expand(Object.assign({}, p, { ik: undefined })), CTX); const T = s.F.thorax;
      const o = V.add(s.J.chest, V.add(V.add(V.mul(T[0], h[0]), V.mul(T[1], h[1])), [0, 0, 0])); return [o[0], o[1]]; };
    const rack = Object.assign({}, C, { trunk: 2, hip: 6, knee: 10, neck: 2, elbowPole: [0.35, -0.15, 1], sh: 90, el: 130 });
    const r = world(rack, [0.2, 0.12]); rack.ik = BAR(r[0], r[1]);
    const top = Object.assign({}, C, { trunk: -3, hip: -3, knee: 0, neck: 0, shrug: 0.02, elbowPole: [0.35, -0.15, 1] });
    const t = world(top, [-0.03, 0.74]); top.ik = BAR(t[0], t[1]);
    return { floor, knee, rack, top };
  }

  window.EXERCISE = {
    id: 'clean_and_press',
    name: { tr: 'Clean and Press', en: 'Clean and Press', es: 'Cargada y press' },
    category: { tr: 'Tüm vücut · Güç', en: 'Full body · Power', es: 'Cuerpo completo · Potencia' },
    equipmentLabel: { tr: 'Barbell', en: 'Barbell', es: 'Barra' },
    muscles: ['glutes', 'hamstrings', 'quads', 'delts', 'upperback', 'triceps'],
    tempo: '1-1.5-1.5-1.5',
    tempoReps: 1,
    view: { yaw: 90, pitch: 6 },
    alt: { yaw: 30, pitch: 8, title: { tr: 'Önden çapraz', en: 'Front angle', es: 'Vista frontal' },
      text: { tr: 'Bar vücuda yakın, dikey yolda', en: 'Bar close to the body, vertical path', es: 'Barra cerca del cuerpo, trayectoria vertical' } },
    setupMarks: [{ type: 'span', joints: ['ankleR', 'ankleL'], label: { tr: 'Kalça genişliği', en: 'Hip width', es: 'Ancho de cadera' } }],
    props: [['barbell', { grip: 'pronated' }]],
    ctx: CTX,
    get poses() { return this._poses || (this._poses = build()); },
    rest: 'floor',
    rep: [
      { to: 'knee', dur: 1.0, phase: 0 },
      { to: 'rack', dur: 1.3, phase: 1 },
      { to: 'top', dur: 1.5, phase: 2 },
      { to: 'rack', dur: 1.5, phase: 3 },
      { to: 'knee', dur: 1.3, phase: 4 },
      { to: 'floor', dur: 1.0, phase: 4 },
    ],
    setup: { tr: 'Bar orta ayak üstünde, kaval bara yakın. Tutuş dizlerin hemen dışında, sırt düz, kollar düz.',
      en: 'Bar over mid-foot, shins close. Grip just outside the knees, flat back, straight arms.',
      es: 'Barra sobre el medio pie, tibias cerca. Agarre fuera de las rodillas, espalda recta, brazos rectos.' },
    phases: [
      { name: { tr: 'Dizlere çek', en: 'Pull to the knees', es: 'Tira a las rodillas' }, breath: 'hold', line: ['pelvis', 'neck'],
        text: { tr: 'Bacaklarla it, sırt açısı aynı.', en: 'Push with the legs, same back angle.', es: 'Empuja con las piernas, misma espalda.' } },
      { name: { tr: 'Kalçayı patlat, rack', en: 'Snap the hips, rack it', es: 'Cadera explosiva, al rack' }, breath: 'out',
        text: { tr: 'Kalçayı aç, barın altına gir, dirsekler önde.', en: 'Snap the hips, get under the bar, elbows high.', es: 'Abre la cadera, métete bajo la barra, codos altos.' } },
      { name: { tr: 'Başın üstüne it', en: 'Press overhead', es: 'Press arriba' }, breath: 'out', arc: ['hipR', 'shoulderR', 'elbowR'],
        text: { tr: 'Yüze yakın dik it, kollar kilitli.', en: 'Press up close to the face, lock out.', es: 'Empuja cerca de la cara, bloquea.' } },
      { name: { tr: 'Omuzlara indir', en: 'Lower to the shoulders', es: 'Baja a los hombros' }, breath: 'in',
        text: { tr: 'Kontrollü şekilde omuzlara indir.', en: 'Lower to the shoulders with control.', es: 'Baja a los hombros con control.' } },
      { name: { tr: 'Yere bırak', en: 'Back to the floor', es: 'Al suelo' }, breath: 'in',
        text: { tr: 'Kalçadan katlan, sırt düz.', en: 'Hinge with a flat back.', es: 'Bisagra, espalda recta.' } },
    ],
    tempoText: { tr: 'Gerçekte clean ~1 sn · burada yavaş çekim', en: 'Real clean ~1 s · shown in slow motion', es: 'Cargada real ~1 s · a cámara lenta' },
    mistakes: [
      { title: { tr: 'Çekişte sırt yuvarlanıyor', en: 'Rounded back in the pull', es: 'Espalda redonda al tirar' },
        fix: { tr: 'Karnı sık, göğüs yukarı', en: 'Brace, chest up', es: 'Abdomen firme, pecho arriba' },
        fixText: { tr: 'Omurga nötr, kalça ve omuz birlikte yükselir', en: 'Neutral spine; hips and shoulders rise together', es: 'Columna neutra; cadera y hombros suben juntos' },
        at: 'floor', pose: { trunk: 60, hip: 124, lumbar: 12, thoracic: 15, neck: -14 }, line: ['pelvis', 'waist', 'neck'], goodLine: ['pelvis', 'neck'], parts: ['waist', 'chest'] },
      { title: { tr: 'Bar önde yay çiziyor', en: 'Bar loops out front', es: 'La barra se aleja' },
        fix: { tr: 'Barı vücuda yakın tut', en: 'Keep the bar close', es: 'Barra pegada al cuerpo' },
        fixText: { tr: 'Önce kalça, kollar sonra; bar dikey çizgide', en: 'Hips first, arms last; bar on a vertical line', es: 'Primero cadera, brazos al final; barra vertical' },
        at: 'knee', pose: { trunk: 40, hip: 60, knee: 18, el: 30, ik: BAR(BX + 0.2, 0.72) }, marks: ['handR'], parts: ['upperR', 'foreR'] },
    ],
    cues: [{ tr: 'Nötr omurga', en: 'Neutral spine', es: 'Columna neutra' },
      { tr: 'Kalçayla patlat, bar yakın', en: 'Explode with the hips, bar close', es: 'Explota con la cadera, barra cerca' },
      { tr: 'Tepede kollar kilitli', en: 'Lock out overhead', es: 'Bloquea arriba' }],
  };
})();
