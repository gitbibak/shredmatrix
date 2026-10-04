/* Twist (classical Pilates mat; right hand down). Solver setup from side_bend.js (approved): trunk 90 rolled -90 onto the
 * right side, contacts [handR (flat, straight arm), ankleR] in every pose, right hand planted from the seated start.
 * - seat = side-sit on the right hip, legs straight and stacked (strong `side` + leg adduction drop the hip to the mat).
 * - lift = straight side plank (side 0), top arm to the ceiling.
 * - thread = the pelvis and chest turn toward the floor (roll -14 + twist -15; the two-contact ground solver only lifts the
 *   hips in its own plane, so the body has to turn nearly prone for the pike to rise), hips lift into a pike-like diagonal
 *   (measured hip ~50 vs spec 30: lower values drop the support shoulder and bend the arm), standing on the balls of the
 *   feet (ankle contact raised), top arm threading under the waist. Support-arm angles fitted (coordinate search) so the
 *   straight arm reaches the planted hand.
 * - turn = card-less in-between used on the way in and out, refitted the same way (a direct blend left the hand 3 cm off).
 * - Mistakes are shown in the side plank (support shoulder, feet apart): mistake returns to the rest pose take <1 s and
 *   the rotation/threading arm moved too fast from the thread pose. */
{
const G = [['handR', 0.006], ['ankleR', -0.018]];
const BASE = { trunk: 90, roll: -90, elR: 0, shRotR: 0, curlR: 0.1, elL: 0, palmL: 'in', curlL: 0.1,
  neck: 0, flat: false, ankle: 0, hipL: 8, hipR: -4, ground: G };
const P = (o) => Object.assign({}, BASE, o);
const CTX = { anchorX: ['handR', 'ankleR'], anchorAt: [-0.25, -0.05] };

// Feet pinned to one floor spot in every pose (pivot on the balls): each pose is solved without ankle targets, then its ankles are moved
// (x/z only) so the balls land on the reference pose's balls; ankle + foot frame are stored as IK targets and interpolate linearly.
function pinFeet(poses, refName, extra) {
  const { V, solve, expand } = FB;
  const fk = (p) => solve(expand(Object.assign({}, p, { ik: Object.assign({}, p.ik, { ankleL: undefined, ankleR: undefined }) })), CTX);
  const ref = fk(poses[refName]).J;
  const frame = (F) => ({ 0: F[0].slice(), 1: F[1].slice(), 2: F[2].slice() });
  const pin = (p, free) => {
    const sol = fk(p), ik = Object.assign({}, p.ik);
    for (const s of ['R', 'L']) {
      if (free === s) { ik['ankle' + s] = { at: sol.J['ankle' + s].slice(), foot: frame(sol.F['foot' + s]) }; continue; }
      const d = [ref['ball' + s][0] - sol.J['ball' + s][0], 0, ref['ball' + s][2] - sol.J['ball' + s][2]];
      ik['ankle' + s] = { at: V.add(sol.J['ankle' + s], d), foot: frame(sol.F['foot' + s]) };
    }
    p.ik = ik;
  };
  for (const k in poses) pin(poses[k]);
  for (const [at, pose, free] of extra) { const merged = Object.assign({}, poses[at], pose); pin(merged, free); pose.ik = merged.ik; }
  return poses;
}

const RAW = {
  seat: P({ side: 34, abdR: -18, abdL: 14, shAbdR: 66, shAbdL: 28 }),
  lift: P({ side: 0, abd: 0, shAbdR: 88, shAbdL: 82, palmL: 'forward' }),
  // card-less in-between of lift -> thread (support arm refitted so the planted hand stays in reach during the turn)
  turn: P({ roll: -52, side: 0, abd: 0, hipL: 26, hipR: 18, twist: -7.5, lumbar: 3, thoracic: 3, neck: 4, shR: 111, shAbdR: -2,
    shL: 30, shAbdL: 60, elL: 10, palmL: 'down', curlL: 0.15, ankle: 18, ground: [['handR', 0.006], ['ankleR', 0.04]] }),
  thread: P({ roll: -14, side: 0, abd: 0, hipL: 44.5, hipR: 40.5, twist: -15, lumbar: 6, thoracic: 6, neck: 8, shR: 151.5, shAbdR: -35,
    shL: 60, shAbdL: -40, elL: 10, palmL: 'back', curlL: 0.2, flat: false, ankle: 30, ground: [['handR', 0.006], ['ankleR', 0.088]] }),

};

window.EXERCISE = {
  id: 'twist',
  name: { tr: 'Yan Plank Dönüşü (Twist)', en: 'Twist', es: 'Giro (twist)' },
  category: { tr: 'Pilates · Yan karın', en: 'Pilates · Obliques', es: 'Pilates · Oblicuos' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['obliques', 'core', 'delts', 'glutes'],
  side: 'R',
  tempo: '2-2-2.5',
  tempoReps: 1,
  view: { yaw: -60, pitch: 14 },
  alt: { yaw: -90, pitch: 6, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
    text: { tr: 'Destek omzu yukarıda, ayaklar bitişik', en: 'Support shoulder lifted, feet together', es: 'Hombro de apoyo arriba, pies juntos' } },
  setupView: { yaw: -40, pitch: 18 },
  setupMarks: [{ type: 'aline', joints: ['wristR', 'shoulderR'] }],
  contacts: ['handR', 'hipR', 'ankleR', 'ankleL'],
  props: [['mat', { at: [-0.25, 0, -0.12], length: 1.9, width: 0.7 }]],
  ctx: { anchorX: ['handR', 'ankleR'], anchorAt: [-0.25, -0.05], plant: ['handR'] },
  get poses() { return this._poses || (this._poses = pinFeet(RAW, 'lift', this.mistakes.filter((m) => m.free).map((m) => [m.at, m.pose, m.free]))); },
  rest: 'seat',
  rep: [
    { to: 'lift', dur: 2.0, phase: 0 },
    { to: 'turn', dur: 0.8, card: false },
    { to: 'thread', dur: 1.2, phase: 1 },
    { to: 'turn', dur: 1.0, card: false },
    { to: 'seat', dur: 1.6, phase: 2 },
  ],
  setup: { tr: 'Sağ kalçana otur, bacaklar düz ve üst üste. Sağ el kalçanın yanında minderde. Sonra taraf değiştir.',
    en: 'Sit on your right hip, legs straight and stacked. Right hand on the mat beside the hip. Then switch sides.',
    es: 'Siéntate sobre la cadera derecha, piernas rectas y juntas. Mano derecha junto a la cadera. Luego cambia.' },
  phases: [
    { name: { tr: 'Nefes ver, yan plankaya kalk', en: 'Exhale, lift to side plank', es: 'Exhala, sube a plancha lateral' }, breath: 'out', line: ['ankleR', 'hipR', 'shoulderR'],
      text: { tr: 'Sağ eli it, kalçayı kaldır; üst kol tavana uzanır.', en: 'Press the right hand, lift the hips; the top arm reaches to the ceiling.', es: 'Empuja la mano, sube la cadera; el brazo de arriba al techo.' } },
    { name: { tr: 'Nefes al, alttan geçir', en: 'Inhale, thread under', es: 'Inhala, pasa por debajo' }, breath: 'in',
      text: { tr: 'Göğüs yere döner, kalça yükselir; üst kol belin altından geçer.', en: 'The chest turns down, the hips lift; the top arm threads under the waist.', es: 'El pecho gira al suelo, la cadera sube; el brazo pasa bajo la cintura.' } },
    { name: { tr: 'Nefes ver, açıl ve in', en: 'Exhale, unwind and lower', es: 'Exhala, abre y baja' }, breath: 'out',
      text: { tr: 'Dönüşü aç ve kalçayı kontrollü şekilde mindere indir.', en: 'Unwind and lower the hips to the mat with control.', es: 'Deshaz el giro y baja la cadera con control.' } },
  ],
  tempoText: { tr: '2 sn kalk · 2 sn dön · 2,5 sn in', en: '2 s lift · 2 s twist · 2.5 s lower', es: '2 s sube · 2 s gira · 2,5 s baja' },
  mistakes: [
    { title: { tr: 'Destek omzu çöküyor', en: 'Support shoulder collapses', es: 'Se hunde el hombro de apoyo' },
      fix: { tr: 'Yeri kendinden uzaklaştır', en: 'Press the floor away', es: 'Aleja el suelo' },
      fixText: { tr: 'Omuz kulaktan uzak, baş omurganın devamında', en: 'Shoulder away from the ear, head in line with the spine', es: 'Hombro lejos de la oreja, cabeza alineada' },
      at: 'lift', pose: { shrugR: 0.055, protract: 0.03, neck: 14, shAbdR: 82 }, marks: ['shoulderR'], parts: ['upperR', 'neck'] },
    { title: { tr: 'Ayaklar ayrılıyor', en: 'Feet separate', es: 'Los pies se separan' },
      fix: { tr: 'İç bacakları sık', en: 'Squeeze the inner thighs', es: 'Aprieta el interior de los muslos' },
      fixText: { tr: 'Ayaklar üst üste, bacaklar tek parça', en: 'Feet stacked, legs move as one', es: 'Pies juntos, las piernas como una' },
      at: 'lift', free: 'L', pose: { abdL: 18, hipL: 22 }, view: { yaw: -120, pitch: 14 }, marks: ['ankleL', 'ankleR'], parts: ['thighL', 'shinL'] },
  ],
  cues: [{ tr: 'Önce beli kaldır, sonra alttan geçir', en: 'Lift the waist, then thread through', es: 'Sube la cintura y luego pasa' },
    { tr: 'Destek omzunda yukarıda kal', en: 'Stay lifted in the support shoulder', es: 'Mantente alta en el hombro de apoyo' },
    { tr: 'Yavaş hareket et, tam dön', en: 'Move slowly, rotate fully', es: 'Muévete lento, gira por completo' }],
};
}
