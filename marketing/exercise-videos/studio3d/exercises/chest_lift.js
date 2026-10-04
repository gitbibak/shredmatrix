/* Chest Lift (Pilates mat, supine curl-up). Built on the_hundred: pelvis + waist are the two ground contacts in every pose,
 * so the lower back stays on the mat while thoracic + neck flexion lift head and shoulder blades.
 * - Feet: the knee is fitted (lazy, after the rig sets FB.BODY) so the heels rest on the mat with the spec's 55° thigh
 *   elevation; ankles are planted from the rest pose, so the feet never slide during the curl.
 * - Hands cradle the back of the skull: hand targets are computed in the thorax frame from the neck angle of each pose
 *   (HEAD()), elbows wide (elbowPole outward) and kept in peripheral vision. */
{
const MAT = 0.008;
const G = (w = -0.012) => [['pelvis', MAT], ['waist', MAT + w]];
// hand target behind the skull for a given neck flexion (thorax frame [fwd, up, out] from the chest)
const HEAD = (n, out = 0.07, back = 0.115, el = [0.05, 0.25, 1]) => {
  const B = FB.BODY, r = n * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
  const hx = (B.headFwd ?? 0.05) * c + (B.headUp ?? 0.19) * s, hy = -(B.headFwd ?? 0.05) * s + (B.headUp ?? 0.19) * c;
  const p = [hx - back * c, B.thorax * 0.5 + hy + back * s];
  return { holdL: [p[0], p[1], out], holdR: [p[0], p[1], out], elbowPole: el, handFlat: false, palm: [c, -s, -0.7], curl: 0.45 };
};
const BASE = { trunk: -90, abd: 3, hrot: 2, flat: true, ground: G() };
const RAW = {
  down: { ...BASE, lumbar: -3, thoracic: 4, neck: 18, hip: 55, knee: 100, _n: 18 },
  up: { ...BASE, lumbar: 4, thoracic: 33, neck: 42, hip: 55, knee: 100, ground: G(-0.016), _n: 42 },
};
const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0], plant: ['ankleL', 'ankleR'] };

function fit(poses, extra) {
  const { solve, expand } = FB;
  const S = (p) => solve(expand(p), { anchorX: CTX.anchorX, anchorAt: CTX.anchorAt }).J;
  const p = poses.down; let lo = 70, hi = 140;
  for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (S({ ...p, knee: m }).heelR[1] > MAT + 0.002) lo = m; else hi = m; }
  p.knee = +((lo + hi) / 2).toFixed(2); poses.up.knee = p.knee;
  for (const k in poses) Object.assign(poses[k], HEAD(poses[k]._n));
  for (const [at, pose] of extra) if (pose._n !== undefined) Object.assign(pose, HEAD(pose._n, pose._out, undefined, pose._el));
  return poses;
}

window.EXERCISE = {
  id: 'chest_lift',
  name: { tr: 'Göğüs Kaldırma (Chest Lift)', en: 'Chest Lift', es: 'Elevación de pecho (chest lift)' },
  category: { tr: 'Pilates · Karın', en: 'Pilates · Core', es: 'Pilates · Core' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['core', 'obliques'],
  tempo: '2-1-2',
  view: { yaw: 90, pitch: 6, zoom: 1.08 },
  alt: { yaw: 50, pitch: 24, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Dirsekler geniş, göz ucuyla görünür', en: 'Elbows wide, just in sight', es: 'Codos abiertos, a la vista' } },
  setupView: { yaw: 45, pitch: 20 },
  setupMarks: [{ type: 'span', joints: ['ankleR', 'ankleL'], label: { tr: 'Kalça genişliği', en: 'Hip width', es: 'Ancho de cadera' } }],
  contacts: ['pelvis', 'waist', 'heelR', 'ballR'],
  props: [['mat', { at: [0.05, 0.006, 0], length: 1.8 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fit(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'down',
  rep: [
    { to: 'up', dur: 2.0, phase: 0 },
    { to: 'up', dur: 1.0, phase: 1 },
    { to: 'down', dur: 2.0, phase: 2 },
  ],
  setup: { tr: 'Sırtüstü yat, dizler bükülü, ayaklar kalça genişliğinde. Parmak uçları başın arkasında, dirsekler geniş.',
    en: 'Lie on your back, knees bent, feet hip-width. Fingertips behind your head, elbows wide.',
    es: 'Boca arriba, rodillas flexionadas, pies al ancho de cadera. Dedos tras la cabeza, codos abiertos.' },
  phases: [
    { name: { tr: 'Nefes ver, kıvrıl', en: 'Exhale and curl', es: 'Exhala y enróllate' }, breath: 'out',
      text: { tr: 'Çeneyi hafif indir; baş, boyun ve kürek kemiklerini minderden kaldır.', en: 'Nod the chin, then curl head, neck and shoulder blades off the mat.', es: 'Baja la barbilla y eleva cabeza, cuello y escápulas de la esterilla.' } },
    { name: { tr: 'Yukarıda kal', en: 'Hold', es: 'Mantén' }, breath: 'in', line: ['pelvis', 'waist'],
      text: { tr: 'Karın içe, bel minderde. Bakış uyluklarda.', en: 'Belly scooped, lower back on the mat. Eyes on the thighs.', es: 'Abdomen adentro, lumbar en la esterilla. Mirada a los muslos.' } },
    { name: { tr: 'Omur omur in', en: 'Roll down', es: 'Baja vértebra a vértebra' }, breath: 'in',
      text: { tr: 'Omurgayı minderde yavaşça aç, baş en son iner.', en: 'Unroll slowly onto the mat, head last.', es: 'Desenróllate despacio, la cabeza al final.' } },
  ],
  tempoText: { tr: '2 sn kıvrıl · 1 sn kal · 2 sn in', en: '2 s curl · 1 s hold · 2 s down', es: '2 s sube · 1 s mantén · 2 s baja' },
  mistakes: [
    { title: { tr: 'Çene öne fırlıyor', en: 'Chin juts forward', es: 'La barbilla se adelanta' },
      fix: { tr: 'Önce çeneyi indir, sonra kıvrıl', en: 'Nod first, then curl', es: 'Primero baja la barbilla, luego sube' },
      fixText: { tr: 'Çene ile göğüs arası bir portakal kadar', en: 'An orange of space between chin and chest', es: 'Una naranja entre barbilla y pecho' },
      at: 'up', pose: { thoracic: 20, neck: 4, shrug: 0.025, _n: 4 }, marks: ['head'], parts: ['neck', 'face'] },
    { title: { tr: 'Dirsekler öne kapanıyor', en: 'Elbows collapse in', es: 'Los codos se cierran' },
      fix: { tr: 'Dirsekler geniş', en: 'Elbows wide', es: 'Codos abiertos' },
      fixText: { tr: 'Baş ellerde ağır, dirsekler göz ucunda', en: 'Head heavy in the hands, elbows in sight', es: 'Cabeza pesada en las manos, codos a la vista' },
      at: 'up', pose: { _n: 42, _out: 0.055, _el: [0.8, 0.3, 0.4] }, view: { yaw: 50, pitch: 24 }, marks: ['elbowL', 'elbowR'], parts: ['upper', 'fore'] },
  ],
  cues: [{ tr: 'Önce çene, sonra kıvrıl', en: 'Nod, then curl', es: 'Barbilla, luego sube' },
    { tr: 'Kaburgalar kalçaya doğru', en: 'Ribs toward the hips', es: 'Costillas hacia la cadera' },
    { tr: 'Bel minderde uzun', en: 'Lower back long on the mat', es: 'Lumbar larga en la esterilla' }],
};
}
