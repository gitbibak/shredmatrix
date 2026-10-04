/* Prone floor lat pull. Lying face down (same prone base as prone_w_isometric.js: pelvis + toes on the mat, trunk 82 so the
 * thicker chest rests on the mat, chin slightly tucked). Arm angles in the prone thorax frame: shAbd from "toward the feet",
 * sh sign lifts/lowers the arm (see prone_w_isometric.js). Overhead V (shAbd 150) -> elbows to the ribs (shAbd 60, elbow 100),
 * forearms toward the head (bend [0,1,0]); hands float above the mat the whole time. */
{
const PRONE = { trunk: 82, hip: -8, knee: 0, ankle: -35, flat: false, abd: 3, neck: 10, bend: [0, 1, 0], palm: 'down', curl: 0.2,
  ground: [['pelvis', 0.012], ['toeR', 0.012]] };

window.EXERCISE = {
  id: 'prone_lat_pull',
  name: { tr: 'Yüzüstü Lat Çekiş', en: 'Prone Floor Lat Pull', es: 'Jalón dorsal en prono (suelo)' },
  category: { tr: 'Sırt', en: 'Back', es: 'Espalda' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['lats', 'upperback'],
  tempo: '1.5-1-2',
  view: { yaw: 90, pitch: 12, zoom: 1.15 },
  alt: { yaw: 25, pitch: 48, title: { tr: 'Üstten bak', en: 'Top view', es: 'Vista superior' },
    text: { tr: 'Geniş V’den dirsekler kaburgalara', en: 'From a wide V, elbows to the ribs', es: 'De una V amplia, codos a las costillas' } },
  setupView: { yaw: 30, pitch: 45 },
  props: [['mat', { at: [-0.25, 0.006, 0], length: 2.1, width: 0.7 }]],
  ctx: { anchorX: ['pelvis'], anchorAt: [-0.2, 0] },
  contacts: ['chest', 'pelvis', 'toeL', 'toeR'],
  poses: {
    // arms overhead in a wide V, floating ~10 cm above the mat, palms down
    reach: { ...PRONE, shAbd: 150, sh: -19, el: 5, thoracic: -3, protract: 0.01 },
    // elbows pulled down to the ribs, hands beside the shoulders, chest slightly up, blades down and back
    pull: { ...PRONE, shAbd: 52, sh: 4, el: 100, thoracic: -8, neck: 10, protract: -0.03 },
  },
  rest: 'reach',
  rep: [
    { to: 'pull', dur: 1.5, phase: 0 },
    { to: 'pull', dur: 1.0, phase: 1 },
    { to: 'reach', dur: 2.0, phase: 2 },
  ],
  setup: { tr: 'Yüzüstü yat, kolları başının üstünde geniş V aç. Eller minderin biraz üstünde, avuçlar aşağı.',
    en: 'Lie face down, arms overhead in a wide V. Hands just above the mat, palms down.',
    es: 'Boca abajo, brazos sobre la cabeza en una V amplia. Manos un poco sobre la esterilla.' },
  phases: [
    { name: { tr: 'Çek', en: 'Pull', es: 'Tira' }, breath: 'out',
      text: { tr: 'Dirsekleri kaburgalara doğru çek, göğüs hafifçe kalkar. Eller omuz hizasına gelir.', en: 'Pull the elbows to your ribs, chest lifts slightly. Hands end by the shoulders.', es: 'Lleva los codos a las costillas, el pecho sube un poco. Manos junto a los hombros.' } },
    { name: { tr: 'Sık', en: 'Squeeze', es: 'Aprieta' }, breath: 'hold', marks: [{ type: 'mark', joint: 'elbowR' }],
      text: { tr: 'Kürekler aşağı ve geriye. Kollar minderden yukarıda.', en: 'Blades down and back. Arms off the mat.', es: 'Escápulas abajo y atrás. Brazos sin tocar la esterilla.' } },
    { name: { tr: 'Yavaş uzat', en: 'Reach back out', es: 'Estira despacio' }, breath: 'in',
      text: { tr: 'İki saniyede kolları başın üstüne uzat, eller havada kalsın.', en: 'Two seconds back overhead; keep the hands floating.', es: 'Dos segundos de vuelta arriba; manos en el aire.' } },
  ],
  tempoText: { tr: '1,5 sn çek · 1 sn sık · 2 sn uzat', en: '1.5 s pull · 1 s squeeze · 2 s reach', es: '1,5 s tira · 1 s aprieta · 2 s estira' },
  mistakes: [
    { title: { tr: 'Bel aşırı çukurlaşıyor', en: 'Over-arching the low back', es: 'Arquear de más la lumbar' },
      fix: { tr: 'Göğüs sadece biraz kalkar', en: 'Lift the chest only a little', es: 'Sube el pecho solo un poco' },
      fixText: { tr: 'Karın ve kalçayı sık; kalkış üst sırttan', en: 'Brace abs and glutes; the lift comes from the upper back', es: 'Abdomen y glúteos firmes; eleva desde la espalda alta' },
      at: 'pull', pose: { thoracic: -13, lumbar: -8, neck: -14 },
      line: ['pelvis', 'waist', 'neck', 'head'], goodLine: ['pelvis', 'neck'], parts: ['waist', 'neck'] },
    { title: { tr: 'Omuzlar kulağa kalkıyor', en: 'Shrugging', es: 'Encoger los hombros' },
      fix: { tr: 'Önce kürekleri indir', en: 'Set the blades down first', es: 'Primero baja las escápulas' },
      fixText: { tr: 'Boyun uzun, omuzlar kulaktan uzak', en: 'Long neck, shoulders away from the ears', es: 'Cuello largo, hombros lejos de las orejas' },
      at: 'pull', pose: { shrug: 0.06, protract: 0.01 }, view: { yaw: 25, pitch: 48 }, marks: ['shoulderL', 'shoulderR'], parts: ['upper', 'neck'] },
  ],
  cues: [{ tr: 'Dirsekler kaburgalara', en: 'Elbows to your ribs', es: 'Codos a las costillas' },
    { tr: 'Göğüs hafif yukarı, çene içeride', en: 'Chest slightly up, chin tucked', es: 'Pecho un poco arriba, barbilla adentro' },
    { tr: 'Kürekler aşağı ve geriye', en: 'Blades down and back', es: 'Escápulas abajo y atrás' }],
};
}
