/* Reclining Butterfly (Supta Baddha Konasana) on a bolster: sit at the end of a lengthwise bolster, soles together, knees open
 * -> recline onto the bolster -> rest -> sit back up.
 * - One ground contact [pelvis] in every pose; `trunk` is the real recline. fitButterfly() (lazy, after the rig sets FB.BODY)
 *   bisects the recline so the upper back rests on the bolster, then the neck so the head rests on it too, and the hip
 *   rotation so the soles meet. Hands have world targets in every pose (beside the hips / out at 45° on the mat).
 * - Spec exit (hug knees, roll to the side) is shown as a slow return to sitting; the text mentions using the hands. */
{
const MAT = 0.012;
const BOL = { x0: -0.14, len: 0.82, r: 0.11 };          // bolster along the spine, starting just behind the sacrum
const TOP = MAT + 2 * BOL.r;
FB.PROPS._spineBolster = () => FB.PROPS.bolster(null, { at: [BOL.x0 - BOL.len / 2, MAT + BOL.r, 0], axis: [1, 0, 0], length: BOL.len, r: BOL.r });
// folded blanket on the head end of the bolster; it rests on the bolster, and sinks out of sight when the head drops back
// (neck mistake = "no head support")
let HEADX = BOL.x0 - BOL.len + 0.16, BLK = 0.06;     // set by the fit: blanket thickness = gap under the resting head
FB.PROPS._headBlanket = (sol) => {
  const rest = TOP - 0.02 + BLK / 2 - 0.03, under = sol.J.head[1] - 0.1 - BLK / 2 - 0.03;
  return FB.PROPS.blanket(null, { at: [HEADX, Math.min(rest, under), 0], size: [0.3, BLK, 0.34] });
};
const G = [['pelvis', MAT]];
const BASE = { ground: G, flat: false, abd: 48, knee: 125, hrot: 30, ankle: -10, handFlat: false, curl: 0.3, elbowPole: [-1, 0.2, 1] };
const RAW = {
  sit: { ...BASE, trunk: -12, hip: 58, lumbar: 0, thoracic: 0, neck: 4, sh: -25, shAbd: 18, el: 8, palm: 'in' },
  lie: { ...BASE, trunk: -70, hip: 58, abd: 54, lumbar: -4, thoracic: 0, neck: 6, sh: 0, shAbd: 45, el: 10, palm: 'up' },
};
const CTX = { anchorX: ['pelvis'], anchorAt: [0.05, 0] };

function fitButterfly(poses, extra) {
  const { solve, expand } = FB;
  const S = (p) => solve(expand(Object.assign({}, p, { ik: undefined })), CTX).J;
  const bis = (p, key, f, lo, hi) => { const up = f(hi) > f(lo);
    for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if ((f(m) > 0) === up) hi = m; else lo = m; } p[key] = +((lo + hi) / 2).toFixed(2); };
  const lie = poses.lie;
  bis(lie, 'trunk', (v) => S({ ...lie, trunk: v }).shoulderR[1] - (TOP + 0.075), -95, -40);
  { const H = S(lie).head; HEADX = H[0] + 0.02; BLK = Math.max(0.04, Math.min(0.16, H[1] - 0.1 - TOP + 0.02)); }
  for (const p of [poses.sit, lie]) {
    bis(p, 'hrot', (v) => S({ ...p, hrot: v }).ballR[2] - 0.035, -20, 70);              // soles together
    bis(p, 'hip', (v) => Math.min(S({ ...p, hip: v }).ballR[1], S({ ...p, hip: v }).heelR[1]) - (MAT + 0.03), 20, 150);  // feet on the mat
  }
  const J1 = S(poses.sit), J2 = S(lie);
  const fl = (J, s) => [J['hand' + s][0], MAT + 0.035, J['hand' + s][2]];
  poses.sit.ik = { handL: { at: [J1.pelvis[0] - 0.22, MAT + 0.035, -0.22] }, handR: { at: [J1.pelvis[0] - 0.22, MAT + 0.035, 0.22] } };
  lie.ik = { handL: { at: fl(J2, 'L') }, handR: { at: fl(J2, 'R') } };
  for (const [at, pose] of extra) {
    const m = Object.assign({}, poses[at], pose, { ik: undefined });
    if (pose.abd !== undefined) { bis(m, 'hip', (v) => Math.min(S({ ...m, hip: v }).ballR[1], S({ ...m, hip: v }).heelR[1]) - (MAT + 0.03), 20, 110); pose.hip = m.hip; }
  }
  return poses;
}

window.EXERCISE = {
  id: 'reclining_butterfly',
  name: { tr: 'Uzanmış Kelebek (Supta Baddha Konasana)', en: 'Reclining Butterfly', es: 'Mariposa reclinada' },
  category: { tr: 'Yoga · Restoratif', en: 'Yoga · Restorative', es: 'Yoga · Restaurativo' },
  equipmentLabel: { tr: 'Mat, bolster, battaniye', en: 'Mat, bolster, blanket', es: 'Esterilla, bolster, manta' },
  muscles: ['adductors', 'core'],
  tempo: '5-10-4',
  hold: true, holdDur: 3,
  view: { yaw: 10, pitch: 30 },
  alt: { yaw: 90, pitch: 8, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
    text: { tr: 'Bolster omurga boyunca, baş da üstünde', en: 'Bolster along the spine, head on it too', es: 'Bolster a lo largo de la columna, la cabeza encima' } },
  setupView: { yaw: 55, pitch: 18 },
  contacts: ['pelvis', 'ballR', 'ballL'],
  props: [['mat', { at: [-0.3, 0, 0], length: 1.75, width: 0.7 }], ['_spineBolster'], ['_headBlanket']],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fitButterfly(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'sit',
  rep: [
    { to: 'lie', dur: 4.0, phase: 0 },
    { to: 'lie', dur: 1.0, phase: 1 },
    { to: 'sit', dur: 3.5, phase: 2 },
  ],
  setup: { tr: 'Bolsterın ucuna otur, bolster omurga hizasında. Ayak tabanları birleşik, dizler yana açık.',
    en: 'Sit at the end of a lengthwise bolster. Soles together, knees open.',
    es: 'Siéntate al borde de un bolster a lo largo. Plantas juntas, rodillas abiertas.' },
  phases: [
    { name: { tr: 'Geriye uzan', en: 'Recline', es: 'Reclínate' }, breath: 'out', slow: 1.0,
      text: { tr: 'Nefes verirken yavaşça bolstera uzan. Kollar yana, avuçlar yukarı.', en: 'Exhale and slowly lie back on the bolster. Arms out, palms up.', es: 'Exhala y túmbate despacio en el bolster. Brazos abiertos, palmas arriba.' } },
    { name: { tr: 'Dinlen', en: 'Rest', es: 'Descansa' }, breath: 'easy', line: ['kneeL', 'pelvis', 'kneeR'],
      text: { tr: 'Dizler kendiliğinden açılsın, karın yumuşak. Yavaş nefes.', en: 'Let the knees melt open, belly soft. Slow breaths.', es: 'Deja que las rodillas se abran, abdomen suave. Respira lento.' } },
    { name: { tr: 'Yavaşça kalk', en: 'Come up slowly', es: 'Sube despacio' }, breath: 'in', slow: 1.0,
      text: { tr: 'Dizleri elle birleştir, ellerden destek alarak otur.', en: 'Bring the knees together with your hands and press up to sit.', es: 'Junta las rodillas con las manos y apóyate para sentarte.' } },
  ],
  tempoText: { tr: '5 sn uzan · 3-10 dk dinlen · 4 sn kalk', en: '5 s recline · rest 3-10 min · 4 s up', es: '5 s reclínate · 3-10 min · 4 s arriba' },
  mistakes: [
    { title: { tr: 'Dizler desteksiz düşüyor', en: 'Knees drop without support', es: 'Rodillas caen sin apoyo' },
      text: { tr: 'Dizler yere zorlanır, kasık gerilir.', en: 'The knees are forced down and the groin strains.', es: 'Las rodillas se fuerzan abajo y la ingle se tensa.' },
      fix: { tr: 'Dizlerin altına blok koy', en: 'Put blocks under the knees', es: 'Pon bloques bajo las rodillas' },
      fixText: { tr: 'Esneme yumuşak olmalı, zorlanma değil', en: 'The stretch should feel soft, not forced', es: 'El estiramiento debe ser suave, no forzado' },
      at: 'lie', pose: { abd: 72, hrot: 40 }, marks: ['kneeL', 'kneeR'], parts: ['thigh'] },
    { title: { tr: 'Boyun geriye bükülüyor', en: 'Neck tips back', es: 'El cuello se va atrás' },
      text: { tr: 'Çene tavana kalkar, ense sıkışır.', en: 'The chin points up and the back of the neck pinches.', es: 'La barbilla sube y la nuca se comprime.' },
      fix: { tr: 'Başın altına battaniye koy', en: 'Put a blanket under the head', es: 'Pon una manta bajo la cabeza' },
      fixText: { tr: 'Çene hafif aşağı, alın çeneden biraz yüksek', en: 'Chin slightly down, forehead a bit higher than the chin', es: 'Barbilla un poco abajo, frente algo más alta' },
      at: 'lie', pose: { neck: -26, thoracic: -6 }, view: { yaw: 90, pitch: 8 }, marks: ['head'], parts: ['neck'] },
  ],
  cues: [{ tr: 'Dizler kendiliğinden açılsın', en: 'Let the knees melt open', es: 'Deja caer las rodillas' },
    { tr: 'Dizleri destekle', en: 'Support the knees', es: 'Apoya las rodillas' },
    { tr: 'Karın yumuşak', en: 'Soft belly', es: 'Abdomen suave' }],
};
}
