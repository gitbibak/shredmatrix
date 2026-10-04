/* Seated dumbbell shoulder press on an upright bench (back ~82°). Back pad drawn from the solved trunk every frame
 * (`_uprightBench`), so the arch mistake shows the low back leaving the pad. Hands: thorax-frame holds computed from the
 * shoulder joint (lazy `poses`, FB.BODY is only right after the rig loads): bottom = bells beside the ears with
 * vertical forearms and elbows slightly forward (scapular plane), top = nearly straight arms, bells ~30 cm apart. */
{
const { V, M } = FB;
const slab = (a, b, w, th, m) => {
  const X = V.norm(V.sub(b, a)), Z = [0, 0, 1], Y = V.cross(Z, X);
  return { t: 'box', c: V.lerp(a, b, 0.5), s: [V.len(V.sub(b, a)), th, w], R: [X, Y, Z], m, round: 0.02 };
};
let PAD = null;
FB.PROPS._uprightBench = (sol) => {
  if (!PAD) {   // fitted once to the rest pose: a fixed bench
    const s = FB.solve(FB.expand(window.EXERCISE.poses.bottom), { anchorX: ['pelvis'], anchorAt: [0, 0] });
    const T = s.F.thorax, back = M.apply(T, [-1, 0, 0]), up = M.apply(T, [0, 1, 0]);
    const p0 = V.add(V.add(s.J.pelvis, V.mul(back, 0.155)), V.mul(up, -0.02));
    PAD = { a: [p0[0], p0[1], 0], b: V.add([p0[0], p0[1], 0], V.mul(V.norm([up[0], up[1], 0]), 0.82)), px: s.J.pelvis[0] };
  }
  const H = 0.45, mid = V.lerp(PAD.a, PAD.b, 0.3);
  return [{ t: 'box', c: [PAD.px + 0.06, H - 0.04, 0], s: [0.42, 0.08, 0.32], m: 'pad', round: 0.02 }, slab(PAD.a, PAD.b, 0.3, 0.08, 'pad'),
    { t: 'cyl', a: [mid[0] - 0.02, H - 0.08, 0], b: mid, r: 0.025, m: 'frame' },
    { t: 'box', c: [PAD.px, (H - 0.08) / 2, 0], s: [0.06, H - 0.08, 0.06], m: 'frame' },
    { t: 'box', c: [PAD.px - 0.1, 0.02, 0], s: [0.8, 0.04, 0.45], m: 'frame' }];
};
const SEAT = { trunk: -8, hip: 79, knee: 88, abd: 14, hrot: 6, neck: 0, ground: [['pelvis', 0.45]], elbowPole: [0.05, -0.8, 1], noAvoid: true };
// hand target = shoulder joint + [fwd, up, out] (thorax frame), converted to the chest-relative hold
const SH = () => { const s = FB.solve(FB.expand(SEAT), {}); const T = s.F.thorax, d = V.sub(s.J.shoulderR, s.J.chest); return [V.dot(d, T[0]), V.dot(d, T[1]), V.dot(d, T[2])]; };
const HOLD = (f, u, o, extra) => { const s = SH(); const h = [s[0] + f, s[1] + u, s[2] + o]; return Object.assign({}, SEAT, { holdL: h, holdR: h.slice() }, extra); };
window.EXERCISE = {
  id: 'dumbbell_shoulder_press',
  name: { tr: 'Dumbbell Omuz Press', en: 'Dumbbell Shoulder Press', es: 'Press de hombros con mancuernas' },
  category: { tr: 'Omuz · Kol', en: 'Shoulders · Arms', es: 'Hombros · Brazos' },
  equipmentLabel: { tr: 'Dambıl · Bench', en: 'Dumbbells · Bench', es: 'Mancuernas · Banco' },
  muscles: ['delts', 'triceps', 'upperback'],
  tempo: '1.5-0-2',
  view: { yaw: 14, pitch: 6 },
  alt: { yaw: 88, pitch: 6, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' }, text: { tr: 'Dirsekler gövdenin biraz önünde', en: 'Elbows slightly in front of the body', es: 'Codos algo por delante del cuerpo' } },
  props: [['_uprightBench'], ['dumbbell', { grip: 'pronated' }]],
  ctx: { anchorX: ['pelvis'], anchorAt: [0, 0], plant: ['ankleL', 'ankleR'] },
  get poses() {
    return this._p || (this._p = {
      bottom: HOLD(0.05, 0.29, 0.2, { palm: 'forward' }),
      top: HOLD(0.03, 0.56, -0.02, { palm: 'forward' }),
    });
  },
  rest: 'bottom',
  rep: [
    { to: 'top', dur: 1.5, phase: 0 },
    { to: 'bottom', dur: 2.0, phase: 1 },
  ],
  setup: { tr: 'Dik bench, sırt pedde, ayaklar yerde. Dambıllar kulak hizasında, avuçlar öne.',
    en: 'Upright bench, back on the pad, feet flat. Dumbbells at ear level, palms forward.',
    es: 'Banco vertical, espalda apoyada, pies en el suelo. Mancuernas a la altura de las orejas.' },
  phases: [
    { name: { tr: 'İtiş', en: 'Press', es: 'Empuja' }, breath: 'out',
      text: { tr: 'Yukarı ve hafif içe it. Dambıllar başın üstünde yaklaşır.', en: 'Press up and slightly in. The bells come close over your head.', es: 'Empuja arriba y algo hacia dentro. Se juntan sobre la cabeza.' } },
    { name: { tr: 'İndir', en: 'Lower', es: 'Baja' }, breath: 'in', arc: ['shoulderR', 'elbowR', 'wristR'], line: ['elbowR', 'wristR'],
      text: { tr: 'Kulak hizasına kontrollü indir. Ön kollar dik, dirsekler bileklerin altında.', en: 'Lower under control to ear level. Forearms vertical, elbows under the wrists.', es: 'Baja con control a las orejas. Antebrazos verticales, codos bajo las muñecas.' } },
  ],
  tempoText: { tr: '1,5 sn it · 2 sn indir', en: '1.5 s up · 2 s down', es: '1,5 s arriba · 2 s abajo' },
  get mistakes() { return this._m || (this._m = [
    { title: { tr: 'Bel aşırı kavisli', en: 'Overarched back', es: 'Espalda muy arqueada' },
      fix: { tr: 'Kaburgaları indir, karnı sık', en: 'Ribs down, brace', es: 'Costillas abajo, abdomen firme' },
      fixText: { tr: 'Sırt pedde kalır, gerekirse daha hafif ağırlık', en: 'Back stays on the pad; go lighter if needed', es: 'Espalda en el respaldo; usa menos peso' },
      at: 'top', pose: { lumbar: -22, trunk: 6 }, view: { yaw: 88, pitch: 6 }, line: ['pelvis', 'waist', 'neck'], parts: ['waist', 'chest'] },
    { title: { tr: 'Omuzlar kulağa kalkıyor', en: 'Shrugging at the top', es: 'Encoger los hombros' },
      fix: { tr: 'Omuzları aşağıda tut', en: 'Keep the shoulders down', es: 'Hombros abajo' },
      fixText: { tr: 'Boyun uzun, kollar kulaktan uzak', en: 'Long neck, arms away from the ears', es: 'Cuello largo, brazos lejos de las orejas' },
      at: 'top', pose: Object.assign(HOLD(0.03, 0.62, -0.02, { palm: 'forward' }), { shrug: 0.06 }), marks: ['shoulderL', 'shoulderR'], parts: ['upper', 'neck'] },
  ]); },
  cues: [{ tr: 'Sırt pedde', en: 'Back on the pad', es: 'Espalda apoyada' }, { tr: 'Kaburgalar aşağıda', en: 'Ribs down', es: 'Costillas abajo' }, { tr: 'Yukarı ve hafif içe', en: 'Up and slightly in', es: 'Arriba y algo hacia dentro' }],
};
}
