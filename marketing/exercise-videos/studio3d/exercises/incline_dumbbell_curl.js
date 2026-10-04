/* Incline dumbbell curl (strength_pull). Seated on a 45° incline bench, back and head on the pad, feet flat.
 * The bench is drawn by a local prop (`_inclineCurlBench`) fitted once to the solved start pose, so the back pad lies
 * exactly behind the spine (the engine's inclineBench has a fixed width/orientation). FK arms.
 * Spec: trunk -45, shoulder extension 15 at the start, 0-10 flexion at the top, but also "arms hang straight down behind the torso line" and "upper arms do not move": with a 45° back that means ~40° extension. Used: start -38 (arm ~7° from vertical), top -28 (10° drift), mistake +22. Spec hip_flexion 105 is not reachable
 * with a 45° back and a level seat (it measures ~45 here, thighs level); trunk, shoulder and elbow angles are matched. */
{
const { V, M } = FB;
const BENCH = { seatH: 0.45, padW: 0.26 };
const slab = (a, b, w, th, m) => {   // box whose long axis runs a -> b (world), surface normal in the x-y plane
  const X = V.norm(V.sub(b, a)), Z = [0, 0, 1], Y = V.cross(Z, X);
  return { t: 'box', c: V.lerp(a, b, 0.5), s: [V.len(V.sub(b, a)), th, w], R: [X, Y, Z], m, round: 0.02 };
};
let fit = null;
FB.PROPS._inclineCurlBench = (sol) => {
  if (!fit) {
    const ex = window.EXERCISE, s = FB.solve(FB.expand(ex.poses.start), { anchorX: ['pelvis'], anchorAt: [0, 0] });
    const T = s.F.thorax, back = M.apply(T, [-1, 0, 0]), up = M.apply(T, [0, 1, 0]);
    const off = 0.115 + 0.04;   // back surface ~11.5 cm behind the spine line, pad half thickness 4 cm
    const p0 = V.add(V.add(s.J.pelvis, V.mul(back, off)), V.mul(up, 0.02));
    fit = { a: [p0[0], p0[1], 0], b: V.add([p0[0], p0[1], 0], V.mul([up[0], up[1], 0], 0.98)), px: s.J.pelvis[0] };
  }
  const H = BENCH.seatH, out = [];
  out.push({ t: 'box', c: [fit.px + 0.08, H - 0.04, 0], s: [0.46, 0.08, 0.28], m: 'pad', round: 0.02 });
  out.push(slab(fit.a, fit.b, BENCH.padW, 0.08, 'pad'));
  const mid = V.lerp(fit.a, fit.b, 0.45);
  out.push({ t: 'cyl', a: [mid[0] - 0.02, H - 0.08, 0], b: V.add(mid, V.mul(V.norm(V.sub(fit.b, fit.a)), 0)), r: 0.025, m: 'frame' });
  out.push({ t: 'box', c: [fit.px + 0.02, (H - 0.08) / 2, 0], s: [0.06, H - 0.08, 0.06], m: 'frame' });
  out.push({ t: 'box', c: [fit.px - 0.15, 0.02, 0], s: [1.1, 0.04, 0.4], m: 'frame' });
  return out;
};

window.EXERCISE = {
  id: 'incline_dumbbell_curl',
  name: { tr: 'Incline Dambıl Curl', en: 'Incline Dumbbell Curl', es: 'Curl inclinado con mancuernas' },
  category: { tr: 'Kol', en: 'Arms', es: 'Brazos' },
  equipmentLabel: { tr: 'Dambıl · Incline bench', en: 'Dumbbells · Incline bench', es: 'Mancuernas · Banco inclinado' },
  muscles: ['biceps', 'forearms'],
  tempo: '1-0.5-2.5',
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 40, pitch: 10, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Kollar benchin yanında sarkar, dirsekler yere bakar', en: 'Arms hang beside the bench, elbows point down', es: 'Brazos junto al banco, codos hacia el suelo' } },
  props: [['_inclineCurlBench'], ['dumbbell', { grip: 'supinated', len: 0.26 }]],
  ctx: { anchorX: ['pelvis'], anchorAt: [0, 0], plant: ['ankleL', 'ankleR'] },
  poses: {
    start: { trunk: -45, hip: 42, knee: 88, abd: 8, neck: 6, ground: [['pelvis', 0.45]], sh: -38, shAbd: 16, el: 6 },
    top: { trunk: -45, hip: 42, knee: 88, abd: 8, neck: 6, ground: [['pelvis', 0.45]], sh: -28, shAbd: 11, shRot: -12, el: 146 },
  },
  rest: 'start',
  rep: [
    { to: 'top', dur: 1.0, phase: 0 },
    { to: 'top', dur: 0.5, phase: 1 },
    { to: 'start', dur: 2.5, phase: 2 },
  ],
  setup: { tr: 'Bench 45°. Sırt ve başın pedde, ayaklar yerde. Kollar aşağı sarkar, avuçlar öne bakar.',
    en: 'Bench at 45°. Back and head on the pad, feet flat. Arms hang down, palms forward.',
    es: 'Banco a 45°. Espalda y cabeza en el respaldo, pies en el suelo. Brazos colgando.' },
  phases: [
    { name: { tr: 'Kaldır', en: 'Curl', es: 'Sube' }, breath: 'out', line: ['shoulderR', 'elbowR'],
      text: { tr: 'Üst kolu oynatmadan dambılları omuzlara doğru kaldır.', en: 'Curl the bells toward your shoulders without moving the upper arms.', es: 'Sube las mancuernas hacia los hombros sin mover los brazos.' } },
    { name: { tr: 'Tepede sık', en: 'Squeeze', es: 'Aprieta' }, breath: 'hold', marks: [{ type: 'mark', joint: 'elbowR' }],
      text: { tr: 'Kısa bir an sık. Kürek kemikleri pedde.', en: 'Squeeze briefly. Shoulder blades stay on the pad.', es: 'Aprieta un momento. Escápulas en el respaldo.' } },
    { name: { tr: 'Yavaş indir', en: 'Lower slowly', es: 'Baja despacio' }, breath: 'in', arc: ['shoulderR', 'elbowR', 'wristR'],
      text: { tr: 'Kollar tamamen düzleşene kadar indir, biceps’te gerilmeyi hisset.', en: 'Lower until the arms are fully straight and feel the biceps stretch.', es: 'Baja hasta estirar del todo y siente el estiramiento.' } },
  ],
  tempoText: { tr: '1 sn kaldır · 0,5 sn sık · 2,5 sn indir', en: '1 s up · 0.5 s squeeze · 2.5 s down', es: '1 s sube · 0,5 s aprieta · 2,5 s baja' },
  mistakes: [
    { title: { tr: 'Dirsekler öne kaçıyor', en: 'Elbows drift forward', es: 'Codos hacia delante' },
      fix: { tr: 'Dirsekler yere baksın', en: 'Elbows point at the floor', es: 'Codos hacia el suelo' },
      fixText: { tr: 'Üst kol sabit, sadece ön kol hareket eder', en: 'Upper arm still, only the forearm moves', es: 'Brazo quieto, solo se mueve el antebrazo' },
      at: 'top', pose: { sh: 22, el: 132 }, marks: ['elbowR'], line: ['shoulderR', 'elbowR'], parts: ['upperR', 'upperL'] },
    { title: { tr: 'Gerilmeyi kısaltmak', en: 'Cutting the stretch short', es: 'Recortar el estiramiento' },
      fix: { tr: 'Kolları tam aç', en: 'Straighten the arms fully', es: 'Estira del todo' },
      fixText: { tr: 'Bu hareketin farkı alttaki tam gerilmedir', en: 'The full stretch at the bottom is the point', es: 'El estiramiento completo es la clave' },
      at: 'start', pose: { el: 45 }, marks: ['elbowR'], line: ['shoulderR', 'elbowR', 'wristR'], parts: ['foreR', 'foreL'] },
  ],
  cues: [{ tr: 'Sırt pedde', en: 'Back on the pad', es: 'Espalda en el respaldo' },
    { tr: 'Sadece ön kol hareket eder', en: 'Only the forearms move', es: 'Solo se mueven los antebrazos' },
    { tr: 'Altta yavaş gerin', en: 'Slow stretch at the bottom', es: 'Estira despacio abajo' }],
};
}
