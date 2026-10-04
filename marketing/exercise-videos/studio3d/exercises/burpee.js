/* Burpee (push-up + jump). Side view, a flow (maxDuration 80). The loop starts in the high plank (rest): the mistake
 * chapter morphs rest <-> mistake pose, which is only clean from plank-like poses (both mistakes are plank faults).
 *   plank -> push-up bottom -> plank -> jump in (kick / inAir / tuck airborne keys) -> squat, palms down -> hands lift ->
 *   rise -> jump, arms overhead -> soft landing -> sink -> reach down -> squat, palms down -> jump back (tuck / inAir /
 *   kick) -> plank
 * Placement: the pelvis is anchored at x 0 and every pose gets a numeric `pos` (interpolates) computed once the rig has set
 * FB.BODY: feet on one floor spot F (x 0) in the standing keys, palms on one spot H, toes on one spot T (plank / bottom).
 * Airborne keys: the shoulders stay exactly where they are in the plank (body height from the planted wrist, ground
 * [handR]; the trunk pivots about the shoulders, hips rise, the arm keeps its angle to the floor) and only the legs fold, so
 * the palms never lift while the feet fly through the air. Plank uses the same contact (no contact-set switch in the jump).
 * Feet: ankle IK targets in every pose (standing keys at exactly +-0.19 m), so the stance never slides sideways.
 * Hands: IK targets in every pose. Planted keys use the flat weight-bearing hand; the free keys (lift, rise, jump, landing,
 * sink, reach) use handFlat:false with targets from the FK arms (slightly bent elbows, away from the straight-arm IK
 * singularity). The flat <-> free switch happens between squat and lift/reach, whose targets are the hand continuing the
 * forearm from the flat-hand wrist, so the elbow does not pop. noAvoid everywhere (the torso-avoid swivel popped the
 * elbows while the arms swing past the body).
 * Rig limits: shoulder-to-wrist is 0.50 m, so the palms only reach the floor in a squat whose shoulders are ~0.50 m high:
 * trunk ~80 / hip ~140 / knee 128 instead of the spec squat (55 / 115 / 120). Push-up bottom: chest joint 0.15 m -> elbow
 * ~117° (spec 95, chest ~3 cm from the floor; the rig's short arms fold more for the same chest height).
 * The whole burpee is shown ~2.5x slower than real (qa rejects > 6 cm per 1/30 s; the tempo card says so). */
(function () {
  const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };
  const HZ = 0.235;        // palms a little wider than the shoulders
  const AIR = 0.17;        // jump height (feet off the floor)
  const RAW = {
    plank: { trunk: 68, hip: 0, knee: 0, ankle: -38, abd: 4, neck: -8, sh: 68, shAbd: 12, el: 0, flat: false, handFlat: true,
      ground: [['handR', 0], ['toeR', 0]], elbowPole: [-0.3, -1, 0.75] },
    bottom: { trunk: 82, hip: 0, knee: 0, ankle: -30, abd: 4, neck: -6, sh: 30, shAbd: 25, el: 95, flat: false, handFlat: true,
      ground: [['chest', 0.15], ['toeR', 0]], elbowPole: [-0.3, -1, 0.75] },
    // feet in the air on the way in / back: hips high, knees tucked, hands planted
    inAir: { trunk: 75, hip: 112, knee: 118, ankle: -15, abd: 10, neck: -12, sh: 70, shAbd: 12, el: 4, flat: false, handFlat: true,
      ground: [['toeR', 0.2]], elbowPole: [-0.3, -1, 0.75] },
    squat: { trunk: 70, hip: 132, knee: 128, abd: 14, hrot: 22, neck: -24, sh: 80, shAbd: 12, el: 10, flat: false, handFlat: true,
      ground: [['toeR', 0]], elbowPole: [-0.3, -1, 0.75] },
    lift: { trunk: 55, hip: 110, knee: 112, abd: 12, hrot: 18, neck: -14, sh: 70, shAbd: 10, el: 8, flat: false, handFlat: false,
      ground: [['toeR', 0]], elbowPole: [-0.3, -1, 0.75], palm: 'back', curl: 0.2 },
    rise: { trunk: 22, hip: 40, knee: 42, abd: 8, hrot: 8, neck: -4, sh: 125, shAbd: 8, el: 18, flat: false, handFlat: false,
      ground: [['toeR', 0]], elbowPole: [-0.3, -1, 0.75], palm: 'down', curl: 0.25 },
    air: { trunk: 0, hip: 4, knee: 6, ankle: -34, abd: 4, neck: -2, sh: 172, shAbd: 8, el: 12, flat: false, handFlat: false,
      ground: [['toeR', 0]], elbowPole: [-0.3, -1, 0.75], palm: 'forward', curl: 0.25 },
    land: { trunk: 14, hip: 34, knee: 34, abd: 6, hrot: 6, neck: 0, sh: 115, shAbd: 10, el: 18, flat: false, handFlat: false,
      ground: [['toeR', 0]], elbowPole: [-0.3, -1, 0.75], palm: 'down', curl: 0.25 },
    sink: { trunk: 40, hip: 80, knee: 80, abd: 10, hrot: 9, neck: -10, sh: 95, shAbd: 10, el: 18, flat: false, handFlat: false,
      ground: [['toeR', 0]], elbowPole: [-0.3, -1, 0.75], palm: 'down', curl: 0.25 },
    reach: { trunk: 64, hip: 122, knee: 122, abd: 14, hrot: 22, neck: -22, sh: 80, shAbd: 12, el: 10, flat: false, handFlat: false,
      ground: [['toeR', 0]], elbowPole: [-0.3, -1, 0.75], palm: 'back', curl: 0.2 },
  };

  function build(ex) {
    const { solve, expand, V, BODY: B } = FB;
    const S = (p) => solve(expand(Object.assign({}, p, { ik: undefined, pos: undefined })), CTX);
    const bis = (f, lo, hi) => { let flo = f(lo); for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2, fm = f(m); if ((fm > 0) === (flo > 0)) { lo = m; flo = fm; } else hi = m; } return (lo + hi) / 2; };
    const feetX = (J) => (J.ankleL[0] + J.ankleR[0]) / 2;
    // feet flat with flat:false (no boolean switch): dorsiflexion = shin tilt from vertical
    // feet stay on one stance width in every standing pose (no sideways sliding): abduction fitted to the ankle z
    const STANCE = 0.19;
    const fitStance = (p) => { p.abd = +bis((a) => S(Object.assign({}, p, { abd: a })).J.ankleR[2] - STANCE, -10, 45).toFixed(2); return p; };
    const heelDown = (p) => { const J = S(Object.assign({}, p, { ankle: 0 })).J, d = V.sub(J.kneeR, J.ankleR); p.ankle = Math.atan2(d[0], d[1]) * 180 / Math.PI; };
    const P = {};
    // squat: thigh angle kept, trunk tipped until the shoulders are low enough for the palms to reach the floor
    const squat = Object.assign({}, RAW.squat);
    { const th = squat.hip - squat.trunk;
      const t = bis((tr) => { const q = Object.assign({}, squat, { trunk: tr, hip: tr + th }); heelDown(q); return S(q).J.shoulderR[1] - 0.505; }, 40, 89);
      squat.trunk = +t.toFixed(2); squat.hip = +(t + th).toFixed(2); heelDown(squat); }
    const sq = S(squat);
    const sqPos = [-feetX(sq.J), 0, 0];
    // palm spot H: the wrist at ~97% reach in front of the shoulder (arm slightly bent)
    const WY = 0.042, sh = V.add(sq.J.shoulderR, sqPos);
    const reach = (B.upper + B.fore) * 0.97;
    const wristX = sh[0] + Math.sqrt(Math.max(0, reach * reach - (sh[1] - WY) ** 2 - (HZ - sh[2]) ** 2));
    const HX = wristX + B.hand * 0.6;
    const H = { L: [HX, 0, -HZ], R: [HX, 0, HZ] };
    const planted = { handL: { at: H.L }, handR: { at: H.R } };
    P.squat = Object.assign(squat, { pos: sqPos, ik: planted, handSurface: 0 });
    // plank: wrists over the H spot -> toe spot T
    // shoulder at (almost) full reach from the planted wrist: straight arms
    const onH = (p, r = (B.upper + B.fore) * 0.998) => { const s = S(p), q = s.J.shoulderR;
      return [wristX + Math.sqrt(Math.max(0, r * r - (q[1] - WY) ** 2 - (HZ - q[2]) ** 2)) - q[0], 0, 0]; };
    P.plank = Object.assign({}, RAW.plank, { ik: planted, handSurface: 0 }); P.plank.pos = onH(P.plank);
    const TX = S(P.plank).J.toeR[0] + P.plank.pos[0];
    const onT = (p) => [TX - S(p).J.toeR[0], 0, 0];
    // every pose rests on the single contact [toeR] (no contact-set switch between keys, which blended two solutions and
    // lifted the palms): two-contact floor poses are converted to the equivalent trunk angle (pilates_push_up.js toSingle)
    const toSingle = (p, j) => { const y = S(p).J[j][1], q = Object.assign({}, p, { ground: [['toeR', 0]] }), t0 = q.trunk;
      q.trunk = +bis((d) => S(Object.assign({}, q, { trunk: d })).J[j][1] - y, t0 - 35, t0 + 35).toFixed(3); q.pos = onT(q); return q; };
    P.plank = toSingle(P.plank, 'wristR');
    P.bottom = toSingle(Object.assign({}, RAW.bottom, { ik: planted, handSurface: 0 }), 'chest');
    // airborne keys of the jump in / back: the shoulders stay where they are in the plank (body height set by the planted
    // wrist: ground [handR]; pos keeps the shoulder x); the trunk pivots about the shoulders (hips rise, arm angle to the
    // floor kept: sh + dT) until the toes are `y` above the floor; hips/knees fold, the feet fly forward. The plank uses the
    // same contact (no contact-set switch inside the jump).
    P.plank.ground = [['handR', 0]];
    const shP = V.add(S(P.plank).J.shoulderR, P.plank.pos);
    const airKey = (o, y) => {
      const at = (dT) => { const q = Object.assign({}, P.plank, { abd: 8 }, o, { trunk: P.plank.trunk + dT, sh: RAW.plank.sh + dT });
        const s = S(q); q.pos = [shP[0] - s.J.shoulderR[0], 0, 0]; return { q, toe: s.J.toeR[1] }; };
      const dT = bis((d) => at(d).toe - y, 0, 60); return at(dT).q; };
    P.hover = airKey({ hip: 0, knee: 0, ankle: RAW.plank.ankle }, 0.08);   // straight body pivoted about the shoulders: toes 8 cm straight up over the plank toe spot
    P.kick = airKey({ hip: 38, knee: 45, ankle: -35 }, 0.08);
    P.inAir = airKey({ hip: 85, knee: 100, ankle: -25, abd: 10 }, 0.27);
    P.tuck = airKey({ hip: 118, knee: 122, ankle: 8, abd: 12 }, 0.12);
    // free-hand keys: feet on F (x 0), hands where the FK arms put them
    const onF = (p, y = 0) => { const s = S(p); return [-feetX(s.J), y, 0]; };
    const fkHands = (p) => { const s = S(p); return { handL: { at: V.add(s.J.handL, p.pos) }, handR: { at: V.add(s.J.handR, p.pos) } }; };
    for (const k of ['rise', 'air', 'land', 'sink']) { const p = fitStance(Object.assign({}, RAW[k])); if (k !== 'air') heelDown(p); p.pos = onF(p, k === 'air' ? AIR : 0); p.ik = fkHands(p); P[k] = p; }
    // lift / reach: the hand continues the forearm from the flat-hand wrist (palm just off the floor), so the flat <-> free
    // switch moves only the fingers, not the wrist or elbow
    for (const k of ['lift', 'reach']) {
      const p = Object.assign({}, RAW[k]); heelDown(p); p.pos = onF(p);
      const s = S(p), shw = V.add(s.J.shoulderR, p.pos);
      const tgt = (z) => { const w = [wristX, WY + 0.04, z]; const d = V.norm(V.sub(w, [shw[0], shw[1], Math.sign(z) * Math.abs(shw[2])])); return V.add(w, V.mul(d, B.hand * 0.55)); };
      p.ik = { handL: { at: tgt(-HZ) }, handR: { at: tgt(HZ) } };
      P[k] = p;
    }
    for (const k in P) P[k].noAvoid = true;   // the torso-avoid swivel popped the elbows while the arms swing past the body
    // feet: ankle IK targets in EVERY pose (FK ankle + pos; standing keys at exactly +-STANCE), so the stance never slides
    // sideways and the knees follow their FK direction (auto knee pole) instead of caving in when the feet are narrow
    const ankles = (p, standing) => { const s = S(p), o = p.pos || [0, 0, 0];
      const a = (j, sg) => { const q = V.add(s.J[j], o); if (standing) q[2] = sg * STANCE; return { at: q }; };
      return { ankleL: a('ankleL', -1), ankleR: a('ankleR', 1) }; };
    const pinFeet = (p, standing) => { p.ik = Object.assign({}, p.ik, ankles(p, standing)); return p; };
    const STANDING = ['squat', 'lift', 'rise', 'land', 'sink', 'reach'];
    for (const k in P) pinFeet(P[k], STANDING.includes(k));
    // hop: the squat with both feet 12 cm straight above their spots (hands stay planted): the jump in lands / the jump back takes off vertically
    const up = (a) => ({ at: [a.at[0], a.at[1] + 0.08, a.at[2]] });
    P.hop = Object.assign({}, P.squat, { ik: Object.assign({}, P.squat.ik, { ankleL: up(P.squat.ik.ankleL), ankleR: up(P.squat.ik.ankleR) }) });
    // mistakes: re-place on the same hand / toe spots
    for (const mk of ex.mistakes) {
      const m = Object.assign({}, RAW[mk.at], mk.pose);
      if (mk.at === 'plank') m.pos = onH(m);
      const q = toSingle(m, mk.at === 'plank' ? 'wristR' : 'chest');
      Object.assign(mk.pose, { trunk: q.trunk, ground: q.ground, pos: q.pos, ik: Object.assign({}, P[mk.at].ik, ankles(q, false)) });
    }
    MAT_AT = [(TX + HX) / 2 + 0.05, 0, 0];
    return P;
  }
  let MAT_AT = [0, 0, 0];

  window.EXERCISE = {
    id: 'burpee',
    name: { tr: 'Burpee', en: 'Burpee', es: 'Burpee' },
    category: { tr: 'Kondisyon · Tüm vücut', en: 'Conditioning · Full body', es: 'Acondicionamiento · Cuerpo completo' },
    equipmentLabel: { tr: 'Vücut ağırlığı', en: 'Bodyweight', es: 'Peso corporal' },
    muscles: ['quads', 'chest', 'triceps', 'delts', 'core', 'glutes'],
    tempo: '0.5-0.4-1-0.4-0.6',
    tempoReps: 1,
    maxDuration: 80,
    view: { yaw: 90, pitch: 6 },
    alt: { yaw: 35, pitch: 12, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
      text: { tr: 'Yumuşak iniş: dizler bükülür, topuklar yere', en: 'Soft landing: knees bend, heels down', es: 'Aterrizaje suave: rodillas flexionadas' } },
    contacts: ['ballR', 'ballL', 'handR', 'handL'],
    get props() { void this.poses; return [['mat', { at: MAT_AT, length: 2.0 }]]; },
    ctx: CTX,
    get poses() { return this._poses || (this._poses = build(this)); },
    rest: 'plank',
    rep: [
      { to: 'bottom', dur: 1.1, phase: 0 },
      { to: 'plank', dur: 0.8, phase: 1 },
      { to: 'hover', dur: 0.2, phase: 2, card: false },
      { to: 'kick', dur: 0.35, phase: 2 },
      { to: 'inAir', dur: 0.3, phase: 2, card: false },
      { to: 'tuck', dur: 0.3, phase: 2, card: false },
      { to: 'hop', dur: 0.3, phase: 2, card: false },
      { to: 'squat', dur: 0.3, phase: 2, card: false },
      { to: 'lift', dur: 0.5, phase: 2, card: false },
      { to: 'rise', dur: 1.05, phase: 2, card: false },
      { to: 'air', dur: 0.85, phase: 3 },
      { to: 'land', dur: 0.75, phase: 3, card: false },
      { to: 'sink', dur: 0.5, phase: 3, card: false },
      { to: 'reach', dur: 0.6, phase: 4 },
      { to: 'squat', dur: 0.35, phase: 4, card: false },
      { to: 'hop', dur: 0.3, phase: 5, card: false },
      { to: 'tuck', dur: 0.35, phase: 5 },
      { to: 'inAir', dur: 0.3, phase: 5, card: false },
      { to: 'kick', dur: 0.3, phase: 5, card: false },
      { to: 'hover', dur: 0.2, phase: 5, card: false },
      { to: 'plank', dur: 0.3, phase: 5, card: false },
    ],
    setup: { tr: 'Döngü burada yüksek plankta başlar: eller omuz altında, vücut tek çizgi.', en: 'Here the loop starts in a high plank: hands under the shoulders, body in one line.', es: 'Aquí el ciclo empieza en plancha alta: manos bajo los hombros, cuerpo en línea.' },
    phases: [
      { name: { tr: 'Şınav', en: 'Push-up', es: 'Flexión' }, breath: 'in', line: ['ankleR', 'pelvis', 'shoulderR'],
        text: { tr: 'Göğsü yere kadar indir, dirsekler ~45°.', en: 'Chest to the floor, elbows ~45°.', es: 'Pecho al suelo, codos a ~45°.' } },
      { name: { tr: 'Yukarı it', en: 'Push up', es: 'Empuja' }, breath: 'out',
        text: { tr: 'Vücut tek parça halinde yukarı.', en: 'Push up in one piece.', es: 'Sube en bloque.' } },
      { name: { tr: 'Ayaklar öne', en: 'Feet in', es: 'Pies adelante' }, breath: 'out',
        text: { tr: 'Ayakları ellerin arkasına zıplat, çömel.', en: 'Jump the feet in behind the hands, squat.', es: 'Salta con los pies hacia las manos.' } },
      { name: { tr: 'Zıpla', en: 'Jump', es: 'Salta' }, breath: 'out',
        text: { tr: 'Patlayıcı zıpla, kollar yukarı. Yumuşak in.', en: 'Explode up, arms overhead. Land softly.', es: 'Salta explosiva, brazos arriba. Aterriza suave.' } },
      { name: { tr: 'Çömel, eller yere', en: 'Squat, hands down', es: 'Agáchate, manos al suelo' }, breath: 'in',
        text: { tr: 'Dizleri bük, avuçları ayakların önüne koy.', en: 'Bend the knees, palms down in front of the feet.', es: 'Flexiona y apoya las palmas delante de los pies.' } },
      { name: { tr: 'Ayaklar geriye', en: 'Feet back', es: 'Pies atrás' }, breath: 'hold',
        text: { tr: 'Ayakları geri at, yüksek plank. Kalça düz.', en: 'Jump the feet back to a high plank. Hips level.', es: 'Salta atrás a plancha alta. Cadera nivelada.' } },
    ],
    tempoText: { tr: 'Gerçekte ~3 sn\'de bir burpee · burada yavaş çekim', en: 'Real pace ~3 s per burpee · shown in slow motion', es: 'Ritmo real ~3 s por burpee · a cámara lenta' },
    mistakes: [
      { title: { tr: 'Plankta kalça çöküyor', en: 'Hips sag in the plank', es: 'La cadera se hunde' },
        fix: { tr: 'Karnı ve kalçayı sık', en: 'Brace abs and glutes', es: 'Aprieta abdomen y glúteos' },
        fixText: { tr: 'Omuz, kalça, ayak bileği tek çizgi', en: 'Shoulder, hip, ankle in one line', es: 'Hombro, cadera y tobillo en línea' },
        at: 'plank', pose: { hip: -14, lumbar: -10 }, line: ['ankleR', 'pelvis', 'shoulderR'], parts: ['pelvis', 'waist'] },
      { title: { tr: 'Şınavı yarım yapmak', en: 'Half push-up', es: 'Flexión a medias' },
        fix: { tr: 'Göğüs yere', en: 'Chest to the floor', es: 'Pecho al suelo' },
        fixText: { tr: 'Her tekrarda tam şınav', en: 'A full push-up every rep', es: 'Flexión completa cada vez' },
        at: 'bottom', pose: { trunk: 74, sh: 48, el: 40, ground: [['chest', 0.28], ['toeR', 0]] }, marks: ['chest'], parts: ['upperR', 'foreR'] },
    ],
    cues: [{ tr: 'Göğüs yere', en: 'Chest to the floor', es: 'Pecho al suelo' },
      { tr: 'Plankta kalça düz', en: 'Hips level in the plank', es: 'Cadera nivelada en plancha' },
      { tr: 'Yumuşak iniş', en: 'Land softly', es: 'Aterriza suave' }],
  };
})();
