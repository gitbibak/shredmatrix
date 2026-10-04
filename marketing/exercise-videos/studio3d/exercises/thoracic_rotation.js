/* Thoracic Spine Rotation (Open Book). Side-lying on the RIGHT side, hips and knees at 90° and stacked, arms forward at
 * shoulder height with the palms together, head on a folded pillow -> the top (left) arm opens up and back like a book, chest
 * and gaze follow, knees and pelvis stay -> close.
 * - Side-lying base as side_kick_front_back.js / clam_shell.js: trunk 90 rolled -90, body along +x (head), chest facing -z;
 *   two ground contacts [hipR, shoulderR]; pelvis anchored.
 * - Rotation = `twist` (+ = chest toward the character's left = up here); the engine splits it over lumbar and thorax.
 * - Bottom (right) hand: world IK target on the mat in front of the chest, fixed in every pose (palm up).
 *   Top (left) hand: body-relative target holdL on a sphere about the left shoulder (straight arm, soft elbow): forward
 *   (palms together) -> straight up over the shoulder (in-between key, `card: false`) -> 120° horizontal abduction (the hand
 *   travels on an arc toward the mat behind). headTurn makes the eyes follow the hand.
 * - Head: as the chest opens, the two-contact solver keeps the bottom shoulder on the mat and the spine axis drops ~14 cm
 *   (the thorax rolls onto its back). A real neck side-bends to keep the head on the pillow; the engine has no lateral neck
 *   flexion, so the head is lifted with neck flexion 25 (chin slightly in, gaze still follows the hand) and the soft pillow
 *   (_pillow, follows the head) compresses the remaining ~7 cm.
 * - Mistakes start from the closed pose with the book half open (hold 80°) so the arm sweep in the mistake chapter stays slow.
 *   'Rotating from the low back': pelvis rolled back 14° (abdR -14 / abdL +5 keep the stacked legs on the mat).
 * Spec: thoracic rotation 65, horizontal abduction of the top arm 120, head rotation 50, hips/knees 90. */
{
const G = [['hipR', 0.006], ['shoulderR', 0.006]];
const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };
const SHL = [0.022, 0.11, 0.168];   // left shoulder in the chest frame (rig), [fwd, up, outward]
const ARM = 0.556;                    // shoulder -> hand target (soft elbow)
const hold = (deg) => { const a = deg * Math.PI / 180; return [SHL[0] + ARM * Math.cos(a), SHL[1], 0.168 + ARM * Math.sin(a)]; };
const BASE = { trunk: 90, roll: -90, ground: G, flat: false, neck: 0, hip: 90, knee: 90, abdL: -6, abdR: 0, ankle: -15,
  elbowPoleL: [0, -1, 0], elbowPoleR: [0, -1, 0.3], palmR: 'up', curlR: 0.2, curlL: 0.2, palmL: 'down', handFlatR: false, noAvoid: true };
const RAW = {
  closed: { ...BASE, twist: 0, headTurn: 0, holdL: hold(0) },
  up: { ...BASE, twist: 32, headTurn: 25, neck: 12, holdL: hold(90), palmL: 'forward' },
  open: { ...BASE, twist: 65, headTurn: 50, neck: 25, holdL: hold(120), palmL: 'up' },
};

function fit(poses, mistakes) {
  const { V, M, solve, expand } = FB;
  const S = (p) => solve(expand(Object.assign({}, p, { ik: undefined })), CTX);
  // bottom hand: palm up on the mat, straight ahead of the bottom shoulder (fixed spot)
  const s0 = S(poses.closed);
  const hR = [s0.J.shoulderR[0] + 0.02, 0.006 + 0.032, s0.J.shoulderR[2] - 0.556];
  // the bottom shoulder travels ~14 cm back as the thorax turns about its axis; the palm follows 60 % of it (a short slide on
  // the mat) so the bottom elbow only softens instead of folding
  const at = (p) => { const z = S(p).J.shoulderR[2]; return { handR: { at: [hR[0], hR[1], hR[2] + 0.6 * (z - s0.J.shoulderR[2])] } }; };
  for (const k in poses) poses[k].ik = at(poses[k]);
  for (const m of mistakes) m.pose.ik = at(Object.assign({}, poses[m.at], m.pose));
  // closed: top hand resting on the bottom hand (palms together) -> body-relative target of the same point
  const T = s0.F.thorax, d = V.sub(V.add(hR, [0, 0.045, 0]), s0.J.chest);
  const q = [V.dot(d, T[0]), V.dot(d, T[1]), -V.dot(d, T[2])], r = V.sub(q, SHL), L = V.len(r);
  poses.closed.holdL = V.add(SHL, V.mul(r, Math.min(1, ARM / L)));   // same soft elbow as the other keys (no straight-arm snap)
  return poses;
}
// soft pillow: its top follows the side of the head (fitted to the closed pose; it compresses ~7 cm when the head rolls back
// in the open position, see header)
FB.PROPS._pillow = (sol) => { const hd = sol.J.head, h = Math.max(0.03, Math.min(0.16, hd[1] - 0.105 - 0.006));
  return FB.PROPS.blanket(null, { at: [hd[0] + 0.02, 0.006 + h / 2 - 0.03, -0.03], size: [0.3, h, 0.38] }); };

window.EXERCISE = {
  id: 'thoracic_rotation',
  name: { tr: 'Torakal Rotasyon (Open Book)', en: 'Thoracic Rotation (Open Book)', es: 'Rotación torácica (open book)' },
  category: { tr: 'Pilates · Mobilite', en: 'Pilates · Mobility', es: 'Pilates · Movilidad' },
  equipmentLabel: { tr: 'Mat · Yastık', en: 'Mat · Pillow', es: 'Esterilla · Cojín' },
  muscles: ['upperback', 'obliques', 'chest'],
  side: 'L',
  tempo: '3-3',
  view: { yaw: -115, pitch: 34 },
  alt: { yaw: -90, pitch: 70, title: { tr: 'Üstten bak', en: 'Top view', es: 'Vista superior' },
    text: { tr: 'Kol kitap kapağı gibi açılır, dizler üst üste', en: 'The arm opens like a book cover, knees stacked', es: 'El brazo se abre como un libro, rodillas juntas' } },
  setupView: { yaw: -70, pitch: 24 },
  setupMarks: [{ type: 'aline', joints: ['kneeL', 'kneeR'] }],
  contacts: ['shoulderR', 'hipR', 'kneeR', 'handR', 'head'],
  get props() { void this.poses; return [['mat', { at: [0.1, 0.006, -0.2], length: 1.7, width: 0.9 }], ['_pillow']]; },
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fit(RAW, this.mistakes)); },
  rest: 'closed',
  rep: [
    { to: 'up', dur: 1.5, phase: 0, ease: 'in' },
    { to: 'open', dur: 1.5, phase: 0, card: false, ease: 'out' },
    { to: 'up', dur: 1.5, phase: 1, ease: 'in' },
    { to: 'closed', dur: 1.5, phase: 1, card: false, ease: 'out' },
  ],
  setup: { tr: 'Sağ yanına uzan, başın yastıkta. Kalça ve dizler 90°, üst üste. Kollar önde, avuçlar birleşik. Sonra taraf değiştir.',
    en: 'Lie on your right side, head on a pillow. Hips and knees at 90°, stacked. Arms forward, palms together. Then switch.',
    es: 'Túmbate sobre el lado derecho, cabeza en un cojín. Cadera y rodillas a 90°. Brazos al frente, palmas juntas. Luego cambia.' },
  phases: [
    { name: { tr: 'Kitabı aç', en: 'Open the book', es: 'Abre el libro' }, breath: 'out', slow: 1.3, line: ['kneeL', 'kneeR'],
      text: { tr: 'Nefes ver, üst kolu yukarı ve geriye aç. Göğüs ve bakış eli izler, dizler sabit.', en: 'Exhale, open the top arm up and back. Chest and eyes follow; knees stay.', es: 'Exhala, abre el brazo arriba y atrás. Pecho y mirada lo siguen; rodillas quietas.' } },
    { name: { tr: 'Kitabı kapat', en: 'Close the book', es: 'Cierra el libro' }, breath: 'in', slow: 1.3,
      text: { tr: 'Nefes al, kolu aynı yoldan öne getir, avuçlar buluşsun.', en: 'Inhale, bring the arm back the same way until the palms meet.', es: 'Inhala, vuelve el brazo por el mismo camino hasta juntar las palmas.' } },
  ],
  tempoText: { tr: '3 sn aç · 3 sn kapat', en: '3 s open · 3 s close', es: '3 s abre · 3 s cierra' },
  mistakes: [
    { title: { tr: 'Dizler açılıyor', en: 'Knees fly open', es: 'Las rodillas se abren' },
      text: { tr: 'Üst diz kalkar, dönüş kalçaya kaçar.', en: 'The top knee lifts and the turn leaks into the hips.', es: 'La rodilla de arriba sube y el giro se va a la cadera.' },
      fix: { tr: 'Dizler arasına yastık sıkıştır', en: 'Squeeze a pillow between the knees', es: 'Aprieta un cojín entre las rodillas' },
      fixText: { tr: 'Dizler üst üste, sadece göğüs döner', en: 'Knees stacked, only the chest turns', es: 'Rodillas juntas, solo gira el pecho' },
      at: 'closed', pose: { abdL: 26, hrotL: 22, twist: 30, headTurn: 20, holdL: hold(80) }, marks: ['kneeL'], line: ['kneeL', 'kneeR'], parts: ['thighL'] },
    { title: { tr: 'Dönüş belden geliyor', en: 'Rotating from the low back', es: 'Gira desde la lumbar' },
      text: { tr: 'Leğen geriye devrilir, göğüs az döner.', en: 'The pelvis rolls back and the chest barely turns.', es: 'La pelvis rueda atrás y el pecho apenas gira.' },
      fix: { tr: 'Leğeni sabitle, belin üstünden dön', en: 'Fix the pelvis, turn above the waist', es: 'Fija la pelvis, gira sobre la cintura' },
      fixText: { tr: 'Kalçalar üst üste, kaburgalar açılır', en: 'Hips stacked, the ribs open', es: 'Caderas apiladas, se abren las costillas' },
      at: 'closed', pose: { roll: -76, twist: 22, abdR: -14, abdL: 5, headTurn: 20, holdL: hold(80) }, view: { yaw: -35, pitch: 30 }, marks: ['hipL'], line: ['hipL', 'hipR'], parts: ['pelvis', 'waist'] },
  ],
  cues: [{ tr: 'Kaburgalardan dön', en: 'Rotate from the ribs', es: 'Gira desde las costillas' },
    { tr: 'Dizler üst üste', en: 'Knees stay stacked', es: 'Rodillas juntas' },
    { tr: 'Gözler eli izler', en: 'Eyes follow the hand', es: 'La mirada sigue la mano' }],
};
}
