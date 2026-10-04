/* Bow Pose (Dhanurasana). Prone, knees bent, hands holding the outer ankles, chin down -> kick the feet into the hands: chest
 * and thighs lift, belly stays on the mat -> hold 3-5 breaths -> release down.
 * - One ground contact [pelvis] in every pose (prone, `trunk` 86) with the pelvis anchored, so the belly stays on one spot.
 * - fitBow() (lazy, after the rig sets FB.BODY): start bisects the knee bend so the hands can reach the ankles with the chest
 *   down; the bow bisects one scale on (hip extension, lumbar, thoracic) so the straight arms just reach the ankles.
 *   Hands are world targets on the outer ankles in every pose (computed from the solved legs), so they never let go.
 * - Spec start knee 110 with the chest down is out of arm's reach for this rig; the start uses the knee angle that reaches. */
{
const MAT = 0.012;
const G = [['pelvis', MAT]];
const BASE = { trunk: 86, ground: G, flat: false, ankle: -30, abd: 6, hrot: 0, handFlat: false, palm: 'in', curl: 0.85,
  shAbd: 14, elbowPole: [0, -1, 0.6], noAvoid: true };
const RAW = {
  start: { ...BASE, hip: 2, knee: 120, lumbar: -6, thoracic: -4, neck: 6, sh: -60, el: 4 },
  bow: { ...BASE, hip: -32, knee: 105, lumbar: -38, thoracic: -28, neck: -14, sh: -65, el: 2 },
};
const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };

function fitBow(poses, extra) {
  const { V, solve, expand, BODY: B } = FB;
  const S = (p) => solve(expand(Object.assign({}, p, { ik: undefined })), CTX).J;
  const reach = B.upper + B.fore + B.hand * 0.55 - 0.004;
  const grip = (J, s) => V.add(J['ankle' + s], [0.02, 0.01, (s === 'R' ? 1 : -1) * 0.05]);
  const d = (J) => V.len(V.sub(grip(J, 'R'), J.shoulderR)) - reach;
  const bisScale = (p, keys) => { const P0 = {}; keys.forEach((k) => { P0[k] = p[k]; });
    let lo = 0.2, hi = 2.0; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; const q = { ...p }; keys.forEach((k) => { q[k] = P0[k] * m; }); if (d(S(q)) > 0) lo = m; else hi = m; }
    const m = (lo + hi) / 2; keys.forEach((k) => { p[k] = +(P0[k] * m).toFixed(2); }); };
  const hands = (p) => { const J = S(p); p.ik = { handL: { at: grip(J, 'L') }, handR: { at: grip(J, 'R') } }; };
  { const p = poses.start; let lo = 90, hi = 160; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (d(S({ ...p, knee: m })) > 0) lo = m; else hi = m; } p.knee = +((lo + hi) / 2).toFixed(2); }
  bisScale(poses.bow, ['hip', 'lumbar', 'thoracic']);
  hands(poses.start); hands(poses.bow);
  for (const [at, pose] of extra) { const m = Object.assign({}, poses[at], pose); if (pose.refit) { bisScale(m, pose.refit); pose.refit.forEach((k) => { pose[k] = m[k]; }); } hands(m); pose.ik = m.ik; }
  return poses;
}

window.EXERCISE = {
  id: 'bow_pose',
  name: { tr: 'Yay Pozu (Dhanurasana)', en: 'Bow Pose (Dhanurasana)', es: 'Postura del arco (Dhanurasana)' },
  category: { tr: 'Yoga · Geriye eğilme', en: 'Yoga · Backbend', es: 'Yoga · Extensión' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['lowerback', 'glutes', 'hamstrings', 'delts'],
  tempo: '4-6-4',
  hold: true, holdDur: 3,
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 35, pitch: 20, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Eller ayak bileklerinin dışında, dizler kalça genişliğinde', en: 'Hands on the outer ankles, knees hip-width', es: 'Manos por fuera de los tobillos, rodillas al ancho de cadera' } },
  setupView: { yaw: 40, pitch: 22 },
  contacts: ['pelvis', 'chest'],
  props: [['mat', { at: [0, 0.006, 0], length: 1.8, width: 0.7 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fitBow(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'start',
  rep: [
    { to: 'bow', dur: 4.0, phase: 0 },
    { to: 'bow', dur: 1.0, phase: 1 },
    { to: 'start', dur: 3.5, phase: 2 },
  ],
  setup: { tr: 'Yüzüstü uzan, dizleri bük. Elleri geriye uzat, ayak bileklerini dıştan tut.',
    en: 'Lie face down and bend the knees. Reach back and hold the outer ankles.',
    es: 'Boca abajo, flexiona las rodillas. Lleva las manos atrás y toma los tobillos por fuera.' },
  phases: [
    { name: { tr: 'Ayakları ele it', en: 'Kick into the hands', es: 'Empuja los pies' }, breath: 'in', slow: 1.0,
      text: { tr: 'Nefes al, ayakları ellere it. Göğüs ve uyluklar yerden kalksın.', en: 'Inhale, kick the feet into the hands. Chest and thighs lift.', es: 'Inhala, empuja los pies contra las manos. Pecho y muslos suben.' } },
    { name: { tr: 'Yayda kal', en: 'Hold the bow', es: 'Mantén el arco' }, breath: 'easy', line: ['kneeR', 'hipR', 'neck'],
      text: { tr: 'Karın yerde, göğüs öne ve yukarı. Nefesi tutma, 3-5 nefes.', en: 'Belly down, chest forward and up. Keep breathing, 3-5 breaths.', es: 'Abdomen abajo, pecho adelante y arriba. Respira, 3-5 veces.' } },
    { name: { tr: 'Yavaşça bırak', en: 'Release slowly', es: 'Suelta despacio' }, breath: 'out', slow: 1.0,
      text: { tr: 'Nefes verirken in, bilekleri bırak, başı yana çevir ve dinlen.', en: 'Exhale down, let go of the ankles, turn the head and rest.', es: 'Exhala al bajar, suelta los tobillos, gira la cabeza y descansa.' } },
  ],
  tempoText: { tr: '4 sn kalk · 3-5 nefes kal · 4 sn in', en: '4 s up · 3-5 breaths · 4 s down', es: '4 s arriba · 3-5 respiraciones · 4 s abajo' },
  mistakes: [
    { title: { tr: 'Dizler yana açılıyor', en: 'Knees splay wide', es: 'Rodillas muy abiertas' },
      text: { tr: 'Dizler kalçadan geniş, bel sıkışır.', en: 'The knees go wider than the hips and the low back pinches.', es: 'Las rodillas se abren más que la cadera y la lumbar se comprime.' },
      fix: { tr: 'Dizleri kalça genişliğinde tut', en: 'Keep the knees hip-width', es: 'Rodillas al ancho de cadera' },
      fixText: { tr: 'Gerekirse uylukların etrafına kemer', en: 'A strap around the thighs helps', es: 'Una correa en los muslos ayuda' },
      at: 'bow', pose: { abd: 26, hrot: 18 }, view: { yaw: 10, pitch: 40 }, marks: ['kneeL', 'kneeR'], parts: ['thigh'] },
    { title: { tr: 'Bel sıkışıyor', en: 'Low back compresses', es: 'La lumbar se comprime' },
      text: { tr: 'Kalça kasılır, uyluklar yerde, kavis sadece belde.', en: 'Glutes clench, thighs stay down, all the arch is in the low back.', es: 'Glúteos tensos, muslos abajo, todo el arco en la lumbar.' },
      fix: { tr: 'Kalçayı yumuşat, bacaklarla kaldır', en: 'Soften the glutes, lift with the legs', es: 'Suaviza glúteos, eleva con las piernas' },
      fixText: { tr: 'Uyluklar yukarı, göğüs öne', en: 'Thighs up, chest forward', es: 'Muslos arriba, pecho adelante' },
      at: 'bow', pose: { hip: -6, thoracic: -6, lumbar: -50, neck: -30, refit: ['lumbar'] }, line: ['pelvis', 'waist', 'neck'], parts: ['waist', 'pelvis'] },
  ],
  cues: [{ tr: 'Ayakları ellere it', en: 'Kick the feet into the hands', es: 'Empuja los pies contra las manos' },
    { tr: 'Dizler kalça genişliğinde', en: 'Knees hip-width', es: 'Rodillas al ancho de cadera' },
    { tr: 'Göğsü kaldır', en: 'Lift the chest', es: 'Eleva el pecho' }],
};
}
