/* Hip Circles (Pilates mat, seated, leaning back on straight arms). One ground contact [pelvis] (sit bones), trunk reclined
 * 35° (trunk -35), legs together and straight, lifted ~45° from the mat (hip 100 = trunk-thigh angle).
 * Hands: world IK targets on the mat behind the hips, flat palms (weight-bearing; the engine points the fingers along the
 * thorax "up" projection = away from the body), same spot in every pose so they never slide. build() (lazy) places them
 * so the arms are nearly straight (wrist 98% of reach).
 * Leg circle: both legs shift together with abdR = -abdL (+ toward the side the legs travel), hip flexion lower at the
 * bottom of the circle. One circle = two half-circles (cards), each with a short in-between key (card:false, 0.6 s)
 * at the side point: right circle top -> R -> bottom -> L -> top, then reversed. Spec "hip_lateral_shift 25" = abd 25. */
{
const MAT = 0.012;
const BASE = { trunk: -35, lumbar: 0, thoracic: -4, neck: -6, knee: 0, ankle: -30, flat: false, hrot: 0, ground: [['pelvis', MAT]],
  sh: -40, shAbd: 10, el: 0, curl: 0.1, elbowPole: [-1, 0, 0.35] };
const leg = (hip, shift) => ({ hip, abdR: shift, abdL: -shift });   // + shift = legs travel to the character's right
const RAW = {
  top: Object.assign({}, BASE, leg(100, 0)),
  R: Object.assign({}, BASE, leg(90, 25)),
  bot: Object.assign({}, BASE, leg(78, 0)),
  L: Object.assign({}, BASE, leg(90, -25)),
};
const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };

function build(poses, extra) {
  const { V, solve, expand, BODY: B } = FB;
  const s = solve(expand(Object.assign({}, poses.top, { ik: undefined })), CTX);
  const reach = (B.upper + B.fore) * 0.995;                       // soft elbows (~10°): straight-looking arms
  const ik = {};
  for (const S of ['L', 'R']) {
    const sh = s.J['shoulder' + S];
    const at = (x) => [x, 0.03, sh[2] + (S === 'R' ? 0.05 : -0.05)];
    const dist = (x) => V.len(V.sub(solve(expand(Object.assign({}, poses.top, { ik: { ['hand' + S]: { at: at(x) } } })), CTX).J['wrist' + S], sh));
    let lo = sh[0] - 0.45, hi = sh[0] + 0.05;                      // palm far back (too far) .. under the shoulder (short)
    for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (dist(m) > reach) lo = m; else hi = m; }
    const x = (lo + hi) / 2;
    ik['hand' + S] = { at: at(x) };
  }
  for (const k in poses) poses[k].ik = ik;
  for (const [, pose] of extra) pose.ik = pose.ik || ik;
  return poses;
}

window.EXERCISE = {
  id: 'hip_circles',
  name: { tr: 'Kalça Daireleri (Hip Circles)', en: 'Hip Circles', es: 'Círculos de cadera (hip circles)' },
  category: { tr: 'Pilates · Karın', en: 'Pilates · Core', es: 'Pilates · Core' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['core', 'obliques', 'triceps'],
  tempo: '3-3',
  tempoReps: 1,
  view: { yaw: 18, pitch: 24 },
  alt: { yaw: 90, pitch: 6, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
    text: { tr: 'Gövde geride sabit, göğüs açık', en: 'Torso still and reclined, chest open', es: 'Tronco quieto y reclinado, pecho abierto' } },
  setupView: { yaw: 90, pitch: 8 },
  setupMarks: [{ type: 'aline', joints: ['wristR', 'shoulderR'] }],
  contacts: ['pelvis', 'handR', 'handL'],
  props: [['mat', { at: [0.05, 0, 0], length: 1.6, width: 0.8 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = build(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'top',
  rep: [
    { to: 'R', dur: 0.75, card: false },
    { to: 'bot', dur: 0.75, phase: 0 },
    { to: 'L', dur: 0.75, card: false },
    { to: 'top', dur: 0.75, phase: 1 },
    { to: 'L', dur: 0.75, card: false },
    { to: 'bot', dur: 0.75, phase: 2 },
    { to: 'R', dur: 0.75, card: false },
    { to: 'top', dur: 0.75, phase: 3 },
  ],
  setup: { tr: 'Geriye yaslan, eller kalçanın arkasında, parmaklar geriye. Bacaklar bitişik, mattan ~45° yukarıda.',
    en: 'Lean back, hands behind the hips, fingers pointing back. Legs together, ~45° off the mat.',
    es: 'Reclínate, manos detrás de la cadera, dedos hacia atrás. Piernas juntas, a ~45° del suelo.' },
  phases: [
    { name: { tr: 'Nefes al, sağa ve aşağı', en: 'Inhale, right and down', es: 'Inhala, a la derecha y abajo' }, breath: 'in',
      text: { tr: 'İki bacak birlikte sağa ve aşağı daire çizer. Gövde kıpırdamaz.', en: 'Both legs circle right and down together. The torso stays still.', es: 'Las piernas juntas giran a la derecha y abajo. El tronco quieto.' } },
    { name: { tr: 'Sola geç, yukarı çık', en: 'Across and up', es: 'Cruza y sube' }, breath: 'in',
      text: { tr: 'Aşağıdan sola geç ve ortada yukarı tamamla.', en: 'Sweep across to the left and finish up in the centre.', es: 'Cruza a la izquierda y termina arriba en el centro.' } },
    { name: { tr: 'Nefes ver, ters yön', en: 'Exhale, reverse', es: 'Exhala, al revés' }, breath: 'out',
      text: { tr: 'Şimdi önce sola ve aşağı. Eller mata bastırır.', en: 'Now left and down first. Hands press into the mat.', es: 'Ahora primero a la izquierda y abajo. Manos firmes.' } },
    { name: { tr: 'Sağdan yukarı', en: 'Right and up', es: 'Por la derecha, arriba' }, breath: 'out',
      text: { tr: 'Sağdan geçip ortada bitir. Göğüs açık kalır.', en: 'Come round the right and finish in the centre. Chest stays open.', es: 'Pasa por la derecha y termina al centro. Pecho abierto.' } },
  ],
  tempoText: { tr: '3 sn sağa daire · 3 sn sola daire', en: '3 s circle right · 3 s circle left', es: '3 s círculo derecha · 3 s izquierda' },
  mistakes: [
    { title: { tr: 'Kalça bacaklarla savruluyor', en: 'Pelvis swings with the legs', es: 'La pelvis se balancea' },
      text: { tr: 'Bacaklar yana gidince kalça da döner.', en: 'As the legs go to the side, the hips roll too.', es: 'Al ir las piernas al lado, la cadera rueda.' },
      fix: { tr: 'Daireyi küçült, karnı sık', en: 'Smaller circle, brace the abs', es: 'Círculo más pequeño, abdomen firme' },
      fixText: { tr: 'Sadece bacaklar çizer, kalça sabit', en: 'Only the legs draw; the pelvis stays still', es: 'Solo dibujan las piernas; pelvis quieta' },
      at: 'R', pose: { roll: -9, side: 10, yaw: 0, ground: [['pelvis', MAT + 0.004]] }, view: { yaw: 10, pitch: 18 }, line: ['hipL', 'hipR'], marks: ['hipL'], parts: ['pelvis', 'waist'] },
    { title: { tr: 'Omuzlar çöküyor', en: 'Shoulders collapse', es: 'Los hombros se hunden' },
      text: { tr: 'Göğüs çöker, omuzlar kulaklara kalkar.', en: 'The chest sinks and the shoulders rise to the ears.', es: 'El pecho se hunde y los hombros suben.' },
      fix: { tr: 'Elleri bastır, göğsü kaldır', en: 'Press the hands, lift the chest', es: 'Presiona las manos, eleva el pecho' },
      fixText: { tr: 'Kollar düz, omuzlar aşağı, göğüs açık', en: 'Arms straight, shoulders down, chest open', es: 'Brazos rectos, hombros abajo, pecho abierto' },
      at: 'top', pose: { trunk: -46, thoracic: 4, neck: 14, shrug: 0.05 }, view: { yaw: 90, pitch: 6 }, marks: ['shoulderR'], line: ['pelvis', 'waist', 'neck'], parts: ['chest', 'upper', 'neck'] },
  ],
  cues: [{ tr: 'Bacaklar çizer, gövde sabit', en: 'Legs draw the circle, trunk stays', es: 'Las piernas dibujan, el tronco quieto' },
    { tr: 'Elleri mata bastır', en: 'Press the hands down', es: 'Presiona las manos' },
    { tr: 'Göğsü kaldır', en: 'Lift the chest', es: 'Eleva el pecho' }],
};
}
