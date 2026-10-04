/* Battle ropes, alternating waves. Quarter squat (trunk ~25, hip ~55, knee ~50), feet planted wide, FK arms alternating
 * between "up" (shoulder flexion ~75, hand at chest height) and "down" (~20, hand at hip height).
 * Rope prop defined in this file (FB.PROPS._battleRope): each rope runs from the fist to an anchor post; its vertical shape is
 * a damped cosine scaled by how far that hand is above/below its mid height, so the rope bends with the hand (a standing-wave
 * look; the prop has no access to time, so the wave cannot travel). The anchor is 2.4 m away instead of 5-8 m so the
 * automatic framing (which includes every prop) keeps the athlete large.
 * Shown ~2x slower than the real ~2 Hz: at full speed the hands move > 6 cm per 1/30 s (qa limb-jump check). */
(function () {
  const { V } = FB;
  const AX = 2.4, MIDY = { v: 0.885 };
  FB.PROPS._battleRope = (sol) => {
    const out = [{ t: 'box', c: [AX + 0.05, 0.3, 0], s: [0.12, 0.6, 0.12], m: 'frame' }, { t: 'box', c: [AX + 0.05, 0.02, 0], s: [0.4, 0.04, 0.4], m: 'frameDark' }];
    for (const s of ['L', 'R']) {
      const h = sol.J['hand' + s], amp = (h[1] - MIDY.v) * 0.9;
      const A = [AX, 0.12, (s === 'L' ? -1 : 1) * 0.04];
      const pts = [V.add(h, [-0.06, 0.0, 0])];
      const n = 26;
      for (let i = 1; i <= n; i++) {
        const u = i / n, base = V.lerp(h, A, u);
        const sag = -0.32 * Math.sin(Math.PI * u) * (1 - u * 0.3);
        const wave = amp * Math.cos(u * Math.PI * 3.2) * Math.exp(-u * 1.6) * (1 - u);
        pts.push([base[0], Math.max(0.025, base[1] + sag + wave - (h[1] - A[1]) * 0 ), base[2]]);
      }
      out.push({ t: 'tube', pts, r: 0.019, m: 'rope' });
    }
    return out;
  };
  const LEGS = { trunk: 25, hip: 55, knee: 50, abd: 10, hrot: 10, neck: -18, lumbar: 0, palm: 'in', curl: 1 };
  const W = (r, l) => Object.assign({}, LEGS, { shR: r, shL: l, el: 32, shAbd: 8 });

  window.EXERCISE = {
    id: 'battle_ropes',
    name: { tr: 'Battle Rope', en: 'Battle Ropes', es: 'Cuerdas de batalla' },
    category: { tr: 'Kondisyon · Tüm vücut', en: 'Conditioning · Full body', es: 'Acondicionamiento · Cuerpo completo' },
    equipmentLabel: { tr: 'Battle rope', en: 'Battle ropes', es: 'Cuerdas de batalla' },
    muscles: ['delts', 'core', 'forearms', 'quads'],
    tempo: '20 s / 10 s',
    tempoReps: 4,
    repLabel: { tr: 'DALGA', en: 'WAVES', es: 'ONDAS' },
    view: { yaw: 90, pitch: 6 },
    alt: { yaw: 20, pitch: 8, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
      text: { tr: 'Dalgalar eşit, gövde sabit', en: 'Even waves, steady torso', es: 'Ondas iguales, tronco estable' } },
    setupView: { yaw: 35, pitch: 10 },
    setupMarks: [{ type: 'span', joints: ['ankleR', 'ankleL'], label: { tr: 'Omuzdan geniş', en: 'Wider than shoulders', es: 'Más que los hombros' } }],
    props: [['_battleRope']],
    ctx: { anchorX: ['ankleL', 'ankleR'], plant: ['ankleL', 'ankleR'] },
    poses: { wL: W(22, 72), wR: W(72, 22) },
    rest: 'wL',
    rep: [
      { to: 'wR', dur: 0.55, phase: 0 },
      { to: 'wL', dur: 0.55, phase: 0 },
    ],
    setup: { tr: 'İp uçlarını tut, çeyrek squat yap. Kalça geride, gövde ~25° öne, ayaklar omuzdan geniş.',
      en: 'Hold the rope ends in a quarter squat. Hips back, torso ~25° forward, feet wider than the shoulders.',
      es: 'Sujeta los extremos en cuarto de sentadilla. Cadera atrás, torso ~25° adelante, pies anchos.' },
    phases: [
      { name: { tr: 'Dalga yap', en: 'Make waves', es: 'Haz ondas' }, breath: 'out', line: ['ankleR', 'kneeR', 'hipR'],
        text: { tr: 'Kollar sırayla: biri göğse kalkarken diğeri kalçaya iner. Squat\'ta kal.', en: 'Alternate: one hand rises to the chest as the other drops to the hip. Stay low.', es: 'Alterna: una mano sube al pecho y la otra baja a la cadera. Quédate abajo.' } },
    ],
    tempoText: { tr: '20 sn çalış · 10 sn dinlen · burada yavaş çekim', en: '20 s work · 10 s rest · shown in slow motion', es: '20 s trabajo · 10 s descanso · a cámara lenta' },
    mistakes: [
      { title: { tr: 'Dik durmak', en: 'Standing upright', es: 'Quedarse erguida' },
        fix: { tr: 'Çeyrek squat\'ta kal', en: 'Stay in the quarter squat', es: 'Mantén el cuarto de sentadilla' },
        fixText: { tr: 'Dizler bükülü, kalça geride; güç bacaklardan', en: 'Knees bent, hips back; power from the legs', es: 'Rodillas flexionadas, cadera atrás' },
        at: 'wR', pose: { trunk: 4, hip: 8, knee: 6, neck: -2 }, line: ['ankleR', 'kneeR', 'hipR'], marks: ['kneeR'], parts: ['thigh', 'shin'] },
      { title: { tr: 'Sırt yuvarlanıyor', en: 'Rounded back', es: 'Espalda redondeada' },
        fix: { tr: 'Göğüs açık, sırt düz', en: 'Chest up, flat back', es: 'Pecho arriba, espalda recta' },
        fixText: { tr: 'Nötr omurga, karın sıkı', en: 'Neutral spine, core tight', es: 'Columna neutra, abdomen firme' },
        at: 'wR', pose: { lumbar: 16, thoracic: 26, neck: 4, trunk: 22 }, line: ['pelvis', 'waist', 'neck'], goodLine: ['pelvis', 'neck'], parts: ['waist', 'chest'] },
    ],
    cues: [{ tr: 'Squat\'ta alçak kal', en: 'Stay low in the squat', es: 'Quédate abajo' },
      { tr: 'Dalgalar omuzdan', en: 'Waves come from the shoulders', es: 'Las ondas salen del hombro' },
      { tr: 'Karın sıkı, dalgalar eşit', en: 'Core tight, even waves', es: 'Abdomen firme, ondas iguales' }],
  };
})();
