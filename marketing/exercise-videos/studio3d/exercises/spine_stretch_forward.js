/* Spine Stretch Forward (Pilates mat, seated). seated_forward_fold base: every pose rests on [pelvis, heelR] (legs long on
 * the mat, ~shoulder-width apart, feet flexed), `hip` sets how far the trunk folds; the forward pose adds the deep C-curve
 * (lumbar 45, thoracic 35, neck 40) while the sit bones stay anchored.
 * Arms reach forward parallel to the floor, palms down: fit() (lazy) bisects the shoulder flexion per pose so the arms
 * stay horizontal (arm_elev ~0) while the spine rounds. */
{
const MAT = 0.012;
const G = [['pelvis', MAT], ['heelR', MAT]];
const BASE = { trunk: 0, knee: 0, ankle: 6, flat: false, abd: 15, hrot: 4, ground: G, shAbd: 6, el: 4, palm: 'down', curl: 0.1, _elev: 0 };
const RAW = {
  tall: { ...BASE, hip: 90, lumbar: -2, thoracic: 0, neck: 2 },
  fold: { ...BASE, hip: 72, lumbar: 45, thoracic: 35, neck: 40, _elev: -6 },
};
const CTX = { anchorX: ['pelvis'], anchorAt: [-0.35, 0] };

function fit(poses, extra) {
  const { V, solve, expand } = FB;
  const S = (p) => solve(expand(p), CTX).J;
  const arms = (p) => {
    const f = (sh) => { const J = S({ ...p, sh }); const d = V.norm(V.sub(J.handR, J.shoulderR)); return Math.asin(d[1]) * 180 / Math.PI - p._elev; };
    let lo = 0, hi = 200;                                   // more flexion -> hands higher
    for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (f(m) > 0) hi = m; else lo = m; }
    p.sh = +((lo + hi) / 2).toFixed(1);
  };
  for (const k in poses) arms(poses[k]);
  for (const [at, pose] of extra) { const m = Object.assign({}, poses[at], pose); arms(m); pose.sh = m.sh; }
  return poses;
}

window.EXERCISE = {
  id: 'spine_stretch_forward',
  name: { tr: 'İleri Omurga Esnetme (Spine Stretch Forward)', en: 'Spine Stretch Forward', es: 'Estiramiento de columna hacia delante (spine stretch forward)' },
  category: { tr: 'Pilates · Esneme', en: 'Pilates · Stretch', es: 'Pilates · Estiramiento' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['core', 'hamstrings', 'lowerback'],
  tempo: '3-1-3',
  tempoReps: 1,
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 22, pitch: 14, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Bacaklar omuz genişliğinde, kollar paralel', en: 'Legs shoulder-width, arms parallel', es: 'Piernas al ancho de hombros, brazos paralelos' } },
  setupView: { yaw: 40, pitch: 16 },
  setupMarks: [{ type: 'span', joints: ['ankleR', 'ankleL'], label: { tr: 'Omuz genişliği', en: 'Shoulder width', es: 'Ancho de hombros' } }],
  contacts: ['pelvis', 'heelR', 'heelL'],
  props: [['mat', { at: [0.05, 0, 0], length: 1.6 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fit(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'tall',
  rep: [
    { to: 'fold', dur: 3.0, phase: 0 },
    { to: 'fold', dur: 1.0, phase: 1 },
    { to: 'tall', dur: 3.0, phase: 2 },
  ],
  setup: { tr: 'Oturma kemiklerinde dik otur, bacaklar omuz genişliğinde, ayaklar bükülü. Kollar önde, avuçlar aşağı.',
    en: 'Sit tall on your sit bones, legs shoulder-width, feet flexed. Arms forward, palms down.',
    es: 'Siéntate erguida, piernas al ancho de hombros, pies flexionados. Brazos al frente, palmas abajo.' },
  phases: [
    { name: { tr: 'Nefes ver, öne kıvrıl', en: 'Exhale, curl forward', es: 'Exhala, enróllate adelante' }, breath: 'out',
      text: { tr: 'Çeneyi indir, omur omur öne kıvrıl. Karın içe, oturma kemikleri yerde.', en: 'Nod and curl forward one vertebra at a time. Belly in, sit bones down.', es: 'Barbilla abajo, enróllate vértebra a vértebra. Abdomen adentro.' } },
    { name: { tr: 'C-kıvrımında uzan', en: 'Reach in the C-curve', es: 'Alarga en la C' }, breath: 'in', line: ['pelvis', 'waist', 'neck'],
      text: { tr: 'Bir topun üstüne eğilir gibi; eller ileri, aşağı değil.', en: 'As if curling over a ball; hands reach forward, not down.', es: 'Como sobre una pelota; manos adelante, no abajo.' } },
    { name: { tr: 'Omur omur doğrul', en: 'Stack up', es: 'Sube vértebra a vértebra' }, breath: 'out',
      text: { tr: 'Pelvisten başlayıp omurgayı üst üste diz, baş en son.', en: 'Stack the spine from the pelvis up, head last.', es: 'Apila la columna desde la pelvis, la cabeza al final.' } },
  ],
  tempoText: { tr: '3 sn kıvrıl · 1 sn uzan · 3 sn doğrul', en: '3 s curl · 1 s reach · 3 s stack', es: '3 s enróllate · 1 s alarga · 3 s sube' },
  mistakes: [
    { title: { tr: 'Pelvis geriye düşüyor', en: 'Pelvis rolls back', es: 'La pelvis cae atrás' },
      fix: { tr: 'Katlanmış havlunun üstüne otur', en: 'Sit on a folded towel', es: 'Siéntate sobre una toalla' },
      fixText: { tr: 'Oturma kemikleri ağır, pelvis dik kalır', en: 'Sit bones heavy, pelvis stays upright', es: 'Isquiones pesados, pelvis erguida' },
      at: 'fold', pose: { hip: 36, lumbar: 62, thoracic: 44 }, line: ['pelvis', 'waist'], parts: ['pelvis', 'waist'] },
    { title: { tr: 'Ellerle ayakları çekmek', en: 'Hands pull the toes', es: 'Tirar de los pies' },
      fix: { tr: 'İleri uzan, aşağı değil', en: 'Reach forward, not down', es: 'Alarga adelante, no abajo' },
      fixText: { tr: 'Omuzlar kulaktan uzak, kollar yere paralel', en: 'Shoulders away from the ears, arms parallel', es: 'Hombros lejos de las orejas, brazos paralelos' },
      at: 'fold', pose: { shrug: 0.045, _elev: -38, el: 12, curl: 0.6 }, view: { yaw: 60, pitch: 12 }, marks: ['shoulderR', 'handR'], parts: ['upper', 'neck'] },
  ],
  cues: [{ tr: 'Derin bir C gibi kıvrıl', en: 'Scoop like a deep C', es: 'Enróllate en una C profunda' },
    { tr: 'Oturma kemikleri ağır', en: 'Sit bones heavy', es: 'Isquiones pesados' },
    { tr: 'Bir topun üstünden uzan', en: 'Reach over a ball', es: 'Alarga sobre una pelota' }],
};
}
