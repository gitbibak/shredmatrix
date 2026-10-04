/* Supine Spine Twist (Pilates mat, knee sway from tabletop). Built on supine_twist.js:
 * - Ground [shoulderR, pelvis] in every pose (same names); the pelvis contact height is raised by hipHalf*sin(|roll|) so the
 *   lower hip, not the pelvis centre, rests on the mat when the pelvis rolls.
 * - Knees sway: the pelvis rolls (`roll`, - = right side down) and the spine counter-rotates (`twist`); fit() bisects the
 *   twist so both shoulders stay level (chest flat on the mat). Spec: legs tilt 45° with ~30° lumbar rotation; the extra
 *   leg tilt comes from adducting the top leg / abducting the bottom leg (knees stay together) on top of a 32° pelvis roll.
 * - Arms in a T on the mat (world IK targets from the tabletop pose, shoulders anchored), resting palms down.
 * - Head: neck bisected so the back of the head rests on the mat. */
{
const MAT = 0.012;
const HH = 0.085;
const G = (roll) => [['shoulderR', MAT + 0.03], ['pelvis', MAT + HH * Math.sin(Math.abs(roll) * Math.PI / 180)]];
const BASE = { trunk: -90, flat: false, ankle: -10, shAbd: 88, sh: 0, el: 4, curl: 0.1, thoracic: 0, neck: 0, hip: 90, knee: 90, abd: -6, hrot: 0 };
const sway = (dir) => ({ roll: -32 * dir, abdR: -6 + 12 * dir, abdL: -6 - 12 * dir, headTurn: 0 });   // dir +1 = knees to the right
const RAW = {
  table: Object.assign({}, BASE, { roll: 0, twist: 0, ground: G(0) }),
  right: Object.assign({}, BASE, sway(1), { ground: G(32) }),
  left: Object.assign({}, BASE, sway(-1), { ground: G(32) }),
};
const CTX = { anchorX: ['shoulderL', 'shoulderR'], anchorAt: [-0.4, 0] };

function fit(poses, extra) {
  const { solve, expand } = FB;
  const S = (p) => solve(expand(Object.assign({}, p, { ik: undefined })), CTX).J;
  const bis = (p, key, f, lo, hi) => { const up = f(hi) > f(lo);
    for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if ((f(m) > 0) === up) hi = m; else lo = m; } p[key] = +((lo + hi) / 2).toFixed(2); };
  const level = (p) => bis(p, 'twist', (v) => { const J = S({ ...p, twist: v }); return J.shoulderL[1] - J.shoulderR[1]; }, -80, 80);
  level(poses.right); level(poses.left); poses.table.twist = 0;
  for (const k in poses) { const q = poses[k]; bis(q, 'neck', (v) => S({ ...q, neck: v }).head[1] - (MAT + 0.1), -30, 40); }
  const J = S(poses.table), h = (s) => [J['hand' + s][0], MAT + 0.035, J['hand' + s][2]];
  const ik = { handL: { at: h('L') }, handR: { at: h('R') } };
  for (const k in poses) poses[k].ik = ik;
  for (const [at, pose] of extra) { if (pose.dTwist !== undefined) { pose.twist = +(poses[at].twist + pose.dTwist).toFixed(2); delete pose.dTwist; } }
  return poses;
}

window.EXERCISE = {
  id: 'supine_spine_twist',
  name: { tr: 'Sırtüstü Omurga Döndürme (Supine Spine Twist)', en: 'Supine Spine Twist', es: 'Giro de columna supino' },
  category: { tr: 'Pilates · Rotasyon', en: 'Pilates · Rotation', es: 'Pilates · Rotación' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['obliques', 'core'],
  tempo: '2.5-2',
  tempoReps: 1,
  view: { yaw: 4, pitch: 36 },
  alt: { yaw: 70, pitch: 22, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
    text: { tr: 'Omuzlar matta, hareket belden', en: 'Shoulders down, the move comes from the waist', es: 'Hombros abajo, el giro sale de la cintura' } },
  setupView: { yaw: 60, pitch: 22 },
  contacts: ['shoulderR', 'shoulderL', 'handR', 'handL', 'pelvis'],
  props: [['mat', { at: [-0.1, 0, 0], length: 1.8, width: 0.8 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fit(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'table',
  rep: [
    { to: 'right', dur: 2.5, phase: 0 },
    { to: 'table', dur: 2.0, phase: 1 },
    { to: 'left', dur: 2.5, phase: 2 },
    { to: 'table', dur: 2.0, phase: 1 },
  ],
  setup: { tr: 'Sırtüstü yat, dizler bitişik ve masa pozisyonunda (90°). Kollar yana açık, avuçlar matta.',
    en: 'Lie on your back, knees together in tabletop (90°). Arms out in a T, palms on the mat.',
    es: 'Boca arriba, rodillas juntas en mesa (90°). Brazos en T, palmas en la esterilla.' },
  phases: [
    { name: { tr: 'Nefes ver, dizler sağa', en: 'Exhale, knees right', es: 'Exhala, rodillas a la derecha' }, breath: 'out', line: ['shoulderL', 'shoulderR'],
      text: { tr: 'Dizleri birlikte sağa indir. İki omuz da matta kalır.', en: 'Lower both knees to the right. Both shoulders stay on the mat.', es: 'Baja las rodillas juntas a la derecha. Ambos hombros abajo.' } },
    { name: { tr: 'Nefes al, ortaya', en: 'Inhale, centre', es: 'Inhala, al centro' }, breath: 'in',
      text: { tr: 'Yan karınla dizleri ortaya geri getir.', en: 'Use the obliques to bring the knees back to centre.', es: 'Usa los oblicuos para volver al centro.' } },
    { name: { tr: 'Nefes ver, dizler sola', en: 'Exhale, knees left', es: 'Exhala, rodillas a la izquierda' }, breath: 'out', line: ['shoulderL', 'shoulderR'],
      text: { tr: 'Aynısını sola yap. Dizler bir çift gibi birlikte.', en: 'Same to the left. Knees move together like a pair.', es: 'Igual a la izquierda. Rodillas juntas como un par.' } },
  ],
  tempoText: { tr: '2,5 sn indir · 2 sn ortaya · her iki yana', en: '2.5 s lower · 2 s centre · both sides', es: '2,5 s baja · 2 s centro · ambos lados' },
  mistakes: [
    { title: { tr: 'Karşı omuz kalkıyor', en: 'Opposite shoulder lifts', es: 'El hombro contrario se eleva' },
      text: { tr: 'Dizler inerken sol omuz mattan kalkar.', en: 'As the knees drop, the left shoulder comes off the mat.', es: 'Al bajar las rodillas, el hombro izquierdo se despega.' },
      fix: { tr: 'Hareketi küçült, kollarla bastır', en: 'Smaller range, press the arms down', es: 'Menos recorrido, presiona los brazos' },
      fixText: { tr: 'Omuzlar ağır, sadece bel döner', en: 'Shoulders heavy; only the waist turns', es: 'Hombros pesados; solo gira la cintura' },
      at: 'right', pose: { dTwist: -24 }, view: { yaw: 0, pitch: 26 }, marks: ['shoulderL'], line: ['shoulderL', 'shoulderR'], parts: ['upperL', 'chest'] },
    { title: { tr: 'Dizler ayrılıyor', en: 'Knees drift apart', es: 'Las rodillas se separan' },
      text: { tr: 'Üstteki diz geride kalır, bacaklar açılır.', en: 'The top knee lags behind and the legs open.', es: 'La rodilla de arriba se queda atrás y las piernas se abren.' },
      fix: { tr: 'İç bacakları sık', en: 'Squeeze the inner thighs', es: 'Aprieta los aductores' },
      fixText: { tr: 'Dizler ve ayaklar bitişik kalır', en: 'Knees and feet stay glued together', es: 'Rodillas y pies juntos' },
      at: 'right', pose: { abdL: 2, abdR: 14 }, view: { yaw: 0, pitch: 40 }, line: ['kneeL', 'kneeR'], marks: ['kneeL'], parts: ['thighL'] },
  ],
  cues: [{ tr: 'Omuzlar ağır', en: 'Shoulders heavy', es: 'Hombros pesados' },
    { tr: 'Belden hareket et, bacaklardan değil', en: 'Move from the waist, not the legs', es: 'Muévete desde la cintura, no las piernas' },
    { tr: 'Dizler bir çift gibi', en: 'Knees together like a pair', es: 'Rodillas juntas como un par' }],
};
}
