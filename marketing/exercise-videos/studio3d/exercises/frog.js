/* Frog on the reformer (supine, feet in the strap loops, heels together, knees open). Strap template for the reformer batch.
 * - Straps: a local prop (_refStraps, registered on FB.PROPS from this file) draws a padded loop around each foot arch
 *   (foot frame) and the rope from the rear riser (frame x0 + 0.02, top + 0.42) to the point of the loop nearest the riser.
 * - Carriage: the ropes are tied to the carriage, so the carriage rolls toward the risers by exactly as much as the rope
 *   between riser and loop gets longer (|riser - loop| - L0 = travel). ride() solves that travel per pose (fixed-point)
 *   and shifts the body (pos x); the carriage follows the shoulders (blocks on the shoulders every frame).
 *   Closed carriage = the footwork start position (shoulders at x = -BLOCK).
 * - Spec says "carriage stays closed": physically impossible with taut straps (the legs press the rope ~14 cm longer);
 *   this file shows the real behaviour (carriage glides out on the press, returns on the bend) and says so in the text.
 * Angles: start hip 125 / knee 125 (spec); turn-out is split between hip rotation (16) and foot turn-out (26) so the heels
 * touch with the knees open (spec turn-out 45 + abduction 30 would cross the feet ~20 cm); press hip 55 / knee 0, legs together. */
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

  const FROG = { hip: 125, knee: 125, hrot: 16, abd: 28, ankle: 2, footOut: 26 };
  const PRESS = { hip: 55, knee: 0, hrot: 20, abd: -2, ankle: -8, footOut: 12 };
  let P = null;
  const poses = () => {
    if (P) return P;
    const start = ride(FROG);
    return (P = { frog: start, press: ride(PRESS, REF) });
  };

  window.EXERCISE = {
    id: 'frog',
    name: { tr: 'Frog (Kurbağa)', en: 'Frog', es: 'Rana (Frog)' },
    category: { tr: 'Reformer · Kalça', en: 'Reformer · Hips', es: 'Reformer · Cadera' },
    equipmentLabel: { tr: 'Reformer · kayışlar · 2 hafif yay', en: 'Reformer · straps · 2 light springs', es: 'Reformer · correas · 2 muelles suaves' },
    muscles: ['glutes', 'adductors', 'hamstrings', 'core'],
    tempo: '2-2',
    view: { yaw: 45, pitch: 22, zoom: 1.08 },
    alt: { yaw: 90, pitch: 10, zoom: 1.1, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
      text: { tr: 'Bacaklar çapraza uzar, pelvis yerinde', en: 'Legs press out on a diagonal, pelvis still', es: 'Piernas en diagonal, pelvis quieta' } },
    setupView: { yaw: 25, pitch: 28 },
    props: [['reformer', { springs: 2, carriage, footbar: false }], ['_refStraps', {}]],
    ctx: CTX,
    contacts: ['pelvis', 'shoulderL', 'shoulderR', 'head', 'heelL', 'heelR'],
    get poses() { return poses(); },
    rest: 'frog',
    rep: [
      { to: 'press', dur: 2.0, phase: 0 },
      { to: 'frog', dur: 2.0, phase: 1 },
    ],
    setup: { tr: 'Sırtüstü, ayaklar kayış halkalarında. Topuklar bitişik, parmaklar dışa, dizler açık.',
      en: 'On your back, feet in the strap loops. Heels together, toes turned out, knees open.',
      es: 'Boca arriba, pies en las correas. Talones juntos, puntas hacia fuera, rodillas abiertas.' },
    phases: [
      { name: { tr: 'Çapraza it', en: 'Press out', es: 'Empuja' }, breath: 'out', slow: 1.3, line: ['hipR', 'kneeR', 'ankleR'],
        text: { tr: 'Topuklar bitişik, bacakları çapraza uzat. Kayışlar gerilir, kızak açılır.', en: 'Heels together, press the legs out on a diagonal. The straps pull the carriage out.', es: 'Talones juntos, estira en diagonal. Las correas sacan el carro.' } },
      { name: { tr: 'Kurbağaya dön', en: 'Back to frog', es: 'Vuelve a la rana' }, breath: 'in', slow: 1.3, arc: ['hipR', 'kneeR', 'ankleR'],
        text: { tr: 'Dizleri yana açarak bük; kızak yavaşça kapanır. Pelvis sabit.', en: 'Bend the knees open to the sides; the carriage closes slowly. Pelvis still.', es: 'Flexiona abriendo las rodillas; el carro se cierra despacio. Pelvis quieta.' } },
    ],
    tempoText: { tr: '2 sn it · 2 sn dön · 5-8 tekrar', en: '2 s press · 2 s return · 5-8 reps', es: '2 s empuja · 2 s vuelve · 5-8 repeticiones' },
    mistakes: [
      { title: { tr: 'Pelvis kalkıyor', en: 'Pelvis lifts', es: 'La pelvis se eleva' },
        fix: { tr: 'Pelvis minderde', en: 'Pelvis stays down', es: 'Pelvis abajo' },
        fixText: { tr: 'Kuyruk sokumu kıvrılmasın; dizleri bu kadar çekme', en: 'Don’t curl the tailbone; don’t pull the knees in so far', es: 'No enrolles el cóccix; no traigas tanto las rodillas' },
        at: 'frog', get pose() { const p = poses().frog; return Object.assign({}, p, { hip: 138, knee: 128, lumbar: 24, ground: [['shoulderR', FB.REFORMER.top], ['pelvis', FB.REFORMER.top + 0.05]] }); },
        marks: ['pelvis'], parts: ['pelvis', 'waist'], view: { yaw: 90, pitch: 10, zoom: 1.25, dx: -40 } },
      { title: { tr: 'Bacaklar çok alçak, bel kalkıyor', en: 'Legs too low, back arches', es: 'Piernas muy bajas, la espalda se arquea' },
        fix: { tr: 'Bacakları yükselt', en: 'Raise the legs', es: 'Sube las piernas' },
        fixText: { tr: 'Bel minderde kalacak açıda uzat', en: 'Press only as low as the back stays down', es: 'Solo tan bajo como la lumbar aguante' },
        at: 'press', get pose() { return ride(Object.assign({}, PRESS, { hip: 26, lumbar: -14, ground: [['shoulderR', FB.REFORMER.top], ['pelvis', FB.REFORMER.top + 0.02]] }), REF); },
        marks: ['waist'], parts: ['waist', 'pelvis'], line: ['pelvis', 'waist'], view: { yaw: 90, pitch: 10, zoom: 1.25, dx: -40 } },
    ],
    cues: [{ tr: 'Topuklar bitişik', en: 'Heels together', es: 'Talones juntos' },
      { tr: 'Pelvis minderde sabit', en: 'Pelvis anchored', es: 'Pelvis anclada' },
      { tr: 'Bacaklar yukarı değil, çapraza', en: 'Press out, not up', es: 'Empuja en diagonal, no hacia arriba' }],
  };
})();
