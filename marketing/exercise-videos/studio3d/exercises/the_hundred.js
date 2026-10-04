// Pilates mat template (supine). Pelvis + lumbar (waist) are the two ground contacts, so the lower back stays on the mat
// while thoracic + neck flexion lift the head and shoulder blades. Arm pumping = `pump` (engine feature: ex.pump).
const HUNDRED = { palm: 'down', curl: 0.05,
  trunk: -90, lumbar: 4, thoracic: 30, neck: 42,
  hip: 33, abd: -4, hrot: 8, knee: 0, ankle: -32, flat: false,
  sh: 18, shAbd: 12, el: 4,
  ground: [['pelvis', 0.008], ['waist', -0.012]],
};

window.EXERCISE = {
  id: 'the_hundred',
  name: { tr: 'Yüz Vuruşu (The Hundred)', en: 'The Hundred', es: 'Los cien (The Hundred)' },
  category: { tr: 'Pilates · Karın', en: 'Pilates · Core', es: 'Pilates · Core' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['core', 'obliques'],
  tempo: '5-5',
  tempoReps: 3,
  repLabel: { tr: 'TUR', en: 'ROUND', es: 'RONDA' },
  view: { yaw: 90, pitch: 6, zoom: 1.12 },
  alt: { yaw: 58, pitch: 28, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' }, text: { tr: 'Kollar düz, küçük ve hızlı vuruşlar', en: 'Straight arms, small quick beats', es: 'Brazos rectos, golpes cortos y rápidos' } },
  props: [['mat', { at: [0.02, 0.006, 0], length: 1.8 }]],
  ctx: { anchorX: ['pelvis'], anchorAt: [0, 0] },
  contacts: ['pelvis', 'waist'],
  poses: { hundred: HUNDRED },
  rest: 'hundred',
  // one rep = one breath cycle: 5 beats inhale, 5 beats exhale (ex.pump adds the beats)
  rep: [
    { to: 'hundred', dur: 2.0, phase: 0 },
    { to: 'hundred', dur: 2.0, phase: 1 },
  ],
  pump: { key: 'sh', amp: -9, hz: 2.5 },
  setup: { tr: 'Sırtüstü yat, bel minderde. Baş ve omuzları kaldır, bacakları 45°ye uzat. Kollar kalçanın yanında.',
    en: 'Lie on your back, lower back on the mat. Curl head and shoulders up, legs long at 45°, arms by the hips.',
    es: 'Boca arriba, zona lumbar en la esterilla. Eleva cabeza y hombros, piernas a 45°, brazos junto a la cadera.' },
  phases: [
    { name: { tr: '5 vuruş nefes al', en: 'Inhale for 5', es: 'Inhala en 5' }, breath: 'in',
      text: { tr: 'Kollar düz ve uzun. Omuzdan küçük, hızlı vuruşlar.', en: 'Arms long and straight. Small, quick beats from the shoulders.', es: 'Brazos largos y rectos. Golpes cortos y rápidos desde el hombro.' } },
    { name: { tr: '5 vuruş nefes ver', en: 'Exhale for 5', es: 'Exhala en 5' }, breath: 'out',
      text: { tr: 'Karın içe, bel minderde. 10 tur, 100 vuruş.', en: 'Belly in, lower back down. 10 rounds, 100 beats.', es: 'Abdomen adentro, lumbar abajo. 10 rondas, 100 golpes.' } },
  ],
  tempoText: { tr: '5 vuruş nefes al · 5 vuruş nefes ver', en: '5 beats inhale · 5 beats exhale', es: '5 golpes inhala · 5 golpes exhala' },
  mistakes: [
    { title: { tr: 'Bel minderden kalkıyor', en: 'Lower back arches', es: 'La lumbar se arquea' },
      fix: { tr: 'Bacakları biraz yükselt', en: 'Raise the legs a little', es: 'Sube un poco las piernas' },
      fixText: { tr: 'Bel minderde kalacak kadar yüksek; gerekirse dizleri bük', en: 'Only as low as the back stays down; bend the knees if needed', es: 'Solo tan bajo como la lumbar aguante; si no, rodillas dobladas' },
      at: 'hundred', pose: { hip: 30, lumbar: -6, thoracic: 12, ground: [['pelvis', 0.008], ['waist', 0.045]] }, marks: ['waist'], parts: ['waist', 'pelvis'] },
    { title: { tr: 'Boyun zorlanıyor', en: 'Neck strain', es: 'Tensión en el cuello' },
      fix: { tr: 'Bakış uyluklara', en: 'Eyes to the thighs', es: 'Mirada a los muslos' },
      fixText: { tr: 'Çene ile göğüs arasında bir yumruk boşluk', en: 'A fist of space between chin and chest', es: 'Un puño entre barbilla y pecho' },
      at: 'hundred', pose: { thoracic: 26, neck: -2, shrug: 0.03 }, marks: ['head'], parts: ['neck', 'face', 'hair'] },
  ],
  cues: [{ tr: 'Bel minderde', en: 'Lower back down', es: 'Lumbar abajo' }, { tr: 'Kollar omuzdan vursun', en: 'Pump from the shoulders', es: 'Bombea desde el hombro' }, { tr: '5 al, 5 ver', en: 'In for 5, out for 5', es: 'Inhala 5, exhala 5' }],
};
