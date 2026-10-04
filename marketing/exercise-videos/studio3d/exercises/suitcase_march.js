/* Suitcase march: one dumbbell in the right hand, march in place (knee to hip height), torso stays vertical.
 * Feet: every pose carries ankle IK targets (position + foot frame) like farmer_walk.js: the stance foot keeps the
 * standing spot, the lifted foot uses its own FK spot; the pelvis shifts 2 cm over the stance foot. */
(function () {
  const STAND = { trunk: 0, hip: 0, knee: 0, abd: 2, neck: 0, shR: -2, shAbdR: 9, elR: 2, palmR: 'in', shL: 2, shAbdL: 6, elL: 8 };
  const lift = (S) => Object.assign({}, STAND, { ['hip' + S]: 90, ['knee' + S]: 90, ['flat' + S]: false, ['ankle' + S]: 0,
    pos: [0, 0, S === 'R' ? -0.02 : 0.02], _swing: S });
  const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };
  function pin(poses, extra) {
    const { solve, expand } = FB;
    const frame = (F) => ({ 0: F[0].slice(), 1: F[1].slice(), 2: F[2].slice() });
    const tgt = (s, k) => ({ at: s.J['ankle' + k].slice(), foot: frame(s.F['foot' + k]) });
    const s0 = solve(expand(poses.stand), CTX);
    const doPin = (p) => { const s = solve(expand(p), CTX); return { ankleL: p._swing === 'L' ? tgt(s, 'L') : tgt(s0, 'L'), ankleR: p._swing === 'R' ? tgt(s, 'R') : tgt(s0, 'R') }; };
    for (const [at, mp] of extra) mp.ik = doPin(Object.assign({}, poses[at], mp));
    for (const n in poses) { poses[n].ik = doPin(poses[n]); delete poses[n]._swing; }
    return poses;
  }
  window.EXERCISE = {
    id: 'suitcase_march',
    name: { tr: 'Suitcase March', en: 'Suitcase March', es: 'Marcha con maleta' },
    category: { tr: 'Karın · Denge', en: 'Core · Stability', es: 'Core · Estabilidad' },
    equipmentLabel: { tr: 'Dambıl (tek el)', en: 'Dumbbell (one hand)', es: 'Mancuerna (una mano)' },
    muscles: ['obliques', 'core', 'glutes', 'forearms'],
    tempo: '0.6-0.6',
    view: { yaw: 10, pitch: 6 },
    alt: { yaw: 90, pitch: 6, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
      text: { tr: 'Uyluk yere paralel, gövde dik', en: 'Thigh parallel to the floor, torso upright', es: 'Muslo paralelo al suelo, tronco erguido' } },
    setupMarks: [{ type: 'aline', joints: ['shoulderL', 'shoulderR'] }, { type: 'aline', joints: ['hipL', 'hipR'] }],
    contacts: ['ballL', 'ballR'],
    props: [['dumbbell', { grip: 'neutral', sides: ['R'] }]],
    ctx: CTX,
    get poses() { return this._poses || (this._poses = pin({ stand: Object.assign({}, STAND), liftL: lift('L'), liftR: lift('R') }, this.mistakes.map((m) => [m.at, m.pose]))); },
    rest: 'stand',
    rep: [
      { to: 'liftL', dur: 0.6, phase: 0 },
      { to: 'stand', dur: 0.6, phase: 1 },
      { to: 'liftR', dur: 0.6, phase: 0 },
      { to: 'stand', dur: 0.6, phase: 1 },
    ],
    setup: { tr: 'Dambılı sağ elde, valiz gibi yanda tut. Ayaklar kalça genişliğinde, omuz ve kalça düz. 30-45 sn sonra el değiştir.',
      en: 'Hold the dumbbell in your right hand like a suitcase. Feet hip-width, shoulders and hips level. Switch sides after 30-45 s.',
      es: 'Mancuerna en la mano derecha, como una maleta. Pies al ancho de cadera. Cambia de lado tras 30-45 s.' },
    phases: [
      { name: { tr: 'Dizi kaldır', en: 'Lift the knee', es: 'Sube la rodilla' }, breath: 'out', line: ['shoulderL', 'shoulderR'],
        text: { tr: 'Uyluk yere paralel olana kadar kaldır. Gövde ağırlığa doğru eğilmez.', en: 'Lift until the thigh is level. Don\'t lean toward the weight.', es: 'Sube hasta que el muslo quede horizontal. Sin inclinarte hacia el peso.' } },
      { name: { tr: 'Kontrollü indir', en: 'Lower', es: 'Baja' }, breath: 'in', line: ['hipL', 'hipR'],
        text: { tr: 'Ayağı yavaşça indir, diğer dizi kaldır. Dambıl sallanmaz.', en: 'Lower slowly, then lift the other knee. The dumbbell stays still.', es: 'Baja despacio y sube la otra rodilla. La mancuerna no se mueve.' } },
    ],
    tempoText: { tr: '0,6 sn kaldır · 0,6 sn indir', en: '0.6 s up · 0.6 s down', es: '0,6 s arriba · 0,6 s abajo' },
    mistakes: [
      { title: { tr: 'Ağırlığa doğru eğilmek', en: 'Leaning toward the weight', es: 'Inclinarse hacia el peso' },
        fix: { tr: 'Kaburgalar kalçanın üstünde', en: 'Ribs over hips', es: 'Costillas sobre la cadera' },
        fixText: { tr: 'Omuzlar düz; gerekirse daha hafif dambıl', en: 'Level shoulders; go lighter if needed', es: 'Hombros nivelados; usa menos peso si hace falta' },
        at: 'liftL', pose: { side: 14, neck: 0, headTurn: 0, shAbdR: 4 }, line: ['shoulderL', 'shoulderR'], parts: ['waist', 'chest'] },
      { title: { tr: 'Kalça yana kaçıyor', en: 'Hip shoves sideways', es: 'La cadera se desplaza' },
        fix: { tr: 'Dik ve ortada kal', en: 'Stay tall and centered', es: 'Erguida y centrada' },
        fixText: { tr: 'Kalça ve omuzlar aynı hizada, düz', en: 'Hips and shoulders stacked and level', es: 'Cadera y hombros alineados y nivelados' },
        at: 'liftL', pose: { side: -11, pos: [0, 0, 0.07], shrugL: 0.03 }, line: ['hipL', 'hipR'], parts: ['pelvis', 'waist'] },
    ],
    cues: [{ tr: 'Dik dur, eğilme', en: 'Stand tall, don\'t lean', es: 'Erguida, sin inclinarte' },
      { tr: 'Kaburgalar kalçanın üstünde', en: 'Ribs over hips', es: 'Costillas sobre la cadera' },
      { tr: 'Omuzlar ve kalça düz', en: 'Level shoulders and hips', es: 'Hombros y cadera nivelados' }],
  };
})();
