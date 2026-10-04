/* Single Straight Leg Stretch / Scissors (Pilates mat, supine curl-up). the_hundred base: pelvis + waist contacts,
 * thoracic 30 + neck 40 unchanged. Rest = right leg up (~110° from the mat, pulled in), left leg long at ~45°; the
 * scissor switch is one move, so right and left are the two moves of a rep. Both hands hold the back of the thigh just above the knee
 * of the raised leg (world IK targets from the solved leg, clamped to arm reach; lazily fitted). The double pulse of the
 * spec is described in the text (not animated: `pump` would move both legs). */
{
const MAT = 0.008;
const G = (w = -0.016) => [['pelvis', MAT], ['waist', MAT + w]];
const BASE = { trunk: -90, abd: 2, hrot: 4, lumbar: 6, thoracic: 30, neck: 40, flat: false, ground: G(),
  sh: 60, shAbd: 18, el: 40, protract: 0.04, elbowPole: [-0.2, 0.2, 1], handFlat: false, palm: 'in', curl: 0.55 };
const LEGS = (up, long) => ({ ['hip' + up]: 98, ['knee' + up]: 0, ['ankle' + up]: -28, ['hip' + long]: 33, ['knee' + long]: 0, ['ankle' + long]: -32, _up: up });
const RAW = { upR: { ...BASE, ...LEGS('R', 'L') }, upL: { ...BASE, ...LEGS('L', 'R') } };
const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };

function fit(poses, extra) {
  const { V, solve, expand } = FB;
  const S = (p) => solve(expand(Object.assign({}, p, { ik: undefined })), CTX).J;
  const REACH = FB.BODY.upper + FB.BODY.fore + FB.BODY.hand * 0.55 - 0.012;
  const hands = (p) => {
    const J = S(p), s = p._up, k = J['knee' + s], a = J['ankle' + s];
    const c = V.lerp(k, a, p._at ?? -0.22), back = V.mul(V.norm(V.sub(J.neck, J.pelvis)), -0.0);
    const ik = {};
    for (const h of ['L', 'R']) {
      let t = V.add(V.add(c, back), [-0.035, 0, (h === 'R' ? 1 : -1) * 0.055 + (s === 'R' ? 1 : -1) * 0.0]);
      const d = V.sub(t, J['shoulder' + h]), L = V.len(d); if (L > REACH) t = V.add(J['shoulder' + h], V.mul(d, REACH / L));
      ik['hand' + h] = { at: t };
    }
    p.ik = ik;
  };
  for (const k in poses) hands(poses[k]);
  for (const [at, pose] of extra) { const m = Object.assign({}, poses[at], pose); hands(m); pose.ik = m.ik; }
  return poses;
}

window.EXERCISE = {
  id: 'single_straight_leg_stretch',
  name: { tr: 'Tek Düz Bacak Esnetme (Single Straight Leg Stretch)', en: 'Single Straight Leg Stretch (Scissors)', es: 'Estiramiento de una pierna recta (single straight leg stretch)' },
  category: { tr: 'Pilates · Karın', en: 'Pilates · Core', es: 'Pilates · Core' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['core', 'obliques', 'hamstrings'],
  tempo: '1-1',
  view: { yaw: 90, pitch: 6, zoom: 1.0 },
  alt: { yaw: 20, pitch: 22, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Pelvis kare ve sabit, bacaklar kalça hizasında', en: 'Pelvis square and still, legs in line with the hips', es: 'Pelvis cuadrada y quieta, piernas alineadas' } },
  setupView: { yaw: 45, pitch: 20 },
  contacts: ['pelvis', 'waist'],
  props: [['mat', { at: [0.05, 0.006, 0], length: 2.0 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fit(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'upR',
  rep: [
    { to: 'upL', dur: 1.0, phase: 0 },
    { to: 'upR', dur: 1.0, phase: 1 },
  ],
  setup: { tr: 'Baş ve kürek kemiklerini kaldır, bel minderde. Sağ bacak tavana, sol bacak 45°de uzun. Eller sağ uyluğun arkasında.',
    en: 'Curl head and shoulder blades up, lower back down. Right leg up, left leg long at 45°. Hands behind the right thigh.',
    es: 'Eleva cabeza y escápulas, lumbar abajo. Pierna derecha arriba, izquierda a 45°. Manos tras el muslo derecho.' },
  phases: [
    { name: { tr: 'Makas: sol bacak yukarı', en: 'Scissor: left leg up', es: 'Tijera: pierna izquierda arriba' }, breath: 'out', line: ['pelvis', 'waist'],
      text: { tr: 'Bacaklar kalça hizasında geçer. Eller sol uyluğa, iki kısa çekiş.', en: 'Legs pass at hip height. Hands to the left thigh, two small pulses.', es: 'Las piernas se cruzan. Manos al muslo izquierdo, dos pulsos.' } },
    { name: { tr: 'Makas: sağ bacak yukarı', en: 'Scissor: right leg up', es: 'Tijera: pierna derecha arriba' }, breath: 'in',
      text: { tr: 'İki bacak da düz ve uzun. Gövde kıvrımı aynı kalır.', en: 'Both legs straight and long. The curl of the trunk stays the same.', es: 'Ambas piernas rectas y largas. El tronco no cambia.' } },
  ],
  tempoText: { tr: 'Her makas 1 sn · iki kısa çekiş', en: '1 s per scissor · double pulse', es: '1 s por tijera · doble pulso' },
  mistakes: [
    { title: { tr: 'Pelvis yana sallanıyor', en: 'Pelvis rocks', es: 'La pelvis se balancea' },
      fix: { tr: 'Kalçalar kare ve sabit', en: 'Hips square and still', es: 'Caderas cuadradas y quietas' },
      fixText: { tr: 'Alttaki bacağı biraz yükselt', en: 'Lift the lower leg a little higher', es: 'Sube un poco la pierna de abajo' },
      at: 'upR', pose: { roll: -6, pos: [0, 0.018, 0] }, view: { yaw: 20, pitch: 22 }, line: ['hipL', 'hipR'], parts: ['pelvis'] },
    { title: { tr: 'Diz bükülüyor', en: 'Knee bends at the pulse', es: 'La rodilla se dobla' },
      fix: { tr: 'Bacak düz, çekiş küçük', en: 'Straight leg, small pulse', es: 'Pierna recta, pulso corto' },
      fixText: { tr: 'Uyluğun arkasından tut, gerekirse açıyı küçült', en: 'Hold the back of the thigh; reduce the range if needed', es: 'Sujeta detrás del muslo; reduce el rango si hace falta' },
      at: 'upR', pose: { hipR: 104, kneeR: 45, _at: -0.3 }, marks: ['kneeR'], parts: ['thighR', 'shinR'] },
  ],
  cues: [{ tr: 'İki bacak makas gibi uzun', en: 'Both legs long like scissors', es: 'Piernas largas como tijeras' },
    { tr: 'Gövde kıvrımı sabit', en: 'Keep the curl steady', es: 'Mantén la flexión' },
    { tr: 'İki kısa çekiş', en: 'Double pulse in', es: 'Doble pulso' }],
};
}
