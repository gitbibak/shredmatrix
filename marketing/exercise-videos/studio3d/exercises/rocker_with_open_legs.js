/* Open Leg Rocker (Pilates mat). Built on rolling_like_a_ball.js (approved): the body shape is (almost) constant and only
 * `trunk` rocks it from the tailbone balance (~25° behind vertical) to the shoulder blades (~100°).
 * - V shape: legs straight, about shoulder width apart (abd), hands hold the lower shins (spec: ankles or lower shins; the rig's arms reach the shins with straight elbows), C-curve (lumbar 35,
 *   thoracic 30, neck 40). On the roll back the curve deepens a little (spec 40/35/45) and the hip closes to ~120.
 * - Contacts: no explicit ground (the lowest point rests on the mat and travels along the spine); the mid key is lifted
 *   with `pos` so the low back (not an engine contact point) stays out of the mat. anchorX = waist.
 * - Arms are FK, fitted lazily per pose so the hands stay on the shins (shape changes slightly between poses).
 * - The rolling-onto-the-neck mistake is shown from the mid-roll key (fix = head lifted, rolling on the back): from the
 *   back key the engine's return to the balance took <1 s and the long legs moved too fast. */
{
const BASE = { lumbar: 35, thoracic: 30, neck: 40, hip: 60, knee: 0, ankle: -30, abd: 8, hrot: 6, flat: false,
  palm: 'in', curl: 0.75, protract: 0.06, sh: 60, shAbd: 10, el: 10, bendR: [1, 0.3, -0.6], bendL: [1, 0.3, 0.6] };
const RAW = {
  v: { ...BASE, trunk: -88 },
  mid: { ...BASE, lumbar: 38, thoracic: 32, neck: 42, hip: 62, trunk: -140, pos: [0, 0.03, 0] },
  back: { ...BASE, lumbar: 40, thoracic: 35, neck: 45, hip: 64, trunk: -164 },
};
const CTX = { anchorX: ['waist'], anchorAt: [0, 0] };

function fit(poses, extra) {
  const { V, solve, expand } = FB;
  const S = (p) => solve(expand(p), CTX).J;
  const arms = (p) => {
    const J0 = S(p);
    const tgt = (s) => V.add(V.lerp(J0['ankle' + s], J0['knee' + s], 0.36), [0, 0.035, (s === 'R' ? 1 : -1) * 0.035]);
    const err = (q) => { const J = S({ ...p, sh: q[0], shAbd: q[1], el: q[2] }); return V.len(V.sub(J.handR, tgt('R'))) + V.len(V.sub(J.handL, tgt('L'))); };
    let best = [p.sh, p.shAbd, p.el], be = err(best);
    for (const st of [8, 4, 2, 1, 0.5]) { let imp = true; while (imp) { imp = false;
      for (let i = 0; i < 3; i++) for (const d of [-st, st]) { const q = best.slice(); q[i] += d; if (q[2] < 0) continue; const e = err(q); if (e < be - 1e-5) { be = e; best = q; imp = true; } } } }
    Object.assign(p, { sh: +best[0].toFixed(1), shAbd: +best[1].toFixed(1), el: +best[2].toFixed(1), _err: be });
  };
  for (const k in poses) arms(poses[k]);
  // mistake poses that move the legs get their own arm fit (hands stay on the legs)
  for (const [at, pose] of extra) if (pose._fit) { const m = { ...poses[at], ...pose }; arms(m); Object.assign(pose, { sh: m.sh, shAbd: m.shAbd, el: m.el }); }
  return poses;
}

window.EXERCISE = {
  id: 'rocker_with_open_legs',
  name: { tr: 'Açık Bacak Sallanma (Open Leg Rocker)', en: 'Open Leg Rocker', es: 'Balancín con piernas abiertas' },
  category: { tr: 'Pilates · Karın', en: 'Pilates · Core', es: 'Pilates · Core' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['core', 'hamstrings'],
  tempo: '1.5-1.5',
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 40, pitch: 16, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Bacaklar açık ve düz, V hiç bozulmaz', en: 'Legs open and straight, the V never changes', es: 'Piernas abiertas y rectas, la V no cambia' } },
  setupView: { yaw: 35, pitch: 14 },
  setupMarks: [{ type: 'span', joints: ['ankleR', 'ankleL'], label: { tr: 'omuz genişliği', en: 'shoulder width', es: 'ancho de hombros' } }],
  contacts: ['pelvis'],
  props: [['mat', { at: [0, 0, 0], length: 1.8 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fit(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'v',
  rep: [
    { to: 'mid', dur: 0.75, phase: 0, ease: 'in' },
    { to: 'back', dur: 0.75, card: false, ease: 'out' },
    { to: 'mid', dur: 0.75, phase: 1, ease: 'in' },
    { to: 'v', dur: 0.75, card: false, ease: 'out' },
  ],
  setup: { tr: 'Kuyruk sokumunda dengede kal. Bacaklar düz, omuz genişliğinde V; eller kaval kemiklerinin alt ucunda.',
    en: 'Balance on the tailbone. Legs straight in a shoulder-width V; hands on the lower shins.',
    es: 'Equilibrio sobre el coxis. Piernas rectas en V al ancho de hombros; manos en las espinillas bajas.' },
  phases: [
    { name: { tr: 'Nefes al, geriye yuvarlan', en: 'Inhale, roll back', es: 'Inhala, rueda atrás' }, breath: 'in', line: ['pelvis', 'waist', 'neck'],
      text: { tr: 'C-kıvrımını derinleştir, kürek kemiklerine kadar yuvarlan. Bacaklar düz.', en: 'Deepen the C-curve and roll to the shoulder blades. Legs straight.', es: 'Profundiza la C y rueda hasta las escápulas. Piernas rectas.' } },
    { name: { tr: 'Nefes ver, V dengesine gel', en: 'Exhale, back to the V', es: 'Exhala, vuelve a la V' }, breath: 'out',
      text: { tr: 'Karınla yukarı yuvarlan; ayaklar yere değmeden dengede dur.', en: 'Roll up with the abs; balance without the feet touching down.', es: 'Sube con el abdomen; equilibrio sin apoyar los pies.' } },
  ],
  tempoText: { tr: '1,5 sn geri · 1,5 sn ileri', en: '1.5 s back · 1.5 s up', es: '1,5 s atrás · 1,5 s arriba' },
  mistakes: [
    { title: { tr: 'Dizler bükülüyor', en: 'Knees bend', es: 'Las rodillas se doblan' },
      fix: { tr: 'Bacaklar uzun ve düz', en: 'Legs long and straight', es: 'Piernas largas y rectas' },
      fixText: { tr: 'Zorlanırsan elleri dizlere yakın tut, V korunur', en: 'If it is hard, hold closer to the knees; keep the V', es: 'Si cuesta, sujeta más cerca de las rodillas; mantén la V' },
      at: 'mid', pose: { knee: 55, hip: 80, _fit: 1 }, marks: ['kneeR'], parts: ['thigh', 'shin'] },
    { title: { tr: 'Boyna kadar yuvarlanmak', en: 'Rolling onto the neck', es: 'Rodar sobre el cuello' },
      fix: { tr: 'Kürek kemiklerinde dur', en: 'Stop at the shoulder blades', es: 'Para en las escápulas' },
      fixText: { tr: 'Baş minderden uzak, çene göğse yakın', en: 'Head off the mat, chin close to the chest', es: 'Cabeza fuera, barbilla al pecho' },
      at: 'mid', pose: { trunk: -182, neck: 20, lumbar: 40, thoracic: 35, hip: 56, pos: [0, 0, 0], _fit: 1 }, marks: ['head'], parts: ['neck', 'face'] },
  ],
  cues: [{ tr: 'Kuyruk sokumunda dengede, göğüs açık', en: 'Balance on the tailbone, lift the chest', es: 'Equilibrio en el coxis, pecho arriba' },
    { tr: 'Bacaklar düz, uzağa uzanır', en: 'Legs straight, reaching long', es: 'Piernas rectas, alargadas' },
    { tr: 'C-kıvrımı korunur, çökme yok', en: 'Keep the C-curve, no collapse', es: 'Mantén la C, sin hundirte' }],
};
}
