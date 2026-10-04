/* Foam Roller Upper Back (supine thoracic roll). Side view. Roller (15 cm) across the mat under the mid-back, knees bent ~95,
 * feet flat and planted, hips lifted a little (small bridge), hands behind the head with the elbows wide, chin slightly nodded.
 * Roll: the knees bend a little more and the body travels ~10 cm toward the feet, so the roller ends under the shoulder blades,
 * with a gentle extension over it; then back.
 * - Feet: ctx.plant ankles + anchor (they never slide). Ground contacts [chest, heelR] in every pose; the chest-contact height
 *   is bisected (fit) so the lowest point of the back surface rests exactly on the roller top.
 * - Back surface = joint centres offset along the segment's -x (rig clearances: pelvis/waist 10 cm, chest 11, neck 7); the
 *   roller (_rollerUB) sits under the lowest point of that polyline every frame, so it rolls along the mat with the body.
 * - Hands: body-relative targets behind the head (holdL/holdR), elbows wide (pole outward).
 * Spec: start thoracic ext 5 / neck flex 15 / knee 95 / hip 10; roll-up thoracic ext 20, roller 10 cm toward the head. */
{
const MAT = 0.012, RR = 0.075, TOP = MAT + 2 * RR;
const CTX = { anchorX: ['ankleL', 'ankleR'], anchorAt: [0.35, 0] };
const HANDS = { holdL: [-0.06, 0.36, 0.07], holdR: [-0.06, 0.36, 0.07], elbowPole: [0.2, 0.3, 1], palm: 'forward', curl: 0.5, noAvoid: true };
const BASE = { trunk: -78, flat: true, abd: 4, ...HANDS };
const RAW = {
  low: { ...BASE, hip: 12, knee: 95, thoracic: -5, lumbar: 0, neck: 15, ground: [['chest', 0.27], ['heelR', MAT]] },
  high: { ...BASE, hip: 22, knee: 112, thoracic: -20, lumbar: 0, neck: 15, ground: [['chest', 0.27], ['heelR', MAT]] },
};
const backPts = (s) => {
  const { V, M } = FB, J = s.J, F = s.F;
  return [V.add(J.pelvis, M.apply(F.pelvis, [-0.1, 0, 0])), V.add(J.waist, M.apply(F.lumbar, [-0.1, 0, 0])),
    V.add(J.chest, M.apply(F.thorax, [-0.11, 0, 0])), V.add(J.neck, M.apply(F.thorax, [-0.07, 0, 0]))];
};
// lowest point of the back polyline between the pelvis and the neck (sampled)
const lowest = (s) => { const P = backPts(s); let best = null; for (let i = 0; i < 3; i++) for (let k = 0; k <= 10; k++) { const q = FB.V.lerp(P[i], P[i + 1], k / 10); if (!best || q[1] < best[1]) best = q; } return best; };
FB.PROPS._rollerUB = (sol) => { const L = lowest(sol); return FB.PROPS.foamRoller(sol, { at: [L[0], MAT + RR, 0], length: 0.9 }); };

function fit(poses, mistakes) {
  const { solve, expand } = FB;
  const S = (p) => solve(expand(Object.assign({}, p, { ik: undefined, holdL: undefined, holdR: undefined })), CTX);
  const bis = (f, lo, hi) => { let flo = f(lo); for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2, fm = f(m); if ((fm > 0) === (flo > 0)) { lo = m; flo = fm; } else hi = m; } return +((lo + hi) / 2).toFixed(4); };
  const seat = (p) => { const h = bis((y) => lowest(S(Object.assign({}, p, { ground: [['chest', y], ['heelR', MAT]] })))[1] - TOP, 0.05, 0.6); p.ground = [['chest', h], ['heelR', MAT]]; };
  for (const k in poses) seat(poses[k]);
  for (const m of mistakes) { const q = Object.assign({}, poses[m.at], m.pose); seat(q); m.pose.ground = q.ground; }
  return poses;
}

window.EXERCISE = {
  id: 'foam_roller_upper_back',
  name: { tr: 'Foam Roller ile Sırt', en: 'Foam Roller Upper Back', es: 'Rodillo en la espalda alta' },
  category: { tr: 'Pilates · Mobilite', en: 'Pilates · Mobility', es: 'Pilates · Movilidad' },
  equipmentLabel: { tr: 'Foam roller · Mat', en: 'Foam roller · Mat', es: 'Rodillo de espuma · Esterilla' },
  muscles: ['upperback', 'core', 'glutes'],
  tempo: '3-3',
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 30, pitch: 20, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Dirsekler açık, eller başı destekler', en: 'Elbows wide, hands support the head', es: 'Codos abiertos, manos sostienen la cabeza' } },
  setupView: { yaw: 40, pitch: 16 },
  contacts: ['chest', 'heelR', 'ballR', 'heelL', 'ballL'],
  props: [['mat', { at: [0, 0, 0], length: 1.8, width: 0.75 }], ['_rollerUB']],
  ctx: Object.assign({ plant: ['ankleL', 'ankleR'] }, CTX),
  get poses() { return this._poses || (this._poses = fit(RAW, this.mistakes)); },
  rest: 'low',
  rep: [
    { to: 'high', dur: 3.0, phase: 0 },
    { to: 'low', dur: 3.0, phase: 1 },
  ],
  setup: { tr: 'Roller kürek kemiklerinin altında, enine. Dizler bükülü, ayaklar yerde, kalça hafif yukarıda. Eller başın arkasında.',
    en: 'Roller across the mid-back, below the shoulder blades. Knees bent, feet down, hips slightly up. Hands behind the head.',
    es: 'Rodillo bajo los omóplatos. Rodillas flexionadas, pies apoyados, cadera algo elevada. Manos tras la cabeza.' },
  phases: [
    { name: { tr: 'Yukarı yuvarla', en: 'Roll up', es: 'Rueda hacia arriba' }, breath: 'out', slow: 1.2,
      text: { tr: 'Nefes ver, ayaklarla kontrol et. Roller kürek kemiklerine gelir, göğsü üstünde hafifçe aç.', en: 'Exhale, guide with the feet until the roller reaches the shoulder blades. Open the chest.', es: 'Exhala, controla con los pies. El rodillo llega a los omóplatos; abre el pecho.' } },
    { name: { tr: 'Aşağı yuvarla', en: 'Roll down', es: 'Rueda hacia abajo' }, breath: 'in', slow: 1.2,
      text: { tr: 'Nefes al, orta sırta geri dön. Bele inme, karın aktif.', en: 'Inhale, roll back to the mid-back. Stay off the low back, abs on.', es: 'Inhala, vuelve a la espalda media. Sin llegar a la lumbar, abdomen activo.' } },
  ],
  tempoText: { tr: '3 sn yukarı · 3 sn aşağı', en: '3 s up · 3 s down', es: '3 s arriba · 3 s abajo' },
  mistakes: [
    { title: { tr: 'Bele kadar yuvarlanmak', en: 'Rolling into the low back', es: 'Rodar hasta la lumbar' },
      text: { tr: 'Roller bele iner, bel çukuru ezilir.', en: 'The roller drops to the low back and the lumbar arch takes the load.', es: 'El rodillo baja a la lumbar y la carga.' },
      fix: { tr: 'Sutyen çizgisinin üstünde kal', en: 'Stay above the bra line', es: 'Quédate sobre la línea del sujetador' },
      fixText: { tr: 'Sadece sırtın üst-orta kısmı, karın aktif', en: 'Upper and mid-back only, abs braced', es: 'Solo espalda alta y media, abdomen activo' },
      at: 'low', pose: { hip: -8, knee: 70, lumbar: -12, thoracic: 0 }, marks: ['waist'], parts: ['waist', 'pelvis'] },
    { title: { tr: 'Baş geriye düşüyor', en: 'Head dumps back', es: 'La cabeza cae atrás' },
      text: { tr: 'Çene havaya kalkar, boyun zorlanır.', en: 'The chin pokes up and the neck strains.', es: 'La barbilla sube y el cuello sufre.' },
      fix: { tr: 'Çene hafif içeride, eller başı taşır', en: 'Chin slightly in, hands carry the head', es: 'Barbilla adentro, las manos sostienen la cabeza' },
      fixText: { tr: 'Boyun uzun, bakış dizlere', en: 'Long neck, gaze toward the knees', es: 'Cuello largo, mirada a las rodillas' },
      at: 'high', pose: { neck: -28 }, marks: ['head'], parts: ['neck'] },
  ],
  cues: [{ tr: 'Eller boynu destekler', en: 'Hands support the neck', es: 'Las manos sostienen el cuello' },
    { tr: 'Karın aktif, kaburgalar içeride', en: 'Abs engaged, ribs knit', es: 'Abdomen activo, costillas cerradas' },
    { tr: 'Sadece sırtın üst kısmı', en: 'Roll only the upper back', es: 'Solo la espalda alta' }],
};
}
