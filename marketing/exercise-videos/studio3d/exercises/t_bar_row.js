/* T-bar row (landmine bar with a V-handle). Built on barbell_row.js: hinge ~50°, feet planted, hands = world IK targets.
 * The landmine is a prop defined in this file (FB.PROPS._landmine): bar from a floor pivot behind the lifter, between the
 * legs, through the handle, with the plates on the front sleeve. Both handle targets lie on a circle of radius LEN around the
 * pivot, so the rigid bar length never changes (the handle travels on its real arc: up and slightly back).
 * Spec note: as in barbell_row, hip 70° with knee 30° and trunk 50° is not reachable together; trunk, knee, elbow and
 * the handle path define the technique (hip ~80°). */
{
const { V } = FB;
const PIV = [-1.8, 0.04, 0], LEN = 2.1;
const onArc = (y) => [PIV[0] + Math.sqrt(LEN * LEN - (y - PIV[1]) ** 2), y];
const H = (y, z = 0.065) => { const [x] = onArc(y); return { handL: { at: [x, y, -z] }, handR: { at: [x, y, z] } }; };
FB.PROPS._landmine = (sol) => {
  const h = V.lerp(sol.J.handL, sol.J.handR, 0.5), d = V.norm(V.sub(h, PIV)), up = V.norm(V.cross([0, 0, 1], d));
  const bar = V.add(h, V.mul(up, 0.075)), end = V.add(bar, V.mul(d, 0.62));
  const out = [
    { t: 'box', c: V.add(PIV, [-0.05, -0.02, 0]), s: [0.22, 0.04, 0.22], m: 'frameDark', round: 0.01 },
    { t: 'sph', c: PIV, r: 0.035, m: 'frameDark' },
    { t: 'cyl', a: PIV, b: bar, r: 0.014, m: 'chrome' },
    { t: 'cyl', a: bar, b: end, r: 0.025, m: 'chrome' },
  ];
  for (const k of [0.48, 0.53]) out.push({ t: 'cyl', a: V.add(bar, V.mul(d, k)), b: V.add(bar, V.mul(d, k + 0.045)), r: 0.14, m: 'plate' });
  // V-handle hooked under the bar: two grips (neutral) joined to the bar
  for (const s of ['L', 'R']) {
    const g = sol.J['hand' + s];
    out.push({ t: 'cyl', a: V.add(g, V.mul(d, -0.06)), b: V.add(g, V.mul(d, 0.06)), r: 0.016, m: 'rubber' });
    out.push({ t: 'tube', pts: [V.add(g, V.mul(d, 0.06)), V.add(V.lerp(g, bar, 0.5), V.mul(d, 0.05)), bar], r: 0.011, m: 'chrome' });
  }
  sol.grip = { L: d, R: d }; sol.gripKind = 'neutral';
  return out;
};
const HG = { knee: 33, abd: 12, hrot: 12, neck: -6, elbowPole: [-1, -0.25, 0.3] };

window.EXERCISE = {
  id: 't_bar_row',
  name: { tr: 'T-Bar Row', en: 'T-Bar Row', es: 'Remo en barra T' },
  category: { tr: 'Sırt', en: 'Back', es: 'Espalda' },
  equipmentLabel: { tr: 'T-bar, V-tutamak', en: 'T-bar, V-handle', es: 'Barra T, agarre en V' },
  muscles: ['lats', 'upperback', 'delts', 'biceps'],
  tempo: '1-0.5-2',
  view: { yaw: 90, pitch: 8, zoom: 1.45, dx: -250 },
  alt: { yaw: 38, pitch: 12, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Dirsekler gövdeye yakın, geriye gider', en: 'Elbows stay close and travel back', es: 'Codos pegados, van hacia atrás' } },
  setupView: { yaw: 35, pitch: 14 },
  setupMarks: [{ type: 'span', joints: ['ankleR', 'ankleL'], label: { tr: 'Omuz genişliği', en: 'Shoulder width', es: 'Ancho de hombros' } }],
  props: [['_landmine']],
  ctx: { anchorX: ['ankleL', 'ankleR'], plant: ['ankleL', 'ankleR'] },
  poses: {
    // straddling the bar, hinge ~50°, flat back, arms long, handle below the knees
    start: { ...HG, trunk: 52, hip: 82, protract: 0.025, ik: H(0.575) },
    // handle to the lower chest, elbows behind the torso, blades squeezed; torso angle almost unchanged
    top: { ...HG, trunk: 47, hip: 77, protract: -0.025, ik: H(0.88) },
  },
  rest: 'start',
  rep: [
    { to: 'top', dur: 1.2, phase: 0 },
    { to: 'top', dur: 0.5, phase: 1 },
    { to: 'start', dur: 2.0, phase: 2 },
  ],
  setup: { tr: 'Barın iki yanına bas, ayaklar omuz genişliğinde. Kalçadan katlan, sırt düz; V-tutamağı avuçlar karşılıklı tut.',
    en: 'Straddle the bar, feet shoulder-width. Hinge with a flat back and hold the V-handle, palms facing.',
    es: 'Ponte a horcajadas sobre la barra, pies al ancho de hombros. Bisagra, espalda recta, agarre en V.' },
  phases: [
    { name: { tr: 'Çek', en: 'Row', es: 'Tira' }, breath: 'out', line: ['pelvis', 'neck'],
      text: { tr: 'Dirsekleri geriye sür, tutamağı göğsünün altına çek. Gövde sabit.', en: 'Drive the elbows back and pull the handle to your lower chest. Torso still.', es: 'Lleva los codos atrás y el agarre al pecho bajo. Torso quieto.' } },
    { name: { tr: 'Sık', en: 'Squeeze', es: 'Aprieta' }, breath: 'hold', line: ['pelvis', 'neck'], marks: [{ type: 'mark', joint: 'elbowR' }],
      text: { tr: 'Kürek kemiklerini bir an sık.', en: 'Squeeze the shoulder blades for a beat.', es: 'Junta las escápulas un instante.' } },
    { name: { tr: 'Kontrollü indir', en: 'Lower slowly', es: 'Baja despacio' }, breath: 'in', line: ['pelvis', 'neck'],
      text: { tr: 'İki saniyede kollar tam düzleşene kadar indir. Zıplatma.', en: 'Two seconds down until the arms are straight. No bouncing.', es: 'Dos segundos hasta estirar los brazos. Sin rebotes.' } },
  ],
  tempoText: { tr: '1 sn çek · 0,5 sn sık · 2 sn indir', en: '1 s row · 0.5 s squeeze · 2 s lower', es: '1 s tira · 0,5 s aprieta · 2 s baja' },
  mistakes: [
    { title: { tr: 'Sırt kamburlaşıyor', en: 'Rounded back', es: 'Espalda redondeada' },
      fix: { tr: 'Göğsü aç, karnı sık', en: 'Chest proud, brace', es: 'Pecho abierto, abdomen firme' },
      fixText: { tr: 'Ağırlığı azalt; sırt baştan kalçaya düz', en: 'Lower the weight; back flat from head to hips', es: 'Baja el peso; espalda recta de cabeza a cadera' },
      at: 'start', pose: { trunk: 44, hip: 74, lumbar: 16, thoracic: 18, neck: 12, ik: H(0.42) },
      line: ['pelvis', 'waist', 'neck'], goodLine: ['pelvis', 'neck'], parts: ['waist', 'chest'] },
    { title: { tr: 'Gövdeyle savurmak', en: 'Heaving with the torso', es: 'Tirar con el torso' },
      fix: { tr: 'Gövde açısını kilitle', en: 'Lock the torso angle', es: 'Fija el ángulo del torso' },
      fixText: { tr: 'Sadece kollar ve sırt çalışır', en: 'Only the arms and back move', es: 'Solo se mueven brazos y espalda' },
      at: 'top', pose: { trunk: 20, hip: 42, knee: 22, neck: -2, ik: H(1.0) },
      line: ['pelvis', 'neck'], parts: ['pelvis', 'waist', 'chest'] },
  ],
  cues: [{ tr: 'Sırt düz, göğüs açık', en: 'Flat back, chest proud', es: 'Espalda recta, pecho abierto' },
    { tr: 'Dirsekler geriye', en: 'Elbows back', es: 'Codos atrás' },
    { tr: 'Tutamak göğse', en: 'Handle to chest', es: 'Agarre al pecho' }],
};
}
