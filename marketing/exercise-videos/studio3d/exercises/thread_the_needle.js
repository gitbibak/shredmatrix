/* Thread the needle (Pilates mat, quadruped; right arm threads). Quadruped base as bird_dog.js: two ground contacts
 * [kneeR, ankleR] in every pose (shins on the mat), knees anchored, left hand planted (flat-hand IK). Thoracic rotation = `twist` (spine rotation, split lumbar/thorax).
 * Thread: hip flexion 96 tips the trunk head-down and the planted left arm bends, so the chest lowers toward the mat; the right arm
 * slides under the left arm palm up (world IK target on the mat, handFlatR false so the palm can face up), right shoulder and
 * ear close to the mat. Open: rotation the other way, right arm to the ceiling, gaze follows (headTurn).
 * Right hand: world IK target in every pose (= the FK hand of that pose, table: on the mat under the shoulder) with a fixed
 * world elbow pole toward the head, so the hand slides along the mat into the thread and the elbow never flips. */
(function () {
  const MAT = 0.006;
  const CTX = { anchorX: ['kneeL', 'kneeR'], anchorAt: [-0.12, 0] };   // knees anchored: the pelvis stays over the knees while the thorax rotates
  const G = [['kneeR', MAT], ['ankleR', MAT - 0.024]];   // shins and tops of the feet on the mat (as camel_pose.js)
  const TABLE = { trunk: 90, hip: 82, knee: 90, ankle: -62, handFlatL: true, flat: false, sh: 80, el: 0, neck: -4, ground: G, noAvoid: true, curlR: 0.1, handFlatR: false, palmR: 'down',
    elbowPoleL: [-1, -0.25, 0.35], elbowPoleR: [-1, -0.25, 0.35] };
  const THREAD = Object.assign({}, TABLE, { hip: 112, twist: 48, thoracic: 8, elL: 72, neck: 0, headTurn: 30, shR: 118, shAbdR: -42, palmR: 'up', elbowPoleR: [-0.4, 0.3, 1] });
  const OPEN = Object.assign({}, TABLE, { twist: -60, neck: -6, headTurn: -40, shR: 90, shAbdR: 100, palmR: 'forward', elbowPoleR: [-0.7, 0.2, 0.7] });
  // in-between pose (no card): the arm swings down around the side of the body instead of folding across the chest
  const SWING = Object.assign({}, TABLE, { twist: -30, neck: -4, headTurn: -15, shR: 80, shAbdR: 85, palmR: 'down', elbowPoleR: [-0.7, 0.2, 0.7] });
  function build(mistakes) {
    const { solve, expand, V } = FB;
    const own = (p) => { const q = solve(expand(p), CTX); return { handR: { at: q.J.handR.slice() } }; };
    const t0 = solve(expand(TABLE), CTX);
    const poses = {
      table: Object.assign({}, TABLE, { ik: { handR: { at: [t0.J.handL[0], 0.035, t0.J.shoulderR[2]] } } }),
      thread: Object.assign({}, THREAD, { ik: own(THREAD) }),
      open: Object.assign({}, OPEN, { ik: own(OPEN) }),
      swing: Object.assign({}, SWING, { ik: own(SWING) }),
    };
    for (const [at, mp] of mistakes) mp.ik = own(Object.assign({}, at === 'thread' ? THREAD : OPEN, mp));
    return poses;
  }
  window.EXERCISE = {
    id: 'thread_the_needle',
    name: { tr: 'İğneye İp Geçirme', en: 'Thread the Needle', es: 'Enhebrar la aguja' },
    category: { tr: 'Pilates · Mobilite', en: 'Pilates · Mobility', es: 'Pilates · Movilidad' },
    equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
    muscles: ['upperback', 'obliques', 'delts'],
    side: 'R',
    tempo: '3-3-2',
    view: { yaw: 40, pitch: 22 },
    alt: { yaw: 90, pitch: 10, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
      text: { tr: 'Kalça dizlerin üstünde kalır', en: 'Hips stay over the knees', es: 'Cadera sobre las rodillas' } },
    setupView: { yaw: 60, pitch: 14 },
    setupMarks: [{ type: 'aline', joints: ['wristL', 'shoulderL'] }, { type: 'aline', joints: ['kneeR', 'hipR'] }],
    contacts: ['handL', 'handR', 'kneeL', 'kneeR'],
    props: [['mat', { at: [0.05, 0, -0.05], length: 1.85, width: 0.8 }]],
    ctx: Object.assign({ plant: ['handL'] }, CTX),
    get poses() { return this._poses || (this._poses = build(this.mistakes.map((m) => [m.at, m.pose]))); },
    rest: 'table',
    tempoReps: 1,
    rep: [
      { to: 'thread', dur: 3.0, phase: 0 },
      { to: 'open', dur: 3.0, phase: 1 },
      { to: 'swing', dur: 1.0, phase: 2, card: false },
      { to: 'table', dur: 1.0, phase: 2 },
    ],
    setup: { tr: 'Dört ayak: eller omuzların, dizler kalçaların altında. Sırt düz, baş omurga hizasında. Sonra taraf değiştir.',
      en: 'All fours: hands under shoulders, knees under hips. Flat back, head in line. Then switch sides.',
      es: 'Cuadrupedia: manos bajo hombros, rodillas bajo la cadera. Espalda plana. Luego cambia de lado.' },
    phases: [
      { name: { tr: 'Kolu altından geçir', en: 'Thread under', es: 'Pasa por debajo' }, breath: 'out',
        text: { tr: 'Nefes ver, sağ kolu avuç yukarı sol kolun altından kaydır; omuz ve kulak mata.', en: 'Exhale, slide the right arm under the left, palm up; shoulder and ear to the mat.', es: 'Exhala, pasa el brazo derecho bajo el otro, palma arriba; hombro y oreja abajo.' } },
      { name: { tr: 'Tavana aç', en: 'Open up', es: 'Abre hacia arriba' }, breath: 'in',
        text: { tr: 'Nefes al, göğsü aç, sağ kolu tavana uzat; bakış eli takip eder.', en: 'Inhale, open the chest and reach the right arm to the ceiling; eyes follow the hand.', es: 'Inhala, abre el pecho y lleva el brazo al techo; la mirada sigue la mano.' } },
      { name: { tr: 'Başa dön', en: 'Return', es: 'Vuelve' }, breath: 'out',
        text: { tr: 'Nefes ver, eli omzun altına koy, sırt düz.', en: 'Exhale, place the hand under the shoulder, back flat.', es: 'Exhala, mano bajo el hombro, espalda plana.' } },
    ],
    tempoText: { tr: '3 sn geçir · 3 sn aç · 2 sn dön', en: '3 s thread · 3 s open · 2 s return', es: '3 s pasa · 3 s abre · 2 s vuelve' },
    mistakes: [
      { title: { tr: 'Kalça geriye kayıyor', en: 'Hips shift back', es: 'La cadera va atrás' },
        fix: { tr: 'Kalça dizlerin üstünde', en: 'Hips over the knees', es: 'Cadera sobre las rodillas' },
        fixText: { tr: 'Dönüş göğüsten gelir, kalça yerinde kalır', en: 'The turn comes from the ribs; the hips stay put', es: 'El giro sale de las costillas; la cadera quieta' },
        at: 'thread', pose: { hip: 132, knee: 122 }, view: { yaw: 90, pitch: 10 }, line: ['kneeR', 'hipR'], marks: ['hipR'], parts: ['pelvis', 'thigh'] },
      { title: { tr: 'Boyun zorlanıyor', en: 'Neck strain', es: 'Tensión en el cuello' },
        fix: { tr: 'Omuz ve kulağı mata bırak', en: 'Rest shoulder and ear on the mat', es: 'Apoya hombro y oreja' },
        fixText: { tr: 'Başı kaldırma, boyun gevşek', en: 'Do not lift the head; neck relaxed', es: 'No levantes la cabeza; cuello suelto' },
        at: 'thread', pose: { neck: -30, headTurn: 0 }, marks: ['head'], parts: ['neck'] },
    ],
    cues: [{ tr: 'Kaburgalardan dön', en: 'Thread from the ribs', es: 'Gira desde las costillas' },
      { tr: 'Kalça dizlerin üstünde', en: 'Hips stay over the knees', es: 'Cadera sobre las rodillas' },
      { tr: 'Gözler eli takip eder', en: 'Eyes follow the hand', es: 'La mirada sigue la mano' }],
  };
})();
