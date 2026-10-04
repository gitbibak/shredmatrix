/* Hamstring walkout. Contact model from glute_bridge_march.js: shoulders on the mat + pelvis at a solved height (two-contact
 * ground), shoulders anchored, hands beside the hips. Feet: every pose carries ankle IK targets (position + foot frame).
 * Engine limit worked around: every rep entry gets its own step card (>= 2.9 s), so a walk of 2 small steps per foot each way
 * (16 lift/land keys) would make the video ~75 s. Here each foot takes ONE step out and one back, and the landing of one
 * foot is the same key as the lift of the other (top -> R up -> R down / L up -> L down = out), so 3 entries per direction.
 * The step is therefore longer (~16 cm per foot, half the 32 cm travel) and the feet never slide on the mat.
 * Bridge top: knee 90, hip 0 (shoulder-hip-knee line); end: knee ~25, hip ~0, heels down with toes up. */
(function () {
  const MAT = 0.012;
  const CTX = { anchorX: ['shoulderL', 'shoulderR'], anchorAt: [-0.55, 0] };
  const G = (h) => [['shoulderR', MAT + 0.03 + 0.008 * Math.min(1, h / 0.15)], ['pelvis', MAT + h]];
  const BASE = { trunk: -90, thoracic: 30, palm: 'down', curl: 0.15, elbowPole: [0, 0, 1], abd: 4, flat: false };
  const bis = (f, lo, hi, n = 40) => { for (let i = 0; i < n; i++) { const m = (lo + hi) / 2; if (f(m) > 0) hi = m; else lo = m; } return (lo + hi) / 2; };

  function build(mistakes) {
    const { solve, expand, V } = FB;
    const sv = (p) => solve(expand(Object.assign({}, p, { ik: Object.assign({}, p.ik, { ankleL: undefined, ankleR: undefined }) })), CTX);
    const frame = (F) => ({ 0: F[0].slice(), 1: F[1].slice(), 2: F[2].slice() });
    const lerpF = (a, b, t) => ({ 0: V.lerp(a[0], b[0], t), 1: V.lerp(a[1], b[1], t), 2: V.lerp(a[2], b[2], t) });
    const clean = (ik) => { const o = {}; for (const k in ik) if (ik[k]) o[k] = ik[k]; return o; };
    // start: hip 0, knee 90, pelvis height so the heel rests on the mat; end: knee 25 at a given pelvis height, hip solved
    const spotOf = (p) => { const s = sv(p); return { R: { at: s.J.ankleR.slice(), foot: frame(s.F.footR) }, L: { at: s.J.ankleL.slice(), foot: frame(s.F.footL) } }; };
    const D = 180 / Math.PI;
    const hipAng = (q) => { const up = V.norm(V.sub(q.J.neck, q.J.pelvis)), th = V.norm(V.sub(q.J.kneeR, q.J.hipR)); return Math.acos(Math.max(-1, Math.min(1, -V.dot(up, th)))) * D; };
    // start: hip angle chosen so shoulder-hip-knee is a straight line (thoracic 30 bends the neck line, so FK hip ~ -21),
    // pelvis height so the heel rests on the mat. End: knee 25, pelvis 3 cm lower, hip flexion solved for the heel on the mat.
    const pA = Object.assign({}, BASE, { knee: 90, ankle: 0, ground: G(0.15) });
    pA.hip = -21;
    const hA = bis((y) => sv(Object.assign({}, pA, { ground: G(y) })).J.heelR[1] - MAT, 0.04, 0.36);
    pA.ground = G(hA);
    const A = { p: pA, h: hA, hip: pA.hip, spot: spotOf(pA) };
    const hB = hA - 0.03;
    const pB = Object.assign({}, BASE, { knee: 25, ankle: -6, ground: G(hB) });
    pB.hip = bis((x) => sv(Object.assign({}, pB, { hip: x })).J.heelR[1] - MAT, -70, 60);
    const B = { p: pB, h: hB, hip: pB.hip, spot: spotOf(pB) };
    const sh = sv(A.p).J.shoulderR;
    const hands = { handL: { at: [sh[0] + 0.5, MAT + 0.066, -0.2] }, handR: { at: [sh[0] + 0.5, MAT + 0.066, 0.2] } };
    const mid = (a, b, lift) => ({ at: V.add(V.lerp(a.at, b.at, 0.5), [0, lift, 0]), foot: lerpF(a.foot, b.foot, 0.5) });
    // pose from per-side state: 0 = start spot, 1 = end spot, 0.5 = lifted half-way
    const pose = (r, l, hw) => {
      const sp = (S, v) => (v === 0 ? A.spot[S] : v === 1 ? B.spot[S] : mid(A.spot[S], B.spot[S], 0.07));
      const kn = (v) => 90 + (25 - 90) * v;
      const p = Object.assign({}, BASE, { hipR: A.hip + (B.hip - A.hip) * r, hipL: A.hip + (B.hip - A.hip) * l, kneeR: kn(r), kneeL: kn(l), ankleR: -6 * r, ankleL: -6 * l,
        ground: G(A.h + (B.h - A.h) * hw) });
      p.ik = Object.assign({}, hands, { ankleR: sp('R', r), ankleL: sp('L', l) });
      return p;
    };
    const poses = {
      top: pose(0, 0, 0), o1: pose(0.5, 0, 0.25), o2: pose(1, 0.5, 0.7), out: pose(1, 1, 1),
      i1: pose(0.5, 1, 0.75), i2: pose(0, 0.5, 0.3),
    };
    const headDown = (p) => { p.neck = bis((n) => sv(Object.assign({}, p, { neck: n })).J.head[1] - MAT - 0.11, -40, 60); return p; };
    for (const k in poses) headDown(poses[k]);
    for (const [at, mp] of mistakes) {
      if (mp.drop) { mp.ground = G(B.h - mp.drop); delete mp.drop; }
      mp.neck = headDown(Object.assign({}, poses[at], mp)).neck;
    }
    for (const k in poses) poses[k].ik = clean(poses[k].ik);
    return poses;
  }

  window.EXERCISE = {
    id: 'hamstring_walkout',
    name: { tr: 'Hamstring Walkout', en: 'Hamstring Walkout', es: 'Paseo de isquiotibiales' },
    category: { tr: 'Bacak · Arka bacak', en: 'Legs · Hamstrings', es: 'Piernas · Isquiotibiales' },
    equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
    muscles: ['hamstrings', 'glutes', 'core'],
    tempo: '3.5-0-3.5',
    tempoReps: 1,
    view: { yaw: 90, pitch: 6, zoom: 1.08 },
    alt: { yaw: 25, pitch: 18, title: { tr: 'Önden çapraz', en: 'Front angle', es: 'Vista frontal' },
      text: { tr: 'Kalça düz, adım atarken dönmüyor', en: 'Hips level, no twisting with each step', es: 'Cadera nivelada, sin girar al dar pasos' } },
    setupView: { yaw: 50, pitch: 20 },
    contacts: ['shoulderR', 'heelR', 'heelL'],
    props: [['mat', { at: [-0.05, 0.006, 0], length: 1.95, width: 0.72 }]],
    ctx: CTX,
    get poses() { return this._poses || (this._poses = build(this.mistakes.map((m) => [m.at, m.pose]))); },
    rest: 'top',
    rep: [
      { to: 'o1', dur: 1.1, phase: 0 },
      { to: 'o2', dur: 1.2, phase: 0 },
      { to: 'out', dur: 1.2, phase: 1 },
      { to: 'i1', dur: 1.1, phase: 2 },
      { to: 'i2', dur: 1.2, phase: 2 },
      { to: 'top', dur: 1.2, phase: 2 },
    ],
    setup: { tr: 'Sırtüstü köprü kur: kalça yukarıda, dizler 90°, topuklar yerde, kollar yanda.',
      en: 'Set up a bridge: hips up, knees at 90°, heels down, arms by your sides.',
      es: 'Haz un puente: cadera arriba, rodillas a 90°, talones abajo, brazos a los lados.' },
    phases: [
      { name: { tr: 'Ayakları uzaklaştır', en: 'Walk the feet out', es: 'Aleja los pies' }, breath: 'easy',
        text: { tr: 'Ayaklar sırayla küçük adımla ileri. Kalça yüksek.', en: 'Small steps out, one foot at a time. Hips high.', es: 'Pasos cortos, un pie cada vez. Cadera alta.' } },
      { name: { tr: 'Dizler neredeyse düz', en: 'Knees almost straight', es: 'Rodillas casi rectas' }, breath: 'easy', line: ['shoulderR', 'hipR', 'heelR'],
        text: { tr: 'Arka bacak çalışır, kalça düşmez.', en: 'Hamstrings work, hips don\'t drop.', es: 'Trabajan los isquios, la cadera no cae.' } },
      { name: { tr: 'Geri yürü', en: 'Walk back in', es: 'Vuelve caminando' }, breath: 'easy',
        text: { tr: 'Aynı şekilde geri, kalça hep yukarıda.', en: 'Same way back, hips up the whole time.', es: 'Vuelve igual, cadera siempre arriba.' } },
    ],
    tempoText: { tr: '~3,5 sn çık · ~3,5 sn dön · normal nefes', en: '~3.5 s out · ~3.5 s back · breathe normally', es: '~3,5 s fuera · ~3,5 s vuelta · respira normal' },
    mistakes: [
      { title: { tr: 'Kalça düşüyor', en: 'Hips drop', es: 'La cadera cae' },
        fix: { tr: 'Kalçayı sık, mesafeyi kısalt', en: 'Squeeze the glutes, shorter range', es: 'Aprieta glúteos, menos recorrido' },
        fixText: { tr: 'Omuzdan topuğa düz çizgi', en: 'Straight line shoulders to heels', es: 'Línea recta de hombros a talones' },
        at: 'out', pose: { drop: 0.045, thoracic: 22 }, line: ['shoulderR', 'hipR', 'heelR'], marks: ['hipR'], parts: ['pelvis', 'waist'] },
      { title: { tr: 'Kalça yana dönüyor', en: 'Pelvis rotates', es: 'La pelvis gira' },
        fix: { tr: 'Adımları yavaşlat', en: 'Slow the steps down', es: 'Pasos más lentos' },
        fixText: { tr: 'İki kalça kemiği aynı yükseklikte', en: 'Both hip bones at the same height', es: 'Ambas caderas a la misma altura' },
        at: 'o2', pose: { roll: -12, twist: 12 }, view: { yaw: 25, pitch: 28 }, line: ['hipL', 'hipR'], marks: ['hipL'], parts: ['pelvis'] },
    ],
    cues: [{ tr: 'Kalça hep yüksek', en: 'Hips stay high', es: 'Cadera siempre alta' },
      { tr: 'Topuklar yerde', en: 'Heels on the floor', es: 'Talones en el suelo' },
      { tr: 'Küçük adımlar, kalça dönmez', en: 'Small steps, no hip rotation', es: 'Pasos cortos, sin girar la cadera' }],
  };
})();
