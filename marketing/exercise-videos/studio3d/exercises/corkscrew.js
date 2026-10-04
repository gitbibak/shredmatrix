/* Corkscrew (Pilates mat, supine; spec = the intermediate version: legs circle from vertical, pelvis rolls a little, no
 * full inversion). Solver setup from rollover.js / jackknife.js (approved):
 * - Every pose rests on [neck, head] (upper back / shoulder blades on the mat, the head only rests); shoulders anchored.
 * - Arms long beside the body, palms pressing: world IK targets on the mat, the same in every pose.
 * - fit() bisects the hip flexion so the legs point at _legs (thigh angle from the floor, 90 = vertical).
 * - Sideways sweep = both legs together: abd on the leading leg, the same amount of adduction on the other (_lat, + = to
 *   the character's RIGHT). The pelvis rolls slightly onto that side of the back (roll, + tips to the LEFT) while `twist`
 *   turns the chest back so the shoulders stay flat on the mat.
 * - Circle: centre (90) -> right & down (70, 30° lateral) -> bottom centre (40) -> left & up (85, 30° lateral, the pelvis
 *   lifts a little) -> centre. One direction is animated; the tempo card says to reverse. */
{
const G = [['neck', -0.006], ['head', 0.008]];
const BASE = { ground: G, trunk: -90, knee: 0, ankle: -30, flat: false, abd: 0, hrot: 2, palm: 'down', curl: 0.1,
  lumbar: 8, thoracic: 3, neck: 6, roll: 0, twist: 0, _lat: 0 };
const RAW = {
  up: { ...BASE, _legs: 90 },
  right: { ...BASE, lumbar: 10, _legs: 70, _lat: 30, roll: -9, twist: -9 },
  down: { ...BASE, lumbar: 4, _legs: 40 },
  left: { ...BASE, lumbar: 16, thoracic: 5, _legs: 85, _lat: -30, roll: 9, twist: 9 },
};
const CTX = { anchorX: ['shoulderL', 'shoulderR'], anchorAt: [-0.55, 0] };

function fit(poses, extra) {
  const { V, solve, expand } = FB;
  const S = (p) => solve(expand(p), CTX);
  const s0 = S({ ...poses.up, hip: 90 });
  const ik = {};
  for (const sd of ['L', 'R']) { const h = s0.J['shoulder' + sd]; ik['hand' + sd] = { at: [h[0] + 0.56, 0.03, h[2] + (sd === 'R' ? 0.06 : -0.06)] }; }
  const legs = (p) => {
    p.trunk = -90 - (p.lumbar + p.thoracic + p.neck);
    p.abdR = (p.abdR ?? 0) + p._lat; p.abdL = (p.abdL ?? 0) - p._lat;
    // sagittal leg angle from the floor (feet side = 0, vertical = 90), measured on the mid-thigh line projected on x/y
    const f = (hip) => { const J = S({ ...p, hip }).J; const d = V.sub(V.lerp(J.kneeR, J.kneeL, 0.5), V.lerp(J.hipR, J.hipL, 0.5)); return Math.atan2(d[1], d[0]) * 180 / Math.PI; };
    let lo = 0, hi = 180;
    for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (f(m) < p._legs) lo = m; else hi = m; }
    p.hip = +((lo + hi) / 2).toFixed(1);
  };
  for (const k in poses) { legs(poses[k]); poses[k].ik = ik; }
  for (const [at, pose] of extra) { const m = Object.assign({}, RAW_SRC[at], pose); legs(m); Object.assign(pose, { hip: m.hip, trunk: m.trunk, abdR: m.abdR, abdL: m.abdL, ik }); }
  return poses;
}
const RAW_SRC = JSON.parse(JSON.stringify(RAW));

window.EXERCISE = {
  id: 'corkscrew',
  name: { tr: 'Tirbuşon (Corkscrew)', en: 'Corkscrew', es: 'Sacacorchos (corkscrew)' },
  category: { tr: 'Pilates · Karın', en: 'Pilates · Core', es: 'Pilates · Core' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['obliques', 'core', 'adductors'],
  tempo: '1.5-1.5-2-1.5',
  tempoReps: 1,
  view: { yaw: 38, pitch: 20 },
  alt: { yaw: 90, pitch: 6, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
    text: { tr: 'Omuzlar ve kollar minderde sabit', en: 'Shoulders and arms stay on the mat', es: 'Hombros y brazos quietos en la esterilla' } },
  setupView: { yaw: 60, pitch: 18 },
  contacts: ['shoulderR', 'head', 'pelvis', 'handR', 'handL'],
  props: [['mat', { at: [-0.1, 0.006, 0], length: 2.0 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fit(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'up',
  rep: [
    { to: 'right', dur: 1.5, phase: 0 },
    { to: 'down', dur: 1.5, phase: 1 },
    { to: 'left', dur: 2.0, phase: 2 },
    { to: 'up', dur: 1.5, phase: 3 },
  ],
  setup: { tr: 'Sırtüstü yat, bacaklar bitişik ve tavana dik. Kollar yanda, avuçlar mindere bastırır.',
    en: 'Lie on your back, legs together straight up. Arms long by your sides, palms pressing down.',
    es: 'Boca arriba, piernas juntas hacia el techo. Brazos largos a los lados, palmas presionan el suelo.' },
  phases: [
    { name: { tr: 'Nefes al, sağa', en: 'Inhale, to the right', es: 'Inhala, a la derecha' }, breath: 'in',
      text: { tr: 'Bitişik bacaklar sağa ve aşağı kayar; pelvis sırtın sağına hafifçe yuvarlanır.', en: 'Legs together sweep right and down; the pelvis rolls slightly onto the right side.', es: 'Las piernas juntas van a la derecha y abajo; la pelvis rueda un poco a la derecha.' } },
    { name: { tr: 'Aşağıdan daire', en: 'Circle down', es: 'Círculo abajo' }, breath: 'in',
      text: { tr: 'Bacaklar ortadan aşağı iner; pelvis kaymaz, bel mindere yakın.', en: 'The legs circle down through the centre; the pelvis does not slide.', es: 'Las piernas bajan por el centro; la pelvis no se desliza.' } },
    { name: { tr: 'Nefes ver, sola ve yukarı', en: 'Exhale, left and up', es: 'Exhala, a la izquierda y arriba' }, breath: 'out',
      text: { tr: 'Bacaklar sola süpürülür; omurganın sol yanı üzerinden yuvarlan.', en: 'Sweep the legs to the left; roll through the left side of the spine.', es: 'Lleva las piernas a la izquierda; rueda por el lado izquierdo de la columna.' } },
    { name: { tr: 'Ortaya, tavana', en: 'Centre, to the ceiling', es: 'Al centro, al techo' }, breath: 'in',
      text: { tr: 'Bacaklar ortada tavana döner. Sonraki dairede yönü değiştir.', en: 'The legs return to the ceiling. Reverse the circle next time.', es: 'Las piernas vuelven al techo. Cambia el sentido en el siguiente.' } },
  ],
  tempoText: { tr: 'Daire başına ~6 sn · yönleri sırayla değiştir', en: '~6 s per circle · alternate directions', es: '~6 s por círculo · alterna el sentido' },
  mistakes: [
    { title: { tr: 'Bacaklar ayrılıyor', en: 'Legs separate', es: 'Las piernas se separan' },
      fix: { tr: 'İç bacakları sık', en: 'Squeeze the inner thighs', es: 'Aprieta el interior de los muslos' },
      fixText: { tr: 'Ayaklar bitişik, bacaklar tek parça gibi döner', en: 'Feet together; the legs circle as one', es: 'Pies juntos; las piernas giran como una' },
      at: 'right', pose: { abdL: 16, abdR: 4 }, view: { yaw: 0, pitch: 30 }, marks: ['ankleL', 'ankleR'], parts: ['thighL', 'shinL'] },
    { title: { tr: 'Omuzlar minderden kalkıyor', en: 'Shoulders lift off the mat', es: 'Los hombros se despegan' },
      fix: { tr: 'Kolları bastır, kaburgalar aşağı', en: 'Anchor the arms, ribs down', es: 'Ancla los brazos, costillas abajo' },
      fixText: { tr: 'Daire küçük; sadece pelvis yuvarlanır, omuzlar yerde', en: 'Smaller circle; only the pelvis rolls, shoulders down', es: 'Círculo menor; solo rueda la pelvis, hombros abajo' },
      at: 'right', pose: { roll: -16, twist: 0, pos: [0, 0.02, 0] }, view: { yaw: 155, pitch: 26 }, marks: ['shoulderL'], parts: ['chest', 'upperL'] },
  ],
  cues: [{ tr: 'Daireyi gövdenin merkezinden çiz', en: 'Circle the legs from your centre', es: 'Dibuja el círculo desde el centro' },
    { tr: 'Kollar bastırır, pelvis sabit', en: 'Arms press, pelvis anchored', es: 'Brazos presionan, pelvis anclada' },
    { tr: 'Omurganın üstünden yuvarlan, boyna değil', en: 'Roll over the spine, not onto the neck', es: 'Rueda sobre la columna, no el cuello' }],
};
}
