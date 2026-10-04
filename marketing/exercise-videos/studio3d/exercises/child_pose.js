/* Child's Pose (Balasana): kneel, sit on the heels, fold forward, forehead and palms on the mat, hold, rise.
 * - Every pose rests on the same two ground contacts [kneeR, ankleR]: the shins lie flat on the mat (tops of the feet down),
 *   so knees and feet never slide; only hip/trunk/spine change.
 * - fitChild() (lazy, after the rig sets FB.BODY) bisects the thoracic flexion so the forehead rests on the mat, then stores
 *   world hand targets (palms on the mat, arms long). The kneeling pose gets world hand targets too (resting on the thighs)
 *   so `ik` exists in every pose and interpolates instead of switching.
 * - measure.mjs hip_flexion uses the pelvis->neck chord; in the fold the rounded spine makes it read lower than the
 *   anatomical thigh-to-trunk fold. */
{
const MAT = 0.012;
const G = [['kneeR', MAT], ['ankleR', MAT - 0.03]];
const BASE = { knee: 152, ankle: -62, flat: false, abd: 9, hrot: 4, ground: G, palm: 'down', curl: 0.1, handFlat: true, noAvoid: true };
const RAW = {
  kneel: { ...BASE, trunk: 0, hip: 64, lumbar: 2, thoracic: 2, neck: 2, sh: 20, el: 35, shAbd: 8, elbowPole: [-1, -0.2, 0.45] },
  fold: { ...BASE, trunk: 72, hip: 128, lumbar: 16, thoracic: 20, neck: 14, sh: 165, el: 2, shAbd: 10, elbowPole: [1, 0, 0.45] },
};
const CTX = { anchorX: ['kneeL', 'kneeR'], anchorAt: [0, 0] };
const HEAD_ON_MAT = MAT + 0.095;

function fitChild(poses, extra) {
  const { solve, expand } = FB;
  const S = (p) => solve(expand(Object.assign({}, p, { ik: undefined })), CTX);
  const headOn = (p) => {           // more thoracic flexion -> head lower
    let lo = -10, hi = 60;
    for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (S({ ...p, thoracic: m }).J.head[1] > HEAD_ON_MAT) lo = m; else hi = m; }
    p.thoracic = +((lo + hi) / 2).toFixed(2);
  };
  const hands = (p, onFloor) => {
    const J = S(p).J;
    // floor: below the straight-arm hand; thighs: palm on top of the thigh, 70% of the way to the knee
    const h = (s) => (onFloor ? [J['hand' + s][0], 0.0, J['hand' + s][2]]
      : FB.V.add(FB.V.lerp(J['hip' + s], J['knee' + s], 0.75), [0, 0.1, s === 'R' ? 0.03 : -0.03]));
    p.ik = { handL: { at: h('L') }, handR: { at: h('R') } };
    p.handSurface = onFloor ? 0 : +(p.ik.handR.at[1] - 0.022).toFixed(3);   // continuous support height (no floor/thigh switch)
  };
  const armsLong = (p) => {         // shoulder flexion that lays the straight arm's hand ~3 cm above the floor
    const y = (v) => S({ ...p, sh: v }).J.handR[1] - 0.03;
    let lo = 110, hi = 200; const up = y(hi) > y(lo);
    for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if ((y(m) > 0) === up) hi = m; else lo = m; }
    p.sh = +((lo + hi) / 2).toFixed(2);
  };
  headOn(poses.fold); armsLong(poses.fold); hands(poses.fold, true); hands(poses.kneel, false);
  for (const [at, pose, fitHead] of extra) {
    const m = Object.assign({}, poses[at], pose, { ik: undefined });
    if (fitHead) { headOn(m); pose.thoracic = m.thoracic; armsLong(m); pose.sh = m.sh; hands(m, true); pose.ik = m.ik; }
  }
  return poses;
}

window.EXERCISE = {
  id: 'child_pose',
  name: { tr: 'Çocuk Pozu (Balasana)', en: "Child's Pose (Balasana)", es: 'Postura del niño (Balasana)' },
  category: { tr: 'Yoga · Esneme', en: 'Yoga · Stretch', es: 'Yoga · Estiramiento' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['lowerback', 'glutes', 'lats'],
  tempo: '4-10-3',
  hold: true, holdDur: 6,
  view: { yaw: 90, pitch: 8 },
  alt: { yaw: 35, pitch: 18, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Dizler kalça genişliğinde, kollar öne uzun', en: 'Knees hip-width, arms long in front', es: 'Rodillas al ancho de cadera, brazos largos al frente' } },
  setupView: { yaw: 40, pitch: 14 },
  contacts: ['kneeR', 'kneeL', 'ankleR', 'ankleL'],
  props: [['mat', { at: [0.25, 0, 0], length: 1.75 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fitChild(RAW, this.mistakes.map((m) => [m.at, m.pose, m.fitHead]))); },
  rest: 'kneel',
  rep: [
    { to: 'fold', dur: 4.0, phase: 0 },
    { to: 'fold', dur: 1.0, phase: 1 },
    { to: 'kneel', dur: 3.0, phase: 2 },
  ],
  setup: { tr: 'Diz çök, başparmaklar birleşik, dizler kalça genişliğinde. Kalçayı topuklara oturt.',
    en: 'Kneel with big toes together, knees hip-width. Sit back on your heels.',
    es: 'De rodillas, dedos gordos juntos, rodillas al ancho de cadera. Siéntate sobre los talones.' },
  phases: [
    { name: { tr: 'Öne katlan', en: 'Fold forward', es: 'Pliégate' }, breath: 'out', slow: 1.0,
      text: { tr: 'Nefes verirken kalçadan öne eğil, kolları mat üzerinde öne uzat.', en: 'Exhale, fold from the hips and slide the arms forward.', es: 'Exhala, pliégate desde la cadera y desliza los brazos.' } },
    { name: { tr: 'Dinlen', en: 'Rest', es: 'Descansa' }, breath: 'easy', line: ['pelvis', 'heelR'],
      text: { tr: 'Kalça topuklarda, alın matta. Sırtına doğru nefes al.', en: 'Hips on heels, forehead down. Breathe into your back.', es: 'Cadera en talones, frente abajo. Respira hacia la espalda.' } },
    { name: { tr: 'Yavaşça doğrul', en: 'Rise slowly', es: 'Sube despacio' }, breath: 'in', slow: 1.2,
      text: { tr: 'Elleri geri yürüt, nefes alarak gövdeyi kaldır.', en: 'Walk the hands back and inhale up to sitting.', es: 'Camina las manos atrás e inhala al subir.' } },
  ],
  tempoText: { tr: '4 sn katlan · 1-3 dk dinlen · 3 sn doğrul', en: '4 s fold · rest 1-3 min · 3 s rise', es: '4 s pliégate · 1-3 min · 3 s sube' },
  mistakes: [
    { title: { tr: 'Kalça topuklardan kalkıyor', en: 'Hips lift off the heels', es: 'La cadera se separa de los talones' },
      text: { tr: 'Kalça havada kalır, ağırlık kollara ve başa biner.', en: 'The hips hover; weight shifts to the arms and head.', es: 'La cadera flota; el peso va a brazos y cabeza.' },
      fix: { tr: 'Kalçayı topuklara bırak', en: 'Let the hips sink to the heels', es: 'Deja caer la cadera a los talones' },
      fixText: { tr: 'Gerekirse kalça ile topuk arasına battaniye koy', en: 'Put a blanket between hips and heels if needed', es: 'Pon una manta entre cadera y talones si hace falta' },
      at: 'fold', fitHead: true, pose: { knee: 112, hip: 100, trunk: 70 }, marks: ['pelvis'], parts: ['pelvis', 'thigh'] },
    { title: { tr: 'Baş havada asılı kalıyor', en: 'Head hangs in the air', es: 'La cabeza cuelga en el aire' },
      text: { tr: 'Alın yere ulaşmaz, boyun zorlanır.', en: 'The forehead does not reach the floor; the neck strains.', es: 'La frente no llega al suelo; el cuello se tensa.' },
      fix: { tr: 'Alnın altına destek koy', en: 'Support the forehead', es: 'Apoya la frente' },
      fixText: { tr: 'Blok ya da yastık alına destek olsun, boyun gevşek', en: 'A block or bolster under the forehead, neck soft', es: 'Un bloque o cojín bajo la frente, cuello suelto' },
      at: 'fold', pose: { thoracic: 0, lumbar: 8, neck: 38, trunk: 66 }, view: { yaw: 70, pitch: 6 }, marks: ['head'], parts: ['neck'] },
  ],
  cues: [{ tr: 'Kalça topuklara', en: 'Hips toward the heels', es: 'Cadera a los talones' },
    { tr: 'Sırtına nefes al', en: 'Breathe into the back', es: 'Respira hacia la espalda' },
    { tr: 'Omuzlar gevşek', en: 'Relax the shoulders', es: 'Hombros relajados' }],
};
}
