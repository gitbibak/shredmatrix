/* Neutral Pelvis Breathing (Pilates mat, supine). Same supine base as chest_lift (pelvis + waist contacts, heels fitted to
 * the mat, ankles planted). Neutral pelvis = lumbar slightly arched (-4) with the waist contact a little higher than in an
 * imprint, so a small space stays under the lower back.
 * - Hands form the triangle on the lower belly: hold targets in the thorax frame, elbows resting out to the sides.
 * - The rig has no rib-cage expansion, so the breath is shown with a small thoracic change (chest rises ~1 cm, the
 *   pelvis does not move) plus lateral arrows on the ribs (inhale) and a ring on the still pelvis (exhale).
 *   Main view is a raised side view (yaw 70) so the lateral arrows read; the lumbar curve stays visible. */
{
const MAT = 0.008;
const G = (w = 0.004) => [['pelvis', MAT], ['waist', MAT + w]];
const HANDS = { holdL: [0.165, -0.33, 0.05], holdR: [0.165, -0.33, 0.05], elbowPole: [-1, 0, 0.9], handFlat: false, palm: 'down', curl: 0.15 };
const BASE = { trunk: -90, abd: 3, hrot: 2, flat: true, hip: 60, knee: 100, lumbar: -4, neck: 16, ground: G(), ...HANDS };
const RAW = {
  out: { ...BASE, thoracic: 3 },
  in: { ...BASE, thoracic: -1.5, lumbar: -4.5 },
};
const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0], plant: ['ankleL', 'ankleR'] };

function fit(poses) {
  const { solve, expand } = FB;
  const S = (p) => solve(expand(p), { anchorX: CTX.anchorX, anchorAt: CTX.anchorAt }).J;
  let lo = 70, hi = 140;
  for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (S({ ...poses.out, knee: m }).heelR[1] > MAT + 0.002) lo = m; else hi = m; }
  const k = +((lo + hi) / 2).toFixed(2);
  for (const n in poses) poses[n].knee = k;
  return poses;
}

window.EXERCISE = {
  id: 'neutral_pelvis_breathing',
  name: { tr: 'Nötr Pelvis ile Nefes', en: 'Neutral Pelvis Breathing', es: 'Respiración con pelvis neutra' },
  category: { tr: 'Pilates · Nefes', en: 'Pilates · Breathing', es: 'Pilates · Respiración' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['core', 'obliques'],
  tempo: '3-4',
  view: { yaw: 70, pitch: 20, zoom: 1.08 },
  alt: { yaw: 10, pitch: 26, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Kaburgalar yana açılır, pelvis düz kalır', en: 'Ribs widen sideways, pelvis stays level', es: 'Costillas se abren, pelvis nivelada' } },
  setupView: { yaw: 40, pitch: 26 },
  setupMarks: [{ type: 'aline', joints: ['hipL', 'hipR'] }],
  contacts: ['pelvis', 'waist', 'head', 'heelR', 'ballR'],
  props: [['mat', { at: [0.05, 0.006, 0], length: 1.8 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fit(RAW)); },
  rest: 'out',
  rep: [
    { to: 'in', dur: 3.0, phase: 0 },
    { to: 'out', dur: 4.0, phase: 1 },
  ],
  setup: { tr: 'Sırtüstü yat, dizler bükülü. Elleri alt karına üçgen yap: avuç kökleri kalça kemiklerinde, parmaklar kasıkta.',
    en: 'Lie on your back, knees bent. Hands make a triangle: heels on the hip bones, fingertips on the pubic bone.',
    es: 'Boca arriba, rodillas flexionadas. Manos en triángulo: base en las crestas, dedos en el pubis.' },
  phases: [
    { name: { tr: 'Burundan nefes al', en: 'Inhale through the nose', es: 'Inhala por la nariz' }, breath: 'in',
      marks: [{ type: 'arrow', from: 'chest', dir: [0, 0, 0.42], color: '#00b0ff' }, { type: 'arrow', from: 'chest', dir: [0, 0, -0.42], color: '#00b0ff' }],
      text: { tr: 'Nefesi kaburgaların yanına ve arkasına gönder. Karın yumuşak, pelvis sabit.', en: 'Breathe into the sides and back of the ribs. Belly soft, pelvis still.', es: 'Respira hacia los lados y la espalda de las costillas. Pelvis quieta.' } },
    { name: { tr: 'Dudaklardan nefes ver', en: 'Exhale through the lips', es: 'Exhala por los labios' }, breath: 'out',
      marks: [{ type: 'mark', joint: 'pelvis', color: '#00e676' }],
      text: { tr: 'Kaburgalar aşağı, alt karın içe. Pelvisi kıvırma, düz kalsın.', en: 'Ribs knit down, lower belly draws in. Do not tuck the pelvis.', es: 'Costillas abajo, bajo vientre adentro. No metas la pelvis.' } },
  ],
  tempoText: { tr: '3 sn nefes al · 4 sn nefes ver', en: '3 s inhale · 4 s exhale', es: '3 s inhala · 4 s exhala' },
  mistakes: [
    { title: { tr: 'Pelvis nefesle kıvrılıyor', en: 'Pelvis tucks with the breath', es: 'La pelvis se mete al exhalar' },
      fix: { tr: 'Pelvis bir kase su gibi', en: 'Pelvis like a bowl of water', es: 'Pelvis como un cuenco de agua' },
      fixText: { tr: 'Elinizdeki üçgen hep düz kalsın', en: 'Keep the hand triangle level', es: 'Mantén el triángulo de las manos plano' },
      at: 'out', pose: { lumbar: 12, thoracic: 6, ground: [['pelvis', MAT + 0.022], ['waist', MAT - 0.01]] }, marks: ['pelvis'], line: ['hipR', 'waist'], parts: ['pelvis', 'waist'] },
    { title: { tr: 'Göğüs ve omuzlar kalkıyor', en: 'Chest and shoulders heave', es: 'Pecho y hombros se elevan' },
      fix: { tr: 'Kaburgaların yanına nefes', en: 'Breathe into the side ribs', es: 'Respira hacia los lados' },
      fixText: { tr: 'Omuzlar yumuşak, çene gevşek', en: 'Soft shoulders, relaxed jaw', es: 'Hombros suaves, mandíbula suelta' },
      at: 'in', pose: { thoracic: -9, shrug: 0.04, neck: 8 }, marks: ['shoulderR', 'chest'], parts: ['chest', 'neck'] },
  ],
  cues: [{ tr: 'Pelvis kase gibi düz', en: 'Pelvis level like a bowl', es: 'Pelvis nivelada como un cuenco' },
    { tr: 'Kaburgaların yanına nefes', en: 'Breathe into the side ribs', es: 'Respira a los lados' },
    { tr: 'Nefes verirken karın içe', en: 'Exhale, belly draws in', es: 'Exhala, abdomen adentro' }],
};
}
