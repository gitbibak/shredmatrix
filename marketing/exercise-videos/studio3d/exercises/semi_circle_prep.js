/* Semi Circle Prep (reformer, supine bridge, balls of the feet on the footbar, hands on the shoulder blocks).
 * Geometry from pelvic_curl_reformer.js / footwork.js: a lying onBar() pose (carriage closed) gives the rail offset and
 * the ankle pins on the bar. The SHOULDERS are the horizontal anchor; the bridge keeps the pins, and pressing out only
 * adds -10 cm to pos x, so the shoulders, the carriage (follows the shoulders) and the hands (pinned on the block tops,
 * re-solved per pose) travel together while the feet stay on the bar and the knees open by IK.
 * Spec start angles (hip 100) contradict "hips in bridge"; the bridge is used (shoulder-hip-knee 162° -> 168°, knee ~98 -> ~78).
 * Spec travel 18 cm with knee 100 -> 90 is inconsistent (18 cm opens the knee to ~60° with the feet on the bar);
 * 10 cm travel is used so the knee stays near the spec range. */
(function () {
  const BAR_R = 0.022;
  const BLOCK = 0.245;
  const OUT = 0.10;
  const TOP = () => FB.REFORMER.top;
  const shX = (sol) => (sol.J.shoulderL[0] + sol.J.shoulderR[0]) / 2;
  const carriage = (sol) => shX(sol) + BLOCK;
  const CTX = { anchorX: ['shoulderL', 'shoulderR'], anchorAt: [0, 0] };
  const ARMS = { sh: 158, shAbd: 18, el: 120, palm: 'down', curl: 0.6, elbowPole: [0.25, 0.3, 1] };
  const BASE = Object.assign({ trunk: -90, flat: false, neck: 10, abd: 3 }, ARMS);

  function onBar(p) {
    const { solve, expand } = FB, R = FB.REFORMER;
    const bx = R.footbarX, by = R.top + R.footbarH;
    const q = Object.assign({}, BASE, { ground: [['shoulderR', TOP()], ['pelvis', TOP()]] }, p);
    const at = (h) => solve(expand(Object.assign({}, q, { hip: h })), CTX);
    const dy = (s) => s.J.ballR[1] - (by + BAR_R * s.F.footR[1][1]);
    let lo = -30, hi = 100;
    for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (dy(at(m)) > 0) hi = m; else lo = m; }
    const hip = (lo + hi) / 2, s = at(hip);
    const dx = bx + BAR_R * s.F.footR[1][0] - s.J.ballR[0];
    const pin = (k) => ({ at: [s.J['ankle' + k][0] + dx, s.J['ankle' + k][1], s.J['ankle' + k][2]], foot: s.F['foot' + k].map((c) => c.slice()) });
    return Object.assign(q, { hip, pos: [dx, 0, 0], ik: { ankleL: pin('L'), ankleR: pin('R') } });
  }
  let L0 = null;
  const lying = () => L0 || (L0 = onBar({ knee: 104, ankle: -24 }));
  // bridge: same feet; pelvis `lift` above its lying height; carriage `out` m from closed; hands gripping the block tops
  function bridge(p, lift, out = 0) {
    const { solve, expand } = FB;
    const s = lying();
    const q = Object.assign({}, BASE, { hip: 0, knee: s.knee, ankle: s.ankle }, p,
      { ground: [['shoulderR', TOP() + 0.01], ['pelvis', TOP() + lift]], pos: [s.pos[0] - out, 0, 0] });
    q.ik = { ankleL: s.ik.ankleL, ankleR: s.ik.ankleR };
    const J = solve(expand(q), CTX).J, bx = shX({ J }) - 0.33 + BLOCK;
    const hand = (k, sg) => ({ at: [bx - 0.04, TOP() + 0.12, sg * 0.175] });
    q.ik = Object.assign({}, q.ik, { handL: hand('L', -1), handR: hand('R', 1) });
    return q;
  }
  const UP = { lumbar: -2, thoracic: 20, neck: 46 };

  window.EXERCISE = {
    id: 'semi_circle_prep',
    name: { tr: 'Semi Circle Prep', en: 'Semi Circle Prep', es: 'Preparación del semicírculo' },
    category: { tr: 'Reformer · Kalça', en: 'Reformer · Glutes', es: 'Reformer · Glúteos' },
    equipmentLabel: { tr: 'Reformer · 2 ağır yay', en: 'Reformer · 2 heavy springs', es: 'Reformer · 2 muelles fuertes' },
    muscles: ['glutes', 'hamstrings', 'lowerback', 'core'],
    tempo: '2-2',
    view: { yaw: 90, pitch: 8, zoom: 1.15, dx: -30 },
    alt: { yaw: 48, pitch: 24, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
      text: { tr: 'Köprü yüksek, kızak bacaklarla kayar', en: 'Bridge stays high, the legs move the carriage', es: 'El puente alto, las piernas mueven el carro' } },
    setupView: { yaw: 40, pitch: 22 },
    props: [['reformer', { springs: 2, carriage }]],
    ctx: CTX,
    contacts: ['ballL', 'ballR', 'handL', 'handR', 'shoulderL', 'shoulderR', 'head'],
    get poses() {
      return {
        start: bridge(Object.assign({}, UP), 0.25),
        out: bridge(Object.assign({}, UP), 0.25, OUT),
      };
    },
    rest: 'start',
    rep: [
      { to: 'out', dur: 2.0, phase: 0 },
      { to: 'start', dur: 2.0, phase: 1 },
    ],
    setup: { tr: 'Sırtüstü, ön tabanlar barda, eller omuz bloklarında. Kalçayı köprüye kaldır; ağır yaylar.',
      en: 'On your back, balls of the feet on the bar, hands on the shoulder blocks. Lift the hips into a bridge; heavy springs.',
      es: 'Boca arriba, metatarsos en la barra, manos en los topes. Sube la cadera en puente; muelles fuertes.' },
    phases: [
      { name: { tr: 'Kızağı dışarı it', en: 'Press the carriage out', es: 'Empuja el carro' }, breath: 'out', slow: 1.4, line: ['shoulderR', 'hipR', 'kneeR'],
        text: { tr: 'Dizleri açarak kızağı it; kalça yüksekte, köprü bozulmaz.', en: 'Open the knees to push the carriage out; hips stay high, the bridge holds.', es: 'Abre las rodillas para empujar el carro; la cadera alta, el puente se mantiene.' } },
      { name: { tr: 'Arka bacakla çek', en: 'Pull in with the hamstrings', es: 'Tira con los isquios' }, breath: 'in', slow: 1.4, arc: ['hipR', 'kneeR', 'ankleR'],
        text: { tr: 'Arka bacak ve kalça kızağı geri çeker. Kalça düşmez.', en: 'Hamstrings and glutes draw the carriage back in. The hips don’t drop.', es: 'Isquios y glúteos traen el carro. La cadera no baja.' } },
    ],
    tempoText: { tr: '2 sn it · 2 sn çek · 3 tekrar', en: '2 s press · 2 s pull · 3 reps', es: '2 s empuja · 2 s tira · 3 repeticiones' },
    mistakes: [
      { title: { tr: 'Kalça düşüyor', en: 'Hips drop', es: 'La cadera cae' },
        fix: { tr: 'Köprüyü koru', en: 'Hold the bridge', es: 'Mantén el puente' },
        fixText: { tr: 'Kalça ve arka bacak sürekli çalışsın, kalça yüksekte', en: 'Glutes and hamstrings keep working, hips stay high', es: 'Glúteos e isquios activos, cadera alta' },
        at: 'out', get pose() { return bridge({ lumbar: 4, thoracic: 14, neck: 36, hip: 40 }, 0.1, OUT); },
        line: ['shoulderR', 'hipR', 'kneeR'], marks: ['pelvis'], parts: ['pelvis', 'thigh'] },
      { title: { tr: 'Bel çukurlaşıyor', en: 'Low back arches', es: 'La lumbar se arquea' },
        fix: { tr: 'Kaburgalar içeride', en: 'Ribs knitted', es: 'Costillas cerradas' },
        fixText: { tr: 'Köprü uzun bir çizgi; karnı içeride tut', en: 'The bridge is one long line; keep the belly in', es: 'El puente es una línea larga; abdomen adentro' },
        at: 'out', get pose() { return bridge({ lumbar: -22, thoracic: 10, neck: 50, hip: -10 }, 0.31, OUT); },
        line: ['shoulderR', 'hipR', 'kneeR'], marks: ['waist'], parts: ['waist', 'chest'] },
    ],
    cues: [{ tr: 'Kalça hep yüksekte', en: 'Hips stay high', es: 'Cadera siempre alta' },
      { tr: 'Kızağı bacaklar hareket ettirir', en: 'The legs move the carriage', es: 'Las piernas mueven el carro' },
      { tr: 'Omuzlar geniş, boyun uzun', en: 'Shoulders wide, neck long', es: 'Hombros anchos, cuello largo' }],
  };
})();
