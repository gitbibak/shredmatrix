/* Firefly (Tittibhasana). Side view. Built on crow_pose.js / flying_crow.js (explicit pelvis placement, palms = fixed world IK
 * spots, ankles = IK targets in every pose so the feet lift instead of sliding).
 * prep = wide squat, flat feet on the mat outside the hands, shoulders threaded under the thighs, palms behind the heels.
 * hold = legs straight forward in a V (abduction 45° each), arms straight, thighs high on the backs of the upper arms.
 * Hold: Newton on the pelvis (x, y) so the thighs rest on the upper arms (distance from a point at 80 % of the upper arm to
 * the thigh segment = arm + thigh radius) and the elbows are nearly straight; leg angles from the spec. Prep: pelvis (x, y)
 * so the flat feet stand on the mat with soft elbows. */
{
const MAT = 0.012;
const HX = 0.10, HZ = 0.17;
const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };
const POLE = [-0.2, -1, 0.5];
const ARM = { elbowPole: POLE, curl: 0.05, handFlat: true, handSurface: MAT, shAbd: 4, sh: 60, el: 10 };
const RAW = {
  prep: Object.assign({ trunk: 58, lumbar: 14, thoracic: 18, neck: -16, hip: 112, abd: 44, hrot: 10, knee: 104, ankle: 0, flat: true }, ARM),
  hold: Object.assign({ trunk: 35, lumbar: 30, thoracic: 40, neck: -45, hip: 130, abd: 45, hrot: 10, knee: 0, ankle: 10, flat: false }, ARM),
};

function build(poses, mistakes) {
  const { V, solve, expand, BODY: B } = FB;
  const H = { handL: { at: [HX, MAT, -HZ] }, handR: { at: [HX, MAT, HZ] } };
  const sol = (p, x, extra) => solve(expand(Object.assign({}, p, { ground: [['pelvis', x[1] - FB.CLEAR.pelvis]], pos: [x[0], 0, 0], ik: Object.assign({}, H, extra) })), CTX);
  const D = 180 / Math.PI, ang = (a, b, c) => Math.acos(Math.max(-1, Math.min(1, V.dot(V.norm(V.sub(a, b)), V.norm(V.sub(c, b)))))) * D;
  const elb = (J) => (360 - ang(J.shoulderR, J.elbowR, J.wristR) - ang(J.shoulderL, J.elbowL, J.wristL)) / 2;
  const solveN = (f, x, eps = 1e-3, it = 40) => {
    for (let k = 0; k < it; k++) {
      const r = f(x); if (Math.max(...r.map(Math.abs)) < 1e-4) break;
      const n = x.length, Jm = [];
      for (let j = 0; j < n; j++) { const y = x.slice(); y[j] += eps; const rj = f(y); Jm.push(rj.map((v, i) => (v - r[i]) / eps)); }
      const A = r.map((_, i) => Jm.map((c) => c[i]).concat([r[i]]));
      for (let c = 0; c < n; c++) { let pv = c; for (let q = c + 1; q < n; q++) if (Math.abs(A[q][c]) > Math.abs(A[pv][c])) pv = q; [A[c], A[pv]] = [A[pv], A[c]];
        for (let q = 0; q < n; q++) if (q !== c) { const m = A[q][c] / A[c][c]; for (let w = c; w <= n; w++) A[q][w] -= m * A[c][w]; } }
      const nx = x.map((v, j) => v - Math.max(-0.05, Math.min(0.05, A[j][n] / A[j][j])));
      if (nx.some((v) => !Number.isFinite(v))) break;
      x = nx;
    }
    return x;
  };
  const grid = (f, ys, xs) => { let best = null; for (const a of xs) for (const b of ys) { const e = f([a, b]).reduce((u, v) => u + v * v, 0); if (!best || e < best.e) best = { e, y: [a, b] }; } return best.y; };
  const range = (a, b, st) => { const o = []; for (let v = a; v <= b + 1e-9; v += st) o.push(v); return o; };
  const frame = (F) => ({ 0: F[0].slice(), 1: F[1].slice(), 2: F[2].slice() });
  const segDist = (P, A, Bq) => { const ab = V.sub(Bq, A), t = Math.max(0, Math.min(1, V.dot(V.sub(P, A), ab) / V.dot(ab, ab))); return V.len(V.sub(P, V.add(A, V.mul(ab, t)))); };
  // thigh resting on the upper arm: distance from a point on the upper arm (fraction `at` from the elbow) to the thigh segment
  const contact = (J, at) => ['R', 'L'].map((s) => segDist(V.lerp(J['elbow' + s], J['shoulder' + s], at), J['hip' + s], J['knee' + s]) - 0.11);
  const finish = (p, x) => { p.ground = [['pelvis', x[1] - FB.CLEAR.pelvis]]; p.pos = [x[0], 0, 0]; const q = sol(p, x);
    p.ik = Object.assign({}, H, { ankleL: { at: q.J.ankleL.slice(), foot: frame(q.F.footL) }, ankleR: { at: q.J.ankleR.slice(), foot: frame(q.F.footR) } }); return q; };
  const placeHold = (p, fit) => {
    const f = (x) => { const q = sol(p, x), c = contact(q.J, fit.at); return [(c[0] + c[1]) / 2, (elb(q.J) - fit.el) / 300]; };
    const x = solveN(f, grid(f, range(0.25, 0.9, 0.03), range(-0.7, 0.3, 0.03)));
    return finish(p, x);
  };
  placeHold(poses.hold, { at: 0.8, el: 6 });
  // prep: wide squat, flat feet on the mat, shoulders under the thighs, hands behind the heels
  { const p = poses.prep;
    const f = (x) => { const q = sol(p, x); return [q.J.ankleR[1] - B.ankleH, (elb(q.J) - 12) / 300]; };
    const x = solveN(f, grid(f, range(0.25, 0.8, 0.03), range(-0.5, 0.3, 0.03)));
    finish(p, x); }
  for (const m of mistakes) {
    const base = Object.assign({}, poses[m.at], m.pose);
    placeHold(base, m.fit);
    for (const k of ['ground', 'pos', 'ik']) m.pose[k] = base[k];
  }
  return poses;
}

window.EXERCISE = {
  id: 'firefly_pose',
  name: { tr: 'Ateşböceği Pozu (Tittibhasana)', en: 'Firefly Pose (Tittibhasana)', es: 'Postura de la luciérnaga' },
  category: { tr: 'Yoga · Kol dengesi', en: 'Yoga · Arm balance', es: 'Yoga · Equilibrio de brazos' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['triceps', 'core', 'quads', 'delts', 'hamstrings'],
  tempo: '4-6-3',
  hold: true, holdDur: 3,
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 15, pitch: 10, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Bacaklar V şeklinde açık, kollar düz', en: 'Legs open in a V, arms straight', es: 'Piernas en V, brazos rectos' } },
  setupView: { yaw: 30, pitch: 16 },
  contacts: ['handR', 'handL', 'heelR', 'ballR', 'heelL', 'ballL'],
  props: [['mat', { at: [0.1, 0, 0], length: 1.6, width: 1.0 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = build(RAW, this.mistakes)); },
  rest: 'prep',
  rep: [
    { to: 'hold', dur: 4.0, phase: 0 },
    { to: 'hold', dur: 1.0, phase: 1 },
    { to: 'prep', dur: 3.0, phase: 2 },
  ],
  setup: { tr: 'Geniş çömel, omuzları uylukların altına sok. Avuçlar topukların arkasında matta.',
    en: 'Wide squat, thread the shoulders under the thighs. Palms on the mat behind the heels.',
    es: 'Cuclilla amplia, hombros bajo los muslos. Palmas detrás de los talones.' },
  phases: [
    { name: { tr: 'Ağırlığı ellere ver', en: 'Shift onto the hands', es: 'Peso a las manos' }, breath: 'out', slow: 1.1,
      text: { tr: 'Uyluklar kollarda yüksek, ayakları kaldır, bacakları öne uzat.', en: 'Thighs high on the arms, lift the feet, extend the legs forward.', es: 'Muslos altos en los brazos, eleva los pies, estira las piernas.' } },
    { name: { tr: 'Pozda kal', en: 'Hold', es: 'Mantén' }, breath: 'easy', line: ['hipR', 'kneeR', 'ankleR'],
      text: { tr: 'Kollar düz, dizler gergin, göğüs öne ve yukarı.', en: 'Arms straight, knees locked out, chest forward and up.', es: 'Brazos rectos, rodillas extendidas, pecho adelante.' } },
    { name: { tr: 'Yavaşça in', en: 'Come down', es: 'Baja' }, breath: 'out', slow: 1.0,
      text: { tr: 'Dizleri bük, ayakları mata bırak.', en: 'Bend the knees, lower the feet to the mat.', es: 'Flexiona rodillas, baja los pies.' } },
  ],
  tempoText: { tr: '4 sn gir · 3-5 nefes kal · 3 sn in', en: '4 s in · stay 3-5 breaths · 3 s down', es: '4 s entrar · 3-5 respiraciones · 3 s bajar' },
  mistakes: [
    { title: { tr: 'Uyluklar dirseğe kayıyor', en: 'Thighs slide to the elbows', es: 'Muslos hacia los codos' },
      text: { tr: 'Bacaklar düşer, dirsekler bükülür.', en: 'The legs drop and the elbows buckle.', es: 'Las piernas caen y los codos ceden.' },
      fix: { tr: 'Omuzları uylukların altına sok', en: 'Wriggle the shoulders under the thighs', es: 'Mete los hombros bajo los muslos' },
      fixText: { tr: 'Uyluklar üst kolda yüksek, kollar düz', en: 'Thighs high on the upper arms, arms straight', es: 'Muslos altos, brazos rectos' },
      at: 'hold', fit: { at: 0.3, el: 45 }, pose: { hip: 120 }, marks: ['kneeR', 'elbowR'], parts: ['thighR', 'upperR'] },
    { title: { tr: 'Dizler bükülü kalıyor', en: 'Knees stay bent', es: 'Rodillas flexionadas' },
      text: { tr: 'Bacaklar uzamaz, denge kurulmaz.', en: 'The legs never straighten, no balance.', es: 'Las piernas no se estiran.' },
      fix: { tr: 'Topuklardan it, dizleri uzat', en: 'Press out through the heels', es: 'Empuja con los talones' },
      fixText: { tr: 'Ön bacak kasları aktif, bacaklar düz', en: 'Quads on, legs straight', es: 'Cuádriceps activos, piernas rectas' },
      at: 'hold', fit: { at: 0.8, el: 6 }, pose: { knee: 70, ankle: 0 }, view: { yaw: 60, pitch: 8 }, marks: ['kneeR'], parts: ['shinR', 'thighR'] },
  ],
  cues: [{ tr: 'Uyluklar üst kolda yüksek', en: 'Thighs high on the upper arms', es: 'Muslos altos en los brazos' },
    { tr: 'Yeri it, sırt yuvarlak', en: 'Press the floor away, round the back', es: 'Empuja el suelo, espalda redonda' },
    { tr: 'Göğsü kaldır, öne bak', en: 'Lift the chest, look forward', es: 'Sube el pecho, mira al frente' }],
};
}
