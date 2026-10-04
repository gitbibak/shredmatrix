/* Swan prep (Pilates mat, prone). Prone base as prone_w_isometric.js: pelvis + toes are the two ground contacts in every pose
 * (trunk 82 so the deeper chest rests on the mat). Hands: palms flat beside the chest under the shoulders — the rest pose puts
 * them there with holdL/R, then build() turns that solved position into a world IK target (flat hand) used by EVERY pose, so the
 * palms stay planted while thoracic/lumbar extension lifts the chest and the elbows open from ~90° to ~50°.
 * Elbows hug the ribs (elbowPole back toward the feet and up). */
(function () {
  const PRONE = { trunk: 82, hip: -8, knee: 0, ankle: -35, flat: false, abd: 2, neck: 8, handFlat: true, curl: 0.15,
    pole: { elbowL: [-0.6, 1, -0.25], elbowR: [-0.6, 1, 0.25] }, ground: [['pelvis', 0.012], ['toeR', 0.012]] };
  const CTX = { anchorX: ['pelvis'], anchorAt: [-0.2, 0] };
  const REST = Object.assign({}, PRONE, { holdL: [0.1, 0.38, 0.19], holdR: [0.1, 0.38, 0.19] });
  const LIFT = Object.assign({}, PRONE, { thoracic: -25, lumbar: -10, neck: -10, protract: -0.02 });
  function build(mistakes) {
    const { solve, expand } = FB;
    const s = solve(expand(REST), CTX);
    const ik = { handL: { at: [s.J.handL[0], 0.006, s.J.handL[2]] }, handR: { at: [s.J.handR[0], 0.006, s.J.handR[2]] } };
    const strip = (p) => { const o = Object.assign({}, p, { ik }); delete o.holdL; delete o.holdR; return o; };
    const poses = { rest: strip(REST), lift: strip(LIFT) };
    for (const mp of mistakes) mp.ik = ik;
    return poses;
  }
  window.EXERCISE = {
    id: 'swan_prep',
    name: { tr: 'Kuğu Hazırlığı (Swan Prep)', en: 'Swan Prep', es: 'Preparación del cisne' },
    category: { tr: 'Pilates · Sırt', en: 'Pilates · Back', es: 'Pilates · Espalda' },
    equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
    muscles: ['lowerback', 'upperback', 'glutes'],
    tempo: '2.5-2.5',
    view: { yaw: 90, pitch: 8, zoom: 1.3 },
    alt: { yaw: 35, pitch: 26, title: { tr: 'Önden çapraz', en: 'Front angle', es: 'Vista frontal' },
      text: { tr: 'Dirsekler kaburgalara yakın, omuzlar aşağıda', en: 'Elbows close to the ribs, shoulders down', es: 'Codos cerca de las costillas, hombros abajo' } },
    setupView: { yaw: 40, pitch: 40 },
    props: [['mat', { at: [-0.25, 0.006, 0], length: 2.0, width: 0.7 }]],
    ctx: CTX,
    contacts: ['chest', 'pelvis', 'handL', 'handR', 'toeL', 'toeR'],
    get poses() { return this._poses || (this._poses = build(this.mistakes.map((m) => m.pose))); },
    rest: 'rest',
    rep: [
      { to: 'lift', dur: 2.5, phase: 0 },
      { to: 'rest', dur: 2.5, phase: 1 },
    ],
    setup: { tr: 'Yüzüstü uzan, bacaklar bitişik. Avuçlar omuzların altında, dirsekler bükülü ve kaburgalara yakın.',
      en: 'Lie face down, legs together. Palms under the shoulders, elbows bent and close to the ribs.',
      es: 'Boca abajo, piernas juntas. Palmas bajo los hombros, codos flexionados junto a las costillas.' },
    phases: [
      { name: { tr: 'Göğsü kaldır', en: 'Lift the chest', es: 'Eleva el pecho' }, breath: 'in',
        text: { tr: 'Nefes al, kürekleri aşağı kaydır, elleri hafifçe it. Kasık matta kalır.', en: 'Inhale, slide the blades down, press lightly. The pubic bone stays down.', es: 'Inhala, baja las escápulas y empuja suave. El pubis queda abajo.' } },
      { name: { tr: 'Yavaşça in', en: 'Lower slowly', es: 'Baja despacio' }, breath: 'out',
        text: { tr: 'Nefes ver, göğsü omur omur mata indir. Bacaklar ağır.', en: 'Exhale and lower the chest vertebra by vertebra. Legs heavy.', es: 'Exhala y baja el pecho vértebra a vértebra. Piernas pesadas.' } },
    ],
    tempoText: { tr: '2,5 sn kalk · 2,5 sn in', en: '2.5 s up · 2.5 s down', es: '2,5 s arriba · 2,5 s abajo' },
    mistakes: [
      { title: { tr: 'Boyun geriye bükülüyor', en: 'Cranking the neck back', es: 'Cuello hacia atrás' },
        fix: { tr: 'Ellerin önüne bak', en: 'Gaze ahead of the hands', es: 'Mira delante de las manos' },
        fixText: { tr: 'Boyun omurganın devamı, çene hafif içeride', en: 'Neck continues the spine, chin slightly in', es: 'Cuello en línea con la columna' },
        at: 'lift', pose: { neck: -42 }, marks: ['head'], parts: ['neck', 'face'] },
      { title: { tr: 'Bele yükleniyor', en: 'Dumping into the low back', es: 'Carga en la zona lumbar' },
        fix: { tr: 'Belden uzayarak kalk', en: 'Lengthen out of the waist', es: 'Alarga desde la cintura' },
        fixText: { tr: 'Karın mattan hafif kalkık, kaburgalar içeride', en: 'Belly lifted off the mat, ribs in', es: 'Abdomen activo, costillas adentro' },
        at: 'lift', pose: { lumbar: -26, thoracic: -12, neck: -14 }, line: ['pelvis', 'waist', 'neck'], parts: ['waist'] },
    ],
    cues: [{ tr: 'Belden uza', en: 'Lengthen out of the waist', es: 'Alarga la cintura' },
      { tr: 'Omuzlar kulaktan uzak', en: 'Shoulders away from the ears', es: 'Hombros lejos de las orejas' },
      { tr: 'Kasık matta', en: 'Pubic bone stays down', es: 'Pubis abajo' }],
  };
})();
