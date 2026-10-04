/* Chest-supported dumbbell row (strength_pull). Chest and belly on a 45° incline pad, feet planted behind, both arms row.
 * The pad is a local prop (`_csrPad`) fitted once to the solved start pose and fixed in the world, so the "chest lifts"
 * mistake visibly leaves it. Hands: world IK targets built lazily (after the rig's body dimensions exist) from the solved
 * thorax frame; elbows ~45° from the torso.
 * Spec: trunk 45, hip 20, knee 15, arms hanging (upper arm 0° from vertical) -> elbow 100-105, elbows just above the torso line. */
{
const { V, M } = FB;
const CTX = { anchorX: ['ankleL', 'ankleR'] };
const slab = (a, b, w, th, m) => {
  const X = V.norm(V.sub(b, a)), Z = [0, 0, 1], Y = V.cross(Z, X);
  return { t: 'box', c: V.lerp(a, b, 0.5), s: [V.len(V.sub(b, a)), th, w], R: [X, Y, Z], m, round: 0.02 };
};
const BODY = { trunk: 45, hip: 20, knee: 15, abd: 6, flat: false, ankle: 6, neck: 6, elbowPole: [-1, -0.25, 0.9] };
const startB = Object.assign({}, BODY, { protract: 0.04 });
const topB = Object.assign({}, BODY, { protract: -0.03 });
const liftB = Object.assign({}, BODY, { trunk: 38, hip: 14, knee: 14, protract: -0.03, lumbar: -5, neck: -6 });
const flareB = Object.assign({}, BODY, { protract: -0.01, shrug: 0.03, elbowPole: [-0.3, -0.1, 1] });
const hands = (pose, rel) => {
  const s = FB.solve(FB.expand(pose), CTX), T = s.F.thorax, o = {};
  for (const [S, sg] of [['L', -1], ['R', 1]]) {
    const p = rel === 'hang' ? V.add(s.J['shoulder' + S], [0, -0.556, sg * 0.03]) : V.add(s.J.waist, M.apply(T, [rel[0], rel[1], rel[2] * sg]));
    o['hand' + S] = { at: p.map((x) => +x.toFixed(3)) };
  }
  return o;
};
let fit = null;
FB.PROPS._csrPad = () => {
  if (!fit) {
    const s = FB.solve(FB.expand(startB), CTX), T = s.F.thorax, fwd = M.apply(T, [1, 0, 0]), up = M.apply(T, [0, 1, 0]);
    const top = V.add(V.add(s.J.neck, V.mul(up, -0.1)), V.mul(fwd, 0.16));
    const a = [top[0], top[1], 0], b = V.add(a, V.mul([up[0], up[1], 0], -0.8));
    fit = { a, b, fwd };
  }
  const out = [slab(fit.b, fit.a, 0.3, 0.08, 'pad')];
  const mid = V.lerp(fit.a, fit.b, 0.5), foot = [mid[0] + 0.05, 0.04, 0], under = V.add(mid, V.mul(fit.fwd, 0.05));
  out.push({ t: 'cyl', a: [under[0], under[1], 0], b: foot, r: 0.03, m: 'frame' });
  out.push({ t: 'box', c: [foot[0], 0.02, 0], s: [0.9, 0.04, 0.42], m: 'frame' });
  return out;
};
const TOP_REL = [0.07, -0.04, 0.2];
let _lazy = null;
const lazy = () => _lazy || (_lazy = {
  poses: {
    start: Object.assign({}, startB, { ik: hands(startB, 'hang') }),
    top: Object.assign({}, topB, { ik: hands(topB, TOP_REL) }),
  },
  mistakes: [
    { title: { tr: 'Göğüs pedden kalkıyor', en: 'Chest lifts off the pad', es: 'El pecho se despega' },
      fix: { tr: 'Göğüs pedde kalsın', en: 'Keep the chest on the pad', es: 'Pecho en el banco' },
      fixText: { tr: 'Ağırlığı azalt, sadece kollar ve sırt çalışır', en: 'Go lighter; only arms and back move', es: 'Usa menos peso; solo brazos y espalda' },
      at: 'top', pose: Object.assign({}, liftB, { ik: hands(liftB, TOP_REL) }), line: ['pelvis', 'neck'], parts: ['chest', 'waist'] },
    { title: { tr: 'Dirsekler açık, yarım hareket', en: 'Flared elbows, half range', es: 'Codos abiertos, medio recorrido' },
      fix: { tr: 'Dirsekler 45° geriye', en: 'Elbows back at 45°', es: 'Codos atrás a 45°' },
      fixText: { tr: 'Dirsekleri kaburgalara doğru sonuna kadar çek', en: 'Drive the elbows all the way back to the ribs', es: 'Lleva los codos atrás hasta las costillas' },
      at: 'top', pose: Object.assign({}, flareB, { ik: hands(flareB, [0.13, 0.18, 0.3]) }), view: { yaw: -20, pitch: 55 }, marks: ['elbowR', 'elbowL'], parts: ['upperR', 'upperL'] },
  ],
});

window.EXERCISE = {
  id: 'chest_supported_row',
  name: { tr: 'Göğüs Destekli Row', en: 'Chest-Supported Row', es: 'Remo con apoyo en el pecho' },
  category: { tr: 'Sırt', en: 'Back', es: 'Espalda' },
  equipmentLabel: { tr: 'Dambıl · Incline bench', en: 'Dumbbells · Incline bench', es: 'Mancuernas · Banco inclinado' },
  muscles: ['lats', 'upperback', 'delts', 'biceps'],
  tempo: '1-1-2',
  view: { yaw: 90, pitch: 8 },
  alt: { yaw: 40, pitch: 16, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Dirsekler 45° açıyla geriye gider', en: 'Elbows travel back at 45°', es: 'Los codos van atrás a 45°' } },
  props: [['_csrPad'], ['dumbbell', { grip: 'neutral' }]],
  ctx: { anchorX: ['ankleL', 'ankleR'], plant: ['ankleL', 'ankleR'] },
  get poses() { return lazy().poses; },
  rest: 'start',
  rep: [
    { to: 'top', dur: 1.2, phase: 0 },
    { to: 'top', dur: 1.0, phase: 1 },
    { to: 'start', dur: 2.0, phase: 2 },
  ],
  setup: { tr: 'Göğsün ve karnın 45° bench’te, ayaklar arkada yerde. Dambıllar omuzların altında sarkar.',
    en: 'Chest and belly on a 45° bench, feet on the floor behind. Dumbbells hang under the shoulders.',
    es: 'Pecho y abdomen en el banco a 45°, pies atrás. Mancuernas bajo los hombros.' },
  phases: [
    { name: { tr: 'Çek', en: 'Row', es: 'Tira' }, breath: 'out', line: ['pelvis', 'neck'],
      text: { tr: 'Dambılları alt kaburgalara çek. Göğüs pedde kalır.', en: 'Row the bells to your lower ribs. Chest stays on the pad.', es: 'Lleva las mancuernas a las costillas. Pecho en el banco.' } },
    { name: { tr: 'Sık', en: 'Squeeze', es: 'Aprieta' }, breath: 'hold', marks: [{ type: 'mark', joint: 'elbowR' }],
      text: { tr: 'Bir saniye kürek kemiklerini sık.', en: 'Squeeze the shoulder blades for a second.', es: 'Junta las escápulas un segundo.' } },
    { name: { tr: 'Kontrollü indir', en: 'Lower slowly', es: 'Baja despacio' }, breath: 'in', line: ['pelvis', 'neck'],
      text: { tr: 'Kollar düzleşene kadar indir, omuzlar öne kayar.', en: 'Lower until the arms are straight, shoulders reach forward.', es: 'Baja hasta estirar, los hombros van adelante.' } },
  ],
  tempoText: { tr: '1 sn çek · 1 sn sık · 2 sn indir', en: '1 s row · 1 s squeeze · 2 s lower', es: '1 s tira · 1 s aprieta · 2 s baja' },
  get mistakes() { return lazy().mistakes; },
  cues: [{ tr: 'Göğüs pedde', en: 'Chest on the pad', es: 'Pecho en el banco' },
    { tr: 'Dirsekler geriye, yukarı değil', en: 'Elbows back, not up', es: 'Codos atrás, no arriba' },
    { tr: 'Kürek kemiklerini sık', en: 'Squeeze the shoulder blades', es: 'Junta las escápulas' }],
};
}
