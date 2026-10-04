/* Arnold press, seated on an upright bench (bench prop as in dumbbell_shoulder_press.js).
 * Engine limit worked around here: a gripped hand only knows three fixed palm directions (supinated / pronated / neutral),
 * so the palm rotation (facing you -> facing in -> facing forward) would pop. The dumbbells are drawn by a local prop
 * (`_arnoldBells`) that does NOT register a grip; it computes a continuous palm vector from the pose value `rot`
 * (0 = palms to the face, 1 = palms forward) and exposes it through the free-hand `palm` lookup (palm keys '_arnoldL/R',
 * resolved by non-enumerable getters). Fingers are curled with `curl: 1`; the handle runs across the palm. */
{
const { V, M } = FB;
const slab = (a, b, w, th, m) => {
  const X = V.norm(V.sub(b, a)), Z = [0, 0, 1], Y = V.cross(Z, X);
  return { t: 'box', c: V.lerp(a, b, 0.5), s: [V.len(V.sub(b, a)), th, w], R: [X, Y, Z], m, round: 0.02 };
};
let PAD = null;
FB.PROPS._uprightBench = (sol) => {
  if (!PAD) {
    const s = FB.solve(FB.expand(window.EXERCISE.poses.start), { anchorX: ['pelvis'], anchorAt: [0, 0] });
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
const PALM = { L: [0, 0, 1], R: [0, 0, -1] };
for (const s of ['L', 'R']) if (!Object.prototype.hasOwnProperty('_arnold' + s)) {
  Object.defineProperty(Object.prototype, '_arnold' + s, { configurable: true, enumerable: false,
    get() { const T3 = window.FB3 && window.FB3.THREE; const p = PALM[s]; return T3 ? new T3.Vector3(p[0], p[1], p[2]) : undefined; } });
}
FB.PROPS._arnoldBells = (sol) => {
  const T = sol.F.thorax, a = Math.max(0, Math.min(1, (sol.pose && sol.pose.rot) ?? 0)) * Math.PI, out = [];
  for (const s of ['L', 'R']) {
    const sg = s === 'R' ? 1 : -1;
    const palm = V.norm(V.add(V.mul(M.apply(T, [-1, 0, 0]), Math.cos(a)), V.mul(M.apply(T, [0, 0, -sg]), Math.sin(a))));
    PALM[s] = palm;
    const fd = sol.F['arm' + s].fd;
    let ax = V.cross(fd, palm); if (V.len(ax) < 1e-4) ax = M.apply(T, [0, 0, 1]);
    ax = V.norm(ax);
    const c = V.add(sol.J['hand' + s], V.mul(palm, 0.025));
    const h = 0.15, hw = 0.07;
    out.push({ t: 'cyl', a: V.add(c, V.mul(ax, -h + hw)), b: V.add(c, V.mul(ax, h - hw)), r: 0.015, m: 'chrome' },
      { t: 'cyl', a: V.add(c, V.mul(ax, -h)), b: V.add(c, V.mul(ax, -h + hw)), r: 0.052, m: 'iron', seg: 6 },
      { t: 'cyl', a: V.add(c, V.mul(ax, h - hw)), b: V.add(c, V.mul(ax, h)), r: 0.052, m: 'iron', seg: 6 });
  }
  return out;
};
const SEAT = { trunk: -8, hip: 79, knee: 88, abd: 14, hrot: 6, neck: 0, ground: [['pelvis', 0.45]], noAvoid: true, palmL: '_arnoldL', palmR: '_arnoldR', curl: 1 };
const SH = () => { const s = FB.solve(FB.expand(SEAT), {}); const T = s.F.thorax, d = V.sub(s.J.shoulderR, s.J.chest); return [V.dot(d, T[0]), V.dot(d, T[1]), V.dot(d, T[2])]; };
const HOLD = (f, u, o, extra) => { const s = SH(); const h = [s[0] + f, s[1] + u, s[2] + o]; return Object.assign({}, SEAT, { holdL: h, holdR: h.slice() }, extra); };
window.EXERCISE = {
  id: 'arnold_press',
  name: { tr: 'Arnold Press', en: 'Arnold Press', es: 'Press Arnold' },
  category: { tr: 'Omuz', en: 'Shoulders', es: 'Hombros' },
  equipmentLabel: { tr: 'Dambıl · Bench', en: 'Dumbbells · Bench', es: 'Mancuernas · Banco' },
  muscles: ['delts', 'triceps', 'upperback'],
  tempo: '1.8-0-2',
  view: { yaw: 14, pitch: 6 },
  alt: { yaw: 70, pitch: 6, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' }, text: { tr: 'Dirsekler önden yana açılır', en: 'Elbows open from the front to the sides', es: 'Los codos pasan de delante a los lados' } },
  props: [['_uprightBench'], ['_arnoldBells']],
  ctx: { anchorX: ['pelvis'], anchorAt: [0, 0], plant: ['ankleL', 'ankleR'] },
  get poses() {
    return this._p || (this._p = {
      start: HOLD(0.2, 0.13, 0.0, { rot: 0, elbowPole: [1, -1, 0.15] }),
      mid: HOLD(0.08, 0.3, 0.14, { rot: 0.55, elbowPole: [0.35, -1, 0.9] }),
      top: HOLD(0.03, 0.575, -0.02, { rot: 1, elbowPole: [0.05, -0.8, 1] }),
    });
  },
  rest: 'start',
  rep: [
    { to: 'mid', dur: 0.9, phase: 0 },
    { to: 'top', dur: 0.9, phase: 0 },
    { to: 'mid', dur: 1.0, phase: 1 },
    { to: 'start', dur: 1.0, phase: 1 },
  ],
  setup: { tr: 'Dik otur, sırt pedde. Dambıllar çene önünde, avuçlar sana bakar, dirsekler önde.',
    en: 'Sit tall, back on the pad. Bells in front of the chin, palms facing you, elbows in front.',
    es: 'Siéntate recto, espalda apoyada. Mancuernas ante la barbilla, palmas hacia ti.' },
  phases: [
    { name: { tr: 'Döndür ve it', en: 'Rotate and press', es: 'Gira y empuja' }, breath: 'out',
      text: { tr: 'Yukarı iterken avuçları yavaşça öne çevir, dirsekler yana açılsın.', en: 'Press up while turning the palms forward; the elbows open to the sides.', es: 'Empuja mientras giras las palmas al frente; los codos se abren.' } },
    { name: { tr: 'İndir ve döndür', en: 'Lower and rotate', es: 'Baja y gira' }, breath: 'in',
      text: { tr: 'Aynı yoldan indir, avuçlar tekrar sana döner. İnişi kontrol et.', en: 'Lower the same way, palms turning back to you. Control the descent.', es: 'Baja igual, las palmas vuelven hacia ti. Controla la bajada.' } },
  ],
  tempoText: { tr: '1,8 sn it · 2 sn indir', en: '1.8 s up · 2 s down', es: '1,8 s arriba · 2 s abajo' },
  get mistakes() {
    return this._m || (this._m = [
      { title: { tr: 'Bel aşırı kavisli', en: 'Overarched back', es: 'Espalda muy arqueada' },
        fix: { tr: 'Kaburgaları indir, karnı sık', en: 'Ribs down, brace', es: 'Costillas abajo, abdomen firme' },
        fixText: { tr: 'Sırt pedde kalır, gerekirse daha hafif ağırlık', en: 'Back stays on the pad; go lighter if needed', es: 'Espalda en el respaldo; usa menos peso' },
        at: 'top', pose: { lumbar: -22, trunk: 6 }, view: { yaw: 80, pitch: 6 }, line: ['pelvis', 'waist', 'neck'], parts: ['waist', 'chest'] },
      { title: { tr: 'Yarım tekrar', en: 'Short range', es: 'Recorrido corto' },
        fix: { tr: 'Çene hizasına kadar indir', en: 'Lower to chin level', es: 'Baja hasta la barbilla' },
        fixText: { tr: 'Her tekrarda tam dönüş ve tam iniş', en: 'Full rotation and full descent every rep', es: 'Giro y bajada completos en cada repetición' },
        at: 'start', pose: HOLD(0.12, 0.38, 0.0, { rot: 0.25, elbowPole: [0.8, -1, 0.4] }), marks: ['handL', 'handR'], parts: ['upperR', 'foreR'] },
    ]);
  },
  cues: [{ tr: 'Yavaşça döndür', en: 'Rotate smoothly', es: 'Gira suave' }, { tr: 'Avuçlar sana dönük başla', en: 'Start palms toward you', es: 'Empieza con palmas hacia ti' }, { tr: 'Beli kavislendirme', en: 'Do not arch', es: 'No arquees' }],
};
}
