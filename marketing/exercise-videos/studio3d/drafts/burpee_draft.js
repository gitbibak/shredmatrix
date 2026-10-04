/* Burpee (with push-up and jump). The contacts change in every phase, so nothing is planted through ctx.plant:
 * - the pelvis is anchored at x 0 and every pose gets a `pos` offset (numeric, so it interpolates) computed once the rig
 *   has set FB.BODY: feet stay on their standing spot in stand/squat/jump, hands land on one floor spot H in
 *   squat/plank/push-up, toes stay on one spot between plank and push-up bottom.
 * - both hands carry IK targets in every pose (overhead in the jump) so no target appears or disappears between keys.
 *   `handFlat` stays on in every pose (a boolean snaps at mid-transition and popped the wrist/elbow 8-9 cm); in the jump
 *   only the support height `handSurface` rises with the hands (numeric, interpolates), so the hands reach up palm-down.
 * Engine limit: every rep entry gets its own step card (>= 2.9 s), so the jump back / jump in have no separate airborne
 * key (that would push the video past 60 s); the feet travel low along the floor between squat and plank (a fast
 * "step/jump back"). The whole burpee is shown ~2x slower than real (qa rejects > 6 cm per 1/30 s). */
(function () {
  const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };
  const RAW = {
    stand: { elbowPole: [-0.6, -0.6, 0.6], trunk: 0, hip: 0, knee: 0, abd: 5, neck: 0, sh: 0, shAbd: 8, el: 8, palm: 'in', curl: 0.4, handFlat: false },
    squat: { elbowPole: [-0.6, -0.6, 0.6], trunk: 58, hip: 122, knee: 128, ankle: 32, flat: false, ground: [['toeR', 0]], abd: 12, hrot: 10, neck: -20, sh: 80, el: 4, handFlat: true },
    plank: { trunk: 68, hip: 0, knee: 0, ankle: -38, abd: 4, neck: -8, sh: 68, shAbd: 12, el: 0, flat: false, handFlat: true,
      ground: [['handR', 0], ['toeR', 0]], elbowPole: [-0.3, -1, 0.75] },
    bottom: { trunk: 82, hip: 0, knee: 0, ankle: -30, abd: 4, neck: -6, sh: 30, shAbd: 25, el: 95, flat: false, handFlat: true,
      ground: [['chest', 0.11], ['toeR', 0]], elbowPole: [-0.3, -1, 0.75] },
    air: { elbowPole: [-0.6, -0.6, 0.6], ground: [['toeR', 0]], trunk: 0, hip: 4, knee: 6, ankle: -32, flat: false, abd: 4, neck: -4, sh: 150, shAbd: 10, el: 22, curl: 0.3, handFlat: true },
  };

  function build(mistakes) {
    const { solve, expand, V } = FB;
    const sv = (p) => solve(expand(Object.assign({}, p, { ik: undefined, pos: undefined })), CTX);
    const st = sv(RAW.stand);
    const feetX = (st.J.ankleL[0] + st.J.ankleR[0]) / 2;
    const P = {};
    // stand: hands where FK puts them
    // squat: feet on the standing spot, hands on the floor just in front of the feet
    // squat feet flat without the boolean `flat` (it snaps at mid-transition): dorsiflexion = shin tilt
    { const q = sv(RAW.squat), d = V.sub(q.J.kneeR, q.J.ankleR); RAW.squat.ankle = Math.atan2(d[0], d[1]) * 180 / Math.PI; }
    const sq = sv(RAW.squat), sqDx = feetX - (sq.J.ankleL[0] + sq.J.ankleR[0]) / 2;
    const H = { L: [feetX + 0.42, 0, -0.2], R: [feetX + 0.42, 0, 0.2] };
    P.squat = Object.assign({}, RAW.squat, { pos: [sqDx, 0, 0], ik: { handL: { at: H.L }, handR: { at: H.R } } });
    // plank: hands on H (wrist above the palm: shift by the FK wrist -> palm offset)
    const pl = sv(RAW.plank), plDx = H.R[0] - pl.J.wristR[0] + 0.05;
    P.plank = Object.assign({}, RAW.plank, { pos: [plDx, 0, 0], ik: { handL: { at: H.L }, handR: { at: H.R } } });
    const toeX = pl.J.toeR[0] + plDx;
    const bo = sv(RAW.bottom);
    P.bottom = Object.assign({}, RAW.bottom, { pos: [toeX - bo.J.toeR[0], 0, 0], ik: { handL: { at: H.L }, handR: { at: H.R } } });
    // jump: feet over the standing spot, 18 cm off the floor
    const ai = sv(RAW.air);
    P.air = Object.assign({}, RAW.air, { pos: [feetX - (ai.J.ankleL[0] + ai.J.ankleR[0]) / 2, 0.18, 0] });
    { const a = V.add(ai.J.handL, P.air.pos), b = V.add(ai.J.handR, P.air.pos); P.air.ik = { handL: { at: a }, handR: { at: b } }; P.air.handSurface = a[1] - 0.022; }
    for (const k of ['squat', 'plank', 'bottom']) P[k].handSurface = 0;
    for (const k in P) P[k].noAvoid = true;   // the torso-avoid swivel popped the elbow 7 cm while the body rises past the hands
    for (const [at, mp] of mistakes) {
      if (mp.sag) { const m = Object.assign({}, RAW[at], mp); delete m.sag; const s = sv(m); mp.pos = [H.R[0] - s.J.wristR[0] + 0.05, 0, 0]; delete mp.sag; }
      if (mp.half) { const m = Object.assign({}, RAW[at], mp); delete m.half; const s = sv(m); mp.pos = [toeX - s.J.toeR[0], 0, 0]; delete mp.half; }
    }
    return P;
  }

  window.EXERCISE = {
    id: 'burpee',
    name: { tr: 'Burpee', en: 'Burpee', es: 'Burpee' },
    category: { tr: 'Kondisyon · Tüm vücut', en: 'Conditioning · Full body', es: 'Acondicionamiento · Cuerpo completo' },
    equipmentLabel: { tr: 'Vücut ağırlığı', en: 'Bodyweight', es: 'Peso corporal' },
    muscles: ['quads', 'chest', 'triceps', 'core', 'glutes'],
    tempo: '0.5-0.4-1-0.4-0.6',
    tempoReps: 1,
    view: { yaw: 90, pitch: 6 },
    alt: { yaw: 35, pitch: 12, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
      text: { tr: 'Plankta kalça düz, göğüs yere', en: 'Hips level in the plank, chest to the floor', es: 'Cadera nivelada, pecho al suelo' } },
    contacts: ['ballR', 'ballL'],
    props: [['mat', { at: [-0.3, 0, 0], length: 2.0 }]],
    ctx: CTX,
    get poses() { return this._poses || (this._poses = build(this.mistakes.map((m) => [m.at, m.pose]))); },
    // the loop starts in the plank: after each mistake the engine returns to the rest pose in 0.9 s, which is only smooth
    // from plank-like poses (both mistakes are plank faults)
    rest: 'plank',
    rep: [
      { to: 'bottom', dur: 1.1, phase: 0 },
      { to: 'plank', dur: 0.9, phase: 1 },
      { to: 'squat', dur: 1.0, phase: 2 },
      { to: 'air', dur: 2.0, phase: 3, ease: 'sine' },
      { to: 'squat', dur: 2.2, phase: 4, ease: 'sine' },
      { to: 'plank', dur: 1.0, phase: 5 },
    ],
    setup: { tr: 'Burada döngü yüksek plankta başlar: eller omuz altında, vücut tek çizgi.', en: 'Here the loop starts in a high plank: hands under the shoulders, body in one line.', es: 'Aquí el ciclo empieza en plancha alta: manos bajo los hombros, cuerpo en línea.' },
    phases: [
      { name: { tr: 'Şınav', en: 'Push-up', es: 'Flexión' }, breath: 'in', line: ['ankleR', 'pelvis', 'shoulderR'],
        text: { tr: 'Göğsü yere kadar indir, dirsekler ~45°.', en: 'Chest to the floor, elbows ~45°.', es: 'Pecho al suelo, codos a ~45°.' } },
      { name: { tr: 'Yukarı it', en: 'Push up', es: 'Empuja' }, breath: 'out',
        text: { tr: 'Tek parça halinde yukarı it.', en: 'Push up in one piece.', es: 'Sube en bloque.' } },
      { name: { tr: 'Ayaklar öne', en: 'Feet in', es: 'Pies adelante' }, breath: 'out',
        text: { tr: 'Ayakları ellere doğru getir.', en: 'Jump the feet in to the hands.', es: 'Salta con los pies hacia las manos.' } },
      { name: { tr: 'Zıpla', en: 'Jump', es: 'Salta' }, breath: 'out',
        text: { tr: 'Patlayıcı zıpla, kollar yukarı.', en: 'Explode up, arms reaching up.', es: 'Salta explosiva, brazos arriba.' } },
      { name: { tr: 'Çömel, eller yere', en: 'Squat, hands down', es: 'Agáchate, manos al suelo' }, breath: 'in',
        text: { tr: 'Yumuşak in, çömel, avuçlar yere.', en: 'Land soft, squat, palms to the floor.', es: 'Aterriza suave, agáchate, palmas al suelo.' } },
      { name: { tr: 'Ayaklar geriye', en: 'Feet back', es: 'Pies atrás' }, breath: 'hold',
        text: { tr: 'Ayakları geri at, yüksek plank. Kalça düz.', en: 'Jump the feet back to a high plank. Hips level.', es: 'Salta atrás a plancha alta. Cadera nivelada.' } },
    ],
    tempoText: { tr: 'Gerçekte ~3 sn\'de bir burpee · burada yavaş çekim', en: 'Real pace ~3 s per burpee · shown in slow motion', es: 'Ritmo real ~3 s por burpee · a cámara lenta' },
    mistakes: [
      { title: { tr: 'Plankta kalça çöküyor', en: 'Hips sag in the plank', es: 'La cadera se hunde' },
        fix: { tr: 'Karnı ve kalçayı sık', en: 'Brace abs and glutes', es: 'Aprieta abdomen y glúteos' },
        fixText: { tr: 'Omuz, kalça, ayak bileği tek çizgi', en: 'Shoulder, hip, ankle in one line', es: 'Hombro, cadera y tobillo en línea' },
        at: 'plank', pose: { hip: -14, lumbar: -10, sag: true }, line: ['ankleR', 'pelvis', 'shoulderR'], parts: ['pelvis', 'waist'] },
      { title: { tr: 'Şınavı atlamak', en: 'Skipping the push-up', es: 'Saltarse la flexión' },
        fix: { tr: 'Göğüs yere', en: 'Chest to the floor', es: 'Pecho al suelo' },
        fixText: { tr: 'Her tekrarda tam şınav', en: 'A full push-up every rep', es: 'Flexión completa cada vez' },
        at: 'bottom', pose: { trunk: 74, sh: 48, el: 40, ground: [['chest', 0.28], ['toeR', 0]], half: true }, marks: ['chest'], parts: ['upperR', 'foreR'] },
    ],
    cues: [{ tr: 'Göğüs yere', en: 'Chest to the floor', es: 'Pecho al suelo' },
      { tr: 'Plankta kalça düz', en: 'Hips level in the plank', es: 'Cadera nivelada en plancha' },
      { tr: 'Yumuşak iniş', en: 'Land softly', es: 'Aterriza suave' }],
  };
})();
