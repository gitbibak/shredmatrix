/* Bench dip, knees-bent version (spec alternative: feet flat, knees ~90). The straight-leg spec start (hip 80, heels
 * down, arms straight on a ~45 cm bench) is not consistent with the rig: the legs would have to slope down ~35°.
 * Feet and hands are planted from the top pose; FK legs set the pelvis height (heel contact), so lowering = more
 * hip/knee flexion with the hips sliding straight down beside the bench edge. The bench (`_dipBench`, crosswise
 * behind the body) is fitted once to the planted palm height. */
{
const { V } = FB;
let FIT = null;
FB.PROPS._dipBench = (sol) => {
  if (!FIT) {
    const ex = window.EXERCISE, s = FB.solve(FB.expand(ex.poses.top), Object.assign({}, ex.ctx, { plant: undefined }));
    FIT = { H: Math.max(0.3, s.J.handR[1] - 0.03 - 0.022 + 0.022), x: s.J.handR[0] };
  }
  const H = FIT.H, D = 0.34, W = 1.1, cx = FIT.x - D / 2 + 0.01;
  const out = [{ t: 'box', c: [cx, H - 0.045, 0], s: [D, 0.09, W], m: 'pad', round: 0.02 }];
  for (const z of [-W / 2 + 0.12, W / 2 - 0.12]) {
    out.push({ t: 'box', c: [cx, (H - 0.09) / 2, z], s: [0.06, H - 0.09, 0.06], m: 'frame' });
    out.push({ t: 'box', c: [cx, 0.02, z], s: [D + 0.12, 0.04, 0.08], m: 'frame' });
  }
  return out;
};
const ST = { trunk: 5, abd: 6, neck: 0, sh: -50, shAbd: 8, el: 0, handFlat: true, ground: [['heelR', 0]], elbowPole: [-1, -0.2, 0.15] };
window.EXERCISE = {
  id: 'bench_dip',
  name: { tr: 'Bench Dip', en: 'Bench Dip', es: 'Fondos en banco' },
  category: { tr: 'Kol · Göğüs', en: 'Arms · Chest', es: 'Brazos · Pecho' },
  equipmentLabel: { tr: 'Bench', en: 'Bench', es: 'Banco' },
  muscles: ['triceps', 'chest', 'delts'],
  tempo: '2-0-1.5',
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 20, pitch: 8, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' }, text: { tr: 'Dirsekler geriye bakar, yana değil', en: 'Elbows point back, not out', es: 'Codos hacia atrás, no a los lados' } },
  setupView: { yaw: 50, pitch: 12 },
  props: [['_dipBench']],
  ctx: { anchorX: ['ankleL', 'ankleR'], anchorAt: [0.45, 0], plant: ['ankleL', 'ankleR', 'handL', 'handR'] },
  poses: {
    top: { ...ST, hip: 100, knee: 75, el: 55 },
    bottom: { ...ST, hip: 109.5, knee: 60.5, trunk: 7 },
  },
  rest: 'top',
  rep: [
    { to: 'bottom', dur: 2.0, phase: 0 },
    { to: 'top', dur: 1.5, phase: 1 },
  ],
  setup: { tr: 'Eller benchin kenarında, kalçanın arkasında, parmaklar öne. Ayaklar yerde, dizler 90°.',
    en: 'Hands on the bench edge behind the hips, fingers forward. Feet flat, knees at 90°.',
    es: 'Manos en el borde del banco tras la cadera, dedos al frente. Pies apoyados, rodillas a 90°.' },
  phases: [
    { name: { tr: 'İniş', en: 'Lower', es: 'Baja' }, breath: 'in', arc: ['shoulderR', 'elbowR', 'wristR'],
      text: { tr: 'Dirsekleri geriye bükerek kalçayı benche yakın indir. 90°de dur.', en: 'Bend the elbows straight back, hips close to the bench. Stop at 90°.', es: 'Flexiona los codos hacia atrás, cadera cerca del banco. Para a 90°.' } },
    { name: { tr: 'İtiş', en: 'Press', es: 'Empuja' }, breath: 'out',
      text: { tr: 'Avuçlarla benche bastır, kollar düzleşene kadar yüksel.', en: 'Press through the palms until the arms are straight.', es: 'Empuja con las palmas hasta estirar los brazos.' } },
  ],
  tempoText: { tr: '2 sn in · 1,5 sn çık', en: '2 s down · 1.5 s up', es: '2 s abajo · 1,5 s arriba' },
  mistakes: [
    { title: { tr: 'Dirsekler yana açılıyor', en: 'Elbows flare out', es: 'Codos abiertos' },
      fix: { tr: 'Dirsekler geriye baksın', en: 'Point the elbows back', es: 'Codos hacia atrás' },
      fixText: { tr: 'Omuz önü korunur, triceps çalışır', en: 'Spares the shoulders, works the triceps', es: 'Cuida los hombros, trabaja el tríceps' },
      at: 'bottom', pose: { elbowPole: [-0.3, -0.2, 1] }, view: { yaw: 20, pitch: 8 }, marks: ['elbowL', 'elbowR'], parts: ['upperR', 'upperL'] },
    { title: { tr: 'Çok derin, omuzlar kalkıyor', en: 'Too deep, shoulders shrug', es: 'Demasiado profundo' },
      fix: { tr: '90°de dur, omuzlar aşağı', en: 'Stop at 90°, shoulders down', es: 'Para a 90°, hombros abajo' },
      fixText: { tr: 'Dirsek 90° yeter', en: 'A 90° elbow is enough', es: 'Basta con 90° de codo' },
      at: 'bottom', pose: { hip: 117, knee: 52, trunk: 9, shrug: 0.04 }, marks: ['shoulderR'], parts: ['upperR', 'neck'] },
  ],
  cues: [{ tr: 'Kalça benche yakın', en: 'Hips close to the bench', es: 'Cadera cerca del banco' }, { tr: 'Dirsekler geriye', en: 'Elbows back', es: 'Codos atrás' }, { tr: 'Omuzlar aşağıda', en: 'Shoulders down', es: 'Hombros abajo' }],
};
}
