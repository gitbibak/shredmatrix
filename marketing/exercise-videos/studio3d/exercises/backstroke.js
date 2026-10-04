/* Backstroke on the long box (reformer, supine curl on the box, head toward the footbar end, straps in the hands).
 * - Body turned 180° (yaw) so the head points to the footbar end and the feet to the risers; camera yaw -90 shows the
 *   right side with the head on the left of the screen like the other reformer videos.
 * - Long box on the carriage, short end against the shoulder blocks (boxOffset 0.135, top = carriage top + 0.32).
 *   The sacrum / low back rest on the footbar end of the box (pelvis + waist contacts at box height), the upper back is
 *   curled off the edge (thoracic 30, neck 25).
 * - Carriage: follows the pelvis (cx = pelvis x - OFF, so the box stays under the low back). Ropes from the rear risers
 *   to the hands. Travel is prescribed from the spec (0 / 8 / 15 cm): a rope-length model (as in frog.js) would close
 *   the carriage on the circle because the hands come toward the risers, which contradicts the spec.
 * - Keys: start (knees in, elbows bent, hands above the eyes) -> reach (arms + legs to the ceiling) -> open (arms and
 *   legs open to carriage width and circle forward/down) -> start. */
(function () {
  const OFF = 0.26;                    // carriage centre = pelvis x - OFF
  const BOX_TOP = () => FB.REFORMER.top + 0.32;
  const carriage = (sol) => sol.J.pelvis[0] - OFF;
  const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };
  const G = () => [['pelvis', BOX_TOP()], ['waist', BOX_TOP() - 0.01]];
  const BASE = { yaw: 180, trunk: -90, lumbar: 4, thoracic: 30, neck: 25, flat: false, curl: 0.9 };
  const RISER = (sg) => [FB.REFORMER.x0 + 0.02, FB.REFORMER.top + 0.42, sg * FB.REFORMER.w / 2];

  // handles in the fists + ropes to the risers (body turned: the character's right hand is on the -z side)
  FB.PROPS._refStraps = (sol) => {
    const out = [], { V } = FB;
    for (const S of ['L', 'R']) {
      const h = sol.J['hand' + S], ax = sol.F.thorax[2];
      out.push({ t: 'cyl', a: V.add(h, V.mul(ax, -0.05)), b: V.add(h, V.mul(ax, 0.05)), r: 0.016, m: 'strapMat' });
      out.push({ t: 'tube', pts: [RISER(Math.sign(h[2]) || 1), h], r: 0.005, m: 'rope' });
    }
    return out;
  };
  const ropeLen = (sol) => (FB.V.len(FB.V.sub(RISER(Math.sign(sol.J.handR[2]) || 1), sol.J.handR)) + FB.V.len(FB.V.sub(RISER(Math.sign(sol.J.handL[2]) || 1), sol.J.handL))) / 2;
  const S0 = (q) => FB.solve(FB.expand(q), CTX);
  // world pelvis x for a given pos x (yaw 180 flips it): place the pelvis at OFF - travel (carriage closed at cx = 0)
  // carriage travel d (m, toward the risers) is prescribed per spec; the body rides with it
  function ride(p, d = 0) {
    const q = Object.assign({}, BASE, { ground: G() }, p);
    const px = (x) => S0(Object.assign({}, q, { pos: [x, 0, 0] })).J.pelvis[0];
    const a0 = px(0), a = px(1) - a0;
    return Object.assign(q, { pos: [(OFF - d - a0) / a, 0, 0], _travel: d });
  }

  const START = { hip: 118, knee: 120, ankle: -25, abd: 4, sh: 150, shAbd: 34, el: 105, palm: [0, 0, 1], elbowPole: [0.2, 0, 1] };
  const REACH = { hip: 90, knee: 0, ankle: -30, abd: -3, sh: 92, shAbd: 10, el: 2, palm: [0, 0, 1], elbowPole: [0.2, 0, 1] };
  const OPEN = { hip: 45, knee: 0, ankle: -30, abd: 28, sh: 40, shAbd: 50, el: 2, palm: [0, -0.3, 1], elbowPole: [0.2, 0, 1] };
  let P = null;
  const poses = () => {
    if (P) return P;
    return (P = { start: ride(START), reach: ride(REACH, 0.08), open: ride(OPEN, 0.15) });
  };

  window.EXERCISE = {
    id: 'backstroke',
    name: { tr: 'Backstroke (Uzun Kutuda)', en: 'Backstroke (Long Box)', es: 'Backstroke (caja larga)' },
    category: { tr: 'Reformer · Karın', en: 'Reformer · Core', es: 'Reformer · Core' },
    equipmentLabel: { tr: 'Reformer · uzun kutu · 1 kırmızı yay', en: 'Reformer · long box · 1 red spring', es: 'Reformer · caja larga · 1 muelle rojo' },
    muscles: ['core', 'obliques', 'delts', 'adductors'],
    tempo: '1.5-2-2',
    view: { yaw: -90, pitch: 12, zoom: 1.05 },
    alt: { yaw: -40, pitch: 24, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
      text: { tr: 'Kollar ve bacaklar kızak genişliğinde açılır', en: 'Arms and legs open to carriage width', es: 'Brazos y piernas se abren al ancho del carro' } },
    setupView: { yaw: -35, pitch: 22 },
    props: [['reformer', { springs: 1, carriage, footbar: false, box: 'long', boxOffset: 0.135 }], ['_refStraps', {}]],
    ctx: CTX,
    contacts: ['pelvis', 'waist', 'handL', 'handR'],
    get poses() { return poses(); },
    rest: 'start',
    rep: [
      { to: 'reach', dur: 1.5, phase: 0 },
      { to: 'open', dur: 2.0, phase: 1 },
      { to: 'start', dur: 2.0, phase: 2 },
    ],
    setup: { tr: 'Uzun kutuda sırtüstü, baş footbar tarafında. Kuyruk sokumu kutuda, baş ve omuzlar kıvrık, dizler göğüste.',
      en: 'Lie on the long box, head toward the footbar. Sacrum on the box, head and shoulders curled, knees to the chest.',
      es: 'Boca arriba en la caja larga, cabeza hacia la barra. Sacro en la caja, cabeza y hombros enrollados, rodillas al pecho.' },
    phases: [
      { name: { tr: 'Tavana uzan', en: 'Reach up', es: 'Alarga al techo' }, breath: 'in', slow: 1.4, line: ['shoulderR', 'handR'],
        text: { tr: 'Kollar ve bacaklar tavana düz uzar; kızak biraz açılır. Kıvrım sabit.', en: 'Arms and legs reach straight to the ceiling; the carriage opens a little. Curl held.', es: 'Brazos y piernas rectos al techo; el carro sale un poco. Curl firme.' } },
      { name: { tr: 'Aç ve daire çiz', en: 'Open and circle', es: 'Abre y circula' }, breath: 'out', slow: 1.3,
        text: { tr: 'Kollar ve bacaklar kızak genişliğinde açılıp öne iner.', en: 'Arms and legs open to carriage width and circle forward and down.', es: 'Brazos y piernas se abren al ancho del carro y bajan al frente.' } },
      { name: { tr: 'Topla ve bük', en: 'Close and fold', es: 'Junta y recoge' }, breath: 'in', slow: 1.3,
        text: { tr: 'Bacakları birleştir, dizleri ve dirsekleri bük. Kızağı kontrollü kapat.', en: 'Squeeze the legs together, bend knees and elbows. Close the carriage with control.', es: 'Junta las piernas, flexiona rodillas y codos. Cierra el carro con control.' } },
    ],
    tempoText: { tr: '1,5 sn uzan · 2 sn daire · 2 sn topla · 3-5 tekrar', en: '1.5 s reach · 2 s circle · 2 s fold · 3-5 reps', es: '1,5 s alarga · 2 s círculo · 2 s recoge · 3-5 repeticiones' },
    mistakes: [
      { title: { tr: 'Baş geriye düşüyor', en: 'Neck drops back', es: 'El cuello cae atrás' },
        fix: { tr: 'Çene içeride, kıvrım kalsın', en: 'Chin tucked, keep the curl', es: 'Barbilla adentro, mantén el curl' },
        fixText: { tr: 'Gerekirse daireyi küçült; bakış dizlerde', en: 'Make the circle smaller if needed; eyes on the knees', es: 'Haz el círculo más pequeño si hace falta; mirada a las rodillas' },
        at: 'reach', get pose() { return ride(Object.assign({}, REACH, { thoracic: 6, neck: -12 }), 0.08); },
        marks: ['head'], parts: ['neck', 'chest'] },
      { title: { tr: 'Bel kutudan kalkıyor', en: 'Low back arches off the box', es: 'La lumbar se despega de la caja' },
        fix: { tr: 'Bacakları yüksekte tut', en: 'Keep the legs higher', es: 'Piernas más altas' },
        fixText: { tr: 'Daire bel kutuda kalacak kadar aşağı insin', en: 'Circle only as low as the back stays on the box', es: 'Circula solo tan bajo como la lumbar aguante' },
        at: 'open', get pose() { return ride(Object.assign({}, OPEN, { hip: 18, lumbar: -12, thoracic: 22, ground: [['pelvis', BOX_TOP()], ['waist', BOX_TOP() + 0.03]] }), 0.15); },
        marks: ['waist'], parts: ['waist', 'pelvis'] },
    ],
    cues: [{ tr: 'Baş ve omuzlar kıvrık kalsın', en: 'Head and shoulders stay curled', es: 'Cabeza y hombros enrollados' },
      { tr: 'Bitişte bacaklar birleşir', en: 'Legs squeeze together on the finish', es: 'Piernas juntas al final' },
      { tr: 'Kızağı kontrol et', en: 'Control the carriage', es: 'Controla el carro' }],
  };
})();
