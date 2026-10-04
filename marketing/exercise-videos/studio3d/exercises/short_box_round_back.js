/* Reformer Short Box - Round Back. Short box crosswise on the (locked, closed) carriage against the shoulder blocks, sitting
 * on the box facing the footbar, feet hooked under the foot strap that loops over the footbar; pole held overhead.
 * - Feet: world IK targets (ankle + foot frame) under the strap in every pose; the legs follow by IK (kneePole up).
 * - Seat: one ground contact [pelvis] on the box top. The carriage stays still (carriage: () => CX0).
 * - Round back: the C-curve = pelvis rolled back (trunk) + lumbar/thoracic flexion; measured trunk (pelvis->neck) ~ -45.
 *   The pole stays overhead in line with the arms (holdL/R in the thorax frame), so it follows the curve.
 * The shared short-box block (_shortBox prop, FEET, SB) is identical in the four short_box_* files. */
{
const { V } = FB;
const TOP = 0.38, CX0 = 0.13, BOX_H = 0.3, BOX_TOP = TOP + BOX_H;
const BAR = [1.0, TOP + 0.36];                       // footbar (default height), the foot strap hangs from it
const PX = 0.07;                                     // pelvis x on the box
const ANK = (s) => [0.915, 0.655, (s === 'R' ? 1 : -1) * 0.1];
// short box placed crosswise on the carriage, against the front of the shoulder blocks; foot strap looped over the footbar
// and across the insteps; optional pole between the hands
FB.PROPS._shortBox = (sol, o = {}) => {
  const out = [{ t: 'box', c: [CX0 - 0.08, TOP + BOX_H / 2, 0], s: [0.42, BOX_H, 0.6], m: 'woodLight', round: 0.02 },
    { t: 'box', c: [CX0 - 0.08, BOX_TOP - 0.012, 0], s: [0.4, 0.025, 0.58], m: 'pad', round: 0.01 }];
  const inst = (s) => { const a = sol.J['ankle' + s], f = sol.F['foot' + s]; return V.add(V.add(a, V.mul(f[0], 0.075)), V.mul(f[1], 0.035)); };
  const iL = inst('L'), iR = inst('R');
  out.push({ t: 'tube', pts: [[BAR[0] + 0.01, BAR[1] + 0.02, -0.2], [BAR[0] + 0.005, iL[1] + 0.012, -0.17], [iL[0], iL[1] + 0.012, iL[2] - 0.05],
    [iL[0], iL[1] + 0.014, 0], [iR[0], iR[1] + 0.012, iR[2] + 0.05], [BAR[0] + 0.005, iR[1] + 0.012, 0.17], [BAR[0] + 0.01, BAR[1] + 0.02, 0.2]], r: 0.012, m: 'strapMat' });
  if (o.pole) {
    const a = sol.J.handL, b = sol.J.handR, d = V.norm(V.sub(b, a));
    out.push({ t: 'cyl', a: V.add(a, V.mul(d, -0.28)), b: V.add(b, V.mul(d, 0.28)), r: 0.014, m: 'wood' });
    sol.grip = { L: d, R: d }; sol.gripKind = 'pronated';
  }
  return out;
};
const FEET = { ankleL: { at: ANK('L'), foot: { 0: [1, 0, 0], 1: [0, 1, 0], 2: [0, 0, 1] } }, ankleR: { at: ANK('R'), foot: { 0: [1, 0, 0], 1: [0, 1, 0], 2: [0, 0, 1] } } };
const SB = { ground: [['pelvis', BOX_TOP - 0.035]], hip: 80, knee: 8, abd: 2, flat: false, kneePole: [0.2, 1, 0], ik: FEET };
const CTX = { anchorX: ['pelvis'], anchorAt: [PX, 0] };
const REFORMER = ['reformer', { springs: 1, carriage: () => CX0 }];
// kneePole is read in the pelvis frame: convert a world "knees up" direction per pose, so a rolled-back pelvis never flips the knees
function fitPoles(poses, extra) {
  const { solve, expand } = FB;
  const fix = (p) => {
    const F = solve(expand(Object.assign({}, p, { ik: undefined })), CTX).F.pelvis;
    const w = [0.25, 1, 0];
    p.kneePole = [0, 1, 2].map((i) => { const e = [0, 0, 0]; e[i] = 1; return +V.dot(w, FB.M.apply(F, e)).toFixed(4); });
  };
  for (const k in poses) fix(poses[k]);
  for (const [at, pose] of extra) { const m = Object.assign({}, poses[at], pose); fix(m); pose.kneePole = m.kneePole; }
  return poses;
}
const POLE = { holdL: [0.06, 0.655, 0.29], holdR: [0.06, 0.655, 0.29], elbowPole: [-0.3, 0.2, 1], noAvoid: true };
const POSES = {
  tall: { ...SB, ...POLE, trunk: 0, lumbar: -2, thoracic: 0, neck: 2 },
  round: { ...SB, ...POLE, trunk: -104, lumbar: 40, thoracic: 22, neck: 22 },
};

window.EXERCISE = {
  id: 'short_box_round_back',
  name: { tr: 'Short Box - Yuvarlak Sırt', en: 'Short Box - Round Back', es: 'Caja corta - Espalda redonda' },
  category: { tr: 'Reformer · Karın', en: 'Reformer · Core', es: 'Reformer · Core' },
  equipmentLabel: { tr: 'Reformer · short box · ayak kayışı · çubuk', en: 'Reformer · short box · foot strap · pole', es: 'Reformer · caja corta · correa de pies · barra' },
  muscles: ['core', 'obliques'],
  tempo: '2-1-2',
  view: { yaw: 90, pitch: 8, zoom: 1.2, dx: -40 },
  alt: { yaw: 35, pitch: 14, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Çubuk omuz genişliğinde, ayaklar kayışın altında', en: 'Pole shoulder-width, feet under the strap', es: 'Barra al ancho de hombros, pies bajo la correa' } },
  setupView: { yaw: 45, pitch: 18 },
  props: [REFORMER, ['_shortBox', { pole: true }]],
  ctx: CTX,
  contacts: ['pelvis', 'ankleL', 'ankleR', 'handL', 'handR'],
  get poses() { return this._poses || (this._poses = fitPoles(POSES, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'tall',
  rep: [
    { to: 'round', dur: 2.0, phase: 0 },
    { to: 'round', dur: 1.0, phase: 1 },
    { to: 'tall', dur: 2.0, phase: 2 },
  ],
  setup: { tr: 'Kutuya footbar\'a dönük otur, ayakları kayışın altına sok. Çubuğu omuz genişliğinde başının üstünde tut.',
    en: 'Sit on the box facing the footbar, feet under the strap. Hold the pole overhead, shoulder-width.',
    es: 'Sentada en la caja mirando a la barra, pies bajo la correa. Barra sobre la cabeza.' },
  phases: [
    { name: { tr: 'C-kıvrımıyla geri', en: 'Curl back in a C', es: 'Rueda atrás en C' }, breath: 'out',
      text: { tr: 'Pelvisi altına kıvır, karnı içeri çekerek omur omur geriye yuvarlan.', en: 'Tuck the pelvis, scoop the belly and round back one vertebra at a time.', es: 'Mete la pelvis, hunde el abdomen y rueda atrás vértebra a vértebra.' } },
    { name: { tr: 'Kıvrımda kal', en: 'Hold the curve', es: 'Mantén la curva' }, breath: 'hold', line: ['pelvis', 'waist', 'neck'],
      text: { tr: 'Gövde 45° geride, sırt yuvarlak. Çene hafif göğse.', en: 'Torso 45° back, spine round. Chin slightly toward the chest.', es: 'Torso 45° atrás, espalda redonda. Barbilla hacia el pecho.' } },
    { name: { tr: 'Omur omur doğrul', en: 'Roll back up', es: 'Sube vértebra a vértebra' }, breath: 'in',
      text: { tr: 'Karından başlayarak omurgayı üst üste diz, dik otur.', en: 'Lead with the abs and stack the spine back to tall.', es: 'Empieza por el abdomen y apila la columna hasta sentarte erguida.' } },
  ],
  tempoText: { tr: '2 sn geri · 1 sn dur · 2 sn doğrul', en: '2 s back · 1 s hold · 2 s up', es: '2 s atrás · 1 s pausa · 2 s sube' },
  mistakes: [
    { title: { tr: 'Boyun öne uzanıyor', en: 'Chin pokes forward', es: 'La barbilla se adelanta' },
      fix: { tr: 'Çene hafif içeride', en: 'Keep the chin tucked', es: 'Barbilla recogida' },
      fixText: { tr: 'Baş omurganın devamı, boyun uzun', en: 'Head continues the spine, long neck', es: 'Cabeza en línea con la columna' },
      at: 'round', pose: { neck: -18, thoracic: 14 }, marks: ['head'], parts: ['neck'] },
    { title: { tr: 'Sırt düz geriye yatıyor', en: 'Leaning back with a flat back', es: 'Inclinarse atrás con espalda recta' },
      fix: { tr: 'C-kıvrımını koru', en: 'Keep the C-curve', es: 'Mantén la curva en C' },
      fixText: { tr: 'Göbek içeri, pelvis altına kıvrılır', en: 'Navel in, pelvis tucks under', es: 'Ombligo adentro, pelvis metida' },
      at: 'round', pose: { trunk: -42, lumbar: -4, thoracic: -6, neck: -2 }, line: ['pelvis', 'waist', 'neck'], parts: ['waist', 'chest'] },
  ],
  cues: [{ tr: 'Karnı içeri çek', en: 'Scoop the abs', es: 'Hunde el abdomen' },
    { tr: 'Omur omur yuvarlan', en: 'Round one vertebra at a time', es: 'Redondea vértebra a vértebra' },
    { tr: 'Ayaklar kayışa bastırır', en: 'Feet press into the strap', es: 'Pies contra la correa' }],
};
}
