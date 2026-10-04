/* Seated Forward Fold (Paschimottanasana) / Yin Caterpillar. Long sitting -> arms up -> hinge forward, hands hold the feet ->
 * hold -> roll up.
 * - All poses rest on the same two ground contacts [pelvis, heelR]: the legs stay on the mat, `hip` alone sets the fold
 *   (the solver rotates the body so sit bones and heels stay down; `trunk` is irrelevant here).
 * - fitFold() (lazy, after the rig sets FB.BODY) bisects the hip flexion so the shoulders come within arm's reach of the feet,
 *   then stores world hand targets on the outer edges of the feet. Every pose has hand targets (beside the hips / overhead /
 *   on the feet) so `ik` interpolates instead of switching. Mistakes get reach-clamped targets (hands slide to the shins).
 * - measure.mjs hip_flexion uses the pelvis->neck chord; with the rounded yin spine it reads lower than the pelvis-thigh fold. */
{
const MAT = 0.012;
const G = [['pelvis', MAT], ['heelR', MAT]];
const BASE = { trunk: 0, knee: 4, ankle: 8, flat: false, abd: 4, ground: G, handFlat: false, curl: 0.35, palm: 'in' };
const RAW = {
  sit: { ...BASE, hip: 90, lumbar: -2, thoracic: 0, neck: 4, sh: 4, shAbd: 14, el: 8, palm: 'in', elbowPole: [-1, -0.2, 0.5] },
  reach: { ...BASE, hip: 96, lumbar: -4, thoracic: -4, neck: -4, sh: 168, shAbd: 12, el: 4, palm: 'in', curl: 0.1, elbowPole: [0, 0, 1] },
  fold: { ...BASE, hip: 140, knee: 10, lumbar: 18, thoracic: 22, neck: 14, sh: 150, shAbd: 14, el: 20, curl: 0.7, elbowPole: [0.6, 0, 1] },
};
const CTX = { anchorX: ['pelvis'], anchorAt: [-0.35, 0] };

function fitFold(poses, extra) {
  const { V, solve, expand } = FB;
  const S = (p) => solve(expand(Object.assign({}, p, { ik: undefined })), CTX).J;
  const footT = (J, s) => V.add(J['ball' + s], [-0.03, 0.035, (s === 'R' ? 1 : -1) * 0.055]);   // outer edge of the foot
  const REACH = 0.538;
  const fitHip = (p) => {                      // more hip flexion -> shoulder closer to the foot
    const f = (h) => { const J = S({ ...p, hip: h }); return V.len(V.sub(footT(J, 'R'), J.shoulderR)) - REACH; };
    let lo = 95, hi = 175;
    for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (f(m) > 0) lo = m; else hi = m; }
    p.hip = +((lo + hi) / 2).toFixed(2);
  };
  const handsOnFeet = (p) => {
    const J = S(p), t = (s) => {
      const sh = J['shoulder' + s], f = footT(J, s), d = V.sub(f, sh), L = V.len(d);
      return L > REACH + 0.01 ? V.add(sh, V.mul(d, (REACH + 0.01) / L)) : f;      // out of reach: hands stop on the shins
    };
    p.ik = { handL: { at: t('L') }, handR: { at: t('R') } };
  };
  const handsFK = (p, floor) => {
    const J = S(p), t = (s) => (floor ? [J['hand' + s][0], MAT + 0.035, J['hand' + s][2]] : J['hand' + s].slice());
    p.ik = { handL: { at: t('L') }, handR: { at: t('R') } };
  };
  fitHip(poses.fold); handsOnFeet(poses.fold); handsFK(poses.sit, true); handsFK(poses.reach, false);
  for (const [at, pose] of extra) { const m = Object.assign({}, poses[at], pose); handsOnFeet(m); pose.ik = m.ik; }
  return poses;
}

window.EXERCISE = {
  id: 'seated_forward_fold',
  name: { tr: 'Oturarak Öne Eğilme (Paschimottanasana)', en: 'Seated Forward Fold', es: 'Flexión sentada hacia delante' },
  category: { tr: 'Yoga · Esneme', en: 'Yoga · Stretch', es: 'Yoga · Estiramiento' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['hamstrings', 'lowerback', 'calves'],
  tempo: '1.5-3-hold-3',
  hold: true, holdDur: 3,
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 35, pitch: 16, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Eller ayaklarda, omuzlar kulaktan uzak', en: 'Hands on the feet, shoulders away from the ears', es: 'Manos en los pies, hombros lejos de las orejas' } },
  setupView: { yaw: 45, pitch: 14 },
  contacts: ['pelvis', 'heelR', 'heelL'],
  props: [['mat', { at: [0.05, 0, 0], length: 1.6 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fitFold(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'sit',
  rep: [
    { to: 'reach', dur: 1.5, phase: 0 },
    { to: 'fold', dur: 3.0, phase: 1 },
    { to: 'fold', dur: 1.0, phase: 2 },
    { to: 'sit', dur: 3.0, phase: 3 },
  ],
  setup: { tr: 'Bacaklar önde uzun ve bitişik, ayak parmakları yukarı. Dik otur, eller kalçanın yanında.',
    en: 'Legs long and together, toes up. Sit tall, hands beside the hips.',
    es: 'Piernas largas y juntas, dedos arriba. Siéntate erguida, manos junto a la cadera.' },
  phases: [
    { name: { tr: 'Uzan', en: 'Lengthen', es: 'Alarga' }, breath: 'in',
      text: { tr: 'Nefes alırken kolları kaldır, omurgayı uzat.', en: 'Inhale, raise the arms and lengthen the spine.', es: 'Inhala, sube los brazos y alarga la columna.' } },
    { name: { tr: 'Kalçadan katlan', en: 'Hinge forward', es: 'Pliégate desde la cadera' }, breath: 'out', slow: 1.0,
      text: { tr: 'Nefes verirken kalçadan öne eğil, elleri ayaklara uzat.', en: 'Exhale, hinge from the hips and reach for the feet.', es: 'Exhala, pliégate desde la cadera hacia los pies.' } },
    { name: { tr: 'Pozda kal', en: 'Hold', es: 'Mantén' }, breath: 'easy', line: ['pelvis', 'kneeR'],
      text: { tr: 'Eller ayakları tutar, dizler yumuşak. 5-10 nefes bırak.', en: 'Hands hold the feet, knees soft. Release for 5-10 breaths.', es: 'Manos en los pies, rodillas suaves. Suelta 5-10 respiraciones.' } },
    { name: { tr: 'Yavaşça doğrul', en: 'Roll up', es: 'Sube despacio' }, breath: 'in', slow: 1.0,
      text: { tr: 'Nefes alarak omur omur yukarı gel.', en: 'Inhale and roll up one vertebra at a time.', es: 'Inhala y sube vértebra a vértebra.' } },
  ],
  tempoText: { tr: 'Uzan · 3 sn katlan · 5-10 nefes kal · 3 sn doğrul', en: 'Lengthen · 3 s fold · 5-10 breaths · 3 s up', es: 'Alarga · 3 s pliégate · 5-10 respiraciones · 3 s arriba' },
  mistakes: [
    { title: { tr: 'Bel yuvarlanıyor, leğen geride', en: 'Rounding from the low back', es: 'Redondear desde la lumbar' },
      text: { tr: 'Leğen geriye düşer, eğilme kalçadan değil belden olur.', en: 'The pelvis tips back; the fold comes from the low back.', es: 'La pelvis cae atrás; se dobla la lumbar, no la cadera.' },
      fix: { tr: 'Battaniyeye otur, dizleri bük', en: 'Sit on a blanket, bend the knees', es: 'Siéntate en una manta, flexiona rodillas' },
      fixText: { tr: 'Önce kalça öne, sonra omurga uzun', en: 'Pelvis forward first, then a long spine', es: 'Primero la pelvis adelante, luego columna larga' },
      at: 'fold', pose: { hip: 98, lumbar: 30, thoracic: 26, neck: 16 }, marks: ['pelvis'], line: ['pelvis', 'waist', 'neck'], parts: ['waist', 'pelvis'] },
    { title: { tr: 'Boyunla çekmek', en: 'Pulling with the neck', es: 'Tirar con el cuello' },
      text: { tr: 'Baş zorla aşağı itilir, omuzlar kulağa kalkar.', en: 'The head is forced down, shoulders hike up.', es: 'La cabeza se fuerza abajo, los hombros suben.' },
      fix: { tr: 'Boyun gevşek, gerekirse kemer kullan', en: 'Relax the neck, use a strap if needed', es: 'Cuello suelto, usa una correa si hace falta' },
      fixText: { tr: 'Bakış bacaklara, ense uzun', en: 'Gaze along the legs, long back of the neck', es: 'Mirada a las piernas, nuca larga' },
      at: 'fold', pose: { neck: 48, shrug: 0.04, el: 45 }, view: { yaw: 60, pitch: 10 }, marks: ['head', 'shoulderR'], parts: ['neck', 'upper'] },
  ],
  cues: [{ tr: 'Kalçadan katlan', en: 'Hinge from the hips', es: 'Pliégate desde la cadera' },
    { tr: 'Ayak parmakları yukarı', en: 'Flex the feet', es: 'Pies flexionados' },
    { tr: 'Gerekirse dizleri yumuşat', en: 'Soften the knees if needed', es: 'Suaviza las rodillas si hace falta' }],
};
}
