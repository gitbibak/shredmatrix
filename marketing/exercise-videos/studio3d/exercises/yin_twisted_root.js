/* Yin Twisted Root (supine twist with crossed legs), knees to the LEFT. Supine, knees bent, feet on the mat, arms in a T ->
 * cross the right thigh over the left and let both knees drop to the left while both shoulders stay down -> long hold, face
 * turned right -> unwind through the centre. Switch sides is in the setup text.
 * - Built on supine_twist.js (mirrored): ground contacts [shoulderL, hipL] in every pose; the pelvis rolls to the left
 *   (`roll` +), the spine counter-rotates (`twist` -). fitRoot() (lazy) alternates two bisections: twist so the shoulders are
 *   level, roll so the lower (left) knee rests on the mat. The start bisects the hip so the feet stand on the mat.
 * - Crossed legs: right hip adducted over the left thigh (abdR -16), right knee bent more (the foot hooks behind the left calf
 *   as far as the rig allows; the engine has no foot-to-calf hook, so the wrap is approximate).
 * - Arms: world targets on the mat in a T (shoulders are anchored, one pair fits all poses), palms up. */
{
const MAT = 0.012;
const G = [['shoulderL', MAT + 0.03], ['hipL', MAT]];
const BASE = { handFlat: false, elbowPole: [-0.2, -1, 0.3], trunk: -90, ground: G, flat: false, ankle: -10, shAbd: 88, el: 6, palm: 'up', curl: 0.2, thoracic: 0, neck: 0 };
const RAW = {
  start: { ...BASE, hip: 70, knee: 100, abd: 3, roll: 0, twist: 0, headTurn: 0, sh: 0, flat: true },
  twist: { ...BASE, hipR: 100, kneeR: 120, abdR: -16, hrotR: -6, hipL: 92, kneeL: 104, abdL: 2, roll: 55, twist: -55, headTurn: 40, sh: 0, ankle: -25 },
};
const BR = 0.085;
let KB = [0.1, MAT + BR, -0.4];
// the bolster sinks out of sight when the knees are forced to the floor (mistake 2: no support)
FB.PROPS._kneeBolster = (sol) => { const y = Math.min(MAT + BR, sol.J.kneeL[1] - 0.05 - BR); if (y + BR < MAT + 0.015) return [];
  return FB.PROPS.bolster(null, { at: [KB[0], y, KB[2]], axis: [1, 0, 0], length: 0.55, r: BR }); };
const CTX = { anchorX: ['shoulderL', 'shoulderR'], anchorAt: [-0.4, 0] };

function fitRoot(poses, extra) {
  const { solve, expand } = FB;
  const S = (p) => solve(expand(Object.assign({}, p, { ik: undefined })), CTX).J;
  const bis = (p, key, f, lo, hi) => { const up = f(hi) > f(lo);
    for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if ((f(m) > 0) === up) hi = m; else lo = m; } p[key] = +((lo + hi) / 2).toFixed(2); };
  const level = (p) => bis(p, 'twist', (v) => { const J = S({ ...p, twist: v }); return J.shoulderR[1] - J.shoulderL[1]; }, -130, 10);
  const t = poses.twist;
  for (let k = 0; k < 5; k++) { level(t); bis(t, 'roll', (v) => { const q = { ...t, roll: v }; level(q); return S(q).kneeL[1] - (MAT + 2 * BR + 0.05); }, 10, 100); }
  level(t);
  { const Jt = S(t); KB = [Jt.kneeL[0] - 0.05, MAT + BR, Jt.kneeL[2] + 0.02]; }
  bis(poses.start, 'hip', (v) => S({ ...poses.start, hip: v }).heelR[1] - MAT, 30, 100);
  for (const q of [t, poses.start]) bis(q, 'neck', (v) => S({ ...q, neck: v }).head[1] - (MAT + 0.1), -30, 40);
  const J = S(poses.start), h = (s) => [J['hand' + s][0], MAT + 0.035, J['hand' + s][2]];
  poses.start.ik = { handL: { at: h('L') }, handR: { at: h('R') } }; t.ik = poses.start.ik;
  for (const [at, pose] of extra) {
    if (pose.dTwist !== undefined) pose.twist = +(poses[at].twist + pose.dTwist).toFixed(2);
    if (pose.force) { const m = Object.assign({}, poses[at], pose, { ik: undefined });
      for (let k = 0; k < 5; k++) { level(m); bis(m, 'roll', (v) => { const q = { ...m, roll: v }; level(q); return S(q).kneeL[1] - (MAT + 0.055); }, 10, 110); }
      level(m); pose.roll = m.roll; pose.twist = m.twist;
      const Jm = S(m); pose.ik = { handL: { at: FB.V.add(Jm.kneeR, [0.02, 0.075, 0]) }, handR: poses[at].ik.handR }; }
  }
  return poses;
}

window.EXERCISE = {
  id: 'yin_twisted_root',
  name: { tr: 'Yin Bükülmüş Kök', en: 'Yin Twisted Root', es: 'Raíz retorcida yin' },
  category: { tr: 'Yin Yoga · Omurga', en: 'Yin Yoga · Spine', es: 'Yin yoga · Columna' },
  equipmentLabel: { tr: 'Mat, bolster', en: 'Mat, bolster', es: 'Esterilla, bolster' },
  muscles: ['obliques', 'glutes', 'lowerback'],
  tempo: '5-10-5',
  hold: true, holdDur: 3,
  view: { yaw: -25, pitch: 34 },
  alt: { yaw: 0, pitch: 62, title: { tr: 'Üstten bak', en: 'Top view', es: 'Vista superior' },
    text: { tr: 'Bacaklar çapraz, iki omuz yerde', en: 'Legs crossed, both shoulders down', es: 'Piernas cruzadas, ambos hombros abajo' } },
  setupView: { yaw: -45, pitch: 24 },
  contacts: ['shoulderR', 'shoulderL', 'heelR', 'heelL'],
  props: [['mat', { at: [-0.1, 0, 0], length: 1.8, width: 0.75 }], ['_kneeBolster']],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fitRoot(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'start',
  rep: [
    { to: 'twist', dur: 4.0, phase: 0 },
    { to: 'twist', dur: 1.0, phase: 1 },
    { to: 'start', dur: 3.5, phase: 2 },
  ],
  setup: { tr: 'Sırtüstü uzan, dizler bükülü, ayaklar yerde. Bolster sol yanında. Sonra taraf değiştir.',
    en: 'Lie on your back, knees bent, feet on the floor. Bolster on your left. Then switch sides.',
    es: 'Boca arriba, rodillas flexionadas, pies en el suelo. Bolster a tu izquierda. Luego cambia.' },
  phases: [
    { name: { tr: 'Sar ve bırak', en: 'Wrap and drop', es: 'Cruza y suelta' }, breath: 'out', slow: 1.0,
      text: { tr: 'Sağ uyluğu solun üstüne at, nefes verirken dizleri sola, bolstera bırak.', en: 'Cross the right thigh over the left and exhale the knees down onto the bolster.', es: 'Cruza el muslo derecho sobre el izquierdo y exhala bajando las rodillas al bolster.' } },
    { name: { tr: 'Bırak ve kal', en: 'Let go and stay', es: 'Suelta y quédate' }, breath: 'easy', line: ['shoulderL', 'shoulderR'],
      text: { tr: 'Omuzlar yerde ağır, yüz sağa dönük. Yerçekimine bırak.', en: 'Shoulders heavy on the floor, face turned right. Give in to gravity.', es: 'Hombros pesados en el suelo, cara a la derecha. Entrégate a la gravedad.' } },
    { name: { tr: 'Yavaşça çöz', en: 'Unwind slowly', es: 'Deshaz despacio' }, breath: 'in', slow: 1.0,
      text: { tr: 'Nefes alırken dizleri ortaya getir, bacakları çöz.', en: 'Inhale, bring the knees back to centre and uncross the legs.', es: 'Inhala, vuelve las rodillas al centro y descruza las piernas.' } },
  ],
  tempoText: { tr: '5 sn gir · her yan 3-5 dk · 5 sn çöz', en: '5 s in · 3-5 min each side · 5 s out', es: '5 s entrar · 3-5 min por lado · 5 s salir' },
  mistakes: [
    { title: { tr: 'Karşı omuz yerden kalkıyor', en: 'Opposite shoulder lifts', es: 'El hombro contrario se eleva' },
      text: { tr: 'Göğüs dizlerle döner, sağ omuz havada kalır.', en: 'The chest turns with the knees; the right shoulder lifts.', es: 'El pecho gira con las rodillas; el hombro derecho sube.' },
      fix: { tr: 'Dizlerin altına destek koy', en: 'Put a prop under the knees', es: 'Pon un soporte bajo las rodillas' },
      fixText: { tr: 'Dizleri biraz yukarı al, omuzlar yerde kalsın', en: 'Bring the knees a bit higher; shoulders stay down', es: 'Sube un poco las rodillas; hombros abajo' },
      at: 'twist', pose: { dTwist: 30 }, view: { yaw: 0, pitch: 30 }, marks: ['shoulderR'], line: ['shoulderL', 'shoulderR'], parts: ['upperR', 'chest'] },
    { title: { tr: 'Dizleri yere zorlamak', en: 'Forcing the knees down', es: 'Forzar las rodillas' },
      text: { tr: 'Destek yok, el dizleri yere bastırır; bel ve omuzlar gerilir.', en: 'No support; a hand levers the knees down. Low back and shoulders strain.', es: 'Sin apoyo, la mano empuja las rodillas. Lumbar y hombros se tensan.' },
      fix: { tr: 'Destek kullan, yerçekimi çeksin', en: 'Use props, let gravity work', es: 'Usa soportes, deja actuar la gravedad' },
      fixText: { tr: 'Dizlerin altına yastık, nefesle gevşe', en: 'A cushion under the knees; relax with the breath', es: 'Un cojín bajo las rodillas; suelta con la respiración' },
      at: 'twist', pose: { force: true, shrug: 0.045, headTurn: 0, curlR: 0.9, curlL: 0.2, palmL: 'down' }, view: { yaw: -50, pitch: 24 }, marks: ['kneeL', 'shoulderR'], parts: ['waist', 'upper'] },
  ],
  cues: [{ tr: 'Omuzlar yerde ağır', en: 'Shoulders heavy on the floor', es: 'Hombros pesados en el suelo' },
    { tr: 'Bacaklar kök gibi sarılı', en: 'Legs wrapped like roots', es: 'Piernas enlazadas como raíces' },
    { tr: 'Yerçekimine bırak', en: 'Release into gravity', es: 'Entrégate a la gravedad' }],
};
}
