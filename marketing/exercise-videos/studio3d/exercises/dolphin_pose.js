/* Dolphin Pose (Ardha Pincha Mayurasana). Side view. Built on downward_dog.js (forearm version).
 * - Every pose rests on the same two ground contacts [elbowR, toeR]; the elbows are the horizontal anchor (anchorX), so they
 *   never move. fitArms() (lazy, after the rig sets FB.BODY) bisects the elbow flexion of every pose so the FK forearm lies
 *   flat on the mat pointing forward; the palms are then planted (captured from the rest pose) on the spot the flat forearm
 *   reaches, so the forearm IK reproduces FK and the forearms stay glued to the mat through every transition.
 * - Feet: pinFeet() from downward_dog.js (toe tips stay on one spot; the spec's "walk the feet in a little" is skipped so
 *   the toes never slide).
 * - Tabletop on forearms: knees on the mat (knee flexion bisected per rig so the knee rests on the mat). */
{
const MAT = 0.012;
const G = [['elbowR', MAT], ['toeR', MAT]];
const CTX = { anchorX: ['elbowL', 'elbowR'], anchorAt: [0.55, 0] };
const ARMS = { shAbd: 2, curl: 0.05, bend: [0, 1, 0] };   // forearm bends toward the head side (forward on the mat)
const RAW = {
  table: Object.assign({ trunk: 90, hip: 96, knee: 100, ankle: 30, flat: false, sh: 100, el: 90, neck: -4, ground: G }, ARMS),
  dolphin: Object.assign({ trunk: 133, hip: 100, knee: 10, ankle: 28, flat: false, sh: 138, el: 90, neck: -6, ground: G }, ARMS),
};

function build(poses, mistakes) {
  const { V, solve, expand } = FB;
  const fk = (p) => solve(expand(Object.assign({}, p, { ik: undefined })), CTX);
  const bis = (f, lo, hi) => { let flo = f(lo); for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2, fm = f(m); if ((fm > 0) === (flo > 0)) { lo = m; flo = fm; } else hi = m; } return (lo + hi) / 2; };
  const flatFore = (p) => { p.el = bis((e) => { const J = fk(Object.assign({}, p, { el: e })).J; return J.wristR[1] - J.elbowR[1]; }, 20, 170); };
  const n2 = (f, x, e = [0.3, 0.3], cl = [6, 6]) => {   // 2x2 Newton with finite differences (surya_namaskar_a.js)
    for (let it = 0; it < 40; it++) {
      const r = f(x);
      if (Math.abs(r[0]) < 2e-4 && Math.abs(r[1]) < 2e-4) break;
      const a = f([x[0] + e[0], x[1]]), b = f([x[0], x[1] + e[1]]);
      const J = [[(a[0] - r[0]) / e[0], (b[0] - r[0]) / e[1]], [(a[1] - r[1]) / e[0], (b[1] - r[1]) / e[1]]];
      const det = J[0][0] * J[1][1] - J[0][1] * J[1][0]; if (Math.abs(det) < 1e-12) break;
      const dx0 = (J[1][1] * r[0] - J[0][1] * r[1]) / det, dx1 = (-J[1][0] * r[0] + J[0][0] * r[1]) / det;
      x = [x[0] - Math.max(-cl[0], Math.min(cl[0], dx0)), x[1] - Math.max(-cl[1], Math.min(cl[1], dx1))];
    }
    return x;
  };
  // two contacts rotate the body rigidly, so the trunk angle is a result: fit shoulder flexion + ankle so the measured trunk
  // (pelvis -> neck) hits its target and the upper arm stands vertical (elbow under the shoulder)
  const fitDog = (p, trunkDeg, kA = 'ankle', shOff = 0) => {
    const f = (x) => { const q = Object.assign({}, p, { sh: x[0], [kA]: x[1] }); flatFore(q); const J = fk(q).J, u = V.norm(V.sub(J.neck, J.pelvis));
      return [trunkDeg === 'toe' ? J.toeR[0] - T0[0] : (Math.acos(u[1]) * 180 / Math.PI - trunkDeg) / 100, J.shoulderR[0] - J.elbowR[0] - shOff]; };
    const x = n2(f, [p.sh, p[kA]]); p.sh = x[0]; p[kA] = x[1]; flatFore(p);
  };
  fitDog(poses.dolphin, 140, 'hip');
  const T0 = fk(poses.dolphin).J.toeR;   // mistakes fitted with 'toe' keep this toe spot (knees keep their bend)
  // tabletop: knees on the mat
  flatFore(poses.table);
  poses.table.knee = bis((k) => fk(Object.assign({}, poses.table, { knee: k })).J.kneeR[1] - MAT - 0.05, 70, 140);
  flatFore(poses.table); flatFore(poses.dolphin);
  for (const [at, mp, fit] of mistakes) { const m = Object.assign({}, poses[at], mp); if (fit) fitDog(m, fit[0], 'hip', fit[1]); else flatFore(m); mp.el = m.el; mp.sh = m.sh; mp.hip = m.hip; }
  // pin the toes (downward_dog.js)
  const T = fk(poses.dolphin).J.toeR;
  const frame = (F) => ({ 0: F[0].slice(), 1: F[1].slice(), 2: F[2].slice() });
  const pin = (p) => {
    const sol = fk(p), d = [T[0] - sol.J.toeR[0], 0, 0];
    p.ik = Object.assign({}, p.ik, {
      ankleR: { at: V.add(sol.J.ankleR, d), foot: frame(sol.F.footR) },
      ankleL: { at: V.add(sol.J.ankleL, d), foot: frame(sol.F.footL) },
    });
  };
  for (const k in poses) pin(poses[k]);
  for (const [at, mp] of mistakes) { const m = Object.assign({}, poses[at], mp); pin(m); mp.ik = Object.assign({}, m.ik, mp.ik); }
  return poses;
}

window.EXERCISE = {
  id: 'dolphin_pose',
  name: { tr: 'Yunus Pozu (Ardha Pincha Mayurasana)', en: 'Dolphin Pose (Ardha Pincha Mayurasana)', es: 'Postura del delfín' },
  category: { tr: 'Yoga · Omuz · Arka bacak', en: 'Yoga · Shoulders · Hamstrings', es: 'Yoga · Hombros · Isquios' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['delts', 'triceps', 'upperback', 'hamstrings', 'core'],
  tempo: '4-8-3',
  hold: true, holdDur: 5,
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 25, pitch: 14, title: { tr: 'Önden çapraz', en: 'Front angle', es: 'Vista frontal' },
    text: { tr: 'Önkollar paralel, dirsekler omuz genişliğinde', en: 'Forearms parallel, elbows shoulder-width', es: 'Antebrazos paralelos, codos al ancho de hombros' } },
  setupView: { yaw: 40, pitch: 16 },
  setupMarks: [{ type: 'aline', joints: ['elbowR', 'shoulderR'] }, { type: 'aline', joints: ['kneeR', 'hipR'] }],
  contacts: ['elbowR', 'elbowL', 'handR', 'handL', 'kneeR', 'kneeL', 'toeR', 'toeL'],
  props: [['mat', { at: [0.1, 0, 0], length: 1.85 }]],
  ctx: Object.assign({ plant: ['handL', 'handR'] }, CTX),
  get poses() { return this._poses || (this._poses = build(RAW, this.mistakes.map((m) => [m.at, m.pose, m.fit]))); },
  rest: 'table',
  rep: [
    { to: 'dolphin', dur: 4.0, phase: 0 },
    { to: 'dolphin', dur: 1.0, phase: 1 },
    { to: 'table', dur: 3.0, phase: 2 },
  ],
  setup: { tr: 'Önkollar matta, dirsekler omuzların altında, önkollar paralel. Dizler kalçanın altında.',
    en: 'Forearms on the mat, elbows under the shoulders, forearms parallel. Knees under the hips.',
    es: 'Antebrazos en la esterilla, codos bajo los hombros, paralelos. Rodillas bajo la cadera.' },
  phases: [
    { name: { tr: 'Kalçayı kaldır', en: 'Lift the hips', es: 'Eleva la cadera' }, breath: 'out', slow: 1.0,
      text: { tr: 'Parmakları kıvır, dizleri kaldır, kalçayı yukarı ve geri gönder.', en: 'Tuck the toes, lift the knees, send the hips up and back.', es: 'Apoya los dedos, eleva rodillas, cadera arriba y atrás.' } },
    { name: { tr: 'Pozda kal', en: 'Hold', es: 'Mantén' }, breath: 'easy', line: ['elbowR', 'shoulderR', 'hipR'],
      text: { tr: 'Önkolları bastır, omurga uzun, baş kolların arasında.', en: 'Press the forearms down, long spine, head between the arms.', es: 'Presiona los antebrazos, columna larga, cabeza entre los brazos.' } },
    { name: { tr: 'Dizleri indir', en: 'Lower the knees', es: 'Baja las rodillas' }, breath: 'out', slow: 1.2,
      text: { tr: 'Nefes vererek dizleri mata indir.', en: 'Exhale and lower the knees to the mat.', es: 'Exhala y baja las rodillas.' } },
  ],
  tempoText: { tr: '4 sn çık · 5-8 nefes kal · 3 sn in', en: '4 s up · stay 5-8 breaths · 3 s down', es: '4 s arriba · 5-8 respiraciones · 3 s abajo' },
  mistakes: [
    { title: { tr: 'Sırt yuvarlak, kalça alçak', en: 'Rounded back, low hips', es: 'Espalda redonda, cadera baja' },
      text: { tr: 'Kalça düşer, sırt kamburlaşır, omuzlar öne kayar.', en: 'The hips sink, the back rounds, the shoulders slide forward.', es: 'La cadera baja, la espalda se redondea.' },
      fix: { tr: 'Dizleri bük, oturma kemiklerini kaldır', en: 'Bend the knees, lift the sit bones', es: 'Flexiona rodillas, eleva los isquiones' },
      fixText: { tr: 'Önce uzun omurga, sonra düz bacak', en: 'Long spine first, straight legs second', es: 'Primero columna larga, luego piernas rectas' },
      at: 'dolphin', fit: ['toe', 0.08], pose: { knee: 34, lumbar: 20, thoracic: 18, neck: -12 }, line: ['elbowR', 'shoulderR', 'hipR'], parts: ['chest', 'waist'] },
    { title: { tr: 'Ağırlık boyuna biniyor', en: 'Dumping into the neck', es: 'Peso en el cuello' },
      text: { tr: 'Göğüs çöker, omuzlar kulaklara, baş kolların altına düşer.', en: 'The chest sinks, shoulders to the ears, the head drops below the arms.', es: 'El pecho se hunde, hombros a las orejas, la cabeza cae.' },
      fix: { tr: 'Önkolları it, omuzları kaldır', en: 'Press the forearms, lift the shoulders', es: 'Empuja los antebrazos, sube los hombros' },
      fixText: { tr: 'Omuzlar kulaklardan uzak, boyun rahat', en: 'Shoulders away from the ears, neck relaxed', es: 'Hombros lejos de las orejas, cuello suelto' },
      at: 'dolphin', fit: ['toe', 0.07], pose: { shrug: 0.05, thoracic: -12, neck: 26 }, view: { yaw: 55, pitch: 8 }, marks: ['shoulderR', 'head'], parts: ['upper', 'neck'] },
  ],
  cues: [{ tr: 'Dirsekler omuz genişliğinde, önkollar paralel', en: 'Elbows shoulder-width, forearms parallel', es: 'Codos al ancho de hombros' },
    { tr: 'Kalça yukarı, omurga uzun', en: 'Hips high, long spine', es: 'Cadera alta, columna larga' },
    { tr: 'Önkolları bastır, omuzlar kulaktan uzak', en: 'Press the forearms, shoulders away from ears', es: 'Hombros lejos de las orejas' }],
};
}
