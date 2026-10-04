/* Mermaid Stretch (Pilates mat, seated side-sit). Sitting on the LEFT hip with both shins folded to the right (Z-sit):
 * front (left) shin across the front of the mat, back (right) shin behind to the right. The leg angles were fitted once
 * (coordinate search) so both knees, ankles and toes rest on the mat with the pelvis on the mat (ground [pelvis]).
 * - Support hand: LEFT hand flat on the mat beside the left hip, a fixed world IK target in every pose, so it stays planted
 *   while the elbow bends (~80°) as the trunk bends over it.
 * - Side reach: the right arm sweeps overhead in line with the ear and the spine bends toward the support hand (`side` +,
 *   toward the character's LEFT), a long C stretching the right side. NOTE: the spec text says "away from the support
 *   hand" but keeps the support hand on the mat with the elbow bending to 80°, which is only possible when bending toward
 *   it (classical second half of the Mermaid); the toward-the-hand version is animated.
 * - Rotate: chest turns toward the floor (twist + = chest to the left) and folds forward ~30° by spine flexion (the
 *   pelvis cannot tip forward without lifting the folded legs off the mat), top arm reaching long.
 * - Rest pose = sitting tall with the right arm in a long diagonal overhead (spec start description); the arm stays up
 *   through the rep, so the return is one smooth arc (lowering the arm every rep made the mistake returns too fast).
 * - Front view (spec) shows the lateral arc; alt = side view for the rotation. */
{
const MAT = 0.012;
const LEGS = { hipL: 83, abdL: 17, hrotL: 89, kneeL: 115, ankleL: -30, hipR: 78, abdR: 49, hrotR: -76.5, kneeR: 125, ankleR: -30 };
const HANDL = { ik: { handL: { at: [0.03, 0.03, -0.43] } }, curlL: 0.1 };
const BASE = { trunk: 0, ground: [['pelvis', MAT]], flat: false, ...LEGS, ...HANDL, lumbar: 0, thoracic: 0, neck: 0,
  side: 6, twist: 0, shR: 12, shAbdR: 160, elR: 8, palmR: 'in', curlR: 0.15, headTurn: 0 };
const P = (o) => Object.assign({}, BASE, o);
const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };
const RAW = {
  sit: P({}),
  reach: P({ side: 40, lumbar: 4, thoracic: 4, neck: 6, shR: 10, shAbdR: 172, elR: 6 }),
  rot: P({ side: 26, twist: 38, lumbar: 22, thoracic: 22, neck: 12, shR: 40, shAbdR: 165, elR: 4, palmR: 'down', curlR: 0.15 }),
};
// rot: the top arm reaches long past the head, toward the floor on the support side (FK angles fitted lazily)
function fit(poses) {
  const { V, solve, expand } = FB;
  const S = (p) => solve(expand(p), CTX).J;
  const p = poses.rot, J = S(p);
  const dir = V.norm(V.add(V.norm(V.sub(J.head, J.neck)), [0.05, -0.1, -0.3]));
  const tgt = V.add(J.shoulderR, V.scale ? V.scale(dir, 0.56) : dir.map((v) => v * 0.56));
  const err = (q) => V.len(V.sub(S({ ...p, shR: q[0], shAbdR: q[1], elR: q[2] }).handR, tgt));
  let best = [p.shR, p.shAbdR, p.elR], be = err(best);
  for (const st of [8, 4, 2, 1, 0.5]) { let imp = true; while (imp) { imp = false;
    for (let i = 0; i < 3; i++) for (const d of [-st, st]) { const q = best.slice(); q[i] += d; if (q[2] < 0 || q[2] > 12) continue; const e = err(q); if (e < be - 1e-5) { be = e; best = q; imp = true; } } } }
  Object.assign(p, { shR: +best[0].toFixed(1), shAbdR: +best[1].toFixed(1), elR: +best[2].toFixed(1), _err: be });
  return poses;
}

window.EXERCISE = {
  id: 'mermaid_stretch',
  name: { tr: 'Deniz Kızı Esnetmesi (Mermaid)', en: 'Mermaid Stretch', es: 'Estiramiento de sirena (mermaid)' },
  category: { tr: 'Pilates · Esneme', en: 'Pilates · Stretch', es: 'Pilates · Estiramiento' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['obliques', 'lats', 'core'],
  side: 'R',
  tempo: '3-2-3',
  tempoReps: 1,
  view: { yaw: 0, pitch: 8 },
  alt: { yaw: 70, pitch: 12, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
    text: { tr: 'Göğüs yere döner, iki oturma kemiği yerde', en: 'Chest turns to the floor, both sit bones down', es: 'El pecho gira al suelo, isquiones abajo' } },
  setupView: { yaw: 40, pitch: 22 },
  contacts: ['pelvis', 'kneeL', 'kneeR', 'handL'],
  props: [['mat', { at: [0.05, 0, 0.0], length: 1.3, width: 1.25 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fit(RAW)); },
  rest: 'sit',
  rep: [
    { to: 'reach', dur: 3.0, phase: 0 },
    { to: 'rot', dur: 2.0, phase: 1 },
    { to: 'sit', dur: 3.0, phase: 2 },
  ],
  setup: { tr: 'Sol kalçana otur, iki bacak sağa katlı. Sol el kalçanın yanında minderde, sağ kol yukarıda. Sonra taraf değiştir.',
    en: 'Sit on your left hip, both legs folded to the right. Left hand on the mat by the hip, right arm up. Then switch sides.',
    es: 'Siéntate sobre la cadera izquierda, piernas dobladas a la derecha. Mano izquierda en la esterilla, brazo derecho arriba. Luego cambia.' },
  phases: [
    { name: { tr: 'Uzan ve yana eğil', en: 'Reach and side-bend', es: 'Alarga y flexiona al lado' }, breath: 'out', line: ['hipR', 'waist', 'neck'],
      text: { tr: 'Uzan, sonra uzun bir C ile sola eğil. Kol kulağın yanında, sol dirsek bükülür.', en: 'Inhale to lengthen; exhale and bend left in a long C. Arm by the ear, left elbow bends.', es: 'Alarga y flexiona a la izquierda en una C larga. Brazo junto a la oreja.' } },
    { name: { tr: 'Göğsü yere döndür', en: 'Turn the chest down', es: 'Gira el pecho al suelo' }, breath: 'out',
      text: { tr: 'Göğüs yere döner, kol uzağa uzanır. Oturma kemikleri yerde.', en: 'The chest turns toward the floor, the arm reaches long. Sit bones down.', es: 'El pecho gira al suelo, el brazo se alarga. Isquiones abajo.' } },
    { name: { tr: 'Nefes al, dik otur', en: 'Inhale, sit tall', es: 'Inhala, siéntate erguida' }, breath: 'in',
      text: { tr: 'Geri dön, yanını uzat ve dik otur. Kol yukarıda kalır.', en: 'Unwind, lengthen the side and sit tall. The arm stays up.', es: 'Vuelve, alarga el costado y siéntate erguida. El brazo sigue arriba.' } },
  ],
  tempoText: { tr: '3 sn yana · 2 sn dön · 3 sn dik otur', en: '3 s side bend · 2 s rotate · 3 s sit tall', es: '3 s lateral · 2 s giro · 3 s erguida' },
  mistakes: [
    { title: { tr: 'Oturma kemiği kalkıyor', en: 'Sit bone lifts', es: 'Se levanta un isquion' },
      fix: { tr: 'Kalçayı yere ağır bırak', en: 'Keep the hips heavy', es: 'Cadera pesada en el suelo' },
      fixText: { tr: 'Gerekirse havlunun üstüne otur ya da bacakları kaydır', en: 'Sit on a towel or shift the legs if needed', es: 'Siéntate en una toalla o ajusta las piernas' },
      at: 'reach', pose: { roll: 9, side: 36, ground: [['pelvis', MAT + 0.03]] }, line: ['hipL', 'hipR'], marks: ['hipR'], parts: ['pelvis'] },
    { title: { tr: 'Öne çöküyor', en: 'Collapsing forward', es: 'Se hunde hacia delante' },
      fix: { tr: 'Önce omurgayı uzat', en: 'Lengthen the spine first', es: 'Alarga la columna primero' },
      fixText: { tr: 'Göğüs açık, kol kulağın yanında; yana uzun bir kavis', en: 'Chest open, arm by the ear; one long arc to the side', es: 'Pecho abierto, brazo junto a la oreja; un arco largo' },
      at: 'reach', pose: { thoracic: 30, lumbar: 22, neck: 24, protract: 0.04, shR: 40, shAbdR: 140 }, view: { yaw: 60, pitch: 10 }, line: ['pelvis', 'waist', 'neck'], parts: ['chest', 'waist'] },
  ],
  cues: [{ tr: 'Uzun bir kavis, destek kola çökme', en: 'Long arc, no collapse into the support arm', es: 'Arco largo, sin hundirte en el brazo' },
    { tr: 'İki oturma kemiği yerde', en: 'Keep both sit bones down', es: 'Ambos isquiones abajo' },
    { tr: 'Esneyen kaburgalara nefes al', en: 'Breathe into the stretched side ribs', es: 'Respira hacia las costillas estiradas' }],
};
}
