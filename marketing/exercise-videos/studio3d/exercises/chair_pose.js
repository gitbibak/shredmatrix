/* Chair pose (Utkatasana). Side view, both feet planted hip-width (ctx.plant + anchor on the ankles).
 * Starts standing with the arms already overhead (the spec's "inhale arms up" step): the mistake chapter jumps
 * rest -> mistake -> rest in ~1 s, and a full arm sweep there moves the hands faster than the qa limit.
 * Spec hold numbers are not self-consistent (trunk 40 + hip 85 + knee 90 gives a 45° shin, spec says 30). Matched the
 * technique-defining ones: knees ~85-90, trunk ~35, shin ~30 (knees roughly over the toes, hips back) -> hip ~92. */
window.EXERCISE = {
  id: 'chair_pose',
  name: { tr: 'Sandalye Pozu', en: 'Chair Pose', es: 'Postura de la silla' },
  category: { tr: 'Yoga · Bacak · Kalça', en: 'Yoga · Legs · Glutes', es: 'Yoga · Piernas · Glúteos' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['quads', 'glutes', 'delts', 'core'],
  tempo: '4-8-3',
  hold: true, holdDur: 4,
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 18, pitch: 8, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Dizler ayak uçlarıyla aynı yöne bakar', en: 'Knees track over the toes', es: 'Rodillas en línea con los pies' } },
  setupView: { yaw: 35, pitch: 12 },
  setupMarks: [{ type: 'span', joints: ['ankleR', 'ankleL'], label: { tr: 'Kalça genişliği', en: 'Hip width', es: 'Ancho de cadera' } }],
  props: [['mat', { at: [0.05, 0, 0], length: 1.6 }]],
  ctx: { anchorX: ['ankleL', 'ankleR'], anchorAt: [0, 0], plant: ['ankleL', 'ankleR'] },
  poses: {
    start: { trunk: 0, hip: 0, knee: 2, abd: 2, sh: 174, shAbd: 8, el: 3, palm: 'in', curl: 0.15, neck: 0 },
    hold: { trunk: 39, hip: 94, knee: 88, abd: 2, sh: 172, shAbd: 8, el: 3, palm: 'in', curl: 0.15, thoracic: -6, neck: -14 },
  },
  rest: 'start',
  rep: [
    { to: 'hold', dur: 4.0, phase: 0 },
    { to: 'hold', dur: 1.0, phase: 1 },
    { to: 'start', dur: 3.0, phase: 2 },
  ],
  setup: { tr: 'Ayaklar kalça genişliğinde, nefes alarak kolları yukarı uzat.',
    en: 'Feet hip-width apart. Inhale and reach the arms up.',
    es: 'Pies al ancho de cadera. Inhala y lleva los brazos arriba.' },
  phases: [
    { name: { tr: 'Otur', en: 'Sit back', es: 'Siéntate atrás' }, breath: 'out', slow: 1.1,
      text: { tr: 'Nefes vererek dizleri bük, kalçayı sandalyeye oturur gibi geri gönder.', en: 'Exhale, bend the knees and sit the hips back as if into a chair.', es: 'Exhala, flexiona y lleva la cadera atrás como si te sentaras.' } },
    { name: { tr: 'Pozda kal', en: 'Hold', es: 'Mantén' }, breath: 'easy', arc: ['hipR', 'kneeR', 'ankleR'], line: ['pelvis', 'neck'],
      text: { tr: 'Ağırlık topuklarda, göğüs açık, kollar kulak hizasında.', en: 'Weight in the heels, chest lifted, arms by the ears.', es: 'Peso en los talones, pecho arriba, brazos junto a las orejas.' } },
    { name: { tr: 'Kalk', en: 'Rise', es: 'Sube' }, breath: 'in', slow: 1.1,
      text: { tr: 'Nefes alarak topuklarla it ve dikleş.', en: 'Inhale, press through the heels and stand tall.', es: 'Inhala, empuja con los talones y sube.' } },
  ],
  tempoText: { tr: '4 sn otur · 5 nefes kal · 3 sn kalk', en: '4 s down · stay 5 breaths · 3 s up', es: '4 s abajo · 5 respiraciones · 3 s arriba' },
  mistakes: [
    { title: { tr: 'Dizler çok önde', en: 'Knees far past the toes', es: 'Rodillas muy adelante' },
      text: { tr: 'Kalça geri gitmez, ağırlık ayak parmaklarına biner.', en: 'Hips stay forward, weight goes to the toes.', es: 'La cadera no va atrás, el peso va a los dedos.' },
      fix: { tr: 'Kalçayı geri gönder', en: 'Send the hips back', es: 'Lleva la cadera atrás' },
      fixText: { tr: 'Ağırlık topuklarda, dizler ayak hizasında', en: 'Weight in the heels, knees over the feet', es: 'Peso en talones, rodillas sobre los pies' },
      at: 'hold', pose: { trunk: 14, hip: 76, knee: 100, sh: 168 }, marks: ['kneeR', 'toeR'], parts: ['thighR', 'shinR'] },
    { title: { tr: 'Sırt yuvarlanıyor', en: 'Rounded back', es: 'Espalda redondeada' },
      text: { tr: 'Göğüs çöker, kollar öne düşer.', en: 'The chest caves and the arms drop forward.', es: 'El pecho se hunde y los brazos caen.' },
      fix: { tr: 'Göğsü kaldır', en: 'Lift the chest', es: 'Eleva el pecho' },
      fixText: { tr: 'Uzun omurga, kollar kulak hizasında', en: 'Long spine, arms by the ears', es: 'Columna larga, brazos junto a las orejas' },
      at: 'hold', pose: { trunk: 24, thoracic: 20, lumbar: 6, neck: 8, sh: 150 }, line: ['pelvis', 'waist', 'neck'], goodLine: ['pelvis', 'neck'], parts: ['waist', 'chest'] },
  ],
  cues: [{ tr: 'Kalça geri', en: 'Sit hips back', es: 'Cadera atrás' },
    { tr: 'Ağırlık topuklarda', en: 'Weight in the heels', es: 'Peso en los talones' },
    { tr: 'Uzun omurga, açık göğüs', en: 'Long spine, lifted chest', es: 'Columna larga, pecho abierto' }],
};
