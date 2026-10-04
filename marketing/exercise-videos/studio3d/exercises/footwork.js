/* Reformer footwork (parallel, balls of the feet on the bar) = template for the reformer batch.
 * Feet on the footbar: every key pose goes through onBar(), which (at build time, once the rig has set FB.BODY)
 *  - solves the hip angle so the ball of the foot rests on the bar (bar radius included),
 *  - shifts the body along the rail (pos x) so the ball sits on the bar's near side,
 *  - pins both ankles there with pose.ik (position + foot frame). Between keys the pins interpolate along a ~3 mm chord,
 *    so the feet never leave the bar while the ankle angle changes (heels stay high).
 * The carriage follows the shoulders, so the shoulder blocks stay on the shoulders in every frame. */
(function () {
  const BAR_R = 0.022;
  // block face at the top of the shoulder: carriage centre = shoulder x + BLOCK (prop: blocks at cx - 0.33, 8 cm deep)
  const BLOCK = 0.245;
  const shX = (sol) => (sol.J.shoulderL[0] + sol.J.shoulderR[0]) / 2;
  const carriage = (sol) => shX(sol) + BLOCK;
  const G = () => [['shoulderR', FB.REFORMER.top], ['pelvis', FB.REFORMER.top]];
  const BASE = { trunk: -90, flat: false, neck: 10, sh: -13, shAbd: 10, el: 4 };

  function onBar(p) {
    const { solve, expand } = FB, R = FB.REFORMER;
    const bx = R.footbarX, by = R.top + R.footbarH;
    const ctx = { anchorX: ['pelvis'], anchorAt: [0, 0] };
    const q = Object.assign({}, BASE, { ground: G() }, p);
    const at = (h) => solve(expand(Object.assign({}, q, { hip: h })), ctx);
    const dy = (s) => s.J.ballR[1] - (by + BAR_R * s.F.footR[1][1]);
    let lo = -30, hi = 100;
    for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (dy(at(m)) > 0) hi = m; else lo = m; }
    const hip = (lo + hi) / 2, s = at(hip);
    const dx = bx + BAR_R * s.F.footR[1][0] - s.J.ballR[0];
    const pin = (k) => ({ at: [s.J['ankle' + k][0] + dx, s.J['ankle' + k][1], s.J['ankle' + k][2]], foot: s.F['foot' + k].map((c) => c.slice()) });
    return Object.assign(q, { hip, pos: [dx, 0, 0], ik: { ankleL: pin('L'), ankleR: pin('R') } });
  }

  const START = { knee: 102, ankle: -28 };
  const PRESS = { knee: 4, ankle: -46 };

  window.EXERCISE = {
    id: 'footwork',
    name: { tr: 'Reformer Footwork', en: 'Reformer Footwork', es: 'Footwork en reformer' },
    category: { tr: 'Reformer · Bacak', en: 'Reformer · Legs', es: 'Reformer · Piernas' },
    equipmentLabel: { tr: 'Reformer · 3 yay', en: 'Reformer · 3 springs', es: 'Reformer · 3 muelles' },
    muscles: ['quads', 'glutes', 'hamstrings', 'calves', 'core'],
    tempo: '3-0.5-3',
    view: { yaw: 90, pitch: 10, zoom: 1.22, dx: -60 },
    alt: { yaw: 35, pitch: 18, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
      text: { tr: 'Dizler 2. parmak hizasında, ayaklar paralel', en: 'Knees over the 2nd toe, feet parallel', es: 'Rodillas sobre el 2.º dedo, pies paralelos' } },
    setupView: { yaw: 40, pitch: 22 },
    props: [
      ['reformer', { springs: 3, carriage }],
    ],
    ctx: { anchorX: ['pelvis'], anchorAt: [0, 0] },
    contacts: ['ballL', 'ballR', 'pelvis', 'shoulderL', 'shoulderR', 'head'],
    get poses() { return { start: onBar(START), press: onBar(PRESS) }; },
    rest: 'start',
    rep: [
      { to: 'press', dur: 3.0, phase: 0 },
      { to: 'press', dur: 0.5, phase: 1 },
      { to: 'start', dur: 3.0, phase: 2 },
    ],
    setup: { tr: 'Sırtüstü uzan, omuzlar bloklara yaslı. Ayakların ön tabanı barda, topuklar yukarıda.',
      en: 'Lie on your back, shoulders against the blocks. Balls of the feet on the bar, heels lifted.',
      es: 'Boca arriba, hombros contra los topes. Metatarsos en la barra, talones elevados.' },
    phases: [
      { name: { tr: 'İt', en: 'Press out', es: 'Empuja' }, breath: 'out', slow: 1.1,
        text: { tr: 'Bacakları uzatarak barı it; kızak geriye kayar, pelvis yerinde kalır.', en: 'Straighten the legs to push the bar away; the carriage slides, the pelvis stays still.', es: 'Estira las piernas empujando la barra; el carro se desliza y la pelvis no se mueve.' } },
      { name: { tr: 'Uzun dur', en: 'Hold long', es: 'Mantén' }, breath: 'hold', line: ['hipR', 'kneeR', 'ankleR'],
        text: { tr: 'Bacaklar uzun ama dizler kilitli değil. Topuklar aynı yükseklikte.', en: 'Legs long, knees not locked. Heels stay at the same height.', es: 'Piernas largas, rodillas sin bloquear. Talones a la misma altura.' } },
      { name: { tr: 'Kontrollü dön', en: 'Return slowly', es: 'Vuelve despacio' }, breath: 'in', slow: 1.1, arc: ['hipR', 'kneeR', 'ankleR'],
        text: { tr: 'Yaylara direnerek dizleri bük; kızak çarpmadan, sessizce kapansın.', en: 'Resist the springs as you bend; let the carriage close quietly.', es: 'Resiste los muelles al flexionar; el carro se cierra sin golpe.' } },
    ],
    tempoText: { tr: '3 sn it · 0,5 sn dur · 3 sn dön', en: '3 s press · 0.5 s hold · 3 s return', es: '3 s empuja · 0,5 s pausa · 3 s vuelve' },
    mistakes: [
      { title: { tr: 'Dizler kilitleniyor', en: 'Knees lock', es: 'Rodillas bloqueadas' },
        fix: { tr: 'Dizleri yumuşak tut', en: 'Keep the knees soft', es: 'Rodillas suaves' },
        fixText: { tr: 'Tam kilitlenmeden 3-5° önce dur', en: 'Stop 3-5° short of locking', es: 'Para 3-5° antes de bloquear' },
        at: 'press', get pose() { return onBar(Object.assign({}, PRESS, { knee: 0 })); },
        line: ['hipR', 'kneeR', 'ankleR'], marks: ['kneeR'], parts: ['thigh', 'shin'], view: { yaw: 90, pitch: 8, zoom: 1.45, dx: -90 } },
      { title: { tr: 'Pelvis kıvrılıyor', en: 'Pelvis tucks', es: 'La pelvis se enrolla' },
        fix: { tr: 'Pelvis nötr kalsın', en: 'Keep a neutral pelvis', es: 'Pelvis neutra' },
        fixText: { tr: 'Bel minderde, kızağı daha önce durdur', en: 'Lower back on the pad, stop the carriage earlier', es: 'Zona lumbar apoyada, frena el carro antes' },
        at: 'start', get pose() { return onBar(Object.assign({}, START, { knee: 118, lumbar: 26, ground: [['shoulderR', FB.REFORMER.top], ['pelvis', FB.REFORMER.top + 0.04]] })); },
        marks: ['pelvis'], parts: ['pelvis', 'waist'], view: { yaw: 90, pitch: 8, zoom: 1.45, dx: -110 } },
    ],
    cues: [{ tr: 'Omuzlar bloklara ağır', en: 'Shoulders heavy on the blocks', es: 'Hombros pesados en los topes' },
      { tr: 'Hareket kalçadan, bel sabit', en: 'Move from the hips, not the back', es: 'Mueve la cadera, no la espalda' },
      { tr: 'Topuklar yukarıda, dizler 2. parmakta', en: 'Heels high, knees over the 2nd toe', es: 'Talones altos, rodillas sobre el 2.º dedo' }],
  };
})();
