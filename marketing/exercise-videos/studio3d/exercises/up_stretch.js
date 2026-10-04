/* Reformer Up Stretch. long_stretch.js set-up: hands flat on the footbar (handSurface = bar top), balls of the feet on the
 * carriage with the heels lifted against the shoulder blocks. From the plank the hips lift up and back into a pike
 * (hip ~95, legs straight, shoulders ~158) while the carriage rolls ~30 cm toward the footbar, then the hips lower and
 * the carriage rolls back out to the plank. Hands never move.
 * - Same two contacts [handR on the bar, toeR on the pad] in every pose (rigid rotation, no contact-set blend).
 * - bar(): rail offset so the FK wrist sits on the flat-hand IK target; the ankle is bisected per pose so the heel stays at
 *   block height (~0.47 m) against the block face.
 * - The carriage follows the heels (block front face at the back of the heels every frame).
 * Spec plank trunk 80 needs a bar at carriage height (here ~60, see long_stretch.js). Spec pike trunk 40 from vertical
 * (head-down torso) is out of reach with straight arms on a bar: the shoulders can only rise an arm's length above the
 * bar, so the torso measures ~117 (pelvis->neck, i.e. 63 from head-down vertical); shoulder flexion is raised to ~158 so
 * the carriage travel (~30 cm) and hip angle (~95) match the spec. */
(function () {
  const TOP = 0.38, BX = 1.0, FBH = 0.28, HEEL_Y = 0.475, DA0 = -2, DA1 = 37, BAR_TOP = TOP + FBH + 0.022, HZ = 0.185;
  // block face against the back of the shoe; the skinned shoe heel sits ~4 cm ahead of J.heel when the ankle is neutral, flush when
  // it is dorsiflexed ~37 deg (plank), so the offset follows the ankle angle
  const dorsi = (J, k) => { const { V } = FB; return Math.asin(Math.max(-1, Math.min(1, V.dot(V.norm(V.sub(J['toe' + k], J['heel' + k])), V.norm(V.sub(J['knee' + k], J['ankle' + k])))))) * 180 / Math.PI; };
  const carriage = (sol) => { const a = (dorsi(sol.J, 'L') + dorsi(sol.J, 'R')) / 2, d = FB.clamp((a - DA0) / (DA1 - DA0));
    return (sol.J.heelL[0] + sol.J.heelR[0]) / 2 + 0.325 - 0.04 * d; };
  const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };
  const BASE = { trunk: 80, hip: 0, knee: 0, abd: 2, flat: false, neck: -2, shAbd: 2, el: 0,
    ground: [['handR', BAR_TOP], ['toeR', TOP]], handFlat: true, handSurface: BAR_TOP, elbowPole: [-0.3, -1, 0.75] };
  const HANDS = { handL: { at: [BX, BAR_TOP, -HZ] }, handR: { at: [BX, BAR_TOP, HZ] } };
  function bar(p) {
    const { solve, expand } = FB;
    const q = Object.assign({}, BASE, p);
    const fk = (a) => solve(expand(Object.assign({}, q, { ankle: a, ik: undefined, pos: undefined })), CTX);
    let lo = -40, hi = 80;                                  // more dorsiflexion -> heel lower
    for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (fk(m).J.heelR[1] > HEEL_Y) lo = m; else hi = m; }
    q.ankle = (lo + hi) / 2;
    const s = fk(q.ankle);
    // wrist target of the flat-hand IK (palm centre on the bar top, fingers along the thorax 'up' direction)
    const t = s.F.thorax[1], hl = Math.hypot(t[0], t[2]);
    const dx = (BX - FB.BODY.hand * 0.6 * t[0] / hl) - s.J.wristR[0];
    return Object.assign(q, { pos: [dx, 0, 0], ik: Object.assign({}, HANDS, p.ik || {}) });
  }
  const PLANK = { sh: 88 };
  const PIKE = { hip: 95, sh: 158 };

  window.EXERCISE = {
    id: 'up_stretch',
    name: { tr: 'Up Stretch', en: 'Up Stretch', es: 'Up Stretch' },
    category: { tr: 'Reformer · Karın ve omuz', en: 'Reformer · Core & shoulders', es: 'Reformer · Core y hombros' },
    equipmentLabel: { tr: 'Reformer · 1 kırmızı yay', en: 'Reformer · 1 red spring', es: 'Reformer · 1 muelle rojo' },
    muscles: ['core', 'delts', 'hamstrings', 'triceps', 'calves'],
    tempo: '2-2',
    view: { yaw: 90, pitch: 6, zoom: 1.1, dx: -20 },
    alt: { yaw: 30, pitch: 14, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
      text: { tr: 'Kalça yukarı ve geriye, bacaklar düz', en: 'Hips up and back, legs straight', es: 'Cadera arriba y atrás, piernas rectas' } },
    setupView: { yaw: 35, pitch: 18 },
    setupMarks: [{ type: 'aline', joints: ['ankleR', 'pelvis', 'shoulderR'] }],
    props: [['reformer', { springs: 1, carriage, footbarH: FBH }]],
    ctx: CTX,
    contacts: ['handL', 'handR', 'toeL', 'toeR'],
    get poses() { return { plank: bar(PLANK), pike: bar(PIKE) }; },
    rest: 'plank',
    rep: [
      { to: 'pike', dur: 2.0, phase: 0 },
      { to: 'plank', dur: 2.0, phase: 1 },
    ],
    setup: { tr: 'Plank: eller footbar’da omuz genişliğinde, ayak ön tabanları kızakta, topuklar omuz bloklarına dayalı.',
      en: 'Plank: hands on the footbar shoulder-width apart, balls of the feet on the carriage, heels against the blocks.',
      es: 'Plancha: manos en la barra al ancho de hombros, metatarsos en el carro, talones contra los topes.' },
    phases: [
      { name: { tr: 'Kalçayı kaldır', en: 'Lift the hips', es: 'Eleva la cadera' }, breath: 'out', slow: 1.2, arc: ['shoulderR', 'hipR', 'kneeR'],
        text: { tr: 'Karnı içeri çekip kalçayı yukarı kaldır; kızak bara doğru gelir. Bacaklar düz.', en: 'Scoop the belly and lift the hips; the carriage comes in. Legs stay straight.', es: 'Mete el abdomen y eleva la cadera; el carro se acerca. Piernas rectas.' } },
      { name: { tr: 'Plank’a uzan', en: 'Lengthen to plank', es: 'Alarga a plancha' }, breath: 'in', slow: 1.2, line: ['ankleR', 'pelvis', 'shoulderR'],
        text: { tr: 'Kalçayı indir, kızak kontrollü geri kayar; omuzlar bileklerin üstüne gelir.', en: 'Lower the hips as the carriage rolls back; shoulders come over the wrists.', es: 'Baja la cadera y el carro sale con control; hombros sobre las muñecas.' } },
    ],
    tempoText: { tr: '2 sn yukarı · 2 sn plank · 3-5 tekrar', en: '2 s up · 2 s to plank · 3-5 reps', es: '2 s arriba · 2 s a plancha · 3-5 repeticiones' },
    mistakes: [
      { title: { tr: 'Dizler bükülüyor', en: 'Knees bend', es: 'Las rodillas se doblan' },
        fix: { tr: 'Bacakları düz tut', en: 'Keep the legs straight', es: 'Piernas rectas' },
        fixText: { tr: 'Kalçayı karınla kaldır, bacaklar uzun kalsın', en: 'Lift the hips with the abs, legs stay long', es: 'Eleva la cadera con el abdomen, piernas largas' },
        at: 'pike', get pose() { return bar(Object.assign({}, PIKE, { hip: 108, knee: 34, sh: 154 })); },
        line: ['hipR', 'kneeR', 'ankleR'], marks: ['kneeR'], parts: ['thigh', 'shin'] },
      { title: { tr: 'Kızak çarparak kapanıyor', en: 'Carriage slams in', es: 'El carro se cierra de golpe' },
        fix: { tr: 'Kızağı kontrol et', en: 'Control the carriage', es: 'Controla el carro' },
        fixText: { tr: 'Kalça yukarı çıkar, omuzlar ellerin önüne düşmez', en: 'Hips go up; shoulders don’t fall past the hands', es: 'La cadera sube; los hombros no pasan las manos' },
        at: 'pike', get pose() { return bar(Object.assign({}, PIKE, { hip: 80, sh: 112, thoracic: -8, neck: -14 })); },
        line: ['wristR', 'shoulderR'], marks: ['shoulderR'], parts: ['upper', 'chest'] },
    ],
    cues: [{ tr: 'Kalça yukarı, ellerin üstüne', en: 'Hips up and over the hands', es: 'Cadera arriba, sobre las manos' },
      { tr: 'Bacaklar düz', en: 'Keep the legs straight', es: 'Piernas rectas' },
      { tr: 'Elleri bara bastır', en: 'Press down into the bar', es: 'Empuja la barra hacia abajo' }],
  };
})();
