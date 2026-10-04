/* Reformer Short Box - Flat Back. Same set-up as short_box_round_back.js (short box crosswise against the shoulder blocks,
 * carriage locked, feet hooked under the foot strap, pole overhead). The spine stays long like a board while the body hinges
 * back from the hips to ~45 deg behind vertical, arms and pole in line with the trunk.
 * Note: dev/measure's hip_flexion is the angle between the trunk-down line and the thigh, i.e. 180 - the spec's hip angle
 * (spec 90 -> 135 shows here as ~90 -> ~45). */
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
  hinge: { ...SB, ...POLE, trunk: -45, lumbar: -2, thoracic: 0, neck: 4 },
};

window.EXERCISE = {
  id: 'short_box_flat_back',
  name: { tr: 'Short Box - Düz Sırt', en: 'Short Box - Flat Back', es: 'Caja corta - Espalda plana' },
  category: { tr: 'Reformer · Karın', en: 'Reformer · Core', es: 'Reformer · Core' },
  equipmentLabel: { tr: 'Reformer · short box · ayak kayışı · çubuk', en: 'Reformer · short box · foot strap · pole', es: 'Reformer · caja corta · correa de pies · barra' },
  muscles: ['core', 'obliques', 'quads'],
  tempo: '2-1-2',
  view: { yaw: 90, pitch: 8, zoom: 1.2, dx: -40 },
  alt: { yaw: 35, pitch: 14, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Çubuk, kollar ve gövde tek bir uzun çizgi', en: 'Pole, arms and torso form one long line', es: 'Barra, brazos y torso en una línea larga' } },
  setupView: { yaw: 45, pitch: 18 },
  props: [REFORMER, ['_shortBox', { pole: true }]],
  ctx: CTX,
  contacts: ['pelvis', 'ankleL', 'ankleR', 'handL', 'handR'],
  get poses() { return this._poses || (this._poses = fitPoles(POSES, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'tall',
  rep: [
    { to: 'hinge', dur: 2.0, phase: 0 },
    { to: 'hinge', dur: 1.0, phase: 1 },
    { to: 'tall', dur: 2.0, phase: 2 },
  ],
  setup: { tr: 'Kutuya footbar\'a dönük otur, ayaklar kayışın altında. Çubuk başın üstünde, omurga uzun.',
    en: 'Sit on the box facing the footbar, feet under the strap. Pole overhead, spine long.',
    es: 'Sentada en la caja mirando a la barra, pies bajo la correa. Barra arriba, columna larga.' },
  phases: [
    { name: { tr: 'Kalçadan geriye', en: 'Hinge back', es: 'Bisagra atrás' }, breath: 'out', line: ['pelvis', 'neck', 'head'],
      text: { tr: 'Sırt bir tahta gibi düz; kalçadan menteşelenip geriye yaslan.', en: 'Back flat like a board; hinge at the hips and lean back.', es: 'Espalda recta como una tabla; bisagra de cadera hacia atrás.' } },
    { name: { tr: '45°\'de dur', en: 'Hold at 45°', es: 'Mantén a 45°' }, breath: 'hold', arc: ['kneeR', 'hipR', 'neck'],
      text: { tr: 'Karın sıkı, kaburgalar içeride. Çubuk kollarla aynı çizgide.', en: 'Abs firm, ribs in. The pole stays in line with the arms.', es: 'Abdomen firme, costillas adentro. Barra en línea con los brazos.' } },
    { name: { tr: 'Düz sırtla dön', en: 'Return flat', es: 'Vuelve recta' }, breath: 'in',
      text: { tr: 'Gövdeyi tek parça halinde dik oturuşa geri getir.', en: 'Bring the torso back up to sitting in one piece.', es: 'Vuelve a sentarte con el torso de una pieza.' } },
  ],
  tempoText: { tr: '2 sn geri · 1 sn dur · 2 sn dön', en: '2 s back · 1 s hold · 2 s up', es: '2 s atrás · 1 s pausa · 2 s sube' },
  mistakes: [
    { title: { tr: 'Bel yuvarlanıyor', en: 'Lower back rounds', es: 'La zona lumbar se redondea' },
      fix: { tr: 'Daha erken dur', en: 'Stop earlier', es: 'Para antes' },
      fixText: { tr: 'Sırtın düz kaldığı yere kadar git', en: 'Go only as far as the back stays flat', es: 'Ve solo hasta donde la espalda siga recta' },
      at: 'hinge', pose: { trunk: -68, lumbar: 26, thoracic: 14, neck: 14 }, line: ['pelvis', 'waist', 'neck'], goodLine: ['pelvis', 'neck'], parts: ['waist', 'chest'] },
    { title: { tr: 'Kaburgalar açılıyor', en: 'Ribs flare', es: 'Costillas abiertas' },
      fix: { tr: 'Kaburgaları indir', en: 'Knit the ribs down', es: 'Cierra las costillas' },
      fixText: { tr: 'Karnı çek, çubuğu hafif öne al', en: 'Draw the abs in, pole slightly forward', es: 'Abdomen adentro, barra un poco adelante' },
      at: 'hinge', pose: { trunk: -36, lumbar: -12, thoracic: -10, neck: -10 }, line: ['pelvis', 'waist', 'neck'], goodLine: ['pelvis', 'neck'], parts: ['waist', 'chest'] },
  ],
  cues: [{ tr: 'Kalçadan menteşelen', en: 'Hinge at the hips', es: 'Bisagra de cadera' },
    { tr: 'Omurga uzun', en: 'Long spine', es: 'Columna larga' },
    { tr: 'Ayaklar kayışa bastırır', en: 'Feet press into the strap', es: 'Pies contra la correa' }],
};
}
