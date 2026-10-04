/* Alternating Jumps on the reformer jump board (supine). Shown ~2x slower than real (said in the tempo card).
 * jumps_basic.js geometry: legs FK, solved numerically per side (fit) so contacts are exact in the keys, then both ankles
 * pinned where the FK pose puts them (pins move on short chords between keys: no feet sliding through the board).
 *  - landL / landR : one foot flat on the board (heel + ball on the face, knee 115), the other leg hovers in tabletop
 *                    (hip 90 / knee 90, spec).
 *  - pushL / pushR : take-off from the standing leg (knee 3, pointed, shoe tip last on the board); the free leg reaches
 *                    long with it.
 *  - air           : card:false in-between key, carriage glides ~5 cm further, both feet pointed and clear of the board;
 *                    the legs switch on the way down.
 * The carriage follows the shoulders (blocks on the shoulders every frame). */
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

  let P = null;
  const poses = () => {
    if (P) return P;
    const out = {};
    for (const S of ['L', 'R']) {
      out['land' + S] = pinned(landOn(S, Object.assign({ ['knee' + S]: 115 }, HOVER(O(S)))));
      const u = pushOn(S, { ['knee' + S]: 3, ['ankle' + S]: -60, ['hip' + O(S)]: 30, ['knee' + O(S)]: 20, ['ankle' + O(S)]: -50 });
      out['push' + S] = pinned(u);
      out['air' + S] = pinned(Object.assign({}, u, { ['hip' + S]: u['hip' + S] + 4, ['knee' + S]: 0, ['ankle' + S]: -64,
        ['hip' + O(S)]: u['hip' + S] + 4, ['knee' + O(S)]: 2, ['ankle' + O(S)]: -64, pos: [u.pos[0] - 0.05, 0, 0] }));
    }
    return (P = out);
  };

  window.EXERCISE = {
    id: 'jumps_alternating',
    name: { tr: 'Alternating Jumps', en: 'Alternating Jumps', es: 'Saltos alternados' },
    category: { tr: 'Reformer · Jump board', en: 'Reformer · Jump board', es: 'Reformer · Jump board' },
    equipmentLabel: { tr: 'Jump board · 2 hafif yay', en: 'Jump board · 2 light springs', es: 'Jump board · 2 muelles suaves' },
    muscles: ['quads', 'glutes', 'calves', 'hamstrings'],
    tempo: '0.8-0.8',
    tempoReps: 2,
    view: { yaw: 90, pitch: 8, zoom: 1.15, dx: -40 },
    alt: { yaw: 135, pitch: 30, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
      text: { tr: 'Pelvis düz, ayak tahtanın ortasına iner', en: 'Pelvis level, the foot lands mid-board', es: 'Pelvis nivelada, el pie cae al centro' } },
    setupView: { yaw: 40, pitch: 22 },
    props: [['reformer', { springs: 2, carriage, footbar: false, jumpBoard: true }]],
    ctx: CTX,
    contacts: ['heelL', 'ballL', 'pelvis', 'shoulderR', 'head'],
    get poses() { return poses(); },
    rest: 'landL',
    rep: [
      { to: 'pushL', dur: 0.7, phase: 0 },
      { to: 'airL', dur: 0.5, card: false },
      { to: 'landR', dur: 0.9, phase: 1 },
      { to: 'pushR', dur: 0.7, phase: 2 },
      { to: 'airR', dur: 0.5, card: false },
      { to: 'landL', dur: 0.9, phase: 3 },
    ],
    setup: { tr: 'Sırtüstü, omuzlar bloklarda. Sol ayak jump board’da düz basar, sağ bacak masa pozisyonunda.',
      en: 'On your back, shoulders on the blocks. Left foot flat on the jump board, right leg in tabletop.',
      es: 'Boca arriba, hombros en los topes. Pie izquierdo plano en el jump board, pierna derecha en mesa.' },
    phases: [
      { name: { tr: 'Sol ayakla it', en: 'Push with the left', es: 'Impulsa con la izquierda' }, breath: 'out', slow: 1.6,
        text: { tr: 'Sol bacağı hızla uzat; ayaklar tahtadan ayrılır, kızak süzülür.', en: 'Straighten the left leg fast; the feet leave the board, the carriage glides.', es: 'Estira la izquierda rápido; los pies dejan la tabla y el carro se desliza.' } },
      { name: { tr: 'Sağ ayağa in', en: 'Land on the right', es: 'Aterriza con la derecha' }, breath: 'in', slow: 1.4, line: ['hipL', 'hipR'],
        text: { tr: 'Havada bacak değiştir; sağ ayak yumuşak iner, sol masaya gelir.', en: 'Switch in the air; the right foot lands softly, the left comes to tabletop.', es: 'Cambia en el aire; la derecha aterriza suave, la izquierda a mesa.' } },
      { name: { tr: 'Sağ ayakla it', en: 'Push with the right', es: 'Impulsa con la derecha' }, breath: 'out', slow: 1.6,
        text: { tr: 'Sağ bacak iter, kızak yine süzülür. Pelvis düz kalır.', en: 'The right leg pushes, the carriage glides again. Pelvis stays level.', es: 'La derecha impulsa, el carro se desliza. Pelvis nivelada.' } },
      { name: { tr: 'Sol ayağa in', en: 'Land on the left', es: 'Aterriza con la izquierda' }, breath: 'in', slow: 1.4, arc: ['hipL', 'kneeL', 'ankleL'],
        text: { tr: 'Sol ayak iner, diz bükülerek emer. Sessizce devam et.', en: 'The left foot lands, the knee bends to absorb. Keep it quiet.', es: 'La izquierda aterriza, la rodilla amortigua. En silencio.' } },
    ],
    tempoText: { tr: 'Her sıçrayış ~0,8 sn · 10-20 sıçrayış (yavaş çekim)', en: '~0.8 s per jump · 10-20 jumps (slow motion)', es: '~0,8 s por salto · 10-20 saltos (cámara lenta)' },
    mistakes: [
      { title: { tr: 'İnişte kalça düşüyor', en: 'Hip drops on landing', es: 'La cadera cae al aterrizar' },
        fix: { tr: 'Pelvis düz', en: 'Pelvis level', es: 'Pelvis nivelada' },
        fixText: { tr: 'İki kalça kemiği aynı yükseklikte; gerekirse yayı hafiflet', en: 'Hip bones level; lighten the spring if needed', es: 'Crestas niveladas; aligera el muelle si hace falta' },
        at: 'landL', get pose() { return pinned(landOn('L', Object.assign({ kneeL: 115, roll: -10, twist: 6 }, HOVER('R')))); },
        line: ['hipL', 'hipR'], parts: ['pelvis', 'waist'], view: { yaw: 135, pitch: 30 } },
      { title: { tr: 'Düz dizle iniş', en: 'Landing with a straight knee', es: 'Aterrizar con la rodilla recta' },
        fix: { tr: 'Dizi bükerek in', en: 'Bend the knee to land', es: 'Flexiona al aterrizar' },
        fixText: { tr: 'Tahtaya değer değmez diz bükülür, iniş sessiz', en: 'The knee bends as soon as you touch; quiet landing', es: 'La rodilla flexiona al tocar; aterrizaje suave' },
        at: 'landL', get pose() { return pinned(landOn('L', Object.assign({ kneeL: 30, ankleL: -10 }, HOVER('R')))); },
        line: ['hipL', 'kneeL', 'ankleL'], marks: ['kneeL'], parts: ['thighL', 'shinL'], view: { yaw: 90, pitch: 8, zoom: 1.2, dx: -60 } },
    ],
    cues: [{ tr: 'Sessizce değiştir', en: 'Alternate quietly', es: 'Alterna en silencio' },
      { tr: 'Pelvis düz', en: 'Pelvis level', es: 'Pelvis nivelada' },
      { tr: 'Her inişte diz bükülü', en: 'Soft knee on every landing', es: 'Rodilla suave en cada aterrizaje' }],
  };
})();
