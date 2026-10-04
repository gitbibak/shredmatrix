/* Scissors (Pilates mat, shoulder-stand position). Solver setup from rollover.js / jackknife.js:
 * - Every pose rests on [neck, head]: upper back (C7 joint at its lying clearance + shoulder blades) carries the weight, the
 *   back of the head rests on the mat. Spine nearly straight (lumbar 0-4, thoracic 10) + neck 60 => trunk ~70° from the mat.
 * - trunk is set from the spine so the head axis starts level (no 2-contact branch flip, see rollover.js).
 * - Hands support the back of the pelvis (holdL/R in the thorax frame), elbows narrow and down on the mat (elbowPole back).
 * - The rest pose is the lifted shoulder stand (the roll-up into it is described in the setup card).
 * - Spec hip angles are relative to the trunk line (front leg 40, back leg -15); measure.mjs prints the unsigned value. */
{
const G = [['neck', -0.006], ['head', 0.008]];
const HANDS = { holdL: [-0.15, -0.15, 0.07], holdR: [-0.15, -0.15, 0.07], elbowPole: [-0.2, 1, 0.3], handFlat: false, palm: 'forward', curl: 0.35 };
const BASE = { ground: G, ...HANDS, lumbar: 2, thoracic: 12, neck: 64, knee: 0, ankle: -40, flat: false, abd: 0, hrot: 2, hip: 10 };
const RAW = {
  stand: { ...BASE },
  splitR: { ...BASE, hipR: 32, hipL: -26 },
  splitL: { ...BASE, hipL: 32, hipR: -26 },
};
const CTX = { anchorX: ['shoulderL', 'shoulderR'], anchorAt: [-0.4, 0] };
const lvl = (p) => { p.trunk = -90 - ((p.lumbar ?? 0) + (p.thoracic ?? 0) + (p.neck ?? 0)); return p; };
for (const k in RAW) lvl(RAW[k]);

window.EXERCISE = {
  id: 'scissors',
  name: { tr: 'Makas (Scissors, Omuz Üstü)', en: 'Scissors (Shoulder Stand)', es: 'Tijeras (scissors, sobre hombros)' },
  category: { tr: 'Pilates · Karın', en: 'Pilates · Core', es: 'Pilates · Core' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['core', 'hamstrings', 'glutes'],
  tempo: '1-1',
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 20, pitch: 14, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Kalça omuzların üstünde, dirsekler dar', en: 'Hips over the shoulders, elbows narrow', es: 'Cadera sobre los hombros, codos cerrados' } },
  setupView: { yaw: 50, pitch: 16 },
  contacts: ['neck', 'head', 'elbowR', 'elbowL'],
  props: [['mat', { at: [-0.25, 0.006, 0], length: 1.8 }]],
  ctx: CTX,
  poses: RAW,
  rest: 'stand',
  rep: [
    { to: 'splitR', dur: 1.0, phase: 0 },
    { to: 'splitL', dur: 1.0, phase: 1 },
  ],
  setup: { tr: 'Geriye yuvarlan ve kalçayı kaldır. Eller belin arkasında, dirsekler minderde; bacaklar bitişik yukarıda.',
    en: 'Roll over and lift the hips. Hands behind the low back, elbows down; legs together, up high.',
    es: 'Rueda atrás y sube la cadera. Manos en la lumbar, codos abajo; piernas juntas arriba.' },
  phases: [
    { name: { tr: 'Nefes al, makası aç', en: 'Inhale, open the scissors', es: 'Inhala, abre las tijeras' }, breath: 'in', arc: ['ankleR', 'hipR', 'ankleL'],
      text: { tr: 'Sağ bacak başa doğru iner, sol bacak geriye uzanır. Kalça sabit.', en: 'Right leg lowers toward the head, left reaches back. Hips still.', es: 'La derecha baja hacia la cabeza, la izquierda atrás. Cadera quieta.' } },
    { name: { tr: 'Nefes ver, değiştir', en: 'Exhale, switch', es: 'Exhala, cambia' }, breath: 'out',
      text: { tr: 'Bacaklar ortadan geçip yer değiştirir, bıçak gibi düz.', en: 'Legs pass the middle and switch, straight like blades.', es: 'Las piernas cruzan por el centro, rectas como cuchillas.' } },
  ],
  tempoText: { tr: 'Her bacak 1 sn · hızlı ve kontrollü', en: '1 s per leg · quick but controlled', es: '1 s por pierna · rápido y controlado' },
  mistakes: [
    { title: { tr: 'Gövde çöküyor', en: 'Torso collapses', es: 'El tronco se hunde' },
      fix: { tr: 'Kalçayı ellerle kaldır', en: 'Lift the hips with the hands', es: 'Sube la cadera con las manos' },
      fixText: { tr: 'Dirsekleri bastır, açıyı küçült; kalça omuzların üstünde', en: 'Press the elbows, smaller split; hips over the shoulders', es: 'Codos abajo, apertura menor; cadera sobre los hombros' },
      at: 'splitR', pose: { lumbar: 30, thoracic: 16, neck: 44, trunk: -180, hipR: 48, hipL: -8, holdL: [-0.15, -0.27, 0.07], holdR: [-0.15, -0.27, 0.07] }, line: ['neck', 'pelvis'], parts: ['waist', 'pelvis'] },
    { title: { tr: 'Boyun yükleniyor', en: 'Neck loaded', es: 'Cuello cargado' },
      fix: { tr: 'Bakış ayak parmaklarında', en: 'Eyes on the toes', es: 'Mirada a los pies' },
      fixText: { tr: 'Baş düz ve sabit, ağırlık omuzlarda', en: 'Head straight and still, weight on the shoulders', es: 'Cabeza recta y quieta, peso en los hombros' },
      at: 'splitR', pose: { headTurn: 32, shrug: 0.03 }, view: { yaw: 35, pitch: 16 }, marks: ['neck'], parts: ['neck', 'face'] },
  ],
  cues: [{ tr: 'Yukarıda kal, dirsekler bastırır', en: 'Stay lifted, press the elbows', es: 'Mantente arriba, codos firmes' },
    { tr: 'Bacaklar bıçak gibi düz', en: 'Legs straight like blades', es: 'Piernas rectas como cuchillas' },
    { tr: 'Kalça omuzların üstünde', en: 'Pelvis stacked over the shoulders', es: 'Pelvis sobre los hombros' }],
};
}
