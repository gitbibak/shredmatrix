/* Spider curl (strength_pull). Chest down on a 45° incline pad, arms hanging vertically over the top edge, toes on the floor.
 * The pad is a local prop (`_spiderPad`) fitted once to the solved start pose (lies on the chest/belly, top edge just below
 * the armpits); it stays fixed in the world. FK arms: `sh` 45 relative to
 * the trunk = upper arm vertical; only the elbow bends. Spec: trunk 45, hip 30, knee 20, shoulder 45, elbow 5 -> 140-145. */
{
const { V, M } = FB;
const slab = (a, b, w, th, m) => {
  const X = V.norm(V.sub(b, a)), Z = [0, 0, 1], Y = V.cross(Z, X);
  return { t: 'box', c: V.lerp(a, b, 0.5), s: [V.len(V.sub(b, a)), th, w], R: [X, Y, Z], m, round: 0.02 };
};
let fit = null;
FB.PROPS._spiderPad = () => {
  if (!fit) {
    const ex = window.EXERCISE, s = FB.solve(FB.expand(ex.poses.start), { anchorX: ['ankleL', 'ankleR'] });
    const T = s.F.thorax, fwd = M.apply(T, [1, 0, 0]), up = M.apply(T, [0, 1, 0]);
    const off = 0.12 + 0.04;
    const top = V.add(V.add(s.J.neck, V.mul(up, -0.14)), V.mul(fwd, off));
    const a = [top[0], top[1], 0], b = V.add(a, V.mul([up[0], up[1], 0], -0.78));
    fit = { a, b, fwd };
  }
  const out = [slab(fit.b, fit.a, 0.32, 0.08, 'pad')];
  const mid = V.lerp(fit.a, fit.b, 0.55), foot = [mid[0] + 0.05, 0.04, 0];
  const under = V.add(mid, V.mul(fit.fwd, 0.05));
  out.push({ t: 'cyl', a: [under[0], under[1], 0], b: foot, r: 0.03, m: 'frame' });
  out.push({ t: 'box', c: [foot[0], 0.02, 0], s: [0.9, 0.04, 0.4], m: 'frame' });
  return out;
};

window.EXERCISE = {
  id: 'spider_curl',
  name: { tr: 'Spider Curl', en: 'Spider Curl', es: 'Curl araña' },
  category: { tr: 'Kol', en: 'Arms', es: 'Brazos' },
  equipmentLabel: { tr: 'Dambıl · Incline bench', en: 'Dumbbells · Incline bench', es: 'Mancuernas · Banco inclinado' },
  muscles: ['biceps', 'forearms'],
  tempo: '1-1-2',
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 42, pitch: 10, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Dirsekler yere bakar, üst kol dik', en: 'Elbows point down, upper arms vertical', es: 'Codos al suelo, brazos verticales' } },
  props: [['_spiderPad'], ['dumbbell', { grip: 'supinated', len: 0.28 }]],
  ctx: { anchorX: ['ankleL', 'ankleR'], plant: ['ankleL', 'ankleR'] },
  poses: {
    start: { trunk: 45, hip: 30, knee: 20, abd: 6, flat: false, ankle: 10, neck: 12, sh: 45, shAbd: 8, el: 6 },
    top: { trunk: 45, hip: 30, knee: 20, abd: 6, flat: false, ankle: 10, neck: 12, sh: 45, shAbd: 8, shRot: -12, el: 142 },
  },
  rest: 'start',
  rep: [
    { to: 'top', dur: 1.0, phase: 0 },
    { to: 'top', dur: 1.0, phase: 1 },
    { to: 'start', dur: 2.0, phase: 2 },
  ],
  setup: { tr: 'Göğsünü 45° bench’in sırt pedine yasla, ayak uçları yerde. Kollar aşağı sarkar, avuçlar öne.',
    en: 'Chest on the back of a 45° bench, toes on the floor. Arms hang straight down, palms forward.',
    es: 'Pecho sobre el respaldo a 45°, puntas en el suelo. Brazos colgando, palmas al frente.' },
  phases: [
    { name: { tr: 'Kaldır', en: 'Curl', es: 'Sube' }, breath: 'out', line: ['shoulderR', 'elbowR'],
      text: { tr: 'Dambılları omuzlara doğru kaldır. Üst kol dik kalır.', en: 'Curl the bells toward your shoulders. Upper arms stay vertical.', es: 'Sube las mancuernas a los hombros. Brazos verticales.' } },
    { name: { tr: 'Tepede sık', en: 'Squeeze', es: 'Aprieta' }, breath: 'hold', arc: ['shoulderR', 'elbowR', 'wristR'],
      text: { tr: 'Tam bir saniye sık. Dirsekler hâlâ yere bakar.', en: 'Squeeze for a full second. Elbows still point at the floor.', es: 'Aprieta un segundo. Codos hacia el suelo.' } },
    { name: { tr: 'Kontrollü indir', en: 'Lower slowly', es: 'Baja despacio' }, breath: 'in', line: ['shoulderR', 'elbowR'],
      text: { tr: 'İki saniyede kollar düzleşene kadar indir.', en: 'Take two seconds until the arms are straight.', es: 'Dos segundos hasta estirar los brazos.' } },
  ],
  tempoText: { tr: '1 sn kaldır · 1 sn sık · 2 sn indir', en: '1 s up · 1 s squeeze · 2 s down', es: '1 s sube · 1 s aprieta · 2 s baja' },
  mistakes: [
    { title: { tr: 'Dirsekler geriye kaçıyor', en: 'Elbows drift back', es: 'Codos hacia atrás' },
      fix: { tr: 'Üst kolu dik tut', en: 'Keep the upper arms vertical', es: 'Brazos verticales' },
      fixText: { tr: 'Dirsekler omuzların altında, sallanmadan', en: 'Elbows under the shoulders, no swinging', es: 'Codos bajo los hombros, sin balanceo' },
      at: 'top', pose: { sh: 18, el: 135 }, marks: ['elbowR'], line: ['shoulderR', 'elbowR'], parts: ['upperR', 'upperL'] },
    { title: { tr: 'Omuzlar kulağa kalkıyor', en: 'Shrugging the shoulders', es: 'Encoger los hombros' },
      fix: { tr: 'Omuzları aşağı çek', en: 'Shoulders down', es: 'Hombros abajo' },
      fixText: { tr: 'Boyun uzun, iş biceps’te kalsın', en: 'Long neck, keep the work in the biceps', es: 'Cuello largo, que trabaje el bíceps' },
      at: 'top', pose: { shrug: 0.06, neck: 2, protract: 0.03 }, view: { yaw: 40, pitch: 10 }, marks: ['shoulderL', 'shoulderR'], parts: ['upper', 'neck'] },
  ],
  cues: [{ tr: 'Göğüs pedde', en: 'Chest glued to the bench', es: 'Pecho pegado al banco' },
    { tr: 'Dirsekler yere bakar', en: 'Elbows point at the floor', es: 'Codos hacia el suelo' },
    { tr: 'Tepede güçlü sık', en: 'Squeeze hard at the top', es: 'Aprieta fuerte arriba' }],
};
}
