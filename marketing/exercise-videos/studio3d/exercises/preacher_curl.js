/* Preacher curl (strength_pull). Seated, armpits on the top edge of an angled pad, upper arms lying on it.
 * The preacher bench (seat + angled arm pad + post) is a local prop (`_preacherBench`) fitted once to the solved start
 * pose so the pad sits exactly under the backs of the upper arms. FK arms: `sh` stays at 60 (relative to the trunk,
 * upper arm ~50° from vertical), only the elbow bends, so the arms never leave the pad.
 * Spec: trunk 10, shoulder 60 -> 65, elbow 15 -> 128 (spec 135-140 puts the bar in front of the face with this rig; bar stops at the chin). Shoulder kept at 60 so the arm stays on a fixed pad).
 * Bar: straight bar with small plates standing in for the EZ bar. */
{
const { V, M } = FB;
const SEAT = 0.43;
const slab = (a, b, w, th, m) => {
  const X = V.norm(V.sub(b, a)), Z = [0, 0, 1], Y = V.cross(Z, X);
  return { t: 'box', c: V.lerp(a, b, 0.5), s: [V.len(V.sub(b, a)), th, w], R: [X, Y, Z], m, round: 0.02 };
};
let fit = null;
FB.PROPS._preacherBench = () => {
  if (!fit) {
    const ex = window.EXERCISE, s = FB.solve(FB.expand(ex.poses.start), { anchorX: ['pelvis'], anchorAt: [0, 0] });
    const sh = s.J.shoulderR, el = s.J.elbowR;
    const u = V.norm(V.sub(el, sh)), n = [u[1], -u[0], 0];             // n: below/behind the upper arm (pad side)
    const nn = n[1] < 0 ? n : V.mul(n, -1);
    const off = 0.05 + 0.04;                                          // arm radius + pad half thickness
    const a = V.add(V.add(sh, V.mul(u, 0.13)), V.mul(nn, off)), b = V.add(V.add(el, V.mul(u, 0.1)), V.mul(nn, off));
    fit = { a: [a[0], a[1], 0], b: [b[0], b[1], 0], nn, px: s.J.pelvis[0] };
  }
  const out = [slab(fit.a, fit.b, 0.62, 0.08, 'pad')];
  const lo = V.lerp(fit.a, fit.b, 0.55), base = V.add(lo, V.mul(fit.nn, 0.06));
  out.push({ t: 'cyl', a: [base[0], base[1], 0], b: [base[0] - 0.02, 0.04, 0], r: 0.03, m: 'frame' });
  out.push({ t: 'box', c: [fit.px + 0.02, SEAT - 0.04, 0], s: [0.36, 0.08, 0.34], m: 'pad', round: 0.02 });
  out.push({ t: 'box', c: [fit.px + 0.02, (SEAT - 0.08) / 2, 0], s: [0.06, SEAT - 0.08, 0.06], m: 'frame' });
  out.push({ t: 'box', c: [(fit.px + base[0]) / 2, 0.02, 0], s: [Math.abs(base[0] - fit.px) + 0.3, 0.04, 0.42], m: 'frame' });
  return out;
};

window.EXERCISE = {
  id: 'preacher_curl',
  name: { tr: 'Preacher Curl', en: 'Preacher Curl', es: 'Curl predicador' },
  category: { tr: 'Kol', en: 'Arms', es: 'Brazos' },
  equipmentLabel: { tr: 'Preacher bench · Bar', en: 'Preacher bench · Bar', es: 'Banco predicador · Barra' },
  muscles: ['biceps', 'forearms'],
  tempo: '1-0.5-2.5',
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 40, pitch: 12, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Üst kollar pedde, sadece ön kol kalkar', en: 'Upper arms stay on the pad, only the forearms rise', es: 'Brazos sobre el cojín, solo suben los antebrazos' } },
  props: [['_preacherBench'], ['barbell', { grip: 'supinated', plateR: 0.15 }]],
  ctx: { anchorX: ['pelvis'], anchorAt: [0, 0], plant: ['ankleL', 'ankleR'] },
  poses: {
    start: { trunk: 10, hip: 98, knee: 88, abd: 10, ground: [['pelvis', SEAT]], neck: 4, sh: 60, shAbd: 6, el: 15, protract: 0.02 },
    top: { trunk: 10, hip: 98, knee: 88, abd: 10, ground: [['pelvis', SEAT]], neck: 4, sh: 60, shAbd: 6, el: 128, protract: 0.02 },
  },
  rest: 'start',
  rep: [
    { to: 'top', dur: 1.0, phase: 0 },
    { to: 'top', dur: 0.5, phase: 1 },
    { to: 'start', dur: 2.5, phase: 2 },
  ],
  setup: { tr: 'Koltuk altların pedin üst kenarında, üst kollar pedde. Barı omuz genişliğinde, avuçlar yukarı tut.',
    en: 'Armpits on the top edge, upper arms flat on the pad. Shoulder-width grip, palms up.',
    es: 'Axilas en el borde, brazos apoyados en el cojín. Agarre al ancho de hombros, palmas arriba.' },
  phases: [
    { name: { tr: 'Kaldır', en: 'Curl', es: 'Sube' }, breath: 'out', line: ['shoulderR', 'elbowR'],
      text: { tr: 'Barı çeneye doğru kaldır. Dirsekler pedden kalkmaz.', en: 'Curl the bar toward your chin. Elbows stay on the pad.', es: 'Sube la barra hacia la barbilla. Codos en el cojín.' } },
    { name: { tr: 'Tepede sık', en: 'Squeeze', es: 'Aprieta' }, breath: 'hold', marks: [{ type: 'mark', joint: 'elbowR' }],
      text: { tr: 'Ön kollar dike yakın. Bir an sık.', en: 'Forearms near vertical. Squeeze for a moment.', es: 'Antebrazos casi verticales. Aprieta un momento.' } },
    { name: { tr: 'Yavaş indir', en: 'Lower slowly', es: 'Baja despacio' }, breath: 'in', arc: ['shoulderR', 'elbowR', 'wristR'],
      text: { tr: 'Kol neredeyse düzleşene kadar indir. Altta dirsek hafif bükülü kalır.', en: 'Lower until almost straight. Keep a slight bend at the bottom.', es: 'Baja hasta casi estirar. Mantén el codo un poco flexionado.' } },
  ],
  tempoText: { tr: '1 sn kaldır · 0,5 sn sık · 2,5 sn indir', en: '1 s up · 0.5 s squeeze · 2.5 s down', es: '1 s sube · 0,5 s aprieta · 2,5 s baja' },
  mistakes: [
    { title: { tr: 'Gövdeyle savurmak', en: 'Heaving with the torso', es: 'Impulso con el torso' },
      fix: { tr: 'Göğüs pedde kalsın', en: 'Chest stays on the pad', es: 'Pecho en el cojín' },
      fixText: { tr: 'Daha hafif ağırlık seç, dirsekler pedde', en: 'Go lighter, elbows on the pad', es: 'Usa menos peso, codos en el cojín' },
      at: 'top', pose: { trunk: -6, hip: 84, lumbar: -6, sh: 74, el: 122, neck: -4 }, line: ['pelvis', 'neck'], parts: ['waist', 'chest', 'upperR'] },
    { title: { tr: 'Altta kilitlemek', en: 'Dropping into lockout', es: 'Bloquear abajo' },
      fix: { tr: 'Hafif bükülü bitir', en: 'Stop with a slight bend', es: 'Para con el codo algo flexionado' },
      fixText: { tr: 'Son 10-15°’de yavaşla, dirseği koru', en: 'Slow down in the last 10-15° to protect the elbow', es: 'Frena en los últimos 10-15° para cuidar el codo' },
      at: 'start', pose: { el: 0, shrug: 0.02 }, marks: ['elbowR'], line: ['shoulderR', 'elbowR', 'wristR'], parts: ['foreR', 'foreL'] },
  ],
  cues: [{ tr: 'Koltuk altı pedde', en: 'Armpits on the pad', es: 'Axilas en el cojín' },
    { tr: 'Kaldır, savurma', en: 'Curl, do not heave', es: 'Sube sin impulso' },
    { tr: 'Altta hafif bükülü', en: 'Micro-bend at the bottom', es: 'Codo algo flexionado abajo' }],
};
}
