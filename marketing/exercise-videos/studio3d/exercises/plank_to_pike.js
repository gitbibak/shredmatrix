/* Plank to Pike (Pilates mat). Side view. Built on the approved downward_dog.js (hands anchored + planted, every pose on the
 * same two ground contacts [handR, toeR], pinFeet() ankle IK targets so the toe tips never slide) and plank_pose.js (plank
 * line, shoulders stacked over the wrists).
 * - The hands AND the toes stay on their spots (spec: "hands stay still"), so the pike is fitted (fitPike, lazy): hip flexion
 *   is bisected so that, with straight legs and the arms in line with the trunk (sh 168), the toes land exactly where they were
 *   in the plank. Heels lower toward the mat (ankle 0) as the hips rise.
 *   KNOWN DEVIATION: with hands and toes both fixed, the plank length allows hip flexion ~66° and a 25 cm hip rise (spec 85°,
 *   30-40 cm, which needs the feet ~30 cm closer to the hands = sliders). Feet that do not slide were judged more important.
 * - Mistakes with `pin: true` get their own foot targets (downward_dog.js pattern). */
{
const MAT_Y = 0.012;
const G = [['handR', MAT_Y], ['toeR', MAT_Y]];
const CTX = { anchorX: ['handL', 'handR'], anchorAt: [0.45, 0] };
const PLANK = { pos: [0, 0, 0], trunk: 82, hip: 0, knee: 0, ankle: -36, flat: false, sh: 82, shAbd: 2, el: 0, abd: 3, neck: -4, kneePole: [1, 0, 0], ground: G };
const PIKE = { trunk: 135, hip: 95, knee: 0, ankle: 0, flat: false, sh: 168, shAbd: 4, el: 0, abd: 3, neck: 12, kneePole: [1, 0, 0], ground: G };
const RAW = { plank: PLANK, pike: PIKE };

function fitPike(poses, extra) {
  const { V, solve, expand } = FB;
  const fk = (p) => solve(expand(Object.assign({}, p, { ik: undefined })), CTX);
  const T = fk(poses.plank).J.toeR;
  const bis = (f, lo, hi) => { let flo = f(lo); for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2, fm = f(m); if ((fm > 0) === (flo > 0)) { lo = m; flo = fm; } else hi = m; } return +((lo + hi) / 2).toFixed(2); };
  // pike: hip flexion so the straight-leg toe lands on the plank toe spot, and a root shift (pos) so the shoulder is at full
  // reach from the flat-hand wrist target (the anchor uses the FK fingertip, which sits ahead of the flat-hand wrist when
  // the arm slopes: without the shift the elbows bend ~20°). Alternated until both hold.
  const { BODY: B } = FB;
  const pl = fk(poses.plank).J.handR, wristT = [pl[0] - B.hand * 0.6, MAT_Y + 0.042, pl[2]];
  const fitArms = (p) => { p.pos = [0, 0, 0];
    for (let k = 0; k < 6; k++) {
      p.hip = bis((h) => fk(Object.assign({}, p, { hip: h })).J.toeR[0] - T[0], 40, 140);
      const dx = bis((x) => (B.upper + B.fore - 0.0008) - V.len(V.sub(wristT, fk(Object.assign({}, p, { pos: [x, 0, 0] })).J.shoulderR)), -0.15, 0.1);
      p.pos = [dx, 0, 0];
    } };
  fitArms(poses.pike);
  // knee-bend mistake: refit hip with the bent knee
  for (const [at, pose] of extra) if (pose.refitHip) { const m = Object.assign({}, poses[at], pose); fitArms(m); pose.hip = m.hip; pose.pos = m.pos; delete pose.refitHip; }
  const frame = (F) => ({ 0: F[0].slice(), 1: F[1].slice(), 2: F[2].slice() });
  const pin = (p) => {
    const sol = fk(p), d = [T[0] - sol.J.toeR[0], 0, 0];
    p.ik = Object.assign({}, p.ik, {
      ankleR: { at: V.add(sol.J.ankleR, d), foot: frame(sol.F.footR) },
      ankleL: { at: V.add(sol.J.ankleL, d), foot: frame(sol.F.footL) },
    });
  };
  for (const k in poses) pin(poses[k]);
  for (const [at, pose] of extra) { const merged = Object.assign({}, poses[at], pose); pin(merged); pose.ik = merged.ik; }
  return poses;
}

window.EXERCISE = {
  id: 'plank_to_pike',
  name: { tr: 'Plank\'tan Pike\'a', en: 'Plank to Pike', es: 'De plancha a pike' },
  category: { tr: 'Pilates · Karın', en: 'Pilates · Core', es: 'Pilates · Core' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['core', 'delts', 'triceps', 'hamstrings', 'quads'],
  tempo: '2-2',
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 28, pitch: 12, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Eller sabit, omuzlar bileklerin üstünde başlar', en: 'Hands still, shoulders start over the wrists', es: 'Manos quietas, hombros sobre las muñecas' } },
  setupView: { yaw: 35, pitch: 16 },
  setupMarks: [{ type: 'aline', joints: ['wristR', 'shoulderR'] }],
  contacts: ['handR', 'handL', 'toeR', 'toeL'],
  props: [['mat', { at: [-0.25, 0, 0], length: 2.0 }]],
  ctx: Object.assign({ plant: ['handL', 'handR'] }, CTX),
  get poses() { return this._poses || (this._poses = fitPike(RAW, this.mistakes.filter((m) => m.pin).map((m) => [m.at, m.pose]))); },
  rest: 'plank',
  rep: [
    { to: 'pike', dur: 2.0, phase: 0 },
    { to: 'plank', dur: 2.0, phase: 1 },
  ],
  setup: { tr: 'Yüksek plank: eller omuzların altında, kollar düz. Baştan topuğa tek çizgi.',
    en: 'High plank: hands under the shoulders, arms straight. One line from head to heels.',
    es: 'Plancha alta: manos bajo los hombros, brazos rectos. Una línea de cabeza a talones.' },
  phases: [
    { name: { tr: 'Kalçayı kaldır', en: 'Pike up', es: 'Sube la cadera' }, breath: 'out', slow: 1.3, line: ['wristR', 'shoulderR', 'hipR'],
      text: { tr: 'Nefes ver, karnı içe çek, kalçayı yukarı ve geri gönder. Bacaklar düz.', en: 'Exhale, draw the belly in, send the hips up and back. Legs straight.', es: 'Exhala, mete el abdomen, cadera arriba y atrás. Piernas rectas.' } },
    { name: { tr: 'Plank\'a dön', en: 'Back to plank', es: 'Vuelve a plancha' }, breath: 'in', slow: 1.3, line: ['ankleR', 'pelvis', 'shoulderR'],
      text: { tr: 'Nefes al, öne uzan. Omuzlar yine bileklerin üstünde.', en: 'Inhale, roll forward. Shoulders back over the wrists.', es: 'Inhala, rueda adelante. Hombros sobre las muñecas.' } },
  ],
  tempoText: { tr: '2 sn kalk · 2 sn plank\'a dön', en: '2 s pike up · 2 s back to plank', es: '2 s arriba · 2 s a plancha' },
  mistakes: [
    { title: { tr: 'Dizler bükülüyor', en: 'Knees bend', es: 'Las rodillas se doblan' },
      text: { tr: 'Kalça kalkarken dizler kırılır, karın çalışmaz.', en: 'The knees buckle as the hips lift; the abs switch off.', es: 'Las rodillas se doblan al subir; el abdomen no trabaja.' },
      fix: { tr: 'Topukları yere uzat', en: 'Reach the heels down', es: 'Lleva los talones abajo' },
      fixText: { tr: 'Kalçayı karından kaldır, bacaklar düz', en: 'Lift the hips from the belly, legs straight', es: 'Sube la cadera desde el abdomen, piernas rectas' },
      at: 'pike', pin: true, pose: { knee: 40, ankle: 30, refitHip: true }, marks: ['kneeR'], parts: ['thigh', 'shin'] },
    { title: { tr: 'Omuzlar çöküyor', en: 'Shoulders collapse', es: 'Los hombros se hunden' },
      text: { tr: 'Göğüs yere düşer, omuzlar kulaklara kalkar.', en: 'The chest sinks and the shoulders creep to the ears.', es: 'El pecho se hunde y los hombros suben.' },
      fix: { tr: 'Yeri kendinden it', en: 'Push the mat away', es: 'Empuja el suelo' },
      fixText: { tr: 'Kollar düz, boyun uzun', en: 'Straight arms, long neck', es: 'Brazos rectos, cuello largo' },
      at: 'pike', pin: true, pose: { shrug: 0.05, thoracic: -16, sh: 178, neck: -26, refitHip: true }, view: { yaw: 50, pitch: 8 }, marks: ['shoulderR', 'head'], parts: ['upper', 'neck', 'chest'] },
  ],
  cues: [{ tr: 'Kalçayı karından kaldır', en: 'Lift the hips from the belly', es: 'Sube la cadera desde el abdomen' },
    { tr: 'Kollar düz, yeri it', en: 'Arms straight, push the floor away', es: 'Brazos rectos, empuja el suelo' },
    { tr: 'Omuzlar bileklerin üstünde', en: 'Shoulders over the wrists', es: 'Hombros sobre las muñecas' }],
};
}
