/* Rocking (Pilates mat, prone bow). Built on the approved bow_pose.js: prone, hands on the outer ankles, one ground contact
 * [pelvis] (anchored, so the body rocks in place), hands = world targets on the outer ankles in every pose (never let go).
 * - fitRock() (lazy, after the rig sets FB.BODY): start bisects the knee bend so the hands reach the ankles with the chest down;
 *   bow / fwd / back bisect one scale on (hip extension, lumbar, thoracic) so the straight arms just reach the ankles, then the
 *   pelvis-contact height is solved so the LOWEST body part rests on the mat: belly in 'bow', chest/ribs in 'fwd' (whole bow
 *   tipped head-down, `trunk` 118), thighs in 'back' (tipped feet-down, `trunk` 68) = a rocking chair on its curved front.
 * - Spec: bow thoracic ext 35 / lumbar 30 / hip -30 / knee 90; fwd thoracic 40 / hip -40; back thoracic 30 / hip -20.
 *   With this rig's arm length the knee stays ~100-105 (straight arms must reach the ankles); spine params are scaled by the
 *   reach fit (reported in the qa notes). */
{
const MAT = 0.012;
const G = (h = 0) => [['pelvis', MAT + h]];
const BASE = { trunk: 86, ground: G(), flat: false, ankle: -30, abd: 6, hrot: 0, handFlat: false, palm: 'in', curl: 0.85,
  shAbd: 14, elbowPole: [0, -1, 0.6], noAvoid: true };
const RAW = {
  start: { ...BASE, hip: 2, knee: 120, lumbar: -6, thoracic: -4, neck: 6, sh: -60, el: 4 },
  bow: { ...BASE, hip: -30, knee: 100, lumbar: -30, thoracic: -35, neck: -14, sh: -65, el: 2 },
  fwd: { ...BASE, trunk: 118, hip: -38, knee: 98, lumbar: -30, thoracic: -40, neck: -18, sh: -66, el: 2 },
  back: { ...BASE, trunk: 68, hip: -22, knee: 102, lumbar: -26, thoracic: -30, neck: -10, sh: -64, el: 2 },
};
const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };

function fitRock(poses, extra) {
  const { V, solve, expand, BODY: B, CLEAR } = FB;
  const S = (p) => solve(expand(Object.assign({}, p, { ik: undefined })), CTX).J;
  const reach = B.upper + B.fore + B.hand * 0.55 - 0.004;
  const grip = (J, s) => V.add(J['ankle' + s], [0.02, 0.01, (s === 'R' ? 1 : -1) * 0.05]);
  const d = (J) => V.len(V.sub(grip(J, 'R'), J.shoulderR)) - reach;
  const bisScale = (p, keys) => { const P0 = {}; keys.forEach((k) => { P0[k] = p[k]; });
    let lo = 0.2, hi = 2.0; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; const q = { ...p }; keys.forEach((k) => { q[k] = P0[k] * m; }); if (d(S(q)) > 0) lo = m; else hi = m; }
    const m = (lo + hi) / 2; keys.forEach((k) => { p[k] = +(P0[k] * m).toFixed(2); }); };
  // pelvis height so the lowest front-of-body point rests on the mat (rocking-chair contact)
  const PTS = [['chest', 0.11], ['waist', 0.1], ['pelvis', 0.1], ['hipR', 0.1], ['kneeR', 0.05], ['neck', 0.07]];
  const settle = (p) => { const J = S({ ...p, ground: G(0) }); let lo = Infinity; for (const [k, c] of PTS) lo = Math.min(lo, J[k][1] - c - MAT);
    p.ground = G(+(-lo).toFixed(4)); };
  const hands = (p) => { const J = S(p); p.ik = { handL: { at: grip(J, 'L') }, handR: { at: grip(J, 'R') } }; };
  { const p = poses.start; let lo = 90, hi = 160; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (d(S({ ...p, knee: m })) > 0) lo = m; else hi = m; } p.knee = +((lo + hi) / 2).toFixed(2); }
  for (const k of ['bow', 'fwd', 'back']) bisScale(poses[k], ['hip', 'lumbar', 'thoracic']);
  for (const k in poses) { settle(poses[k]); hands(poses[k]); }
  for (const [at, pose] of extra) { const m = Object.assign({}, poses[at], pose); if (pose.refit) { bisScale(m, pose.refit); pose.refit.forEach((k) => { pose[k] = m[k]; }); }
    settle(m); pose.ground = m.ground; hands(m); pose.ik = m.ik; }
  return poses;
}

window.EXERCISE = {
  id: 'rocking',
  name: { tr: 'Sallanma (Rocking)', en: 'Rocking', es: 'Balanceo (rocking)' },
  category: { tr: 'Pilates · Sırt', en: 'Pilates · Back', es: 'Pilates · Espalda' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['lowerback', 'glutes', 'hamstrings', 'delts'],
  tempo: '2-1-1-2',
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 35, pitch: 20, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Dizler kalça genişliğinde, göğüs açık', en: 'Knees hip-width, chest open', es: 'Rodillas al ancho de cadera, pecho abierto' } },
  setupView: { yaw: 40, pitch: 22 },
  contacts: ['pelvis', 'chest'],
  props: [['mat', { at: [0, 0.006, 0], length: 1.8, width: 0.7 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fitRock(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'start',
  rep: [
    { to: 'bow', dur: 2.0, phase: 0 },
    { to: 'fwd', dur: 1.0, phase: 1 },
    { to: 'back', dur: 1.0, phase: 2 },
    { to: 'start', dur: 2.0, phase: 3 },
  ],
  setup: { tr: 'Yüzüstü uzan, dizleri bük. Elleri geriye uzat, ayak bileklerini dıştan tut.',
    en: 'Lie face down and bend the knees. Reach back and hold the outer ankles.',
    es: 'Boca abajo, flexiona las rodillas. Lleva las manos atrás y toma los tobillos.' },
  phases: [
    { name: { tr: 'Yayı kur', en: 'Make the bow', es: 'Forma el arco' }, breath: 'in', slow: 1.2,
      text: { tr: 'Nefes al, ayakları ellere it. Göğüs ve uyluklar kalkar.', en: 'Inhale, kick the feet into the hands. Chest and thighs lift.', es: 'Inhala, empuja los pies contra las manos. Pecho y muslos suben.' } },
    { name: { tr: 'Öne sallan', en: 'Rock forward', es: 'Balancea adelante' }, breath: 'out', slow: 1.6,
      text: { tr: 'Nefes ver, göğse doğru sallan. Bacaklar yükselir.', en: 'Exhale, rock onto the chest. The legs rise.', es: 'Exhala, balancea hacia el pecho. Las piernas suben.' } },
    { name: { tr: 'Geri sallan', en: 'Rock back', es: 'Balancea atrás' }, breath: 'in', slow: 1.6, line: ['kneeR', 'hipR', 'neck'],
      text: { tr: 'Nefes al, uyluklara sallan. Göğüs yükselir.', en: 'Inhale, rock onto the thighs. The chest rises.', es: 'Inhala, balancea hacia los muslos. El pecho sube.' } },
    { name: { tr: 'Bırak', en: 'Release', es: 'Suelta' }, breath: 'out', slow: 1.0,
      text: { tr: '3-6 sallanmadan sonra nefes vererek yavaşça in.', en: 'After 3-6 rocks, exhale and lower slowly.', es: 'Tras 3-6 balanceos, exhala y baja despacio.' } },
  ],
  tempoText: { tr: '2 sn yay · 1 sn öne · 1 sn geri · 2 sn in', en: '2 s bow · 1 s forward · 1 s back · 2 s down', es: '2 s arco · 1 s adelante · 1 s atrás · 2 s abajo' },
  mistakes: [
    { title: { tr: 'Bel sıkışıyor', en: 'Collapsing into the low back', es: 'Se hunde en la lumbar' },
      text: { tr: 'Kavis sadece belde, uyluklar yerde, boyun geride.', en: 'All the arch is in the low back, thighs down, neck crunched.', es: 'Todo el arco en la lumbar, muslos abajo, cuello atrás.' },
      fix: { tr: 'Göğsü kaldır, kalçayı çalıştır', en: 'Lift the chest, use the glutes', es: 'Eleva el pecho, activa glúteos' },
      fixText: { tr: 'Kavis tüm omurgaya yayılır, boyun uzun', en: 'The arch spreads along the spine, neck long', es: 'El arco se reparte, cuello largo' },
      at: 'bow', pose: { hip: -6, thoracic: -6, lumbar: -50, neck: -32, refit: ['lumbar'] }, line: ['pelvis', 'waist', 'neck'], parts: ['waist', 'pelvis'] },
    { title: { tr: 'Dizler yana açılıyor', en: 'Knees fall wide', es: 'Las rodillas se abren' },
      text: { tr: 'Dizler kalçadan geniş, sallanma dağılır.', en: 'The knees go wider than the hips; the rock falls apart.', es: 'Las rodillas se abren y el balanceo se pierde.' },
      fix: { tr: 'Dizleri kalça genişliğinde tut', en: 'Keep the knees hip-width', es: 'Rodillas al ancho de cadera' },
      fixText: { tr: 'İç uyluklar aktif, bacaklar paralel', en: 'Inner thighs on, legs parallel', es: 'Aductores activos, piernas paralelas' },
      at: 'bow', pose: { abd: 26, hrot: 18 }, view: { yaw: 10, pitch: 40 }, marks: ['kneeL', 'kneeR'], parts: ['thigh'] },
  ],
  cues: [{ tr: 'Ayakları ellere it', en: 'Kick the feet into the hands', es: 'Empuja los pies contra las manos' },
    { tr: 'Uzan ve yay ol', en: 'Lengthen into the bow', es: 'Alarga y forma el arco' },
    { tr: 'Akıcı bir sallanma', en: 'Smooth rocking motion', es: 'Balanceo fluido' }],
};
}
