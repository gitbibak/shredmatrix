/* Cat-Cow (quadruped spinal flexion/extension). Hands AND knees stay on one spot of the mat:
 * - every pose rests on the same two ground contacts [handR, kneeR] (no contact-set blending);
 * - thigh stays vertical (hip = trunk: the pelvis tilts, the thigh does not move);
 * - fitArms() (lazy, after the rig sets FB.BODY) searches the shoulder flexion per pose so the FK hand lands on the
 *   tabletop's hand–knee distance; the hand plant then only corrects millimetres and the elbows stay straight.
 * Cow: pelvis tilts forward (tailbone up), lumbar/thoracic extend, gaze forward. Cat: pelvis tucks, spine rounds, head drops,
 * shoulder blades push the floor away (protract). */
{
const MAT = 0.012;
const G = [['handR', 0], ['kneeR', MAT]];
const BASE = { trunk: 90, ankle: -84, flat: false, knee: 90, el: 0, abd: 2, ground: G };
// hip/sh are starting guesses; fitQuad() solves them (thigh vertical, hands on one spot)
const RAW = {
  table: { ...BASE, hip: 90, sh: 90, neck: -4 },
  cow: { ...BASE, hip: 100, lumbar: -24, thoracic: -18, neck: -30, sh: 90, protract: -0.01 },
  cat: { ...BASE, hip: 66, lumbar: 24, thoracic: 26, neck: 30, sh: 90, protract: 0.035 },
};
const CTX = { anchorX: ['handL', 'handR'], anchorAt: [0.45, 0] };

// 2x2 Newton on (hip, sh): r1 = thigh vertical (knee under hip), r2 = hand-knee distance (table: wrist under shoulder)
function fitQuad(poses, ref, extra) {
  const { solve, expand } = FB;
  const S = (p) => solve(expand(p), CTX).J;
  let want = null;
  const res = (p) => { const J = S(p); return [J.kneeR[0] - J.hipR[0], want === null ? J.wristR[0] - J.shoulderR[0] - 0.02 : J.handR[0] - J.kneeR[0] - want]; };
  const fit = (p) => {
    for (let it = 0; it < 40; it++) {
      const r = res(p), e = 0.5;
      const rh = res({ ...p, hip: p.hip + e }), rs = res({ ...p, sh: p.sh + e });
      const a = (rh[0] - r[0]) / e, b = (rs[0] - r[0]) / e, c = (rh[1] - r[1]) / e, d = (rs[1] - r[1]) / e, det = a * d - b * c;
      if (Math.abs(det) < 1e-9) break;
      const cl = (x) => Math.max(-4, Math.min(4, x));
      p.hip -= cl((d * r[0] - b * r[1]) / det); p.sh -= cl((-c * r[0] + a * r[1]) / det);
    }
    p.hip = +p.hip.toFixed(2); p.sh = +p.sh.toFixed(2);
  };
  fit(poses[ref]);
  const J = S(poses[ref]); want = J.handR[0] - J.kneeR[0];
  for (const k in poses) if (k !== ref) fit(poses[k]);
  for (const [at, pose] of extra) { const m = Object.assign({}, poses[at], pose); fit(m); pose.hip = m.hip; pose.sh = m.sh; }
  return poses;
}

window.EXERCISE = {
  id: 'cat_cow',
  name: { tr: 'Kedi-İnek Esnemesi', en: 'Cat-Cow Stretch', es: 'Gato-vaca' },
  category: { tr: 'Yoga · Omurga', en: 'Yoga · Spine', es: 'Yoga · Columna' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['lowerback', 'core', 'upperback'],
  tempo: '3-3',
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 35, pitch: 14, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Kollar düz, hareket kuyruk sokumundan başlar', en: 'Arms straight, the move starts at the tailbone', es: 'Brazos rectos, el movimiento nace en el coxis' } },
  setupView: { yaw: 40, pitch: 14 },
  setupMarks: [{ type: 'aline', joints: ['wristR', 'shoulderR'] }, { type: 'aline', joints: ['kneeR', 'hipR'] }],
  contacts: ['handR', 'handL', 'kneeR', 'kneeL'],
  props: [['mat', { at: [0.1, 0, 0], length: 1.6 }]],
  ctx: Object.assign({ plant: ['handL', 'handR'] }, CTX),
  get poses() { return this._poses || (this._poses = fitQuad(RAW, 'table', this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'table',
  rep: [
    { to: 'cow', dur: 3.0, phase: 0 },
    { to: 'cat', dur: 3.0, phase: 1 },
  ],
  setup: { tr: 'Masa pozisyonu: bilekler omuzların, dizler kalçanın altında. Sırt düz, boyun uzun.',
    en: 'Tabletop: wrists under shoulders, knees under hips. Flat back, long neck.',
    es: 'Mesa: muñecas bajo los hombros, rodillas bajo la cadera. Espalda plana, cuello largo.' },
  phases: [
    { name: { tr: 'İnek', en: 'Cow', es: 'Vaca' }, breath: 'in',
      text: { tr: 'Kuyruk sokumu yukarı, göbek aşağı. Göğsü öne aç, ileri bak.', en: 'Tailbone up, belly down. Open the chest, look ahead.', es: 'Coxis arriba, abdomen abajo. Abre el pecho, mira al frente.' } },
    { name: { tr: 'Kedi', en: 'Cat', es: 'Gato' }, breath: 'out',
      text: { tr: 'Kuyruk sokumunu içe al, sırtı tavana yuvarla. Baş aşağı, yeri it.', en: 'Tuck the tailbone, round the back up. Head down, push the floor away.', es: 'Mete el coxis, redondea la espalda. Cabeza abajo, empuja el suelo.' } },
  ],
  tempoText: { tr: '3 sn nefes al, inek · 3 sn nefes ver, kedi', en: '3 s inhale, cow · 3 s exhale, cat', es: '3 s inhala, vaca · 3 s exhala, gato' },
  mistakes: [
    { title: { tr: 'Sadece boyun hareket ediyor', en: 'Only the neck moves', es: 'Solo se mueve el cuello' },
      text: { tr: 'Baş kalkar ama sırt düz kalır.', en: 'The head lifts but the back stays flat.', es: 'La cabeza sube pero la espalda sigue plana.' },
      fix: { tr: 'Hareketi leğenden başlat', en: 'Start from the pelvis', es: 'Empieza desde la pelvis' },
      fixText: { tr: 'Önce kuyruk sokumu, sonra omurga, en son baş', en: 'Tailbone first, then the spine, the head last', es: 'Primero el coxis, luego la columna, la cabeza al final' },
      at: 'cow', pose: { hip: 90, lumbar: 0, thoracic: -2, neck: -44, protract: 0 }, line: ['hipR', 'waist', 'neck'], parts: ['neck', 'face'] },
    { title: { tr: 'Göğüs omuzların arasına çöküyor', en: 'Chest sinks between the shoulders', es: 'El pecho se hunde entre los hombros' },
      text: { tr: 'Kürekler birbirine yaklaşır, omuzlar kulağa kalkar.', en: 'The blades pinch together and the shoulders rise.', es: 'Las escápulas se juntan y los hombros suben.' },
      fix: { tr: 'Elleri yere bastır', en: 'Press the hands down', es: 'Presiona con las manos' },
      fixText: { tr: 'Yeri it, sırtın üstü kürekler arasında genişlesin', en: 'Push the floor; the upper back widens', es: 'Empuja el suelo; la espalda alta se ensancha' },
      at: 'cat', pose: { protract: -0.035, shrug: 0.035, thoracic: 6, neck: 20 }, view: { yaw: 40, pitch: 16 }, marks: ['shoulderL', 'shoulderR'], parts: ['upper', 'chest'] },
  ],
  cues: [{ tr: 'Nefesle hareket et', en: 'Move with the breath', es: 'Muévete con la respiración' },
    { tr: 'Kuyruk sokumundan başla', en: 'Start at the tailbone', es: 'Empieza en el coxis' },
    { tr: 'Kollar düz kalsın', en: 'Keep the arms straight', es: 'Brazos rectos' }],
};
}
