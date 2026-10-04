/* Leg Circles in the straps (reformer, supine, both feet in the loops). frog.js strap template:
 * - _refStraps (local prop): padded loop around each foot arch + rope from the rear riser to the loop.
 * - ride(): the carriage rolls toward the risers by exactly as much as the riser-to-loop rope gets longer; the body
 *   (pos x) and the carriage (follows the shoulders) move together. Closed = legs vertical (start).
 * Circle: up (hip 90) -> down (hip 45) -> open (hip 55, abduction 17) -> up. Spec abduction 38 per leg would put the
 * feet 1.3 m apart; its "shoulder+ width circle" is used instead (feet ~0.7 m apart). The monotone spline through the
 * keys draws a smooth loop at the feet. One direction is animated; the reverse is said in the text.
 * Spec says the carriage stays closed (<1 cm) and lists "carriage opens" as a mistake: with taut straps the carriage
 * must roll out as the legs lower (rope gets longer), so this file shows that (smooth, controlled travel) and uses the
 * two visible forms of the spec's first mistake instead: low back arches, pelvis rocks. */
(function () {
  const BLOCK = 0.245;
  const shX = (sol) => (sol.J.shoulderL[0] + sol.J.shoulderR[0]) / 2;
  const carriage = (sol) => shX(sol) + BLOCK;
  const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };
  const G = () => [['shoulderR', FB.REFORMER.top], ['pelvis', FB.REFORMER.top]];
  const BASE = { trunk: -90, neck: 10, sh: -13, shAbd: 12, el: 4, palm: 'down', flat: false };
  const RISER = (sg) => [FB.REFORMER.x0 + 0.02, FB.REFORMER.top + 0.42, sg * FB.REFORMER.w / 2];

  // ---- strap loops + ropes (feet) ----
  const loopPts = (sol, S) => {
    const { V, M } = FB, F = sol.F['foot' + S], c = V.add(sol.J['ankle' + S], M.apply(F, [0.06, -0.035, 0]));
    const pts = []; for (let i = 0; i <= 18; i++) { const a = (i / 18) * 2 * Math.PI; pts.push(V.add(c, M.apply(F, [0, Math.cos(a) * 0.05, Math.sin(a) * 0.052]))); }
    return pts;
  };
  const ropeEnd = (sol, S) => { const r = RISER(S === 'R' ? 1 : -1); let best = null, bd = 1e9; for (const p of loopPts(sol, S)) { const d = FB.V.len(FB.V.sub(p, r)); if (d < bd) { bd = d; best = p; } } return best; };
  FB.PROPS._refStraps = (sol, o = {}) => {
    const out = [];
    for (const S of ['L', 'R']) {
      out.push({ t: 'tube', pts: loopPts(sol, S), r: 0.011, m: 'strapMat' });
      out.push({ t: 'tube', pts: [RISER(S === 'R' ? 1 : -1), ropeEnd(sol, S)], r: 0.005, m: 'rope' });
    }
    return out;
  };

  // ---- rope-driven carriage ----
  const ropeLen = (sol) => (FB.V.len(FB.V.sub(RISER(1), ropeEnd(sol, 'R'))) + FB.V.len(FB.V.sub(RISER(-1), ropeEnd(sol, 'L')))) / 2;
  const S0 = (q) => FB.solve(FB.expand(q), CTX);
  let REF = null;   // { dx0, L0 } from the start pose with the carriage closed
  function ride(p, ref) {
    const q = Object.assign({}, BASE, { ground: G() }, p);
    const s = S0(Object.assign({}, q, { pos: [0, 0, 0] }));
    const dx0 = -BLOCK - shX(s);
    if (!ref) { const s1 = S0(Object.assign({}, q, { pos: [dx0, 0, 0] })); REF = { dx0, L0: ropeLen(s1) }; return Object.assign(q, { pos: [dx0, 0, 0], _travel: 0 }); }
    let d = 0;
    for (let i = 0; i < 40; i++) { const sd = S0(Object.assign({}, q, { pos: [dx0 - d, 0, 0] })); d = Math.max(0, ropeLen(sd) - ref.L0); }
    return Object.assign(q, { pos: [dx0 - d, 0, 0], _travel: d });
  }

  const BASEL = { knee: 0, ankle: -30, hrot: 6 };
  let P = null;
  const poses = () => {
    if (P) return P;
    const up = ride(Object.assign({}, BASEL, { hip: 90, abd: -5 }));
    return (P = { up, down: ride(Object.assign({}, BASEL, { hip: 45, abd: -5 }), REF), open: ride(Object.assign({}, BASEL, { hip: 55, abd: 17, hrot: 12 }), REF) });
  };

  window.EXERCISE = {
    id: 'leg_circles_straps',
    name: { tr: 'Bacak Daireleri (Kayışlı)', en: 'Leg Circles (in Straps)', es: 'Círculos de pierna (con correas)' },
    category: { tr: 'Reformer · Kalça', en: 'Reformer · Hips', es: 'Reformer · Cadera' },
    equipmentLabel: { tr: 'Reformer · kayışlar · 1 kırmızı yay', en: 'Reformer · straps · 1 red spring', es: 'Reformer · correas · 1 muelle rojo' },
    muscles: ['adductors', 'glutes', 'core', 'hamstrings'],
    tempo: '2-2-2',
    view: { yaw: 90, pitch: 16, zoom: 1.05 },
    alt: { yaw: 10, pitch: 30, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
      text: { tr: 'Daire omuz genişliğinde, pelvis kıpırdamaz', en: 'Shoulder-width circle, the pelvis stays still', es: 'Círculo al ancho de hombros, pelvis quieta' } },
    setupView: { yaw: 35, pitch: 24 },
    props: [['reformer', { springs: 1, carriage, footbar: false }], ['_refStraps', {}]],
    ctx: CTX,
    contacts: ['pelvis', 'shoulderL', 'shoulderR', 'head', 'handL', 'handR'],
    get poses() { return poses(); },
    rest: 'up',
    rep: [
      { to: 'down', dur: 2.0, phase: 0 },
      { to: 'open', dur: 2.0, phase: 1 },
      { to: 'up', dur: 2.0, phase: 2 },
    ],
    setup: { tr: 'Sırtüstü, iki ayak kayış halkalarında, bacaklar tavana uzun. Kollar yanda kızağa basar.',
      en: 'On your back, both feet in the strap loops, legs long to the ceiling. Arms press down by your sides.',
      es: 'Boca arriba, ambos pies en las correas, piernas largas al techo. Brazos presionan el carro.' },
    phases: [
      { name: { tr: 'Aşağı indir', en: 'Lower', es: 'Baja' }, breath: 'in', line: ['pelvis', 'waist'],
        text: { tr: 'Bacaklar bitişik 45°ye iner; kızak kontrollü açılır. Bel minderde.', en: 'Legs together lower to 45°; the carriage opens with control. Low back down.', es: 'Piernas juntas bajan a 45°; el carro sale controlado. Lumbar abajo.' } },
      { name: { tr: 'Yana aç', en: 'Open', es: 'Abre' }, breath: 'out', line: ['hipL', 'hipR'],
        text: { tr: 'Bacaklar omuz genişliğinin biraz ötesine açılır, dizler uzun.', en: 'The legs open just wider than the shoulders, knees long.', es: 'Las piernas se abren algo más que los hombros, rodillas largas.' } },
      { name: { tr: 'Yukarı topla', en: 'Circle up', es: 'Sube y junta' }, breath: 'in',
        text: { tr: 'Daireyle yukarı çık, topukları birleştir. 5 tur, sonra ters yön.', en: 'Circle up and squeeze the heels together. 5 circles, then reverse.', es: 'Sube en círculo y junta los talones. 5 vueltas y al revés.' } },
    ],
    tempoText: { tr: 'Bir daire 6 sn · 3-5 tur, sonra ters yön', en: '6 s per circle · 3-5 circles, then reverse', es: '6 s por círculo · 3-5 vueltas y al revés' },
    mistakes: [
      { title: { tr: 'Bel kalkıyor', en: 'Low back arches', es: 'La lumbar se arquea' },
        fix: { tr: 'Daireyi küçült', en: 'Make the circle smaller', es: 'Haz el círculo más pequeño' },
        fixText: { tr: 'Bacakları bel minderde kalacak kadar indir', en: 'Lower the legs only as far as the back stays down', es: 'Baja solo hasta donde la lumbar aguante' },
        at: 'down', get pose() { return ride(Object.assign({}, BASEL, { hip: 24, abd: -5, lumbar: -14, ground: [['shoulderR', FB.REFORMER.top], ['pelvis', FB.REFORMER.top + 0.02]] }), REF); },
        marks: ['waist'], parts: ['waist', 'pelvis'], line: ['pelvis', 'waist'] },
      { title: { tr: 'Pelvis sallanıyor', en: 'Pelvis rocks', es: 'La pelvis se balancea' },
        fix: { tr: 'Pelvis sabit', en: 'Pelvis still', es: 'Pelvis quieta' },
        fixText: { tr: 'Kalçalar aynı yükseklikte; kollar kızağa bassın', en: 'Hips level; arms press into the carriage', es: 'Caderas niveladas; brazos presionan el carro' },
        at: 'open', get pose() { return ride(Object.assign({}, BASEL, { hip: 55, abd: 17, hrot: 12, abdR: 26, abdL: 8, roll: -10 }), REF); },
        line: ['hipL', 'hipR'], parts: ['pelvis'], view: { yaw: 10, pitch: 30 } },
    ],
    cues: [{ tr: 'Pelvis sabit', en: 'Pelvis still', es: 'Pelvis quieta' },
      { tr: 'Küçük ve kontrollü daire', en: 'Circle small and controlled', es: 'Círculo pequeño y controlado' },
      { tr: 'Kaburgalar aşağıda', en: 'Ribs knit down', es: 'Costillas abajo' }],
  };
})();
