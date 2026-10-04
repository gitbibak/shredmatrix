/* Basic Jumps on the reformer jump board (supine, parallel feet). Shown ~2x slower than real (said in the tempo card).
 * Geometry (all poses FK legs, solved numerically so contacts are exact in the keys and the angle interpolation keeps
 * the feet on/near the board between keys; the carriage follows the shoulders, blocks on the shoulders every frame):
 *  - land  : whole foot flat on the board face (heel + ball on x = FACE), knee 115; hip, ankle and the rail offset solved.
 *  - push  : take-off, legs long (knee 3), ankle pointed -60, ball still on the board; hip + rail offset solved
 *            -> carriage ~35-40 cm out.
 *  - air   : in-between pose (card:false): carriage glides ~10 cm further, feet pointed and clear of the board.
 * Spec hip 110 at the landing assumes a lower board; with the 0.38 m carriage and this board the landing hip is ~80°
 * to the trunk line with the knee at the spec's 115°. */
(function () {
  const BLOCK = 0.245;
  const FACE = 1.095;          // jump board face (board centre x = REF.x1 - 0.03, 5 cm thick)
  const shX = (sol) => (sol.J.shoulderL[0] + sol.J.shoulderR[0]) / 2;
  const carriage = (sol) => shX(sol) + BLOCK;
  const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };
  const G = () => [['shoulderR', FB.REFORMER.top], ['pelvis', FB.REFORMER.top]];
  const BASE = { trunk: -90, flat: false, neck: 10, sh: -13, shAbd: 12, el: 4, palm: 'down' };
  const BALL_Y = 0.70;         // ball of the foot on the board (board 0.38-0.99)

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
  // whole foot flat on the board, given knee
  const land = (p) => fit(base(Object.assign({ hip: 80, ankle: 0 }, p)), ['hip', 'ankle', 'dx'],
    (J) => [J.heelR[0] - FACE, J.ballR[0] - FACE, J.ballR[1] - BALL_Y]);
  // take-off: tip of the shoe on the board (last contact), given knee and ankle
  const push = (p) => fit(base(Object.assign({ hip: 20 }, p)), ['hip', 'dx'], (J) => [J.toeR[0] - FACE, J.toeR[1] - (BALL_Y + 0.07)]);

  // pin both ankles where the solved FK pose puts them (position + foot frame): between keys the pins move on a short
  // chord around the ball of the foot instead of the joint-angle path (which swings the feet through the board)
  const pinned = (q) => {
    const s = FB.solve(FB.expand(Object.assign({}, q, { ik: undefined })), CTX);
    const pin = (k) => ({ at: s.J['ankle' + k].slice(), foot: s.F['foot' + k].map((c) => c.slice()) });
    return Object.assign({}, q, { ik: { ankleL: pin('L'), ankleR: pin('R') } });
  };
  let P = null;
  const poses = () => {
    if (P) return P;
    const L = land({ knee: 115 }), U = push({ knee: 3, ankle: -60 });
    const A = Object.assign({}, U, { hip: U.hip + 2, knee: 0, ankle: -64, pos: [U.pos[0] - 0.05, 0, 0] });
    return (P = { land: pinned(L), push: pinned(U), air: pinned(A) });
  };

  window.EXERCISE = {
    id: 'jumps_basic',
    name: { tr: 'Temel Jumps (Paralel)', en: 'Basic Jumps (Parallel)', es: 'Saltos básicos (paralelo)' },
    category: { tr: 'Reformer · Jump board', en: 'Reformer · Jump board', es: 'Reformer · Jump board' },
    equipmentLabel: { tr: 'Jump board · 2 hafif yay', en: 'Jump board · 2 light springs', es: 'Jump board · 2 muelles suaves' },
    muscles: ['quads', 'calves', 'glutes', 'hamstrings'],
    tempo: '0.35-0.45',
    tempoReps: 4,
    view: { yaw: 90, pitch: 8, zoom: 1.15, dx: -40 },
    alt: { yaw: 135, pitch: 30, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
      text: { tr: 'Ayaklar paralel, dizler ayak hizasında', en: 'Feet parallel, knees in line with the feet', es: 'Pies paralelos, rodillas alineadas' } },
    setupView: { yaw: 40, pitch: 22 },
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
    setup: { tr: 'Sırtüstü, omuzlar bloklarda. Ayaklar paralel ve düz basarak jump board’da, dizler bükülü.',
      en: 'On your back, shoulders on the blocks. Feet parallel and flat on the jump board, knees bent.',
      es: 'Boca arriba, hombros en los topes. Pies paralelos y planos en el jump board, rodillas flexionadas.' },
    phases: [
      { name: { tr: 'İtip sıçra', en: 'Push off', es: 'Impulsa' }, breath: 'out', slow: 1.6, line: ['hipR', 'kneeR', 'ankleR'],
        text: { tr: 'Bacakları hızla uzat, ayaklar tahtadan ayrılır. Kızak süzülür.', en: 'Straighten the legs fast; the feet leave the board and the carriage glides.', es: 'Estira rápido; los pies dejan la tabla y el carro se desliza.' } },
      { name: { tr: 'Yumuşak in', en: 'Land softly', es: 'Aterriza suave' }, breath: 'in', slow: 1.4, arc: ['hipR', 'kneeR', 'ankleR'],
        text: { tr: 'Önce ön taban, sonra topuk. Dizler bükülerek inişi emer.', en: 'Balls first, then heels. Bent knees absorb the landing.', es: 'Primero metatarsos, luego talones. Las rodillas amortiguan.' } },
    ],
    tempoText: { tr: 'Patlayıcı it · sessiz in · 10-15 sıçrayış (yavaş çekim)', en: 'Explosive push · quiet landing · 10-15 jumps (slow motion)', es: 'Impulso explosivo · aterrizaje suave · 10-15 saltos (cámara lenta)' },
    mistakes: [
      { title: { tr: 'Düz dizle iniş', en: 'Landing with straight knees', es: 'Aterrizar con rodillas rectas' },
        fix: { tr: 'Dizleri bükerek in', en: 'Bend the knees to land', es: 'Flexiona al aterrizar' },
        fixText: { tr: 'Tahtaya değer değmez dizler bükülür; kızak sarsılmaz', en: 'Knees bend as soon as you touch; no jolt', es: 'Flexiona al tocar la tabla; sin sacudida' },
        at: 'land', get pose() { return pinned(land({ knee: 30, ankle: -10 })); },
        line: ['hipR', 'kneeR', 'ankleR'], marks: ['kneeR'], parts: ['thigh', 'shin'], view: { yaw: 90, pitch: 8, zoom: 1.2, dx: -60 } },
      { title: { tr: 'Pelvis kıvrılıyor', en: 'Pelvis tucks', es: 'La pelvis se enrolla' },
        fix: { tr: 'Pelvis nötr', en: 'Neutral pelvis', es: 'Pelvis neutra' },
        fixText: { tr: 'Bel minderde, kuyruk sokumu kalkmaz', en: 'Low back on the pad, tailbone stays down', es: 'Lumbar en el carro, el cóccix abajo' },
        at: 'land', get pose() { return pinned(land({ knee: 128, lumbar: 24, ground: [['shoulderR', FB.REFORMER.top], ['pelvis', FB.REFORMER.top + 0.05]] })); },
        marks: ['pelvis'], parts: ['pelvis', 'waist'], view: { yaw: 90, pitch: 8, zoom: 1.35, dx: -100 } },
    ],
    cues: [{ tr: 'Yumuşak ve sessiz iniş', en: 'Soft, quiet landing', es: 'Aterrizaje suave y silencioso' },
      { tr: 'Dizler ayakların hizasında', en: 'Knees track over the feet', es: 'Rodillas sobre los pies' },
      { tr: 'Pelvis nötr, omuzlar bloklarda', en: 'Neutral pelvis, shoulders on the blocks', es: 'Pelvis neutra, hombros en los topes' }],
  };
})();
