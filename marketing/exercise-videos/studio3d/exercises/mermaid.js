/* Reformer Mermaid. Sitting sideways on the carriage (body yaw -90: she faces +z, her LEFT side toward the footbar), on the
 * left hip with both shins folded to the right (Z-sit legs from mermaid_stretch.js, knees/shins resting on the pad).
 * - Left (inside) hand on the footbar: fixed world IK target on top of the bar in every pose (flat, weight-bearing hand).
 * - Side bend: the spine bends ~50° toward the footbar (`side` +, toward her left) and the right arm reaches overhead
 *   (abduction ~175°); the bar arm stays long, so the trunk pushes the carriage AWAY from the footbar (~25 cm).
 * - The pelvis sits on the pad (ground pelvis) and is moved along the rail per pose (body-frame pos z = world -x), fitted
 *   so the bar arm keeps a soft elbow (~10°). The carriage centre = pelvis x - 0.15 in EVERY frame, so she rides the carriage.
 * - Footbar: spec says "down"; with the bar down the hand cannot reach it while sitting tall, so the default (high) footbar
 *   is used, as most studios do for Mermaid.
 * - Front view (spec) shows the lateral arc; alt = angle view. */
{
const TOP = 0.38, BAR = [1.0, TOP + 0.36 + 0.022];
const LEGS = { hipL: 83, abdL: 17, hrotL: 89, kneeL: 115, ankleL: -30, hipR: 78, abdR: 49, hrotR: -76.5, kneeR: 125, ankleR: -30 };
const CTX = { anchorX: ['pelvis'], anchorAt: [0.3, -0.11] };
const EL = 12;
const HAND = [BAR[0] - 0.005, BAR[1] + 0.035, 0];
const BASE = { yaw: -90, trunk: 0, ground: [['pelvis', TOP]], flat: false, ...LEGS, lumbar: 0, thoracic: 0, neck: 0, side: 0, twist: 0,
  shR: 10, shAbdR: 168, elR: 6, palmR: 'in', curlR: 0.15, curlL: 0.75, handFlatL: false, palmL: 'down', elbowPoleL: [-1, -0.5, 0], pos: [0, 0, 0] };
const P = (o) => Object.assign({}, BASE, o);
const RAW = {
  tall: P({}),
  bend: P({ side: 50, lumbar: 3, thoracic: 3, neck: 4, shR: 12, shAbdR: 176, elR: 4 }),
};
// slide the body along the rail so the bar arm is 0.565 m from shoulder to palm (soft elbow), then pin the left hand
function fit(poses, extra) {
  const { V, solve, expand } = FB;
  const go = (p) => {
    const sol = (d) => { const J0 = solve(expand(Object.assign({}, p, { pos: [0, 0, d], ik: undefined })), CTX).J;
      const ik = { handL: { at: [HAND[0], HAND[1], J0.shoulderL[2]] } };
      return { ik, J: solve(expand(Object.assign({}, p, { pos: [0, 0, d], ik })), CTX).J }; };
    const elb = (J) => { const a = V.norm(V.sub(J.shoulderL, J.elbowL)), b = V.norm(V.sub(J.wristL, J.elbowL)); return 180 - Math.acos(Math.max(-1, Math.min(1, V.dot(a, b)))) * 180 / Math.PI; };
    let lo = -0.6, hi = 0.6;   // larger d = further from the bar = straighter elbow
    for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (elb(sol(m).J) > EL) lo = m; else hi = m; }
    const d = (lo + hi) / 2;
    p.pos = [0, 0, +d.toFixed(4)]; p.ik = sol(d).ik;
  };
  for (const k in poses) go(poses[k]);
  for (const [at, pose] of extra) { const m = Object.assign({}, poses[at], pose); go(m); pose.pos = m.pos; pose.ik = m.ik; }
  return poses;
}

window.EXERCISE = {
  id: 'mermaid',
  name: { tr: 'Mermaid (Deniz Kızı)', en: 'Mermaid', es: 'Sirena' },
  category: { tr: 'Reformer · Esneme', en: 'Reformer · Stretch', es: 'Reformer · Estiramiento' },
  equipmentLabel: { tr: 'Reformer · 1 kırmızı yay', en: 'Reformer · 1 red spring', es: 'Reformer · 1 muelle rojo' },
  muscles: ['obliques', 'lats', 'delts'],
  side: 'R',
  tempo: '2.5-1-2.5',
  view: { yaw: 90, pitch: 8, zoom: 1.05 },
  alt: { yaw: 40, pitch: 14, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Kalçalar kızakta, kol kulağın yanında uzanır', en: 'Hips stay down, the arm reaches by the ear', es: 'Cadera abajo, el brazo junto a la oreja' } },
  setupView: { yaw: 50, pitch: 20 },
  props: [['reformer', { springs: 1, carriage: (sol) => sol.J.pelvis[0] - 0.16 }]],
  ctx: CTX,
  contacts: ['pelvis', 'kneeL', 'kneeR', 'handL'],
  get poses() { return this._poses || (this._poses = fit(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'tall',
  rep: [
    { to: 'bend', dur: 2.5, phase: 0 },
    { to: 'bend', dur: 1.0, phase: 1 },
    { to: 'tall', dur: 2.5, phase: 2 },
  ],
  setup: { tr: 'Kızağa yan otur, bacaklar sağa katlı. Sol el footbar\'da, sağ kol yukarıda. Sonra taraf değiştir.',
    en: 'Sit sideways on the carriage, legs folded to the right. Left hand on the footbar, right arm up. Then switch sides.',
    es: 'Sentada de lado en el carro, piernas dobladas a la derecha. Mano izquierda en la barra, brazo derecho arriba. Luego cambia.' },
  phases: [
    { name: { tr: 'Uzan ve yana eğil', en: 'Reach and bend', es: 'Alarga y flexiona' }, breath: 'out',
      text: { tr: 'Önce uza, sonra bara doğru eğil. Kol başın üstünden uzanır, kızak açılır.', en: 'Grow tall, then bend toward the bar. The arm reaches overhead, the carriage opens.', es: 'Crece y flexiona hacia la barra. El brazo pasa sobre la cabeza, el carro se abre.' } },
    { name: { tr: 'Esnemede kal', en: 'Hold the stretch', es: 'Mantén' }, breath: 'hold', line: ['hipR', 'waist', 'neck'],
      text: { tr: 'Uzun bir C. Sağ yan uzar, iki kalça da kızakta.', en: 'One long C. The right side lengthens, both hips stay down.', es: 'Una C larga. El costado derecho se alarga, caderas abajo.' } },
    { name: { tr: 'Dik otur', en: 'Sit tall', es: 'Siéntate erguida' }, breath: 'in',
      text: { tr: 'Karından dikleşerek ortaya dön; kızak sessizce kapansın.', en: 'Lift back to centre from the waist; let the carriage close quietly.', es: 'Vuelve al centro desde la cintura; el carro se cierra sin golpe.' } },
  ],
  tempoText: { tr: '2,5 sn eğil · 1 sn dur · 2,5 sn dön', en: '2.5 s bend · 1 s hold · 2.5 s return', es: '2,5 s flexiona · 1 s pausa · 2,5 s vuelve' },
  mistakes: [
    { title: { tr: 'Kalça kalkıyor', en: 'Hip lifts', es: 'La cadera se levanta' },
      fix: { tr: 'Oturmaya devam et', en: 'Stay seated', es: 'Sigue sentada' },
      fixText: { tr: 'İki oturma kemiği kızakta ağır kalır', en: 'Both sit bones stay heavy on the pad', es: 'Ambos isquiones pesados en el carro' },
      at: 'bend', pose: { roll: 10, side: 42, ground: [['pelvis', TOP + 0.035]] }, line: ['hipL', 'hipR'], marks: ['hipR'], parts: ['pelvis'] },
    { title: { tr: 'Öne çöküyor', en: 'Collapsing forward', es: 'Se hunde hacia delante' },
      fix: { tr: 'Önce uza, sonra eğil', en: 'Lengthen, then bend', es: 'Alarga y luego flexiona' },
      fixText: { tr: 'Göğüs açık, kol kulağın yanında', en: 'Chest open, arm by the ear', es: 'Pecho abierto, brazo junto a la oreja' },
      at: 'bend', pose: { thoracic: 26, lumbar: 18, neck: 20, protractR: 0.04, shR: 40, shAbdR: 140, side: 40 }, view: { yaw: 30, pitch: 10 },
      line: ['pelvis', 'waist', 'neck'], parts: ['chest', 'waist'] },
  ],
  cues: [{ tr: 'Önce uza, sonra eğil', en: 'Reach long, then bend', es: 'Alarga y luego flexiona' },
    { tr: 'Kalçalar kızakta sabit', en: 'Hips anchored', es: 'Cadera fija' },
    { tr: 'Bar kolu uzun, omuz aşağıda', en: 'Bar arm long, shoulder down', es: 'Brazo de la barra largo, hombro abajo' }],
};
}
