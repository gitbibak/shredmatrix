/* Swimming (Pilates mat, prone). Prone base as prone_ytw.js but with a single ground contact (pelvis) so the legs can lift and
 * alternate freely; trunk 82 keeps the chest on the mat at rest. Arms long overhead, shoulder-width (prone arm frame: shAbd from
 * "toward the feet"; past shAbd 90 the sign flips: sh > 0 lifts the arms toward the ceiling). Lift = thoracic -9 / lumbar -6 (spec 15/10 lifts the head ~30 cm with this rig; the spec's 10-15 cm limb height is kept instead).
 * Flutter = alternating poses A (right arm + left leg up) / B (left arm + right leg up), ~10 cm amplitude; in the tempo
 * chapter one flutter cycle takes 1.2 s (the real 3 beats/s would be unreadable at 60 fps in a demo; stated in the text). */
{
const G = [['pelvis', 0.012]];
const PRONE = { trunk: 85, hip: -3.5, knee: 0, ankle: -52, flat: false, abd: 3, neck: 10, shAbd: 168, sh: -13, el: 4,
  palm: 'down', curl: 0.1, ground: G };
const LIFT = { ...PRONE, thoracic: -9, lumbar: -6, neck: 6, hip: -14, sh: -17, protract: -0.02 };
const F = 6;   // flutter amplitude (deg) at shoulder and hip

window.EXERCISE = {
  id: 'swimming',
  name: { tr: 'Yüzme (Swimming)', en: 'Swimming', es: 'Natación (swimming)' },
  category: { tr: 'Pilates · Sırt', en: 'Pilates · Back', es: 'Pilates · Espalda' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['lowerback', 'glutes', 'hamstrings', 'upperback'],
  tempo: '5-5',
  view: { yaw: 90, pitch: 8, zoom: 1.15 },
  alt: { yaw: 150, pitch: 26, title: { tr: 'Arkadan çapraz', en: 'Back angle', es: 'Vista trasera' },
    text: { tr: 'Çapraz kol ve bacak, gövde sabit', en: 'Opposite arm and leg, torso still', es: 'Brazo y pierna opuestos, tronco quieto' } },
  setupView: { yaw: 40, pitch: 40 },
  props: [['mat', { at: [0.0, 0.006, 0], length: 2.3, width: 0.7 }]],
  ctx: { anchorX: ['pelvis'], anchorAt: [-0.1, 0] },
  contacts: ['chest', 'pelvis', 'toeL', 'toeR'],
  poses: {
    rest: { ...PRONE },
    lift: LIFT,
    A: { ...LIFT, shR: -17 + F, shL: -17 - F, hipL: -14 - F, hipR: -14 + F },
    B: { ...LIFT, shR: -17 - F, shL: -17 + F, hipL: -14 + F, hipR: -14 - F },
  },
  rest: 'rest',
  rep: [
    { to: 'lift', dur: 2.0, phase: 0 },
    { to: 'A', dur: 0.6, phase: 1 },
    { to: 'B', dur: 0.6, phase: 1 },
    { to: 'rest', dur: 1.5, phase: 2 },
  ],
  setup: { tr: 'Yüzüstü uzan, bacaklar bitişik. Kollar başın üstünde omuz genişliğinde uzun, alın matta.',
    en: 'Lie face down, legs together. Arms long overhead, shoulder-width apart, forehead down.',
    es: 'Boca abajo, piernas juntas. Brazos largos sobre la cabeza al ancho de hombros, frente abajo.' },
  phases: [
    { name: { tr: 'Kaldır', en: 'Lift', es: 'Eleva' }, breath: 'out',
      text: { tr: 'Nefes ver, baş, kollar ve bacakları birkaç cm kaldır. Boyun uzun, karın içeride.', en: 'Exhale, lift head, arms and legs a few cm. Long neck, belly in.', es: 'Exhala, eleva cabeza, brazos y piernas unos cm. Cuello largo, abdomen adentro.' } },
    { name: { tr: 'Çapraz çırp', en: 'Flutter', es: 'Alterna' }, breath: 'easy',
      text: { tr: 'Karşı kol ve bacakla küçük, hızlı vuruşlar. 5 sayı al, 5 sayı ver.', en: 'Small quick beats, opposite arm and leg. In for 5, out for 5.', es: 'Golpes cortos y rápidos, brazo y pierna opuestos. Inhala 5, exhala 5.' } },
    { name: { tr: 'Bırak', en: 'Lower', es: 'Baja' }, breath: 'out',
      text: { tr: 'Kolları, bacakları ve başı mata indir.', en: 'Lower arms, legs and head to the mat.', es: 'Baja brazos, piernas y cabeza.' } },
  ],
  tempoText: { tr: 'Saniyede ~3 vuruş · 5 al, 5 ver · 100 sayı', en: '~3 beats per second · in 5, out 5 · 100 counts', es: '~3 golpes por segundo · 5 y 5 · 100 cuentas' },
  mistakes: [
    { title: { tr: 'Bel ve boyun aşırı bükülüyor', en: 'Low back and neck over-arched', es: 'Lumbar y cuello arqueados' },
      fix: { tr: 'Bakış aşağı, daha az kalk', en: 'Eyes down, lift less', es: 'Mirada abajo, eleva menos' },
      fixText: { tr: 'Uzağa uzan, yukarı değil; boyun uzun', en: 'Reach long, not high; long neck', es: 'Alarga, no subas; cuello largo' },
      at: 'A', pose: { thoracic: -18, lumbar: -18, neck: -30 }, line: ['pelvis', 'waist', 'neck', 'head'], parts: ['waist', 'neck'] },
    { title: { tr: 'Gövde iki yana sallanıyor', en: 'Torso rocks side to side', es: 'El tronco se balancea' },
      fix: { tr: 'Pelvisi sabit tut', en: 'Keep the pelvis still', es: 'Pelvis quieta' },
      fixText: { tr: 'Daha küçük vuruşlar, kalçalar matta eşit', en: 'Smaller beats, both hips level on the mat', es: 'Golpes más pequeños, caderas niveladas' },
      at: 'A', pose: { roll: 12 }, view: { yaw: 150, pitch: 26 }, line: ['hipL', 'hipR'], marks: ['hipL', 'hipR'], parts: ['pelvis'] },
  ],
  cues: [{ tr: 'Omuz ve kalçadan uzun vuruş', en: 'Reach long, flutter from shoulder and hip', es: 'Alarga, mueve desde hombro y cadera' },
    { tr: 'Karın mattan kalkık', en: 'Keep the abs lifted', es: 'Abdomen activo' },
    { tr: 'Boyun uzun, bakış yere', en: 'Neck long, gaze at the floor', es: 'Cuello largo, mirada al suelo' }],
};
}
