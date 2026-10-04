/* Single Leg Circle (Pilates mat, supine, head down). Supine base from knee_fold: pelvis + waist contacts in every pose
 * (pelvis square), arms long with palms on the mat, left leg long on the mat with the foot flexed. The right leg circles
 * from vertical: across the midline (adduction 15°) -> down and out (~60° from the mat, abduction 25°) -> up. The monotone
 * spline through the three keys draws a smooth loop at the ankle (~35 cm). One direction is animated; the reverse circle
 * is described in the text. Main view is the side view raised to 18° pitch so the across/out path reads; front view as alt. */
{
const MAT = 0.008;
const G = (w = 0.004) => [['pelvis', MAT], ['waist', MAT + w]];
const BASE = { trunk: -90, hrot: 2, lumbar: -4, thoracic: 3, neck: 16, sh: -11, shAbd: 12, el: 4, palm: 'down', curl: 0.1, ground: G(),
  hipL: 3, kneeL: 0, ankleL: 8, abdL: 3, flatL: false, kneeR: 0, ankleR: -25, flatR: false };
const RAW = {
  up: { ...BASE, hipR: 96, abdR: 2 },
  across: { ...BASE, hipR: 94, abdR: -15 },
  out: { ...BASE, hipR: 66, abdR: 25 },
};
const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };

window.EXERCISE = {
  id: 'single_leg_circle',
  name: { tr: 'Tek Bacak Dairesi (Single Leg Circle)', en: 'Single Leg Circle', es: 'Círculo de una pierna (single leg circle)' },
  category: { tr: 'Pilates · Karın', en: 'Pilates · Core', es: 'Pilates · Core' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['core', 'adductors', 'glutes'],
  side: 'R',
  tempo: '1.5-1.5-1',
  view: { yaw: 90, pitch: 18, zoom: 1.05 },
  alt: { yaw: 8, pitch: 30, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Küçük daire, pelvis kıpırdamaz', en: 'Small circle, the pelvis stays still', es: 'Círculo pequeño, la pelvis no se mueve' } },
  setupView: { yaw: 40, pitch: 24 },
  contacts: ['pelvis', 'waist', 'head', 'heelL', 'handR'],
  props: [['mat', { at: [0.1, 0.006, 0], length: 1.9 }]],
  ctx: CTX,
  poses: RAW,
  rest: 'up',
  rep: [
    { to: 'across', dur: 1.5, phase: 0 },
    { to: 'out', dur: 1.5, phase: 1 },
    { to: 'up', dur: 1.0, phase: 2 },
  ],
  setup: { tr: 'Sırtüstü yat, sağ bacak tavana, sol bacak minderde uzun. Kollar yanda mindere basar. Sonra taraf değiştir.',
    en: 'Lie on your back, right leg to the ceiling, left leg long on the mat. Arms press down. Then switch sides.',
    es: 'Boca arriba, pierna derecha al techo, izquierda larga. Brazos presionan el suelo. Luego cambia de lado.' },
  phases: [
    { name: { tr: 'Karşıya geç', en: 'Across the body', es: 'Cruza el cuerpo' }, breath: 'in',
      text: { tr: 'Sağ bacak orta hattın biraz ötesine geçer. Kalçalar sabit.', en: 'The right leg crosses just past the midline. Hips stay still.', es: 'La pierna derecha cruza un poco la línea media. Caderas quietas.' } },
    { name: { tr: 'Aşağı ve dışa', en: 'Down and out', es: 'Abajo y afuera' }, breath: 'out', line: ['hipL', 'hipR'],
      text: { tr: 'Bacak aşağıdan dışa doğru daire çizer. Pelvis kare kalır.', en: 'The leg sweeps down and out to the side. The pelvis stays square.', es: 'La pierna baja y sale hacia fuera. La pelvis queda cuadrada.' } },
    { name: { tr: 'Yukarı dön', en: 'Back up', es: 'Vuelve arriba' }, breath: 'in',
      text: { tr: 'Bacak tavana döner. 5 daire, sonra ters yöne 5 daire.', en: 'The leg returns to the ceiling. 5 circles, then 5 the other way.', es: 'La pierna vuelve al techo. 5 círculos y 5 al revés.' } },
  ],
  tempoText: { tr: 'Bir daire 4 sn · 5 bir yöne, 5 ters', en: '4 s per circle · 5 each way', es: '4 s por círculo · 5 por sentido' },
  mistakes: [
    { title: { tr: 'Pelvis bacakla sallanıyor', en: 'Pelvis rocks with the leg', es: 'La pelvis se mueve con la pierna' },
      fix: { tr: 'Daireyi küçült', en: 'Make the circle smaller', es: 'Haz el círculo más pequeño' },
      fixText: { tr: 'Kalçalar masa gibi sabit; gerekirse alttaki dizi bük', en: 'Hips still like a table; bend the lower knee if needed', es: 'Caderas quietas; dobla la rodilla de abajo si hace falta' },
      at: 'out', pose: { roll: -7, pos: [0, 0.02, 0], hipR: 62, abdR: 32 }, view: { yaw: 8, pitch: 30 }, line: ['hipL', 'hipR'], parts: ['pelvis'] },
    { title: { tr: 'Yerdeki bacak kalkıyor', en: 'Grounded leg lifts', es: 'La pierna del suelo se eleva' },
      fix: { tr: 'Uyluğu mindere bastır', en: 'Press the thigh into the mat', es: 'Presiona el muslo contra la esterilla' },
      fixText: { tr: 'Sol bacak uzun ve ağır, ayak bileği bükülü', en: 'Left leg long and heavy, foot flexed', es: 'Pierna izquierda larga y pesada, pie flexionado' },
      at: 'out', pose: { hipL: 34, kneeL: 8 }, marks: ['kneeL'], parts: ['thighL', 'shinL'] },
  ],
  cues: [{ tr: 'Kalçalar masa gibi sabit', en: 'Hips still like a table', es: 'Caderas quietas como una mesa' },
    { tr: 'Daire kalçadan, ayaktan değil', en: 'Circle from the hip, not the foot', es: 'Círculo desde la cadera' },
    { tr: 'Bacak ağır ama uzun', en: 'Leg heavy but long', es: 'Pierna pesada pero larga' }],
};
}
