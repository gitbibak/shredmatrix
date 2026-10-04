/* Boat Pose (Navasana): seated, knees bent -> half boat (lean back, shins lifted) -> full boat (legs straight, V) -> hold -> down.
 * - One ground contact [pelvis] in every pose (no contact-set blending); `trunk` is the real lean from vertical.
 *   The seated start bisects the knee so the heels rest on the mat.
 * - Thigh elevation = hip - 90 - trunk: full boat trunk -40 / hip 100 puts the legs ~50° up (spec "legs 45°").
 *   Half boat: spec says hip 85 + knee 90 + "shins parallel to the floor", which cannot all hold; the shins-parallel picture
 *   (thighs ~55° up, knees ~60°) is used.
 * - Hands: under the thighs at the start, reaching forward parallel to the floor in the boat; every pose has world hand targets
 *   (lazy fit) so `ik` interpolates. */
{
const MAT = 0.012;
const G = [['pelvis', MAT]];
const BASE = { ground: G, flat: false, abd: 3, handFlat: false, palm: 'in', curl: 0.2, elbowPole: [-0.3, -1, 0.4] };
const RAW = {
  sit: { ...BASE, trunk: -8, hip: 132, knee: 100, ankle: 0, lumbar: 0, thoracic: 0, neck: 2, sh: 30, el: 40 },
  half: { ...BASE, trunk: -35, hip: 110, knee: 62, ankle: -15, lumbar: -2, thoracic: -4, neck: 6, sh: 55, shAbd: 4, el: 2, curl: 0.1 },
  boat: { ...BASE, trunk: -40, hip: 100, knee: 0, ankle: -18, lumbar: -2, thoracic: -4, neck: 8, sh: 50, shAbd: 4, el: 2, curl: 0.1 },
};
const CTX = { anchorX: ['pelvis'], anchorAt: [-0.2, 0] };

function fitBoat(poses, extra) {
  const { V, solve, expand } = FB;
  const S = (p) => solve(expand(Object.assign({}, p, { ik: undefined })), CTX).J;
  // seated start: knee flexion that puts the heels on the mat
  const bis = (p, key, f, lo, hi) => { const up = f(hi) > f(lo);
    for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if ((f(m) > 0) === up) hi = m; else lo = m; } p[key] = +((lo + hi) / 2).toFixed(2); };
  // seated start: foot flat (ankle) and heels on the mat (knee), alternated
  for (let k = 0; k < 4; k++) {
    const p = poses.sit;
    bis(p, 'ankle', (a) => { const J = S({ ...p, ankle: a }); return J.toeR[1] - J.heelR[1]; }, -80, 60);
    bis(p, 'knee', (v) => S({ ...p, knee: v }).heelR[1] - MAT, 60, 140);
  }
  const J0 = S(poses.sit);
  const under = (s) => V.add(V.lerp(J0['hip' + s], J0['knee' + s], 0.62), [0, -0.075, (s === 'R' ? 1 : -1) * 0.035]);
  poses.sit.ik = { handL: { at: under('L') }, handR: { at: under('R') } };
  const fk = (p) => { const J = S(p); p.ik = { handL: { at: J.handL.slice() }, handR: { at: J.handR.slice() } }; };
  fk(poses.half); fk(poses.boat);
  for (const [at, pose] of extra) { const m = Object.assign({}, poses[at], pose); fk(m); pose.ik = m.ik; }
  return poses;
}

window.EXERCISE = {
  id: 'boat_pose',
  name: { tr: 'Kayık Pozu (Navasana)', en: 'Boat Pose (Navasana)', es: 'Postura del barco (Navasana)' },
  category: { tr: 'Yoga · Karın', en: 'Yoga · Core', es: 'Yoga · Core' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['core', 'quads', 'obliques'],
  tempo: '3-8-3',
  hold: true, holdDur: 2,
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 20, pitch: 10, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Kollar yere paralel, göğüs açık', en: 'Arms parallel to the floor, chest open', es: 'Brazos paralelos al suelo, pecho abierto' } },
  contacts: ['pelvis', 'heelR', 'heelL'],
  props: [['mat', { at: [0.05, 0, 0], length: 1.5 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fitBoat(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'sit',
  rep: [
    { to: 'half', dur: 2.5, phase: 0 },
    { to: 'boat', dur: 2.0, phase: 1 },
    { to: 'boat', dur: 1.0, phase: 2 },
    { to: 'sit', dur: 2.5, phase: 3 },
  ],
  setup: { tr: 'Dizler bükülü otur, ayaklar yerde. Elleri uylukların arkasına koy, omurga dik.',
    en: 'Sit with knees bent, feet on the floor. Hands behind the thighs, spine tall.',
    es: 'Sentada, rodillas flexionadas, pies en el suelo. Manos tras los muslos, columna larga.' },
  phases: [
    { name: { tr: 'Yarım kayık', en: 'Half boat', es: 'Medio barco' }, breath: 'out',
      text: { tr: 'Geriye yaslan, kaval kemiklerini yere paralel kaldır. Kollar öne.', en: 'Lean back, lift the shins parallel to the floor. Arms forward.', es: 'Inclínate atrás, sube las espinillas paralelas al suelo. Brazos al frente.' } },
    { name: { tr: 'Bacakları uzat', en: 'Straighten the legs', es: 'Estira las piernas' }, breath: 'in',
      text: { tr: 'Bacakları uzatıp V yap. Göğüs yukarı, sırt uzun.', en: 'Straighten the legs into a V. Chest up, long spine.', es: 'Estira las piernas en V. Pecho arriba, espalda larga.' } },
    { name: { tr: 'Dengede kal', en: 'Balance', es: 'Equilibra' }, breath: 'easy', arc: ['kneeR', 'hipR', 'neck'],
      text: { tr: 'Oturma kemiklerinde dengede kal, 5 nefes.', en: 'Balance on the sit bones for 5 breaths.', es: 'Equilibra sobre los isquiones 5 respiraciones.' } },
    { name: { tr: 'Kontrollü in', en: 'Lower with control', es: 'Baja con control' }, breath: 'out',
      text: { tr: 'Dizleri bük, ayakları yere indir ve dik otur.', en: 'Bend the knees, lower the feet and sit up.', es: 'Flexiona las rodillas, baja los pies y siéntate.' } },
  ],
  tempoText: { tr: '3 sn kalk · 5 nefes kal · 3 sn in', en: '3 s up · stay 5 breaths · 3 s down', es: '3 s arriba · 5 respiraciones · 3 s abajo' },
  mistakes: [
    { title: { tr: 'Sırt yuvarlanıyor', en: 'Rounded back', es: 'Espalda redondeada' },
      text: { tr: 'Göğüs çöker, gövde geriye düşer.', en: 'The chest collapses and the trunk sinks back.', es: 'El pecho se hunde y el tronco cae atrás.' },
      fix: { tr: 'Dizleri bük, sırtı uzat', en: 'Bend the knees, lengthen the spine', es: 'Flexiona las rodillas, alarga la espalda' },
      fixText: { tr: 'Uzun sırt, düz bacaktan önemli', en: 'A long spine matters more than straight legs', es: 'La espalda larga importa más que piernas rectas' },
      at: 'boat', pose: { trunk: -54, hip: 92, lumbar: 24, thoracic: 22, neck: 18, sh: 62 }, line: ['pelvis', 'waist', 'neck'], parts: ['waist', 'chest'] },
    { title: { tr: 'Nefesi tutmak', en: 'Holding the breath', es: 'Contener la respiración' },
      text: { tr: 'Omuzlar kulağa kalkar, boyun gerilir.', en: 'Shoulders rise to the ears, the neck tenses.', es: 'Los hombros suben, el cuello se tensa.' },
      fix: { tr: 'Sakin nefes al', en: 'Breathe steadily', es: 'Respira con calma' },
      fixText: { tr: 'Omuzlar aşağıda, nefes akmaya devam etsin', en: 'Shoulders down; keep the breath flowing', es: 'Hombros abajo; que la respiración fluya' },
      at: 'boat', pose: { shrug: 0.05, neck: -6, curl: 0.9 }, view: { yaw: 30, pitch: 10 }, marks: ['shoulderL', 'shoulderR'], parts: ['upper', 'neck'] },
  ],
  cues: [{ tr: 'Göğsü kaldır', en: 'Lift the chest', es: 'Eleva el pecho' },
    { tr: 'Sırt uzun', en: 'Long spine', es: 'Espalda larga' },
    { tr: 'Ayak parmaklarından uzan', en: 'Reach through the toes', es: 'Alarga hasta los dedos' }],
};
}
