/* Supine Twist (Supta Matsyendrasana, knees stacked to the right). Knees hugged -> knees drop right while both shoulders stay
 * on the mat -> hold, head turned left -> knees back to centre.
 * - One ground contact [shoulderR] in every pose; the thorax stays flat (trunk -90).
 * - The pelvis rolls to the right (`roll`, + = right side down) and the spine counter-rotates (`twist`, split over lumbar and
 *   thoracic by the engine). fitTwist() (lazy, after the rig sets FB.BODY) alternates two bisections: twist so the shoulders
 *   are level (chest flat), roll so the lower (right) knee rests on the mat. Arms in a T, palms up, hands laid on the mat by
 *   a shoulder-flexion bisection.
 * - The engine's 2-contact solver is sagittal only, so the rolled pelvis is placed by geometry, not by a pelvis contact. */
{
const MAT = 0.012;
const G = [['shoulderR', MAT + 0.03], ['hipR', MAT]];
const BASE = { handFlat: false, elbowPole: [-0.2, -1, 0.3], trunk: -90, ground: G, flat: false, ankle: -20, shAbd: 88, el: 6, palm: 'up', curl: 0.2, thoracic: 0, neck: 0 };
const RAW = {
  hug: { ...BASE, hip: 118, knee: 125, abd: 2, roll: 0, twist: 0, headTurn: 0, sh: 0 },
  twist: { ...BASE, hip: 100, knee: 100, abd: 0, roll: -55, twist: 55, headTurn: -40, sh: 0 },
};
const CTX = { anchorX: ['shoulderL', 'shoulderR'], anchorAt: [-0.4, 0] };

function fitTwist(poses, extra) {
  const { solve, expand } = FB;
  const S = (p) => solve(expand(p), CTX).J;
  const bis = (p, key, f, lo, hi) => { const up = f(hi) > f(lo);
    for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if ((f(m) > 0) === up) hi = m; else lo = m; } p[key] = +((lo + hi) / 2).toFixed(2); };
  const level = (p) => bis(p, 'twist', (v) => { const J = S({ ...p, twist: v }); return J.shoulderL[1] - J.shoulderR[1]; }, -10, 130);
  // hands: world targets on the mat straight out from the shoulders (a T); shoulders are anchored, so one pair fits all poses
  const arms = (p) => { const J = S({ ...p, ik: undefined }), h = (s) => [J['hand' + s][0], MAT + 0.035, J['hand' + s][2]];
    p.ik = { handL: { at: h('L') }, handR: { at: h('R') } }; };
  const t = poses.twist;
  for (let k = 0; k < 5; k++) { level(t); bis(t, 'roll', (v) => { const q = { ...t, roll: v }; level(q); return S(q).kneeR[1] - (MAT + 0.055); }, -100, -10); }
  level(t);
  for (const q of [t, poses.hug]) bis(q, 'neck', (v) => S({ ...q, neck: v }).head[1] - (MAT + 0.1), -30, 40);   // back of the head on the mat
  arms(poses.hug); t.ik = poses.hug.ik;
  for (const [at, pose] of extra) { if (pose.dTwist === undefined) continue; pose.twist = +(poses[at].twist + pose.dTwist).toFixed(2); }
  return poses;
}

window.EXERCISE = {
  id: 'supine_twist',
  name: { tr: 'Sırtüstü Burgu', en: 'Supine Twist', es: 'Torsión en supino' },
  category: { tr: 'Yoga · Omurga', en: 'Yoga · Spine', es: 'Yoga · Columna' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['obliques', 'lowerback', 'glutes'],
  tempo: '4-10-4',
  hold: true, holdDur: 3,
  view: { yaw: 25, pitch: 34 },
  alt: { yaw: 0, pitch: 62, title: { tr: 'Üstten bak', en: 'Top view', es: 'Vista superior' },
    text: { tr: 'İki omuz yerde, dizler sağda üst üste', en: 'Both shoulders down, knees stacked to the right', es: 'Ambos hombros abajo, rodillas juntas a la derecha' } },
  contacts: ['shoulderR', 'shoulderL', 'handR', 'handL'],
  props: [['mat', { at: [-0.1, 0, 0], length: 1.8, width: 0.75 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fitTwist(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'hug',
  rep: [
    { to: 'twist', dur: 4.0, phase: 0 },
    { to: 'twist', dur: 1.0, phase: 1 },
    { to: 'hug', dur: 3.5, phase: 2 },
  ],
  setup: { tr: 'Sırtüstü yat, dizleri göğse çek. Kollar yana açık, avuçlar yukarı. Sonra diğer tarafa geç.',
    en: 'Lie on your back, knees to the chest. Arms out in a T, palms up. Then switch sides.',
    es: 'Boca arriba, rodillas al pecho. Brazos en T, palmas arriba. Luego cambia de lado.' },
  phases: [
    { name: { tr: 'Dizleri sağa bırak', en: 'Knees to the right', es: 'Rodillas a la derecha' }, breath: 'out', slow: 1.0,
      text: { tr: 'Nefes verirken dizleri birlikte sağa indir. Omuzlar yerde kalsın.', en: 'Exhale and lower both knees to the right. Shoulders stay down.', es: 'Exhala y baja ambas rodillas a la derecha. Hombros abajo.' } },
    { name: { tr: 'Burguda kal', en: 'Hold the twist', es: 'Mantén la torsión' }, breath: 'easy', line: ['shoulderL', 'shoulderR'],
      text: { tr: 'Başı sola çevir, omuzları ağır bırak. 5-10 nefes.', en: 'Turn the head left, let the shoulders be heavy. 5-10 breaths.', es: 'Gira la cabeza a la izquierda, hombros pesados. 5-10 respiraciones.' } },
    { name: { tr: 'Ortaya dön', en: 'Back to centre', es: 'Vuelve al centro' }, breath: 'in', slow: 1.0,
      text: { tr: 'Nefes alırken dizleri ortaya getir ve sarıl.', en: 'Inhale, bring the knees back to centre and hug them.', es: 'Inhala, vuelve las rodillas al centro y abrázalas.' } },
  ],
  tempoText: { tr: '4 sn in · 5-10 nefes kal · 4 sn dön', en: '4 s down · 5-10 breaths · 4 s back', es: '4 s abajo · 5-10 respiraciones · 4 s vuelta' },
  mistakes: [
    { title: { tr: 'Karşı omuz yerden kalkıyor', en: 'Opposite shoulder lifts', es: 'El hombro contrario se eleva' },
      text: { tr: 'Göğüs dizlerle birlikte döner, sol omuz havada.', en: 'The chest turns with the knees; the left shoulder lifts.', es: 'El pecho gira con las rodillas; el hombro izquierdo sube.' },
      fix: { tr: 'Dizlerin altına blok koy', en: 'Put a block under the knees', es: 'Pon un bloque bajo las rodillas' },
      fixText: { tr: 'Omuzlar yerde kalacak kadar dön', en: 'Twist only as far as the shoulders stay down', es: 'Gira solo hasta donde los hombros sigan abajo' },
      at: 'twist', pose: { dTwist: -30 }, view: { yaw: 0, pitch: 30 }, marks: ['shoulderL'], line: ['shoulderL', 'shoulderR'], parts: ['upperL', 'chest'] },
    { title: { tr: 'Dizleri yere zorlamak', en: 'Forcing the knees down', es: 'Forzar las rodillas al suelo' },
      text: { tr: 'Dizler aşağı bastırılır, omuzlar ve eller kasılır.', en: 'The knees are pushed down; shoulders and hands tense up.', es: 'Se empujan las rodillas; hombros y manos se tensan.' },
      fix: { tr: 'Dizleri destekle, yerçekimi çeksin', en: 'Support the knees, let gravity work', es: 'Apoya las rodillas, deja que actúe la gravedad' },
      fixText: { tr: 'Dizlerin altına yastık koy, nefesle gevşe', en: 'A bolster under the knees; relax with the breath', es: 'Un cojín bajo las rodillas; suelta con la respiración' },
      at: 'twist', pose: { shrug: 0.045, hip: 84, knee: 90, headTurn: 0, curl: 0.9 }, view: { yaw: 50, pitch: 20 }, marks: ['kneeR', 'shoulderR'], parts: ['upper', 'thigh'] },
  ],
  cues: [{ tr: 'Omuzlar ağır', en: 'Shoulders heavy', es: 'Hombros pesados' },
    { tr: 'Dizleri yerçekimine bırak', en: 'Let gravity take the knees', es: 'Deja que la gravedad baje las rodillas' },
    { tr: 'Kaburgalara nefes al', en: 'Breathe into the ribs', es: 'Respira hacia las costillas' }],
};
}
