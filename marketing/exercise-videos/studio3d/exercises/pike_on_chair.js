/* Wunda Chair Pike. Facing the chair from the pedal side (+x toward the chair): hands flat on the front edge of the seat,
 * balls of both feet on the pedal, legs straight. Pressing the pedal down with the feet, the abdominals lift the hips into
 * a deep pike with the shoulders over the hands; the hips lower under control and the pedal rises again.
 * - Spec set-up text ("sit on the floor, feet on the seat, hands on the pedal") cannot produce its own "lift the hips into
 *   a pike pressing the pedal down" phase; the classical chair Pike (hands on the seat, feet on the pedal) is animated, which
 *   matches the spec's phases, pedal travel (~28 cm) and top-position angles (trunk ~40° from vertical-down, hip ~120°).
 * - Pedal: `_pikeChair` draws the chair and puts the pedal pad under the ball of the right foot every frame (follow). Per pose the hip angle is solved so the ball of the foot sits on the pedal
 *   pad at the chosen pedal angle (two ground contacts: ball on the pad height, hand on the seat), then the ankles are pinned.
 * - Hands: world IK targets, flat on the seat (0.68 m). */
{
const { V } = FB;
const CH = [0.45, 0, 0], SEAT = 0.68, HINGE = [CH[0] - 0.32, 0.08], RP = 0.42, PADR = 0.03, D2R = Math.PI / 180;
// Wunda chair drawn like the engine's wundaChair, but the pedal end is placed right under the contact point every frame
// (angle AND length from the hinge, contact = pad top), so the hand/foot never leaves the pad, also between keys.
const padPt = (a, c) => [HINGE[0] - RP * Math.cos(a * D2R), HINGE[1] + RP * Math.sin(a * D2R) + c];
FB.PROPS._pikeChair = (sol) => {
  const { V } = FB, c = CH, H = 0.62, D = 0.6, W = 0.6, q = sol.J.ballR;
  const out = [{ t: 'box', c: V.add(c, [0, H / 2, 0]), s: [D, H, W], m: 'woodLight', round: 0.02 }, { t: 'box', c: V.add(c, [0, H + 0.03, 0]), s: [D, 0.06, W], m: 'pad', round: 0.02 }];
  const hinge = [HINGE[0], HINGE[1], 0], dx = Math.max(0.03, HINGE[0] - q[0]), dy = Math.max(0.02, q[1] - (PADR + 0.004) - HINGE[1]);
  const a = Math.atan2(dy, dx), L = Math.hypot(dx, dy), end = V.add(hinge, [-Math.cos(a) * L, Math.sin(a) * L, 0]);
  out.push({ t: 'cyl', a: V.add(hinge, [0, 0, -W / 2 + 0.05]), b: V.add(hinge, [0, 0, W / 2 - 0.05]), r: 0.02, m: 'chrome' });
  out.push({ t: 'cyl', a: V.add(end, [0, 0, -W / 2 + 0.05]), b: V.add(end, [0, 0, W / 2 - 0.05]), r: 0.03, m: 'pad' });
  for (const sz of [-W / 2 + 0.05, W / 2 - 0.05]) out.push({ t: 'cyl', a: V.add(hinge, [0, 0, sz]), b: V.add(end, [0, 0, sz]), r: 0.014, m: 'chrome' });
  return out;
};
const HX = CH[0] - 0.24;
const HANDS = { ik: { handL: { at: [HX, SEAT + 0.022, -0.16] }, handR: { at: [HX, SEAT + 0.022, 0.16] } }, handFlat: true, handSurface: SEAT };
const CTX = { anchorX: ['handL', 'handR'], anchorAt: [HX, 0] };
const BASE = { trunk: 110, knee: 2, abd: 3, flat: false, ankle: 12, lumbar: 0, thoracic: 0, neck: -6, sh: 160, shAbd: 6, el: 3, noAvoid: true, ...HANDS };
const P = (o) => Object.assign({}, BASE, o);
const RAW = {
  low: P({ _ped: 48, hip: 75, sh: 115, neck: -10 }),
  pike: P({ _ped: 10, hip: 118, sh: 215, lumbar: 6, neck: 6 }),
};
function fit(poses, extra) {
  const { solve, expand } = FB;
  const go = (p) => {
    const B = padPt(p._ped, PADR + 0.004);
    const at = (t) => solve(expand(Object.assign({}, p, { hip: t, ground: [['ballR', B[1]], ['handR', SEAT]], ik: { handL: p.ik.handL, handR: p.ik.handR } })), CTX);
    // two contacts rotate the body rigidly; scan the hip angle so the ball lands on the pad (x)
    let best = null;
    for (let t = 20; t <= 170; t += 0.25) { const s = at(t), e = Math.abs(s.J.ballR[0] - B[0]); if (!best || e < best.e) best = { t, e, s }; }
    const s = best.s;
    p.hip = best.t; p.ground = [['ballR', B[1]], ['handR', SEAT]]; p._err = +best.e.toFixed(4);
    p.ik = { handL: p.ik.handL, handR: p.ik.handR, ankleL: { at: s.J.ankleL.slice(), foot: s.F.footL.map((c) => c.slice()) }, ankleR: { at: s.J.ankleR.slice(), foot: s.F.footR.map((c) => c.slice()) } };
  };
  for (const k in poses) go(poses[k]);
  for (const [at, pose] of extra) { const m = Object.assign({}, poses[at], pose); go(m); Object.assign(pose, { hip: m.hip, ground: m.ground, ik: m.ik }); }
  return poses;
}

window.EXERCISE = {
  id: 'pike_on_chair',
  name: { tr: 'Chair\'de Pike', en: 'Pike on Chair', es: 'Pike en la silla' },
  category: { tr: 'Wunda Chair · Karın ve omuz', en: 'Wunda Chair · Abs & shoulders', es: 'Wunda Chair · Abdomen y hombros' },
  equipmentLabel: { tr: 'Wunda chair · orta yay', en: 'Wunda chair · medium spring', es: 'Wunda chair · muelle medio' },
  muscles: ['core', 'delts', 'triceps', 'hamstrings'],
  tempo: '2-0.5-2',
  view: { yaw: 90, pitch: 6, zoom: 1.0 },
  alt: { yaw: 30, pitch: 12, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Omuzlar bileklerin üstünde, pedal kontrollü', en: 'Shoulders over the wrists, pedal under control', es: 'Hombros sobre las muñecas, pedal controlado' } },
  setupView: { yaw: 45, pitch: 16 },
  props: [['_pikeChair', {}]],
  ctx: CTX,
  contacts: ['handL', 'handR', 'ballL', 'ballR'],
  get poses() { return this._poses || (this._poses = fit(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'low',
  rep: [
    { to: 'pike', dur: 2.0, phase: 0 },
    { to: 'pike', dur: 0.5, phase: 1 },
    { to: 'low', dur: 2.0, phase: 2 },
  ],
  setup: { tr: 'Eller oturağın ön kenarında, ayak ön tabanları pedalda. Bacaklar uzun, karın içeride.',
    en: 'Hands on the front edge of the seat, balls of the feet on the pedal. Legs long, abs drawn in.',
    es: 'Manos en el borde del asiento, metatarsos en el pedal. Piernas largas, abdomen adentro.' },
  phases: [
    { name: { tr: 'Kalçayı kaldır', en: 'Lift into the pike', es: 'Sube al pike' }, breath: 'out',
      text: { tr: 'Karınla kalçayı yukarı çek, ayaklar pedalı bastırır. Omuzlar bileklerin üstünde.', en: 'Lift the hips with the abs; the feet press the pedal down. Shoulders over the wrists.', es: 'Sube la cadera con el abdomen; los pies bajan el pedal. Hombros sobre las muñecas.' } },
    { name: { tr: 'Tepede dur', en: 'Pause at the top', es: 'Pausa arriba' }, breath: 'hold', arc: ['shoulderR', 'hipR', 'ankleR'],
      text: { tr: 'Derin bir V. Bacaklar uzun, baş kolların arasında.', en: 'A deep V. Legs long, head between the arms.', es: 'Una V profunda. Piernas largas, cabeza entre los brazos.' } },
    { name: { tr: 'Kontrollü in', en: 'Lower with control', es: 'Baja con control' }, breath: 'in',
      text: { tr: 'Kalçayı yavaşça indir; pedal sessizce kalksın, çarpmasın.', en: 'Lower the hips slowly; let the pedal rise quietly, no banging.', es: 'Baja la cadera despacio; el pedal sube sin golpe.' } },
  ],
  tempoText: { tr: '2 sn yukarı · 0,5 sn dur · 2 sn aşağı', en: '2 s up · 0.5 s pause · 2 s down', es: '2 s arriba · 0,5 s pausa · 2 s abajo' },
  mistakes: [
    { title: { tr: 'Pedal kontrolsüz kalkıyor', en: 'Pedal slams up', es: 'El pedal sube de golpe' },
      fix: { tr: 'Pedalı kontrol et', en: 'Control the pedal', es: 'Controla el pedal' },
      fixText: { tr: 'İnişte karın çalışmaya devam eder', en: 'Keep the abs working on the way down', es: 'El abdomen sigue activo al bajar' },
      at: 'low', pose: { _ped: 62, hip: 60, sh: 140, lumbar: -10, neck: -14 }, line: ['shoulderR', 'hipR', 'ankleR'], marks: ['ankleR'], parts: ['waist', 'pelvis'] },
    { title: { tr: 'Omuzlar çöküyor', en: 'Shoulders sink', es: 'Los hombros se hunden' },
      fix: { tr: 'Oturağı it', en: 'Push the seat away', es: 'Empuja el asiento' },
      fixText: { tr: 'Kürek kemikleri geniş, boyun uzun', en: 'Shoulder blades wide, long neck', es: 'Escápulas anchas, cuello largo' },
      at: 'pike', pose: { shrug: 0.05, sh: 168, thoracic: -8, neck: -16 }, line: ['shoulderR', 'head'], marks: ['shoulderR'], parts: ['neck', 'upper'] },
  ],
  cues: [{ tr: 'Karın içeride', en: 'Core engaged', es: 'Core activo' },
    { tr: 'Pedalı kontrol et', en: 'Control the pedal', es: 'Controla el pedal' },
    { tr: 'Omuzlar bileklerin üstünde', en: 'Shoulders over the wrists', es: 'Hombros sobre las muñecas' }],
};
}
