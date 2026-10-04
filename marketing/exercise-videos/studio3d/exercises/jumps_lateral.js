/* Lateral (side-lying) Jumps on the reformer jump board. Shown ~2x slower than real (said in the tempo card).
 * Lying on the RIGHT side (roll -90: chest toward the camera at +z), right shoulder against the right shoulder block, legs
 * stacked, both feet flat on the board (right foot below the left). The top (left) leg carries the marks. jumps_basic.js mechanics: legs FK solved by fit() so
 * both soles sit on the board face in the landing, ankles pinned where the FK pose puts them, carriage on the shoulders.
 *  - land : knee 115 (spec), hip 70 (spec 110: lying on the side the thighs point across the board, and at hip 110 the
 *           feet would land ~15 cm beyond the board edge), soles on x = FACE (ankle + rail offset solved).
 *  - push : legs long (knee 3), pointed, shoe tips last on the board -> carriage ~48 cm out (spec 35; the side-lying
 *           landing keeps the feet closer to the hips in x, so the full leg extension travels further).
 *  - air  : card:false in-between key, carriage glides ~5 cm further, feet clear of the board.
 * Head rests on the extended lower (right) arm; the top hand rests on the carriage in front of the chest for balance. */
(function () {
  const BLOCK = 0.245;
  const FACE = 1.095;
  const TOP = 0.38;
  const shX = (sol) => (sol.J.shoulderL[0] + sol.J.shoulderR[0]) / 2;
  const carriage = (sol) => shX(sol) + BLOCK;
  const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };
  const G = () => [['shoulderR', TOP - 0.015], ['hipR', TOP - 0.02]];
  const BASE = { trunk: -90, roll: -90, flat: false, neck: 4, shR: 165, shAbdR: 0, elR: 10, holdL: [0.24, -0.02, -0.17], handFlatL: true, handSurfaceL: TOP, elbowPoleL: [-0.2, 0.3, 1], palmR: 'up', curl: 0.3 };

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
  const land = (p) => fit(base(Object.assign({ ankle: 0 }, p)), ['ankle', 'dx'], (J) => [J.heelR[0] - FACE, J.ballR[0] - FACE]);
  const push = (p) => fit(base(Object.assign({ hip: 20 }, p)), ['hip', 'dx'], (J) => [J.toeR[0] - FACE, J.toeR[2] - p.z]);
  const pinned = (q) => {
    const s = FB.solve(FB.expand(Object.assign({}, q, { ik: undefined })), CTX);
    const pin = (k) => ({ at: s.J['ankle' + k].slice(), foot: s.F['foot' + k].map((c) => c.slice()) });
    return Object.assign({}, q, { ik: { ankleL: pin('L'), ankleR: pin('R') } });
  };
  const LAND = { hip: 70, knee: 115 };
  let P = null;
  const poses = () => {
    if (P) return P;
    const L = land(Object.assign({}, LAND));
    const z = FB.solve(FB.expand(L), CTX).J.toeR[2];
    const U = push({ knee: 3, ankle: -60, z });
    delete U.z;
    const A = Object.assign({}, U, { hip: U.hip + 2, knee: 0, ankle: -64, pos: [U.pos[0] - 0.05, 0, 0] });
    return (P = { land: pinned(L), push: pinned(U), air: pinned(A) });
  };

  window.EXERCISE = {
    id: 'jumps_lateral',
    name: { tr: 'Lateral Jumps', en: 'Lateral Jumps', es: 'Saltos laterales' },
    category: { tr: 'Reformer · Jump board', en: 'Reformer · Jump board', es: 'Reformer · Jump board' },
    equipmentLabel: { tr: 'Jump board · 1 mavi yay', en: 'Jump board · 1 blue spring', es: 'Jump board · 1 muelle azul' },
    muscles: ['quads', 'glutes', 'obliques', 'calves'],
    tempo: '0.35-0.45',
    tempoReps: 4,
    view: { yaw: 90, pitch: 30, zoom: 1.1, dx: -40 },
    alt: { yaw: 50, pitch: 50, title: { tr: 'Üstten bak', en: 'View from above', es: 'Vista desde arriba' },
      text: { tr: 'Kalçalar üst üste, pelvis geriye düşmez', en: 'Hips stacked, the pelvis does not roll back', es: 'Caderas apiladas, la pelvis no rueda atrás' } },
    setupView: { yaw: 50, pitch: 28 },
    props: [['reformer', { springs: 1, carriage, footbar: false, jumpBoard: true }]],
    ctx: CTX,
    contacts: ['heelL', 'heelR', 'ballL', 'ballR', 'hipR', 'shoulderR', 'head'],
    get poses() { return poses(); },
    rest: 'land',
    rep: [
      { to: 'push', dur: 0.7, phase: 0 },
      { to: 'air', dur: 0.55, card: false },
      { to: 'land', dur: 0.9, phase: 1 },
    ],
    side: 'L',
    setup: { tr: 'Sağ yanına uzan, başın uzattığın kolunda. Ayaklar üst üste jump board’da, dizler bükülü. Sonra taraf değiştir.',
      en: 'Lie on your right side, head on the extended arm. Feet stacked on the board, knees bent. Then switch sides.',
      es: 'De lado sobre la derecha, cabeza en el brazo. Pies apilados en la tabla, rodillas flexionadas. Luego cambia.' },
    phases: [
      { name: { tr: 'İtip sıçra', en: 'Push off', es: 'Impulsa' }, breath: 'out', slow: 1.6, line: ['hipL', 'kneeL', 'ankleL'],
        text: { tr: 'İki bacağı birlikte uzat, kızak süzülür. Kalçalar üst üste kalır.', en: 'Straighten both legs together; the carriage glides. Hips stay stacked.', es: 'Estira ambas piernas; el carro se desliza. Caderas apiladas.' } },
      { name: { tr: 'Yumuşak in', en: 'Land softly', es: 'Aterriza suave' }, breath: 'in', slow: 1.4, arc: ['hipL', 'kneeL', 'ankleL'],
        text: { tr: 'Ayaklar birlikte iner, dizler bükülerek emer. Gövde sallanmaz.', en: 'Both feet land together, the knees bend to absorb. The torso stays still.', es: 'Los pies aterrizan juntos y las rodillas amortiguan. El torso quieto.' } },
    ],
    tempoText: { tr: 'Hızlı it · sessiz in · 10 sıçrayış, sonra diğer taraf (yavaş çekim)', en: 'Quick push · quiet landing · 10 jumps, then switch (slow motion)', es: 'Impulso rápido · aterrizaje suave · 10 saltos y cambia (cámara lenta)' },
    mistakes: [
      { title: { tr: 'Pelvis geriye devriliyor', en: 'Pelvis rolls back', es: 'La pelvis rueda hacia atrás' },
        fix: { tr: 'Kalçaları üst üste diz', en: 'Stack the hips', es: 'Apila las caderas' },
        fixText: { tr: 'Üst kalça tam alttakinin üstünde, karın aktif', en: 'Top hip right above the bottom one, core on', es: 'Cadera de arriba sobre la de abajo, abdomen activo' },
        at: 'land', get pose() { const L = poses().land; return Object.assign({}, L, { roll: -62 }); },
        line: ['hipL', 'hipR'], marks: ['hipL'], parts: ['pelvis', 'waist'], view: { yaw: 50, pitch: 50 } },
      { title: { tr: 'Düz dizle iniş', en: 'Landing with straight knees', es: 'Aterrizar con rodillas rectas' },
        fix: { tr: 'Dizleri bükerek in', en: 'Bend the knees to land', es: 'Flexiona al aterrizar' },
        fixText: { tr: 'Tahtaya değer değmez dizler bükülür; kızak sarsılmaz', en: 'Knees bend as soon as you touch; no jolt', es: 'Flexiona al tocar la tabla; sin sacudida' },
        at: 'land', get pose() { return pinned(land({ hip: 35, knee: 30 })); },
        line: ['hipL', 'kneeL', 'ankleL'], marks: ['kneeL'], parts: ['thigh', 'shin'] },
    ],
    cues: [{ tr: 'Kalçalar üst üste', en: 'Hips stacked', es: 'Caderas apiladas' },
      { tr: 'İki ayak birlikte', en: 'Both feet together', es: 'Ambos pies juntos' },
      { tr: 'Yumuşak ve sessiz iniş', en: 'Soft, quiet landing', es: 'Aterrizaje suave y silencioso' }],
  };
})();
