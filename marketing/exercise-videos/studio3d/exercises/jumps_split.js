/* Split Jumps (second position) on the reformer jump board (supine). Shown ~2x slower than real (said in the tempo card).
 * jumps_basic.js geometry (FK legs solved by fit(), ankles pinned where the FK pose puts them, carriage on the shoulders),
 * with a wide, turned-out stance:
 *  - land : feet flat on the board face, wide (abd 25, turn-out 30 so the knees track over the toes), knee 115 (spec).
 *  - push : take-off with long legs (knee 3), pointed; abduction re-solved so the shoe tips stay at the landing width
 *           (with straight legs abd 25 would put the feet beyond the board edge) -> carriage ~35-40 cm out.
 *  - air  : card:false in-between key, carriage glides ~5 cm further, feet clear of the board.
 * Spec landing hip 110 assumes a lower board; here the landing hip measures ~65 at knee 115 (as in jumps_basic). */
(function () {
  const BLOCK = 0.245;
  const FACE = 1.095;
  const shX = (sol) => (sol.J.shoulderL[0] + sol.J.shoulderR[0]) / 2;
  const carriage = (sol) => shX(sol) + BLOCK;
  const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };
  const G = () => [['shoulderR', FB.REFORMER.top], ['pelvis', FB.REFORMER.top]];
  const BASE = { trunk: -90, flat: false, neck: 10, sh: -13, shAbd: 12, el: 4, palm: 'down', abd: 25, hrot: 0, footOut: 0 };
  const BALL_Y = 0.70;

  // damped Gauss-Newton on pose keys (finite differences); res(J) -> residual array
  function fit(q, keys, res) {
    const { solve, expand } = FB;
    const S = (x) => { const p = Object.assign({}, q); keys.forEach((k, i) => { if (k === 'dx') p.pos = [x[i], 0, 0]; else p[k] = x[i]; }); return p; };
    const R = (x) => res(solve(expand(S(x)), CTX).J);
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
  const base = (p) => Object.assign({}, BASE, { ground: G() }, p);
  const land = (p) => fit(base(Object.assign({ hip: 80, ankle: 0 }, p)), ['hip', 'ankle', 'dx'],
    (J) => [J.heelR[0] - FACE, J.ballR[0] - FACE, J.ballR[1] - BALL_Y]);
  const push = (p, z) => fit(base(Object.assign({ hip: 20 }, p)), ['hip', 'abd', 'dx'],
    (J) => [J.toeR[0] - FACE, J.toeR[1] - (BALL_Y + 0.07), J.toeR[2] - z]);
  // explicit knee pole (pelvis frame, = the automatic one) in every pose, so the valgus mistake's pole blends without a flip
  const withPole = (q, s) => {
    const { V, M } = FB, Pv = s.F.pelvis, k = V.sub(s.J.kneeR, V.lerp(s.J.hipR, s.J.ankleR, 0.5));
    const d = V.len(k) > 0.02 ? V.norm(k) : M.apply(s.F.thighR, [1, 0, 0]);
    q.kneePole = [V.dot(d, Pv[0]), V.dot(d, Pv[1]), V.dot(d, Pv[2])];
    return q;
  };
  const pinned = (q) => {
    const s = FB.solve(FB.expand(Object.assign({}, q, { ik: undefined, kneePole: undefined })), CTX);
    withPole(q = Object.assign({}, q), s);
    const pin = (k) => ({ at: s.J['ankle' + k].slice(), foot: s.F['foot' + k].map((c) => c.slice()) });
    return Object.assign({}, q, { ik: { ankleL: pin('L'), ankleR: pin('R') } });
  };
  let P = null, Z = 0;
  const poses = () => {
    if (P) return P;
    const L = land({ knee: 115 });
    Z = FB.solve(FB.expand(L), CTX).J.toeR[2];
    const U = push({ knee: 3, ankle: -60 }, Z);
    const A = Object.assign({}, U, { hip: U.hip + 2, knee: 0, ankle: -64, pos: [U.pos[0] - 0.05, 0, 0] });
    return (P = { land: pinned(L), push: pinned(U), air: pinned(A) });
  };

  window.EXERCISE = {
    id: 'jumps_split',
    name: { tr: 'Split Jumps', en: 'Split Jumps', es: 'Saltos en abertura' },
    category: { tr: 'Reformer · Jump board', en: 'Reformer · Jump board', es: 'Reformer · Jump board' },
    equipmentLabel: { tr: 'Jump board · 1 mavi + 1 kırmızı yay', en: 'Jump board · 1 blue + 1 red spring', es: 'Jump board · 1 muelle azul + 1 rojo' },
    muscles: ['quads', 'glutes', 'adductors', 'calves'],
    tempo: '0.8-0.4',
    tempoReps: 4,
    view: { yaw: 90, pitch: 8, zoom: 1.15, dx: -40 },
    alt: { yaw: 150, pitch: 28, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
      text: { tr: 'Dizler ayak parmaklarının üstünde, dışa açık', en: 'Knees open, tracking over the toes', es: 'Rodillas abiertas, sobre los dedos' } },
    setupView: { yaw: 140, pitch: 26 },
    setupMarks: [{ type: 'span', joints: ['ballR', 'ballL'], label: { tr: 'Omuzlardan geniş', en: 'Wider than the shoulders', es: 'Más ancho que los hombros' } }],
    props: [['reformer', { springs: 2, carriage, footbar: false, jumpBoard: true }]],
    ctx: CTX,
    contacts: ['heelL', 'heelR', 'ballL', 'ballR', 'pelvis', 'shoulderR', 'head'],
    get poses() { return poses(); },
    rest: 'land',
    rep: [
      { to: 'push', dur: 0.7, phase: 0 },
      { to: 'air', dur: 0.55, card: false },
      { to: 'land', dur: 0.9, phase: 1 },
    ],
    setup: { tr: 'Sırtüstü, omuzlar bloklarda. Ayaklar jump board’da geniş ve hafif dışa dönük, dizler bükülü.',
      en: 'On your back, shoulders on the blocks. Feet wide and slightly turned out on the board, knees bent.',
      es: 'Boca arriba, hombros en los topes. Pies abiertos y algo girados hacia fuera, rodillas flexionadas.' },
    phases: [
      { name: { tr: 'İtip sıçra', en: 'Push off', es: 'Impulsa' }, breath: 'out', slow: 1.6, line: ['hipR', 'kneeR', 'ankleR'],
        text: { tr: 'Bacakları hızla uzat; geniş duruş bozulmaz, kızak süzülür.', en: 'Straighten the legs fast; keep the stance wide as the carriage glides.', es: 'Estira rápido; mantén la abertura mientras el carro se desliza.' } },
      { name: { tr: 'Geniş ve yumuşak in', en: 'Land wide and soft', es: 'Aterriza abierta y suave' }, breath: 'in', slow: 1.4, line: ['kneeR', 'ballR'],
        text: { tr: 'Aynı genişlikte in. Dizler bükülür ve ayak parmaklarının üstünde kalır.', en: 'Land at the same width. Knees bend and stay over the toes.', es: 'Aterriza con la misma abertura. Rodillas flexionadas sobre los dedos.' } },
    ],
    tempoText: { tr: 'Patlayıcı it · sessiz in · 10 sıçrayış (yavaş çekim)', en: 'Explosive push · quiet landing · 10 jumps (slow motion)', es: 'Impulso explosivo · aterrizaje suave · 10 saltos (cámara lenta)' },
    mistakes: [
      { title: { tr: 'Dizler içe kaçıyor', en: 'Knees cave in', es: 'Las rodillas se van hacia dentro' },
        fix: { tr: 'Dizleri dışa it', en: 'Press the knees out', es: 'Empuja las rodillas hacia fuera' },
        fixText: { tr: 'Diz, 2. parmağın hizasında kalır', en: 'Each knee stays over the 2nd toe', es: 'Cada rodilla sobre el 2.º dedo' },
        at: 'land', get pose() { const L = poses().land; return Object.assign({}, L, { kneePole: [1, 0.3, 0] }); },
        line: ['kneeR', 'ballR'], marks: ['kneeR', 'kneeL'], parts: ['thigh', 'shin'], view: { yaw: 150, pitch: 28 } },
      { title: { tr: 'Düz dizle iniş', en: 'Landing with straight knees', es: 'Aterrizar con rodillas rectas' },
        fix: { tr: 'Dizleri bükerek in', en: 'Bend the knees to land', es: 'Flexiona al aterrizar' },
        fixText: { tr: 'Tahtaya değer değmez dizler bükülür; kızak sarsılmaz', en: 'Knees bend as soon as you touch; no jolt', es: 'Flexiona al tocar la tabla; sin sacudida' },
        at: 'land', get pose() { return pinned(land({ knee: 30, ankle: -10 })); },
        line: ['hipR', 'kneeR', 'ankleR'], marks: ['kneeR'], parts: ['thigh', 'shin'], view: { yaw: 90, pitch: 8, zoom: 1.2, dx: -60 } },
    ],
    cues: [{ tr: 'Dizler dışa, parmakların üstünde', en: 'Knees out, over the toes', es: 'Rodillas fuera, sobre los dedos' },
      { tr: 'Aynı genişlikte in', en: 'Land at the same width', es: 'Aterriza con la misma abertura' },
      { tr: 'Sessiz iniş, pelvis nötr', en: 'Quiet landing, neutral pelvis', es: 'Aterrizaje suave, pelvis neutra' }],
  };
})();
