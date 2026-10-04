/* Revolved Triangle (Parivrtta Trikonasana), right foot forward. Top three-quarter view (spec primary: top), front view as alt.
 * rest = the pose itself (like triangle_pose.js / half_moon.js); rep = hold -> flat-back hinge with the left hand on the
 * block (small twist, right arm hanging) -> hold -> hold. Both ankles are planted and the legs (and pelvis) are identical in
 * every pose, so the feet never move; only the spine twist and the arms change.
 * Stance along x: right foot ahead, left foot back turned in 45°, both legs straight, hips square (pelvis not rolled).
 * Twist: `twist` (spine) - in core.js + turns the chest to the LEFT, so the opening to the right is negative.
 * With the trunk horizontal, `roll` turns the pelvis about the spine axis: the "hips flare open" mistake is roll +, with the
 * spine twist reduced by the same amount so the chest stays where it was (+ tips toward the character's LEFT).
 * Left palm: world IK target on a standing block (0.23 m) placed under the hold-pose left shoulder, outside the right foot. */
{
const BLOCK_H = 0.23;
let BLOCK = [0.3, 0.075, 0.3];
const LEGS = { hipR: 108, hipL: 62, abdR: -6, abdL: 6, kneeR: 0, kneeL: 0, footOutL: -45, flatL: true, flatR: true, ground: [['heelR', 0]] };
const BASE = Object.assign({ trunk: 85, side: -28, lumbar: 0, thoracic: 0, el: 1, curl: 0.12, handFlatL: true, handSurfaceL: BLOCK_H, pos: [0, 0, 0] }, LEGS);
const RAW = {
  hold: Object.assign({}, BASE, { twist: -84, neck: 0, headTurn: -40, shAbdR: 88, shR: 0, shAbdL: 92, shL: 0, palmR: 'forward' }),
  prep: Object.assign({}, BASE, { twist: -30, neck: -12, headTurn: 0, shAbdR: 4, shR: 88, shAbdL: 30, shL: 70, palmR: 'back' }),
};
const CTX = { anchorX: ['ankleR'], anchorAt: [0.35, 0] };
function build(poses, mistakes) {
  const { solve, expand, BODY: B } = FB;
  const fk = (p) => solve(expand(Object.assign({}, p, { ik: undefined })), CTX);
  const bis = (f, lo, hi) => { let flo = f(lo); for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2, fm = f(m); if ((fm > 0) === (flo > 0)) { lo = m; flo = fm; } else hi = m; } return (lo + hi) / 2; };
  const s = fk(poses.hold);
  BLOCK = [s.J.shoulderL[0] + 0.02, 0.075, s.J.shoulderL[2]];
  const H = { handL: { at: [BLOCK[0], BLOCK_H, BLOCK[2]] } };
  for (const k in poses) poses[k].ik = Object.assign({}, poses[k].ik, H);
  for (const m of mistakes) {
    m.pose.ik = Object.assign({}, m.pose.ik, H);
    // keep the pelvis where it was (a pelvis roll about the root would otherwise shift the body sideways); `lift` raises it
    const q = fk(Object.assign({}, poses[m.at], m.pose)), base = FB.V.sub(s.J.pelvis, q.J.pelvis);
    if (!m.fitLegs) { m.pose.pos = base; continue; }
    // pelvis rolled: move it (x, y) until both straight legs reach their planted ankles again (no bent back knee)
    const L = (B.thigh + B.shin) * 0.998, A = { R: s.J.ankleR, L: s.J.ankleL };
    const res = (d) => { const J = fk(Object.assign({}, poses[m.at], m.pose, { pos: FB.V.add(base, [d[0], d[1], 0]) })).J;
      return ['R', 'L'].map((k) => FB.V.len(FB.V.sub(J['hip' + k], A[k])) - L); };
    let d = [0, 0];
    for (let it = 0; it < 20; it++) {
      const r = res(d), e = 1e-3, a = res([d[0] + e, d[1]]), b = res([d[0], d[1] + e]);
      const j = [[(a[0] - r[0]) / e, (b[0] - r[0]) / e], [(a[1] - r[1]) / e, (b[1] - r[1]) / e]], det = j[0][0] * j[1][1] - j[0][1] * j[1][0];
      d = [d[0] - (j[1][1] * r[0] - j[0][1] * r[1]) / det, d[1] - (-j[1][0] * r[0] + j[0][0] * r[1]) / det];
    }
    m.pose.pos = FB.V.add(base, [d[0], d[1], 0]);
  }
  return poses;
}

window.EXERCISE = {
  id: 'revolved_triangle',
  name: { tr: 'Dönen Üçgen (Parivrtta Trikonasana)', en: 'Revolved Triangle (Parivrtta Trikonasana)', es: 'Triángulo con giro' },
  category: { tr: 'Yoga · Dönüş · Denge', en: 'Yoga · Twist · Balance', es: 'Yoga · Torsión · Equilibrio' },
  equipmentLabel: { tr: 'Mat · Blok', en: 'Mat · Block', es: 'Esterilla · Bloque' },
  muscles: ['obliques', 'hamstrings', 'glutes', 'lowerback'],
  side: 'R',
  tempo: '5-8-4',
  hold: true, holdDur: 4,
  view: { yaw: 35, pitch: 46, zoom: 0.86 },
  alt: { yaw: 0, pitch: 8, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Kollar tek dikey çizgi, kalçalar düz', en: 'Arms in one vertical line, hips level', es: 'Brazos en una línea vertical, cadera nivelada' } },
  setupView: { yaw: 60, pitch: 16 },
  setupMarks: [{ type: 'span', joints: ['ankleL', 'ankleR'], label: { tr: 'Kısa duruş', en: 'Short stance', es: 'Postura corta' } }],
  contacts: ['heelR', 'ballR', 'heelL', 'ballL', 'handL'],
  props: [['mat', { at: [0.05, 0, 0.05], length: 1.9 }], ['block', { at: () => BLOCK, size: [0.1, 0.23, 0.15] }]],
  ctx: Object.assign({ plant: ['ankleL', 'ankleR'] }, CTX),
  get poses() { return this._poses || (this._poses = build(RAW, this.mistakes)); },
  rest: 'hold',
  rep: [
    { to: 'prep', dur: 4.0, phase: 0 },
    { to: 'hold', dur: 4.0, phase: 1 },
    { to: 'hold', dur: 1.0, phase: 2 },
  ],
  setup: { tr: 'Sağ ayak önde, sol ayak 45° içe, kalçalar öne bakar. Blok sağ ayağın dışında. Sonra taraf değiştir.',
    en: 'Right foot forward, left foot turned in 45°, hips face forward. Block outside the right foot. Then switch sides.',
    es: 'Pie derecho delante, izquierdo girado 45°, cadera al frente. Bloque fuera del pie derecho. Luego cambia de lado.' },
  phases: [
    { name: { tr: 'Düz sırtla eğil', en: 'Hinge, flat back', es: 'Bisagra, espalda plana' }, breath: 'out', slow: 1.0,
      text: { tr: 'Gövde yere paralel, sol el sağ ayağın dışındaki bloğa.', en: 'Torso level with the floor, left hand to the block outside the right foot.', es: 'Torso paralelo al suelo, mano izquierda al bloque.' } },
    { name: { tr: 'Sağa dön', en: 'Twist right', es: 'Gira a la derecha' }, breath: 'in', slow: 1.0,
      text: { tr: 'Göğsü sağa aç, sağ kolu tavana uzat.', en: 'Open the chest to the right, reach the right arm up.', es: 'Abre el pecho a la derecha, brazo derecho arriba.' } },
    { name: { tr: 'Pozda kal', en: 'Hold', es: 'Mantén' }, breath: 'easy', line: ['handL', 'shoulderL', 'shoulderR', 'handR'],
      text: { tr: 'Kalçalar düz, omurga uzun, dönüş göğüsten.', en: 'Hips square, long spine, twist from the chest.', es: 'Cadera recta, columna larga, gira desde el pecho.' } },
  ],
  tempoText: { tr: '5 sn gir · 3-5 nefes kal · nefes alarak kalk', en: '5 s in · stay 3-5 breaths · inhale to rise', es: '5 s entrar · 3-5 respiraciones · inhala y sube' },
  mistakes: [
    { title: { tr: 'Kalça açılıyor', en: 'Hips flare open', es: 'La cadera se abre' },
      text: { tr: 'Kalça gövdeyle birlikte döner, sağ kalça yukarı kaçar.', en: 'The pelvis turns with the torso, the right hip pops up.', es: 'La pelvis gira con el torso, la cadera derecha sube.' },
      fix: { tr: 'Kalçaları düz tut', en: 'Keep the hips square', es: 'Mantén la cadera recta' },
      fixText: { tr: 'Sağ kalçayı geri çek, iki kalça aynı hizada', en: 'Draw the right hip back, both hips level', es: 'Lleva la cadera derecha atrás, ambas niveladas' },
      at: 'hold', fitLegs: true, pose: { roll: 18, twist: -64 }, view: { yaw: 150, pitch: 30 }, marks: ['hipR', 'hipL'], parts: ['pelvis'] },
    { title: { tr: 'Sırt yuvarlanıyor', en: 'Rounded back', es: 'Espalda redondeada' },
      text: { tr: 'Yere uzanmak için sırt kamburlaşır.', en: 'The back hunches to reach down.', es: 'La espalda se encorva para llegar abajo.' },
      fix: { tr: 'Önce uzat, sonra dön', en: 'Lengthen first, then twist', es: 'Primero alarga, luego gira' },
      fixText: { tr: 'Gerekirse daha yüksek blok kullan', en: 'Use a taller block if needed', es: 'Usa un bloque más alto si hace falta' },
      at: 'hold', pose: { lumbar: 16, thoracic: 30, neck: 12 }, view: { yaw: 90, pitch: 8 }, line: ['pelvis', 'waist', 'neck'], goodLine: ['pelvis', 'neck'], parts: ['waist', 'chest'] },
  ],
  cues: [{ tr: 'Kalçalar düz', en: 'Square hips', es: 'Cadera recta' },
    { tr: 'Önce uzat, sonra dön', en: 'Long spine, then twist', es: 'Columna larga, luego gira' },
    { tr: 'Arka topuğu yere bastır', en: 'Press the back heel down', es: 'Presiona el talón de atrás' }],
};
}
