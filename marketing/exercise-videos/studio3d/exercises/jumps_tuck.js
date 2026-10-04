/* Tuck Jumps on the reformer jump board (supine, parallel feet). Shown ~2x slower than real (said in the tempo card).
 * jumps_basic.js geometry: legs FK solved numerically (fit) so the contacts are exact in the keys, then both ankles pinned
 * where the FK pose puts them (pins move on short chords between keys: the feet never slide through the board).
 *  - land : whole foot flat on the board face (heel + ball on x = FACE), knee 115 (spec); hip, ankle, rail offset solved.
 *  - push : take-off, legs long (knee 3), pointed, shoe tip last on the board -> carriage ~35 cm out.
 *  - tuck : airborne (carriage glides a few cm further), knees drawn toward the chest (spec hip ~125 / knee ~130),
 *           feet pointed and well clear of the board; the legs then reach back to the board to land.
 * Spec hip 110 at the landing assumes a lower board; with this board/carriage the landing hip measures ~65 with knee 115
 * (same as the approved jumps_basic). */
(function () {
  const BLOCK = 0.245;
  const FACE = 1.095;
  const shX = (sol) => (sol.J.shoulderL[0] + sol.J.shoulderR[0]) / 2;
  const carriage = (sol) => shX(sol) + BLOCK;
  const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };
  const G = () => [['shoulderR', FB.REFORMER.top], ['pelvis', FB.REFORMER.top]];
  const BASE = { trunk: -90, flat: false, neck: 10, sh: -13, shAbd: 12, el: 4, palm: 'down' };
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
  const push = (p) => fit(base(Object.assign({ hip: 20 }, p)), ['hip', 'dx'], (J) => [J.toeR[0] - FACE, J.toeR[1] - (BALL_Y + 0.07)]);
  const pinned = (q) => {
    const s = FB.solve(FB.expand(Object.assign({}, q, { ik: undefined })), CTX);
    const pin = (k) => ({ at: s.J['ankle' + k].slice(), foot: s.F['foot' + k].map((c) => c.slice()) });
    return Object.assign({}, q, { ik: { ankleL: pin('L'), ankleR: pin('R') } });
  };
  let P = null;
  const TUCK = { hip: 128, knee: 130, ankle: -55 };
  const poses = () => {
    if (P) return P;
    const L = land({ knee: 115 }), U = push({ knee: 3, ankle: -60 });
    const T = base(Object.assign({}, TUCK, { pos: [U.pos[0] - 0.04, 0, 0] }));
    return (P = { land: pinned(L), push: pinned(U), tuck: pinned(T) });
  };

  window.EXERCISE = {
    id: 'jumps_tuck',
    name: { tr: 'Tuck Jumps', en: 'Tuck Jumps', es: 'Saltos tuck' },
    category: { tr: 'Reformer · Jump board', en: 'Reformer · Jump board', es: 'Reformer · Jump board' },
    equipmentLabel: { tr: 'Jump board · 1 mavi + 1 kırmızı yay', en: 'Jump board · 1 blue + 1 red spring', es: 'Jump board · 1 muelle azul + 1 rojo' },
    muscles: ['quads', 'glutes', 'core', 'calves'],
    tempo: '0.5-0.5-0.5',
    tempoReps: 3,
    view: { yaw: 90, pitch: 8, zoom: 1.15, dx: -40 },
    alt: { yaw: 135, pitch: 30, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
      text: { tr: 'Dizler göğse yaklaşır, pelvis minderde', en: 'Knees come toward the chest, pelvis stays down', es: 'Rodillas hacia el pecho, pelvis abajo' } },
    setupView: { yaw: 40, pitch: 22 },
    props: [['reformer', { springs: 2, carriage, footbar: false, jumpBoard: true }]],
    ctx: CTX,
    contacts: ['heelL', 'heelR', 'ballL', 'ballR', 'pelvis', 'shoulderR', 'head'],
    get poses() { return poses(); },
    rest: 'land',
    rep: [
      { to: 'push', dur: 0.7, phase: 0 },
      { to: 'tuck', dur: 0.7, phase: 1 },
      { to: 'land', dur: 0.9, phase: 2 },
    ],
    setup: { tr: 'Sırtüstü, omuzlar bloklarda. Ayaklar paralel ve düz basarak jump board’da, dizler bükülü.',
      en: 'On your back, shoulders on the blocks. Feet parallel and flat on the jump board, knees bent.',
      es: 'Boca arriba, hombros en los topes. Pies paralelos y planos en el jump board, rodillas flexionadas.' },
    phases: [
      { name: { tr: 'İtip sıçra', en: 'Push off', es: 'Impulsa' }, breath: 'out', slow: 1.6, line: ['hipR', 'kneeR', 'ankleR'],
        text: { tr: 'Bacakları hızla uzat, ayaklar tahtadan ayrılır. Kızak süzülür.', en: 'Straighten the legs fast; the feet leave the board and the carriage glides.', es: 'Estira rápido; los pies dejan la tabla y el carro se desliza.' } },
      { name: { tr: 'Dizleri çek', en: 'Tuck the knees', es: 'Recoge las rodillas' }, breath: 'out', slow: 1.5, line: ['shoulderR', 'hipR', 'kneeR'],
        text: { tr: 'Havadayken dizleri göğse doğru çek. Pelvis ve bel minderde kalır.', en: 'In the air, draw the knees toward the chest. Pelvis and low back stay down.', es: 'En el aire, lleva las rodillas al pecho. Pelvis y lumbar abajo.' } },
      { name: { tr: 'Uzan ve yumuşak in', en: 'Reach and land softly', es: 'Alarga y aterriza suave' }, breath: 'in', slow: 1.4,
        text: { tr: 'Bacakları tahtaya uzat; önce ön taban, sonra topuk. Dizler inişi emer.', en: 'Reach the legs to the board; balls first, then heels. The knees absorb.', es: 'Lleva las piernas a la tabla; metatarsos y luego talones. Las rodillas amortiguan.' } },
    ],
    tempoText: { tr: 'İt · havada topla · sessiz in · 8 sıçrayış (yavaş çekim)', en: 'Push · tuck in the air · land quietly · 8 jumps (slow motion)', es: 'Impulsa · recoge en el aire · aterriza suave · 8 saltos (cámara lenta)' },
    mistakes: [
      { title: { tr: 'Dizler göğse çarpıyor', en: 'Knees crash into the chest', es: 'Rodillas chocan con el pecho' },
        fix: { tr: 'Toplamayı küçült', en: 'Make the tuck smaller', es: 'Recoge menos' },
        fixText: { tr: 'Dizler göğse yaklaşır ama kalça minderden kalkmaz', en: 'Knees come close, but the hips stay on the pad', es: 'Rodillas cerca, pero la cadera sigue en el carro' },
        at: 'tuck', get pose() { const p = poses(); return pinned(Object.assign({}, p.tuck, { hip: 136, knee: 138, lumbar: 24, ik: undefined,
          ground: [['shoulderR', FB.REFORMER.top], ['pelvis', FB.REFORMER.top + 0.07]] })); },
        marks: ['pelvis', 'kneeR'], parts: ['pelvis', 'waist', 'thigh'], view: { yaw: 90, pitch: 8, zoom: 1.35, dx: -100 } },
      { title: { tr: 'Düz dizle iniş', en: 'Landing with straight knees', es: 'Aterrizar con rodillas rectas' },
        fix: { tr: 'Dizleri bükerek in', en: 'Bend the knees to land', es: 'Flexiona al aterrizar' },
        fixText: { tr: 'Tahtaya değer değmez dizler bükülür; kızak sarsılmaz', en: 'Knees bend as soon as you touch; no jolt', es: 'Flexiona al tocar la tabla; sin sacudida' },
        at: 'land', get pose() { return pinned(land({ knee: 30, ankle: -10 })); },
        line: ['hipR', 'kneeR', 'ankleR'], marks: ['kneeR'], parts: ['thigh', 'shin'], view: { yaw: 90, pitch: 8, zoom: 1.2, dx: -60 } },
    ],
    cues: [{ tr: 'Hızlı it, havada topla', en: 'Push fast, tuck in the air', es: 'Impulsa rápido, recoge en el aire' },
      { tr: 'Pelvis minderde', en: 'Pelvis stays on the pad', es: 'La pelvis en el carro' },
      { tr: 'Yumuşak ve sessiz iniş', en: 'Soft, quiet landing', es: 'Aterrizaje suave y silencioso' }],
  };
})();
