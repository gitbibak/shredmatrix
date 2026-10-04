/* 45° sled leg press. Pelvis anchored on the seat (ground contact pelvis), back reclined 40° on the pad.
 * Feet: world IK targets (ik.ankleL/R + foot frame) that slide along the 45° rail direction U with the soles flat on the
 * platform (foot frame perpendicular to the rail), so the sled moves on its rails; the legPress platform follows the
 * balls of the feet. Start = knees ~8° (soft), bottom = knees ~95°, distance along the rail solved from the hip position. */
{
const RAIL = 45, U = [Math.cos(RAIL * Math.PI / 180), Math.sin(RAIL * Math.PI / 180), 0];
const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };
const SEAT = 0.23;   // seat pad top; with the prop's rail base the sled only meets its rails for a low seat
const BASE = { trunk: -40, abd: 6, hrot: 10, flat: false, sh: 2, el: 18, shAbd: 24, palm: 'in', curl: 0.9, neck: 8, ground: [['pelvis', SEAT]] };
const RAW = {
  start: Object.assign({}, BASE, { hip: 85, knee: 8 }),
  bottom: Object.assign({}, BASE, { hip: 118, knee: 95 }),
};
// knee flexion -> hip-ankle distance; ankle target on the rail line through the start ankle
function rail(poses, mistakes) {
  const { V, solve, expand, BODY: B } = FB;
  const X = [-U[1], U[0], 0], Y = V.mul(U, -1), F = { 0: X, 1: Y, 2: [0, 0, 1] };
  const s0 = solve(expand(Object.assign({}, poses.start, { ik: undefined })), CTX);
  const dist = (k) => { const a = (180 - k) * Math.PI / 180; return Math.sqrt(B.thigh * B.thigh + B.shin * B.shin - 2 * B.thigh * B.shin * Math.cos(a)); };
  const tgt = (S, knee, extra = 0) => {
    const H = s0.J['hip' + S], A0 = s0.J['ankle' + S];
    // A = A0 - U*d with |H - A| = dist(knee)
    const w = V.sub(A0, H), b = V.dot(w, U), c = V.dot(w, w) - dist(knee) ** 2;
    const r = Math.sqrt(Math.max(0, b * b - c)), pick = Math.abs(b - r) < Math.abs(b + r) ? b - r : b + r;
    return { at: V.add(V.sub(A0, V.mul(U, pick)), V.mul(U, extra)), foot: F };
  };
  const set = (p, knee, extra) => { p.ik = Object.assign({}, p.ik, { ankleL: tgt('L', knee, extra), ankleR: tgt('R', knee, extra) }); };
  set(poses.start, 8); set(poses.bottom, 95);
  for (const m of mistakes) set(m.pose, m.knee, m.extra || 0);
  return poses;
}

window.EXERCISE = {
  id: 'leg_press',
  name: { tr: 'Leg Press', en: 'Leg Press', es: 'Prensa de piernas' },
  category: { tr: 'Bacak · Kalça', en: 'Legs · Glutes', es: 'Piernas · Glúteos' },
  equipmentLabel: { tr: 'Leg press makinesi', en: 'Leg press machine', es: 'Máquina de prensa' },
  muscles: ['quads', 'glutes', 'adductors'],
  tempo: '3-0-1.5',
  view: { yaw: 90, pitch: 8 },
  alt: { yaw: 30, pitch: 14, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Dizler ayak uçları yönünde', en: 'Knees track over the toes', es: 'Rodillas en línea con los pies' } },
  contacts: ['pelvis', 'ballL', 'ballR'],
  props: [['legPress', { at: [0.141, 0, 0], seatH: SEAT, back: -40 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = rail(RAW, this.mistakes)); },
  rest: 'start',
  rep: [
    { to: 'bottom', dur: 3.0, phase: 0 },
    { to: 'start', dur: 1.5, phase: 1 },
  ],
  setup: { tr: 'Sırt ve kalça minderde. Ayaklar omuz genişliğinde platformun ortasında, tutamaçları tut.',
    en: 'Back and hips on the pad. Feet shoulder-width in the middle of the platform, hold the handles.',
    es: 'Espalda y glúteos en el respaldo. Pies al ancho de hombros en el centro, agarra las asas.' },
  phases: [
    { name: { tr: 'Kontrollü indir', en: 'Lower slowly', es: 'Baja despacio' }, breath: 'in', slow: 1.0, arc: ['hipR', 'kneeR', 'ankleR'],
      text: { tr: 'Dizler ~90° olana kadar indir. Kalça ve bel minderden kalkmaz.', en: 'Lower until the knees are about 90°. Hips and back stay on the pad.', es: 'Baja hasta unos 90° de rodilla. Cadera y espalda pegadas.' } },
    { name: { tr: 'İt', en: 'Press', es: 'Empuja' }, breath: 'out',
      text: { tr: 'Tüm ayakla it, dizleri kilitlemeden dur.', en: 'Press through the whole foot; stop just short of locking the knees.', es: 'Empuja con todo el pie, sin bloquear las rodillas.' } },
  ],
  tempoText: { tr: '3 sn indir · 1,5 sn it', en: '3 s down · 1.5 s press', es: '3 s abajo · 1,5 s arriba' },
  mistakes: [
    { title: { tr: 'Kalça minderden kalkıyor', en: 'Hips lift off the pad', es: 'La cadera se despega' },
      fix: { tr: 'Daha az in', en: 'Go less deep', es: 'Baja menos' },
      fixText: { tr: 'Dizler ~90°’de dur, bel minderde kalsın', en: 'Stop at about 90° so the lower back stays down', es: 'Para a unos 90°, lumbar en el respaldo' },
      at: 'bottom', knee: 118, pose: { trunk: -62, lumbar: 22, hip: 108, ground: [['pelvis', SEAT + 0.05]] }, marks: ['pelvis'], parts: ['pelvis', 'waist'] },
    { title: { tr: 'Dizleri kilitlemek', en: 'Locking the knees', es: 'Bloquear las rodillas' },
      fix: { tr: 'Dizler hafif bükülü', en: 'Keep a soft bend', es: 'Rodillas algo flexionadas' },
      fixText: { tr: 'Tepede 5–10° bükülü kal', en: 'Stop 5–10° short of straight', es: 'Para a 5–10° de estirar del todo' },
      at: 'start', knee: 0, extra: 0.02, pose: { hip: 80 }, marks: ['kneeR'], parts: ['thigh', 'shin'] },
  ],
  cues: [{ tr: 'Kalça ve sırt minderde', en: 'Hips and back on the pad', es: 'Cadera y espalda pegadas' },
    { tr: 'Dizler ayak uçları yönünde', en: 'Knees over the toes', es: 'Rodillas sobre los pies' },
    { tr: 'Dizleri kilitleme', en: 'Never lock the knees', es: 'No bloquees las rodillas' }],
};
}
