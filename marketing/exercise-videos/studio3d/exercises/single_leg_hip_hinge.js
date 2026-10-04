/* Single-leg hip hinge (single-leg RDL, bodyweight). Stands on the right leg (near the camera, planted + anchored, ground =
 * right heel); the free left leg is plain FK and stays in line with the trunk (hip ~0° to the trunk) so trunk and leg tip
 * together like a T. Arms hang plumb (shoulder flexion = trunk lean). */
{
window.EXERCISE = {
  id: 'single_leg_hip_hinge',
  name: { tr: 'Tek Bacak Hip Hinge', en: 'Single-Leg Hip Hinge', es: 'Bisagra de cadera a una pierna' },
  category: { tr: 'Arka bacak · Kalça', en: 'Hamstrings · Glutes', es: 'Isquios · Glúteos' },
  equipmentLabel: { tr: 'Ekipmansız', en: 'No equipment', es: 'Sin material' },
  muscles: ['hamstrings', 'glutes', 'lowerback', 'core'],
  tempo: '2-0.5-1.5',
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 150, pitch: 14, title: { tr: 'Arkadan çapraz', en: 'Rear angle', es: 'Vista trasera' },
    text: { tr: 'Kalça düz, iki taraf aynı yükseklikte', en: 'Hips square, both sides level', es: 'Cadera recta, ambos lados nivelados' } },
  setupView: { yaw: 35, pitch: 12 },
  contacts: ['heelR', 'ballR'],
  props: [],
  ctx: { anchorX: ['ankleR'], anchorAt: [0, 0.1], plant: ['ankleR'] },
  poses: {
    start: { trunk: 0, hipR: 4, kneeR: 10, hipL: -14, kneeL: 40, ankleL: -20, flatL: false, abd: 2, hrotR: 4, sh: 4, el: 4, palm: 'in', neck: 0, ground: [['heelR', 0]] },
    bottom: { trunk: 80, hipR: 92, kneeR: 15, hipL: 0, kneeL: 2, ankleL: -10, flatL: false, abd: 2, hrotR: 4, sh: 80, el: 4, palm: 'in', neck: -10, ground: [['heelR', 0]] },
  },
  rest: 'start',
  rep: [
    { to: 'bottom', dur: 2.0, phase: 0 },
    { to: 'bottom', dur: 0.5, phase: 1 },
    { to: 'start', dur: 1.5, phase: 2 },
  ],
  setup: { tr: 'Sağ bacak üstünde dur, diz hafif bükülü. Sol ayak yerden biraz kalkık. Sonra taraf değiştir.',
    en: 'Stand on the right leg, knee soft. Left foot just off the floor. Switch sides after the set.',
    es: 'De pie sobre la derecha, rodilla suave. Pie izquierdo apenas en el aire. Luego cambia de lado.' },
  phases: [
    { name: { tr: 'Menteşe', en: 'Hinge', es: 'Bisagra' }, breath: 'in', line: ['ankleL', 'pelvis', 'neck'],
      text: { tr: 'Kalçadan katlan; gövde ve sol bacak birlikte iner.', en: 'Hinge at the hip; torso and left leg move together.', es: 'Dobla en la cadera; torso y pierna izquierda a la vez.' } },
    { name: { tr: 'Altta dur', en: 'Pause', es: 'Pausa' }, breath: 'hold', line: ['ankleL', 'pelvis', 'neck'], arc: ['neck', 'pelvis', 'kneeR'],
      text: { tr: 'Gövde ve bacak yere paralel. Kalça düz, sırt düz.', en: 'Torso and leg near level. Hips square, back flat.', es: 'Torso y pierna casi paralelos. Cadera recta, espalda recta.' } },
    { name: { tr: 'Kalçayı öne sür', en: 'Stand up', es: 'Sube' }, breath: 'out',
      text: { tr: 'Kalçanı sıkarak dikleş; gövde ve bacak birlikte kalkar.', en: 'Squeeze the glute to stand; torso and leg rise together.', es: 'Aprieta el glúteo y sube; torso y pierna juntos.' } },
  ],
  tempoText: { tr: '2 sn in · 0,5 sn dur · 1,5 sn kalk', en: '2 s down · 0.5 s pause · 1.5 s up', es: '2 s abajo · 0,5 s pausa · 1,5 s arriba' },
  mistakes: [
    { title: { tr: 'Kalça yana açılıyor', en: 'Hips open up', es: 'La cadera se abre' },
      fix: { tr: 'Kalçayı yere paralel tut', en: 'Keep the hips square', es: 'Cadera paralela al suelo' },
      fixText: { tr: 'Sol ayak ucu yere bakar', en: 'Left toes point at the floor', es: 'Punta del pie izquierdo hacia el suelo' },
      at: 'bottom', pose: { roll: -14, hrotL: 34, abdL: 8, twist: 6 }, view: { yaw: 150, pitch: 14 }, marks: ['hipL'], parts: ['pelvis', 'thighL'] },
    { title: { tr: 'Sırt yuvarlanıyor', en: 'Rounded back', es: 'Espalda redondeada' },
      fix: { tr: 'Göğüs açık, boyun uzun', en: 'Chest proud, long neck', es: 'Pecho abierto, cuello largo' },
      fixText: { tr: 'Sırt düz kalacak kadar in', en: 'Only go as low as your back stays flat', es: 'Baja solo mientras la espalda siga recta' },
      at: 'bottom', pose: { trunk: 54, lumbar: 12, thoracic: 24, neck: 4, sh: 86 }, line: ['pelvis', 'waist', 'neck'], goodLine: ['pelvis', 'neck'], parts: ['waist', 'chest'] },
  ],
  cues: [{ tr: 'Kalça geri, bacak uzun', en: 'Hips back, leg long', es: 'Cadera atrás, pierna larga' },
    { tr: 'Kalça düz', en: 'Hips square', es: 'Cadera recta' },
    { tr: 'Sırt düz, diz yumuşak', en: 'Flat back, soft knee', es: 'Espalda recta, rodilla suave' }],
};
}
