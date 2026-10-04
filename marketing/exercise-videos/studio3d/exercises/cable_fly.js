/* Cable fly (high-to-low crossover), front view. Two towers with high pulleys either side (local prop `_crossover`),
 * cables to D-handles held with a neutral grip. Staggered stance (right foot forward), torso leaning ~20°.
 * FK arms with a fixed soft elbow (~18°): the arc comes from interpolating shoulder flexion/abduction, so the hands
 * sweep down and in to meet in front of the lower chest. */
{
const { V } = FB;
const PZ = 1.0, PY = 2.05, PX = -0.15;
FB.PROPS._crossover = (sol) => {
  const out = [];
  sol.grip = sol.grip || {};
  for (const s of ['L', 'R']) {
    const sg = s === 'R' ? 1 : -1, h = sol.J['hand' + s], pul = [PX, PY, sg * PZ];
    const fd = sol.F['arm' + s].fd; let ax = V.sub([0, 1, 0], V.mul(fd, fd[1])); ax = V.len(ax) > 1e-3 ? V.norm(ax) : [1, 0, 0];
    sol.grip[s] = ax;
    out.push({ t: 'box', c: [PX - 0.05, 1.15, sg * (PZ + 0.12)], s: [0.3, 2.3, 0.2], m: 'frameDark', round: 0.01 });
    out.push({ t: 'sph', c: pul, r: 0.045, m: 'iron' });
    out.push({ t: 'tube', pts: [pul, V.add(h, V.mul(ax, 0.07))], r: 0.004, m: 'chrome' });
    out.push({ t: 'cyl', a: V.add(h, V.mul(ax, -0.06)), b: V.add(h, V.mul(ax, 0.06)), r: 0.016, m: 'rubber' });
  }
  out.push({ t: 'box', c: [PX - 0.05, 2.32, 0], s: [0.12, 0.08, 2 * PZ + 0.44], m: 'frame' });
  sol.gripKind = 'neutral';
  return out;
};
const ST = { trunk: 20, hipR: 32, kneeR: 18, hipL: 4, kneeL: 10, abd: 5, hrot: 6, neck: -10, flat: true, el: 18, bend: [1, 0, 0] };
window.EXERCISE = {
  id: 'cable_fly',
  name: { tr: 'Kablo Fly', en: 'Cable Fly', es: 'Aperturas con cable' },
  category: { tr: 'Göğüs', en: 'Chest', es: 'Pecho' },
  equipmentLabel: { tr: 'Kablo crossover', en: 'Cable crossover', es: 'Cruce de poleas' },
  muscles: ['chest', 'delts'],
  tempo: '1.5-1-2',
  view: { yaw: 12, pitch: 8 },
  alt: { yaw: 80, pitch: 6, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' }, text: { tr: 'Gövde ~20° önde, dirsek açısı sabit', en: 'Torso ~20° forward, fixed elbow angle', es: 'Torso ~20° adelante, codo fijo' } },
  props: [['_crossover']],
  ctx: { anchorX: ['ankleL', 'ankleR'], anchorAt: [0.1, 0], plant: ['ankleL', 'ankleR'] },
  poses: {
    open: { ...ST, sh: 18, shAbd: 72, shRot: 0 },
    close: { ...ST, sh: 52, shAbd: -16, shRot: 0 },
  },
  rest: 'open',
  rep: [
    { to: 'close', dur: 1.5, phase: 0 },
    { to: 'close', dur: 1.0, phase: 1 },
    { to: 'open', dur: 2.0, phase: 2 },
  ],
  setup: { tr: 'İki makaranın ortasında, bir ayak önde. Hafif öne eğil, kollar yanlarda, dirsekler hafif bükülü.',
    en: 'Stand between the pulleys, one foot forward. Lean slightly, arms out wide, elbows soft.',
    es: 'Entre las poleas, un pie delante. Inclínate un poco, brazos abiertos, codos suaves.' },
  phases: [
    { name: { tr: 'Birleştir', en: 'Bring together', es: 'Junta' }, breath: 'out',
      text: { tr: 'Kolları bir yay çizerek aşağı ve öne getir, eller göğsün altında buluşsun.', en: 'Sweep the arms down and in; the hands meet in front of the lower chest.', es: 'Lleva los brazos en arco abajo y adentro; las manos se juntan.' } },
    { name: { tr: 'Sık', en: 'Squeeze', es: 'Aprieta' }, breath: 'hold', arc: ['shoulderR', 'elbowR', 'wristR'],
      text: { tr: 'Göğsü 1 saniye sık. Dirsek açısı değişmez.', en: 'Squeeze the chest for 1 second. Elbow angle stays the same.', es: 'Aprieta el pecho 1 segundo. El codo no cambia.' } },
    { name: { tr: 'Aç', en: 'Open', es: 'Abre' }, breath: 'in',
      text: { tr: 'Aynı yaydan yavaşça aç, göğüs hizasında dur.', en: 'Open slowly along the same arc; stop at the chest line.', es: 'Abre despacio por el mismo arco; para a la línea del pecho.' } },
  ],
  tempoText: { tr: '1,5 sn birleştir · 1 sn sık · 2 sn aç', en: '1.5 s in · 1 s squeeze · 2 s out', es: '1,5 s junta · 1 s aprieta · 2 s abre' },
  mistakes: [
    { title: { tr: 'Prese dönüyor', en: 'Turning it into a press', es: 'Convertirlo en press' },
      fix: { tr: 'Dirsek açısını sabit tut', en: 'Keep the elbow angle fixed', es: 'Mantén el ángulo del codo' },
      fixText: { tr: 'Dirsekler sadece ~15-20° bükülü', en: 'Elbows only ~15-20° bent', es: 'Codos solo ~15-20° flexionados' },
      at: 'open', pose: { sh: 30, shAbd: 62, el: 92 }, marks: ['elbowL', 'elbowR'], parts: ['foreR', 'foreL'] },
    { title: { tr: 'Aşırı açılma', en: 'Overstretching', es: 'Estirar de más' },
      fix: { tr: 'Göğüs hizasında dur', en: 'Stop at the chest line', es: 'Para a la línea del pecho' },
      fixText: { tr: 'Eller gövde hizasının çok gerisine gitmez', en: 'Hands never go far behind the body', es: 'Las manos no van muy atrás' },
      at: 'open', pose: { sh: -22, shAbd: 82, protract: -0.03 }, view: { yaw: 60, pitch: 20 }, marks: ['handL', 'handR'], parts: ['chest', 'upperR'] },
  ],
  cues: [{ tr: 'Dirsek açısı sabit', en: 'Fixed elbow angle', es: 'Codo fijo' }, { tr: 'Eller göğsün altında', en: 'Hands meet at the lower chest', es: 'Manos al pecho bajo' }, { tr: 'Gövde sabit', en: 'Torso still', es: 'Torso quieto' }],
};
}
