/* Incline dumbbell press on a 30° bench. Bench prop (`_inclinePressBench`) is drawn from the solved body every frame:
 * the back pad lies behind the spine line (so the "bench too steep" mistake tilts the pad with the trunk), the seat
 * sits under the pelvis. Dumbbells use thorax-frame hold targets like dumbbell_bench_press.js. */
{
const { V, M } = FB;
const slab = (a, b, w, th, m) => {
  const X = V.norm(V.sub(b, a)), Z = [0, 0, 1], Y = V.cross(Z, X);
  return { t: 'box', c: V.lerp(a, b, 0.5), s: [V.len(V.sub(b, a)), th, w], R: [X, Y, Z], m, round: 0.02 };
};
FB.PROPS._inclinePressBench = (sol) => {
  const T = sol.F.thorax, back = M.apply(T, [-1, 0, 0]), up = M.apply(T, [0, 1, 0]);
  const p0 = V.add(V.add(sol.J.pelvis, V.mul(back, 0.155)), V.mul(up, -0.02));
  const a = [p0[0], p0[1], 0], b = V.add(a, V.mul(V.norm([up[0], up[1], 0]), 0.98));
  const px = sol.J.pelvis[0], H = 0.45, mid = V.lerp(a, b, 0.45);
  return [{ t: 'box', c: [px + 0.1, H - 0.04, 0], s: [0.46, 0.08, 0.3], m: 'pad', round: 0.02 }, slab(a, b, 0.28, 0.08, 'pad'),
    { t: 'cyl', a: [mid[0] - 0.02, H - 0.08, 0], b: mid, r: 0.025, m: 'frame' },
    { t: 'box', c: [px + 0.04, (H - 0.08) / 2, 0], s: [0.06, H - 0.08, 0.06], m: 'frame' },
    { t: 'box', c: [px - 0.2, 0.02, 0], s: [1.1, 0.04, 0.4], m: 'frame' }];
};
const SEAT = { trunk: -60, hip: 26, knee: 90, abd: 12, neck: 8, ground: [['pelvis', 0.45]], elbowPole: [-0.18, -0.62, 0.77] };
window.EXERCISE = {
  id: 'incline_press',
  name: { tr: 'Incline Press', en: 'Incline Dumbbell Press', es: 'Press inclinado' },
  category: { tr: 'Göğüs · Omuz', en: 'Chest · Shoulders', es: 'Pecho · Hombros' },
  equipmentLabel: { tr: 'Dambıl · 30° bench', en: 'Dumbbells · 30° bench', es: 'Mancuernas · Banco a 30°' },
  muscles: ['chest', 'delts', 'triceps'],
  tempo: '2-0-1',
  view: { yaw: 90, pitch: 8 },
  alt: { yaw: 25, pitch: 22, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' }, text: { tr: 'Dirsekler gövdeye ~60° açıyla', en: 'Elbows ~60° from the torso', es: 'Codos a ~60° del torso' } },
  props: [['_inclinePressBench'], ['dumbbell', { grip: 'pronated' }]],
  ctx: { anchorX: ['pelvis'], anchorAt: [0, 0], plant: ['ankleL', 'ankleR'] },
  poses: {
    top: { ...SEAT, holdL: [0.515, 0.406, 0.2], holdR: [0.515, 0.406, 0.2] },
    bottom: { ...SEAT, holdL: [0.265, 0.17, 0.37], holdR: [0.265, 0.17, 0.37] },
  },
  rest: 'top',
  rep: [
    { to: 'bottom', dur: 2.0, phase: 0 },
    { to: 'top', dur: 1.0, phase: 1 },
  ],
  setup: { tr: 'Bench 30°. Sırt ve baş pedde, ayaklar yerde. Dambıllar omuzların üstünde, kollar yere dik.',
    en: 'Bench at 30°. Back and head on the pad, feet flat. Dumbbells over the shoulders, arms vertical.',
    es: 'Banco a 30°. Espalda y cabeza apoyadas, pies en el suelo. Mancuernas sobre los hombros.' },
  phases: [
    { name: { tr: 'İniş', en: 'Lower', es: 'Baja' }, breath: 'in', arc: ['shoulderR', 'elbowR', 'wristR'], line: ['elbowR', 'wristR'],
      text: { tr: 'Dambılları üst göğsün yanına indir. Dirsekler gövdeye ~60°, ön kollar dik.', en: 'Lower beside the upper chest. Elbows ~60° from the torso, forearms vertical.', es: 'Baja junto al pecho alto. Codos a ~60° del torso, antebrazos verticales.' } },
    { name: { tr: 'İtiş', en: 'Press', es: 'Empuja' }, breath: 'out',
      text: { tr: 'Omuzların üstüne doğru yukarı it, kollar düzleşsin.', en: 'Press up over the shoulders until the arms are straight.', es: 'Empuja hacia arriba sobre los hombros hasta estirar los brazos.' } },
  ],
  tempoText: { tr: '2 sn in · 1 sn it', en: '2 s down · 1 s up', es: '2 s abajo · 1 s arriba' },
  mistakes: [
    { title: { tr: 'Bench çok dik', en: 'Bench too steep', es: 'Banco demasiado vertical' },
      fix: { tr: 'Benchi 30°ye ayarla', en: 'Set the bench to 30°', es: 'Pon el banco a 30°' },
      fixText: { tr: 'Çok dik bench hareketi omuz pressine çevirir', en: 'Too steep turns it into a shoulder press', es: 'Muy vertical se vuelve un press de hombros' },
      at: 'bottom', pose: { trunk: -35, hip: 55 }, line: ['pelvis', 'neck'], parts: ['chest', 'upperR'] },
    { title: { tr: 'Dambıllar boyna iniyor', en: 'Bells drop to the neck', es: 'Mancuernas al cuello' },
      fix: { tr: 'Üst göğse indir', en: 'Lower to the upper chest', es: 'Baja al pecho alto' },
      fixText: { tr: 'Dirsekler omuz hizasının altında kalır', en: 'Elbows stay below shoulder level', es: 'Codos por debajo de los hombros' },
      at: 'bottom', pose: { holdL: [0.223, 0.29, 0.4], holdR: [0.223, 0.29, 0.4], elbowPole: [-0.18, 0.1, 1] }, view: { yaw: 25, pitch: 22 }, marks: ['elbowL', 'elbowR'], parts: ['upperR', 'upperL'] },
  ],
  cues: [{ tr: 'Kürek kemikleri sabit', en: 'Shoulder blades pinned', es: 'Escápulas fijas' }, { tr: 'Omuzların üstüne it', en: 'Press over the shoulders', es: 'Empuja sobre los hombros' }, { tr: 'Dirsekler 45-60°', en: 'Elbows 45-60°', es: 'Codos a 45-60°' }],
};
}
