/* Bent-over dumbbell reverse fly. Hinge ~70°, feet planted, neutral grip. FK arms: sh 70 = arms hanging vertically
 * (relative to the 70° trunk); shAbd sweeps them out to the sides in the vertical plane across the shoulders, ending in a T.
 * Spec note: hip 90° + knee 25° with trunk 70° would tilt the shins backwards; the hip is 100° so the shins tilt ~5° forward. */
{
const { V } = FB;
// dumbbells with a true neutral grip through the whole arc: the elbow bends toward the midline/floor (bendL/R) and the
// palm faces that way too, so the handle stays along the body (thumbs toward the head) from hang to T
FB.PROPS._flyDumbbells = (sol) => {
  const out = [];
  sol.grip = {}; sol.gripKind = 'supinated';
  for (const s of ['L', 'R']) {
    const A = sol.F['arm' + s], ax = V.norm(V.cross(A.fd, A.b)), c = sol.J['hand' + s];
    out.push({ t: 'cyl', a: V.add(c, V.mul(ax, -0.08)), b: V.add(c, V.mul(ax, 0.08)), r: 0.015, m: 'chrome' });
    for (const k of [-1, 1]) out.push({ t: 'cyl', a: V.add(c, V.mul(ax, k * 0.08)), b: V.add(c, V.mul(ax, k * 0.15)), r: 0.052, m: 'iron', seg: 6 });
    sol.grip[s] = ax;
  }
  return out;
};
const HG = { trunk: 70, hip: 100, knee: 25, abd: 7, hrot: 8, neck: 4, el: 16, sh: 70, bendR: [1, 0, -1], bendL: [1, 0, 1] };

window.EXERCISE = {
  id: 'reverse_fly',
  name: { tr: 'Bent-Over Reverse Fly (Arka Omuz)', en: 'Bent-Over Dumbbell Reverse Fly', es: 'Vuelos posteriores inclinados' },
  category: { tr: 'Omuz · Sırt', en: 'Shoulders · Back', es: 'Hombros · Espalda' },
  equipmentLabel: { tr: 'Dambıl', en: 'Dumbbells', es: 'Mancuernas' },
  muscles: ['delts', 'upperback'],
  tempo: '1-0.5-2',
  view: { yaw: 14, pitch: 8 },
  alt: { yaw: 85, pitch: 6, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
    text: { tr: 'Sırt düz, gövde açısı hiç değişmez', en: 'Flat back, the torso angle never changes', es: 'Espalda recta, el ángulo del torso no cambia' } },
  setupView: { yaw: 60, pitch: 10 },
  setupMarks: [{ type: 'aline', joints: ['pelvis', 'neck'] }],
  props: [['_flyDumbbells']],
  ctx: { anchorX: ['ankleL', 'ankleR'], plant: ['ankleL', 'ankleR'] },
  poses: {
    // hinged, flat back, arms hanging under the chest, soft elbows, palms facing
    hang: { ...HG, shAbd: 4, protract: 0.02 },
    // arms out to the sides in a T with the torso, elbows leading, blades squeezed
    top: { ...HG, el: 20, shAbd: 86, protract: -0.03 },
  },
  rest: 'hang',
  rep: [
    { to: 'top', dur: 1.3, phase: 0 },
    { to: 'top', dur: 0.5, phase: 1 },
    { to: 'hang', dur: 2.0, phase: 2 },
  ],
  setup: { tr: 'Kalçadan öne katlan, gövde yere neredeyse paralel. Sırt düz, dambıllar göğsün altında, avuçlar karşılıklı.',
    en: 'Hinge until the torso is nearly parallel to the floor. Flat back, dumbbells under the chest, palms facing.',
    es: 'Inclínate desde la cadera, torso casi paralelo al suelo. Espalda recta, mancuernas bajo el pecho.' },
  phases: [
    { name: { tr: 'Aç', en: 'Raise', es: 'Abre' }, breath: 'out',
      text: { tr: 'Kolları yanlara, yay çizerek kaldır. Dirsekler önde gider.', en: 'Raise the arms out to the sides in an arc, elbows leading.', es: 'Abre los brazos en arco hacia los lados, codos primero.' } },
    { name: { tr: 'Sık', en: 'Squeeze', es: 'Aprieta' }, breath: 'hold', aline: true, line: ['handL', 'shoulderL', 'shoulderR', 'handR'],
      text: { tr: 'Kollar gövdeyle T şekli yapar. Kürekleri sık.', en: 'Arms form a T with the torso. Squeeze the shoulder blades.', es: 'Brazos en T con el torso. Junta las escápulas.' } },
    { name: { tr: 'Yavaş indir', en: 'Lower slowly', es: 'Baja despacio' }, breath: 'in',
      text: { tr: 'İki saniyede aynı yaydan indir.', en: 'Take two seconds down along the same arc.', es: 'Dos segundos de bajada por el mismo arco.' } },
  ],
  tempoText: { tr: '1 sn aç · 0,5 sn sık · 2 sn indir', en: '1 s up · 0.5 s squeeze · 2 s down', es: '1 s arriba · 0,5 s aprieta · 2 s abajo' },
  mistakes: [
    { title: { tr: 'Gövdeyle sallanmak', en: 'Rocking the torso', es: 'Balancear el torso' },
      fix: { tr: 'Gövde sabit', en: 'Keep the torso still', es: 'Torso quieto' },
      fixText: { tr: 'Daha hafif dambıl, karın sıkı; sadece kollar hareket eder', en: 'Lighter weights, brace; only the arms move', es: 'Menos peso, abdomen firme; solo se mueven los brazos' },
      at: 'top', pose: { trunk: 46, hip: 76, neck: -6 }, view: { yaw: 58, pitch: 8 }, line: ['pelvis', 'neck'], parts: ['waist', 'chest'] },
    { title: { tr: 'Dambılları kürek çeker gibi çekmek', en: 'Rowing the dumbbells', es: 'Remar con las mancuernas' },
      fix: { tr: 'Dirsekler neredeyse düz', en: 'Elbows nearly straight', es: 'Codos casi rectos' },
      fixText: { tr: 'Kollar geniş bir yay çizer, eller kaburgaya gelmez', en: 'Arms sweep wide; hands never come to the ribs', es: 'Brazos en arco amplio; las manos no van a las costillas' },
      at: 'top', pose: { sh: 40, shAbd: 50, el: 92 }, marks: ['elbowL', 'elbowR'], parts: ['upper', 'fore'] },
  ],
  cues: [{ tr: 'Kalçadan katlan, sırt düz', en: 'Hinge, flat back', es: 'Bisagra, espalda recta' },
    { tr: 'Dirsekler önde', en: 'Lead with the elbows', es: 'Codos primero' },
    { tr: 'Kanat gibi aç', en: 'Open like wings', es: 'Abre como alas' }],
};
}
