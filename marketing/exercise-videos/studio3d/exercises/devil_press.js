/* Devil press (dumbbell burpee + double-dumbbell swing to overhead). Side view, a flow (maxDuration 80).
 * Loop (rest = crouch with the hands on the dumbbells, which sit on the floor in front of the feet):
 *   crouch -> feet jump back (airborne keys) -> plank on the dumbbells -> push-up (chest between the dumbbells) -> plank ->
 *   feet jump in -> crouch -> dumbbells off the floor (hinge) -> hike between the legs -> hips snap, dumbbells swing up ->
 *   overhead lockout -> swing down between the legs -> dumbbells back on the floor.
 * Placement (burpee.js): pelvis anchored at x 0, numeric `pos` per pose so the feet use one spot F (crouch / swing poses),
 * the fists one spot D on the dumbbell handles (5.4 cm up = head radius) and the toes one spot T (plank / push-up).
 * Fists grip the handles in every pose (handFlat false: no flat <-> free switch). Floor poses: world IK on D; swing poses:
 * IK targets from the FK arms. Airborne keys keep the shoulders exactly over the dumbbells (trunk pivots about the
 * shoulders), so the fists never leave the handles while the feet fly.
 * Local prop `floorDB`: the stock dumbbell orients its handle by the grip/forearm; near the floor the handle is levelled so
 * both heads rest flat on the floor.
 * Rig limit: shoulder-to-fist is 0.54 m, so the fists reach dumbbells on the floor only from a deep crouch (shoulders
 * ~0.57 m high: trunk ~70, hips/knees ~125) instead of the spec hinge (trunk 45, hip 80, knee 50); the hinge is shown
 * once the dumbbells leave the floor ('hinge' / 'hike' keys).
 * Shown ~2.5x slower than real (qa rejects > 6 cm per 1/30 s; the tempo card says so). */
(function () {
  const { V } = FB;
  FB.PROPS.floorDB = FB.PROPS.floorDB || function (sol, o) {
    const out = FB.PROPS.dumbbell(sol, o);
    for (let i = 0; i < out.length; i += 3) {
      const s = (o.sides || ['L', 'R'])[i / 3], c = sol.J['hand' + s];
      const w = Math.max(0, Math.min(1, (0.2 - c[1]) / 0.1));
      if (w <= 0) continue;
      const ax = V.norm(V.sub(out[i].b, out[i].a)), flat = [ax[0], 0, ax[2]];
      if (V.len(flat) < 1e-3) continue;
      const want = V.norm(V.lerp(ax, V.norm(flat), w)), k = V.cross(ax, want), sn = V.len(k);
      if (sn < 1e-6) continue;
      const kk = V.mul(k, 1 / sn), ang = Math.asin(Math.min(1, sn));
      for (const q of out.slice(i, i + 3)) { q.a = V.add(c, V.rot(V.sub(q.a, c), kk, ang)); q.b = V.add(c, V.rot(V.sub(q.b, c), kk, ang)); }
    }
    return out;
  };

  const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };
  const DZ = 0.2, DY = 0.054;                 // dumbbells shoulder width apart; fist centre on the handle
  const POLE = [-0.3, -1, 0.75];
  const C = { flat: false, handFlat: false, curl: 1, elbowPole: POLE, noAvoid: true };
  const RAW = {
    crouch: Object.assign({ trunk: 68, hip: 128, knee: 125, abd: 14, hrot: 22, neck: -24, sh: 70, shAbd: 6, el: 6, ground: [['toeR', 0]] }, C),
    plank: Object.assign({ trunk: 68, hip: 0, knee: 0, ankle: -38, abd: 6, neck: -8, sh: 68, shAbd: 8, el: 0, ground: [['handR', DY - 0.03], ['toeR', 0]] }, C),
    bottom: Object.assign({ trunk: 82, hip: 0, knee: 0, ankle: -30, abd: 6, neck: -6, sh: 30, shAbd: 25, el: 95, ground: [['chest', 0.2], ['toeR', 0]] }, C),
    hinge: Object.assign({ trunk: 52, hip: 82, knee: 50, abd: 14, hrot: 10, neck: -14, sh: 46, shAbd: -5, el: 8, ground: [['toeR', 0]] }, C),
    hike: Object.assign({ trunk: 55, hip: 84, knee: 38, abd: 16, hrot: 10, neck: -14, sh: 20, shAbd: -10, el: 6, ground: [['toeR', 0]] }, C),
    mid: Object.assign({ trunk: 0, hip: 0, knee: 4, abd: 7, hrot: 8, neck: 0, sh: 95, shAbd: 4, el: 8, ground: [['toeR', 0]] }, C),
    top: Object.assign({ trunk: 0, hip: 0, knee: 2, abd: 7, hrot: 8, neck: 2, sh: 172, shAbd: 6, el: 10, ground: [['toeR', 0]] }, C),
  };

  function build(ex) {
    const { solve, expand, BODY: B } = FB;
    const S = (p) => solve(expand(Object.assign({}, p, { ik: undefined, pos: undefined })), CTX);
    const bis = (f, lo, hi) => { let flo = f(lo); for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2, fm = f(m); if ((fm > 0) === (flo > 0)) { lo = m; flo = fm; } else hi = m; } return (lo + hi) / 2; };
    const feetX = (J) => (J.ankleL[0] + J.ankleR[0]) / 2;
    // feet stay on one stance width in every standing pose (no sideways sliding): abduction fitted to the ankle z
    const STANCE = 0.19;
    const fitStance = (p) => { p.abd = +bis((a) => S(Object.assign({}, p, { abd: a })).J.ankleR[2] - STANCE, -10, 45).toFixed(2); return p; };
    const heelDown = (p) => { const J = S(Object.assign({}, p, { ankle: 0 })).J, d = V.sub(J.kneeR, J.ankleR); p.ankle = Math.atan2(d[0], d[1]) * 180 / Math.PI; };
    const REACH = B.upper + B.fore + B.hand * 0.55;
    const P = {};
    // crouch: thigh angle kept, trunk tipped until the shoulders are low enough for the fists to reach the handles
    const crouch = Object.assign({}, RAW.crouch);
    { const th = crouch.hip - crouch.trunk;
      const t = bis((tr) => { const q = Object.assign({}, crouch, { trunk: tr, hip: tr + th }); heelDown(q); return S(q).J.shoulderR[1] - (DY + REACH * 0.95); }, 30, 89);
      crouch.trunk = +t.toFixed(2); crouch.hip = +(t + th).toFixed(2); heelDown(crouch); }
    const cs = S(crouch); crouch.pos = [-feetX(cs.J), 0, 0];
    const sh = V.add(cs.J.shoulderR, crouch.pos), r0 = REACH * 0.97;
    const DX = sh[0] + Math.sqrt(Math.max(0, r0 * r0 - (sh[1] - DY) ** 2 - (DZ - sh[2]) ** 2));
    const onDB = { handL: { at: [DX, DY, -DZ] }, handR: { at: [DX, DY, DZ] } };
    P.crouch = Object.assign(crouch, { ik: onDB });
    // plank on the dumbbells: shoulders at full reach from the fists -> toe spot T
    const onD = (p, r = REACH * 0.997) => { const s = S(p), q = s.J.shoulderR;
      return [DX + Math.sqrt(Math.max(0, r * r - (q[1] - DY) ** 2 - (DZ - q[2]) ** 2)) - q[0], 0, 0]; };
    const plank2 = Object.assign({}, RAW.plank, { ik: onDB }); plank2.pos = onD(plank2);
    const TX = S(plank2).J.toeR[0] + plank2.pos[0];
    const onT = (p) => [TX - S(p).J.toeR[0], 0, 0];
    const toSingle = (p, j, g) => { const y = S(p).J[j][1], q = Object.assign({}, p, { ground: g }), t0 = q.trunk;
      q.trunk = +bis((d) => S(Object.assign({}, q, { trunk: d })).J[j][1] - y, t0 - 35, t0 + 35).toFixed(3); q.pos = onT(q); return q; };
    // plank: body height from the fist on the handle (same contact as the airborne keys); push-up: single toe contact
    P.plank = toSingle(plank2, 'handR', [['toeR', 0]]); P.plank.ground = [['handR', DY - 0.03]];
    P.bottom = toSingle(Object.assign({}, RAW.bottom, { ik: onDB }), 'chest', [['toeR', 0]]);
    // airborne keys (burpee.js): shoulders stay over the dumbbells, trunk pivots about them until the toes are y up
    const shP = V.add(S(P.plank).J.shoulderR, P.plank.pos);
    const airKey = (o, y) => {
      const at = (dT) => { const q = Object.assign({}, P.plank, { abd: 8 }, o, { trunk: P.plank.trunk + dT, sh: RAW.plank.sh + dT });
        const s = S(q); q.pos = [shP[0] - s.J.shoulderR[0], 0, 0]; return { q, toe: s.J.toeR[1] }; };
      return at(bis((d) => at(d).toe - y, 0, 60)).q; };
    P.hover = airKey({ hip: 0, knee: 0, ankle: -38 }, 0.08);   // straight body pivoted about the shoulders: toes 8 cm up over the plank toe spot
    P.kick = airKey({ hip: 38, knee: 45, ankle: -35 }, 0.08);
    P.inAir = airKey({ hip: 85, knee: 100, ankle: -25, abd: 10 }, 0.27);
    P.tuck = airKey({ hip: 118, knee: 122, ankle: 8, abd: 12 }, 0.12);
    // swing poses: feet on F (x 0), fists where the FK arms put them
    const onF = (p) => { const s = S(p); return [-feetX(s.J), 0, 0]; };
    const fkHands = (p) => { const s = S(p); return { handL: { at: V.add(s.J.handL, p.pos) }, handR: { at: V.add(s.J.handR, p.pos) } }; };
    const free = (p) => { fitStance(p); heelDown(p); p.pos = onF(p); p.ik = fkHands(p); return p; };
    for (const k of ['hinge', 'hike', 'mid', 'top']) P[k] = free(Object.assign({}, RAW[k]));
    // feet: ankle IK targets in EVERY pose (FK ankle + pos; standing keys at exactly +-STANCE), so the stance never slides
    // sideways and the knees follow their FK direction (auto knee pole) instead of caving in when the feet are narrow
    const ankles = (p, standing) => { const s = S(p), o = p.pos || [0, 0, 0];
      const a = (j, sg) => { const q = V.add(s.J[j], o); if (standing) q[2] = sg * STANCE; return { at: q }; };
      return { ankleL: a('ankleL', -1), ankleR: a('ankleR', 1) }; };
    const pinFeet = (p, standing) => { p.ik = Object.assign({}, p.ik, ankles(p, standing)); return p; };
    const STANDING = ['crouch', 'hinge', 'hike', 'mid', 'top'];
    for (const k in P) pinFeet(P[k], STANDING.includes(k));
    // mistakes on swing poses: same feet, fists from the faulty arms
    for (const mk of ex.mistakes) { const m = pinFeet(free(Object.assign({}, P[mk.at], mk.pose, { ik: undefined })), true); Object.assign(mk.pose, { abd: m.abd, ankle: m.ankle, pos: m.pos, ik: m.ik }); }
    // hop: the crouch with both feet lifted 10 cm straight up (fists stay on the handles): jump-back take-off / jump-in landing is vertical
    const up = (a) => ({ at: [a.at[0], a.at[1] + 0.1, a.at[2]] });
    P.hop = Object.assign({}, P.crouch, { ik: Object.assign({}, P.crouch.ik, { ankleL: up(P.crouch.ik.ankleL), ankleR: up(P.crouch.ik.ankleR) }) });
    MAT_AT = [(TX + DX) / 2 + 0.05, 0, 0];
    return P;
  }
  let MAT_AT = [0, 0, 0];

  window.EXERCISE = {
    id: 'devil_press',
    name: { tr: 'Devil Press', en: 'Devil Press', es: 'Devil press' },
    category: { tr: 'Kondisyon · Tüm vücut', en: 'Conditioning · Full body', es: 'Acondicionamiento · Cuerpo completo' },
    equipmentLabel: { tr: '2 dambıl', en: '2 dumbbells', es: '2 mancuernas' },
    muscles: ['quads', 'glutes', 'delts', 'chest', 'triceps', 'core'],
    tempo: '1.5-0.8-1-1',
    tempoReps: 1,
    maxDuration: 80,
    cuesReplay: false,
    qaMaxJump: 0.08,   // fast swing (shown slowed): hands travel up to 7 cm per 1/30 s
    view: { yaw: 90, pitch: 6 },
    alt: { yaw: 30, pitch: 10, title: { tr: 'Önden çapraz', en: 'Front angle', es: 'Vista frontal' },
      text: { tr: 'Dambıllar bacakların arasından geçer', en: 'The dumbbells pass between the legs', es: 'Las mancuernas pasan entre las piernas' } },
    setupView: { yaw: 32, pitch: 14 },
    setupMarks: [{ type: 'span', joints: ['ankleR', 'ankleL'], label: { tr: 'Omuz genişliği', en: 'Shoulder width', es: 'Ancho de hombros' } }],
    contacts: ['ballR', 'ballL', 'handR', 'handL'],
    get props() { void this.poses; return [['mat', { at: MAT_AT, length: 2.0 }], ['floorDB', { grip: 'neutral', headR: 0.052 }]]; },
    ctx: CTX,
    get poses() { return this._poses || (this._poses = build(this)); },
    rest: 'crouch',
    rep: [
      { to: 'hop', dur: 0.2, phase: 0, card: false },
      { to: 'tuck', dur: 0.4, phase: 0 },
      { to: 'inAir', dur: 0.35, phase: 0, card: false },
      { to: 'kick', dur: 0.35, phase: 0, card: false },
      { to: 'hover', dur: 0.2, phase: 0, card: false },
      { to: 'plank', dur: 0.3, phase: 0, card: false },
      { to: 'bottom', dur: 1.0, phase: 1 },
      { to: 'plank', dur: 0.8, phase: 2 },
      { to: 'hover', dur: 0.2, phase: 2, card: false },
      { to: 'kick', dur: 0.35, phase: 2, card: false },
      { to: 'inAir', dur: 0.35, phase: 2, card: false },
      { to: 'tuck', dur: 0.35, phase: 2, card: false },
      { to: 'hop', dur: 0.2, phase: 2, card: false },
      { to: 'crouch', dur: 0.4, phase: 2, card: false },
      { to: 'hinge', dur: 0.7, phase: 2, card: false },
      { to: 'hike', dur: 0.8, phase: 3, card: false },
      { to: 'mid', dur: 1.25, phase: 3 },
      { to: 'top', dur: 1.0, phase: 4 },
      { to: 'mid', dur: 0.8, phase: 5 },
      { to: 'hike', dur: 1.0, phase: 5, card: false },
      { to: 'hinge', dur: 0.6, phase: 5, card: false },
      { to: 'crouch', dur: 0.7, phase: 5, card: false },
    ],
    setup: { tr: 'İki dambıl yerde, ayakların önünde, omuz genişliğinde. Çömel, sapları tut, sırt düz.',
      en: 'Two dumbbells on the floor in front of the feet, shoulder width. Crouch, grip the handles, flat back.',
      es: 'Dos mancuernas en el suelo delante de los pies. Agáchate, agarra las asas, espalda recta.' },
    phases: [
      { name: { tr: 'Ayaklar geriye', en: 'Feet back', es: 'Pies atrás' }, breath: 'in',
        text: { tr: 'Dambıllara yaslan, ayakları geri at: yüksek plank.', en: 'Lean on the dumbbells, jump the feet back to a plank.', es: 'Apóyate en las mancuernas y salta atrás a plancha.' } },
      { name: { tr: 'Şınav', en: 'Push-up', es: 'Flexión' }, breath: 'in', line: ['ankleR', 'pelvis', 'shoulderR'],
        text: { tr: 'Göğsü dambılların arasına indir, vücut tek çizgi.', en: 'Lower the chest between the dumbbells, body in one line.', es: 'Baja el pecho entre las mancuernas, cuerpo en línea.' } },
      { name: { tr: 'İt, ayaklar öne', en: 'Push, feet in', es: 'Empuja, pies adelante' }, breath: 'out',
        text: { tr: 'Yukarı it, ayakları dambıllara zıplat, dambılları kaldır.', en: 'Push up, jump the feet in, lift the dumbbells.', es: 'Empuja, salta hacia las mancuernas y levántalas.' } },
      { name: { tr: 'Kalçayı patlat', en: 'Snap the hips', es: 'Cadera explosiva' }, breath: 'out', line: ['ankleR', 'hipR', 'shoulderR'],
        text: { tr: 'Dambılları bacak arasından geri sal, kalçayı öne patlat.', en: 'Hike the dumbbells back, then snap the hips forward.', es: 'Lleva las mancuernas atrás y extiende la cadera de golpe.' } },
      { name: { tr: 'Tepede kilitle', en: 'Lock out', es: 'Bloquea arriba' }, breath: 'out', arc: ['hipR', 'shoulderR', 'elbowR'],
        text: { tr: 'Tek hareketle başın üstüne, kollar kilitli.', en: 'One motion to overhead, arms locked.', es: 'Un solo gesto hasta arriba, brazos bloqueados.' } },
      { name: { tr: 'Kontrollü indir', en: 'Lower with control', es: 'Baja con control' }, breath: 'in',
        text: { tr: 'Dambılları bacak arasından indir, yere koy.', en: 'Swing them down between the legs, set them down.', es: 'Bájalas entre las piernas y apóyalas.' } },
    ],
    tempoText: { tr: 'Gerçekte ~4 sn\'de bir tekrar · burada yavaş çekim', en: 'Real pace ~4 s per rep · shown in slow motion', es: 'Ritmo real ~4 s por rep · a cámara lenta' },
    mistakes: [
      { title: { tr: 'Swing\'de sırt yuvarlanıyor', en: 'Rounded back on the swing', es: 'Espalda redonda en el swing' },
        fix: { tr: 'Kalçadan katlan, sırt düz', en: 'Hinge with a flat back', es: 'Bisagra con espalda recta' },
        fixText: { tr: 'Göğüs açık, omurga nötr, kalça geride', en: 'Chest open, neutral spine, hips back', es: 'Pecho abierto, columna neutra, cadera atrás' },
        at: 'hike', pose: { trunk: 40, hip: 62, lumbar: 16, thoracic: 20, neck: 16 }, line: ['pelvis', 'waist', 'neck'], goodLine: ['pelvis', 'neck'], parts: ['waist', 'chest'] },
      { title: { tr: 'Sadece kollarla kaldırmak', en: 'Arms-only lift', es: 'Solo con los brazos' },
        fix: { tr: 'Gücü kalçadan al', en: 'Drive with the hips', es: 'Impulso desde la cadera' },
        fixText: { tr: 'Kalça ve diz tam açılır, kollar sadece yön verir', en: 'Hips and knees fully extend, arms only guide', es: 'Cadera y rodillas se extienden, brazos solo guían' },
        at: 'mid', pose: { trunk: 26, hip: 46, knee: 30, sh: 55, el: 85, neck: -6 }, marks: ['handR'], line: ['ankleR', 'hipR', 'shoulderR'], parts: ['upperR', 'foreR', 'pelvis'] },
    ],
    cues: [{ tr: 'Burpee\'de kontrol', en: 'Control the burpee', es: 'Controla el burpee' },
      { tr: 'Swing\'i kalça başlatır', en: 'The hips drive the swing', es: 'La cadera impulsa el swing' },
      { tr: 'Tepede kollar kilitli', en: 'Lock out overhead', es: 'Bloquea arriba' }],
  };
})();
