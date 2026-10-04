/* Surya Bhedana (right-nostril / sun-piercing breath). Same seat and hand set-up as nadi_shodhana.js: easy cross-legged seat
 * on a folded blanket, left hand on the left knee, right hand in Vishnu mudra at the nose. One round: ring finger closes the
 * left nostril, inhale through the RIGHT -> brief pause, both closed -> thumb closes the right, long exhale through the LEFT.
 * - One ground contact [pelvis] on the blanket; feet are world IK targets tucked under the opposite shins (as seated_meditation).
 * - The body is still; only the right hand moves ~4 cm between "thumb" (palm a little right of the nose, closing the right
 *   nostril) and "ring" (palm a little left, ring finger on the left nostril). Hand targets are computed from the solved
 *   head (nose = head + forward), palm facing the face, fingers up, elbow down in front of the ribs.
 * - Engine limit: all fingers share one curl value, so the Vishnu mudra (index and middle folded, thumb and ring out) is shown
 *   as a softly curled hand; the cards name the fingers. Breath direction is carried by the breath pill and the cards. */
{
const { V } = FB;
const MAT = 0.012, CH = 0.1;
const G = (d = 0) => [['pelvis', MAT + CH + d]];
FB.PROPS._seatCushion = (sol) => {
  const h = Math.min(CH, sol.J.pelvis[1] - 0.1 - MAT) * (CH + 0.045) / CH;
  if (h < 0.006) return [];
  return FB.PROPS.blanket(null, { at: [sol.J.pelvis[0] + 0.04, MAT + h / 2 - 0.03, 0], size: [0.34, h, 0.42] });
};
const LEGS = { hip: 62, hrot: 45, abd: 38, knee: 128, ankle: -12, flat: false, kneePole: [0.4, 0.5, 1] };
const BASE = { ...LEGS, trunk: 2, lumbar: -4, thoracic: -3, neck: 4, ground: G(), handFlat: false, shrug: -0.005, protract: -0.01,
  palmL: 'up', curlL: 0.45, shAbdL: 14, palmR: [-0.75, 0.1, -0.65], curlR: 0.55, elbowPoleL: [-0.6, -1, 0.5], elbowPoleR: [0.1, -1, 0.35], noAvoid: true };
const RAW = {
  thumb: { ...BASE, hand: 1 },
  ring: { ...BASE, hand: -1 },
  both: { ...BASE, hand: 0, dFwd: -0.012 },
};
const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };

function fitSeat(poses, extra) {
  const { solve, expand } = FB;
  const S = (p) => solve(expand(Object.assign({}, p, { ik: undefined })), CTX);
  const foot = (s) => {
    const sg = s === 'R' ? 1 : -1, x = V.norm([0.35, 0, -sg]), y = V.norm(V.sub([0, 1, 0], V.mul(x, V.dot([0, 1, 0], x)))), z = V.cross(x, y);
    return { at: [s === 'R' ? 0.3 : 0.17, MAT + 0.06, -sg * 0.12], foot: { 0: x, 1: y, 2: z } };
  };
  // right hand at the nose: palm centre ~6 cm in front of the face, below the nose, shifted toward the nostril being closed
  const hands = (p) => {
    const s = solve(expand(Object.assign({}, p, { ik: { ankleR: foot('R'), ankleL: foot('L') } })), CTX), J = s.J, T = s.F.head || s.F.thorax;
    const nose = V.add(J.head, V.add(V.mul(T[0], 0.1), V.mul(T[1], -0.03)));
    const side = p.hand * 0.025 + (p.dz || 0), fwd = 0.065 + (p.dFwd || 0);
    const r = V.add(nose, V.add(V.add(V.mul(T[0], fwd), V.mul(T[1], -0.045 + (p.dUp || 0))), V.mul(T[2], side)));
    const kl = V.add(V.lerp(J.hipL, J.kneeL, 0.8), [0, 0.085, 0.01]);         // back of the hand resting on the thigh by the knee
    p.ik = { handL: { at: kl }, handR: { at: r }, ankleR: foot('R'), ankleL: foot('L') };
  };
  for (const k in poses) hands(poses[k]);
  for (const [at, pose] of extra) { const m = Object.assign({}, poses[at], pose); hands(m); pose.ik = m.ik; }
  return poses;
}

window.EXERCISE = {
  id: 'surya_bhedana',
  name: { tr: 'Surya Bhedana', en: 'Surya Bhedana', es: 'Surya Bhedana' },
  category: { tr: 'Yoga · Nefes', en: 'Yoga · Breath', es: 'Yoga · Respiración' },
  equipmentLabel: { tr: 'Mat, battaniye', en: 'Mat, blanket', es: 'Esterilla, manta' },
  muscles: ['core'],
  tempo: '4-2-8',
  repLabel: { tr: 'TUR', en: 'ROUND', es: 'RONDA' }, tempoReps: 1,
  view: { yaw: 8, pitch: 4, zoom: 1.45, dy: 120 },
  alt: { yaw: 90, pitch: 4, zoom: 1.2, dy: 40, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
    text: { tr: 'Omurga dik, dirsek aşağıda, omuzlar gevşek', en: 'Spine tall, elbow down, shoulders soft', es: 'Columna erguida, codo abajo, hombros sueltos' } },
  setupView: { yaw: 35, pitch: 10 },
  contacts: ['pelvis', 'ankleR', 'ankleL'],
  props: [['mat', { at: [0.1, 0, 0], length: 1.2, width: 0.9 }], ['_seatCushion']],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fitSeat(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'thumb',
  rep: [
    { to: 'ring', dur: 2.6, phase: 0 },
    { to: 'both', dur: 1.2, phase: 1 },
    { to: 'thumb', dur: 3.4, phase: 2 },
  ],
  setup: { tr: 'Battaniyeye bağdaş kur, sol el dizde. Sağ elin işaret ve orta parmağını avuca kıvır.',
    en: 'Sit cross-legged on a blanket, left hand on the knee. Fold the right index and middle fingers in.',
    es: 'Siéntate cruzada en una manta, mano izquierda en la rodilla. Dobla índice y medio derechos.' },
  phases: [
    { name: { tr: 'Sağdan al', en: 'Inhale right', es: 'Inhala por la derecha' }, breath: 'in',
      text: { tr: 'Yüzük parmağıyla solu kapat, sağ burun deliğinden yavaşça al.', en: 'Ring finger closes the left; inhale slowly through the right nostril.', es: 'El anular cierra la izquierda; inhala despacio por la derecha.' } },
    { name: { tr: 'Kısa bekle', en: 'Brief pause', es: 'Pausa breve' }, breath: 'hold',
      text: { tr: 'Başparmakla sağı da kapat, bir an bekle. Zorlama.', en: 'Close the right with the thumb too, pause a moment. No strain.', es: 'Cierra también la derecha con el pulgar, pausa breve. Sin forzar.' } },
    { name: { tr: 'Soldan ver', en: 'Exhale left', es: 'Exhala por la izquierda' }, breath: 'out',
      text: { tr: 'Yüzük parmağını kaldır, soldan uzun ve yavaş ver.', en: 'Lift the ring finger; exhale long and slow through the left.', es: 'Levanta el anular; exhala largo y lento por la izquierda.' } },
  ],
  tempoText: { tr: 'Sağdan 4 al · bekle · soldan 8 ver · 5-10 tur', en: 'In right 4 · pause · out left 8 · 5-10 rounds', es: 'Inhala dcha. 4 · pausa · exhala izq. 8 · 5-10 rondas' },
  mistakes: [
    { title: { tr: 'El burnu sıkıyor', en: 'Hand presses the nose', es: 'La mano aprieta la nariz' },
      text: { tr: 'Parmaklar burnu ezer, baş geriye kaçar.', en: 'The fingers squeeze the nose and the head pulls back.', es: 'Los dedos aprietan la nariz y la cabeza se echa atrás.' },
      fix: { tr: 'Hafif dokun', en: 'Use a light touch', es: 'Toque ligero' },
      fixText: { tr: 'Parmaklar sadece burun kanadına değsin', en: 'Fingertips just rest on the side of the nose', es: 'Las yemas solo rozan el lado de la nariz' },
      at: 'thumb', pose: { neck: -8, dFwd: -0.03, curlR: 0.9, shrugR: 0.02 }, view: { yaw: 30, pitch: 4, zoom: 1.6, dy: 160 }, marks: ['handR', 'head'], parts: ['foreR', 'neck'] },
    { title: { tr: 'Dirsek kalkıyor, omuz yükseliyor', en: 'Elbow flares, shoulder hikes', es: 'El codo se abre, el hombro sube' },
      text: { tr: 'Sağ dirsek yana kalkar, omuz kulağa yaklaşır.', en: 'The right elbow lifts out and the shoulder climbs to the ear.', es: 'El codo derecho se abre y el hombro sube a la oreja.' },
      fix: { tr: 'Dirseği aşağı bırak', en: 'Let the elbow drop', es: 'Deja caer el codo' },
      fixText: { tr: 'Dirsek göğüs önünde, gerekirse sol ele yasla', en: 'Elbow in front of the chest, rest it on the left hand if needed', es: 'Codo frente al pecho; apóyalo en la mano izquierda' },
      at: 'thumb', pose: { shrugR: 0.05, elbowPoleR: [0.15, 0, 1] }, view: { yaw: 8, pitch: 4, zoom: 1.45, dy: 120 }, marks: ['elbowR', 'shoulderR'], parts: ['upperR'] },
  ],
  cues: [{ tr: 'Sağdan al, soldan ver', en: 'In through the right, out through the left', es: 'Inhala por la derecha, exhala por la izquierda' },
    { tr: 'Yumuşak, sessiz nefes', en: 'Smooth, silent breath', es: 'Respiración suave y silenciosa' },
    { tr: 'Burna hafif dokun', en: 'Light touch on the nose', es: 'Toque ligero en la nariz' }],
};
}
