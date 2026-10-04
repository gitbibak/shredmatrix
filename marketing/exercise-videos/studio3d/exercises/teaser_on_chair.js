/* Wunda Chair Teaser. Sitting on the floor facing the chair, legs long with the heels resting on the seat, hands holding
 * the pedal bar (pedal up). Pressing the pedal down with straight arms, she leans back ~30° and lifts the legs off the seat
 * into a V (legs ~60° above the floor); the legs lower back to the seat and the pedal rises under control.
 * - Pelvis on the floor (ground pelvis, anchored); legs straight, hip angle solved so the heels rest on the seat top (start).
 * - Pedal: `_teaserChair` draws the chair and puts the pedal bar in the right hand every frame (follow). The pedal angle is
 *   set per pose (_pedFix): start ~32° with the elbows bent (~75°, hands resting on the bar), V ~10° = pressed down by
 *   straightening the arms while leaning back.
 * - Spec "hip flexion 60 at the top" = the INCLUDED angle between trunk and legs in the V (measured flexion ~120°), which is
 *   consistent with trunk -30° and legs ~60° above the floor. */
{
const CH = [0.45, 0, 0], SEAT = 0.68, HINGE = [CH[0] - 0.32, 0.08], RP = 0.42, PADR = 0.03, D2R = Math.PI / 180;
const GRIP = 0.012, HEELX = 0.02;   // heels this far onto the seat (from its front edge)
// Wunda chair drawn like the engine's wundaChair, but the pedal end is placed right under the contact point every frame
// (angle AND length from the hinge, contact = pad top), so the hand/foot never leaves the pad, also between keys.
const padPt = (a, c) => [HINGE[0] - RP * Math.cos(a * D2R), HINGE[1] + RP * Math.sin(a * D2R) + c];
FB.PROPS._teaserChair = (sol) => {
  const { V } = FB, c = CH, H = 0.62, D = 0.6, W = 0.6, q = sol.J.handR;
  const out = [{ t: 'box', c: V.add(c, [0, H / 2, 0]), s: [D, H, W], m: 'woodLight', round: 0.02 }, { t: 'box', c: V.add(c, [0, H + 0.03, 0]), s: [D, 0.06, W], m: 'pad', round: 0.02 }];
  const hinge = [HINGE[0], HINGE[1], 0], dx = Math.max(0.03, HINGE[0] - q[0]), dy = Math.max(0.02, q[1] - (GRIP) - HINGE[1]);
  const a = Math.atan2(dy, dx), L = Math.hypot(dx, dy), end = V.add(hinge, [-Math.cos(a) * L, Math.sin(a) * L, 0]);
  out.push({ t: 'cyl', a: V.add(hinge, [0, 0, -W / 2 + 0.05]), b: V.add(hinge, [0, 0, W / 2 - 0.05]), r: 0.02, m: 'chrome' });
  out.push({ t: 'cyl', a: V.add(end, [0, 0, -W / 2 + 0.05]), b: V.add(end, [0, 0, W / 2 - 0.05]), r: 0.03, m: 'pad' });
  for (const sz of [-W / 2 + 0.05, W / 2 - 0.05]) out.push({ t: 'cyl', a: V.add(hinge, [0, 0, sz]), b: V.add(end, [0, 0, sz]), r: 0.014, m: 'chrome' });
  return out;
};
const CTX = { anchorX: ['pelvis'], anchorAt: [-0.6, 0] };
const BASE = { ground: [['pelvis', 0]], knee: 0, abd: 2, flat: false, ankle: -25, lumbar: 2, thoracic: 4, neck: 4,
  sh: 60, shAbd: 8, el: 8, handFlat: false, palm: 'down', curl: 0.85, elbowPole: [-0.4, -1, 0.5], noAvoid: true };
const P = (o) => Object.assign({}, BASE, o);
const RAW = {
  sit: P({ trunk: -14, _pedFix: 32 }),
  v: P({ trunk: -34, hip: 122, _pedFix: 10, lumbar: 6, thoracic: 6, neck: 10 }),
};
function fit(ex) {
  const { V, solve, expand } = FB;
  const poses = RAW;
  // start: hip angle so the heels rest on the seat; then place the pelvis so the heels rest HEELX onto the seat
  const s0 = (p, c) => solve(expand(Object.assign({}, p, { ik: undefined })), c || CTX);
  const sit = poses.sit;
  let lo = 60, hi = 175;
  for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; sit.hip = m; if (s0(sit).J.heelR[1] > SEAT) hi = m; else lo = m; }
  sit.hip = +((lo + hi) / 2).toFixed(2);
  const dx = (CH[0] - 0.3 + HEELX) - s0(sit).J.heelR[0];
  CTX.anchorAt = [+(CTX.anchorAt[0] + dx).toFixed(4), 0];
  const go = (p) => {
    const J = s0(p).J;
    const handAt = (a, z) => { const q = padPt(a, GRIP); return [q[0], q[1], z]; };
    const elb = (a) => { const t = solve(expand(Object.assign({}, p, { ik: { handL: { at: handAt(a, -0.2) }, handR: { at: handAt(a, 0.2) } } })), CTX).J;
      return 180 - Math.acos(Math.max(-1, Math.min(1, V.dot(V.norm(V.sub(t.shoulderR, t.elbowR)), V.norm(V.sub(t.wristR, t.elbowR)))))) / D2R; };
    let best = null;
    if (p._pedFix !== undefined) best = { a: p._pedFix, e: 0 };
    else for (let a = 0; a <= 75; a += 0.25) { const e = Math.abs(elb(a) - (p._elb || 8)); if (!best || e < best.e) best = { a, e }; }
    p._ped = best.a;
    p.ik = { handL: { at: handAt(best.a, -0.2) }, handR: { at: handAt(best.a, 0.2) } };
  };
  for (const k in poses) go(poses[k]);
  for (const m of ex.mistakes) { const mp = Object.assign({}, poses[m.at], m.pose); go(mp); m.pose.ik = mp.ik; }
  return poses;
}

window.EXERCISE = {
  id: 'teaser_on_chair',
  name: { tr: 'Chair\'de Teaser', en: 'Teaser on Chair', es: 'Teaser en la silla' },
  category: { tr: 'Wunda Chair · Karın', en: 'Wunda Chair · Abs', es: 'Wunda Chair · Abdomen' },
  equipmentLabel: { tr: 'Wunda chair · orta yay', en: 'Wunda chair · medium spring', es: 'Wunda chair · muelle medio' },
  muscles: ['core', 'quads', 'delts', 'triceps'],
  tempo: '2-0.5-2',
  view: { yaw: 90, pitch: 6, zoom: 1.0 },
  alt: { yaw: 35, pitch: 12, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Göğüs açık, bacaklar birlikte', en: 'Chest open, legs together', es: 'Pecho abierto, piernas juntas' } },
  setupView: { yaw: 45, pitch: 16 },
  props: [['_teaserChair', {}]],
  ctx: CTX,
  contacts: ['pelvis', 'heelL', 'heelR', 'handL', 'handR'],
  get poses() { return this._poses || (this._poses = fit(this)); },
  rest: 'sit',
  rep: [
    { to: 'v', dur: 2.0, phase: 0 },
    { to: 'v', dur: 0.5, phase: 1 },
    { to: 'sit', dur: 2.0, phase: 2 },
  ],
  setup: { tr: 'Sandalyeye dönük yere otur, topuklar oturakta. Eller pedalın çubuğunda, omurga uzun.',
    en: 'Sit on the floor facing the chair, heels on the seat. Hands on the pedal bar, long spine.',
    es: 'Sentada en el suelo frente a la silla, talones en el asiento. Manos en la barra del pedal.' },
  phases: [
    { name: { tr: 'V\'ye yüksel', en: 'Rise into the V', es: 'Sube a la V' }, breath: 'out',
      text: { tr: 'Pedalı aşağı bastır, hafifçe geriye yaslan ve bacakları V\'ye kaldır.', en: 'Press the pedal down, lean back slightly and lift the legs into a V.', es: 'Baja el pedal, inclínate un poco atrás y sube las piernas en V.' } },
    { name: { tr: 'V\'de dur', en: 'Hold the V', es: 'Mantén la V' }, breath: 'hold', arc: ['shoulderR', 'hipR', 'ankleR'],
      text: { tr: 'Göğüs açık, bel çökmez. Bacaklar uzun ve birlikte.', en: 'Chest open, lower back lifted. Legs long and together.', es: 'Pecho abierto, lumbar elevada. Piernas largas y juntas.' } },
    { name: { tr: 'Kontrollü in', en: 'Lower with control', es: 'Baja con control' }, breath: 'in',
      text: { tr: 'Bacakları oturağa indir; pedal yavaşça kalksın.', en: 'Lower the legs to the seat; let the pedal rise slowly.', es: 'Baja las piernas al asiento; el pedal sube despacio.' } },
  ],
  tempoText: { tr: '2 sn yüksel · 0,5 sn dur · 2 sn in', en: '2 s rise · 0.5 s hold · 2 s lower', es: '2 s sube · 0,5 s pausa · 2 s baja' },
  mistakes: [
    { title: { tr: 'Gövde geriye çöküyor', en: 'Collapsing back', es: 'Se hunde hacia atrás' },
      fix: { tr: 'Geriye yatma, uza', en: 'Don\'t lean back, lengthen', es: 'No te recuestes, alarga' },
      fixText: { tr: 'Oturma kemiklerinin üstünde kal, göğüs bacaklara uzansın', en: 'Stay on the sit bones, chest reaching to the legs', es: 'Sobre los isquiones, pecho hacia las piernas' },
      at: 'v', pose: { trunk: -42, lumbar: 22, thoracic: 18, neck: 18, hip: 90 }, line: ['pelvis', 'waist', 'neck'], parts: ['waist', 'chest'] },
    { title: { tr: 'Pedal kontrolsüz kalkıyor', en: 'Pedal slams up', es: 'El pedal sube de golpe' },
      fix: { tr: 'Pedalı kontrol et', en: 'Control the pedal', es: 'Controla el pedal' },
      fixText: { tr: 'Kollar uzun, pedal inişte de yavaş', en: 'Arms long, a slow pedal on the way back too', es: 'Brazos largos, pedal lento también al volver' },
      at: 'sit', pose: { trunk: 0, _pedFix: 72, shrug: 0.045, neck: 12 }, line: ['shoulderR', 'elbowR', 'handR'], marks: ['handR'], parts: ['fore', 'upper'] },
  ],
  cues: [{ tr: 'Karın içeride', en: 'Core engaged', es: 'Core activo' },
    { tr: 'Pedalı kontrol et', en: 'Control the pedal', es: 'Controla el pedal' },
    { tr: 'Göğüs açık, bacaklar uzun', en: 'Chest open, legs long', es: 'Pecho abierto, piernas largas' }],
};
}
