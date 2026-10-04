/* Barbell hip thrust. Upper back on a 42 cm bench (bench across the back: prop length = depth, width along z),
 * barbell on the hip crease held by both hands, feet flat.
 * Contacts: shoulders on the bench edge + pelvis at a solved height (two-contact ground), shoulders anchored, so the body
 * pivots about the upper back on the bench. Feet: ankle IK targets from the top pose (hip 0°, knee 90°, shins vertical),
 * found by solving the top pelvis height that puts the FK heels on the floor; the start pelvis height puts the bar
 * (r 0.225 plates) just above the floor. Bar = midpoint of the hands (holdL/holdR on the hip crease, thorax frame).
 * Spec note: start knee 120 is inconsistent with feet set for vertical shins at the top (knee 90) and the hips lowering
 * straight down; with the feet fixed the start knee measures ~95 (hip ~90). measure.mjs hip angle includes the 9 deg
 * abduction (sagittal hip = 0 at the top). */
(function () {
  const BH = 0.42;                // bench pad top
  const CTX = { anchorX: ['shoulderL', 'shoulderR'], anchorAt: [-0.45, 0] };
  const G = (h) => [['shoulderR', BH + 0.02], ['pelvis', h]];
  const HOLD = { holdL: [0.135, -0.37, 0.3], holdR: [0.135, -0.37, 0.3], elbowPole: [-0.4, 0.2, 1], palm: 'down' };
  const BASE = Object.assign({ trunk: -90, abd: 9, hrot: 10 }, HOLD);
  const bis = (f, lo, hi, n = 40) => { for (let i = 0; i < n; i++) { const m = (lo + hi) / 2; if (f(m) > 0) hi = m; else lo = m; } return (lo + hi) / 2; };

  function build(mistakes) {
    const { solve, expand } = FB;
    const sv = (p) => solve(expand(p), CTX);
    const frame = (F) => ({ 0: F[0].slice(), 1: F[1].slice(), 2: F[2].slice() });
    const barY = (s) => (s.J.handL[1] + s.J.handR[1]) / 2;
    // top: torso level with the thighs, knees 90 (shins vertical); pelvis height so the FK heels touch the floor
    const top = Object.assign({}, BASE, { hip: 0, knee: 90, neck: 34 });
    const h = bis((y) => sv(Object.assign({}, top, { ground: G(y) })).J.heelR[1], 0.2, 0.6);
    top.ground = G(h);
    const st = sv(top);
    const feet = { ankleL: { at: st.J.ankleL.slice(), foot: frame(st.F.footL) }, ankleR: { at: st.J.ankleR.slice(), foot: frame(st.F.footR) } };
    top.ik = Object.assign({}, feet);
    // start: hips low, bar just above the floor (plates rest on it)
    const start = Object.assign({}, BASE, { hip: 85, knee: 120, neck: 18, ik: Object.assign({}, feet) });
    const h0 = bis((y) => barY(sv(Object.assign({}, start, { ground: G(y) }))) - 0.232, -0.05, h);
    start.ground = G(h0);
    const poses = { start, top };
    for (const [at, mp] of mistakes) {
      if (mp.lift) { mp.ground = G(h + mp.lift); delete mp.lift; }
      if (mp.feetFwd) { const d = mp.feetFwd; mp.ik = { ankleL: { at: [feet.ankleL.at[0] + d, feet.ankleL.at[1], feet.ankleL.at[2]], foot: feet.ankleL.foot }, ankleR: { at: [feet.ankleR.at[0] + d, feet.ankleR.at[1], feet.ankleR.at[2]], foot: feet.ankleR.foot } }; delete mp.feetFwd; }
    }
    return poses;
  }

  window.EXERCISE = {
    id: 'hip_thrust',
    name: { tr: 'Hip Thrust', en: 'Hip Thrust', es: 'Hip thrust' },
    category: { tr: 'Bacak · Kalça', en: 'Legs · Glutes', es: 'Piernas · Glúteos' },
    equipmentLabel: { tr: 'Halter · Bench', en: 'Barbell · Bench', es: 'Barra · Banco' },
    muscles: ['glutes', 'hamstrings', 'adductors', 'core'],
    tempo: '1.2-1-1.8',
    view: { yaw: 90, pitch: 6 },
    alt: { yaw: 38, pitch: 14, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
      text: { tr: 'Dizler ayak uçları yönünde, kalça tam açılır', en: 'Knees over the toes, hips fully open', es: 'Rodillas sobre los pies, cadera extendida' } },
    setupView: { yaw: 40, pitch: 16 },
    setupMarks: [{ type: 'span', joints: ['ankleR', 'ankleL'], label: { tr: 'Omuz genişliği', en: 'Shoulder width', es: 'Ancho de hombros' } }],
    contacts: ['shoulderR', 'ballR', 'ballL'],
    props: [['bench', { at: [-0.62, 0, 0], length: 0.42, width: 1.1, height: BH }], ['barbell', { grip: 'pronated' }]],
    ctx: CTX,
    get poses() { return this._poses || (this._poses = build(this.mistakes.map((m) => [m.at, m.pose]))); },
    rest: 'start',
    rep: [
      { to: 'top', dur: 1.2, phase: 0 },
      { to: 'top', dur: 1.0, phase: 1 },
      { to: 'start', dur: 1.8, phase: 2 },
    ],
    setup: { tr: 'Kürek kemiğinin alt ucu bench kenarında. Bar kalça kıvrımında, ayaklar omuz genişliğinde yerde.',
      en: 'Lower shoulder blades on the bench edge. Bar in the hip crease, feet flat, shoulder-width.',
      es: 'Escápulas en el borde del banco. Barra en el pliegue de la cadera, pies al ancho de hombros.' },
    phases: [
      { name: { tr: 'İt', en: 'Thrust', es: 'Empuja' }, breath: 'out',
        text: { tr: 'Topuklardan it, kalçayı gövde yere paralel olana kadar kaldır.', en: 'Drive through the heels until your torso is parallel to the floor.', es: 'Empuja con los talones hasta que el torso quede paralelo al suelo.' } },
      { name: { tr: 'Tepede sık', en: 'Squeeze', es: 'Aprieta' }, breath: 'hold', arc: ['hipR', 'kneeR', 'ankleR'], line: ['shoulderR', 'hipR', 'kneeR'],
        text: { tr: 'Kaval kemiği dik, diz 90°. Çene içeride, kalçayı 1 sn sık.', en: 'Shins vertical, knees 90°. Chin tucked, squeeze 1 s.', es: 'Tibias verticales, rodillas a 90°. Barbilla adentro, aprieta 1 s.' } },
      { name: { tr: 'Kontrollü in', en: 'Lower', es: 'Baja' }, breath: 'in',
        text: { tr: 'Kalçayı düz aşağı indir. Sırt bench üzerinde kalır.', en: 'Lower the hips straight down. Upper back stays on the bench.', es: 'Baja la cadera en vertical. La espalda sigue en el banco.' } },
    ],
    tempoText: { tr: '1,2 sn it · 1 sn sık · 1,8 sn in', en: '1.2 s up · 1 s squeeze · 1.8 s down', es: '1,2 s arriba · 1 s aprieta · 1,8 s abajo' },
    mistakes: [
      { title: { tr: 'Tepede bel çukurlaşıyor', en: 'Arching at the top', es: 'Arqueo lumbar arriba' },
        fix: { tr: 'Çene ve kalça içeride', en: 'Tuck chin and pelvis', es: 'Barbilla y pelvis adentro' },
        fixText: { tr: 'Kaburgalar aşağı; kalça gövde hizasında durur', en: 'Ribs down; hips stop in line with the torso', es: 'Costillas abajo; la cadera para en línea con el torso' },
        at: 'top', pose: { lumbar: -24, thoracic: -6, neck: 10, lift: 0.05 }, line: ['shoulderR', 'waist', 'pelvis'], goodLine: ['shoulderR', 'hipR', 'kneeR'], parts: ['waist'] },
      { title: { tr: 'Ayaklar çok önde', en: 'Feet too far out', es: 'Pies demasiado lejos' },
        fix: { tr: 'Ayakları kalçaya yaklaştır', en: 'Bring the feet closer', es: 'Acerca los pies' },
        fixText: { tr: 'Tepede kaval kemiği dik olmalı', en: 'Shins should be vertical at the top', es: 'Las tibias verticales arriba' },
        at: 'top', pose: { feetFwd: 0.17, knee: 62 }, line: ['kneeR', 'ankleR'], parts: ['shinR', 'thighR'] },
    ],
    cues: [{ tr: 'Tepede kaval dik', en: 'Shins vertical at the top', es: 'Tibias verticales arriba' },
      { tr: 'Çene içeride, kaburgalar aşağı', en: 'Chin tucked, ribs down', es: 'Barbilla adentro, costillas abajo' },
      { tr: 'Kalçayı sıkıca kilitle', en: 'Squeeze the glutes hard', es: 'Aprieta fuerte los glúteos' }],
  };
})();
