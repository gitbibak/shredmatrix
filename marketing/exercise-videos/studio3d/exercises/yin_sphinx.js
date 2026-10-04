/* Yin Sphinx. Lying face down, forearms on the mat -> slide the elbows under the shoulders and lift the chest (passive low-back
 * arch, pelvis and thighs stay down) -> long hold -> lower down.
 * - Two ground contacts [pelvis, toeR] in every pose (same names, as prone_w_isometric); the chest is lifted by lumbar +
 *   thoracic extension only, so the pelvis and legs never move.
 * - fitSphinx() (lazy, after the rig sets FB.BODY) bisects one scale on (lumbar, thoracic) so the shoulders sit one upper-arm
 *   length above the elbow clearance: upper arms near vertical, forearms flat. Hands are world targets (non-weight-bearing
 *   palm, handFlat false) one forearm length in front of the elbows, parallel, in every pose so `ik` interpolates. */
{
const MAT = 0.012;
const G = [['pelvis', MAT], ['toeR', MAT]];
const BASE = { trunk: 84, hip: -6, knee: 0, ankle: -40, flat: false, abd: 4, ground: G, handFlat: false, palm: 'down', curl: 0.2,
  elbowPole: [-0.3, -1, 0.15], noAvoid: true };
const RAW = {
  down: { ...BASE, lumbar: -4, thoracic: -2, neck: 8, sh: 120, shAbd: 14, el: 100 },
  sphinx: { ...BASE, lumbar: -25, thoracic: -10, neck: -6, sh: 80, shAbd: 8, el: 90, protract: 0.01, shrug: -0.01 },
};
const CTX = { anchorX: ['pelvis'], anchorAt: [-0.3, 0] };

function fitSphinx(poses, extra) {
  const { solve, expand, BODY: B } = FB;
  const S = (p) => solve(expand(Object.assign({}, p, { ik: undefined })), CTX).J;
  const sp = poses.sphinx, L0 = sp.lumbar, T0 = sp.thoracic;
  const yWant = MAT + 0.055 + B.upper;              // upper arm near vertical, elbow resting on the mat
  let lo = 0.2, hi = 2.5; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (S({ ...sp, lumbar: L0 * m, thoracic: T0 * m }).shoulderR[1] < yWant) lo = m; else hi = m; }
  const s = (lo + hi) / 2; sp.lumbar = +(L0 * s).toFixed(2); sp.thoracic = +(T0 * s).toFixed(2);
  const forearm = B.fore + B.hand * 0.55;
  const hands = (p, elbowFwd) => { const J = S(p), t = (k) => { const sh = J['shoulder' + k]; return [sh[0] + elbowFwd + forearm, MAT + 0.028, sh[2] * 0.95]; };
    p.ik = { handL: { at: t('L') }, handR: { at: t('R') } }; };
  hands(sp, 0.06);
  hands(poses.down, 0.2);
  for (const [at, pose] of extra) if (pose.keepHands) pose.ik = poses[at].ik;
  return poses;
}

window.EXERCISE = {
  id: 'yin_sphinx',
  name: { tr: 'Yin Sfenks Pozu', en: 'Yin Sphinx Pose', es: 'Esfinge yin' },
  category: { tr: 'Yin Yoga · Omurga', en: 'Yin Yoga · Spine', es: 'Yin yoga · Columna' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['lowerback', 'core'],
  tempo: '3-10-3',
  hold: true, holdDur: 3,
  view: { yaw: 90, pitch: 8 },
  alt: { yaw: 25, pitch: 16, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Dirsekler omuzların altında, ön kollar paralel', en: 'Elbows under the shoulders, forearms parallel', es: 'Codos bajo los hombros, antebrazos paralelos' } },
  setupView: { yaw: 40, pitch: 22 },
  contacts: ['pelvis', 'toeR', 'toeL', 'elbowR', 'elbowL'],
  props: [['mat', { at: [-0.25, 0.006, 0], length: 2.0, width: 0.7 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fitSphinx(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'down',
  rep: [
    { to: 'sphinx', dur: 3.0, phase: 0 },
    { to: 'sphinx', dur: 1.0, phase: 1 },
    { to: 'down', dur: 3.0, phase: 2 },
  ],
  setup: { tr: 'Yüzüstü uzan, bacaklar kalça genişliğinde. Ön kollar matta, ayak üstleri yerde.',
    en: 'Lie face down, legs hip-width. Forearms on the mat, tops of the feet down.',
    es: 'Boca abajo, piernas al ancho de cadera. Antebrazos en la esterilla, empeines abajo.' },
  phases: [
    { name: { tr: 'Göğsü kaldır', en: 'Lift the chest', es: 'Eleva el pecho' }, breath: 'in', slow: 1.0,
      text: { tr: 'Dirsekleri omuzların altına çek, göğsü yavaşça kaldır. Kalça yerde.', en: 'Bring the elbows under the shoulders and slowly lift the chest. Hips stay down.', es: 'Codos bajo los hombros, eleva el pecho despacio. Cadera abajo.' } },
    { name: { tr: 'Gevşe ve kal', en: 'Relax and stay', es: 'Relájate y quédate' }, breath: 'easy', line: ['pelvis', 'waist', 'neck'],
      text: { tr: 'Kalça ve bacaklar gevşek, göğüs öne. Bel nazikçe uzar.', en: 'Glutes and legs soft, chest forward. The low back gently lengthens.', es: 'Glúteos y piernas sueltos, pecho adelante. La lumbar se alarga suave.' } },
    { name: { tr: 'Yavaşça in', en: 'Lower slowly', es: 'Baja despacio' }, breath: 'out', slow: 1.0,
      text: { tr: 'Göğsü indir, başı yana çevir ve dinlen.', en: 'Lower the chest, turn the head to one side and rest.', es: 'Baja el pecho, gira la cabeza a un lado y descansa.' } },
  ],
  tempoText: { tr: '3 sn kalk · 3-5 dk kal · 3 sn in', en: '3 s up · stay 3-5 min · 3 s down', es: '3 s arriba · 3-5 min · 3 s abajo' },
  mistakes: [
    { title: { tr: 'Omuzlar kulağa çöküyor', en: 'Shoulders hunch up', es: 'Hombros encogidos' },
      text: { tr: 'Göğüs omuzların arasına düşer, boyun kısalır.', en: 'The chest sinks between the shoulders and the neck shortens.', es: 'El pecho se hunde entre los hombros y el cuello se acorta.' },
      fix: { tr: 'Ön kollarla yeri it', en: 'Press the forearms down', es: 'Presiona con los antebrazos' },
      fixText: { tr: 'Omuzlar kulaklardan uzak, göğüs öne', en: 'Shoulders away from the ears, chest forward', es: 'Hombros lejos de las orejas, pecho adelante' },
      at: 'sphinx', pose: { shrug: 0.055, protract: -0.025, neck: 4, keepHands: true }, view: { yaw: 30, pitch: 14 }, marks: ['shoulderL', 'shoulderR'], parts: ['upper', 'neck'] },
    { title: { tr: 'Boyun geriye bükülüyor', en: 'Neck cranks back', es: 'El cuello se dobla atrás' },
      text: { tr: 'Baş geriye atılır, ense sıkışır.', en: 'The head tips back and the back of the neck pinches.', es: 'La cabeza cae atrás y la nuca se comprime.' },
      fix: { tr: 'Boyun uzun, bakış önde', en: 'Long neck, gaze ahead', es: 'Cuello largo, mirada al frente' },
      fixText: { tr: 'Çene hafif içeride, ense uzun', en: 'Chin slightly in, back of the neck long', es: 'Barbilla un poco adentro, nuca larga' },
      at: 'sphinx', pose: { neck: -38, keepHands: true }, marks: ['head'], parts: ['neck'] },
  ],
  cues: [{ tr: 'Kalçayı gevşet', en: 'Relax the glutes', es: 'Relaja los glúteos' },
    { tr: 'Dirsekler omuzların altında', en: 'Elbows under the shoulders', es: 'Codos bajo los hombros' },
    { tr: 'Nazikçe uzat, zorlama', en: 'Gentle length, no forcing', es: 'Alarga suave, sin forzar' }],
};
}
