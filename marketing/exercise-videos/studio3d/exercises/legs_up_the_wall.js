/* Legs Up the Wall (Viparita Karani). Lying with the hips near a wall, knees bent and soles on the wall -> straighten the legs
 * up the wall -> rest -> bend the knees back down.
 * - Entry simplified: the spec's "sit sideways and swing the legs up" needs a body yaw turn while lying, which the sagittal
 *   2-contact solver cannot follow; the setup text describes it and the video starts from the soles on the wall.
 * - Every pose rests on the same two ground contacts [shoulderR, pelvis]. Wall prop: surface at WALL (the box occupies
 *   [x - 0.1, x]; here a compact panel _wallPanel). fitWall() (lazy, after the rig sets FB.BODY) bisects: hold -> hip so the heels touch the wall;
 *   start -> hip so the balls of the feet touch the wall and ankle so the soles are vertical; the neck so the head rests on
 *   the mat. Hands have the same world targets in every pose (arms ~40° out, palms up on the mat).
 * - Mistake "hips too far": the whole body shifts away from the wall (pos) and the hip is re-fitted so the heels still reach it. */
{
const MAT = 0.012;
const WALL = 0.2;                                 // wall surface x (hips ~10-15 cm away)
// compact wall section (the stock 2.6 m wall dominated the auto-framing and hid the body in 3/4 views)
FB.PROPS._wallPanel = () => [{ t: 'box', c: [WALL + 0.03, 0.66, 0], s: [0.06, 1.32, 1.1], m: 'wall' }];
const G = [['shoulderR', MAT + 0.03], ['pelvis', MAT]];
const BASE = { trunk: -90, ground: G, flat: false, abd: 3, hrot: 6, handFlat: false, palm: 'up', curl: 0.3, sh: 0, shAbd: 40, el: 10,
  thoracic: 0, lumbar: 0, elbowPole: [-0.3, -1, 0.3], pos: [0, 0, 0] };   // pos in every pose: an array missing on one side would snap
const RAW = {
  start: { ...BASE, hip: 120, knee: 100, ankle: 0 },
  up: { ...BASE, hip: 88, knee: 2, ankle: -8 },
};
const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };

function fitWall(poses, extra) {
  const { solve, expand } = FB;
  const S = (p) => solve(expand(Object.assign({}, p, { ik: undefined })), CTX).J;
  const bis = (p, key, f, lo, hi) => { const up = f(hi) > f(lo);
    for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if ((f(m) > 0) === up) hi = m; else lo = m; } p[key] = +((lo + hi) / 2).toFixed(2); };
  const heelOn = (p) => bis(p, 'hip', (v) => S({ ...p, hip: v }).heelR[0] - (WALL - 0.012), 50, 110);
  heelOn(poses.up);
  const st = poses.start;
  for (let k = 0; k < 4; k++) {
    bis(st, 'ankle', (v) => { const J = S({ ...st, ankle: v }); return J.toeR[0] - J.heelR[0]; }, -60, 60);
    bis(st, 'hip', (v) => S({ ...st, hip: v }).ballR[0] - (WALL - 0.008), 60, 150);
  }
  for (const p of [st, poses.up]) bis(p, 'neck', (v) => S({ ...p, neck: v }).head[1] - (MAT + 0.1), -30, 40);
  const J = S(poses.up), fl = (s) => [J['hand' + s][0], MAT + 0.035, J['hand' + s][2]];
  const ik = { handL: { at: fl('L') }, handR: { at: fl('R') } };
  st.ik = ik; poses.up.ik = ik;
  for (const [at, pose] of extra) { if (!pose.pos || !pose.pos[0]) continue; const m = Object.assign({}, poses[at], pose); heelOn(m); pose.hip = m.hip;
    pose.ik = { handL: { at: [ik.handL.at[0] + pose.pos[0], ik.handL.at[1], ik.handL.at[2]] }, handR: { at: [ik.handR.at[0] + pose.pos[0], ik.handR.at[1], ik.handR.at[2]] } }; }
  return poses;
}

window.EXERCISE = {
  id: 'legs_up_the_wall',
  name: { tr: 'Bacaklar Duvarda (Viparita Karani)', en: 'Legs Up the Wall', es: 'Piernas en la pared' },
  category: { tr: 'Yoga · Restoratif', en: 'Yoga · Restorative', es: 'Yoga · Restaurativo' },
  equipmentLabel: { tr: 'Mat, duvar', en: 'Mat, wall', es: 'Esterilla, pared' },
  muscles: ['hamstrings', 'lowerback'],
  tempo: '5-10-5',
  hold: true, holdDur: 3,
  view: { yaw: 270, pitch: 8 },               // side view from the left: the engine's intro swings in from yaw-38, i.e. from the head side, not through the wall
  alt: { yaw: 215, pitch: 22, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Kollar yana açık, avuçlar yukarı, gözler kapalı', en: 'Arms out, palms up, eyes closed', es: 'Brazos abiertos, palmas arriba, ojos cerrados' } },
  setupView: { yaw: 225, pitch: 20 },
  contacts: ['pelvis', 'shoulderR', 'ballR', 'ballL'],
  props: [['mat', { at: [-0.55, 0, 0], length: 1.5, width: 0.75 }], ['_wallPanel']],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fitWall(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'start',
  rep: [
    { to: 'up', dur: 4.0, phase: 0 },
    { to: 'up', dur: 1.0, phase: 1 },
    { to: 'start', dur: 4.0, phase: 2 },
  ],
  setup: { tr: 'Yan oturup kalçayı duvara yasla, sırtüstü uzanırken bacakları duvara al. Kalça duvara yakın.',
    en: 'Sit sideways to the wall, then lie back and swing the legs up. Hips close to the wall.',
    es: 'Siéntate de lado a la pared, túmbate y sube las piernas. Cadera cerca de la pared.' },
  phases: [
    { name: { tr: 'Bacakları uzat', en: 'Straighten the legs', es: 'Estira las piernas' }, breath: 'out', slow: 1.0,
      text: { tr: 'Nefes verirken bacakları duvar boyunca yukarı uzat.', en: 'Exhale and slide the legs up the wall.', es: 'Exhala y desliza las piernas pared arriba.' } },
    { name: { tr: 'Dinlen', en: 'Rest', es: 'Descansa' }, breath: 'easy', line: ['pelvis', 'hipR', 'ankleR'],
      text: { tr: 'Topuklar duvarda, bacaklar ağır. Yavaş karın nefesi.', en: 'Heels on the wall, legs heavy. Slow belly breathing.', es: 'Talones en la pared, piernas pesadas. Respiración lenta.' } },
    { name: { tr: 'Yavaşça in', en: 'Come down slowly', es: 'Baja despacio' }, breath: 'in', slow: 1.0,
      text: { tr: 'Dizleri bük, yana dön ve yavaşça otur.', en: 'Bend the knees, roll to one side, sit up slowly.', es: 'Flexiona las rodillas, gira de lado y siéntate.' } },
  ],
  tempoText: { tr: '5 sn çık · 5-15 dk dinlen · 5 sn in', en: '5 s up · rest 5-15 min · 5 s down', es: '5 s arriba · 5-15 min · 5 s abajo' },
  mistakes: [
    { title: { tr: 'Kalça duvardan uzak', en: 'Hips too far from the wall', es: 'Cadera lejos de la pared' },
      text: { tr: 'Bacaklar geriye yatar, arka bacak çekilir.', en: 'The legs lean back and the hamstrings tug.', es: 'Las piernas se inclinan y tiran los isquios.' },
      fix: { tr: 'Kalçayı duvara yaklaştır', en: 'Scoot the hips closer', es: 'Acerca la cadera' },
      fixText: { tr: 'Kalça duvardan 5-15 cm; gerekirse dizleri bük', en: 'Hips 5-15 cm from the wall; bend the knees if needed', es: 'Cadera a 5-15 cm; flexiona rodillas si hace falta' },
      at: 'up', pose: { pos: [-0.24, 0, 0] }, marks: ['pelvis'], line: ['pelvis', 'heelR'], parts: ['thigh'] },
    { title: { tr: 'Dizler kilitli', en: 'Locked knees', es: 'Rodillas bloqueadas' },
      text: { tr: 'Dizler geriye itilir, bacaklar gergin.', en: 'The knees push back and the legs strain.', es: 'Las rodillas se empujan atrás y las piernas se tensan.' },
      fix: { tr: 'Dizleri yumuşat', en: 'Soften the knees', es: 'Suaviza las rodillas' },
      fixText: { tr: 'Bacaklar ağır ve rahat; uyluklara kemer takılabilir', en: 'Legs heavy and easy; a strap around the thighs helps', es: 'Piernas pesadas y sueltas; una correa en los muslos ayuda' },
      at: 'up', pose: { knee: -7, ankle: 14 }, view: { yaw: 245, pitch: 10 }, marks: ['kneeL'], parts: ['thigh', 'shin'] },
  ],
  cues: [{ tr: 'Kalça duvara yakın', en: 'Hips close to the wall', es: 'Cadera cerca de la pared' },
    { tr: 'Bacaklar ağır', en: 'Let the legs be heavy', es: 'Piernas pesadas' },
    { tr: 'Uzun nefes ver', en: 'Long exhales', es: 'Exhalaciones largas' }],
};
}
