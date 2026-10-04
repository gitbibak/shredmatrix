/* Meadows row (landmine), right arm. Staggered stance (left = inside foot forward), hinge ~50°, left hand on the front
 * thigh, right hand grips the end of a landmine bar anchored on the floor to the lifter's left. The bar pivots about the
 * anchor (local prop `_landmine`: base, bar from the anchor to the hand, plates just inside the grip).
 * Right hand: world IK targets built lazily from the solved body (thorax frame), so they use the rig's real dimensions.
 * Spec: trunk 50 -> 48, elbow 0 -> 105-110, hand to the hip. */
{
const { V, M } = FB;
const ANCHOR = [1.25, 0.05, -1.7];
const CTX = { anchorX: ['ankleL', 'ankleR'] };
FB.PROPS._landmine = (sol) => {
  const h = sol.J.handR, ax = V.norm(V.sub(h, ANCHOR)), out = [];
  out.push({ t: 'box', c: [ANCHOR[0], 0.03, ANCHOR[2]], s: [0.32, 0.06, 0.32], m: 'frameDark', round: 0.01 });
  out.push({ t: 'sph', c: ANCHOR, r: 0.05, m: 'frame' });
  out.push({ t: 'cyl', a: ANCHOR, b: V.add(h, V.mul(ax, 0.06)), r: 0.014, m: 'chrome' });
  out.push({ t: 'cyl', a: V.add(h, V.mul(ax, -0.3)), b: V.add(h, V.mul(ax, 0.06)), r: 0.025, m: 'chrome' });   // sleeve
  for (const d of [0.12, 0.165]) out.push({ t: 'cyl', a: V.sub(h, V.mul(ax, d)), b: V.sub(h, V.mul(ax, d + 0.045)), r: 0.17, m: 'plate' });
  sol.grip = { R: ax }; sol.gripKind = 'pronated';
  return out;
};
const BODY = { trunk: 50, hipL: 62, kneeL: 34, hipR: 44, kneeR: 18, abdL: 10, abdR: 6, hrotL: 8, neck: -8,
  holdL: [0.2, -0.36, 0.02], elbowPoleL: [-0.2, -0.3, 1], palmL: 'back', curlL: 0.3, elbowPoleR: [-1, -0.3, 0.3] };
const startB = Object.assign({}, BODY, { protractR: 0.05 });
const topB = Object.assign({}, BODY, { trunk: 48, protractR: -0.03 });
const TOP_REL = [0.08, 0.0, 0.2];
const hand = (pose, rel) => {
  const s = FB.solve(FB.expand(pose), CTX), T = s.F.thorax;
  const p = rel === 'hang' ? V.add(s.J.shoulderR, [0.0, -0.556, 0.02]) : V.add(s.J.waist, M.apply(T, rel));
  return { handR: { at: p.map((x) => +x.toFixed(3)) } };
};
const twistB = Object.assign({}, topB, { twist: 26, protractR: -0.05 });
const upB = Object.assign({}, topB, { trunk: 20, hipL: 30, hipR: 14, kneeL: 22, kneeR: 16 });
let _lazy = null;
const lazy = () => _lazy || (_lazy = {
  poses: { start: Object.assign({}, startB, { ik: hand(startB, 'hang') }), top: Object.assign({}, topB, { ik: hand(topB, TOP_REL) }) },
  mistakes: [
    { title: { tr: 'Gövdeyi döndürmek', en: 'Rotating the torso', es: 'Girar el torso' },
      fix: { tr: 'Omuzlar kare, göğüs önde', en: 'Square shoulders, chest forward', es: 'Hombros cuadrados, pecho al frente' },
      fixText: { tr: 'Daha hafif yükle, sadece kol ve sırt çeker', en: 'Load less; only arm and back pull', es: 'Menos carga; tiran brazo y espalda' },
      at: 'top', pose: Object.assign({}, twistB, { ik: hand(twistB, TOP_REL) }), view: { yaw: 160, pitch: 40 }, line: ['shoulderL', 'shoulderR'], goodLine: ['shoulderL', 'shoulderR'], parts: ['chest', 'waist'] },
    { title: { tr: 'Çekerken dikleşmek', en: 'Standing up during the pull', es: 'Incorporarse al tirar' },
      fix: { tr: 'Menteşe açısını koru', en: 'Hold the hinge angle', es: 'Mantén la bisagra' },
      fixText: { tr: 'Gövde ~50° öne eğik kalır', en: 'Torso stays leaned ~50°', es: 'El torso queda a ~50°' },
      at: 'top', pose: Object.assign({}, upB, { ik: hand(upB, TOP_REL) }), view: { yaw: 90, pitch: 8 }, line: ['pelvis', 'neck'], parts: ['pelvis', 'waist', 'chest'] },
  ],
});

window.EXERCISE = {
  id: 'meadows_row',
  name: { tr: 'Meadows Row', en: 'Meadows Row (Landmine)', es: 'Remo Meadows' },
  category: { tr: 'Sırt', en: 'Back', es: 'Espalda' },
  equipmentLabel: { tr: 'Landmine · Barbell', en: 'Landmine · Barbell', es: 'Landmine · Barra' },
  muscles: ['lats', 'upperback', 'delts', 'biceps'],
  tempo: '1-0.5-2',
  view: { yaw: 50, pitch: 12 },
  alt: { yaw: 90, pitch: 8, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
    text: { tr: 'Dirsek kalçaya, gövde açısı sabit', en: 'Elbow to the hip, torso angle fixed', es: 'Codo a la cadera, torso fijo' } },
  setupView: { yaw: 20, pitch: 22 },
  props: [['_landmine']],
  ctx: { anchorX: ['ankleL', 'ankleR'], plant: ['ankleL', 'ankleR'] },
  get poses() { return lazy().poses; },
  rest: 'start',
  rep: [
    { to: 'top', dur: 1.3, phase: 0 },
    { to: 'top', dur: 0.5, phase: 1 },
    { to: 'start', dur: 2.0, phase: 2 },
  ],
  setup: { tr: 'Bara dik dur, sol ayak önde. Öne eğil, sol el uylukta. Sağ elle barın ucunu üstten tut. Sonra taraf değiştir.',
    en: 'Stand side-on to the bar, left foot forward. Hinge, left hand on thigh, right hand on the bar end. Switch sides.',
    es: 'De lado a la barra, pie izquierdo delante. Inclínate, mano izquierda en el muslo. Luego cambia.' },
  phases: [
    { name: { tr: 'Çek', en: 'Row', es: 'Tira' }, breath: 'out', line: ['pelvis', 'neck'],
      text: { tr: 'Dirseği yukarı ve geriye, kalçaya doğru sür. Bar yay çizer.', en: 'Drive the elbow up and back to the hip. The bar swings in an arc.', es: 'Lleva el codo arriba y atrás hacia la cadera. La barra hace un arco.' } },
    { name: { tr: 'Sık', en: 'Squeeze', es: 'Aprieta' }, breath: 'hold', marks: [{ type: 'mark', joint: 'elbowR' }],
      text: { tr: 'Dirsek gövdenin arkasında, göğüs önde kalır.', en: 'Elbow behind the torso, chest stays forward.', es: 'Codo detrás del torso, pecho al frente.' } },
    { name: { tr: 'Uzat', en: 'Stretch', es: 'Estira' }, breath: 'in', line: ['pelvis', 'neck'],
      text: { tr: 'Kol tamamen uzayana kadar indir, kanat kası gerilsin.', en: 'Lower until the arm is long and the lat stretches.', es: 'Baja hasta estirar el brazo y el dorsal.' } },
  ],
  tempoText: { tr: '1,3 sn çek · 0,5 sn sık · 2 sn indir', en: '1.3 s row · 0.5 s squeeze · 2 s lower', es: '1,3 s tira · 0,5 s aprieta · 2 s baja' },
  get mistakes() { return lazy().mistakes; },
  cues: [{ tr: 'Dirsek kalçaya', en: 'Elbow to hip', es: 'Codo a la cadera' },
    { tr: 'Göğüs önde, dönme yok', en: 'Chest forward, no twist', es: 'Pecho al frente, sin girar' },
    { tr: 'Altta kol uzun', en: 'Long arm at the bottom', es: 'Brazo largo abajo' }],
};
}
