/* Rowing machine sprint. Pelvis sits on the sliding seat (ground contact at seat height), feet are planted on the foot
 * stretcher (ctx.plant from the catch), the seat slides via `pos` (x), found per pose so the planted feet are in reach.
 * The handle travels on one horizontal line (world IK targets for both hands at HY). The sequence is split in four keys:
 * catch -> legs pushed flat -> finish (lean back, handle to the ribs) -> arms away + body over -> catch.
 * The erg (rail, sliding seat, foot stretcher, flywheel housing, chain, handle) is a prop defined in this file
 * (FB.PROPS._rowErg). Shown ~2.5x slower than a 33 spm sprint (drive 0.7 s / recovery 1.1 s; qa limb-jump check).  * Fix 2026-10-04: pad top = SEAT; per-pose pelvis ground offset DROP (measured lowest buttock vertex) so the sit bones rest on the pad in catch/legs/finish/away (<=1.7 cm soft sink mid-transition).
 */
(function () {
  const { V } = FB;
  const SEAT = 0.36, FLY = [1.45, 0.55], H = { y: 0.66 };
  FB.PROPS._rowErg = (sol) => {
    const P = sol.J.pelvis, hL = sol.J.handL, hR = sol.J.handR, mid = V.lerp(hL, hR, 0.5);
    sol.grip = { L: [0, 0, 1], R: [0, 0, 1] }; sol.gripKind = 'pronated';
    const out = [
      { t: 'box', c: [0.25, SEAT - 0.13, 0], s: [2.3, 0.05, 0.14], m: 'chrome' },
      { t: 'box', c: [-0.88, (SEAT - 0.15) / 2, 0], s: [0.06, SEAT - 0.15, 0.06], m: 'frame' },
      { t: 'box', c: [-0.88, 0.02, 0], s: [0.1, 0.04, 0.5], m: 'frame' },
      { t: 'box', c: [P[0] - 0.09, SEAT - 0.035, 0], s: [0.36, 0.07, 0.28], m: 'pad', round: 0.02 },     // pad top = SEAT (sit bones rest on it)
      { t: 'box', c: [P[0] - 0.09, SEAT - 0.085, 0], s: [0.2, 0.05, 0.12], m: 'frame' },            // carriage under the pad
      { t: 'cyl', a: [FLY[0], FLY[1], -0.13], b: [FLY[0], FLY[1], 0.13], r: 0.26, m: 'frameDark', seg: 32 },
      { t: 'box', c: [FLY[0] - 0.05, 0.16, 0], s: [0.3, 0.3, 0.2], m: 'frame' },
      { t: 'box', c: [FLY[0] + 0.05, 0.02, 0], s: [0.12, 0.04, 0.55], m: 'frame' },
      { t: 'tube', pts: [[FLY[0] - 0.2, H.y, 0], mid], r: 0.005, m: 'chrome' },
      { t: 'cyl', a: V.add(mid, [0, 0, -0.27]), b: V.add(mid, [0, 0, 0.27]), r: 0.017, m: 'rubber' },
    ];
    // foot stretchers under the planted feet, inclined with the sole
    for (const s of ['L', 'R']) {
      const h = sol.J['heel' + s], t = sol.J['toe' + s], c = V.lerp(h, t, 0.5), d = V.norm(V.sub(t, h));
      const nrm = [d[1], -d[0], 0];
      out.push({ t: 'tube', pts: [V.add(V.add(h, V.mul(d, -0.03)), V.mul(nrm, 0.015)), V.add(V.add(t, V.mul(d, 0.02)), V.mul(nrm, 0.015))], r: 0.016, m: 'frame' });
      out.push({ t: 'tube', pts: [V.add(c, V.mul(nrm, 0.03)), [c[0] + 0.05, SEAT - 0.13, c[2]]], r: 0.012, m: 'frame' });
    }
    return out;
  };
  const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0], plant: ['ankleL', 'ankleR'] };
  const DROP = { catch: 0.037, legs: 0.037, finish: 0.002, away: 0.037 };   // pelvis-joint offset so the lowest buttock vertex (measured on the mesh) sits on the pad top
  const G = (k) => [['pelvis', SEAT - DROP[k]]];
  const BASE = { flat: false, abd: 3, hrot: 4, neck: -4, palm: 'down', curl: 1, elbowPole: [-0.5, -0.8, 0.9], kneePole: [-0.2, 1, 0.04] };
  const P = (o) => Object.assign({}, BASE, o);

  function build(mistakes) {
    const { solve, expand } = FB;
    const sv = (p) => solve(expand(Object.assign({}, p, { ik: undefined, pos: undefined })), { anchorX: ['pelvis'], anchorAt: [0, 0] });
    const catchP = P({ ground: G('catch'), trunk: 30, hip: 120, knee: 125, ankle: 30, sh: 85, el: 0, pos: [0, 0, 0] });
    // catch: hip flexion that makes the shin vertical
    { let best = 1e9, bh = 120; for (let h = 80; h <= 160; h += 0.5) { const q = sv(Object.assign({}, catchP, { hip: h })); const d = Math.abs(q.J.kneeR[0] - q.J.ankleR[0]); if (d < best) { best = d; bh = h; } } catchP.hip = bh; }
    const c0 = sv(catchP);
    const A = c0.J.ankleR;                        // planted ankle (pelvis at x 0)
    const HY = c0.J.handR[1];                     // handle height: straight arms at the catch
    // a pose with given knee: hip angle so the ankle height matches the planted one, then slide the seat (pos x) to reach it
    const reach = (p) => {
      let best = 1e9, bh = 0;
      for (let h = -30; h <= 140; h += 0.5) { const q = sv(Object.assign({}, p, { hip: h })); const d = Math.abs(q.J.ankleR[1] - A[1]) + (q.J.ankleR[0] < q.J.pelvis[0] ? 1 : 0); if (d < best) { best = d; bh = h; } }
      p.hip = bh;
      const q = sv(p); p.pos = [A[0] - q.J.ankleR[0], 0, 0];
      return p;
    };
    H.y = HY;
    const handsAt = (p, x) => { p.ik = { handL: { at: [x, HY, -0.23] }, handR: { at: [x, HY, 0.23] } }; return p; };
    const fk = (p) => { const s = sv(p); return s.J.handR[0] + (p.pos ? p.pos[0] : 0); };
    handsAt(catchP, fk(catchP));
    const legs = reach(P({ ground: G('legs'), trunk: 30, knee: 6, ankle: -8, sh: 82, el: 0 })); handsAt(legs, fk(legs));
    const fin = reach(P({ ground: G('finish'), trunk: -15, knee: 4, ankle: -10, neck: 4 }));
    { const s = sv(fin); handsAt(fin, s.J.chest[0] + fin.pos[0] + 0.12); }
    const away = reach(P({ ground: G('away'), trunk: 22, knee: 8, ankle: -8, sh: 80, el: 0 })); handsAt(away, fk(away));
    const poses = { catch: catchP, legs, finish: fin, away };
    for (const [at, mp] of mistakes) {
      if (mp.armsIn) { const m = Object.assign({}, poses[at], mp); handsAt(m, poses[at].ik.handR.at[0] - mp.armsIn); mp.ik = m.ik; delete mp.armsIn; }
    }
    return poses;
  }

  window.EXERCISE = {
    id: 'rowing_sprint',
    name: { tr: 'Kürek Ergometresi Sprint', en: 'Rowing Sprint', es: 'Sprint en remo' },
    category: { tr: 'Kondisyon · Tüm vücut', en: 'Conditioning · Full body', es: 'Acondicionamiento · Cuerpo completo' },
    equipmentLabel: { tr: 'Kürek ergometresi', en: 'Rowing machine', es: 'Remoergómetro' },
    muscles: ['quads', 'glutes', 'hamstrings', 'lats', 'upperback'],
    tempo: '0.7-1.1',
    tempoReps: 2,
    view: { yaw: 90, pitch: 6 },
    alt: { yaw: 25, pitch: 10, title: { tr: 'Önden çapraz', en: 'Front angle', es: 'Vista frontal' },
      text: { tr: 'Sap düz bir çizgide gider gelir', en: 'The handle moves in a straight line', es: 'El agarre va en línea recta' } },
    setupView: { yaw: 40, pitch: 14 },
    props: [['_rowErg']],
    ctx: CTX,
    contacts: ['pelvis', 'ballR', 'handR'],
    get poses() { return this._poses || (this._poses = build(this.mistakes.map((m) => [m.at, m.pose]))); },
    rest: 'catch',
    rep: [
      { to: 'legs', dur: 1.0, phase: 0 },
      { to: 'finish', dur: 1.15, phase: 1 },
      { to: 'away', dur: 1.2, phase: 2 },
      { to: 'catch', dur: 1.3, phase: 3 },
    ],
    setup: { tr: 'Ayaklar bantlı, sapı parmaklarla tut. Başlangıç: kaval dik, gövde ~30° önde, kollar düz.',
      en: 'Feet strapped in, handle in the fingers. Catch: shins vertical, torso ~30° forward, arms straight.',
      es: 'Pies sujetos, agarre con los dedos. Inicio: tibias verticales, torso ~30° adelante, brazos rectos.' },
    phases: [
      { name: { tr: 'Önce bacaklar', en: 'Legs first', es: 'Primero piernas' }, breath: 'out',
        text: { tr: 'Bacaklarla it. Kollar düz, gövde açısı aynı.', en: 'Drive with the legs. Arms straight, trunk angle unchanged.', es: 'Empuja con las piernas. Brazos rectos, tronco igual.' } },
      { name: { tr: 'Sonra gövde ve kollar', en: 'Then back and arms', es: 'Luego espalda y brazos' }, breath: 'out', arc: ['hipR', 'pelvis', 'neck'],
        text: { tr: 'Hafif geriye yaslan, sapı alt kaburgalara çek.', en: 'Lean back slightly and pull the handle to the lower ribs.', es: 'Inclínate un poco atrás y tira a las costillas bajas.' } },
      { name: { tr: 'Kollar, gövde öne', en: 'Arms out, body over', es: 'Brazos fuera, cuerpo adelante' }, breath: 'in',
        text: { tr: 'Dönüşte sıra ters: önce kollar uzar, sonra gövde öne eğilir.', en: 'Recovery in reverse: arms extend, then the body leans forward.', es: 'Vuelta al revés: brazos fuera, luego el cuerpo adelante.' } },
      { name: { tr: 'Dizler bükülür', en: 'Knees bend', es: 'Rodillas flexionan' }, breath: 'in',
        text: { tr: 'En son dizleri bük, sele yavaşça öne kaysın.', en: 'Bend the knees last and slide forward slowly.', es: 'Flexiona las rodillas al final y desliza despacio.' } },
    ],
    tempoText: { tr: 'Çekiş 0,7 sn · dönüş 1,1 sn · burada yavaş çekim', en: 'Drive 0.7 s · recovery 1.1 s · shown in slow motion', es: 'Tirón 0,7 s · vuelta 1,1 s · a cámara lenta' },
    mistakes: [
      { title: { tr: 'Önce kollarla çekmek', en: 'Pulling with the arms first', es: 'Tirar primero con los brazos' },
        fix: { tr: 'Önce bacaklarla it', en: 'Push with the legs first', es: 'Primero empuja con las piernas' },
        fixText: { tr: 'Bacak, gövde, kol sırası', en: 'Legs, then back, then arms', es: 'Piernas, espalda, brazos' },
        at: 'catch', pose: { armsIn: 0.3, lumbar: 10, thoracic: 10 }, marks: ['elbowR'], parts: ['upperR', 'foreR'] },
      { title: { tr: 'Başlangıçta sırt yuvarlak', en: 'Rounded back at the catch', es: 'Espalda redonda al inicio' },
        fix: { tr: 'Kalçadan öne eğil', en: 'Hinge at the hips', es: 'Bisagra de cadera' },
        fixText: { tr: 'Göğüs açık, sırt düz', en: 'Chest up, flat back', es: 'Pecho arriba, espalda recta' },
        at: 'catch', pose: { trunk: 16, lumbar: 22, thoracic: 28, neck: 10 }, line: ['pelvis', 'waist', 'neck'], goodLine: ['pelvis', 'neck'], parts: ['waist', 'chest'] },
    ],
    cues: [{ tr: 'Bacak, gövde, kol', en: 'Legs, back, arms', es: 'Piernas, espalda, brazos' },
      { tr: 'Dönüşte: kol, gövde, bacak', en: 'Recovery: arms, back, legs', es: 'Vuelta: brazos, espalda, piernas' },
      { tr: 'Sap düz bir çizgide', en: 'Handle in a straight line', es: 'Agarre en línea recta' }],
  };
})();
