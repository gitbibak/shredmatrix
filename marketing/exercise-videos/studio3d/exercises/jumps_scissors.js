/* Scissors Jumps on the reformer jump board (supine, split stance). Shown ~2x slower than real (said in the tempo card).
 * jumps_alternating.js geometry (FK legs solved per side, ankles pinned where the FK pose puts them, carriage on the
 * shoulders). Split stance: the HIGH foot lands flat with the ball ~16 cm higher on the board (knee ~100; hip,
 * ankle and the rail offset solved), the LOW foot lands flat lower on the board (hip, knee and ankle solved with the
 * same rail offset: ~100°). Take-off from both shoe tips (knees ~3), 'air' (card:false) = carriage ~5 cm further,
 * legs long and pointed; they swap heights on the way down. One rep = two jumps (R high -> L high -> R high). */
(function () {
  const BLOCK = 0.245;
  const FACE = 1.095;
  const shX = (sol) => (sol.J.shoulderL[0] + sol.J.shoulderR[0]) / 2;
  const carriage = (sol) => shX(sol) + BLOCK;
  const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };
  const G = () => [['shoulderR', FB.REFORMER.top], ['pelvis', FB.REFORMER.top]];
  const BASE = { trunk: -90, flat: false, neck: 10, sh: -13, shAbd: 12, el: 4, palm: 'down' };
  const BALL_Y = 0.70;

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
  // side S: whole foot flat on the board with knee given (hip, ankle, rail offset solved)
  const landOn = (S, p) => fit(base(Object.assign({ ['hip' + S]: 80, ['ankle' + S]: 0 }, p)), ['hip' + S, 'ankle' + S, 'dx'],
    (J) => [J['heel' + S][0] - FACE, J['ball' + S][0] - FACE, J['ball' + S][1] - BALL_Y]);
  // side S: shoe tip on the board at take-off
  const pushOn = (S, p) => fit(base(Object.assign({ ['hip' + S]: 20 }, p)), ['hip' + S, 'dx'], (J) => [J['toe' + S][0] - FACE, J['toe' + S][1] - (BALL_Y + 0.07)]);
  const pinned = (q) => {
    const s = FB.solve(FB.expand(Object.assign({}, q, { ik: undefined })), CTX);
    const pin = (k) => ({ at: s.J['ankle' + k].slice(), foot: s.F['foot' + k].map((c) => c.slice()) });
    return Object.assign({}, q, { ik: { ankleL: pin('L'), ankleR: pin('R') } });
  };
  const O = (S) => (S === 'L' ? 'R' : 'L');
  const HOVER = (S) => ({ ['hip' + S]: 90, ['knee' + S]: 90, ['ankle' + S]: -20 });

  // flat foot of side S at ball height y with the rail offset already fixed (hip, knee, ankle solved)
  const landFixed = (q, S, y) => fit(q, ['hip' + S, 'knee' + S, 'ankle' + S], (J) => [J['heel' + S][0] - FACE, J['ball' + S][0] - FACE, J['ball' + S][1] - y]);
  const HIGH = BALL_Y + 0.12, LOW = BALL_Y - 0.08;
  const split = (Hs, extra = {}) => {
    const Ls = O(Hs);
    const q = fit(base(Object.assign({ ['hip' + Hs]: 90, ['ankle' + Hs]: 0, ['knee' + Hs]: 100, ['hip' + Ls]: 70, ['knee' + Ls]: 120, ['ankle' + Ls]: 0 }, extra)),
      ['hip' + Hs, 'ankle' + Hs, 'dx'], (J) => [J['heel' + Hs][0] - FACE, J['ball' + Hs][0] - FACE, J['ball' + Hs][1] - HIGH]);
    return landFixed(q, Ls, LOW);
  };
  const takeoff = (Hs) => {
    const Ls = O(Hs);
    const q = fit(base({ ['hip' + Hs]: 22, ['knee' + Hs]: 3, ['ankle' + Hs]: -60, ['hip' + Ls]: 14, ['knee' + Ls]: 3, ['ankle' + Ls]: -60 }),
      ['hip' + Hs, 'dx'], (J) => [J['toe' + Hs][0] - FACE, J['toe' + Hs][1] - (HIGH + 0.07)]);
    return fit(q, ['hip' + Ls, 'knee' + Ls], (J) => [J['toe' + Ls][0] - FACE, J['toe' + Ls][1] - (LOW + 0.07)]);
  };
  const airOf = (u) => Object.assign({}, u, { hipL: (u.hipL + u.hipR) / 2 + 3, hipR: (u.hipL + u.hipR) / 2 + 3, kneeL: 1, kneeR: 1, ankleL: -64, ankleR: -64, pos: [u.pos[0] - 0.05, 0, 0] });

  let P = null;
  const poses = () => {
    if (P) return P;
    const uR = takeoff('R'), uL = takeoff('L');
    return (P = { landR: pinned(split('R')), pushR: pinned(uR), airR: pinned(airOf(uR)),
      landL: pinned(split('L')), pushL: pinned(uL), airL: pinned(airOf(uL)) });
  };

  window.EXERCISE = {
    id: 'jumps_scissors',
    name: { tr: 'Scissors Jumps', en: 'Scissors Jumps', es: 'Saltos tijera' },
    category: { tr: 'Reformer · Jump board', en: 'Reformer · Jump board', es: 'Reformer · Jump board' },
    equipmentLabel: { tr: 'Jump board · 2 hafif yay', en: 'Jump board · 2 light springs', es: 'Jump board · 2 muelles suaves' },
    muscles: ['quads', 'glutes', 'calves', 'hamstrings'],
    tempo: '0.8-0.8',
    tempoReps: 2,
    view: { yaw: 90, pitch: 8, zoom: 1.15, dx: -40 },
    alt: { yaw: 135, pitch: 30, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
      text: { tr: 'Ayaklar havada yer değiştirir', en: 'The feet swap in the air', es: 'Los pies cambian en el aire' } },
    setupView: { yaw: 40, pitch: 22 },
    props: [['reformer', { springs: 2, carriage, footbar: false, jumpBoard: true }]],
    ctx: CTX,
    contacts: ['heelL', 'ballL', 'heelR', 'ballR', 'pelvis', 'shoulderR', 'head'],
    get poses() { return poses(); },
    rest: 'landR',
    rep: [
      { to: 'pushR', dur: 0.7, phase: 0 },
      { to: 'airR', dur: 0.5, card: false },
      { to: 'landL', dur: 0.9, phase: 1 },
      { to: 'pushL', dur: 0.7, phase: 2 },
      { to: 'airL', dur: 0.5, card: false },
      { to: 'landR', dur: 0.9, phase: 3 },
    ],
    setup: { tr: 'Sırtüstü, omuzlar bloklarda. Sağ ayak tahtada yüksek, sol ayak alçak; iki ayak da düz basar.',
      en: 'On your back, shoulders on the blocks. Right foot high on the board, left foot low; both feet flat.',
      es: 'Boca arriba, hombros en los topes. Pie derecho alto en la tabla, izquierdo bajo; ambos planos.' },
    phases: [
      { name: { tr: 'İki ayakla it', en: 'Push with both feet', es: 'Impulsa con ambos pies' }, breath: 'out', slow: 1.6,
        text: { tr: 'Bacakları hızla uzat; ayaklar tahtadan ayrılır, kızak süzülür.', en: 'Straighten both legs fast; the feet leave the board, the carriage glides.', es: 'Estira rápido; los pies dejan la tabla y el carro se desliza.' } },
      { name: { tr: 'Değiştir ve in', en: 'Switch and land', es: 'Cambia y aterriza' }, breath: 'in', slow: 1.4,
        text: { tr: 'Havada ayaklar yer değiştirir: sol yüksek, sağ alçak iner. Dizler emer.', en: 'Switch in the air: left lands high, right low. Knees absorb.', es: 'Cambia en el aire: izquierdo alto, derecho bajo. Rodillas amortiguan.' } },
      { name: { tr: 'Yine it', en: 'Push again', es: 'Impulsa otra vez' }, breath: 'out', slow: 1.6,
        text: { tr: 'İki ayak birlikte iter, kızak yine süzülür.', en: 'Both feet push together, the carriage glides again.', es: 'Ambos pies impulsan juntos; el carro se desliza.' } },
      { name: { tr: 'Geri değiştir', en: 'Switch back', es: 'Cambia de vuelta' }, breath: 'in', slow: 1.4, arc: ['hipR', 'kneeR', 'ankleR'],
        text: { tr: 'Sağ yüksek, sol alçak iner. İki ayak aynı anda değer.', en: 'Right lands high, left low. Both feet touch at the same time.', es: 'Derecho alto, izquierdo bajo. Ambos tocan a la vez.' } },
    ],
    tempoText: { tr: 'Her sıçrayış ~0,8 sn · 10-16 sıçrayış (yavaş çekim)', en: '~0.8 s per jump · 10-16 jumps (slow motion)', es: '~0,8 s por salto · 10-16 saltos (cámara lenta)' },
    mistakes: [
      { title: { tr: 'Ayaklar ayrı anda iniyor', en: 'Feet land unevenly', es: 'Los pies aterrizan a destiempo' },
        fix: { tr: 'İki ayak birlikte', en: 'Both feet together', es: 'Ambos pies a la vez' },
        fixText: { tr: 'Ritmi koru; iki ayak aynı anda değsin, kızak düz kaysın', en: 'Keep the rhythm; both feet touch at once, the carriage runs straight', es: 'Mantén el ritmo; ambos tocan a la vez, el carro recto' },
        at: 'landR', get pose() { const q = split('R', { roll: -6, twist: 6 }); return pinned(Object.assign({}, q, { kneeL: 128, hipL: 88, ankleL: -40 })); },
        line: ['hipL', 'hipR'], marks: ['ankleL'], parts: ['thighL', 'shinL', 'pelvis'], view: { yaw: 135, pitch: 30 } },
      { title: { tr: 'Düz dizle iniş', en: 'Landing with straight knees', es: 'Aterrizar con rodillas rectas' },
        fix: { tr: 'Dizleri bükerek in', en: 'Bend the knees to land', es: 'Flexiona al aterrizar' },
        fixText: { tr: 'Tahtaya değer değmez dizler bükülür', en: 'Knees bend as soon as you touch', es: 'Flexiona en cuanto tocas' },
        at: 'landR', get pose() { const q = fit(base({ hipR: 20, kneeR: 35, ankleR: -10, hipL: 15, kneeL: 25, ankleL: -10 }), ['hipR', 'ankleR', 'dx'], (J) => [J.heelR[0] - FACE, J.ballR[0] - FACE, J.ballR[1] - HIGH]); return pinned(landFixed(q, 'L', LOW)); },
        line: ['hipR', 'kneeR', 'ankleR'], marks: ['kneeR'], parts: ['thigh', 'shin'], view: { yaw: 90, pitch: 8, zoom: 1.2, dx: -60 } },
    ],
    cues: [{ tr: 'Havada hızlı değiştir', en: 'Quick switch in the air', es: 'Cambio rápido en el aire' },
      { tr: 'Sessiz iniş, dizler yumuşak', en: 'Quiet landing, soft knees', es: 'Aterrizaje suave, rodillas suaves' },
      { tr: 'Pelvis ve kızak düz', en: 'Pelvis and carriage square', es: 'Pelvis y carro rectos' }],
  };
})();
