/* Face pull (cable at eye height, rope). FK arms: start arms forward at shoulder height (sh 90), end upper arms out to
 * the sides at shoulder height (shAbd 92) with the forearms turned up (shRot -90 = external rotation), hands beside the ears.
 * The cable station + rope is a prop defined in this file (FB.PROPS._ropeCable): cable from the pulley to a clip in front
 * of the hands, one rope strand from the clip into each hand. */
{
const { V } = FB;
const PUL = [1.05, 1.58, 0];
FB.PROPS._ropeCable = (sol) => {
  const hL = sol.J.handL, hR = sol.J.handR, mid = V.lerp(hL, hR, 0.5), clip = V.add(mid, V.mul(V.norm(V.sub(PUL, mid)), 0.24));
  sol.grip = { L: [0, 1, 0], R: [0, 1, 0] }; sol.gripKind = 'neutral';
  const out = [
    { t: 'box', c: [PUL[0] + 0.16, 1.15, 0], s: [0.2, 2.3, 0.48], m: 'frameDark', round: 0.01 },
    { t: 'sph', c: PUL, r: 0.045, m: 'iron' },
    { t: 'tube', pts: [PUL, clip], r: 0.004, m: 'chrome' },
    { t: 'sph', c: clip, r: 0.02, m: 'iron' },
  ];
  for (const h of [hL, hR]) {
    out.push({ t: 'tube', pts: [clip, V.lerp(clip, h, 0.5), V.add(h, [0, 0.05, 0])], r: 0.012, m: 'rope' });
    out.push({ t: 'cyl', a: V.add(h, [0, -0.06, 0]), b: V.add(h, [0, 0.05, 0]), r: 0.014, m: 'rope' });
    out.push({ t: 'sph', c: V.add(h, [0, -0.065, 0]), r: 0.022, m: 'rubber' });
  }
  return out;
};
const ST = { trunk: -5, hip: 5, knee: 10, abd: 6, hrot: 6, neck: 0, bend: [0, 1, 0] };

window.EXERCISE = {
  id: 'face_pull',
  name: { tr: 'Face Pull', en: 'Face Pull', es: 'Face pull (jalón a la cara)' },
  category: { tr: 'Omuz · Sırt', en: 'Shoulders · Back', es: 'Hombros · Espalda' },
  equipmentLabel: { tr: 'Kablo, halat', en: 'Cable, rope', es: 'Polea, cuerda' },
  muscles: ['delts', 'upperback'],
  tempo: '1-1-2',
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 35, pitch: 8, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Dirsekler yanda ve yüksek, eller kulakların yanında', en: 'Elbows high and wide, hands beside the ears', es: 'Codos altos y abiertos, manos junto a las orejas' } },
  setupView: { yaw: 45, pitch: 10 },
  setupMarks: [{ type: 'span', joints: ['ankleR', 'ankleL'], label: { tr: 'Omuz genişliği', en: 'Shoulder width', es: 'Ancho de hombros' } }],
  props: [['_ropeCable']],
  ctx: { anchorX: ['ankleL', 'ankleR'], plant: ['ankleL', 'ankleR'] },
  poses: {
    // tall, slight lean back, arms long at shoulder height, thumbs toward you
    reach: { ...ST, sh: 90, shAbd: -12, el: 15, shRot: 0, protract: 0.02 },
    // elbows high and wide, forearms vertical, hands beside the ears, blades squeezed
    pull: { ...ST, trunk: -7, sh: 30, shAbd: 75, el: 95, shRot: 12, protract: -0.03 },
  },
  rest: 'reach',
  rep: [
    { to: 'pull', dur: 1.3, phase: 0 },
    { to: 'pull', dur: 1.0, phase: 1 },
    { to: 'reach', dur: 2.0, phase: 2 },
  ],
  setup: { tr: 'Makarayı göz hizasına ayarla. Halatı başparmaklar sana bakacak tut, bir adım geri çekil.',
    en: 'Set the pulley at eye height. Hold the rope thumbs toward you and step back.',
    es: 'Polea a la altura de los ojos. Sujeta la cuerda con los pulgares hacia ti y da un paso atrás.' },
  phases: [
    { name: { tr: 'Yüze çek', en: 'Pull to the face', es: 'Tira a la cara' }, breath: 'out',
      text: { tr: 'Dirsekler yüksek ve yanda. Halatı ayırarak elleri kulakların yanına getir.', en: 'Elbows high and wide. Split the rope and bring the hands beside your ears.', es: 'Codos altos y abiertos. Separa la cuerda y lleva las manos junto a las orejas.' } },
    { name: { tr: 'Tut', en: 'Hold', es: 'Mantén' }, breath: 'hold', line: ['handL', 'elbowL', 'shoulderL', 'shoulderR', 'elbowR', 'handR'],
      text: { tr: 'Önkollar dik, kürekler sıkışık. 1-2 saniye tut.', en: 'Forearms vertical, blades squeezed. Hold 1–2 seconds.', es: 'Antebrazos verticales, escápulas juntas. Mantén 1–2 segundos.' } },
    { name: { tr: 'Kontrollü uzat', en: 'Return slowly', es: 'Vuelve despacio' }, breath: 'in',
      text: { tr: 'İki saniyede kollar öne uzansın, gerginlik kalsın.', en: 'Two seconds back to long arms, keep the tension.', es: 'Dos segundos hasta estirar, mantén la tensión.' } },
  ],
  tempoText: { tr: '1 sn çek · 1 sn tut · 2 sn uzat', en: '1 s pull · 1 s hold · 2 s return', es: '1 s tira · 1 s mantén · 2 s vuelve' },
  mistakes: [
    { title: { tr: 'Geriye yaslanmak', en: 'Leaning back', es: 'Echarse atrás' },
      fix: { tr: 'Dik dur', en: 'Stand tall', es: 'Erguida' },
      fixText: { tr: 'Ağırlığı azalt; kalça öne kaymaz, sadece kollar çalışır', en: 'Go lighter; hips stay put, only the arms move', es: 'Menos peso; la cadera no se adelanta, solo trabajan los brazos' },
      at: 'pull', pose: { trunk: -20, hip: -8, lumbar: -5 }, line: ['ankleR', 'pelvis', 'neck'], goodLine: ['pelvis', 'neck'], parts: ['waist', 'chest', 'pelvis'] },
    { title: { tr: 'Dirsekler düşüyor', en: 'Elbows drop', es: 'Codos caídos' },
      fix: { tr: 'Dirsekler omuz hizasında', en: 'Elbows at shoulder height', es: 'Codos a la altura del hombro' },
      fixText: { tr: 'Dirsekler ellerden aşağı inmez; yüze çek, göğse değil', en: 'Elbows never below the hands; pull to the face, not the chest', es: 'Codos nunca por debajo de las manos; a la cara, no al pecho' },
      at: 'pull', pose: { sh: 40, shAbd: 24, el: 118, shRot: 0 }, view: { yaw: 40, pitch: 8 }, marks: ['elbowL', 'elbowR'], parts: ['upper'] },
  ],
  cues: [{ tr: 'Dirsekler yüksek ve geniş', en: 'Elbows high and wide', es: 'Codos altos y abiertos' },
    { tr: 'Gözlere çek', en: 'Pull to your eyes', es: 'Tira hacia los ojos' },
    { tr: 'Dik dur, yaslanma', en: 'Stand tall, no leaning', es: 'Erguida, sin echarte atrás' }],
};
}
