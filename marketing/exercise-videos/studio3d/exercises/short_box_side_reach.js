/* Reformer Short Box - Side Reach (side-to-side). Same set-up as short_box_round_back.js (short box crosswise against the
 * shoulder blocks, carriage locked, feet hooked under the foot strap), no pole: left hand behind the head, right arm out to the side at shoulder height (the hanging-arm start made the arm sweep too fast for the automatic mistake-return transitions; a common teaching variant).
 * The spine lengthens, then bends ~45 deg to the LEFT while the right arm sweeps up overhead in an arc (abduction ~170);
 * the ribcage keeps facing front. One side shown; the setup card says to switch sides.
 * - `side` + = toward the character's left; split evenly over lumbar/thoracic by the engine.
 * - Spec camera says "side" but its own reason is the frontal arc, so the main view is front (yaw 12); side view as alt. */
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
const ARMS = { holdL: [-0.07, 0.35, 0.08], elbowPoleL: [-0.15, 0.25, 1], noAvoid: true, palmR: [0, -1, -0.2], curlR: 0.2 };
const POSES = {
  tall: { ...SB, ...ARMS, trunk: 0, lumbar: -2, neck: 2, side: 0, shR: 6, shAbdR: 112, elR: 12 },
  bend: { ...SB, ...ARMS, trunk: 0, lumbar: -2, neck: 2, side: 44, roll: 0, shR: 8, shAbdR: 160, elR: 20, palmR: [0, -0.3, -1] },
};

window.EXERCISE = {
  id: 'short_box_side_reach',
  name: { tr: 'Short Box - Yana Uzanma', en: 'Short Box - Side Reach', es: 'Caja corta - Alcance lateral' },
  category: { tr: 'Reformer · Yan karın', en: 'Reformer · Obliques', es: 'Reformer · Oblicuos' },
  equipmentLabel: { tr: 'Reformer · short box · ayak kayışı', en: 'Reformer · short box · foot strap', es: 'Reformer · caja corta · correa de pies' },
  muscles: ['obliques', 'core', 'lowerback'],
  tempo: '2.5-1-2.5',
  view: { yaw: 12, pitch: 8, zoom: 1.1 },
  alt: { yaw: 55, pitch: 14, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Göğüs öne bakar, kalçalar kutuda sabit', en: 'Chest faces front, hips stay on the box', es: 'Pecho al frente, cadera fija en la caja' } },
  setupView: { yaw: 45, pitch: 18 },
  props: [REFORMER, ['_shortBox', {}]],
  ctx: CTX,
  contacts: ['pelvis', 'ankleL', 'ankleR'],
  get poses() { return this._poses || (this._poses = fitPoles(POSES, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'tall',
  rep: [
    { to: 'bend', dur: 2.5, phase: 0 },
    { to: 'bend', dur: 1.0, phase: 1 },
    { to: 'tall', dur: 2.5, phase: 2 },
  ],
  setup: { tr: 'Kutuya otur, ayaklar kayışın altında. Sol el başın arkasında, sağ kol omuz hizasında yanda. Sonra taraf değiştir.',
    en: 'Sit on the box, feet under the strap. Left hand behind the head, right arm out to the side. Then switch sides.',
    es: 'Sentada en la caja, pies bajo la correa. Mano izquierda tras la cabeza, brazo derecho al lado. Luego cambia.' },
  phases: [
    { name: { tr: 'Uza ve yana eğil', en: 'Lengthen and bend', es: 'Alarga y flexiona' }, breath: 'out',
      text: { tr: 'Önce uza, sonra sola eğil; sağ kol başın üstünden yay çizerek uzanır.', en: 'Grow tall first, then bend left; the right arm arcs up over the head.', es: 'Primero crece, luego flexiona a la izquierda; el brazo derecho pasa sobre la cabeza.' } },
    { name: { tr: 'Esnemede kal', en: 'Hold the stretch', es: 'Mantén el estiramiento' }, breath: 'hold', line: ['pelvis', 'waist', 'neck'],
      text: { tr: 'Yaklaşık 45° yana eğik. Göğüs öne bakar, iki kalça da kutuda.', en: 'About 45° to the side. Chest faces front, both hips on the box.', es: 'Unos 45° al lado. Pecho al frente, ambas caderas en la caja.' } },
    { name: { tr: 'Ortaya dön', en: 'Back to centre', es: 'Vuelve al centro' }, breath: 'in',
      text: { tr: 'Karından dikleşerek ortaya dön, kolu omuz hizasına indir.', en: 'Lift back to centre from the waist, lower the arm to shoulder height.', es: 'Sube al centro desde la cintura y baja el brazo al lado.' } },
  ],
  tempoText: { tr: '2,5 sn eğil · 1 sn dur · 2,5 sn dön', en: '2.5 s bend · 1 s hold · 2.5 s return', es: '2,5 s flexiona · 1 s pausa · 2,5 s vuelve' },
  mistakes: [
    { title: { tr: 'Gövde dönüyor', en: 'Torso rotates', es: 'El torso gira' },
      fix: { tr: 'Göğüs öne baksın', en: 'Chest faces front', es: 'Pecho al frente' },
      fixText: { tr: 'Kaburgalar iki duvar arasında gibi düz eğil', en: 'Bend as if between two walls', es: 'Flexiona como entre dos paredes' },
      at: 'bend', pose: { twist: -32, trunk: 8, thoracic: 8, side: 40, shAbdR: 155 }, marks: ['shoulderR'], parts: ['chest', 'waist'] },
    { title: { tr: 'Omuz kulağa kalkıyor', en: 'Shoulder hikes', es: 'El hombro sube' },
      fix: { tr: 'Omuzlar aşağıda', en: 'Shoulders down', es: 'Hombros abajo' },
      fixText: { tr: 'Kol uzanırken kürek kemiği aşağı kayar', en: 'As the arm reaches, the blade slides down', es: 'Al alargar el brazo, la escápula baja' },
      at: 'bend', pose: { shrugR: 0.055, shrugL: 0.03, neck: 10, side: 40, shAbdR: 158 }, marks: ['shoulderR'], parts: ['neck', 'upperR'] },
  ],
  cues: [{ tr: 'Önce uza, sonra eğil', en: 'Lengthen, then bend', es: 'Alarga y luego flexiona' },
    { tr: 'Omuzlar düz ve aşağıda', en: 'Shoulders level and low', es: 'Hombros nivelados y abajo' },
    { tr: 'Kalçalar kutuda sabit', en: 'Hips anchored on the box', es: 'Cadera fija en la caja' }],
};
}
