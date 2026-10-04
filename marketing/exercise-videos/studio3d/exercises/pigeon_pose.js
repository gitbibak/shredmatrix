/* Pigeon Pose (Eka Pada Rajakapotasana prep), right leg forward. Tabletop -> right knee forward, shin across the mat, left leg
 * long behind, chest upright, hands beside the hips -> fold forward over the front shin (sleeping pigeon), hold -> tabletop.
 * Switch sides is in the setup text.
 * - One ground contact [kneeR] in every pose (same name; the 2-contact solver is sagittal only and both knees share x in the
 *   tabletop). Everything else is placed by lazy fits (after the rig sets FB.BODY) with a small Newton solver:
 *   tabletop: (trunk, sh) so the thighs and arms are vertical and the wrists reach the mat;
 *   pigeon: (trunk, hipL, hrotR) so the back knee and back foot lie on the mat and the front ankle rests on the mat.
 * - The fold keeps the pelvis/legs of the pigeon and flexes lumbar + thoracic (pelvis cannot tilt without lifting the legs).
 * - Hands: world targets in every pose (flat palms; table under the shoulders, pigeon beside the hips, fold reaching forward). */
{
const MAT = 0.012;
const G = [['kneeR', MAT]];
const BASE = { ground: G, flat: false, handFlat: true, handSurface: 0, curl: 0.15 };
const RAW = {
  table: { ...BASE, trunk: 88, hip: 88, knee: 90, ankle: -60, abd: 2, hrot: 0, sh: 88, el: 0, lumbar: 0, thoracic: 0, neck: -4, elbowPole: [-1, 0.2, 0.6] },
  pigeon: { ...BASE, trunk: 42, hipR: 92, kneeR: 92, abdR: 18, hrotR: 60, ankleR: -25, hipL: -30, kneeL: 2, abdL: 2, hrotL: 0, ankleL: -70,
    lumbar: -24, thoracic: -10, neck: 0, sh: 20, shAbd: 18, el: 6, elbowPole: [-1, 0.2, 0.6] },
  fold: { ...BASE, trunk: 42, hipR: 92, kneeR: 92, abdR: 18, hrotR: 60, ankleR: -25, hipL: -30, kneeL: 2, abdL: 2, hrotL: 0, ankleL: -70,
    lumbar: 22, thoracic: 30, neck: 12, sh: 150, shAbd: 18, el: 25, elbowPole: [1, 0, 0.6] },
};
const CTX = { anchorX: ['kneeR'], anchorAt: [0.1, 0.08] };

function newton(p, keys, res, iters = 40) {
  const n = keys.length, e = 0.4;
  for (let it = 0; it < iters; it++) {
    const r0 = res(p);
    const Jm = keys.map((k) => { const q = { ...p, [k]: p[k] + e }; const r = res(q); return r.map((v, i) => (v - r0[i]) / e); }); // Jm[j][i] = dr_i/dk_j
    // solve A x = r0 with A[i][j] = Jm[j][i] (Gaussian elimination)
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

function fitPigeon(poses) {
  const { solve, expand } = FB;
  const S = (p) => solve(expand(Object.assign({}, p, { ik: undefined })), CTX).J;
  const t = poses.table;
  newton(t, ['trunk', 'sh'], (q) => { const J = S({ ...q, hip: q.trunk }); return [J.wristR[1] - 0.05, J.wristR[0] - J.shoulderR[0] - 0.02]; });
  t.hip = t.trunk;
  for (const k of ['pigeon', 'fold']) {
    const p = poses[k];
    if (k === 'fold') {
      ['hipL', 'kneeL', 'hrotR', 'hipR'].forEach((key) => { p[key] = poses.pigeon[key]; });
      // forehead just above the mat (on the forearms / a block): bisect the thoracic flexion
      let lo = -10, hi = 60; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (S({ ...p, thoracic: m }).head[1] > MAT + 0.17) lo = m; else hi = m; }
      p.thoracic = +((lo + hi) / 2).toFixed(2); continue;
    }
    newton(p, ['hipL', 'kneeL', 'hrotR', 'hipR'], (q) => { const J = S(q);
      return [J.kneeL[1] - (MAT + 0.05), J.ankleL[1] - (MAT + 0.045), J.ankleR[1] - (MAT + 0.05), J.pelvis[1] - (MAT + 0.1)]; });
  }
  const Jt = S(t), Jp = S(poses.pigeon), Jf = S(poses.fold);
  const floor = (J, s, dx = 0, dz = 0) => [J['hand' + s][0] + dx, 0, J['hand' + s][2] + dz];
  t.ik = { handL: { at: floor(Jt, 'L') }, handR: { at: floor(Jt, 'R') } };
  poses.pigeon.ik = { handL: { at: [Jp.hipL[0] + 0.02, 0, Jp.hipL[2] - 0.2] }, handR: { at: [Jp.hipR[0] + 0.06, 0, Jp.hipR[2] + 0.2] } };
  poses.fold.ik = { handL: { at: floor(Jf, 'L', 0.1, 0) }, handR: { at: floor(Jf, 'R', 0.1, 0) } };
  // hand walking (no sliding): the hands go forward in 2 lifted steps (and back the same way). For each step: liftA = palms raised ~9 cm at
  // the start spot, liftB = palms held over the new spot (the card's slow move), then they are set down (card-less). Body = blend of pigeon/fold.
  const f = poses.fold, g = poses.pigeon, hs = (pose, a) => ({ ...pose, handSurface: a });
  const blend = (t) => { const o = { ...g }; for (const k of ['lumbar', 'thoracic', 'neck', 'sh', 'el']) o[k] = g[k] + (f[k] - g[k]) * t; o.elbowPole = f.elbowPole; return o; };
  const at = (L, R) => ({ handL: { at: L }, handR: { at: R } });
  const pos = (t) => at(g.ik.handL.at.map((v, i) => v + (f.ik.handL.at[i] - v) * t), g.ik.handR.at.map((v, i) => v + (f.ik.handR.at[i] - v) * t));
  const ik = [pos(0), pos(0.5), pos(1)], body = [g, blend(0.5), f];
  for (let i = 0; i < 2; i++) {
    const a = i, b = i + 1;
    poses['stepA' + (i + 1)] = hs({ ...body[a], ik: ik[a] }, 0.07);
    poses['stepB' + (i + 1)] = hs({ ...body[b], ik: ik[b] }, 0.07);
    poses['mid' + (i + 1)] = hs({ ...body[b], ik: ik[b] }, 0);
  }
  poses.midBody = poses.mid1;
  return poses;
}

window.EXERCISE = {
  id: 'pigeon_pose',
  name: { tr: 'Güvercin Pozu', en: 'Pigeon Pose', es: 'Postura de la paloma' },
  category: { tr: 'Yoga · Kalça', en: 'Yoga · Hips', es: 'Yoga · Cadera' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['glutes', 'adductors', 'quads'],
  tempo: '3-hold-3',
  hold: true, holdDur: 1.9,
  view: { yaw: 90, pitch: 8 },
  setupView: { yaw: 35, pitch: 16 },
  alt: { yaw: 30, pitch: 18, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Kalçalar düz ve öne bakar', en: 'Hips level and facing forward', es: 'Cadera nivelada y al frente' } },
  contacts: ['kneeR', 'kneeL', 'ankleR', 'handR', 'handL'],
  props: [['mat', { at: [0.05, 0, 0.05], length: 1.9, width: 0.7 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fitPigeon(RAW)); },
  rest: 'pigeon',
  rep: [
    { to: 'stepA1', dur: 0.15, phase: 0, card: false },
    { to: 'stepB1', dur: 1.5, phase: 0 },
    { to: 'mid1', dur: 0.3, phase: 0, card: false },
    { to: 'stepA2', dur: 0.15, phase: 0, card: false },
    { to: 'stepB2', dur: 1.5, phase: 0 },
    { to: 'fold', dur: 0.3, phase: 0, card: false },
    { to: 'fold', dur: 1.0, phase: 1 },
    { to: 'stepB2', dur: 0.15, phase: 2, card: false },
    { to: 'stepA1', dur: 2.0, phase: 2 },
    { to: 'pigeon', dur: 0.3, phase: 2, card: false },
  ],
  setup: { tr: 'Masadan sağ dizi sağ bileğin arkasına getir, sol bacağı geriye uzat. Eller kalçanın yanında, göğüs dik.',
    en: 'From tabletop, bring the right knee behind the right wrist and slide the left leg back. Hands by the hips, chest up.',
    es: 'Desde mesa, rodilla derecha tras la muñeca derecha y pierna izquierda atrás. Manos junto a la cadera, pecho arriba.' },
  phases: [
    { name: { tr: 'Öne katlan', en: 'Fold forward', es: 'Pliégate' }, breath: 'out', slow: 1.0,
      text: { tr: 'Kalçalar düz kalsın, gövdeyi ön kaval kemiğinin üstüne indir.', en: 'Keep the hips square and lower the chest over the front shin.', es: 'Cadera recta, baja el pecho sobre la espinilla delantera.' } },
    { name: { tr: 'Pozda kal', en: 'Hold', es: 'Mantén' }, breath: 'easy',
      text: { tr: 'Alnı kollara bırak, kalçaya doğru nefes al. 5-10 nefes.', en: 'Rest the forehead on the arms, breathe into the hip. 5-10 breaths.', es: 'Apoya la frente en los brazos, respira hacia la cadera. 5-10 respiraciones.' } },
    { name: { tr: 'Doğrul', en: 'Rise up', es: 'Sube' }, breath: 'in', slow: 1.0,
      text: { tr: 'Elleri geri yürüt, göğsü kaldır. Sonra masaya dön ve taraf değiştir.', en: 'Walk the hands back and lift the chest. Then return to tabletop and switch.', es: 'Camina las manos atrás y sube el pecho. Luego vuelve a mesa y cambia.' } },
  ],
  tempoText: { tr: '3 sn katlan · 5-10 nefes kal · 3 sn doğrul', en: '3 s fold · 5-10 breaths · 3 s up', es: '3 s pliégate · 5-10 respiraciones · 3 s arriba' },
  mistakes: [
    { title: { tr: 'Ön kalça havada', en: 'Front hip lifts', es: 'La cadera delantera se eleva' },
      text: { tr: 'Leğen sağa yatar, kalça yerden kalkar.', en: 'The pelvis tilts and the hip comes off the floor.', es: 'La pelvis se inclina y la cadera se despega.' },
      fix: { tr: 'Kalçanın altına destek koy', en: 'Put a prop under the hip', es: 'Pon un soporte bajo la cadera' },
      fixText: { tr: 'Blok ya da battaniye; kalçalar aynı hizada', en: 'A block or blanket; hips level', es: 'Bloque o manta; caderas niveladas' },
      at: 'pigeon', pose: { roll: -14, side: 8 }, view: { yaw: 20, pitch: 14 }, marks: ['hipR', 'hipL'], line: ['hipL', 'hipR'], parts: ['pelvis'] },
    { title: { tr: 'Ön ayak bilek içe kıvrılıyor', en: 'Front ankle sickles', es: 'El tobillo delantero se tuerce' },
      text: { tr: 'Ayak içe döner, bilek zorlanır.', en: 'The foot curls in and strains the ankle.', es: 'El pie se curva hacia dentro y fuerza el tobillo.' },
      fix: { tr: 'Ön ayağı flekse et', en: 'Flex the front foot', es: 'Flexiona el pie delantero' },
      fixText: { tr: 'Ayak parmakları dize doğru, bilek düz', en: 'Toes toward the knee, ankle straight', es: 'Dedos hacia la rodilla, tobillo recto' },
      at: 'pigeon', pose: { ankleR: -55, footOutR: -30 }, view: { yaw: 30, pitch: 22 }, marks: ['ankleR'], parts: ['shinR'] },
  ],
  cues: [{ tr: 'Kalçalar düz', en: 'Hips square', es: 'Cadera recta' },
    { tr: 'Ön kaval kemiği öne', en: 'Front shin forward', es: 'Espinilla delantera adelante' },
    { tr: 'Kalçaya nefes al', en: 'Breathe into the hip', es: 'Respira hacia la cadera' }],
};
}
