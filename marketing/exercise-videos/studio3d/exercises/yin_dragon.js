/* Yin Dragon (low lunge), right foot forward. Lunge prep (back knee under the hip, hands on two tall blocks beside the front
 * foot) -> slide the back knee back, hips sink forward and down -> long passive hold -> knee back in.
 * - One ground contact [kneeL] (on a folded blanket) in every pose; the front ankle is the anchor, so the front foot never moves
 *   in x/z. fitDragon() (lazy, after the rig sets FB.BODY) uses a small Newton:
 *   prep: (hipR, kneeR) so the front heel is on the mat with the shin vertical;
 *   hold: (hipR, hipL, kneeL) so the front heel is on the mat, the front knee sits ~15° ahead of the ankle and the back shin
 *   lies on the mat (top of the foot down).
 * - Spec numbers for the hold (back knee 10°, back hip -40, front hip 100) cannot all hold with the back knee AND the front foot
 *   down: with the front knee over the ankle the pelvis stays ~45 cm high and the back knee bends ~60-70°. The technique
 *   angles kept: front knee 90 over the ankle, back hip clearly extended, chest leaning forward over the thigh (~45°).
 * - Blanket under the back knee squashes away when the knee contact drops (mistake "no padding, weight on the kneecap").
 * - Hands: weight-bearing palms on two tall blocks, same world spots in every pose. */
{
const MAT = 0.012, BLK = 0.03;
let BH = 0.23;                                  // block height: set by the fit so the straight arms reach it
const G = (d = 0) => [['kneeL', MAT + BLK + d]];
let BX = 0.3, BZR = 0.3, BZL = -0.2;
FB.PROPS._kneeBlanket = (sol) => {
  const h = Math.min(BLK, sol.J.kneeL[1] - 0.05 - MAT);
  if (h < 0.004) return [];
  return FB.PROPS.blanket(null, { at: [sol.J.kneeL[0] - 0.08, MAT + h / 2 - 0.03, sol.J.kneeL[2]], size: [0.36, h, 0.24] });
};
FB.PROPS._handBlocks = () => [BZL, BZR].flatMap((z) => FB.PROPS.block(null, { at: [BX, MAT + BH / 2 - 0.04, z], size: [0.1, BH, 0.15] }));
const BASE = { ground: G(), flatR: true, flatL: false, ankleL: -70, abd: 3, hrot: 0, handFlat: true, curl: 0.15,
  elbowPole: [-1, 0.1, 0.5], neck: 4 };
const RAW = {
  prep: { ...BASE, trunk: 40, hipR: 120, kneeR: 90, hipL: 40, kneeL: 90, lumbar: 6, thoracic: 8, sh: 60, el: 10 },
  hold: { ...BASE, trunk: 15, hipR: 85, kneeR: 100, hipL: -6, kneeL: 100, lumbar: 10, thoracic: 14, sh: 60, el: 10 },
};
const CTX = { anchorX: ['ankleR'], anchorAt: [0.32, 0.12] };

function newton(p, keys, res, iters = 50) {
  const n = keys.length, e = 0.4;
  for (let it = 0; it < iters; it++) {
    const r0 = res(p);
    const Jm = keys.map((k) => { const r = res({ ...p, [k]: p[k] + e }); return r.map((v, i) => (v - r0[i]) / e); });
    const A = r0.map((_, i) => keys.map((_, j) => Jm[j][i]).concat([r0[i]]));
    for (let c = 0; c < n; c++) {
      let piv = c; for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r;
      [A[c], A[piv]] = [A[piv], A[c]]; if (Math.abs(A[c][c]) < 1e-9) return;
      for (let r = 0; r < n; r++) if (r !== c) { const f = A[r][c] / A[c][c]; for (let k = c; k <= n; k++) A[r][k] -= f * A[c][k]; }
    }
    keys.forEach((k, j) => { p[k] -= Math.max(-4, Math.min(4, A[j][n] / A[j][j])); });
  }
  keys.forEach((k) => { p[k] = +p[k].toFixed(2); });
}

function fitDragon(poses, extra) {
  const { solve, expand } = FB;
  const S = (p) => solve(expand(Object.assign({}, p, { ik: undefined })), CTX).J;
  const D = Math.PI / 180;
  const lunge = (p, tilt) => newton(p, ['hipR', 'kneeR', 'kneeL'], (q) => { const J = S(q);
    return [J.heelR[1] - MAT, (J.kneeR[0] - J.ankleR[0]) - Math.sin(tilt * D) * FB.BODY.shin, J.ankleL[1] - (MAT + BLK + 0.065)]; });
  newton(poses.prep, ['hipR', 'kneeR'], (q) => { const J = S(q); return [J.heelR[1] - MAT, J.kneeR[0] - J.ankleR[0]]; });
  lunge(poses.hold, 8);
  const Jh = S(poses.hold);
  // chest forward over the thigh until the straight arms reach standard tall blocks (23 cm)
  const reachY = MAT + 0.23 + 0.045 + (FB.BODY.upper + FB.BODY.fore) * 0.97;
  const reach = (p, dy = 0) => { let lo = -10, hi = 60; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (S({ ...p, thoracic: m }).shoulderR[1] > reachY - dy) lo = m; else hi = m; } p.thoracic = +((lo + hi) / 2).toFixed(2); };
  reach(poses.hold); reach(poses.prep);
  const Jh2 = S(poses.hold);
  BH = Math.max(0.12, Math.min(0.32, +(Jh2.shoulderR[1] - (FB.BODY.upper + FB.BODY.fore) * 0.97 - 0.045 - MAT).toFixed(3)));
  for (const k in poses) poses[k].handSurface = MAT + BH;
  BX = Jh2.shoulderR[0] + 0.06; BZR = Jh.ankleR[2] + 0.19; BZL = Jh.shoulderL[2] - 0.04;
  const ik = { handL: { at: [BX, MAT + BH, BZL] }, handR: { at: [BX, MAT + BH, BZR] } };
  poses.prep.ik = ik; poses.hold.ik = ik;
  for (const [at, pose] of extra) {
    pose.handSurface = MAT + BH;
    if (pose.tilt) { const m = Object.assign({}, poses[at], pose); lunge(m, pose.tilt); reach(m, 0.045); Object.assign(pose, { hipR: m.hipR, kneeR: m.kneeR, kneeL: m.kneeL, thoracic: m.thoracic }); }
    if (pose.kneecap) { const m = Object.assign({}, poses[at], pose); newton(m, ['hipR', 'kneeR', 'kneeL'], (q) => { const J = S(q);
      return [J.heelR[1] - MAT, (J.kneeR[0] - J.ankleR[0]) - Math.sin(8 * D) * FB.BODY.shin, J.toeL[1] - MAT]; }); Object.assign(pose, { hipR: m.hipR, kneeR: m.kneeR, kneeL: m.kneeL }); }
  }
  return poses;
}

window.EXERCISE = {
  id: 'yin_dragon',
  name: { tr: 'Yin Ejderha Pozu', en: 'Yin Dragon Pose', es: 'Dragón yin' },
  category: { tr: 'Yin Yoga · Kalça', en: 'Yin Yoga · Hips', es: 'Yin yoga · Cadera' },
  equipmentLabel: { tr: 'Mat, 2 blok, battaniye', en: 'Mat, 2 blocks, blanket', es: 'Esterilla, 2 bloques, manta' },
  muscles: ['quads', 'glutes', 'adductors'],
  side: 'R',
  tempo: '5-10-4',
  hold: true, holdDur: 3,
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 25, pitch: 14, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Ön diz ayak bileğinin üstünde, eller bloklarda', en: 'Front knee over the ankle, hands on the blocks', es: 'Rodilla delantera sobre el tobillo, manos en bloques' } },
  setupView: { yaw: 40, pitch: 14 },
  contacts: ['kneeL', 'heelR', 'ballR', 'handR', 'handL'],
  props: [['mat', { at: [0.05, 0, 0.02], length: 1.9, width: 0.75 }], ['_kneeBlanket'], ['_handBlocks']],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fitDragon(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'prep',
  rep: [
    { to: 'hold', dur: 4.0, phase: 0 },
    { to: 'hold', dur: 1.0, phase: 1 },
    { to: 'prep', dur: 3.5, phase: 2 },
  ],
  setup: { tr: 'Sağ ayak eller arasında öne, sol diz battaniyede. Eller iki blokta. Sonra taraf değiştir.',
    en: 'Right foot forward between the hands, left knee on a blanket. Hands on two blocks. Then switch sides.',
    es: 'Pie derecho adelante entre las manos, rodilla izquierda en una manta. Manos en bloques. Luego cambia.' },
  phases: [
    { name: { tr: 'Arka dizi geri kaydır', en: 'Slide the back knee back', es: 'Desliza la rodilla atrás' }, breath: 'out', slow: 1.0,
      text: { tr: 'Nefes verirken sol dizi geri kaydır, kalça öne ve aşağı insin.', en: 'Exhale, slide the left knee back and let the hips sink forward and down.', es: 'Exhala, desliza la rodilla izquierda atrás y deja bajar la cadera.' } },
    { name: { tr: 'Bırak ve kal', en: 'Let go and stay', es: 'Suelta y quédate' }, breath: 'easy', line: ['ankleR', 'kneeR'],
      text: { tr: 'Ön diz ayak bileğinin üstünde. Karın ve çene yumuşak, bakış aşağı.', en: 'Front knee over the ankle. Belly and jaw soft, gaze down.', es: 'Rodilla delantera sobre el tobillo. Abdomen y mandíbula suaves.' } },
    { name: { tr: 'Yavaşça çık', en: 'Come out slowly', es: 'Sal despacio' }, breath: 'in', slow: 1.0,
      text: { tr: 'Arka dizi öne getir, masaya dön ve taraf değiştir.', en: 'Bring the back knee forward, return to tabletop, switch sides.', es: 'Trae la rodilla atrás adelante, vuelve a mesa y cambia.' } },
  ],
  tempoText: { tr: '5 sn gir · her yan 2-3 dk · 4 sn çık', en: '5 s in · 2-3 min each side · 4 s out', es: '5 s entrar · 2-3 min por lado · 4 s salir' },
  mistakes: [
    { title: { tr: 'Ön diz parmakları geçiyor', en: 'Front knee past the toes', es: 'Rodilla pasa los dedos' },
      text: { tr: 'Diz öne kayar, yük dize biner.', en: 'The knee drifts forward and loads the joint.', es: 'La rodilla se adelanta y carga la articulación.' },
      fix: { tr: 'Ön ayağı biraz öne al', en: 'Step the front foot forward', es: 'Adelanta el pie delantero' },
      fixText: { tr: 'Diz ayak bileğinin üstünde kalsın', en: 'Keep the knee stacked over the ankle', es: 'Rodilla alineada sobre el tobillo' },
      at: 'hold', pose: { tilt: 34 }, marks: ['kneeR'], line: ['ankleR', 'kneeR'], parts: ['shinR'] },
    { title: { tr: 'Arka diz yastıksız', en: 'Back knee unpadded', es: 'Rodilla trasera sin apoyo' },
      text: { tr: 'Ayak parmakları kıvrık, ağırlık diz kapağına biner.', en: 'Toes tucked, the weight presses on the kneecap.', es: 'Dedos flexionados, el peso cae en la rótula.' },
      fix: { tr: 'Dizin altına battaniye koy', en: 'Pad the knee with a blanket', es: 'Pon una manta bajo la rodilla' },
      fixText: { tr: 'Ayak üstü yerde, diz yumuşak zeminde', en: 'Top of the foot down, knee on soft padding', es: 'Empeine abajo, rodilla sobre algo blando' },
      at: 'hold', pose: { ground: G(-BLK), kneeL: 90, ankleL: 10, kneecap: true }, view: { yaw: 120, pitch: 10 }, marks: ['kneeL'], parts: ['shinL'] },
  ],
  cues: [{ tr: 'Ön diz ayak bileğinin üstünde', en: 'Front knee over the ankle', es: 'Rodilla delantera sobre el tobillo' },
    { tr: 'Kalça öne ve aşağı', en: 'Hips forward and down', es: 'Cadera adelante y abajo' },
    { tr: 'Gevşe, zorlama', en: 'Relax, no forcing', es: 'Relájate, sin forzar' }],
};
}
