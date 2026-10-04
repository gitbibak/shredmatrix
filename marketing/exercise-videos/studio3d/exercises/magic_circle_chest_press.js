/* Magic Circle Chest Press (seated). Front view. Seat copied from the approved seated_meditation.js (cross-legged on a folded
 * blanket, one ground contact [pelvis], feet = world IK targets).
 * Hands: body-relative targets (holdL/holdR) at sternum height ~40 cm in front of the chest, elbows wide at shoulder height (pole out,
 * upper arm ~horizontal, elbow ~96°), palms facing in. Ring: custom prop (_circleChest) = torus between the two palms (pads on the palms), in the frontal
 * plane, so its diameter follows the hand gap: rest 34 cm between the palms (light contact), press 4 cm narrower (spec 3-5).
 * ENGINE LIMIT: free hands always continue the forearm (no wrist flexion/extension), so the spec's 'wrists collapse' mistake
 * cannot be shown; replaced by the spec cue it protects ('tall spine'): slouching while pressing. */
{
const { V } = FB;
const MAT = 0.012, CH = 0.1;
const G = (d = 0) => [['pelvis', MAT + CH + d]];
FB.PROPS._seatCushionMCC = (sol) => {
  const h = Math.min(CH, sol.J.pelvis[1] - 0.1 - MAT) * (CH + 0.045) / CH;
  if (h < 0.006) return [];
  return FB.PROPS.blanket(null, { at: [sol.J.pelvis[0] + 0.04, MAT + h / 2 - 0.03, 0], size: [0.34, h, 0.42] });
};
FB.PROPS._circleChest = (sol) => {
  const a = sol.J.handR, b = sol.J.handL, ax = V.norm(V.sub(b, a));
  const pa = V.add(a, V.mul(ax, 0.028)), pb = V.sub(b, V.mul(ax, 0.028));
  return [{ t: 'torus', a: V.add(pa, V.mul(ax, 0.012)), b: V.sub(pb, V.mul(ax, 0.012)), r: 0.012, m: 'ring' },
    { t: 'cyl', a: pa, b: V.add(pa, V.mul(ax, 0.02)), r: 0.042, m: 'pad' }, { t: 'cyl', a: V.sub(pb, V.mul(ax, 0.02)), b: pb, r: 0.042, m: 'pad' }];
};
const LEGS = { hip: 62, hrot: 45, abd: 38, knee: 128, ankle: -12, flat: false, kneePole: [0.4, 0.5, 1] };
const H = (out) => ({ holdL: [0.40, 0.03, out], holdR: [0.40, 0.03, out] });
const BASE = { ...LEGS, trunk: 2, lumbar: -4, thoracic: -3, neck: 4, ground: G(), handFlat: false, palm: 'in', curl: 0.25,
  elbowPole: [-0.4, 0.1, 1], shrug: -0.005, protract: 0 };
const RAW = {
  rest: { ...BASE, ...H(0.17) },
  press: { ...BASE, ...H(0.15), protract: 0.012 },
};
const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };

function fitSeat(poses, mistakes) {
  const foot = (s) => {
    const sg = s === 'R' ? 1 : -1, x = V.norm([0.35, 0, -sg]), y = V.norm(V.sub([0, 1, 0], V.mul(x, V.dot([0, 1, 0], x)))), z = V.cross(x, y);
    return { at: [s === 'R' ? 0.3 : 0.17, MAT + 0.06, -sg * 0.12], foot: { 0: x, 1: y, 2: z } };
  };
  const ik = { ankleR: foot('R'), ankleL: foot('L') };
  for (const k in poses) poses[k].ik = ik;
  for (const m of mistakes) m.pose.ik = ik;
  return poses;
}

window.EXERCISE = {
  id: 'magic_circle_chest_press',
  name: { tr: 'Magic Circle ile Göğüs Presi', en: 'Magic Circle Chest Press', es: 'Press de pecho con magic circle' },
  category: { tr: 'Pilates · Göğüs', en: 'Pilates · Chest', es: 'Pilates · Pecho' },
  equipmentLabel: { tr: 'Pilates çemberi · Minder', en: 'Pilates ring · Cushion', es: 'Aro de pilates · Cojín' },
  muscles: ['chest', 'delts', 'triceps', 'core'],
  tempo: '1.5-1.5',
  view: { yaw: 10, pitch: 6 },
  alt: { yaw: 90, pitch: 6, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
    text: { tr: 'Omurga dik, çember göğüs hizasında', en: 'Tall spine, ring at chest height', es: 'Columna erguida, aro a la altura del pecho' } },
  setupView: { yaw: 40, pitch: 12 },
  setupMarks: [{ type: 'aline', joints: ['elbowL', 'handL', 'handR', 'elbowR'] }],
  contacts: ['pelvis', 'ankleR', 'ankleL'],
  props: [['mat', { at: [0.1, 0, 0], length: 1.2, width: 0.9 }], ['_seatCushionMCC'], ['_circleChest']],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fitSeat(RAW, this.mistakes)); },
  rest: 'rest',
  rep: [
    { to: 'press', dur: 1.5, phase: 0 },
    { to: 'rest', dur: 1.5, phase: 1 },
  ],
  setup: { tr: 'Mindere bağdaş kurarak dik otur. Çemberi göğüs hizasında avuçlar arasında tut, dirsekler yana açık.',
    en: 'Sit tall cross-legged on a cushion. Hold the ring between the palms at chest height, elbows wide.',
    es: 'Siéntate erguida con las piernas cruzadas. Aro entre las palmas a la altura del pecho, codos abiertos.' },
  phases: [
    { name: { tr: 'Sık', en: 'Press', es: 'Aprieta' }, breath: 'out', slow: 1.5, marks: ['handL', 'handR'],
      text: { tr: 'Nefes ver, avuçlarla çemberi 3-5 cm sık. Omuzlar aşağıda, kaburgalar içeride.', en: 'Exhale, press the ring 3-5 cm with the palms. Shoulders down, ribs knit.', es: 'Exhala, aprieta el aro 3-5 cm. Hombros abajo, costillas cerradas.' } },
    { name: { tr: 'Yavaşça bırak', en: 'Release slowly', es: 'Suelta despacio' }, breath: 'in', slow: 1.5, line: ['pelvis', 'neck', 'head'],
      text: { tr: 'Nefes al, çemberi temas kaybetmeden başa bırak. Omurga dik.', en: 'Inhale, let the ring open without losing contact. Spine tall.', es: 'Inhala, deja abrir el aro sin perder contacto. Columna erguida.' } },
  ],
  tempoText: { tr: '1,5 sn sık · 1,5 sn bırak · 10-15 tekrar', en: '1.5 s press · 1.5 s release · 10-15 reps', es: '1,5 s aprieta · 1,5 s suelta · 10-15 rep.' },
  mistakes: [
    { title: { tr: 'Omuzlar kalkıyor', en: 'Shoulders shrug', es: 'Los hombros suben' },
      text: { tr: 'Sıkarken omuzlar kulaklara çıkar, boyun gerilir.', en: 'The shoulders rise toward the ears as you press.', es: 'Los hombros suben al apretar.' },
      fix: { tr: 'Boynu gevşet, omuzları indir', en: 'Relax the neck, shoulders down', es: 'Relaja el cuello, hombros abajo' },
      fixText: { tr: 'Sıkış göğüsten gelir, omuzdan değil', en: 'Squeeze from the chest, not the shoulders', es: 'Aprieta desde el pecho, no los hombros' },
      at: 'press', pose: { shrug: 0.045, neck: 0 }, marks: ['shoulderL', 'shoulderR'], parts: ['upper', 'neck'] },
    { title: { tr: 'Sırt çöküyor', en: 'Slouching', es: 'Espalda encorvada' },
      text: { tr: 'Sıkarken sırt yuvarlanır, göğüs içe kapanır.', en: 'The back rounds and the chest caves in while pressing.', es: 'La espalda se redondea y el pecho se cierra.' },
      fix: { tr: 'Dik otur, göğüs açık', en: 'Sit tall, chest open', es: 'Siéntate erguida, pecho abierto' },
      fixText: { tr: 'Başın tepesi yukarı uzar', en: 'Crown of the head reaches up', es: 'La coronilla crece hacia arriba' },
      at: 'press', pose: { trunk: 5, lumbar: 10, thoracic: 15, neck: -10, protract: 0.035 }, view: { yaw: 90, pitch: 6 }, line: ['pelvis', 'waist', 'neck'], parts: ['waist', 'chest'] },
  ],
  cues: [{ tr: 'Göğüsten sık, omuzdan değil', en: 'Squeeze from the chest, not the shoulders', es: 'Aprieta desde el pecho' },
    { tr: 'Omuzlar aşağıda', en: 'Keep the shoulders down', es: 'Hombros abajo' },
    { tr: 'Dik omurga', en: 'Tall spine', es: 'Columna erguida' }],
};
}
