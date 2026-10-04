/* Yin Seal. Lying face down, palms on the mat ahead of the shoulders, elbows bent -> press the arms almost straight, chest
 * lifts into a deep passive back arch while the pelvis, thighs and tops of the feet stay down -> long hold -> lower down.
 * - Two ground contacts [pelvis, toeR] in every pose (as yin_sphinx); the lift is lumbar + thoracic extension only.
 * - Hands: world targets (weight-bearing flat palms) ahead of and wider than the shoulders, the SAME targets in every pose,
 *   so the palms never slide. fitSeal() (lazy) bisects one scale on (lumbar, thoracic) until the elbows are ~6° bent.
 *   The "pinching" mistake gets its own lumbar bisection so the hands still reach the same spots.
 * - Engine limit: weight-bearing palms always point the fingers toward the head; the spec's "palms turned out" is mentioned
 *   in the text only. */
{
const MAT = 0.012;
const G = [['pelvis', MAT], ['toeR', MAT]];
const BASE = { trunk: 84, hip: -6, knee: 0, ankle: -40, flat: false, abd: 5, ground: G, handFlat: true, handSurface: 0, curl: 0.1,
  shAbd: 22, elbowPole: [-1, 0.5, 0.35], noAvoid: true };
const RAW = {
  down: { ...BASE, lumbar: -4, thoracic: -2, neck: 8, sh: 100, el: 100, protract: 0 },
  seal: { ...BASE, lumbar: -40, thoracic: -15, neck: -8, sh: 70, el: 6, protract: 0.015, shrug: -0.01 },
};
const CTX = { anchorX: ['pelvis'], anchorAt: [-0.35, 0] };

function fitSeal(poses, extra) {
  const { V, solve, expand } = FB;
  const S0 = (p) => solve(expand(Object.assign({}, p, { ik: undefined })), CTX).J;
  const S = (p) => solve(expand(p), CTX).J;
  const elb = (J) => 180 - Math.acos(V.dot(V.norm(V.sub(J.shoulderR, J.elbowR)), V.norm(V.sub(J.wristR, J.elbowR)))) * 180 / Math.PI;
  const sp = poses.seal, L0 = sp.lumbar, T0 = sp.thoracic;
  // hands: ahead of the shoulders of the nearly-final arch, 1.6x shoulder width apart
  const Jg = S0(sp);
  const H = (k) => [Jg['shoulder' + k][0] + 0.4, 0, Jg['shoulder' + k][2] * 1.6];
  const ik = { handL: { at: H('L') }, handR: { at: H('R') } };
  sp.ik = ik; poses.down.ik = ik;
  const bis = (p, f, lo, hi, want) => { for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (f(m) > want) lo = m; else hi = m; } return (lo + hi) / 2; };
  const s = bis(sp, (m) => elb(S({ ...sp, lumbar: L0 * m, thoracic: T0 * m })), 0.3, 1.8, 6);
  sp.lumbar = +(L0 * s).toFixed(2); sp.thoracic = +(T0 * s).toFixed(2);
  for (const [at, pose] of extra) {
    if (pose.fitLumbar) { const m = Object.assign({}, poses[at], pose); pose.lumbar = +bis(m, (v) => elb(S({ ...m, lumbar: v })), -10, -80, 6).toFixed(2); }
  }
  return poses;
}

window.EXERCISE = {
  id: 'yin_seal',
  name: { tr: 'Yin Fok Pozu', en: 'Yin Seal Pose', es: 'Foca yin' },
  category: { tr: 'Yin Yoga · Omurga', en: 'Yin Yoga · Spine', es: 'Yin yoga · Columna' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['lowerback', 'core', 'delts'],
  tempo: '4-10-4',
  hold: true, holdDur: 3,
  view: { yaw: 90, pitch: 8 },
  alt: { yaw: 35, pitch: 18, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Eller omuzların önünde ve geniş', en: 'Hands ahead of the shoulders and wide', es: 'Manos delante de los hombros y abiertas' } },
  setupView: { yaw: 40, pitch: 24 },
  contacts: ['pelvis', 'toeR', 'toeL', 'handR', 'handL'],
  props: [['mat', { at: [-0.25, 0.006, 0], length: 2.0, width: 0.8 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fitSeal(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'down',
  rep: [
    { to: 'seal', dur: 4.0, phase: 0 },
    { to: 'seal', dur: 1.0, phase: 1 },
    { to: 'down', dur: 3.5, phase: 2 },
  ],
  setup: { tr: 'Yüzüstü uzan. Avuçlar omuzların önünde ve biraz geniş, parmaklar hafif dışa dönük.',
    en: 'Lie face down. Palms ahead of the shoulders and a bit wide, fingers turned slightly out.',
    es: 'Boca abajo. Palmas delante de los hombros, algo abiertas, dedos un poco hacia fuera.' },
  phases: [
    { name: { tr: 'Kolları uzat', en: 'Press up', es: 'Empuja arriba' }, breath: 'in', slow: 1.0,
      text: { tr: 'Kolları yavaşça uzat, göğüs kalksın. Kalça ve uyluklar yerde.', en: 'Slowly straighten the arms and lift the chest. Hips and thighs stay down.', es: 'Estira los brazos despacio y eleva el pecho. Cadera y muslos abajo.' } },
    { name: { tr: 'Bırak ve kal', en: 'Let go and stay', es: 'Suelta y quédate' }, breath: 'easy', line: ['pelvis', 'waist', 'neck'],
      text: { tr: 'Kalça ve bacaklar gevşek, göğüs öne. Bakış önde ya da hafif aşağı.', en: 'Glutes and legs soft, chest forward. Gaze ahead or slightly down.', es: 'Glúteos y piernas sueltos, pecho adelante. Mirada al frente o algo abajo.' } },
    { name: { tr: 'Yavaşça in', en: 'Lower slowly', es: 'Baja despacio' }, breath: 'out', slow: 1.0,
      text: { tr: 'Dirsekleri bük, karna in. Başı yana çevir, dinlen.', en: 'Bend the elbows and lower to the belly. Turn the head, rest.', es: 'Flexiona los codos y baja al abdomen. Gira la cabeza, descansa.' } },
  ],
  tempoText: { tr: '4 sn kalk · 3-5 dk kal · 4 sn in', en: '4 s up · stay 3-5 min · 4 s down', es: '4 s arriba · 3-5 min · 4 s abajo' },
  mistakes: [
    { title: { tr: 'Bel sıkışıyor', en: 'Low back pinches', es: 'La lumbar se comprime' },
      text: { tr: 'Kalça kasılır, kavis sadece belde, baş geride.', en: 'Glutes clench, the arch is all in the low back, head thrown back.', es: 'Glúteos tensos, todo el arco en la lumbar, cabeza atrás.' },
      fix: { tr: 'Elleri yaklaştır, kalçayı gevşet', en: 'Bring the hands closer, relax the glutes', es: 'Acerca las manos, relaja los glúteos' },
      fixText: { tr: 'Sıkışma varsa sfenkse geç', en: 'If it pinches, come down to Sphinx', es: 'Si comprime, baja a la esfinge' },
      at: 'seal', pose: { thoracic: 0, neck: -30, fitLumbar: true }, line: ['pelvis', 'waist', 'neck'], parts: ['waist', 'pelvis'] },
    { title: { tr: 'Omuzlar kulağa kalkıyor', en: 'Shoulders shrug up', es: 'Hombros encogidos' },
      text: { tr: 'Boyun kaybolur, omuzlar sıkışır.', en: 'The neck disappears and the shoulders jam.', es: 'El cuello desaparece y los hombros se tensan.' },
      fix: { tr: 'Omuzları aşağı bırak', en: 'Draw the shoulders down', es: 'Baja los hombros' },
      fixText: { tr: 'Boyun uzun, göğüs kollar arasından öne', en: 'Long neck, chest forward between the arms', es: 'Cuello largo, pecho adelante entre los brazos' },
      at: 'seal', pose: { shrug: 0.06, protract: -0.02, neck: 4, fitLumbar: true }, view: { yaw: 30, pitch: 14 }, marks: ['shoulderL', 'shoulderR'], parts: ['upper', 'neck'] },
  ],
  cues: [{ tr: 'Kalça ve bacaklar gevşek', en: 'Relax legs and glutes', es: 'Piernas y glúteos sueltos' },
    { tr: 'Eller omuzların önünde', en: 'Hands ahead of the shoulders', es: 'Manos delante de los hombros' },
    { tr: 'Daha derine zorlama', en: 'Do not force deeper', es: 'No fuerces más' }],
};
}
