/* Triceps pushdown (high pulley, short straight bar, overhand). FK arms: upper arms pinned along the trunk (sh 0),
 * only the elbow moves 90 -> 0. Cable station + bar is a local prop (`_pushdownBar`, from straight_arm_pulldown.js)
 * with the pulley ~25 cm in front of the body; the stack tower stands off to the left so it never hides the body. */
{
const { V } = FB;
const PUL = [0.42, 2.1, 0];
FB.PROPS._pushdownBar = (sol) => {
  const hL = sol.J.handL, hR = sol.J.handR, ax = V.norm(V.sub(hR, hL)), mid = V.lerp(hL, hR, 0.5);
  sol.grip = { L: ax, R: ax }; sol.gripKind = 'pronated';
  const lift = Math.max(0, Math.min(0.4, (1.2 - mid[1]) * 0.6));
  return [
    { t: 'box', c: [PUL[0] + 0.1, 1.15, -0.8], s: [0.3, 2.3, 0.24], m: 'frameDark', round: 0.01 },
    { t: 'box', c: [PUL[0], PUL[1] + 0.07, -0.4], s: [0.08, 0.08, 0.8], m: 'frame' },
    { t: 'sph', c: PUL, r: 0.045, m: 'iron' },
    { t: 'tube', pts: [PUL, mid], r: 0.004, m: 'chrome' },
    { t: 'cyl', a: V.add(hL, V.mul(ax, -0.09)), b: V.add(hR, V.mul(ax, 0.09)), r: 0.014, m: 'chrome' },
    { t: 'sph', c: mid, r: 0.022, m: 'iron' },
    { t: 'box', c: [PUL[0] + 0.1, 0.3 + lift, -0.66], s: [0.22, 0.36, 0.04], m: 'plate' },
  ];
};
const ST = { trunk: 10, hip: 10, knee: 10, abd: 5, hrot: 6, neck: -4, sh: 0, shAbd: 3 };
window.EXERCISE = {
  id: 'triceps_pushdown',
  name: { tr: 'Triceps Pushdown', en: 'Triceps Pushdown', es: 'Extensión de tríceps en polea' },
  category: { tr: 'Kol', en: 'Arms', es: 'Brazos' },
  equipmentLabel: { tr: 'Kablo · Düz bar', en: 'Cable · Straight bar', es: 'Polea · Barra recta' },
  muscles: ['triceps', 'forearms'],
  tempo: '1.2-0.5-1.8',
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 25, pitch: 8, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' }, text: { tr: 'Dirsekler gövdenin yanında sabit', en: 'Elbows stay pinned at the sides', es: 'Codos fijos a los lados' } },
  setupView: { yaw: 40, pitch: 10 },
  setupMarks: [{ type: 'span', joints: ['ankleR', 'ankleL'], label: { tr: 'Kalça genişliği', en: 'Hip width', es: 'Ancho de cadera' } }],
  props: [['_pushdownBar']],
  ctx: { anchorX: ['ankleL', 'ankleR'], plant: ['ankleL', 'ankleR'] },
  poses: {
    start: { ...ST, el: 90 },
    bottom: { ...ST, sh: -5, el: 2 },
  },
  rest: 'start',
  rep: [
    { to: 'bottom', dur: 1.2, phase: 0 },
    { to: 'bottom', dur: 0.5, phase: 1 },
    { to: 'start', dur: 1.8, phase: 2 },
  ],
  setup: { tr: 'Makineye yakın dur, hafif öne eğil. Dirsekler gövdenin yanında, ön kollar yere paralel.',
    en: 'Stand close to the stack, lean slightly forward. Elbows at your sides, forearms level.',
    es: 'Cerca de la polea, inclínate un poco. Codos a los lados, antebrazos horizontales.' },
  phases: [
    { name: { tr: 'İt', en: 'Push down', es: 'Empuja' }, breath: 'out', line: ['shoulderR', 'elbowR'],
      text: { tr: 'Dirsekleri düzelterek barı uyluklara kadar it. Üst kollar sabit.', en: 'Straighten the elbows and push the bar to your thighs. Upper arms still.', es: 'Estira los codos y lleva la barra a los muslos. Brazos quietos.' } },
    { name: { tr: 'Sık', en: 'Squeeze', es: 'Aprieta' }, breath: 'hold', arc: ['shoulderR', 'elbowR', 'wristR'],
      text: { tr: 'Kollar tam düz, tricepsi sık.', en: 'Arms fully straight, squeeze the triceps.', es: 'Brazos rectos, aprieta el tríceps.' } },
    { name: { tr: 'Kontrollü bırak', en: 'Return slowly', es: 'Vuelve despacio' }, breath: 'in', line: ['shoulderR', 'elbowR'],
      text: { tr: 'Ön kollar yere paralel olana kadar yavaşça kaldır, daha yukarı değil.', en: 'Let the bar rise slowly until the forearms are level, no higher.', es: 'Sube despacio hasta antebrazos horizontales, no más.' } },
  ],
  tempoText: { tr: '1,2 sn it · 0,5 sn sık · 1,8 sn bırak', en: '1.2 s down · 0.5 s squeeze · 1.8 s up', es: '1,2 s abajo · 0,5 s aprieta · 1,8 s arriba' },
  mistakes: [
    { title: { tr: 'Dirsekler öne kayıyor', en: 'Elbows drift forward', es: 'Los codos se adelantan' },
      fix: { tr: 'Dirsekleri yana sabitle', en: 'Pin the elbows to your sides', es: 'Codos pegados al cuerpo' },
      fixText: { tr: 'Sadece ön kollar hareket eder', en: 'Only the forearms move', es: 'Solo se mueven los antebrazos' },
      at: 'bottom', pose: { sh: 32, shAbd: 18, el: 30 }, line: ['shoulderR', 'elbowR'], parts: ['upperR'] },
    { title: { tr: 'Gövdeyle bara yükleniyor', en: 'Leaning over the bar', es: 'Echarse sobre la barra' },
      fix: { tr: 'Daha hafif ağırlık, gövde dik', en: 'Go lighter, torso upright', es: 'Menos peso, torso recto' },
      fixText: { tr: 'Gövde sadece ~10° öne eğik', en: 'Torso leans only ~10°', es: 'Torso inclinado solo ~10°' },
      at: 'bottom', pose: { trunk: 38, hip: 40, knee: 18, neck: -10 }, line: ['pelvis', 'neck'], parts: ['waist', 'chest'] },
  ],
  cues: [{ tr: 'Dirsekler yanda sabit', en: 'Elbows pinned', es: 'Codos fijos' }, { tr: 'Aşağıda tam düzelt', en: 'Lock out at the bottom', es: 'Extiende del todo abajo' }, { tr: 'Omuzlar aşağıda', en: 'Shoulders down', es: 'Hombros abajo' }],
};
}
