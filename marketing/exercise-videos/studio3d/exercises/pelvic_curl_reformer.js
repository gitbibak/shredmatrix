/* Pelvic Curl on the reformer (supine, balls of the feet on the footbar, carriage closed and still).
 * Template footwork.js: the start pose goes through onBar() (hip angle solved so the ball of the foot rests on the bar,
 * rail offset pos x, ankles pinned). Here the SHOULDERS are the horizontal anchor (ctx.anchorX), and every other pose
 * reuses the start pose's pos + ankle pins: the carriage (which follows the shoulders) never moves and the feet stay on
 * the bar while the pelvis peels up. The bridge height comes from the pelvis contact height (2-contact ground with the
 * upper back); knees follow by IK.
 * Keys: start (neutral) -> curl (tailbone curls, low back imprints, pelvis just off the pad) -> top (shoulder bridge,
 * knee-hip-shoulder line). Footbar at the default height of the approved footwork: a low bar would drop the start hip to ~58° (spec asks a low
 * bar AND hip 100, which contradict); start hip 75, knee 104. At the top the knee-hip-shoulder line (hip ~0) is matched;
 * the knee opens to ~85° (spec 105) because the feet stay on the bar. */
(function () {
  const BAR_R = 0.022;
  const FBH = 0.36;   // default footbar height (as the approved footwork)
  const BLOCK = 0.245;
  const TOP = () => FB.REFORMER.top;
  const shX = (sol) => (sol.J.shoulderL[0] + sol.J.shoulderR[0]) / 2;
  const carriage = (sol) => shX(sol) + BLOCK;
  const CTX = { anchorX: ['shoulderL', 'shoulderR'], anchorAt: [0, 0] };
  const BASE = { trunk: -90, flat: false, neck: 10, sh: -13, shAbd: 12, el: 4, palm: 'down', abd: 3 };

  function onBar(p) {
    const { solve, expand } = FB, R = FB.REFORMER;
    const bx = R.footbarX, by = R.top + FBH;
    const q = Object.assign({}, BASE, { ground: [['shoulderR', TOP()], ['pelvis', TOP()]] }, p);
    const at = (h) => solve(expand(Object.assign({}, q, { hip: h })), CTX);
    const dy = (s) => s.J.ballR[1] - (by + BAR_R * s.F.footR[1][1]);
    let lo = -30, hi = 100;
    for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (dy(at(m)) > 0) hi = m; else lo = m; }
    const hip = (lo + hi) / 2, s = at(hip);
    const dx = bx + BAR_R * s.F.footR[1][0] - s.J.ballR[0];
    const pin = (k) => ({ at: [s.J['ankle' + k][0] + dx, s.J['ankle' + k][1], s.J['ankle' + k][2]], foot: s.F['foot' + k].map((c) => c.slice()) });
    // hands rest on the carriage beside the hips (pinned there, so the arms stay down while the trunk lifts)
    const hand = (k) => ({ at: [s.J['hand' + k][0] + dx, s.J['hand' + k][1], s.J['hand' + k][2]] });
    return Object.assign(q, { hip, pos: [dx, 0, 0], ik: { ankleL: pin('L'), ankleR: pin('R'), handL: hand('L'), handR: hand('R') } });
  }
  let S0 = null;
  const start = () => S0 || (S0 = onBar({ knee: 104, ankle: -24 }));
  // same feet + same carriage position as the start pose; pelvis lifted to `lift` above its lying height
  const keep = (p, lift, dxExtra = 0) => {
    const s = start();
    const sh = (h) => ({ at: [h.at[0] + dxExtra, h.at[1], h.at[2]] });
    const ik = dxExtra ? { ankleL: s.ik.ankleL, ankleR: s.ik.ankleR, handL: sh(s.ik.handL), handR: sh(s.ik.handR) } : s.ik;
    return Object.assign({}, BASE, { hip: s.hip, knee: s.knee, ankle: s.ankle }, p,
      { ground: [['shoulderR', TOP() + (p.shLift || 0)], ['pelvis', TOP() + lift]], pos: [s.pos[0] + dxExtra, 0, 0], ik });
  };

  window.EXERCISE = {
    id: 'pelvic_curl_reformer',
    name: { tr: 'Reformerda Pelvic Curl', en: 'Pelvic Curl on Reformer', es: 'Enrollamiento pélvico en reformer' },
    category: { tr: 'Reformer · Kalça', en: 'Reformer · Glutes', es: 'Reformer · Glúteos' },
    equipmentLabel: { tr: 'Reformer · 3 yay', en: 'Reformer · 3 springs', es: 'Reformer · 3 muelles' },
    muscles: ['glutes', 'hamstrings', 'core'],
    tempo: '3-3',
    view: { yaw: 90, pitch: 8, zoom: 1.2, dx: -40 },
    alt: { yaw: 48, pitch: 26, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
      text: { tr: 'Dizler kalça genişliğinde, kızak kıpırdamaz', en: 'Knees hip-width, the carriage stays still', es: 'Rodillas al ancho de cadera, el carro quieto' } },
    setupView: { yaw: 40, pitch: 22 },
    props: [['reformer', { springs: 3, carriage, footbarH: FBH }]],
    ctx: CTX,
    contacts: ['ballL', 'ballR', 'pelvis', 'shoulderL', 'shoulderR', 'head'],
    get poses() {
      return {
        start: start(),
        curl: keep({ lumbar: 14, thoracic: 2 }, 0.05),
        top: keep({ hip: 0, lumbar: -2, thoracic: 20, neck: 48, shLift: 0.01 }, 0.30),
      };
    },
    rest: 'start',
    rep: [
      { to: 'curl', dur: 1.0, phase: 0 },
      { to: 'top', dur: 2.0, phase: 1 },
      { to: 'start', dur: 3.0, phase: 2 },
    ],
    setup: { tr: 'Sırtüstü uzan, omuzlar bloklarda. Ayakların ön tabanı barda, kalça genişliğinde. Pelvis nötr.',
      en: 'Lie on your back, shoulders on the blocks. Balls of the feet on the bar, hip-width apart. Neutral pelvis.',
      es: 'Boca arriba, hombros en los topes. Metatarsos en la barra, al ancho de cadera. Pelvis neutra.' },
    phases: [
      { name: { tr: 'Kuyruk sokumunu kıvır', en: 'Curl the tailbone', es: 'Enrolla el cóccix' }, breath: 'out',
        text: { tr: 'Nefes ver; pelvis geriye devrilir, bel minderde düzleşir.', en: 'Exhale; the pelvis tilts back and the low back flattens.', es: 'Exhala; la pelvis bascula y la lumbar se apoya.' } },
      { name: { tr: 'Omur omur kalk', en: 'Peel up', es: 'Sube vértebra a vértebra' }, breath: 'out', slow: 1.3, line: ['shoulderR', 'hipR', 'kneeR'],
        text: { tr: 'Omurga sırayla kalkar; diz, kalça, omuz tek çizgide. Kızak kıpırdamaz.', en: 'The spine peels up in turn to a knee-hip-shoulder line. The carriage stays still.', es: 'La columna sube en orden hasta la línea rodilla-cadera-hombro. Carro quieto.' } },
      { name: { tr: 'Omur omur in', en: 'Roll down', es: 'Baja vértebra a vértebra' }, breath: 'in', slow: 1.2,
        text: { tr: 'Önce sırt, sonra bel, en son kuyruk sokumu iner.', en: 'Upper back first, then the low back, tailbone last.', es: 'Primero la espalda, luego la lumbar, el cóccix al final.' } },
    ],
    tempoText: { tr: '3 sn kalk · 3 sn in · 5-8 tekrar', en: '3 s up · 3 s down · 5-8 reps', es: '3 s sube · 3 s baja · 5-8 repeticiones' },
    mistakes: [
      { title: { tr: 'Kaburgalar dışarı itiyor', en: 'Ribs flare', es: 'Costillas abiertas' },
        fix: { tr: 'Kaburgalar içeride', en: 'Ribs knitted', es: 'Costillas cerradas' },
        fixText: { tr: 'Diz–kalça–omuz çizgisinden yükseğe itme', en: 'No higher than the knee–hip–shoulder line', es: 'No más alto que la línea rodilla–cadera–hombro' },
        at: 'top', get pose() { return keep({ hip: -10, lumbar: -22, thoracic: 10, neck: 50, shLift: 0.01 }, 0.34); },
        line: ['shoulderR', 'hipR', 'kneeR'], marks: ['chest'], parts: ['waist', 'chest'] },
      { title: { tr: 'Kızak açılıyor', en: 'Carriage drifts open', es: 'El carro se abre' },
        fix: { tr: 'Kızak sabit kalsın', en: 'Keep the carriage still', es: 'Carro quieto' },
        fixText: { tr: 'Bacakla itme; kalçayı arka bacak ve kalça kası kaldırır', en: 'Don’t push with the legs; glutes and hamstrings lift', es: 'No empujes con las piernas; suben glúteos e isquios' },
        at: 'top', get pose() { return keep({ hip: 0, lumbar: -2, thoracic: 20, neck: 48, shLift: 0.01 }, 0.26, -0.13); },
        line: ['hipR', 'kneeR', 'ankleR'], marks: ['kneeR'], parts: ['thigh', 'shin'], view: { yaw: 90, pitch: 8, zoom: 1.1, dx: -20 } },
    ],
    cues: [{ tr: 'Omur omur kalk ve in', en: 'Peel and stack one vertebra at a time', es: 'Vértebra a vértebra' },
      { tr: 'Kızak sabit, ayaklar barda', en: 'Carriage still, feet on the bar', es: 'Carro quieto, pies en la barra' },
      { tr: 'Kaburgalar içeride', en: 'Ribs knitted', es: 'Costillas cerradas' }],
  };
})();
