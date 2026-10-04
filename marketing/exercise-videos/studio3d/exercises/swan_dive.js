/* Swan dive (Pilates mat, prone). Hands as swan_prep.js: rest/press palms planted (world IK target from the rest pose, flat
 * hand). In the dive/rock poses the arms reach overhead; to avoid a plant/free switch they also carry ik targets = their own
 * FK hand positions and stay in flat-hand mode with handSurface = target height (bird_dog.js trick): palms level, no pop.
 * Single ground contact (pelvis) so the body can rock on the belly: "arms forward" keeps the chest up (trunk 86),
 * "rock" tips it forward (trunk 93) while the legs lift higher (spec rock_back: thoracic 15, hip -30). */
(function () {
  const G = [['pelvis', 0.012]];
  const PRONE = { trunk: 85, hip: -3.5, knee: 0, ankle: -52, flat: false, abd: 2, neck: 8, curl: 0.15,
    pole: { elbowL: [-0.6, 1, -0.25], elbowR: [-0.6, 1, 0.25] }, ground: G };
  const CTX = { anchorX: ['pelvis'], anchorAt: [-0.1, 0] };
  const REST = Object.assign({}, PRONE, { handFlat: true, holdL: [0.1, 0.38, 0.19], holdR: [0.1, 0.38, 0.19] });
  const PRESS = Object.assign({}, PRONE, { handFlat: true, thoracic: -28, lumbar: -17, neck: -12, protract: -0.02 });
  const FWD = Object.assign({}, PRONE, { trunk: 86, thoracic: -30, lumbar: -16, neck: -8, hip: -18, shAbd: 168, sh: -16, el: 2, handFlat: true, curl: 0.05 });
  const ROCK = Object.assign({}, FWD, { trunk: 93, thoracic: -15, lumbar: -20, hip: -24, neck: -2 });
  function build(mistakes) {
    const { solve, expand } = FB;
    const s = solve(expand(REST), CTX);
    const ikP = { handL: { at: [s.J.handL[0], 0.006, s.J.handL[2]] }, handR: { at: [s.J.handR[0], 0.006, s.J.handR[2]] } };
    const own = (p) => { const q = solve(expand(Object.assign({}, p)), CTX); return { handL: { at: q.J.handL.slice() }, handR: { at: q.J.handR.slice() } }; };
    const strip = (p, ik) => { const o = Object.assign({}, p, { ik }); delete o.holdL; delete o.holdR; return o; };
    // free hands keep the flat-hand mode (no flat/free switch pop): palm level, its "surface" = the target height
    const air = (p) => { const ik = own(p); return Object.assign(strip(p, ik), { handSurfaceL: ik.handL.at[1] - 0.022, handSurfaceR: ik.handR.at[1] - 0.022 }); };
    const poses = { rest: strip(REST, ikP), press: strip(PRESS, ikP), fwd: air(FWD), rock: air(ROCK) };
    for (const [at, mp] of mistakes) {
      if (at === 'press' || at === 'rest') { mp.ik = ikP; continue; }
      const a = air(Object.assign({}, at === 'fwd' ? FWD : ROCK, mp)); mp.ik = a.ik; mp.handSurfaceL = a.handSurfaceL; mp.handSurfaceR = a.handSurfaceR;
    }
    return poses;
  }
  window.EXERCISE = {
    id: 'swan_dive',
    name: { tr: 'Kuğu Dalışı (Swan Dive)', en: 'Swan Dive', es: 'Salto del cisne (swan dive)' },
    category: { tr: 'Pilates · Sırt', en: 'Pilates · Back', es: 'Pilates · Espalda' },
    equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
    muscles: ['lowerback', 'glutes', 'hamstrings', 'upperback'],
    tempo: '2-1-1-2',
    view: { yaw: 90, pitch: 8, zoom: 1.15 },
    alt: { yaw: 35, pitch: 24, title: { tr: 'Önden çapraz', en: 'Front angle', es: 'Vista frontal' },
      text: { tr: 'Bacaklar bitişik, sallanma karından', en: 'Legs together, rock from the belly', es: 'Piernas juntas, balanceo desde el abdomen' } },
    setupView: { yaw: 40, pitch: 40 },
    props: [['mat', { at: [0.0, 0.006, 0], length: 2.3, width: 0.7 }]],
    ctx: CTX,
    contacts: ['chest', 'pelvis', 'handL', 'handR', 'toeL', 'toeR'],
    get poses() { return this._poses || (this._poses = build(this.mistakes.map((m) => [m.at, m.pose]))); },
    rest: 'rest',
    rep: [
      { to: 'press', dur: 2.0, phase: 0 },
      { to: 'fwd', dur: 1.0, phase: 1 },
      { to: 'rock', dur: 1.0, phase: 2 },
      { to: 'rest', dur: 2.0, phase: 3 },
    ],
    setup: { tr: 'Yüzüstü uzan, bacaklar bitişik. Eller göğsün yanında, dirsekler bükülü.',
      en: 'Lie face down, legs together. Hands beside the chest, elbows bent.',
      es: 'Boca abajo, piernas juntas. Manos junto al pecho, codos flexionados.' },
    phases: [
      { name: { tr: 'Kuğuya it', en: 'Press to swan', es: 'Empuja al cisne' }, breath: 'in', line: ['pelvis', 'waist', 'neck'],
        text: { tr: 'Nefes al, kolları neredeyse düzleşene kadar it. Kalça ve bacaklar matta.', en: 'Inhale and press until the arms are nearly straight. Hips and legs stay down.', es: 'Inhala y empuja hasta casi estirar los brazos. Cadera y piernas abajo.' } },
    { name: { tr: 'Kolları öne sal', en: 'Arms forward', es: 'Brazos al frente' }, breath: 'out',
        text: { tr: 'Nefes ver, elleri bırak; kollar kulak hizasında öne uzanır, bacaklar kalkar.', en: 'Exhale, release the hands; arms reach forward by the ears, legs lift.', es: 'Exhala, suelta las manos; brazos junto a las orejas, piernas arriba.' } },
      { name: { tr: 'Öne sallan', en: 'Rock', es: 'Balancea' }, breath: 'in',
        text: { tr: 'Karnın üstünde sallanma atı gibi: göğüs iner, bacaklar yükselir.', en: 'Like a rocking horse on the belly: chest goes down, legs go up.', es: 'Como un caballito sobre el abdomen: baja el pecho, suben las piernas.' } },
      { name: { tr: 'Yerleş ve in', en: 'Place and lower', es: 'Apoya y baja' }, breath: 'out',
        text: { tr: 'Elleri yerleştir, kontrollü şekilde başlangıca in.', en: 'Place the hands and lower with control to the start.', es: 'Apoya las manos y baja con control.' } },
    ],
    tempoText: { tr: '2 sn it · 1 sn öne · 1 sn sallan · 2 sn in', en: '2 s press · 1 s forward · 1 s rock · 2 s lower', es: '2 s empuja · 1 s adelante · 1 s balanceo · 2 s baja' },
    tempoReps: 1,
    mistakes: [
      { title: { tr: 'Bele yükleniyor', en: 'Dumping into the low back', es: 'Carga en la zona lumbar' },
        fix: { tr: 'Önce göğsü kaldır', en: 'Lift the chest first', es: 'Primero el pecho' },
        fixText: { tr: 'Kalçayı sık, kavis göğüsten başlasın', en: 'Glutes on, the arch starts in the upper back', es: 'Glúteos activos, el arco empieza arriba' },
        at: 'press', pose: { thoracic: -14, lumbar: -36, neck: -22 }, line: ['pelvis', 'waist', 'neck'], parts: ['waist'] },
      { title: { tr: 'Bacaklar açılıyor', en: 'Legs spread', es: 'Las piernas se separan' },
        fix: { tr: 'İç bacakları sık', en: 'Squeeze the inner thighs', es: 'Aprieta los aductores' },
        fixText: { tr: 'Bacaklar bitişik ve aktif', en: 'Legs together and active', es: 'Piernas juntas y activas' },
        at: 'fwd', pose: { abd: 16 }, view: { yaw: 150, pitch: 30 }, marks: ['ankleL', 'ankleR'], parts: ['thigh', 'shin'] },
    ],
    cues: [{ tr: 'Omurgadan uzun uzan', en: 'Reach long out of the spine', es: 'Alarga la columna' },
      { tr: 'Bacaklar bitişik ve aktif', en: 'Legs together and active', es: 'Piernas juntas y activas' },
      { tr: 'Karından sallan', en: 'Rock from the belly', es: 'Balancéate desde el abdomen' }],
  };
})();
