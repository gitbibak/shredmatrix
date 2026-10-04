/* King Pigeon (Eka Pada Rajakapotasana), right shin forward. Upright pigeon, palms together at the chest -> bend the back (left)
 * knee, reach both hands overhead and catch the back foot, chest lifts, head back -> hold -> release to pigeon.
 * Switch sides is in the setup text.
 * - Built on pigeon_pose.js: one ground contact [kneeR] in every pose; fitKing() (lazy, after the rig sets FB.BODY) uses the
 *   same Newton (hipL, kneeL, hrotR, hipR) so the back knee/foot and the front ankle rest on the mat in the pigeon.
 * - King: pelvis and thighs are copied from the pigeon (front hip and back thigh stay down), the back knee bends to 150 and one
 *   scale on (lumbar, thoracic, neck) is bisected until the foot is ~32 cm from the shoulders, so the overhead hands hold it
 *   with the elbows bent (~120). Hands are world targets on the foot in the king pose and palms together at the chest in the
 *   pigeon (spec: hands on the floor; from the floor the straight hand path passed through the shoulder and flipped the elbows).
 * - The rig's foot cannot touch the crown here without an extreme spine; the foot stays just behind the head. */
{
const MAT = 0.012;
const G = [['kneeR', MAT]];
const BASE = { ground: G, flat: false, curl: 0.15, noAvoid: true };
const LEGS = { trunk: 42, hipR: 92, kneeR: 92, abdR: 18, hrotR: 60, ankleR: -25, hipL: -30, kneeL: 2, abdL: 2, hrotL: 0, ankleL: -70 };
const RAW = {
  pigeon: { ...BASE, ...LEGS, lumbar: -24, thoracic: -10, neck: 0, sh: 40, shAbd: 18, el: 100, palm: 'in', curl: 0.1, elbowPole: [0.3, 0, 1] },
  king: { ...BASE, ...LEGS, kneeL: 118, ankleL: -10, lumbar: -36, thoracic: -30, neck: -28, sh: 170, shAbd: 14, el: 110, palm: 'forward', curl: 0.85,
    elbowPole: [0.3, 0, 1] },
};
const CTX = { anchorX: ['kneeR'], anchorAt: [0.1, 0.08] };

function newton(p, keys, res, iters = 40) {
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

function fitKing(poses, extra) {
  const { V, solve, expand } = FB;
  const S = (p) => solve(expand(Object.assign({}, p, { ik: undefined })), CTX).J;
  const pg = poses.pigeon;
  newton(pg, ['hipL', 'kneeL', 'hrotR', 'hipR'], (q) => { const J = S(q);
    return [J.kneeL[1] - (MAT + 0.05), J.ankleL[1] - (MAT + 0.045), J.ankleR[1] - (MAT + 0.05), J.pelvis[1] - (MAT + 0.1)]; });
  const Jp = S(pg);
  const mid = V.lerp(Jp.shoulderL, Jp.shoulderR, 0.5);            // palms together in front of the chest
  pg.ik = { handL: { at: V.add(mid, [0.17, -0.13, -0.03]) }, handR: { at: V.add(mid, [0.17, -0.13, 0.03]) } };
  const foot = (J, s) => V.add(V.lerp(J.ankleL, J.ballL, 0.45), [0, 0.02, (s === 'R' ? 1 : -1) * 0.045]);
  const fitBack = (p, keys) => { const P0 = {}; keys.forEach((k) => { P0[k] = p[k]; });
    const f = (m) => { const q = { ...p }; keys.forEach((k) => { q[k] = P0[k] * m; }); const J = S(q); return V.len(V.sub(V.lerp(J.ankleL, J.ballL, 0.5), J.head)) - 0.2; };
    let lo = 0.3, hi = 1.6; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (f(m) > 0) lo = m; else hi = m; }
    const m = (lo + hi) / 2; keys.forEach((k) => { p[k] = +(P0[k] * m).toFixed(2); });
    const J = S(p); p.ik = { handL: { at: foot(J, 'L') }, handR: { at: foot(J, 'R') } }; };
  const k = poses.king; ['hipL', 'hrotR', 'hipR'].forEach((key) => { k[key] = pg[key]; });
  fitBack(k, ['lumbar', 'thoracic', 'neck']);
  for (const [at, pose] of extra) {
    const m = Object.assign({}, poses[at], pose);
    if (pose.refit) { fitBack(m, pose.refit); pose.refit.forEach((key) => { pose[key] = m[key]; }); pose.ik = m.ik; }
    else { const J = S(m); pose.ik = { handL: { at: foot(J, 'L') }, handR: { at: foot(J, 'R') } }; }
  }
  return poses;
}

window.EXERCISE = {
  id: 'king_pigeon',
  name: { tr: 'Kral Güvercin Pozu', en: 'King Pigeon Pose', es: 'Postura de la paloma real' },
  category: { tr: 'Yoga · Geriye eğilme', en: 'Yoga · Backbend', es: 'Yoga · Extensión' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['quads', 'glutes', 'chest', 'lowerback'],
  side: 'R',
  tempo: '4-8-4',
  hold: true, holdDur: 3,
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 35, pitch: 14, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Kalçalar düz, iki el arka ayakta', en: 'Hips square, both hands on the back foot', es: 'Cadera recta, ambas manos en el pie trasero' } },
  setupView: { yaw: 35, pitch: 16 },
  contacts: ['kneeR', 'kneeL', 'ankleR'],
  props: [['mat', { at: [0.05, 0, 0.05], length: 1.9, width: 0.7 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fitKing(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'pigeon',
  rep: [
    { to: 'king', dur: 4.0, phase: 0 },
    { to: 'king', dur: 1.0, phase: 1 },
    { to: 'pigeon', dur: 3.5, phase: 2 },
  ],
  setup: { tr: 'Güvercin pozu: sağ kaval kemiği önde, sol bacak geride, eller göğüste. Sonra taraf değiştir.',
    en: 'Pigeon: right shin in front, left leg back, palms at the chest. Then switch sides.',
    es: 'Paloma: espinilla derecha delante, pierna izquierda atrás, manos al pecho. Luego cambia.' },
  phases: [
    { name: { tr: 'Ayağı yakala', en: 'Catch the foot', es: 'Toma el pie' }, breath: 'in', slow: 1.0,
      text: { tr: 'Sol dizi bük, kolları başın üstünden geriye uzat, ayağı yakala.', en: 'Bend the left knee, reach both arms overhead and back, catch the foot.', es: 'Flexiona la rodilla izquierda, lleva los brazos arriba y atrás, toma el pie.' } },
    { name: { tr: 'Pozda kal', en: 'Hold', es: 'Mantén' }, breath: 'easy', line: ['pelvis', 'waist', 'neck'],
      text: { tr: 'Göğsü kaldır, ayağı başa çek. Ön kalça yerde, 3-5 nefes.', en: 'Lift the chest, draw the foot to the head. Front hip down, 3-5 breaths.', es: 'Eleva el pecho, el pie hacia la cabeza. Cadera abajo, 3-5 respiraciones.' } },
    { name: { tr: 'Yavaşça bırak', en: 'Release slowly', es: 'Suelta despacio' }, breath: 'out', slow: 1.0,
      text: { tr: 'Ayağı bırak, elleri göğse al, güvercine dön.', en: 'Let go of the foot, hands to the chest, back to pigeon.', es: 'Suelta el pie, manos al pecho, vuelve a paloma.' } },
  ],
  tempoText: { tr: '4 sn gir · 3-5 nefes kal · 4 sn çık', en: '4 s in · 3-5 breaths · 4 s out', es: '4 s entrar · 3-5 respiraciones · 4 s salir' },
  mistakes: [
    { title: { tr: 'Ön kalça havada', en: 'Front hip lifts', es: 'La cadera delantera se eleva' },
      text: { tr: 'Leğen yana döner, kalça yerden kalkar.', en: 'The pelvis rotates sideways and the hip lifts off the floor.', es: 'La pelvis gira y la cadera se despega.' },
      fix: { tr: 'Kalçanın altına blok koy', en: 'Put a block under the hip', es: 'Pon un bloque bajo la cadera' },
      fixText: { tr: 'Kalçalar düz ve öne bakar', en: 'Hips level and facing forward', es: 'Cadera nivelada y al frente' },
      at: 'king', pose: { roll: -10, side: 6 }, view: { yaw: 20, pitch: 14 }, marks: ['hipR', 'hipL'], line: ['hipL', 'hipR'], parts: ['pelvis'] },
    { title: { tr: 'Bel aşırı çukurlaşıyor', en: 'Low back over-arches', es: 'La lumbar se arquea de más' },
      text: { tr: 'Bel kırılır, baş ense üstüne ezilir.', en: 'The low back creases and the head crunches back.', es: 'La lumbar se quiebra y la cabeza se comprime atrás.' },
      fix: { tr: 'Karın hafif aktif, kemer kullan', en: 'Abs gently on, use a strap', es: 'Abdomen activo, usa una correa' },
      fixText: { tr: 'Esneme göğüsten gelsin, ayak ulaşmıyorsa kemer', en: 'Open from the chest; a strap if the foot is out of reach', es: 'Abre desde el pecho; correa si no llegas al pie' },
      at: 'king', pose: { lumbar: -52, thoracic: -10, neck: -50, refit: ['lumbar'] }, line: ['pelvis', 'waist', 'neck'], parts: ['waist', 'neck'] },
  ],
  cues: [{ tr: 'Kalçalar düz', en: 'Square hips', es: 'Cadera recta' },
    { tr: 'Ayak başa gelirken göğsü kaldır', en: 'Lift the chest as the foot reaches the head', es: 'Eleva el pecho cuando el pie llega a la cabeza' },
    { tr: 'Ön kalça yerde', en: 'Keep the front hip grounded', es: 'Cadera delantera abajo' }],
};
}
