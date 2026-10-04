/* Single-leg glute bridge (right leg works, near the camera). Supine on a mat.
 * Contacts: shoulders on the mat + pelvis at a chosen height (two-contact ground), shoulders anchored, so the body pivots
 * about the upper back like the real lift. The working foot is planted (captured from the start pose) and the leg IK
 * follows the hips; the free (left) leg is FK and stays in line with the working thigh.
 * Built lazily (needs the rig's FB.BODY): the start knee is solved so the working foot rests flat on the mat, the top
 * pelvis height so the working hip reaches ~0° (torso and thigh in one line), the neck so the head rests on the mat,
 * and the hands get fixed world targets beside the hips (palms down).
 * Workarounds: hand joint 6.6 cm above the mat (below 7.5 cm the engine switches to a weight-bearing flat hand with the
 * fingers toward the head); at the top the upper back stays flat (thoracic 37) - this also keeps the thorax flat enough
 * for the engine's lying ponytail clamp (|neck-waist slope| < ~17 deg), otherwise the ponytail drops through the mat.
 * The measured hip angle uses the pelvis-neck line, so it is solved to ~3 deg (torso-thigh line) at the top. */
(function () {
  const MAT = 0.012;
  const CTX = { anchorX: ['shoulderL', 'shoulderR'], anchorAt: [-0.55, 0] };
  // shoulder joint 3-4 cm above the engine's 0.07 clearance: the rig's thorax is deep (chest joint clears the mat when flat)
  // and at the top the weight rolls onto the shoulder blades so the neck clears the mat
  const G = (h) => [['shoulderR', MAT + 0.03 + 0.008 * Math.min(1, h / 0.15)], ['pelvis', MAT + h]];
  const BASE = { trunk: -90, palm: 'down', curl: 0.15, elbowPole: [0, 0, 1], flatL: false, ankleL: -25, abd: 3 };
  const bis = (f, lo, hi, n = 40) => { for (let i = 0; i < n; i++) { const m = (lo + hi) / 2; if (f(m) > 0) hi = m; else lo = m; } return (lo + hi) / 2; };

  function build(mistakes) {
    const { solve, expand, capturePlant, V } = FB;
    const D = 180 / Math.PI;
    const sv = (p, ctx = CTX) => solve(expand(p), ctx);
    // head resting on the mat
    const headDown = (p, ctx) => Object.assign(p, { neck: bis((n) => sv(Object.assign({}, p, { neck: n }), ctx).J.head[1] - MAT - 0.11, -40, 60) });
    // start: hips lightly on the mat, working foot flat on the mat
    const start = Object.assign({}, BASE, { hipR: 55, hipL: 55, kneeL: 0, ground: G(0.012) });
    start.kneeR = bis((k) => MAT - sv(Object.assign({}, start, { kneeR: k })).J.heelR[1], 90, 150);
    headDown(start, CTX);
    const s0 = sv(start);
    const sh = s0.J.shoulderR;
    const hands = { handL: { at: [sh[0] + 0.5, MAT + 0.03, -0.2] }, handR: { at: [sh[0] + 0.5, MAT + 0.03, 0.2] } };
    start.ik = hands;
    const ctx = Object.assign({}, CTX, { plant: capturePlant(s0, ['ankleR']) });
    const hipAng = (s) => { const up = V.norm(V.sub(s.J.neck, s.J.pelvis)), th = V.norm(V.sub(s.J.kneeR, s.J.hipR)); return Math.acos(Math.max(-1, Math.min(1, -V.dot(up, th)))) * D; };
    // top: pelvis height for a straight shoulder-hip-knee line
    // upper back stays flat on the mat (thoracic flexion relative to the lifted lumbar/pelvis)
    const top = Object.assign({}, BASE, { thoracic: 37, hipR: 0, kneeR: 100, hipL: 0, kneeL: 0, ik: hands });
    const h = bis((y) => 3 - hipAng(sv(Object.assign({}, top, { ground: G(y) }), ctx)), 0.05, 0.205);   // hipAng is unsigned: stay below the straight line
    top.ground = G(h);
    // free thigh in line with the working thigh
    const st = sv(top, ctx), elev = (s, k) => V.norm(V.sub(s.J['knee' + k], s.J['hip' + k]))[1];
    top.hipL = bis((a) => elev(sv(Object.assign({}, top, { hipL: a }), ctx), 'L') - elev(st, 'R'), -40, 60);
    headDown(top, ctx);
    const poses = { start, top };
    // mistakes: keep the head down and the hands where they are
    for (const [at, mp] of mistakes) { if (mp.lift) { mp.ground = G(h + mp.lift); delete mp.lift; } const merged = Object.assign({}, poses[at], mp); headDown(merged, ctx); mp.neck = merged.neck; mp.ik = hands; }
    return poses;
  }

  window.EXERCISE = {
    id: 'single_leg_glute_bridge',
    name: { tr: 'Tek Bacak Glute Bridge', en: 'Single-Leg Glute Bridge', es: 'Puente de glúteos a una pierna' },
    category: { tr: 'Bacak · Kalça', en: 'Legs · Glutes', es: 'Piernas · Glúteos' },
    equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
    muscles: ['glutes', 'hamstrings', 'core'],
    tempo: '1.5-1-2',
    view: { yaw: 90, pitch: 6, zoom: 1.1 },
    alt: { yaw: 20, pitch: 16, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
      text: { tr: 'Kalçanın iki yanı aynı yükseklikte', en: 'Both hips at the same height', es: 'Las dos caderas a la misma altura' } },
    setupView: { yaw: 50, pitch: 20 },
    contacts: ['shoulderR', 'ballR', 'handR'],
    props: [['mat', { at: [-0.12, 0.006, 0], length: 1.85, width: 0.72 }]],
    ctx: Object.assign({ plant: ['ankleR'] }, CTX),
    get poses() { return this._poses || (this._poses = build(this.mistakes.map((m) => [m.at, m.pose]))); },
    rest: 'start',
    rep: [
      { to: 'top', dur: 1.5, phase: 0 },
      { to: 'top', dur: 1.0, phase: 1 },
      { to: 'start', dur: 2.0, phase: 2 },
    ],
    setup: { tr: 'Sırtüstü yat, sağ ayak yerde, diz bükülü. Sol bacağı düz uzat, uyluklar aynı hizada. Sonra taraf değiştir.',
      en: 'Lie on your back, right foot flat, knee bent. Lift the left leg straight, thighs level. Then switch sides.',
      es: 'Boca arriba, pie derecho apoyado. Pierna izquierda recta y elevada, muslos alineados. Luego cambia de lado.' },
    phases: [
      { name: { tr: 'Kalçayı kaldır', en: 'Lift', es: 'Eleva' }, breath: 'out',
        text: { tr: 'Sağ topuktan it, kalçayı omuz-diz hizasına kaldır. Kalça düz kalır.', en: 'Drive through the right heel. Lift the hips into one line, hips level.', es: 'Empuja con el talón derecho. Sube la cadera en línea, sin inclinarla.' } },
      { name: { tr: 'Tepede sık', en: 'Squeeze', es: 'Aprieta' }, breath: 'hold', line: ['shoulderR', 'hipR', 'kneeR'],
        text: { tr: 'Omuz, kalça ve diz tek çizgide. Kalçayı 1 sn sık.', en: 'Shoulder, hip and knee in one line. Squeeze the glute for 1 s.', es: 'Hombro, cadera y rodilla en línea. Aprieta 1 s.' } },
      { name: { tr: 'Kontrollü in', en: 'Lower', es: 'Baja' }, breath: 'in',
        text: { tr: 'İki saniyede in. Kalça yere hafifçe değsin, dinlenme.', en: 'Take two seconds down. Just touch the floor, don\'t rest.', es: 'Baja en dos segundos. Roza el suelo sin descansar.' } },
    ],
    tempoText: { tr: '1,5 sn kalk · 1 sn sık · 2 sn in', en: '1.5 s up · 1 s squeeze · 2 s down', es: '1,5 s arriba · 1 s aprieta · 2 s abajo' },
    mistakes: [
      { title: { tr: 'Kalça bir yana düşüyor', en: 'Hip drops to one side', es: 'La cadera cae de un lado' },
        fix: { tr: 'Kalçayı düz tut', en: 'Keep the hips level', es: 'Cadera nivelada' },
        fixText: { tr: 'Kalça yanını sık; gerekirse daha az kaldır', en: 'Squeeze the side glute; lift a little lower if needed', es: 'Activa el glúteo medio; sube menos si hace falta' },
        at: 'top', pose: { roll: 14, twist: -14 }, view: { yaw: 20, pitch: 16 }, marks: ['hipL'], line: ['hipL', 'hipR'], parts: ['pelvis', 'thighL'] },
      { title: { tr: 'Bel çukurlaşıyor', en: 'Lower back arches', es: 'La lumbar se arquea' },
        fix: { tr: 'Kaburgalar aşağı, kalçayı içe dön', en: 'Ribs down, tuck the pelvis', es: 'Costillas abajo, pelvis en retroversión' },
        fixText: { tr: 'Hareket kalçadan; bel nötr kalır', en: 'Move from the hips; lower back stays neutral', es: 'Mueve la cadera; la lumbar queda neutra' },
        at: 'top', pose: { lumbar: -30, thoracic: 45, lift: 0.035 }, line: ['shoulderR', 'waist', 'pelvis'], goodLine: ['shoulderR', 'hipR'], parts: ['waist'] },
    ],
    cues: [{ tr: 'Tek topuktan it', en: 'Drive through one heel', es: 'Empuja con un talón' },
      { tr: 'Kalça düz, serbest bacak hizada', en: 'Hips level, free leg in line', es: 'Cadera nivelada, pierna libre alineada' },
      { tr: 'Tepede kalçayı sık', en: 'Squeeze at the top', es: 'Aprieta arriba' }],
  };
})();
