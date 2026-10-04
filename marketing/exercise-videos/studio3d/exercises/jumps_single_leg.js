/* Single Leg Jumps / Plyos on the reformer jump board (supine, right leg works, left leg in tabletop). Shown ~2x slower
 * than real (said in the tempo card). jumps_basic.js / jumps_alternating.js geometry: FK legs solved per side so the
 * right foot is flat on the board at the landing (knee 115) and the shoe tip is the last contact at take-off (knee 3,
 * ankle -60); both ankles pinned where the FK pose puts them; 'air' (card:false) = carriage ~5 cm further, right foot
 * pointed and clear of the board. The left leg holds tabletop (hip 90 / knee 90) throughout. Carriage follows the
 * shoulders. Lighter spring than double-leg jumps (1 blue). */
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
    const L = pinned(landOn('R', Object.assign({ kneeR: 115 }, HOVER('L'))));
    const u = pushOn('R', Object.assign({ kneeR: 3, ankleR: -60 }, HOVER('L')));
    const A = pinned(Object.assign({}, u, { hipR: u.hipR + 4, kneeR: 0, ankleR: -64, pos: [u.pos[0] - 0.05, 0, 0] }));
    return (P = { land: L, push: pinned(u), air: A });
  };

  window.EXERCISE = {
    id: 'jumps_single_leg',
    name: { tr: 'Tek Bacak Jumps', en: 'Single Leg Jumps', es: 'Saltos a una pierna' },
    category: { tr: 'Reformer · Jump board', en: 'Reformer · Jump board', es: 'Reformer · Jump board' },
    equipmentLabel: { tr: 'Jump board · 1 hafif yay', en: 'Jump board · 1 light spring', es: 'Jump board · 1 muelle suave' },
    muscles: ['quads', 'glutes', 'calves', 'core'],
    side: 'R',
    tempo: '0.35-0.5',
    tempoReps: 4,
    view: { yaw: 90, pitch: 8, zoom: 1.15, dx: -40 },
    alt: { yaw: 135, pitch: 30, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
      text: { tr: 'Diz ayak hizasında, pelvis düz', en: 'Knee over the foot, pelvis level', es: 'Rodilla sobre el pie, pelvis nivelada' } },
    setupView: { yaw: 40, pitch: 22 },
    props: [['reformer', { springs: 1, carriage, footbar: false, jumpBoard: true }]],
    ctx: CTX,
    contacts: ['heelR', 'ballR', 'pelvis', 'shoulderR', 'head'],
    get poses() { return poses(); },
    rest: 'land',
    rep: [
      { to: 'push', dur: 0.7, phase: 0 },
      { to: 'air', dur: 0.5, card: false },
      { to: 'land', dur: 1.0, phase: 1 },
    ],
    setup: { tr: 'Sırtüstü, omuzlar bloklarda. Sağ ayak jump board’da düz basar, sol bacak masada. Sonra taraf değiştir.',
      en: 'On your back, shoulders on the blocks. Right foot flat on the jump board, left leg in tabletop. Then switch sides.',
      es: 'Boca arriba, hombros en los topes. Pie derecho plano en el jump board, izquierda en mesa. Luego cambia.' },
    phases: [
      { name: { tr: 'Tek bacakla it', en: 'Push with one leg', es: 'Impulsa con una pierna' }, breath: 'out', slow: 1.6, line: ['hipL', 'hipR'],
        text: { tr: 'Sağ bacağı hızla uzat; ayak tahtadan ayrılır, kızak süzülür. Sol bacak sabit.', en: 'Straighten the right leg fast; the foot leaves the board, the carriage glides. Left leg still.', es: 'Estira la derecha rápido; el pie deja la tabla y el carro se desliza. Izquierda quieta.' } },
      { name: { tr: 'Yumuşak in', en: 'Land softly', es: 'Aterriza suave' }, breath: 'in', slow: 1.4, arc: ['hipR', 'kneeR', 'ankleR'],
        text: { tr: 'Ön taban, sonra topuk. Diz ikinci parmak hizasında bükülür.', en: 'Ball, then heel. The knee bends over the second toe.', es: 'Metatarso y luego talón. La rodilla flexiona sobre el 2.º dedo.' } },
    ],
    tempoText: { tr: 'Patlayıcı it · sessiz in · her bacak 8-10 (yavaş çekim)', en: 'Explosive push · quiet landing · 8-10 per leg (slow motion)', es: 'Impulso explosivo · aterrizaje suave · 8-10 por pierna (cámara lenta)' },
    mistakes: [
      { title: { tr: 'Pelvis dönüyor', en: 'Pelvis rotates', es: 'La pelvis rota' },
        fix: { tr: 'Pelvis kare kalsın', en: 'Keep the pelvis square', es: 'Pelvis cuadrada' },
        fixText: { tr: 'Serbest bacak tarafı kalkmaz; yayı hafiflet', en: 'The free-leg hip stays down; lighten the spring', es: 'La cadera libre no sube; aligera el muelle' },
        at: 'land', get pose() { return pinned(landOn('R', Object.assign({ kneeR: 115, roll: 10, twist: -8 }, HOVER('L')))); },
        line: ['hipL', 'hipR'], parts: ['pelvis', 'waist'], view: { yaw: 135, pitch: 30 } },
      { title: { tr: 'Diz içe düşüyor', en: 'Knee falls inward', es: 'La rodilla cae hacia dentro' },
        fix: { tr: 'Diz ayak hizasında', en: 'Knee over the foot', es: 'Rodilla sobre el pie' },
        fixText: { tr: 'İnişte kalça, diz, ayak tek çizgide', en: 'Hip, knee and foot in one line as you land', es: 'Cadera, rodilla y pie en línea al aterrizar' },
        at: 'land', get pose() { return pinned(landOn('R', Object.assign({ kneeR: 115, hrotR: -11, abdR: -4 }, HOVER('L')))); },
        line: ['hipR', 'kneeR', 'ankleR'], marks: ['kneeR'], parts: ['thighR', 'shinR'], view: { yaw: 135, pitch: 30 } },
    ],
    cues: [{ tr: 'Pelvis düz ve sessiz', en: 'Pelvis level and quiet', es: 'Pelvis nivelada y quieta' },
      { tr: 'Diz ayak hizasında', en: 'Knee over the toes', es: 'Rodilla sobre los dedos' },
      { tr: 'Yumuşak, sessiz iniş', en: 'Soft, quiet landing', es: 'Aterrizaje suave y silencioso' }],
  };
})();
