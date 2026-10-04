/* Camel Pose (Ustrasana). Kneel on a folded blanket, thighs vertical, hands on the sacrum -> lift the chest, press the hips
 * forward, arch back and take the heels -> hold, head gently back -> hands back to the sacrum, rise with the core.
 * - Two ground contacts [kneeR, ankleR] in every pose (shins flat, tops of the feet down on the blanket, as child_pose):
 *   the legs never move and the torso angle comes from `hip` (+ the spine).
 * - fitCamel() (lazy, after the rig sets FB.BODY) bisects one scale on (hip extension, lumbar, thoracic) so the shoulders come
 *   within straight-arm reach of the heels; hands are world targets on the heels (flat palms, fingers pointing back) and on
 *   the sacrum in the kneeling pose, so `ik` interpolates.
 * - Thighs stay vertical (hips over the knees) because the knee angle is fixed at 90 by the contacts; the "hips shift back"
 *   mistake opens the knee so the thighs lean back. */
{
const MAT = 0.012, BLK = 0.03;
const G = (k = 0) => [['kneeR', MAT + BLK], ['ankleR', MAT + BLK - 0.03]];
const BASE = { knee: 90, ankle: -62, flat: false, abd: 4, hrot: 0, ground: G(), curl: 0.2, noAvoid: true };
const RAW = {
  kneel: { ...BASE, hip: 0, lumbar: -4, thoracic: -4, neck: 2, sh: -40, shAbd: 20, el: 90, handFlat: false, palm: [-1, 0, 0.2], elbowPole: [-1, -0.2, 0.6] },
  camel: { ...BASE, hip: -18, lumbar: -35, thoracic: -35, neck: -28, sh: -50, shAbd: 18, el: 2, handFlat: false, palm: [-0.6, -0.8, 0.1], curl: 0.45, elbowPole: [-1, -0.2, 0.6] },
};
const CTX = { anchorX: ['kneeL', 'kneeR'], anchorAt: [0.2, 0] };

function fitCamel(poses, extra) {
  const { V, solve, expand, BODY: B } = FB;
  const S = (p) => solve(expand(Object.assign({}, p, { ik: undefined })), CTX).J;
  const heel = (J, s) => [J['heel' + s][0] + 0.01, J['heel' + s][1] + 0.005, J['heel' + s][2] + (s === 'R' ? 1 : -1) * 0.02];
  const reach = B.upper + B.fore + B.hand * 0.55 - 0.002;
  const fit = (p, keys) => {
    const P0 = {}; keys.forEach((k) => { P0[k] = p[k]; });
    const f = (m) => { const q = { ...p }; keys.forEach((k) => { q[k] = P0[k] * m; }); const J = S(q); return V.len(V.sub(heel(J, 'R'), J.shoulderR)) - reach; };
    let lo = 0.2, hi = 2.2; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (f(m) > 0) lo = m; else hi = m; }
    const m = (lo + hi) / 2; keys.forEach((k) => { p[k] = +(P0[k] * m).toFixed(2); });
    const J = S(p); p.ik = { handL: { at: heel(J, 'L') }, handR: { at: heel(J, 'R') } };
  };
  fit(poses.camel, ['hip', 'lumbar', 'thoracic']);
  const J0 = S(poses.kneel), sac = (s) => V.add(J0.pelvis, [-0.13, 0.04, (s === 'R' ? 1 : -1) * 0.08]);
  poses.kneel.ik = { handL: { at: sac('L') }, handR: { at: sac('R') } };
  for (const [at, pose] of extra) if (pose.refit) { const m = Object.assign({}, poses[at], pose); fit(m, pose.refit); pose.refit.forEach((k) => { pose[k] = m[k]; }); pose.ik = m.ik; }
  return poses;
}

window.EXERCISE = {
  id: 'camel_pose',
  name: { tr: 'Deve Pozu (Ustrasana)', en: 'Camel Pose (Ustrasana)', es: 'Postura del camello (Ustrasana)' },
  category: { tr: 'Yoga · Geriye eğilme', en: 'Yoga · Backbend', es: 'Yoga · Extensión' },
  equipmentLabel: { tr: 'Mat, battaniye', en: 'Mat, blanket', es: 'Esterilla, manta' },
  muscles: ['quads', 'core', 'chest', 'lowerback'],
  tempo: '4-6-4',
  hold: true, holdDur: 3,
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 35, pitch: 12, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Eller topuklarda, kalça dizlerin üstünde', en: 'Hands on the heels, hips over the knees', es: 'Manos en los talones, cadera sobre las rodillas' } },
  setupView: { yaw: 40, pitch: 14 },
  setupMarks: [{ type: 'aline', joints: ['kneeR', 'hipR'] }],
  contacts: ['kneeR', 'kneeL', 'ankleR', 'ankleL'],
  props: [['mat', { at: [0, 0, 0], length: 1.6 }], ['blanket', { at: [0.0, MAT + BLK / 2 - 0.03, 0], size: [0.62, BLK, 0.5] }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fitCamel(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'kneel',
  rep: [
    { to: 'camel', dur: 4.0, phase: 0 },
    { to: 'camel', dur: 1.0, phase: 1 },
    { to: 'kneel', dur: 4.0, phase: 2 },
  ],
  setup: { tr: 'Battaniyede diz çök, dizler kalça genişliğinde, uyluklar dik. Eller sakrumda.',
    en: 'Kneel on a blanket, knees hip-width, thighs vertical. Hands on the sacrum.',
    es: 'De rodillas sobre una manta, rodillas al ancho de cadera, muslos verticales. Manos en el sacro.' },
  phases: [
    { name: { tr: 'Göğsü kaldır, geriye uzan', en: 'Lift and reach back', es: 'Eleva y ve atrás' }, breath: 'in', slow: 1.0,
      text: { tr: 'Göğsü kaldır, kalçayı öne it. Geriye eğil, elleri topuklara götür.', en: 'Lift the chest, press the hips forward. Arch back and take the heels.', es: 'Eleva el pecho, cadera adelante. Arquéate y toma los talones.' } },
    { name: { tr: 'Pozda kal', en: 'Hold', es: 'Mantén' }, breath: 'easy', line: ['kneeR', 'hipR'],
      text: { tr: 'Kalça dizlerin üstünde, kollar düz, göğüs yukarı. 3-5 nefes.', en: 'Hips over the knees, arms straight, chest high. 3-5 breaths.', es: 'Cadera sobre las rodillas, brazos rectos, pecho alto. 3-5 respiraciones.' } },
    { name: { tr: 'Karınla doğrul', en: 'Rise with the core', es: 'Sube con el core' }, breath: 'in', slow: 1.0,
      text: { tr: 'Elleri sakruma al, karnı sıkıp gövdeyi kaldır. Çocuk pozunda dinlen.', en: 'Hands to the sacrum, brace and lift up. Rest in Child’s Pose.', es: 'Manos al sacro, activa el core y sube. Descansa en postura del niño.' } },
  ],
  tempoText: { tr: '4 sn gir · 3-5 nefes kal · 4 sn çık', en: '4 s in · 3-5 breaths · 4 s out', es: '4 s entrar · 3-5 respiraciones · 4 s salir' },
  mistakes: [
    { title: { tr: 'Kalça geriye kaçıyor', en: 'Hips shift back', es: 'La cadera se va atrás' },
      text: { tr: 'Kalça dizlerin arkasına düşer, bel çöker.', en: 'The hips drop behind the knees and the low back collapses.', es: 'La cadera cae tras las rodillas y la lumbar se hunde.' },
      fix: { tr: 'Kalçayı dizlerin üstüne it', en: 'Drive the hips over the knees', es: 'Lleva la cadera sobre las rodillas' },
      fixText: { tr: 'Uyluklar dik, esneme göğüsten', en: 'Thighs vertical, the bend comes from the chest', es: 'Muslos verticales, la extensión desde el pecho' },
      at: 'camel', pose: { knee: 122, hip: 16, lumbar: -36, thoracic: -10, refit: ['lumbar', 'thoracic'] }, line: ['kneeR', 'hipR'], parts: ['thigh', 'waist'] },
    { title: { tr: 'Baş geriye düşüyor', en: 'Head drops back', es: 'La cabeza cae atrás' },
      text: { tr: 'Baş ağırca sarkar, boyun ezilir.', en: 'The head hangs heavily and the neck crunches.', es: 'La cabeza cuelga y el cuello se comprime.' },
      fix: { tr: 'Çene hafif yukarıda kalsın', en: 'Keep the chin lifted', es: 'Mantén la barbilla elevada' },
      fixText: { tr: 'Boyun uzun, bakış yumuşakça yukarı', en: 'Long neck, gaze softly up', es: 'Cuello largo, mirada suave hacia arriba' },
      at: 'camel', pose: { neck: -62 }, view: { yaw: 60, pitch: 8 }, marks: ['head'], parts: ['neck'] },
  ],
  cues: [{ tr: 'Kalça dizlerin üstünde', en: 'Hips stay over the knees', es: 'Cadera sobre las rodillas' },
    { tr: 'Göğüs kemiğini kaldır', en: 'Lift the sternum', es: 'Eleva el esternón' },
    { tr: 'Kalçayı öne it', en: 'Press the hips forward', es: 'Empuja la cadera adelante' }],
};
}
