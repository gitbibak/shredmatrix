/* Bayesian cable curl (strength_pull), right arm. Facing away from a low pulley, split stance (right foot behind),
 * torso leaning ~12°, the working arm starts extended behind the torso (biceps stretched). FK right arm: the shoulder
 * moves from 35° extension to ~5°, the elbow bends 5 -> 148. Free hand on the left hip (holdL IK).
 * Local prop `_bayesianStation`: tower behind-left, low pulley behind the right hip, cable + D-handle in the right hand.
 * Spec: trunk 12-15, shoulder extension 35 -> 10 -> 0, elbow 5 -> 145-150. */
{
const { V } = FB;
const PUL = [-0.78, 0.12, 0.2];
FB.PROPS._bayesianStation = (sol) => {
  const h = sol.J.handR, out = [];
  out.push({ t: 'box', c: [PUL[0] - 0.12, 1.05, -0.62], s: [0.26, 2.1, 0.24], m: 'frameDark', round: 0.01 });
  out.push({ t: 'box', c: [PUL[0], 0.06, -0.2], s: [0.08, 0.08, 0.84], m: 'frame' });
  out.push({ t: 'sph', c: PUL, r: 0.04, m: 'iron' });
  const back = V.add(h, V.mul(V.norm(V.sub(PUL, h)), 0.06));
  out.push({ t: 'tube', pts: [PUL, back], r: 0.004, m: 'chrome' });
  // D-handle: grip bar across the palm + the D loop to the cable
  const ax = [0, 0, 1];
  out.push({ t: 'cyl', a: V.add(h, V.mul(ax, -0.055)), b: V.add(h, V.mul(ax, 0.055)), r: 0.016, m: 'rubber' });
  out.push({ t: 'tube', pts: [V.add(h, [0, 0, -0.06]), V.lerp(V.add(h, [0, 0, -0.04]), back, 0.8), back, V.lerp(V.add(h, [0, 0, 0.04]), back, 0.8), V.add(h, [0, 0, 0.06])], r: 0.006, m: 'chrome' });
  sol.grip = { R: ax }; sol.gripKind = 'supinated';
  return out;
};
const BASE = { trunk: 13, hipL: 30, kneeL: 32, hipR: -2, kneeR: 4, abd: 5, neck: -2,
  holdL: [0.03, -0.25, 0.17], elbowPoleL: [-0.4, 0, 1], palmL: 'in', curlL: 0.4 };

window.EXERCISE = {
  id: 'bayesian_curl',
  name: { tr: 'Bayesian Curl', en: 'Bayesian Cable Curl', es: 'Curl bayesiano en polea' },
  category: { tr: 'Kol', en: 'Arms', es: 'Brazos' },
  equipmentLabel: { tr: 'Kablo · Tek tutamaç', en: 'Cable · D-handle', es: 'Polea · Agarre en D' },
  muscles: ['biceps', 'forearms'],
  tempo: '1-0.5-2.5',
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 140, pitch: 10, title: { tr: 'Arkadan çapraz', en: 'Rear angle', es: 'Vista trasera' },
    text: { tr: 'Kol gövdenin arkasında başlar, dirsek yerinde', en: 'The arm starts behind you, the elbow stays put', es: 'El brazo empieza atrás, el codo no se mueve' } },
  props: [['_bayesianStation']],
  ctx: { anchorX: ['ankleL', 'ankleR'], plant: ['ankleL', 'ankleR'] },
  poses: {
    start: Object.assign({}, BASE, { shR: -35, shAbdR: 8, elR: 5 }),
    top: Object.assign({}, BASE, { shR: -5, shAbdR: 6, shRotR: -6, elR: 148 }),
  },
  rest: 'start',
  rep: [
    { to: 'top', dur: 1.0, phase: 0 },
    { to: 'top', dur: 0.5, phase: 1 },
    { to: 'start', dur: 2.5, phase: 2 },
  ],
  setup: { tr: 'Makaraya sırtını dön, bir adım öne çık. Sağ ayak geride, kol gövdenin arkasında. Sonra taraf değiştir.',
    en: 'Back to the pulley, step forward. Right foot behind, arm behind your body. Then switch sides.',
    es: 'De espaldas a la polea, paso al frente. Pie derecho atrás, brazo detrás. Luego cambia de lado.' },
  phases: [
    { name: { tr: 'Kaldır', en: 'Curl', es: 'Sube' }, breath: 'out', line: ['shoulderR', 'elbowR'],
      text: { tr: 'Tutamacı omzun önüne getir. Dirsek gövdenin yanında kalır.', en: 'Curl the handle to the front of the shoulder. Elbow stays beside you.', es: 'Lleva el agarre al hombro. El codo queda a tu lado.' } },
    { name: { tr: 'Tepede sık', en: 'Squeeze', es: 'Aprieta' }, breath: 'hold', marks: [{ type: 'mark', joint: 'elbowR' }],
      text: { tr: 'Biceps’i sık, omuz aşağıda.', en: 'Squeeze the biceps, shoulder down.', es: 'Aprieta el bíceps, hombro abajo.' } },
    { name: { tr: 'Yavaş indir', en: 'Lower slowly', es: 'Baja despacio' }, breath: 'in', arc: ['hipR', 'shoulderR', 'elbowR'],
      text: { tr: 'Kol yeniden gövdenin arkasına gidene kadar yavaşça indir.', en: 'Lower slowly until the arm is behind your body again.', es: 'Baja despacio hasta que el brazo vuelva atrás.' } },
  ],
  tempoText: { tr: '1 sn kaldır · 0,5 sn sık · 2,5 sn indir', en: '1 s up · 0.5 s squeeze · 2.5 s down', es: '1 s sube · 0,5 s aprieta · 2,5 s baja' },
  mistakes: [
    { title: { tr: 'Yeterince öne çıkmamak', en: 'Not stepping far enough', es: 'Sin avanzar lo suficiente' },
      fix: { tr: 'Bir adım daha öne çık', en: 'Step further forward', es: 'Avanza un paso más' },
      fixText: { tr: 'Kol gövdenin arkasında başlamalı, biceps gerilir', en: 'The arm must start behind you to stretch the biceps', es: 'El brazo debe empezar atrás para estirar' },
      at: 'start', pose: { shR: 2, elR: 12 }, marks: ['handR'], line: ['hipR', 'shoulderR', 'elbowR'], parts: ['upperR', 'foreR'] },
    { title: { tr: 'Dirsek öne kalkıyor', en: 'Elbow swings forward', es: 'El codo sube adelante' },
      fix: { tr: 'Dirsek yerinde, omuz aşağıda', en: 'Elbow fixed, shoulder down', es: 'Codo fijo, hombro abajo' },
      fixText: { tr: 'Üst kol sabit kalır, sadece ön kol döner', en: 'Upper arm stays put, only the forearm turns', es: 'El brazo no se mueve, solo el antebrazo' },
      at: 'top', pose: { shR: 45, elR: 125, shrugR: 0.04 }, marks: ['elbowR'], line: ['shoulderR', 'elbowR'], parts: ['upperR'] },
  ],
  cues: [{ tr: 'Kol arkada başlar', en: 'Arm starts behind you', es: 'El brazo empieza atrás' },
    { tr: 'Dirsek yerinde', en: 'Elbow stays put', es: 'Codo quieto' },
    { tr: 'Altta gerilmeyi hisset', en: 'Feel the stretch at the bottom', es: 'Siente el estiramiento abajo' }],
};
}
