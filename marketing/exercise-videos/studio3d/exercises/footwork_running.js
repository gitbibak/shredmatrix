/* Running / Prances (reformer footwork, legs long, carriage out). footwork.js geometry, carriage on the shoulders.
 * REF = onBar() pose of the heel-down leg (knee 3, ankle +10, ball on the bar); its rail offset (pos x) is kept in every
 * pose, so the carriage stays out and still. onBall(): per leg, hip + knee are solved (damped Gauss-Newton) so the ball
 * stays on REF's bar point for the given ankle angle. Legs are FK (no ankle pins): interpolating the solved angles keeps
 * the ball within ~1 cm of the bar between keys (pins would move the ankle on a chord and lift the ball).
 * Geometry note: spec asks knees 3° on BOTH legs with ankles +10 / -60 and a still carriage. That is impossible: the
 * lifted heel moves the ankle ~11 cm closer to the bar, so that knee must bend. As in classical "running/prances",
 * the heel-down leg is long (knee 3) and the other knee bends (~45°) as its heel rises. */
(function () {
  const BAR_R = 0.022;
  const BLOCK = 0.245;
  const shX = (sol) => (sol.J.shoulderL[0] + sol.J.shoulderR[0]) / 2;
  const carriage = (sol) => shX(sol) + BLOCK;
  const G = () => [['shoulderR', FB.REFORMER.top], ['pelvis', FB.REFORMER.top]];
  const BASE = { trunk: -90, flat: false, neck: 10, sh: -13, shAbd: 10, el: 4, palm: 'down' };
  const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };

  function onBar(p) {
    const { solve, expand } = FB, R = FB.REFORMER;
    const bx = R.footbarX, by = R.top + R.footbarH;
    const q = Object.assign({}, BASE, { ground: G() }, p);
    const at = (h) => solve(expand(Object.assign({}, q, { hip: h })), CTX);
    const dy = (s) => s.J.ballR[1] - (by + BAR_R * s.F.footR[1][1]);
    let lo = -30, hi = 100;
    for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (dy(at(m)) > 0) hi = m; else lo = m; }
    const hip = (lo + hi) / 2, s = at(hip);
    const dx = bx + BAR_R * s.F.footR[1][0] - s.J.ballR[0];
    const pin = (k) => ({ at: [s.J['ankle' + k][0] + dx, s.J['ankle' + k][1], s.J['ankle' + k][2]], foot: s.F['foot' + k].map((c) => c.slice()) });
    return Object.assign(q, { hip, pos: [dx, 0, 0], ik: { ankleL: pin('L'), ankleR: pin('R') } });
  }

  let REF = null;
  const ref = () => REF || (REF = onBar({ knee: 3, ankle: 10 }));

  // hip/knee per leg so the ball stays on REF's bar point with the given ankle angles (carriage still)
  function onBall(extra, r0) {
    const { solve, expand } = FB;
    const r = r0 || ref(), dx = r.pos[0];
    const tgt = (k) => solve(expand(Object.assign({}, r, { ik: undefined, pos: [dx, 0, 0] })), CTX).J['ball' + k];
    const q = Object.assign({}, r, { ik: undefined }, extra);
        for (const k of ['L', 'R']) {
      const T = tgt(k);
      let x = [r.hip, r.knee];
      const S = (x) => solve(expand(Object.assign({}, q, { ['hip' + k]: x[0], ['knee' + k]: x[1] })), CTX);
      const f = (x) => { const b = S(x).J['ball' + k]; return [b[0] - T[0], b[1] - T[1]]; };
      for (let it = 0; it < 80; it++) {
        const f0 = f(x), e = 0.05;
        const fa = f([x[0] + e, x[1]]), fb = f([x[0], x[1] + e]);
        const J = [[(fa[0] - f0[0]) / e, (fb[0] - f0[0]) / e], [(fa[1] - f0[1]) / e, (fb[1] - f0[1]) / e]];
        const det = J[0][0] * J[1][1] - J[0][1] * J[1][0];
        if (Math.abs(det) < 1e-9) break;
        const d0 = (J[1][1] * f0[0] - J[0][1] * f0[1]) / det, d1 = (-J[1][0] * f0[0] + J[0][0] * f0[1]) / det;
        const c = Math.min(1, 6 / Math.max(Math.abs(d0), Math.abs(d1)));
        x = [x[0] - d0 * c, Math.max(0.5, x[1] - d1 * c)];
        if (Math.hypot(f0[0], f0[1]) < 1e-5) break;
      }
      q['hip' + k] = x[0]; q['knee' + k] = x[1];
    }
    // FK legs (no pins): interpolating the solved joint angles keeps the ball on the bar between keys (pinned ankles
    // would move on a straight chord and lift the ball off the bar while the heel swings)
    delete q.hip; delete q.knee; delete q.ankle; delete q.ik;
    return q;
  }

  window.EXERCISE = {
    id: 'footwork_running',
    name: { tr: 'Reformerda Koşu (Running)', en: 'Running (Footwork)', es: 'Correr (Running) en reformer' },
    category: { tr: 'Reformer · Bacak', en: 'Reformer · Legs', es: 'Reformer · Piernas' },
    equipmentLabel: { tr: 'Reformer · 3 yay', en: 'Reformer · 3 springs', es: 'Reformer · 3 muelles' },
    muscles: ['calves', 'quads', 'glutes', 'hamstrings'],
    tempo: '0.6-0.6',
    tempoReps: 6,
    repLabel: { tr: 'ADIM', en: 'STEP', es: 'PASO' },
    view: { yaw: 90, pitch: 10, zoom: 1.3, dx: -110 },
    alt: { yaw: 18, pitch: 22, zoom: 1.1, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
      text: { tr: 'Kızak sabit, pelvis sessiz', en: 'Carriage still, pelvis quiet', es: 'Carro quieto, pelvis quieta' } },
    setupView: { yaw: 40, pitch: 22 },
    props: [['reformer', { springs: 3, carriage }]],
    ctx: CTX,
    contacts: ['ballL', 'ballR', 'pelvis', 'shoulderL', 'shoulderR', 'head'],
    get poses() { return { R: onBall({ ankleL: -60, ankleR: 10 }), L: onBall({ ankleL: 10, ankleR: -60 }) }; },
    rest: 'R',
    rep: [
      { to: 'L', dur: 0.6, phase: 0 },
      { to: 'R', dur: 0.6, phase: 1 },
    ],
    setup: { tr: 'Footwork gibi it, kızak dışarıda kalsın. Ön tabanlar barda, bacaklar uzun. Bir topuk barın altında.',
      en: 'Press out as in footwork and keep the carriage out. Balls of the feet on the bar, legs long, one heel under the bar.',
      es: 'Empuja como en footwork y deja el carro fuera. Metatarsos en la barra, piernas largas, un talón bajo la barra.' },
    phases: [
      { name: { tr: 'Sol topuk aşağı', en: 'Left heel down', es: 'Talón izquierdo abajo' }, breath: 'easy', slow: 2.4,
        text: { tr: 'Sol topuk barın altına iner, sağ diz bükülüp topuk yükselir. Kızak sabit.', en: 'Left heel drops under the bar; the right knee bends, its heel rises. Carriage still.', es: 'El talón izquierdo baja; la rodilla derecha se flexiona y su talón sube. Carro quieto.' } },
      { name: { tr: 'Sağ topuk aşağı', en: 'Right heel down', es: 'Talón derecho abajo' }, breath: 'easy', slow: 2.4,
        text: { tr: 'Değiştir: sağ topuk aşağı, sol diz bükülür. Yerinde koşar gibi.', en: 'Switch: right heel down, left knee bends. Like running in place.', es: 'Cambia: talón derecho abajo, rodilla izquierda flexiona. Como correr en el sitio.' } },
    ],
    tempoText: { tr: 'Her adım 0,6 sn · 20-30 adım, ritmik nefes', en: '0.6 s per step · 20-30 steps, rhythmic breath', es: '0,6 s por paso · 20-30 pasos, respiración rítmica' },
    mistakes: [
      { title: { tr: 'İki diz bükülüyor, kızak kayıyor', en: 'Both knees bend, carriage bobs', es: 'Ambas rodillas flexionan, el carro se mueve' },
        fix: { tr: 'Bacaklar uzun, kızak sabit', en: 'Legs long, carriage still', es: 'Piernas largas, carro quieto' },
        fixText: { tr: 'Bara sürekli bas; topuğu inen bacak dümdüz', en: 'Keep pressing into the bar; the heel-down leg is straight', es: 'Presiona la barra; la pierna del talón abajo, recta' },
        at: 'L', get pose() { const r = onBar({ knee: 30, ankle: -35 }); return onBall({ ankleL: -35, ankleR: -35 }, r); },
        line: ['hipR', 'kneeR', 'ankleR'], marks: ['kneeR'], parts: ['thigh', 'shin'], view: { yaw: 90, pitch: 8, zoom: 1.45, dx: -150 } },
      { title: { tr: 'Pelvis sallanıyor', en: 'Pelvis rocks', es: 'La pelvis se balancea' },
        fix: { tr: 'Pelvis sessiz', en: 'Quiet pelvis', es: 'Pelvis quieta' },
        fixText: { tr: 'Kalçalar aynı yükseklikte; adımları küçült', en: 'Hips level; make the steps smaller', es: 'Caderas niveladas; pasos más pequeños' },
        at: 'L', get pose() { return Object.assign(onBall({ ankleL: 10, ankleR: -60, roll: -9 })); },
        line: ['hipL', 'hipR'], parts: ['pelvis', 'waist'], view: { yaw: 8, pitch: 30, zoom: 1.1 } },
    ],
    cues: [{ tr: 'Topuğu inen bacak uzun', en: 'Heel-down leg stays long', es: 'La pierna del talón abajo, larga' },
      { tr: 'Yerinde koşar gibi ritim', en: 'Rhythm like running in place', es: 'Ritmo como correr en el sitio' },
      { tr: 'Pelvis sessiz', en: 'Pelvis stays quiet', es: 'La pelvis quieta' }],
  };
})();
