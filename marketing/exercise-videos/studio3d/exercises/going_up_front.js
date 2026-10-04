/* Wunda Chair Going Up Front. Facing the chair: RIGHT foot flat on the seat (near the camera), LEFT foot (ball) on the
 * pedal, hands on the hips. Pressing through the seat leg she rises tall; the back leg lengthens and the pedal rises with
 * the left foot; she resists the springs back down.
 * - Seat foot: anchorX ankleR + flat heel on the seat top (0.68 m) -> fixed.
 * - Pedal foot: per pose the left-hip angle is solved so the ball of the foot lies on the pedal pad circle around the
 *   hinge; the ankle is pinned (pose.ik). `_gufChair` draws the chair and puts the pedal pad under the left ball every
 *   frame (follow). The pedal is 52 cm long (Balanced Body; the engine's chair has 42 cm) so the back foot can stay on it
 *   when she stands up.
 * - Seat 68 cm high (engine chair; spec estimate 38-40 cm). Top: seat knee ~15° (spec 5°; straighter lifts the back foot off
 *   the pedal), back leg long, foot pointed. Start: seat knee ~98°, hip ~92° (spec 90/80). */
{
const CH = [0.45, 0, 0], SEAT = 0.68, HINGE = [CH[0] - 0.32, 0.08], RP = 0.52, PADR = 0.03, D2R = Math.PI / 180;
const C = PADR + 0.004;
// Wunda chair drawn like the engine's wundaChair, but the pedal end is placed right under the contact point every frame
// (angle AND length from the hinge, contact = pad top), so the hand/foot never leaves the pad, also between keys.
const padPt = (a, c) => [HINGE[0] - RP * Math.cos(a * D2R), HINGE[1] + RP * Math.sin(a * D2R) + c];
FB.PROPS._gufChair = (sol) => {
  const { V } = FB, c = CH, H = 0.62, D = 0.6, W = 0.6, q = sol.J.ballL;
  const out = [{ t: 'box', c: V.add(c, [0, H / 2, 0]), s: [D, H, W], m: 'woodLight', round: 0.02 }, { t: 'box', c: V.add(c, [0, H + 0.03, 0]), s: [D, 0.06, W], m: 'pad', round: 0.02 }];
  const hinge = [HINGE[0], HINGE[1], 0], dx = Math.max(0.03, HINGE[0] - q[0]), dy = Math.max(0.02, q[1] - (C) - HINGE[1]);
  const a = Math.atan2(dy, dx), L = Math.hypot(dx, dy), end = V.add(hinge, [-Math.cos(a) * L, Math.sin(a) * L, 0]);
  out.push({ t: 'cyl', a: V.add(hinge, [0, 0, -W / 2 + 0.05]), b: V.add(hinge, [0, 0, W / 2 - 0.05]), r: 0.02, m: 'chrome' });
  out.push({ t: 'cyl', a: V.add(end, [0, 0, -W / 2 + 0.05]), b: V.add(end, [0, 0, W / 2 - 0.05]), r: 0.03, m: 'pad' });
  for (const sz of [-W / 2 + 0.05, W / 2 - 0.05]) out.push({ t: 'cyl', a: V.add(hinge, [0, 0, sz]), b: V.add(end, [0, 0, sz]), r: 0.014, m: 'chrome' });
  return out;
};
const CTX = { anchorX: ['ankleR'], anchorAt: [CH[0] - 0.235, 0.1] };
const HANDS = { holdL: [-0.02, -0.25, 0.165], holdR: [-0.02, -0.25, 0.165], elbowPole: [-0.5, -0.2, 1], curl: 0.3, palm: 'in' };
const BASE = { ground: [['heelR', SEAT]], flatR: true, flatL: false, abd: 2, lumbar: 0, thoracic: 0, neck: 2, ...HANDS };
const P = (o) => Object.assign({}, BASE, o);
const RAW = {
  low: P({ trunk: 12, hipR: 92, kneeR: 98, kneeL: 12, ankleL: -15 }),
  up: P({ trunk: 5, hipR: 12, kneeR: 15, kneeL: 2, ankleL: -62 }),
};
function fit(poses, extra) {
  const { V, solve, expand } = FB;
  const go = (p) => {
    const at = (h) => solve(expand(Object.assign({}, p, { hipL: h, ik: undefined })), CTX);
    let best = null;
    for (let h = -70; h <= 70; h += 0.1) {
      const s = at(h), b = s.J.ballL, e = Math.abs(Math.hypot(b[0] - HINGE[0], b[1] - C - HINGE[1]) - RP);
      if (b[0] < HINGE[0] - 0.03 && b[1] > HINGE[1] + C + 0.03 && (!best || e < best.e)) best = { h, e, s };
    }
    p.hipL = +best.h.toFixed(2); p._err = +best.e.toFixed(4);
    p.ik = { ankleL: { at: best.s.J.ankleL.slice(), foot: best.s.F.footL.map((c) => c.slice()) } };
  };
  for (const k in poses) go(poses[k]);
  for (const [at, pose] of extra) { const m = Object.assign({}, poses[at], pose); go(m); Object.assign(pose, { hipL: m.hipL, ik: m.ik }); }
  return poses;
}

window.EXERCISE = {
  id: 'going_up_front',
  name: { tr: 'Going Up Front (Öne Çıkış)', en: 'Going Up Front', es: 'Subir de frente' },
  category: { tr: 'Wunda Chair · Bacak ve kalça', en: 'Wunda Chair · Legs & glutes', es: 'Wunda Chair · Piernas y glúteos' },
  equipmentLabel: { tr: 'Wunda chair · 1 üst + 1 alt yay', en: 'Wunda chair · 1 top + 1 bottom spring', es: 'Wunda chair · 1 muelle arriba + 1 abajo' },
  muscles: ['quads', 'glutes', 'hamstrings', 'core'],
  side: 'R',
  tempo: '2-0.5-2',
  view: { yaw: 90, pitch: 6, zoom: 1.0 },
  alt: { yaw: 30, pitch: 10, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Diz ikinci parmak hizasında, kalçalar düz', en: 'Knee over the 2nd toe, hips level', es: 'Rodilla sobre el 2.º dedo, caderas niveladas' } },
  setupView: { yaw: 45, pitch: 14 },
  setupMarks: [{ type: 'aline', joints: ['kneeR', 'ankleR'] }],
  props: [['_gufChair', {}]],
  ctx: CTX,
  contacts: ['heelR', 'ballR', 'ballL'],
  get poses() { return this._poses || (this._poses = fit(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'low',
  rep: [
    { to: 'up', dur: 2.0, phase: 0 },
    { to: 'up', dur: 0.5, phase: 1 },
    { to: 'low', dur: 2.0, phase: 2 },
  ],
  setup: { tr: 'Sandalyeye dön: sağ ayak oturakta, sol ayak pedalda. Eller belde, gövde dik. Sonra taraf değiştir.',
    en: 'Face the chair: right foot on the seat, left foot on the pedal. Hands on hips, torso tall. Then switch sides.',
    es: 'Frente a la silla: pie derecho en el asiento, izquierdo en el pedal. Manos en la cadera. Luego cambia.' },
  phases: [
    { name: { tr: 'Yüksel', en: 'Rise', es: 'Sube' }, breath: 'out',
      text: { tr: 'Oturaktaki ayaktan it ve uzan; arka bacak uzar, pedal ayakla yükselir.', en: 'Press through the seat foot and rise; the back leg lengthens, the pedal lifts with it.', es: 'Empuja con el pie del asiento y sube; la pierna de atrás se alarga y el pedal sube.' } },
    { name: { tr: 'Tepede dur', en: 'Pause tall', es: 'Pausa arriba' }, breath: 'hold', line: ['hipR', 'kneeR', 'ankleR'],
      text: { tr: 'Kalçalar düz, gövde dik. Arka bacak uzun, ayak ucu uzar.', en: 'Hips level, torso tall. Back leg long, foot pointed.', es: 'Caderas niveladas, torso erguido. Pierna larga, pie en punta.' } },
    { name: { tr: 'Direnerek in', en: 'Resist down', es: 'Baja resistiendo' }, breath: 'in',
      text: { tr: 'Diz ayak hizasında kalarak yavaşça in; pedal çarpmasın.', en: 'Lower slowly with the knee over the foot; no banging pedal.', es: 'Baja despacio con la rodilla sobre el pie; sin golpear el pedal.' } },
  ],
  tempoText: { tr: '2 sn yüksel · 0,5 sn dur · 2 sn in', en: '2 s rise · 0.5 s pause · 2 s lower', es: '2 s sube · 0,5 s pausa · 2 s baja' },
  mistakes: [
    { title: { tr: 'Pedal sertçe iniyor', en: 'Pedal slams down', es: 'El pedal baja de golpe' },
      fix: { tr: 'Pedalı kontrol et', en: 'Control the pedal', es: 'Controla el pedal' },
      fixText: { tr: 'İnişi oturaktaki bacakla yavaşlat', en: 'Slow the descent with the seat leg', es: 'Frena la bajada con la pierna del asiento' },
      at: 'low', pose: { trunk: 32, hipR: 120, kneeR: 112, kneeL: 22, ankleL: -10, thoracic: 14, neck: 10 }, line: ['pelvis', 'waist', 'neck'], marks: ['ballL'], parts: ['waist', 'thighR'] },
    { title: { tr: 'Diz içe düşüyor', en: 'Knee drops in', es: 'La rodilla cae hacia dentro' },
      fix: { tr: 'Diz parmak hizasında', en: 'Knee over the toes', es: 'Rodilla sobre los dedos' },
      fixText: { tr: 'Oturaktaki dizi ikinci parmağa yönlendir', en: 'Aim the seat knee at the 2nd toe', es: 'Dirige la rodilla al 2.º dedo' },
      at: 'low', pose: { hrotR: -18, abdR: -7 }, view: { yaw: 25, pitch: 10 }, line: ['kneeR', 'ankleR'], marks: ['kneeR'], parts: ['thighR', 'shinR'] },
  ],
  cues: [{ tr: 'Karın içeride', en: 'Core engaged', es: 'Core activo' },
    { tr: 'Pedalı kontrol et', en: 'Control the pedal', es: 'Controla el pedal' },
    { tr: 'Gövde dik, diz parmakta', en: 'Tall torso, knee over the toes', es: 'Torso erguido, rodilla sobre los dedos' }],
};
}
