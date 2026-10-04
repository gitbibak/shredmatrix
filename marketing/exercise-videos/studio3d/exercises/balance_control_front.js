/* Reformer Balance Control Front (front support with leg lift). long_stretch.js geometry: hands flat on the footbar, ball of
 * the LEFT foot on the carriage, heel against the shoulder block; the shoulders flex (90 -> ~100) to press the carriage out
 * ~15 cm while the RIGHT leg lifts long behind (hip extension ~25, pointed foot), then the leg lowers as the carriage returns.
 * The spec lists only the push/return; the leg lift is the classical 'balance control' element (switch legs: said in the
 * setup). The left toe is the only foot contact in every pose, so the contact set never changes.
 * - Every pose rests on the same two contacts [handR on the bar, toeR on the pad] so the body rotates rigidly about them.
 * - bar(): per pose, shifts the body along the rail so the FK wrist sits where the flat-hand IK puts it (palm centre on the
 *   bar top), then pins both hands there (identical targets in every pose).
 * - The carriage follows the heels: block front face (carriage centre - 0.29) stays at the back of the heels every frame.
 * Spec trunk 80 (near-horizontal plank) needs a bar at carriage height; with the bar 28 cm above the carriage and arms ~90 deg
 * to the trunk the plank measures ~60-64 from vertical. The technique angles (straight body, shoulder 88 -> 106, carriage
 * ~14 cm) match the spec. */
(function () {
  const TOP = 0.38, BX = 1.0, FBH = 0.28, BAR_TOP = TOP + FBH + 0.022, HZ = 0.185;
  const carriage = (sol) => sol.J.heelL[0] + 0.285;
  const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };
  const BASE = { trunk: 80, hip: 0, knee: 0, abd: 2, flat: false, neck: -2, shAbd: 2, el: 0,
    ground: [['handR', BAR_TOP], ['toeL', TOP]], handFlat: true, handSurface: BAR_TOP, elbowPole: [-0.3, -1, 0.75] };
  const HANDS = { handL: { at: [BX, BAR_TOP, -HZ] }, handR: { at: [BX, BAR_TOP, HZ] } };
  function bar(p) {
    const { solve, expand } = FB;
    const q = Object.assign({}, BASE, p);
    const s = solve(expand(Object.assign({}, q, { ik: undefined, pos: undefined })), CTX);
    // wrist target of the flat-hand IK (palm centre on the bar top, fingers along the thorax 'up' direction)
    const t = s.F.thorax[1], hl = Math.hypot(t[0], t[2]);
    const dx = (BX - FB.BODY.hand * 0.6 * t[0] / hl) - s.J.wristR[0];
    return Object.assign(q, { pos: [dx, 0, 0], ik: Object.assign({}, HANDS, p.ik || {}) });
  }
  const PLANK = { sh: 88, ankle: 36 };
  const OUT = { sh: 102, ankle: 40, hipR: -26, ankleR: -35 };

  window.EXERCISE = {
    id: 'balance_control_front',
    name: { tr: 'Balance Control Front', en: 'Balance Control Front', es: 'Control de equilibrio frontal' },
    category: { tr: 'Reformer · Karın ve omuz', en: 'Reformer · Core & shoulders', es: 'Reformer · Core y hombros' },
    equipmentLabel: { tr: 'Reformer · 1-2 kırmızı yay', en: 'Reformer · 1-2 red springs', es: 'Reformer · 1-2 muelles rojos' },
    muscles: ['core', 'delts', 'triceps', 'glutes', 'hamstrings'],
    tempo: '1.5-1.5',
    side: 'R',
    view: { yaw: 90, pitch: 6, zoom: 1.1, dx: -20 },
    alt: { yaw: 30, pitch: 14, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
      text: { tr: 'Kalça düz, bacak tam arkaya uzanır', en: 'Hips square, the leg reaches straight back', es: 'Cadera cuadrada, la pierna atrás' } },
    setupView: { yaw: 35, pitch: 18 },
    setupMarks: [{ type: 'aline', joints: ['ankleR', 'pelvis', 'shoulderR'] }],
    props: [['reformer', { springs: 1, carriage, footbarH: FBH }]],
    ctx: CTX,
    contacts: ['handL', 'handR', 'toeL'],
    get poses() { return { plank: bar(PLANK), out: bar(OUT) }; },
    rest: 'plank',
    rep: [
      { to: 'out', dur: 1.5, phase: 0 },
      { to: 'plank', dur: 1.5, phase: 1 },
    ],
    setup: { tr: 'Plank: eller footbar’da, ayak ön tabanları kızakta, topuklar omuz bloklarına dayalı. Sonra bacak değiştir.',
      en: 'Plank: hands on the footbar, balls of the feet on the carriage, heels against the blocks. Then switch legs.',
      es: 'Plancha: manos en la barra, metatarsos en el carro, talones contra los topes. Luego cambia de pierna.' },
    phases: [
      { name: { tr: 'İt ve bacağı kaldır', en: 'Press out, lift the leg', es: 'Empuja y eleva la pierna' }, breath: 'out', slow: 1.3, arc: ['ankleL', 'hipR', 'ankleR'],
        text: { tr: 'Kızağı omuzlardan iterken sağ bacağı uzun ve düz kaldır. Kalça düz kalır.', en: 'Press the carriage out from the shoulders as the right leg lifts long. Hips stay square.', es: 'Empuja desde los hombros mientras la pierna derecha sube larga. Cadera cuadrada.' } },
      { name: { tr: 'Kontrollü dön', en: 'Return with control', es: 'Vuelve con control' }, breath: 'in', slow: 1.3, line: ['ankleL', 'pelvis', 'shoulderR'],
        text: { tr: 'Bacağı indirirken kızağı geri çek; plank çizgisi hiç bozulmaz.', en: 'Lower the leg as you draw the carriage in; the plank line never breaks.', es: 'Baja la pierna y recoge el carro; la plancha no se rompe.' } },
    ],
    tempoText: { tr: '1,5 sn it · 1,5 sn dön · her bacakla 5 tekrar', en: '1.5 s out · 1.5 s in · 5 reps per leg', es: '1,5 s fuera · 1,5 s dentro · 5 por pierna' },
    mistakes: [
      { title: { tr: 'Kalça çöküyor', en: 'Hips sag', es: 'La cadera se hunde' },
        fix: { tr: 'Karnı derinden topla', en: 'Brace the deep abs', es: 'Activa el abdomen profundo' },
        fixText: { tr: 'Omuz, kalça ve topuk aynı çizgide', en: 'Shoulder, hip and heel in one line', es: 'Hombro, cadera y talón alineados' },
        at: 'out', get pose() { return bar(Object.assign({}, OUT, { hip: -16, lumbar: -12 })); },
        line: ['ankleL', 'pelvis', 'shoulderR'], parts: ['pelvis', 'waist'] },
      { title: { tr: 'Bacak çok yükseğe, bel çukur', en: 'Leg too high, back arches', es: 'Pierna muy alta, lumbar arqueada' },
        fix: { tr: 'Bacağı kalça hizasında tut', en: 'Keep the leg at hip height', es: 'Pierna a la altura de la cadera' },
        fixText: { tr: 'Bacak uzar ama bel çukurlaşmaz; pelvis sabit', en: 'Reach long without arching; pelvis still', es: 'Alarga sin arquear; pelvis quieta' },
        at: 'out', get pose() { return bar(Object.assign({}, OUT, { hipR: -48, lumbar: -16 })); },
        line: ['kneeR', 'pelvis', 'shoulderR'], marks: ['pelvis'], parts: ['waist', 'thighR'] },
    ],
    cues: [{ tr: 'Hareketli kızakta sabit plank', en: 'Steady plank on a moving carriage', es: 'Plancha firme sobre el carro' },
      { tr: 'Bacak uzun, kalça düz', en: 'Leg long, hips square', es: 'Pierna larga, cadera cuadrada' },
      { tr: 'Elleri bara bastır', en: 'Press down into the bar', es: 'Empuja la barra hacia abajo' }],
  };
})();
