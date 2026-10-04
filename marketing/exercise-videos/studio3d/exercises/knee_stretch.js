/* Reformer Knee Stretch (Round Back), representative of the Knee Stretch Series. Kneeling on the carriage facing the
 * footbar: hands flat on the footbar (weight-bearing, handSurface = bar top), knees on the pad, toes tucked with the soles
 * against the front of the shoulder blocks; spine in a C-curve (pelvis tucked, lumbar/thoracic flexed, chin down). The
 * thighs swing back to push the carriage out ~25-30 cm and draw it back in; trunk and hands stay still.
 * - Every pose rests on the same two contacts [kneeR on the pad, ankleR above it] so the shin lies on the pad and the
 *   tucked toes reach the pad (rigid rotation, no contact-set blend).
 * - fit() (Gauss-Newton, from jumps_basic.js) solves hip, shoulder flexion and the rail offset per pose so the FK wrist sits
 *   on the flat-hand IK target on the bar with the torso at ~50 deg; both hands are then pinned there (same targets).
 * - The carriage follows the soles (block front face = rearmost point of the shoe).
 * Spec angles are not mutually consistent (hip 100 with knee 100 and trunk 50 cannot all hold with the shin on the pad, and
 * knee 100 -> 90 moves the knees ~7 cm, not 35): the knee opens 100 -> 78 for ~24 cm of travel, the measured hip
 * (pelvis->neck line vs thigh) drops ~18 deg (48 -> 30, spec 100 -> 80), trunk ~52-56 (spec 50) and the round back hold. */
(function () {
  const TOP = 0.38, BX = 1.0, FBH = 0.28, BAR_TOP = TOP + FBH + 0.022, HZ = 0.185;
  const carriage = (sol) => Math.min(sol.J.heelL[0], sol.J.heelR[0], sol.J.toeL[0], sol.J.toeR[0]) + 0.29;
  const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };
  const LEAN = 50;
  const BASE = { trunk: 30, abd: 3, flat: false, ankle: -14, lumbar: 30, thoracic: 18, neck: 16, shAbd: 2, el: 0,
    ground: [['kneeR', TOP], ['ankleR', TOP + 0.085]], handFlat: true, handSurface: BAR_TOP, elbowPole: [-0.3, -1, 0.75] };
  const HANDS = { handL: { at: [BX, BAR_TOP, -HZ] }, handR: { at: [BX, BAR_TOP, HZ] } };

  // damped Gauss-Newton on pose keys (finite differences); res(J) -> residual array
  function fit(q, keys, res) {
    const { solve, expand } = FB;
    const S = (x) => { const p = Object.assign({}, q); keys.forEach((k, i) => { if (k === 'dx') p.pos = [x[i], 0, 0]; else p[k] = x[i]; }); return p; };
    const R = (x) => res(solve(expand(S(x)), CTX));
    let x = keys.map((k) => (k === 'dx' ? (q.pos ? q.pos[0] : 0) : (q[k] ?? 0)));
    for (let it = 0; it < 60; it++) {
      const r0 = R(x), n = x.length, m = r0.length;
      if (Math.hypot(...r0) < 1e-5) break;
      const Jm = [];
      for (let j = 0; j < n; j++) { const e = keys[j] === 'dx' ? 1e-4 : 0.02; const xx = x.slice(); xx[j] += e; const r1 = R(xx); Jm.push(r1.map((v, i) => (v - r0[i]) / e)); }
      // normal equations A d = b
      const A = Array.from({ length: n }, (_, a) => Array.from({ length: n }, (_, b) => { let s = 0; for (let i = 0; i < m; i++) s += Jm[a][i] * Jm[b][i]; return s + (a === b ? 1e-9 : 0); }));
      const b = Array.from({ length: n }, (_, a) => { let s = 0; for (let i = 0; i < m; i++) s += Jm[a][i] * r0[i]; return s; });
      for (let c = 0; c < n; c++) { let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r; [A[c], A[p]] = [A[p], A[c]]; [b[c], b[p]] = [b[p], b[c]];
        for (let r = c + 1; r < n; r++) { const f = A[r][c] / A[c][c]; for (let k = c; k < n; k++) A[r][k] -= f * A[c][k]; b[r] -= f * b[c]; } }
      const d = new Array(n).fill(0);
      for (let r = n - 1; r >= 0; r--) { let s = b[r]; for (let k = r + 1; k < n; k++) s -= A[r][k] * d[k]; d[r] = s / A[r][r]; }
      let sc = 1; keys.forEach((k, i) => { const lim = k === 'dx' ? 0.05 : 6; if (Math.abs(d[i]) * sc > lim) sc = lim / Math.abs(d[i]); });
      x = x.map((v, i) => v - d[i] * sc);
    }
    return S(x);
  }
  const wx = (s) => { const t = s.F.thorax[1], hl = Math.hypot(t[0], t[2]); return BX - FB.BODY.hand * 0.6 * t[0] / hl; };
  const D = 180 / Math.PI;
  const lean = (s) => { const { V } = FB, u = V.norm(V.sub(s.J.neck, s.J.pelvis)); return Math.acos(u[1]) * D; };
  let H0 = 60;
  const kneel = (p) => {
    const q = fit(Object.assign({}, BASE, { hip: H0 }, p), ['hip', 'dx'],
      (s) => [s.J.wristR[1] - (BAR_TOP + 0.042), s.J.wristR[0] - wx(s)]);
    H0 = q.hip;
    return Object.assign(q, { ik: Object.assign({}, HANDS) });
  };
  let P = null;
  const IN = { knee: 100, sh: 95 }, OUT = { knee: 78, sh: 110 };
  const poses = () => { if (P) return P; const a = kneel(IN); return (P = { in: a, out: kneel(OUT) }); };

  window.EXERCISE = {
    id: 'knee_stretch',
    name: { tr: 'Knee Stretch', en: 'Knee Stretch', es: 'Knee Stretch' },
    category: { tr: 'Reformer · Yuvarlak sırt', en: 'Reformer · Round back', es: 'Reformer · Espalda redonda' },
    equipmentLabel: { tr: 'Reformer · 1-2 kırmızı yay', en: 'Reformer · 1-2 red springs', es: 'Reformer · 1-2 muelles rojos' },
    muscles: ['core', 'quads', 'glutes', 'delts'],
    tempo: '1.5-1.5',
    view: { yaw: 90, pitch: 6, zoom: 1.15, dx: -20 },
    alt: { yaw: 30, pitch: 14, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
      text: { tr: 'Sadece kalça hareket eder, gövde sabit', en: 'Only the hips move, the torso stays still', es: 'Solo se mueve la cadera, el torso quieto' } },
    setupView: { yaw: 35, pitch: 18 },
    props: [['reformer', { springs: 2, carriage, footbarH: FBH }]],
    ctx: CTX,
    contacts: ['handL', 'handR', 'kneeL', 'kneeR', 'toeL', 'toeR'],
    get poses() { return poses(); },
    rest: 'in',
    rep: [
      { to: 'out', dur: 1.5, phase: 0 },
      { to: 'in', dur: 1.5, phase: 1 },
    ],
    setup: { tr: 'Kızakta diz çök, ayak tabanları omuz bloklarına dayalı. Eller footbar’da, sırt yuvarlak, baş aşağıda.',
      en: 'Kneel on the carriage, soles against the shoulder blocks. Hands on the footbar, back rounded, head down.',
      es: 'De rodillas en el carro, plantas contra los topes. Manos en la barra, espalda redonda, cabeza abajo.' },
    phases: [
      { name: { tr: 'Dizleri geri it', en: 'Push the knees back', es: 'Lleva las rodillas atrás' }, breath: 'out', slow: 1.3, line: ['pelvis', 'waist', 'neck'],
        text: { tr: 'Kalçadan iterek kızağı geri gönder. Sırt yuvarlak kalır, gövde kıpırdamaz.', en: 'Push from the hips to send the carriage out. The back stays round, the torso still.', es: 'Empuja desde la cadera. La espalda sigue redonda y el torso quieto.' } },
      { name: { tr: 'Dizleri getir', en: 'Draw the knees in', es: 'Recoge las rodillas' }, breath: 'in', slow: 1.3, arc: ['shoulderR', 'hipR', 'kneeR'],
        text: { tr: 'Karnı içeri çekerek dizleri bara doğru getir; kızak sessizce kapanır.', en: 'Scoop the belly and draw the knees in; the carriage closes quietly.', es: 'Mete el abdomen y recoge las rodillas; el carro se cierra sin golpe.' } },
    ],
    tempoText: { tr: '1,5 sn it · 1,5 sn getir · 10-12 tekrar', en: '1.5 s out · 1.5 s in · 10-12 reps', es: '1,5 s fuera · 1,5 s dentro · 10-12 repeticiones' },
    mistakes: [
      { title: { tr: 'Bel çukurlaşıyor', en: 'Lower back arches', es: 'La zona lumbar se arquea' },
        fix: { tr: 'C-kıvrımını koru', en: 'Keep the C-curve', es: 'Mantén la curva en C' },
        fixText: { tr: 'Kuyruk sokumu aşağı, göbek omurgaya', en: 'Tailbone down, navel to spine', es: 'Coxis abajo, ombligo a la columna' },
        at: 'out', get pose() { return kneel(Object.assign({}, OUT, { lumbar: -10, thoracic: -4, neck: -8 })); },
        line: ['pelvis', 'waist', 'neck'], parts: ['waist', 'chest'] },
      { title: { tr: 'Gövde sallanıyor', en: 'The torso rocks', es: 'El torso se balancea' },
        fix: { tr: 'Omuzlar sabit, sadece kalça', en: 'Shoulders still, only the hips', es: 'Hombros quietos, solo la cadera' },
        fixText: { tr: 'Omuzlar bileklerin üstünde kalır, kollar düz', en: 'Shoulders stay over the wrists, arms straight', es: 'Hombros sobre las muñecas, brazos rectos' },
        at: 'out', get pose() { return kneel(Object.assign({}, OUT, { sh: 134, lumbar: 22 })); },
        line: ['wristR', 'shoulderR'], marks: ['shoulderR'], parts: ['upper', 'chest'] },
    ],
    cues: [{ tr: 'Sırt yuvarlak kalır', en: 'Back stays rounded', es: 'La espalda sigue redonda' },
      { tr: 'Kalça hareket eder, gövde sabit', en: 'Hips move, torso stays still', es: 'La cadera se mueve, el torso no' },
      { tr: 'Elleri bara bastır', en: 'Press into the bar', es: 'Empuja la barra' }],
  };
})();
