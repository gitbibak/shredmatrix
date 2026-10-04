/* Saw (Pilates mat, seated). Seated base from spine_twist.js / spine_stretch_forward.js: every pose rests on [pelvis, heelR]
 * (legs long on the mat, sit bones anchored, anchorX pelvis), feet flexed, legs wider than the hips (abd 28 each).
 * - Rotation = `twist` (- = chest to the RIGHT); the fold adds the C-curve (lumbar/thoracic/neck 35) and `hip` closes.
 * - In the fold the LEFT hand reaches to the outside of the right ankle, toward the little toe (FK angles fitted lazily to the solved fold
 *   pose, fit() lazily), the right arm reaches long behind (FK, palm turned up). The "sawing" pulses are named in the card
 *   only (card-less pulse keys would leave a gap without a card).
 * - One side per rep (right); the tempo card says to alternate. Rest pose = rotated right with arms in a T (spec phase 1
 *   end), so the rep is the cycle saw -> stack up -> unwind -> rotate, and every move into the fold starts from the
 *   rotation (the arm sweep from the centre T straight into the fold was too fast in the engine's mistake transitions). */
{
const MAT = 0.012;
const G = [['pelvis', MAT], ['heelR', MAT]];
const BASE = { trunk: 0, hip: 90, knee: 0, ankle: 8, flat: false, abd: 28, hrot: 4, ground: G, lumbar: -2, thoracic: 0, neck: 2,
  sh: 16, shAbd: 80, el: 3, palm: 'down', curl: 0.05, twist: 0, headTurn: 0 };
const P = (o) => Object.assign({}, BASE, o);
const RAW = {
  tall: P({}),
  rot: P({ twist: -45, headTurn: -6 }),
  saw: P({ twist: -55, side: -8, protract: 0.05, abd: 24, headTurn: -10, hip: 78, lumbar: 35, thoracic: 35, neck: 35,
    shR: -40, shAbdR: 55, elR: 4, palmR: 'up', curlL: 0.15, shL: 100, shAbdL: 30, elL: 5 }),
};
const CTX = { anchorX: ['pelvis'], anchorAt: [-0.3, 0] };

function fit(poses, extra) {
  const { V, solve, expand } = FB;
  const S = (p) => solve(expand(p), CTX).J;
  // left arm is FK (angles blend along arcs; an IK target would travel on a straight line through the legs)
  const arm = (p, tgt) => {
    const err = (q) => V.len(V.sub(S({ ...p, shL: q[0], shAbdL: q[1], elL: q[2] }).handL, tgt));
    let best = [p.shL ?? 90, p.shAbdL ?? 20, p.elL ?? 5], be = err(best);
    for (const st of [8, 4, 2, 1, 0.5]) { let imp = true; while (imp) { imp = false;
      for (let i = 0; i < 3; i++) for (const d of [-st, st]) { const q = best.slice(); q[i] += d; if (q[2] < 0) continue; const e = err(q); if (e < be - 1e-5) { be = e; best = q; imp = true; } } } }
    Object.assign(p, { shL: +best[0].toFixed(1), shAbdL: +best[1].toFixed(1), elL: +best[2].toFixed(1), _err: be });
  };
  // left hand: outside of the right ankle (toward the little toe; the rig's arm reaches the ankle with a 50° fold)
  const tgt = V.add(S(poses.saw).ankleR, [0.02, 0.03, 0.06]);
  poses.saw._tgt = tgt;
  arm(poses.saw, tgt);
  // IK on top of the fitted FK: the left hand travels on a straight (shortest) line between the poses
  for (const k of ['tall', 'rot', 'saw']) poses[k].ik = { handL: { at: S(poses[k]).handL } };
  for (const [at, pose] of extra) if (pose._reach) { const m = { ...poses[at], ...pose, ik: undefined }; arm(m, V.add(tgt, pose._reach)); Object.assign(pose, { shL: m.shL, shAbdL: m.shAbdL, elL: m.elL }); pose.ik = { handL: { at: S(m).handL } }; }
  return poses;
}

window.EXERCISE = {
  id: 'saw',
  name: { tr: 'Testere (Saw)', en: 'Saw', es: 'La sierra (saw)' },
  category: { tr: 'Pilates · Rotasyon', en: 'Pilates · Rotation', es: 'Pilates · Rotación' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['obliques', 'core', 'hamstrings', 'lowerback'],
  tempo: '1.5-2-2-1.5',
  tempoReps: 1,
  view: { yaw: 40, pitch: 16 },
  alt: { yaw: 90, pitch: 6, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
    text: { tr: 'Önce dön, sonra öne uzan', en: 'Rotate first, then fold forward', es: 'Primero gira, luego dobla' } },
  setupView: { yaw: 10, pitch: 18 },
  setupMarks: [{ type: 'span', joints: ['ankleR', 'ankleL'], label: { tr: 'Kalçadan geniş', en: 'Wider than hips', es: 'Más ancho que la cadera' } }],
  contacts: ['pelvis', 'heelR', 'heelL'],
  props: [['mat', { at: [0.1, 0, 0], length: 1.5, width: 0.8 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fit(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'rot',
  rep: [
    { to: 'saw', dur: 2.2, phase: 0 },
    { to: 'rot', dur: 2.0, phase: 1 },
    { to: 'tall', dur: 1.5, phase: 2 },
    { to: 'rot', dur: 1.5, phase: 3 },
  ],
  setup: { tr: 'Dik otur, bacaklar kalçadan geniş, ayaklar bükülü. Kollar yana açık; gövdeyi sağa döndür.',
    en: 'Sit tall, legs wider than the hips, feet flexed. Arms out to the sides; turn the torso right.',
    es: 'Siéntate erguida, piernas más anchas que la cadera, pies flexionados. Brazos en cruz; gira a la derecha.' },
  phases: [
    { name: { tr: 'Nefes ver, testere', en: 'Exhale, saw', es: 'Exhala, sierra' }, breath: 'out', line: ['pelvis', 'waist', 'neck'],
      text: { tr: 'Sol el sağ serçe parmağa doğru uzanır, sağ kol geriye. Küçük vuruşlarla testere.', en: 'Left hand reaches toward the right little toe, right arm back. Saw with small pulses.', es: 'La mano izquierda va al meñique derecho, el brazo derecho atrás. Pulsos pequeños.' } },
    { name: { tr: 'Nefes al, omur omur doğrul', en: 'Inhale, stack up', es: 'Inhala, sube vértebra a vértebra' }, breath: 'in',
      text: { tr: 'Dönüşü koruyarak omurgayı yukarı diz.', en: 'Stay rotated and stack the spine up.', es: 'Mantén el giro y apila la columna.' } },
    { name: { tr: 'Nefes ver, ortaya', en: 'Exhale, unwind', es: 'Exhala, al centro' }, breath: 'out',
      text: { tr: 'Dik kalarak ortaya dön.', en: 'Unwind to centre, sitting tall.', es: 'Vuelve al centro, erguida.' } },
    { name: { tr: 'Nefes al, yeniden dön', en: 'Inhale, rotate again', es: 'Inhala, gira de nuevo' }, breath: 'in', line: ['shoulderL', 'shoulderR'],
      text: { tr: 'Gövde döner; omuzlar aynı seviyede, kalça yerinde. Sırayla iki yana.', en: 'The torso turns; shoulders level, hips still. Alternate sides.', es: 'El tronco gira; hombros nivelados, cadera quieta. Alterna lados.' } },
  ],
  tempoText: { tr: 'Taraf değiştirerek 3-5 kez · burada sağ taraf', en: 'Alternate sides, 3-5 each · right side shown', es: 'Alterna lados, 3-5 cada uno · aquí el derecho' },
  mistakes: [
    { title: { tr: 'Kalça kalkıp kayıyor', en: 'Hips lift and shift', es: 'La cadera se levanta y se desplaza' },
      fix: { tr: 'İki oturma kemiği yerde', en: 'Both sit bones down', es: 'Ambos isquiones abajo' },
      fixText: { tr: 'Pelvis kare kalır; gerekirse havlunun üstüne otur', en: 'Pelvis stays square; sit on a towel if needed', es: 'Pelvis cuadrada; usa una toalla si hace falta' },
      at: 'rot', pose: { roll: -9, yaw: -12, twist: -36, ground: [['pelvis', MAT + 0.014], ['heelR', MAT]] }, view: { yaw: 0, pitch: 14 }, line: ['hipL', 'hipR'], marks: ['hipL'], parts: ['pelvis'] },
    { title: { tr: 'Katlanınca dönüş kayboluyor', en: 'Rotation lost in the fold', es: 'Se pierde el giro al doblar' },
      fix: { tr: 'Önce dön, sonra katlan', en: 'Rotate first, then fold', es: 'Primero gira, luego dobla' },
      fixText: { tr: 'Göğüs sağ bacağa döner, sol el serçe parmağın ötesine', en: 'Chest turns to the right leg, left hand past the little toe', es: 'El pecho gira a la pierna derecha, mano más allá del meñique' },
      at: 'saw', pose: { twist: -8, headTurn: 0, _reach: [-0.02, 0.06, -0.42] }, view: { yaw: 10, pitch: 18 }, line: ['shoulderL', 'shoulderR'], parts: ['chest', 'waist'] },
  ],
  cues: [{ tr: 'Omurgayı havlu gibi sık', en: 'Wring out the spine like a towel', es: 'Escurre la columna como una toalla' },
    { tr: 'İki oturma kemiği yerde', en: 'Anchor both sit bones', es: 'Ancla ambos isquiones' },
    { tr: 'Serçe parmağın ötesine uzan', en: 'Reach beyond the little toe', es: 'Alarga más allá del meñique' }],
};
}
