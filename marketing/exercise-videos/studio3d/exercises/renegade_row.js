/* Renegade row (right arm rows, left arm supports). High plank on two hex dumbbells, feet wide.
 * Two ground contacts [handL, toeR] in every pose. Hands grip the handles (handFlat false: the fist sits on the handle,
 * 5.4 cm above the floor = dumbbell head radius). Left hand: ctx.plant. Right hand: holdR (thorax frame) in BOTH poses;
 * the plank value is the floor handle position converted into the thorax frame (built lazily once FB.BODY is set),
 * so the row is one smooth hold interpolation from the floor to the lower ribs. */
(function () {
  const HY = 0.025;                     // ground surface for the fist: hand centre 5.5 cm up (dumbbell head radius 5.2 cm)
  const CTX = { anchorX: ['toeL', 'toeR'], anchorAt: [-0.4, 0] };
  const G = [['handL', HY], ['toeR', 0]];
  const BASE = { trunk: 70, sh: 70, shAbd: 10, el: 0, ankle: -36, abd: 11, neck: -8, flat: false, handFlat: false, curl: 1,
    ground: G, elbowPoleL: [-0.3, -1, 0.75], elbowPoleR: [-1, -0.5, 0.35] };

  function build(mistakes) {
    const { solve, expand, V, M } = FB;
    const s = solve(expand(BASE), CTX);
    // right handle: mirror of the left fist (z), same height
    const at = [s.J.handL[0], s.J.handL[1], -s.J.handL[2] + 2 * s.J.pelvis[2]];
    const T = s.F.thorax, d = V.sub(at, s.J.chest);
    const hold = [V.dot(d, T[0]), V.dot(d, T[1]), V.dot(d, T[2])];
    const plank = Object.assign({}, BASE, { holdR: hold });
    const row = Object.assign({}, BASE, { holdR: [0.29, -0.15, 0.18], twist: -4 });
    return { plank, row };
  }

  window.EXERCISE = {
    id: 'renegade_row',
    name: { tr: 'Renegade Row', en: 'Renegade Row', es: 'Remo renegado' },
    category: { tr: 'Sırt · Core', en: 'Back · Core', es: 'Espalda · Core' },
    equipmentLabel: { tr: 'Dambıl', en: 'Dumbbells', es: 'Mancuernas' },
    muscles: ['lats', 'upperback', 'core', 'obliques'],
    tempo: '1.2-0-1.5',
    view: { yaw: 40, pitch: 14 },
    alt: { yaw: 90, pitch: 6, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
      text: { tr: 'Dirsek kalçaya doğru, gövde tek çizgi', en: 'Elbow toward the hip, body in one line', es: 'Codo hacia la cadera, cuerpo en línea' } },
    setupView: { yaw: 20, pitch: 22 },
    setupMarks: [{ type: 'span', joints: ['ankleR', 'ankleL'], label: { tr: 'Ayaklar geniş', en: 'Feet wide', es: 'Pies separados' } }],
    contacts: ['handL', 'handR', 'toeL', 'toeR'],
    props: [['dumbbell', { grip: 'neutral', headR: 0.052 }]],
    ctx: Object.assign({ plant: ['handL'] }, CTX),
    get poses() { return this._poses || (this._poses = build()); },
    rest: 'plank',
    rep: [
      { to: 'row', dur: 1.2, phase: 0 },
      { to: 'plank', dur: 1.5, phase: 1 },
    ],
    setup: { tr: 'Dambıllar omuzların altında, yüksek plank. Ayaklar kalçadan geniş, vücut tek çizgi. Sonra kol değiştir.',
      en: 'High plank on dumbbells under the shoulders. Feet wider than hips, body in one line. Then switch arms.',
      es: 'Plancha alta sobre mancuernas bajo los hombros. Pies anchos, cuerpo en línea. Luego cambia de brazo.' },
    phases: [
      { name: { tr: 'Çek', en: 'Row', es: 'Rema' }, breath: 'out', arc: ['shoulderR', 'elbowR', 'wristR'],
        text: { tr: 'Karnı sık, dambılı kaburgalara çek. Dirsek kalçaya, destek kolu düz.', en: 'Brace and row to the ribs. Elbow toward the hip, support arm straight.', es: 'Aprieta y rema a las costillas. Codo hacia la cadera, brazo de apoyo recto.' } },
    { name: { tr: 'İndir', en: 'Lower', es: 'Baja' }, breath: 'in', line: ['ankleR', 'pelvis', 'shoulderR'],
        text: { tr: 'Dambılı kontrollü yere koy. Kalça hep aynı yükseklikte.', en: 'Set the dumbbell down with control. Hips stay level.', es: 'Apoya la mancuerna con control. Cadera nivelada.' } },
    ],
    tempoText: { tr: '1 sn çek · 1,5 sn indir', en: '1 s row · 1.5 s lower', es: '1 s rema · 1,5 s baja' },
    mistakes: [
      { title: { tr: 'Gövde yana açılıyor', en: 'Hips and torso rotate', es: 'El tronco gira' },
        fix: { tr: 'Ayakları aç, hafif dambıl seç', en: 'Wider feet, lighter weight', es: 'Pies más abiertos, menos peso' },
        fixText: { tr: 'Kalça ve omuzlar yere paralel kalır', en: 'Hips and shoulders stay parallel to the floor', es: 'Cadera y hombros paralelos al suelo' },
        at: 'row', pose: { twist: -24 }, view: { yaw: 10, pitch: 18 }, line: ['hipL', 'hipR'], marks: ['hipR'], parts: ['pelvis', 'chest'] },
      { title: { tr: 'Kalça yukarı kalkıyor', en: 'Hips pike up', es: 'La cadera sube' },
        fix: { tr: 'Karnı sık, kalçayı indir', en: 'Brace, bring the hips down', es: 'Aprieta y baja la cadera' },
        fixText: { tr: 'Omuz, kalça ve topuk tek çizgide', en: 'Shoulder, hip and heel in one line', es: 'Hombro, cadera y talón en línea' },
        at: 'row', pose: { trunk: 62, hip: 22, ankle: -42 }, view: { yaw: 90, pitch: 6 }, line: ['ankleR', 'pelvis', 'shoulderR'], marks: ['pelvis'], parts: ['pelvis', 'waist'] },
    ],
    cues: [{ tr: 'Ayaklar geniş', en: 'Feet wide', es: 'Pies separados' },
      { tr: 'Kalça yere paralel', en: 'Hips level', es: 'Cadera nivelada' },
      { tr: 'Dirsek kalçaya, dönme', en: 'Elbow to the hip, no twisting', es: 'Codo a la cadera, sin girar' }],
  };
})();
