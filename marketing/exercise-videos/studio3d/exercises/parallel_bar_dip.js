/* Weighted parallel bar dip. Hands are world IK targets on two parallel bars (along x, at z = +-GZ); a lazy `pos` getter
 * (pull_up.js idea, mirrored for support) lifts the body so the shoulders sit ABOVE the hands at the distance that gives
 * the wanted elbow angle, `dx` = shoulder in front of the hands. Knees bent behind, a plate hangs from a dip belt.
 * The dip station + belt + plate is a prop defined in this file (FB.PROPS._dipStation). */
{
const { V } = FB;
const BAR_Y = 1.45, GZ = 0.235;
const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };
FB.PROPS._dipStation = (sol) => {
  const out = [];
  for (const z of [-GZ - 0.02, GZ + 0.02]) {
    out.push({ t: 'cyl', a: [-0.55, BAR_Y, z], b: [0.55, BAR_Y, z], r: 0.02, m: 'chrome' });
    for (const x of [-0.5, 0.5]) out.push({ t: 'box', c: [x, BAR_Y / 2, z + Math.sign(z) * 0.05], s: [0.06, BAR_Y, 0.06], m: 'frame' });
    out.push({ t: 'box', c: [0, 0.02, z + Math.sign(z) * 0.05], s: [1.2, 0.04, 0.09], m: 'frame' });
  }
  // dip belt: chain from both hip sides to a plate hanging in front of the thighs
  const P = sol.J.pelvis, hl = sol.J.hipL, hr = sol.J.hipR;
  const ring = V.add(P, [0.1, -0.36, 0]);
  out.push({ t: 'tube', pts: [V.add(hl, [0.03, 0.02, -0.04]), ring], r: 0.005, m: 'chrome' });
  out.push({ t: 'tube', pts: [V.add(hr, [0.03, 0.02, 0.04]), ring], r: 0.005, m: 'chrome' });
  const pc = V.add(ring, [0, -0.13, 0]);
  out.push({ t: 'cyl', a: V.add(pc, [0, 0, -0.018]), b: V.add(pc, [0, 0, 0.018]), r: 0.13, m: 'iron' });
  return out;
};
const IK = { handL: { at: [0, BAR_Y + 0.02, -GZ] }, handR: { at: [0, BAR_Y + 0.02, GZ] } };
function sup(p, el, dx) {
  const o = Object.assign({ ik: IK, ground: [['pelvis', 0]], palm: 'in', curl: 0.9, abd: 2, hip: 22, knee: 62, ankle: -25, flat: false,
    handFlat: false, elbowPole: [-1, 0.1, 0.25] }, p);
  Object.defineProperty(o, 'pos', { enumerable: true, configurable: true, get() {
    const B = FB.BODY, q = {}; for (const k of Object.keys(o)) if (k !== 'pos' && k !== 'ik') q[k] = Object.getOwnPropertyDescriptor(o, k).value;
    const s = FB.solve(FB.expand(q), CTX), S = s.J.shoulderR;
    const f = B.fore + B.hand * 0.55, e = (180 - el) * Math.PI / 180;
    const d = Math.sqrt(B.upper * B.upper + f * f - 2 * B.upper * f * Math.cos(e));
    const dz = GZ - S[2], dy = Math.sqrt(Math.max(0, d * d - dx * dx - dz * dz));
    return [dx - S[0], BAR_Y + 0.02 + dy - S[1], 0];
  } });
  return o;
}

window.EXERCISE = {
  id: 'parallel_bar_dip',
  name: { tr: 'Paralel Bar Dips', en: 'Parallel Bar Dip', es: 'Fondos en paralelas' },
  category: { tr: 'Göğüs · Kol', en: 'Chest · Arms', es: 'Pecho · Brazos' },
  equipmentLabel: { tr: 'Dips barı · Ağırlık kemeri', en: 'Dip bars · Dip belt', es: 'Paralelas · Cinturón de lastre' },
  muscles: ['chest', 'triceps', 'delts'],
  tempo: '2-0-1.5',
  view: { yaw: 90, pitch: 5 },
  alt: { yaw: 20, pitch: 6, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Omuzlar aşağıda, dirsekler hafif dışa', en: 'Shoulders down, elbows slightly out', es: 'Hombros abajo, codos algo hacia fuera' } },
  setupView: { yaw: 40, pitch: 10 },
  setupMarks: [{ type: 'aline', joints: ['handL', 'handR'] }],
  props: [['_dipStation']],
  ctx: CTX,
  contacts: ['handL', 'handR'],
  poses: {
    top: sup({ trunk: 20, neck: 4, shrug: -0.015, sh: -10 }, 4, 0.16),
    bottom: sup({ trunk: 30, neck: 8, shrug: -0.005, protract: 0.01 }, 90, 0.13),
  },
  rest: 'top',
  rep: [
    { to: 'bottom', dur: 2.0, phase: 0 },
    { to: 'top', dur: 1.5, phase: 1 },
  ],
  setup: { tr: 'Barlarda kollar kilitli destek pozisyonu. Omuzlar aşağıda, gövde ~20° öne, dizler geride bükülü.',
    en: 'Support position on the bars, arms locked. Shoulders down, torso ~20° forward, knees bent behind.',
    es: 'Apoyo en las paralelas, brazos bloqueados. Hombros abajo, torso ~20° adelante, rodillas atrás.' },
  phases: [
    { name: { tr: 'İniş', en: 'Lower', es: 'Baja' }, breath: 'in', arc: ['shoulderR', 'elbowR', 'wristR'],
      text: { tr: 'Hafif öne eğil, dirsekleri bük. Üst kol yere paralel olunca dur.', en: 'Lean slightly forward and bend the elbows. Stop when the upper arms are parallel.', es: 'Inclínate un poco y flexiona. Para con los brazos paralelos al suelo.' } },
    { name: { tr: 'İtiş', en: 'Press', es: 'Empuja' }, breath: 'out',
      text: { tr: 'Güçlü şekilde yukarı it, omuzlar kulaklardan uzak kalsın.', en: 'Press up strongly; keep the shoulders away from the ears.', es: 'Empuja con fuerza; hombros lejos de las orejas.' } },
  ],
  tempoText: { tr: '2 sn in · 1,5 sn it', en: '2 s down · 1.5 s up', es: '2 s abajo · 1,5 s arriba' },
  mistakes: [
    { title: { tr: 'Çok derine inmek', en: 'Dropping too deep', es: 'Bajar demasiado' },
      fix: { tr: 'Üst kol paralelde dur', en: 'Stop at upper arms parallel', es: 'Para con el brazo paralelo' },
      fixText: { tr: 'Omuzlar dirsek hizasının altına düşmesin', en: 'Shoulders don\'t sink below the elbows', es: 'Hombros no por debajo de los codos' },
      at: 'bottom', pose: sup({ trunk: 34, neck: 12, shrug: 0.03, protract: 0.04 }, 128, 0.17), line: ['shoulderR', 'elbowR'], marks: ['shoulderR'], parts: ['upperR', 'chest'] },
    { title: { tr: 'Omuzlar kulaklara kalkıyor', en: 'Shrugging', es: 'Hombros a las orejas' },
      fix: { tr: 'Kürek kemiklerini aşağı çek', en: 'Pull the shoulder blades down', es: 'Baja las escápulas' },
      fixText: { tr: 'Boyun uzun, omuzlar aşağıda', en: 'Long neck, shoulders down', es: 'Cuello largo, hombros abajo' },
      at: 'top', pose: sup({ trunk: 20, neck: 4, shrug: 0.06, sh: -10 }, 4, 0.16), view: { yaw: 20, pitch: 6 }, marks: ['shoulderL', 'shoulderR'], parts: ['neck', 'upper'] },
  ],
  cues: [{ tr: 'Göğüs açık, hafif öne eğil', en: 'Chest up, slight forward lean', es: 'Pecho arriba, algo inclinada' },
    { tr: 'Omuzlar aşağıda', en: 'Shoulders down', es: 'Hombros abajo' },
    { tr: 'Sallanma', en: 'Don\'t swing', es: 'Sin balanceo' }],
};
}
