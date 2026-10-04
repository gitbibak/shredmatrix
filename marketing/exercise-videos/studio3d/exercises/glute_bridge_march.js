/* Glute bridge march: hold the bridge top, lift the right knee, put it down, lift the left knee (alternating).
 * Same contact model as single_leg_glute_bridge.js: shoulders on the mat + pelvis at a solved height (two-contact ground),
 * shoulders anchored, upper back kept flat (thoracic flexion; also keeps the ponytail on the mat).
 * Feet: every pose carries ankle IK targets (`ik.ankleL/R`, position + foot frame). Planted feet use the spot found from a
 * hips-down reference pose (feet flat, knees solved); a lifted foot uses its own FK position, so the foot travels on a
 * straight line between floor and lifted spot while the leg IK bends the knee — no sliding, no unplant pops.
 * Hands rest beside the hips (hand joint 6.6 cm above the mat: lower values switch the engine to a weight-bearing
 * flat hand with the fingers pointing at the head). */
(function () {
  const MAT = 0.012;
  const CTX = { anchorX: ['shoulderL', 'shoulderR'], anchorAt: [-0.55, 0] };
  const G = (h) => [['shoulderR', MAT + 0.03 + 0.008 * Math.min(1, h / 0.15)], ['pelvis', MAT + h]];
  const BASE = { trunk: -90, palm: 'down', curl: 0.15, elbowPole: [0, 0, 1], abd: 4 };
  const bis = (f, lo, hi, n = 40) => { for (let i = 0; i < n; i++) { const m = (lo + hi) / 2; if (f(m) > 0) hi = m; else lo = m; } return (lo + hi) / 2; };

  function build(mistakes) {
    const { solve, expand, V } = FB;
    const D = 180 / Math.PI;
    const sv = (p, ctx = CTX) => solve(expand(p), ctx);
    const noIk = (p) => Object.assign({}, p, { ik: Object.assign({}, p.ik, { ankleL: undefined, ankleR: undefined }) });
    const clean = (ik) => { const o = {}; for (const k in ik) if (ik[k]) o[k] = ik[k]; return o; };
    const headDown = (p) => Object.assign(p, { neck: bis((n) => sv(Object.assign({}, p, { neck: n })).J.head[1] - MAT - 0.11, -40, 60) });
    const frame = (F) => ({ 0: F[0].slice(), 1: F[1].slice(), 2: F[2].slice() });
    // reference: hips down, knees bent so both feet rest flat -> foot spots
    const ref = Object.assign({}, BASE, { hip: 57, ground: G(0.012) });
    ref.knee = bis((k) => MAT - sv(Object.assign({}, ref, { knee: k })).J.heelR[1], 90, 150);
    const r0 = sv(ref), sh = r0.J.shoulderR;
    const feet = { ankleL: { at: r0.J.ankleL.slice(), foot: frame(r0.F.footL) }, ankleR: { at: r0.J.ankleR.slice(), foot: frame(r0.F.footR) } };
    const hands = { handL: { at: [sh[0] + 0.5, MAT + 0.03, -0.2] }, handR: { at: [sh[0] + 0.5, MAT + 0.03, 0.2] } };
    const hipAng = (s, k) => { const up = V.norm(V.sub(s.J.neck, s.J.pelvis)), th = V.norm(V.sub(s.J['knee' + k], s.J['hip' + k])); return Math.acos(Math.max(-1, Math.min(1, -V.dot(up, th)))) * D; };
    // bridge top: pelvis height for a straight shoulder-hip-knee line
    const top = Object.assign({}, BASE, { thoracic: 37, hip: 0, knee: 105, ik: Object.assign({}, hands, feet) });
    const h = bis((y) => 3 - hipAng(sv(Object.assign({}, top, { ground: G(y) })), 'R'), 0.05, 0.205);
    top.ground = G(h);
    headDown(top);
    // knee lifts: thigh ~vertical, knee ~100; the lifted foot follows its FK spot
    const lift = (S) => {
      const p = Object.assign({}, top, { ['hip' + S]: 45, ['knee' + S]: 100, ['flat' + S]: false, ['ankle' + S]: -10 });
      const s = sv(noIk(p));
      p.ik = Object.assign({}, hands, feet, { ['ankle' + S]: { at: s.J['ankle' + S].slice(), foot: frame(s.F['foot' + S]) } });
      return p;
    };
    const poses = { top, liftR: lift('R'), liftL: lift('L') };
    for (const [at, mp] of mistakes) {
      if (mp.lift) { mp.ground = G(h + mp.lift); delete mp.lift; }
      const merged = Object.assign({}, poses[at], mp);
      if (mp.refoot) { const s = sv(noIk(merged)); mp.ik = Object.assign({}, poses[at].ik, { ankleR: { at: s.J.ankleR.slice(), foot: frame(s.F.footR) } }); delete mp.refoot; merged.ik = mp.ik; }
      headDown(merged); mp.neck = merged.neck;
    }
    for (const k in poses) poses[k].ik = clean(poses[k].ik);
    return poses;
  }

  window.EXERCISE = {
    id: 'glute_bridge_march',
    name: { tr: 'Glute Bridge March', en: 'Glute Bridge March', es: 'Marcha en puente de glúteos' },
    category: { tr: 'Bacak · Kalça', en: 'Legs · Glutes', es: 'Piernas · Glúteos' },
    equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
    muscles: ['glutes', 'core', 'hamstrings', 'obliques'],
    tempo: '1-1',
    view: { yaw: 90, pitch: 6, zoom: 1.1 },
    alt: { yaw: 20, pitch: 16, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
      text: { tr: 'Kalça yüksek ve düz, dönmüyor', en: 'Hips high and level, no twisting', es: 'Cadera alta y nivelada, sin girar' } },
    setupView: { yaw: 50, pitch: 20 },
    contacts: ['shoulderR', 'ballR', 'ballL'],
    props: [['mat', { at: [-0.12, 0.006, 0], length: 1.85, width: 0.72 }]],
    ctx: CTX,
    get poses() { return this._poses || (this._poses = build(this.mistakes.map((m) => [m.at, m.pose]))); },
    rest: 'top',
    rep: [
      { to: 'liftR', dur: 1.0, phase: 0 },
      { to: 'top', dur: 1.0, phase: 1 },
      { to: 'liftL', dur: 1.0, phase: 2 },
      { to: 'top', dur: 1.0, phase: 1 },
    ],
    setup: { tr: 'Sırtüstü köprü kur: kalça yukarıda, omuz-kalça-diz tek çizgide, iki ayak yerde.',
      en: 'Set up a bridge: hips up, shoulders, hips and knees in one line, both feet flat.',
      es: 'Haz un puente: cadera arriba, hombros, cadera y rodillas en línea, pies apoyados.' },
    phases: [
      { name: { tr: 'Sağ dizi kaldır', en: 'Lift the right knee', es: 'Sube la rodilla derecha' }, breath: 'out', line: ['hipL', 'hipR'],
        text: { tr: 'Kalça yüksek ve düz kalır. Uyluk dikleşene kadar dizi yavaşça kaldır.', en: 'Hips stay high and level. Slowly lift until the thigh is upright.', es: 'Cadera alta y nivelada. Sube despacio hasta que el muslo quede vertical.' } },
      { name: { tr: 'Ayağı indir', en: 'Lower the foot', es: 'Baja el pie' }, breath: 'in',
        text: { tr: 'Ayağı kontrollü yere koy. Kalça düşmez.', en: 'Set the foot down with control. Hips don\'t drop.', es: 'Apoya el pie con control. La cadera no cae.' } },
      { name: { tr: 'Sol dizi kaldır', en: 'Lift the left knee', es: 'Sube la rodilla izquierda' }, breath: 'out', line: ['hipL', 'hipR'],
        text: { tr: 'Destek bacağın kalçasını sık. Gövde dönmez.', en: 'Squeeze the standing-side glute. No twisting.', es: 'Aprieta el glúteo de apoyo. Sin girar el tronco.' } },
    ],
    tempoText: { tr: '1 sn kaldır · 1 sn indir · her bacak', en: '1 s up · 1 s down · each leg', es: '1 s arriba · 1 s abajo · cada pierna' },
    mistakes: [
      { title: { tr: 'Kalça kalkan bacak tarafına düşüyor', en: 'Hip drops on the lifted side', es: 'La cadera cae del lado elevado' },
        fix: { tr: 'Destek kalçasını sık', en: 'Squeeze the standing glute', es: 'Aprieta el glúteo de apoyo' },
        fixText: { tr: 'Kalça düz kalmıyorsa dizi daha az kaldır', en: 'If the hips tilt, lift the knee less', es: 'Si la cadera se inclina, sube menos la rodilla' },
        at: 'liftR', pose: { roll: -14, twist: 14, refoot: true }, view: { yaw: -25, pitch: 32 }, marks: ['hipR'], line: ['hipL', 'hipR'], parts: ['pelvis', 'thighR'] },
      { title: { tr: 'Bel çukurlaşıyor', en: 'Lower back arches', es: 'La lumbar se arquea' },
        fix: { tr: 'Kaburgalar aşağı', en: 'Ribs down', es: 'Costillas abajo' },
        fixText: { tr: 'Kalçayı hafif içe döndür, karnı sık', en: 'Tuck the pelvis slightly and brace', es: 'Retroversión ligera y abdomen firme' },
        at: 'liftR', pose: { lumbar: -30, thoracic: 45, lift: 0.035 }, line: ['shoulderR', 'waist', 'pelvis'], goodLine: ['shoulderR', 'hipR'], parts: ['waist'] },
    ],
    cues: [{ tr: 'Kalça yüksek ve düz', en: 'Hips high and level', es: 'Cadera alta y nivelada' },
      { tr: 'Destek kalçasını sık', en: 'Squeeze the standing glute', es: 'Aprieta el glúteo de apoyo' },
      { tr: 'Yavaş diz kaldır, dönme', en: 'Slow knee lift, no twist', es: 'Rodilla lenta, sin girar' }],
  };
})();
