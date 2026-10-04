/* Single Leg Footwork (reformer, supine). footwork.js template: onBar() solves the hip angle that puts the ball of the
 * RIGHT foot on the footbar and pins only the right ankle there; the left leg holds tabletop (hip 90 / knee 90, FK).
 * The carriage follows the shoulders (blocks on the shoulders in every frame).
 * Start hip angle follows the approved footwork geometry (bar height + headrest put the hip at ~75° to the trunk line,
 * spec 105); knee 108 -> 4 and the ~35 cm carriage travel match the spec. */
(function () {
  const BAR_R = 0.022;
  const BLOCK = 0.245;
  const shX = (sol) => (sol.J.shoulderL[0] + sol.J.shoulderR[0]) / 2;
  const carriage = (sol) => shX(sol) + BLOCK;
  const G = () => [['shoulderR', FB.REFORMER.top], ['pelvis', FB.REFORMER.top]];
  const BASE = { trunk: -90, flat: false, neck: 10, sh: -13, shAbd: 10, el: 4, palm: 'down',
    hipL: 90, kneeL: 90, ankleL: -22, abdL: 2 };

  function onBar(p) {
    const { solve, expand } = FB, R = FB.REFORMER;
    const bx = R.footbarX, by = R.top + R.footbarH;
    const ctx = { anchorX: ['pelvis'], anchorAt: [0, 0] };
    const q = Object.assign({}, BASE, { ground: G() }, p);
    const at = (h) => solve(expand(Object.assign({}, q, { hipR: h })), ctx);
    const dy = (s) => s.J.ballR[1] - (by + BAR_R * s.F.footR[1][1]);
    let lo = -30, hi = 100;
    for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (dy(at(m)) > 0) hi = m; else lo = m; }
    const hip = (lo + hi) / 2, s = at(hip);
    const dx = bx + BAR_R * s.F.footR[1][0] - s.J.ballR[0];
    const pin = (k) => ({ at: [s.J['ankle' + k][0] + dx, s.J['ankle' + k][1], s.J['ankle' + k][2]], foot: s.F['foot' + k].map((c) => c.slice()) });
    return Object.assign(q, { hipR: hip, pos: [dx, 0, 0], ik: { ankleR: pin('R') } });
  }

  const START = { kneeR: 106, ankleR: -28 };
  const PRESS = { kneeR: 4, ankleR: -46 };

  window.EXERCISE = {
    id: 'single_leg_footwork',
    name: { tr: 'Tek Bacak Footwork', en: 'Single Leg Footwork', es: 'Footwork a una pierna' },
    category: { tr: 'Reformer · Bacak', en: 'Reformer · Legs', es: 'Reformer · Piernas' },
    equipmentLabel: { tr: 'Reformer · 2 yay', en: 'Reformer · 2 springs', es: 'Reformer · 2 muelles' },
    muscles: ['quads', 'glutes', 'hamstrings', 'core'],
    side: 'R',
    tempo: '2.5-0-2.5',
    view: { yaw: 42, pitch: 20, zoom: 1.12 },
    alt: { yaw: 90, pitch: 10, zoom: 1.2, dx: -60, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
      text: { tr: 'Serbest bacak masa pozisyonunda sabit', en: 'The free leg stays still in tabletop', es: 'La pierna libre quieta en mesa' } },
    setupView: { yaw: 20, pitch: 26 },
    props: [['reformer', { springs: 2, carriage }]],
    ctx: { anchorX: ['pelvis'], anchorAt: [0, 0] },
    contacts: ['ballR', 'pelvis', 'shoulderL', 'shoulderR', 'head'],
    get poses() { return { start: onBar(START), press: onBar(PRESS) }; },
    rest: 'start',
    rep: [
      { to: 'press', dur: 2.5, phase: 0 },
      { to: 'start', dur: 2.5, phase: 1 },
    ],
    setup: { tr: 'Sırtüstü uzan, omuzlar bloklarda. Sağ ayağın ön tabanı barda, sol bacak masa pozisyonunda. Sonra taraf değiştir.',
      en: 'Lie on your back, shoulders on the blocks. Right ball of foot on the bar, left leg in tabletop. Then switch sides.',
      es: 'Boca arriba, hombros en los topes. Metatarso derecho en la barra, pierna izquierda en mesa. Luego cambia.' },
    phases: [
      { name: { tr: 'Tek bacakla it', en: 'Press with one leg', es: 'Empuja con una pierna' }, breath: 'out', slow: 1.2, line: ['hipL', 'hipR'],
        text: { tr: 'Sağ bacağı uzat, kızak açılır. Pelvis düz, sol bacak kıpırdamaz.', en: 'Straighten the right leg, the carriage opens. Pelvis level, left leg still.', es: 'Estira la pierna derecha, el carro sale. Pelvis nivelada, la izquierda quieta.' } },
      { name: { tr: 'Kontrollü dön', en: 'Return slowly', es: 'Vuelve despacio' }, breath: 'in', slow: 1.2, arc: ['hipR', 'kneeR', 'ankleR'],
        text: { tr: 'Yaylara direnerek dizi bük. Diz ikinci parmak hizasında.', en: 'Resist the springs as you bend. Knee over the second toe.', es: 'Resiste los muelles al flexionar. Rodilla sobre el segundo dedo.' } },
    ],
    tempoText: { tr: '2,5 sn it · 2,5 sn dön · her bacak 8-10', en: '2.5 s press · 2.5 s return · 8-10 per leg', es: '2,5 s empuja · 2,5 s vuelve · 8-10 por pierna' },
    mistakes: [
      { title: { tr: 'Pelvis dönüyor', en: 'Pelvis rotates', es: 'La pelvis rota' },
        fix: { tr: 'Pelvis kare kalsın', en: 'Keep the pelvis square', es: 'Pelvis cuadrada' },
        fixText: { tr: 'İki kalça kemiği aynı yükseklikte; yayı hafiflet', en: 'Both hip bones level; lighten the springs', es: 'Ambas crestas iguales; aligera los muelles' },
        at: 'press', get pose() { return onBar(Object.assign({}, PRESS, { roll: 11, twist: -7 })); },
        line: ['hipL', 'hipR'], parts: ['pelvis', 'waist'], view: { yaw: 4, pitch: 34, zoom: 1.1 } },
      { title: { tr: 'Diz içe düşüyor', en: 'Knee falls inward', es: 'La rodilla cae hacia dentro' },
        fix: { tr: 'Diz ikinci parmağa', en: 'Knee over the 2nd toe', es: 'Rodilla sobre el 2.º dedo' },
        fixText: { tr: 'Kalça, diz ve ayak tek çizgide kalsın', en: 'Hip, knee and foot stay in one line', es: 'Cadera, rodilla y pie en línea' },
        at: 'start', get pose() { return onBar(Object.assign({}, START, { hrotR: -24, abdR: -7 })); },
        line: ['hipR', 'kneeR', 'ankleR'], marks: ['kneeR'], parts: ['thighR', 'shinR'], view: { yaw: 4, pitch: 34, zoom: 1.1 } },
    ],
    cues: [{ tr: 'Pelvis kare', en: 'Pelvis square', es: 'Pelvis cuadrada' },
      { tr: 'Serbest bacak sessiz', en: 'Free leg quiet', es: 'Pierna libre quieta' },
      { tr: 'Bütün ayakla bara bas', en: 'Press through the whole foot', es: 'Empuja con todo el pie' }],
  };
})();
