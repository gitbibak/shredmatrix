/* Back extension (Pilates mat, prone). Prone base as prone_w_isometric.js: pelvis + toes are the two ground contacts (same
 * names in every pose; trunk 82 so the chest rests on the mat). Arms long by the sides, palms up, lifted slightly (shoulder
 * extension ~15°, prone arm frame: shAbd from "toward the feet", sh < 0 lifts toward the ceiling).
 * Lift = thoracic -20 / lumbar -8, neck kept long (gaze to the mat). "Legs fly up" mistake raises the toe contact height. */
{
const G = (toe = 0.012) => [['pelvis', 0.012], ['toeR', toe]];
const PRONE = { trunk: 82, hip: -8, knee: 0, ankle: -35, flat: false, abd: 2, neck: 12, shAbd: 12, sh: 4, el: 4,
  palm: 'up', curl: 0.15, ground: G() };

window.EXERCISE = {
  id: 'back_extension',
  name: { tr: 'Sırt Kaldırma (Back Extension)', en: 'Back Extension', es: 'Extensión de espalda' },
  category: { tr: 'Pilates · Sırt', en: 'Pilates · Back', es: 'Pilates · Espalda' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['lowerback', 'upperback', 'glutes'],
  tempo: '2-2',
  view: { yaw: 90, pitch: 8, zoom: 1.3 },
  alt: { yaw: 35, pitch: 28, title: { tr: 'Önden çapraz', en: 'Front angle', es: 'Vista frontal' },
    text: { tr: 'Kürekler aşağı kayar, boyun uzun', en: 'Blades slide down, neck long', es: 'Escápulas abajo, cuello largo' } },
  setupView: { yaw: 40, pitch: 40 },
  props: [['mat', { at: [-0.3, 0.006, 0], length: 2.0, width: 0.7 }]],
  ctx: { anchorX: ['pelvis'], anchorAt: [-0.2, 0] },
  contacts: ['chest', 'pelvis', 'toeL', 'toeR'],
  poses: {
    rest: { ...PRONE },
    lift: { ...PRONE, thoracic: -18, lumbar: -6, neck: 4, sh: -12, protract: -0.025 },
  },
  rest: 'rest',
  rep: [
    { to: 'lift', dur: 2.0, phase: 0 },
    { to: 'rest', dur: 2.0, phase: 1 },
  ],
  setup: { tr: 'Yüzüstü uzan, bacaklar bitişik ve uzun. Kollar yanda, avuçlar yukarı, alın matta.',
    en: 'Lie face down, legs long and together. Arms by your sides, palms up, forehead on the mat.',
    es: 'Boca abajo, piernas largas y juntas. Brazos a los lados, palmas arriba, frente en la esterilla.' },
  phases: [
    { name: { tr: 'Uzan ve kaldır', en: 'Lengthen and lift', es: 'Alarga y eleva' }, breath: 'out', line: ['pelvis', 'neck', 'head'],
      text: { tr: 'Nefes ver, omurgayı uzat, baş ve göğsü 10-15 cm kaldır. Bakış matta.', en: 'Exhale, lengthen the spine and lift head and chest 10–15 cm. Eyes on the mat.', es: 'Exhala, alarga la columna y eleva cabeza y pecho 10–15 cm. Mirada abajo.' } },
    { name: { tr: 'Kontrollü in', en: 'Lower with control', es: 'Baja con control' }, breath: 'in',
      text: { tr: 'Nefes al, göğsü yavaşça mata indir.', en: 'Inhale and lower the chest slowly to the mat.', es: 'Inhala y baja el pecho despacio.' } },
  ],
  tempoText: { tr: '2 sn kaldır · 2 sn indir', en: '2 s up · 2 s down', es: '2 s arriba · 2 s abajo' },
  mistakes: [
    { title: { tr: 'Fazla kalkıp boynu bükme', en: 'Over-lifting, neck cranes', es: 'Elevar de más, cuello atrás' },
      fix: { tr: 'Sadece 10 cm kalk', en: 'Lift only about 10 cm', es: 'Eleva solo unos 10 cm' },
      fixText: { tr: 'Bakış mata, boyun omurganın devamı', en: 'Eyes to the mat, neck in line with the spine', es: 'Mirada abajo, cuello en línea' },
      at: 'lift', pose: { thoracic: -28, lumbar: -16, neck: -30 }, line: ['pelvis', 'neck', 'head'], marks: ['head'], parts: ['neck', 'waist'] },
    { title: { tr: 'Bacaklar havaya kalkıyor', en: 'Legs fly up', es: 'Las piernas se elevan' },
      fix: { tr: 'Bacakları mata sabitle', en: 'Anchor the legs', es: 'Ancla las piernas' },
      fixText: { tr: 'Kalçayı hafif sık, ayaklar matta kalsın', en: 'Squeeze the glutes lightly, feet stay on the mat', es: 'Aprieta suave los glúteos, pies abajo' },
      at: 'lift', pose: { hip: -18, ground: G(0.13) }, marks: ['ankleL', 'ankleR'], parts: ['thigh'] },
  ],
  cues: [{ tr: 'Önce uza, sonra kalk', en: 'Lengthen first, then lift', es: 'Primero alarga, luego eleva' },
    { tr: 'Boyun uzun', en: 'Keep the neck long', es: 'Cuello largo' },
    { tr: 'Kalçayı hafif sık', en: 'Squeeze glutes lightly', es: 'Glúteos suaves' }],
};
}
