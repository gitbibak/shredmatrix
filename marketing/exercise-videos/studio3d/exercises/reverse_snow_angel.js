/* Reverse snow angel. Prone base as prone_w_isometric.js (pelvis + toes on the mat, trunk 82, chin slightly tucked).
 * Straight arms sweep in a wide arc from beside the hips (shAbd 20) to overhead (shAbd 165) in the prone thorax frame;
 * a single angle (shAbd) drives the arc, so the spline interpolation is a true arc. sh sets the hover height at each end
 * (hands ~10-15 cm above the mat the whole way). Main view: front (from the head side), raised so the arc is visible. */
{
const PRONE = { trunk: 82, hip: -8, knee: 0, ankle: -35, flat: false, abd: 3, neck: 15, el: 0, palm: 'down', curl: 0.15,
  thoracic: -6, ground: [['pelvis', 0.012], ['toeR', 0.012]] };

window.EXERCISE = {
  id: 'reverse_snow_angel',
  name: { tr: 'Reverse Snow Angel', en: 'Reverse Snow Angel', es: 'Ángel de nieve invertido' },
  category: { tr: 'Üst sırt', en: 'Upper back', es: 'Espalda alta' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['upperback', 'delts'],
  tempo: '2-0-2',
  view: { yaw: 8, pitch: 42 },
  alt: { yaw: 90, pitch: 10, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
    text: { tr: 'Eller hep minderin üstünde, alın aşağıda', en: 'Hands always off the mat, forehead down', es: 'Manos siempre en el aire, frente abajo' } },
  setupView: { yaw: 40, pitch: 30 },
  props: [['mat', { at: [-0.25, 0.006, 0], length: 2.1, width: 0.7 }]],
  ctx: { anchorX: ['pelvis'], anchorAt: [-0.2, 0] },
  contacts: ['chest', 'pelvis', 'toeL', 'toeR'],
  poses: {
    // arms beside the hips, palms down, hands ~10 cm off the mat, chest slightly lifted
    low: { ...PRONE, shAbd: 20, sh: -8 },
    // arms swept overhead, still straight and floating
    high: { ...PRONE, shAbd: 165, sh: -21 },
    // halfway (T): only used as the base of the shrug mistake
    mid: { ...PRONE, shAbd: 92, sh: -12 },
  },
  rest: 'low',
  rep: [
    { to: 'high', dur: 2.0, phase: 0 },
    { to: 'low', dur: 2.0, phase: 1 },
  ],
  setup: { tr: 'Yüzüstü yat, kollar kalçanın yanında, avuçlar aşağı. Elleri ve göğsü minderden hafifçe kaldır.',
    en: 'Lie face down, arms by your hips, palms down. Lift the hands and chest slightly off the mat.',
    es: 'Boca abajo, brazos junto a la cadera, palmas abajo. Eleva un poco manos y pecho.' },
  phases: [
    { name: { tr: 'Yukarı süpür', en: 'Sweep up', es: 'Barre hacia arriba' }, breath: 'in',
      text: { tr: 'Düz kolları geniş bir yayla başının üstüne taşı. Eller yere değmez.', en: 'Sweep the straight arms in a wide arc overhead. Hands never touch down.', es: 'Lleva los brazos rectos en un arco amplio sobre la cabeza. Sin tocar el suelo.' } },
    { name: { tr: 'Aşağı süpür', en: 'Sweep down', es: 'Barre hacia abajo' }, breath: 'out',
      text: { tr: 'Aynı yaydan kalçaya dön, kürekleri sık.', en: 'Return along the same arc to the hips, squeezing the blades.', es: 'Vuelve por el mismo arco a la cadera, juntando las escápulas.' } },
  ],
  tempoText: { tr: '2 sn yukarı · 2 sn aşağı', en: '2 s up · 2 s down', es: '2 s arriba · 2 s abajo' },
  mistakes: [
    { title: { tr: 'Baş kalkıyor, bel çukurlaşıyor', en: 'Head up, low back arched', es: 'Cabeza arriba, lumbar arqueada' },
      fix: { tr: 'Alın aşağıda, karın sıkı', en: 'Forehead down, abs braced', es: 'Frente abajo, abdomen firme' },
      fixText: { tr: 'Karın ve kalçayı sık; sadece kollar hareket eder', en: 'Brace abs and glutes; only the arms move', es: 'Abdomen y glúteos firmes; solo se mueven los brazos' },
      at: 'low', pose: { thoracic: -12, lumbar: -7, neck: -8 }, view: { yaw: 90, pitch: 10 },
      line: ['pelvis', 'waist', 'neck', 'head'], goodLine: ['pelvis', 'neck'], parts: ['waist', 'neck'] },
    { title: { tr: 'Omuzlar kulağa kalkıyor', en: 'Shrugging', es: 'Encoger los hombros' },
      fix: { tr: 'Omuzları aşağı indir', en: 'Shoulders down', es: 'Hombros abajo' },
      fixText: { tr: 'Kürekler aşağı; boyun uzun kalır', en: 'Blades down; the neck stays long', es: 'Escápulas abajo; cuello largo' },
      at: 'mid', pose: { shrug: 0.06, neck: 4 }, marks: ['shoulderL', 'shoulderR'], parts: ['upper', 'neck'] },
  ],
  cues: [{ tr: 'Eller hep havada', en: 'Hands off the floor', es: 'Manos siempre arriba' },
    { tr: 'Kürekleri sık', en: 'Squeeze the blades', es: 'Junta las escápulas' },
    { tr: 'Baş aşağıda', en: 'Keep your head down', es: 'Cabeza abajo' }],
};
}
