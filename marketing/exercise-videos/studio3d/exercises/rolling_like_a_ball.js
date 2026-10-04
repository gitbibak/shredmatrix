/* Rolling Like a Ball (Pilates mat). Deep C-curve (lumbar 40, thoracic 30, neck 45), knees hugged, hands on the front of
 * the ankles; the shape never changes, only `trunk` rolls the whole ball from the sit-bone balance (chord ~25° behind
 * vertical) back to the shoulder blades (~100°).
 * - Contacts: no explicit ground, so the engine rests the lowest body point on the mat (pelvis -> chest -> shoulders as the
 *   ball rolls), i.e. the contact travels smoothly along the spine. The lumbar (waist) is not one of the engine's
 *   contact points, so the mid key (where the low back carries the weight) is lifted 3 cm with `pos` to keep it out of the mat.
 * - anchorX = waist: the ball rocks in place on the curve of the back.
 * - Arms are FK, fitted lazily so the hands hold the ankles in the balance pose; the same angles hold in every pose
 *   because the body shape is constant.  * Fix 2026-10-04: arm fit also solves shRot and penalises arm/leg overlap (clear()); knees abd 16, hands on the outer side of the mid-shin, forearms outside the legs.
 */
{
const BASE = { lumbar: 40, thoracic: 30, neck: 45, hip: 78, knee: 132, ankle: -30, abd: 16, hrot: 8, flat: false,
  palm: 'in', curl: 0.7, protract: 0.04, sh: 30, shAbd: 18, el: 70, bendR: [1, 0.3, -0.6], bendL: [1, 0.3, 0.6] };
const RAW = {
  ball: { ...BASE, trunk: -94 },
  mid: { ...BASE, trunk: -146, pos: [0, 0.03, 0] },
  back: { ...BASE, trunk: -164 },
};
const CTX = { anchorX: ['waist'], anchorAt: [0, 0] };

function clear(J) {                                  // worst clearance (m) between the arm segments and the legs; the hand end of the forearm may touch the shin
  const { V } = FB;
  const sd = (a, b, c, d) => { let m = 1e9, k = 0; for (let i = 0; i <= 8; i++) { const P = V.lerp(a, b, i / 8); for (let j = 0; j <= 8; j++) { const e = V.len(V.sub(P, V.lerp(c, d, j / 8))); if (e < m) { m = e; k = i / 8; } } } return [m, k]; };
  let w = 1e9;
  for (const s of ['L', 'R']) for (const o of ['L', 'R']) {
    const legs = [[0.085, J['hip' + o], J['knee' + o], 'th'], [0.058, J['knee' + o], J['ankle' + o], 'sh']];
    const arms = [[0.042, J['shoulder' + s], J['elbow' + s], 'up'], [0.036, J['elbow' + s], J['wrist' + s], 'fo']];
    for (const [ra, a1, a2, an] of arms) for (const [rl, l1, l2, ln] of legs) {
      const [d, k] = sd(a1, a2, l1, l2); if (an === 'fo' && ln === 'sh' && k > 0.8) continue;
      w = Math.min(w, d - ra - rl);
    }
  }
  return w;
}
function fit(poses, extra) {
  const { V, solve, expand } = FB;
  const S = (p) => solve(expand(p), CTX).J;
  const p = poses.ball, J0 = S(p);
  const tgt = (s) => V.add(V.lerp(J0['ankle' + s], J0['knee' + s], 0.4), [0.0, 0.02, (s === 'R' ? 1 : -1) * 0.07]);
  const mk = (q) => ({ ...p, sh: q[0], shAbd: q[1], el: q[2], shRot: q[3] });
  const err = (q) => { const J = S(mk(q)); return V.len(V.sub(J.handR, tgt('R'))) + V.len(V.sub(J.handL, tgt('L'))) + 6 * Math.max(0, 0.012 - clear(J)); };
  let best = null, be = 1e9;
  for (const s0 of [10, 40, 70]) for (const a0 of [15, 40, 65]) for (const e0 of [50, 90]) for (const r0 of [-30, 0, 30]) {
    let cur = [s0, a0, e0, r0], ce = err(cur);
    for (const st of [8, 4, 2, 1, 0.5]) { let imp = true; while (imp) { imp = false;
      for (let i = 0; i < 4; i++) for (const d of [-st, st]) { const q = cur.slice(); q[i] += d; if (q[2] < 0) continue; const e = err(q); if (e < ce - 1e-5) { ce = e; cur = q; imp = true; } } } }
    if (ce < be) { be = ce; best = cur; }
  }
  const fin = { sh: +best[0].toFixed(1), shAbd: +best[1].toFixed(1), el: +best[2].toFixed(1), shRot: +best[3].toFixed(1) };
  for (const k in poses) Object.assign(poses[k], fin);
  for (const [, pose] of extra) if (pose._arms) Object.assign(pose, { sh: best[0] + pose._arms[0], shAbd: best[1] + pose._arms[1], el: best[2] + pose._arms[2], shRot: best[3] });
  poses.ball._err = be; poses.ball._clear = clear(S(mk(best)));
  return poses;
}

window.EXERCISE = {
  id: 'rolling_like_a_ball',
  name: { tr: 'Top Gibi Yuvarlanma (Rolling Like a Ball)', en: 'Rolling Like a Ball', es: 'Rodar como una pelota (rolling like a ball)' },
  category: { tr: 'Pilates · Karın', en: 'Pilates · Core', es: 'Pilates · Core' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['core', 'obliques'],
  tempo: '1.5-1.5',
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 40, pitch: 16, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Top şekli hiç bozulmaz', en: 'The ball shape never changes', es: 'La forma de bola no cambia' } },
  contacts: ['pelvis'],
  props: [['mat', { at: [0, 0, 0], length: 1.6 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fit(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'ball',
  rep: [
    { to: 'mid', dur: 0.75, phase: 0, ease: 'in' },
    { to: 'back', dur: 0.75, phase: 1, ease: 'out' },
    { to: 'mid', dur: 0.75, phase: 2, ease: 'in' },
    { to: 'ball', dur: 0.75, phase: 3, ease: 'out' },
  ],
  setup: { tr: 'Oturma kemiklerinde dengede kal, ayaklar havada. Dizleri sar, eller bileklerde, çene göğse.',
    en: 'Balance on your sit bones, feet off the mat. Hug the knees, hands on the ankles, chin to chest.',
    es: 'Equilibrio sobre los isquiones, pies en el aire. Abraza las rodillas, manos en los tobillos, barbilla al pecho.' },
  phases: [
    { name: { tr: 'Nefes al, geriye yuvarlan', en: 'Inhale, roll back', es: 'Inhala, rueda atrás' }, breath: 'in', line: ['pelvis', 'waist', 'neck'],
      text: { tr: 'Top şeklini koru; sırt minderde yuvarlanır.', en: 'Keep the ball shape; the back rolls along the mat.', es: 'Mantén la bola; la espalda rueda por la esterilla.' } },
    { name: { tr: 'Kürek kemiklerinde dur', en: 'Stop at the shoulder blades', es: 'Para en las escápulas' }, breath: 'in',
      text: { tr: 'Baş ve boyun minderden uzak, çene göğse yakın.', en: 'Head and neck off the mat, chin close to the chest.', es: 'Cabeza y cuello fuera, barbilla al pecho.' } },
    { name: { tr: 'Nefes ver, öne yuvarlan', en: 'Exhale, roll up', es: 'Exhala, rueda arriba' }, breath: 'out',
      text: { tr: 'Hareketi karın başlatır, bacaklarla savurma.', en: 'The abs start the roll; no kick from the legs.', es: 'El abdomen inicia; sin impulso de piernas.' } },
    { name: { tr: 'Dengede dur', en: 'Balance', es: 'Equilibrio' }, breath: 'out',
      text: { tr: 'Oturma kemiklerinde dur, ayaklar havada.', en: 'Stop on the sit bones, feet off the mat.', es: 'Para sobre los isquiones, pies en el aire.' } },
  ],
  tempoText: { tr: '1,5 sn geri · 1,5 sn ileri', en: '1.5 s back · 1.5 s up', es: '1,5 s atrás · 1,5 s arriba' },
  mistakes: [
    { title: { tr: 'Boyna kadar yuvarlanmak', en: 'Rolling onto the neck', es: 'Rodar sobre el cuello' },
      fix: { tr: 'Kürek kemiklerinde dur', en: 'Stop at the shoulder blades', es: 'Para en las escápulas' },
      fixText: { tr: 'Baş minderden uzak, çene göğse yakın', en: 'Head off the mat, chin close to the chest', es: 'Cabeza fuera de la esterilla, barbilla al pecho' },
      at: 'back', pose: { trunk: -184, neck: 24 }, marks: ['head'], parts: ['neck', 'face'] },
    { title: { tr: 'Sırt düzleşiyor, bacaklar fırlıyor', en: 'Back flattens, legs kick', es: 'La espalda se aplana, las piernas patean' },
      fix: { tr: 'C-kıvrımını derinleştir', en: 'Deepen the C-curve', es: 'Profundiza la C' },
      fixText: { tr: 'Göbek omurgaya, dizler göğse yakın', en: 'Navel to spine, knees close to the chest', es: 'Ombligo a la columna, rodillas al pecho' },
      at: 'ball', pose: { lumbar: 4, thoracic: 6, neck: 12, trunk: -84, hip: 56, knee: 55, _arms: [15, 0, -20] }, line: ['pelvis', 'waist', 'neck'], parts: ['waist', 'chest'] },
  ],
  cues: [{ tr: 'Top gibi yuvarlak', en: 'Round like a ball', es: 'Redonda como una bola' },
    { tr: 'Çene göğse yapışık', en: 'Chin glued to the chest', es: 'Barbilla pegada al pecho' },
    { tr: 'Sırtın üstünde yuvarlan, boynun değil', en: 'Roll on the back, not the neck', es: 'Rueda sobre la espalda, no el cuello' }],
};
}
