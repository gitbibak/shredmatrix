/* Figure 4 Stretch (supine piriformis, right side). Supine, right ankle crossed over the left thigh just above the knee, right
 * knee open -> lift the left foot and pull the left thigh in with the hands clasped behind it -> hold -> release.
 * - Contacts as supine_twist.js: [shoulderR, hipR] on the mat in every pose, shoulders anchored; head rests on the mat (neck
 *   bisected per pose).
 * - fit() (lazy, after the rig sets FB.BODY):
 *     left foot : start = flat on the mat (hipL bisected so the heel touches), pull = FK (tabletop-ish, thigh toward the chest);
 *                 ankle IK target (+ foot frame) = that pose's own FK foot, so it interpolates.
 *     right ankle: IK target on the front of the left thigh, 80 % of the way to the knee, 8 cm off the thigh axis (the outer
 *                 ankle rests on the thigh), foot frame from the right leg's FK (flexed foot); kneePoleR points out (+z) so
 *                 the right knee opens. A 'mid' in-between key (`card: false`) keeps the ankle on the thigh during the lift.
 *     hands     : start = palms on the mat beside the hips; pull = both hands behind the left thigh (just below the knee pit),
 *                 the right arm threads through the gap between the legs.
 * Spec: start L hip 55 / knee 100, R hip 80 / knee 90 / ER 45 / abd 30; pull L hip 110 / knee 110, R hip 100 / abd 40. */
{
const MAT = 0.012;
const G = [['shoulderR', MAT + 0.035], ['hipR', MAT]];
const CTX = { anchorX: ['shoulderL', 'shoulderR'], anchorAt: [-0.45, 0] };
const BASE = { trunk: -90, ground: G, flat: false, thoracic: 0, lumbar: 0, neck: 0, elbowPole: [0, -1, 0.6], kneePoleR: [0.3, 0.2, 1], kneePoleL: [1, 0, 0], curl: 0.3, noAvoid: true, handFlat: false };   // free hands everywhere (no flat-palm switch when the hands leave the mat)
const RAW = {
  start: { ...BASE, hipL: 55, kneeL: 100, ankleL: 0, hipR: 80, abdR: 30, hrotR: 45, kneeR: 90, ankleR: 15, sh: 8, shAbd: 12, el: 4 },
  mid: { ...BASE, hipL: 82, kneeL: 104, ankleL: -10, hipR: 90, abdR: 35, hrotR: 45, kneeR: 90, ankleR: 15, sh: 30, shAbd: 14, el: 30 },
  pull: { ...BASE, hipL: 110, kneeL: 110, ankleL: -20, hipR: 100, abdR: 40, hrotR: 45, kneeR: 90, ankleR: 15, sh: 70, shAbd: 10, el: 50 },
};

function fit(poses, mistakes) {
  const { V, M, solve, expand } = FB;
  const S = (p) => solve(expand(Object.assign({}, p, { ik: undefined })), CTX);
  const bis = (f, lo, hi) => { let flo = f(lo); for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2, fm = f(m); if ((fm > 0) === (flo > 0)) { lo = m; flo = fm; } else hi = m; } return +((lo + hi) / 2).toFixed(2); };
  const frame = (F) => ({ 0: F[0].slice(), 1: F[1].slice(), 2: F[2].slice() });
  // left foot flat on the mat at the start
  { const p = poses.start; p.hipL = bis((h) => S(Object.assign({}, p, { hipL: h })).J.heelL[1] - MAT, 30, 80);
    p.ankleL = bis((a) => { const J = S(Object.assign({}, p, { ankleL: a })).J; return J.toeL[1] - J.heelL[1]; }, -40, 40); }
  const build = (p, handsOn) => {
    const s = S(p), J = s.J;
    const tAx = V.norm(V.sub(J.kneeL, J.hipL));
    const ant = M.apply(s.F.thighL, [1, 0, 0]);                 // front of the left thigh
    const seat = V.add(V.lerp(J.hipL, J.kneeL, 0.97), V.add(V.mul(ant, 0.07), [0, 0, -0.045]));
    const ik = { ankleL: { at: J.ankleL.slice(), foot: frame(s.F.footL) }, ankleR: { at: seat, foot: frame(s.F.footR) } };
    if (handsOn === 'mat') { ik.handR = { at: [J.hipR[0] + 0.05, MAT + 0.032, J.hipR[2] + 0.12] }; ik.handL = { at: [J.hipL[0] + 0.05, MAT + 0.032, J.hipL[2] - 0.12] }; }
    else {
      const back = V.mul(ant, -0.075), c = V.add(V.lerp(J.hipL, J.kneeL, 0.78), back);
      ik.handR = { at: V.add(c, [0, 0, 0.035]) }; ik.handL = { at: V.add(c, [0, 0, -0.045]) };
      void tAx;
    }
    p.ik = ik;
  };
  const headDown = (p) => { p.neck = bis((n) => S(Object.assign({}, p, { neck: n })).J.head[1] - (MAT + 0.1), -30, 40); };
  for (const k in poses) headDown(poses[k]);
  build(poses.start, 'mat'); build(poses.mid, 'thigh'); build(poses.pull, 'thigh');
  poses.start.palm = 'down'; poses.mid.palm = 'in'; poses.pull.palm = 'in';
  for (const m of mistakes) { const q = Object.assign({}, poses[m.at], m.pose); if (!m.keepNeck) headDown(q); build(q, 'thigh'); m.pose.ik = q.ik; if (!m.keepNeck) m.pose.neck = q.neck; }
  return poses;
}

window.EXERCISE = {
  id: 'figure_4_stretch',
  name: { tr: 'Figür 4 Esnetme', en: 'Figure 4 Stretch', es: 'Estiramiento figura 4' },
  category: { tr: 'Pilates · Esneme', en: 'Pilates · Stretch', es: 'Pilates · Estiramiento' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['glutes', 'adductors'],
  side: 'R',
  tempo: '3-5-3',
  hold: true, holdDur: 3,
  view: { yaw: 25, pitch: 38 },
  alt: { yaw: 90, pitch: 10, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
    text: { tr: 'Baş ve leğen matta, kalça düz', en: 'Head and pelvis down, hips level', es: 'Cabeza y pelvis abajo, cadera nivelada' } },
  setupView: { yaw: 55, pitch: 34 },
  contacts: ['shoulderR', 'shoulderL', 'pelvis', 'heelL', 'head'],
  props: [['mat', { at: [-0.3, 0, 0], length: 1.6, width: 0.75 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fit(RAW, this.mistakes)); },
  rest: 'start',
  rep: [
    { to: 'mid', dur: 2.0, phase: 0 },
    { to: 'pull', dur: 1.6, phase: 0, card: false },
    { to: 'pull', dur: 1.0, phase: 1 },
    { to: 'mid', dur: 1.6, phase: 2 },
    { to: 'start', dur: 2.0, phase: 2, card: false },
  ],
  setup: { tr: 'Sırtüstü yat, dizler bükülü. Sağ ayak bileğini sol dizin hemen üstüne koy, sağ diz yana açık. Sonra taraf değiştir.',
    en: 'Lie on your back, knees bent. Cross the right ankle just above the left knee, right knee open. Then switch sides.',
    es: 'Boca arriba, rodillas flexionadas. Tobillo derecho sobre la rodilla izquierda, rodilla abierta. Luego cambia.' },
  phases: [
    { name: { tr: 'Bacağı çek', en: 'Pull in', es: 'Acerca la pierna' }, breath: 'out', slow: 1.3,
      text: { tr: 'Nefes ver, sol ayağı kaldır. Elleri sol uyluğun arkasında birleştir, göğse çek.', en: 'Exhale, lift the left foot. Clasp behind the left thigh and draw it in.', es: 'Exhala, eleva el pie izquierdo. Toma el muslo por detrás y acércalo.' } },
    { name: { tr: 'Esnemede kal', en: 'Hold', es: 'Mantén' }, breath: 'easy', line: ['hipL', 'hipR'],
      text: { tr: 'Sağ kalçanın dışında esneme. Leğen düz, 20-30 sn derin nefes.', en: 'Stretch in the outer right hip. Pelvis level, breathe deeply 20-30 s.', es: 'Estira la cadera derecha. Pelvis nivelada, respira 20-30 s.' } },
    { name: { tr: 'Bırak', en: 'Release', es: 'Suelta' }, breath: 'out', slow: 1.3,
      text: { tr: 'Sol ayağı mata indir, sonra diğer tarafa geç.', en: 'Lower the left foot to the mat, then switch sides.', es: 'Baja el pie izquierdo y cambia de lado.' } },
  ],
  tempoText: { tr: '3 sn çek · 20-30 sn kal · 3 sn bırak', en: '3 s in · hold 20-30 s · 3 s release', es: '3 s acerca · 20-30 s · 3 s suelta' },
  mistakes: [
    { title: { tr: 'Baş kalkıyor', en: 'Head lifts', es: 'La cabeza se eleva' },
      text: { tr: 'Baş ve omuzlar kalkar, boyun çekilir, çene öne çıkar.', en: 'Head and shoulders lift, the neck strains, chin juts.', es: 'Cabeza y hombros suben, el cuello tira, barbilla adelante.' },
      fix: { tr: 'Başı mata bırak', en: 'Rest the head on the mat', es: 'Apoya la cabeza' },
      fixText: { tr: 'Gerekirse kayış ya da havlu kullan', en: 'Use a strap or towel if needed', es: 'Usa una correa si hace falta' },
      at: 'pull', keepNeck: true, pose: { thoracic: 22, neck: 10, ground: [['shoulderR', MAT + 0.1], ['hipR', MAT]] }, view: { yaw: 90, pitch: 10 }, marks: ['head'], parts: ['neck', 'upper'] },
    { title: { tr: 'Leğen dönüyor', en: 'Pelvis rotates', es: 'La pelvis gira' },
      text: { tr: 'Bir kalça kalkar, esneme kaybolur.', en: 'One hip lifts and the stretch is lost.', es: 'Una cadera se eleva y se pierde el estiramiento.' },
      fix: { tr: 'İki oturma kemiği eşit', en: 'Both sit bones even', es: 'Ambos isquiones iguales' },
      fixText: { tr: 'Leğen matta düz, diz nazikçe dışa', en: 'Pelvis level on the mat, knee gently out', es: 'Pelvis nivelada, rodilla suave hacia fuera' },
      at: 'pull', pose: { roll: 8, twist: -6 }, view: { yaw: 0, pitch: 40 }, line: ['hipL', 'hipR'], marks: ['hipR'], parts: ['pelvis'] },
  ],
  cues: [{ tr: 'Leğen düz, eğilmesin', en: 'Keep the pelvis level', es: 'Pelvis nivelada' },
    { tr: 'Dizi nazikçe dışa it', en: 'Press the knee gently away', es: 'Empuja la rodilla suave hacia fuera' },
    { tr: 'Nefesi kalçaya gönder', en: 'Breathe into the hip', es: 'Respira hacia la cadera' }],
};
}
