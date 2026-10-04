/* Bicycle (Pilates mat, shoulder-stand position). Built on scissors.js (approved):
 * - Every pose rests on [neck, head]: the upper back / shoulder blades carry the weight (C7 joint at its lying clearance),
 *   the back of the head only rests on the mat. Spine nearly straight + neck 64 => trunk ~70° from the mat (spec 70).
 * - Hands support the back of the pelvis, elbows narrow and down on the mat (same HANDS as scissors).
 * - Pedalling = one leg long and lowered toward the head (spec hip 40, knee 0) while the other is bent and sweeps back
 *   (spec hip -10, knee 90). A card-less in-between pose per switch makes the feet travel on a circle instead of
 *   passing each other on a straight line: the leg coming forward leads with the bent knee, the leg going back sweeps
 *   long first and bends at the back.
 * - Rest pose = right leg long, left bent back (spec phase 1 end); the legs-together start is only described in the setup
 *   card, so the circle never has to stop and return to a closed position (mistake returns stay smooth).
 * - Spec hip angles are relative to the trunk line; measure.mjs prints unsigned values (back leg -10 shows as ~10). */
{
const G = [['neck', -0.006], ['head', 0.008]];
const HANDS = { holdL: [-0.15, -0.15, 0.07], holdR: [-0.15, -0.15, 0.07], elbowPole: [-0.2, 1, 0.3], handFlat: false, palm: 'forward', curl: 0.35 };
const BASE = { ground: G, ...HANDS, lumbar: 2, thoracic: 12, neck: 64, knee: 0, ankle: -40, flat: false, abd: 0, hrot: 2, hip: 10 };
// front = long leg lowered toward the head; back = bent leg sweeping behind
const PED = (f, b) => ({ ['hip' + f]: 29, ['knee' + f]: 0, ['ankle' + f]: -40, ['hip' + b]: -20, ['knee' + b]: 92, ['ankle' + b]: -35 });
// in-between of a switch: g = leg going back (long, sweeping), c = leg coming forward (bent knee leads)
const MID = (g, c) => ({ ['hip' + g]: 0, ['knee' + g]: 25, ['ankle' + g]: -40, ['hip' + c]: 18, ['knee' + c]: 100, ['ankle' + c]: -30 });
const RAW = {
  stand: { ...BASE },
  pedR: { ...BASE, ...PED('R', 'L') },
  midA: { ...BASE, ...MID('R', 'L') },
  pedL: { ...BASE, ...PED('L', 'R') },
  midB: { ...BASE, ...MID('L', 'R') },
};
const CTX = { anchorX: ['shoulderL', 'shoulderR'], anchorAt: [-0.4, 0] };
const lvl = (p) => { p.trunk = -90 - ((p.lumbar ?? 0) + (p.thoracic ?? 0) + (p.neck ?? 0)); return p; };
for (const k in RAW) lvl(RAW[k]);

window.EXERCISE = {
  id: 'bicycle',
  name: { tr: 'Bisiklet (Omuz Üstü)', en: 'Bicycle (Shoulder Stand)', es: 'Bicicleta (sobre hombros)' },
  category: { tr: 'Pilates · Karın', en: 'Pilates · Core', es: 'Pilates · Core' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['core', 'glutes', 'hamstrings', 'quads'],
  tempo: '1.5-1.5',
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 20, pitch: 14, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Kalça omuzların üstünde, dirsekler dar', en: 'Hips over the shoulders, elbows narrow', es: 'Cadera sobre los hombros, codos cerrados' } },
  setupView: { yaw: 50, pitch: 16 },
  contacts: ['neck', 'head', 'elbowR', 'elbowL'],
  props: [['mat', { at: [-0.25, 0.006, 0], length: 1.8 }]],
  ctx: CTX,
  poses: RAW,
  rest: 'pedR',
  rep: [
    { to: 'midA', dur: 0.6, card: false },
    { to: 'pedL', dur: 0.9, phase: 0 },
    { to: 'midB', dur: 0.6, card: false },
    { to: 'pedR', dur: 0.9, phase: 1 },
  ],
  setup: { tr: 'Kalçayı kaldır, eller belde, dirsekler minderde. Ağırlık kürek kemiklerinde; bir bacak düz, biri bükülü.',
    en: 'Lift the hips, hands on the low back, elbows down. Weight on the shoulder blades; one leg long, one bent.',
    es: 'Sube la cadera, manos en la lumbar, codos abajo. Peso en los omóplatos; una pierna recta, otra doblada.' },
  phases: [
    { name: { tr: 'Pedal çevir', en: 'Pedal', es: 'Pedalea' }, breath: 'easy', arc: ['kneeR', 'hipR', 'kneeL'],
      text: { tr: 'Sol diz öne gelip uzanır, sağ bacak bükülerek geriye süpürür.', en: 'Left knee comes forward and extends; the right leg bends and sweeps back.', es: 'La rodilla izquierda viene y se estira; la derecha se dobla atrás.' } },
    { name: { tr: 'Bacak değiştir', en: 'Switch legs', es: 'Cambia de pierna' }, breath: 'easy',
      text: { tr: 'Şimdi sağ diz öne gelip uzanır, sol bacak bükülerek geri gider.', en: 'Now the right knee comes forward and extends; the left leg bends back.', es: 'Ahora la rodilla derecha viene y se estira; la izquierda va atrás.' } },
  ],
  tempoText: { tr: 'Her bacak 1,5 sn · akıcı bir daire', en: '1.5 s per leg · one smooth circle', es: '1,5 s por pierna · un círculo fluido' },
  mistakes: [
    { title: { tr: 'Kalça düşüyor', en: 'Hips sag', es: 'La cadera cae' },
      fix: { tr: 'Dirsekleri bastır, karnı içeri çek', en: 'Press the elbows, scoop the abs', es: 'Presiona codos, mete el abdomen' },
      fixText: { tr: 'Kalça omuzların üstünde kalır, ağırlık kürek kemiklerinde', en: 'Hips stay over the shoulders, weight on the shoulder blades', es: 'Cadera sobre los hombros, peso en los omóplatos' },
      at: 'pedR', pose: { lumbar: 30, thoracic: 16, neck: 44, trunk: -180, hipR: 45, holdL: [-0.15, -0.27, 0.07], holdR: [-0.15, -0.27, 0.07] }, line: ['neck', 'pelvis'], parts: ['waist', 'pelvis'] },
    { title: { tr: 'Bacaklar savruluyor', en: 'Legs swing wildly', es: 'Las piernas se balancean' },
      fix: { tr: 'Yavaşla, daireyi kontrol et', en: 'Slow down, control the circle', es: 'Más lento, controla el círculo' },
      fixText: { tr: 'Bacaklar kalçadan akıcı döner, gövde kıpırdamaz', en: 'Legs circle smoothly from the hips, torso still', es: 'Las piernas giran suaves desde la cadera, tronco quieto' },
      at: 'pedR', pose: { hipR: 50, hipL: -34, kneeL: 70, lumbar: -8, trunk: -150 }, marks: ['ankleL', 'ankleR'], parts: ['thighL', 'thighR', 'waist'] },
  ],
  cues: [{ tr: 'Bacaklarla akıcı pedal çevir', en: 'Pedal smoothly with the legs', es: 'Pedalea con fluidez' },
    { tr: 'Yukarıda kal, kalça omuzların üstünde', en: 'Stay lifted, hips over the shoulders', es: 'Mantente arriba, cadera sobre hombros' },
    { tr: 'Dirsekleri minderde bastır', en: 'Press the elbows into the mat', es: 'Presiona los codos en la esterilla' }],
};
}
