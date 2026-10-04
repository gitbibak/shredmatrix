/* Coordination (reformer, supine curl-up, straps in the hands). frog.js strap template with handles:
 * - _refStraps (local prop): padded handle in each fist + rope from the rear riser to the hand.
 * - ride(): the carriage rolls toward the risers as much as the riser-to-hand rope gets longer (arms 90 -> 70 lengthen
 *   it ~7 cm: "strap pulls carriage slightly out", spec); body and carriage (follows the shoulders) move together.
 *   Closed = start pose with the shoulders at the footwork position. In the curl-up the shoulders lift off the blocks
 *   (blocks stay at the shoulder line).
 * - Curl held in every pose (pelvis + waist contacts as in the_hundred.js, thoracic 32, neck 26).
 * Angles per spec: start hip 90 / knee 90, shoulder 90, elbow 0; extend hip 55 / knee 0, shoulder 70. */
(function () {
  const BLOCK = 0.245;
  const shX = (sol) => (sol.J.shoulderL[0] + sol.J.shoulderR[0]) / 2;
  const carriage = (sol) => shX(sol) + BLOCK;
  const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };
  // curl-up on the carriage (the_hundred.js contacts): pelvis + low back on the pad, head and shoulder blades lifted
  const G = () => [['pelvis', FB.REFORMER.top], ['waist', FB.REFORMER.top - 0.02]];
  const BASE = { trunk: -90, lumbar: 4, thoracic: 32, neck: 26, palm: [0, -1, 0], curl: 0.9, flat: false, abd: 2 };
  const RISER = (sg) => [FB.REFORMER.x0 + 0.02, FB.REFORMER.top + 0.42, sg * FB.REFORMER.w / 2];

  // ---- strap handles + ropes (hands) ----
  FB.PROPS._refStraps = (sol, o = {}) => {
    const out = [], { V } = FB;
    for (const S of ['L', 'R']) {
      // padded handle in the fist (across the palm) + short loop strap + rope to the riser
      const h = sol.J['hand' + S], ax = sol.F.thorax[2], sg = S === 'R' ? 1 : -1;
      out.push({ t: 'cyl', a: V.add(h, V.mul(ax, -0.05)), b: V.add(h, V.mul(ax, 0.05)), r: 0.016, m: 'strapMat' });
      out.push({ t: 'tube', pts: [RISER(sg), h], r: 0.005, m: 'rope' });
    }
    return out;
  };

  // ---- rope-driven carriage ----
  const ropeLen = (sol) => (FB.V.len(FB.V.sub(RISER(1), sol.J.handR)) + FB.V.len(FB.V.sub(RISER(-1), sol.J.handL))) / 2;
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

  const START = { hip: 90, knee: 90, ankle: -20, sh: 90, shAbd: 8, el: 2 };
  const EXT = { hip: 55, knee: 0, ankle: -30, sh: 70, shAbd: 8, el: 2 };
  let P = null;
  const poses = () => {
    if (P) return P;
    const s = ride(START);
    return (P = { start: s, extend: ride(EXT, REF) });
  };

  window.EXERCISE = {
    id: 'coordination',
    name: { tr: 'Coordination (Koordinasyon)', en: 'Coordination', es: 'Coordinación' },
    category: { tr: 'Reformer · Karın', en: 'Reformer · Core', es: 'Reformer · Core' },
    equipmentLabel: { tr: 'Reformer · kayışlar · 1 kırmızı + 1 mavi yay', en: 'Reformer · straps · 1 red + 1 blue spring', es: 'Reformer · correas · 1 rojo + 1 azul' },
    muscles: ['core', 'obliques', 'lats', 'quads'],
    tempo: '2-2',
    view: { yaw: 90, pitch: 10, zoom: 1.05 },
    alt: { yaw: 40, pitch: 22, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
      text: { tr: 'Kollar ve bacaklar birlikte uzar', en: 'Arms and legs reach together', es: 'Brazos y piernas se alargan juntos' } },
    setupView: { yaw: 35, pitch: 22 },
    props: [['reformer', { springs: 2, carriage, footbar: false }], ['_refStraps', {}]],
    ctx: CTX,
    contacts: ['pelvis', 'waist', 'handL', 'handR'],
    get poses() { return poses(); },
    rest: 'start',
    rep: [
      { to: 'extend', dur: 2.0, phase: 0 },
      { to: 'start', dur: 2.0, phase: 1 },
    ],
    setup: { tr: 'Sırtüstü, baş ve kürek kemikleri kalkık. Bacaklar masada, kayış tutamakları elde, kollar tavana.',
      en: 'On your back, head and shoulder blades lifted. Legs in tabletop, strap handles in the hands, arms to the ceiling.',
      es: 'Boca arriba, cabeza y escápulas elevadas. Piernas en mesa, asas en las manos, brazos al techo.' },
    phases: [
      { name: { tr: 'Birlikte uzan', en: 'Reach out together', es: 'Alarga a la vez' }, breath: 'out', slow: 1.3, line: ['hipR', 'kneeR', 'ankleR'],
        text: { tr: 'Bacaklar çapraza, kollar aşağı uzar; kayış kızağı biraz açar. Kıvrım sabit.', en: 'Legs reach on a diagonal, arms lower; the straps open the carriage a little. Curl held.', es: 'Piernas en diagonal, brazos bajan; las correas abren un poco el carro. Curl firme.' } },
      { name: { tr: 'Masaya dön', en: 'Back to tabletop', es: 'Vuelve a mesa' }, breath: 'in', slow: 1.3, arc: ['hipR', 'kneeR', 'ankleR'],
        text: { tr: 'Dizleri bük, kollar tavana döner. Baş ve omuzlar kalkık kalır.', en: 'Bend the knees, arms return to the ceiling. Head and shoulders stay lifted.', es: 'Flexiona las rodillas, brazos al techo. Cabeza y hombros arriba.' } },
    ],
    tempoText: { tr: '2 sn uzan · 2 sn dön · 5-8 tekrar', en: '2 s reach · 2 s return · 5-8 reps', es: '2 s alarga · 2 s vuelve · 5-8 repeticiones' },
    mistakes: [
      { title: { tr: 'Baş geriye düşüyor', en: 'Head drops', es: 'La cabeza cae' },
        fix: { tr: 'Kıvrımı koru', en: 'Hold the curl', es: 'Mantén el curl' },
        fixText: { tr: 'Bakış dizlerde; yorulunca bacakları yükselt', en: 'Eyes on the knees; raise the legs when you tire', es: 'Mirada a las rodillas; sube las piernas si te cansas' },
        at: 'extend', get pose() { return ride(Object.assign({}, EXT, { thoracic: 6, neck: -4 }), REF); },
        marks: ['head'], parts: ['neck', 'chest'] },
      { title: { tr: 'Bel kalkıyor', en: 'Low back arches', es: 'La lumbar se arquea' },
        fix: { tr: 'Bacakları yükselt', en: 'Raise the legs', es: 'Sube las piernas' },
        fixText: { tr: 'Bel minderde kalacak kadar indir', en: 'Lower them only as far as the back stays down', es: 'Bájalas solo hasta donde la lumbar aguante' },
        at: 'extend', get pose() { return ride(Object.assign({}, EXT, { hip: 30, lumbar: -10, thoracic: 26, ground: [['pelvis', FB.REFORMER.top], ['waist', FB.REFORMER.top + 0.03]] }), REF); },
        marks: ['waist'], parts: ['waist', 'pelvis'] },
    ],
    cues: [{ tr: 'Kıvrım hep kalkık', en: 'Curl stays lifted', es: 'El curl siempre arriba' },
      { tr: 'Kollar ve bacaklar birlikte', en: 'Arms and legs move together', es: 'Brazos y piernas a la vez' },
      { tr: 'Bel minderde', en: 'Low back on the pad', es: 'Lumbar en el carro' }],
  };
})();
