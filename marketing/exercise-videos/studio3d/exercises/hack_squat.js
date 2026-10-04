/* Machine hack squat (45° sled). The body lies back on the pad (trunk -45) with the feet on the angled foot platform.
 * Feet: fixed world IK targets on the 15° platform (sole flat on it) in every pose. Body: each pose's pelvis is placed
 * (pose.pos, computed once FB.BODY is known) so its FK ankles land exactly on those targets; the hackSquat back pad and
 * shoulder pads ride with the trunk. Start = knees ~10°, bottom = knees ~115° (spec). */
{
const TILT = 15 * Math.PI / 180;
const PLAT = [0, 0, 0];                       // hackSquat o.at (foot platform reference)
const STANCE = 0.16;                          // ankle z
const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };
const BASE = { trunk: -45, abd: 5, hrot: 12, flat: false, sh: 6, shAbd: 12, el: 25, palm: 'in', curl: 0.9, neck: 6, ground: [['pelvis', 0]] };
const RAW = {
  start: Object.assign({}, BASE, { hip: -2, knee: 10 }),
  bottom: Object.assign({}, BASE, { hip: 45, knee: 115 }),
};
function place(poses, mistakes) {
  const { V, solve, expand, BODY: B } = FB;
  const X = [Math.cos(TILT), Math.sin(TILT), 0], Y = [-Math.sin(TILT), Math.cos(TILT), 0];
  const foot = { 0: X, 1: Y, 2: [0, 0, 1] };
  const top = (x) => 0.06 + 0.03 / Math.cos(TILT) + (x - 0.05) * Math.tan(TILT);   // platform top surface height at x
  const A = (z) => V.add([0, top(0), z], V.mul(Y, B.ankleH));
  const fit = (p) => {
    const q = Object.assign({}, p, { ik: undefined, pos: undefined });
    const s = solve(expand(q), CTX);
    const d = V.sub(s.J.ankleR, s.J.pelvis);
    const pel = V.sub(A(STANCE), d);
    p.pos = [pel[0] - s.J.pelvis[0], pel[1] - s.J.pelvis[1], 0];
    p.ik = Object.assign({}, p.ik, { ankleL: { at: A(-STANCE), foot }, ankleR: { at: A(STANCE), foot } });
  };
  for (const k in poses) fit(poses[k]);
  for (const m of mistakes) { const merged = Object.assign({}, poses[m.at], m.pose); fit(merged); m.pose.pos = merged.pos; m.pose.ik = merged.ik; }
  return poses;
}

window.EXERCISE = {
  id: 'hack_squat',
  name: { tr: 'Hack Squat', en: 'Machine Hack Squat', es: 'Sentadilla hack' },
  category: { tr: 'Bacak · Kalça', en: 'Legs · Glutes', es: 'Piernas · Glúteos' },
  equipmentLabel: { tr: 'Hack squat makinesi', en: 'Hack squat machine', es: 'Máquina hack' },
  muscles: ['quads', 'glutes', 'adductors'],
  tempo: '3-0-1.5',
  view: { yaw: 90, pitch: 8 },
  alt: { yaw: 25, pitch: 10, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Dizler ayak uçları yönünde', en: 'Knees track over the toes', es: 'Rodillas en línea con los pies' } },
  contacts: ['heelR', 'ballR', 'shoulderR'],
  props: [['hackSquat', { at: PLAT, rail: 45 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = place(RAW, this.mistakes)); },
  rest: 'start',
  rep: [
    { to: 'bottom', dur: 3.0, phase: 0 },
    { to: 'start', dur: 1.5, phase: 1 },
  ],
  setup: { tr: 'Sırt ve omuzlar minderde, ayaklar omuz genişliğinde platformda. Güvenlik kollarını aç.',
    en: 'Back and shoulders on the pads, feet shoulder-width on the platform. Release the safeties.',
    es: 'Espalda y hombros en los cojines, pies al ancho de hombros. Suelta los seguros.' },
  phases: [
    { name: { tr: 'Kontrollü in', en: 'Lower slowly', es: 'Baja despacio' }, breath: 'in', slow: 1.0, arc: ['hipR', 'kneeR', 'ankleR'],
      text: { tr: 'Uyluklar paralele gelene kadar in. Kalça minderde, topuklar yerde.', en: 'Lower until the thighs reach parallel. Hips on the pad, heels down.', es: 'Baja hasta muslos paralelos. Cadera en el respaldo, talones abajo.' } },
    { name: { tr: 'İt', en: 'Press', es: 'Empuja' }, breath: 'out',
      text: { tr: 'Tüm ayakla it, dizleri kilitlemeden dur.', en: 'Press through the whole foot; stop short of locking the knees.', es: 'Empuja con todo el pie, sin bloquear las rodillas.' } },
  ],
  tempoText: { tr: '3 sn in · 1,5 sn it', en: '3 s down · 1.5 s press', es: '3 s abajo · 1,5 s arriba' },
  mistakes: [
    { title: { tr: 'Kalça minderden kalkıyor', en: 'Hips peel off the pad', es: 'La cadera se despega' },
      fix: { tr: 'Daha az in', en: 'Go less deep', es: 'Baja menos' },
      fixText: { tr: 'Bel minderde kalacak kadar in', en: 'Only go as deep as your lower back stays on the pad', es: 'Baja solo mientras la lumbar siga apoyada' },
      at: 'bottom', pose: { hip: 76, knee: 132, lumbar: 21, trunk: -66 }, marks: ['pelvis'], parts: ['pelvis', 'waist'] },
    { title: { tr: 'Dizler içe kaçıyor', en: 'Knees cave in', es: 'Rodillas hacia dentro' },
      fix: { tr: 'Dizleri dışa it', en: 'Push the knees out', es: 'Rodillas hacia fuera' },
      fixText: { tr: 'Dizler ayak uçları yönünde', en: 'Knees over the toes', es: 'Rodillas sobre los pies' },
      at: 'bottom', pose: { abd: -4, hrot: -6 }, view: { yaw: 25, pitch: 10 }, marks: ['kneeL', 'kneeR'], parts: ['thigh', 'shin'] },
  ],
  cues: [{ tr: 'Sırt minderde', en: 'Back flat on the pad', es: 'Espalda en el respaldo' },
    { tr: 'Topuklar yerde', en: 'Heels down', es: 'Talones abajo' },
    { tr: 'Dizleri kilitleme', en: 'Don’t lock the knees', es: 'No bloquees las rodillas' }],
};
}
