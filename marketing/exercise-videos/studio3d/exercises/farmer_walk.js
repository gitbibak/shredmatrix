/* Farmer's walk, shown as short quick steps in place (no travel, no sliding feet).
 * Every pose carries ankle IK targets (position + foot frame): the stance foot keeps the standing spot, the swing foot
 * uses its own FK spot, so it lifts on a straight line while the pelvis shifts 2.5 cm over the stance foot (`pos`).
 * (ctx.plant + `unplant` would also work visually, but dev/qa.mjs then reports the unplanted ankle as off target.)
 * Every step returns to the standing pose before the other foot lifts.
 * Dumbbells hang at the sides (neutral grip, arms straight, ~8 cm from the thighs). */
(function () {
  const ARMS = { sh: -4, shAbd: 9, el: 2, palm: 'in', neck: 0 };
  const STAND = Object.assign({ trunk: 0, hip: 0, knee: 0, abd: 3 }, ARMS);
  const step = (S, O) => Object.assign({}, STAND, {
    ['hip' + S]: 26, ['knee' + S]: 50, ['flat' + S]: false, ['ankle' + S]: 10, ['knee' + O]: 4, ['hip' + O]: -2,
    trunk: 2, pos: [0, 0, S === 'R' ? -0.025 : 0.025], _swing: S,
  });
  const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };
  function pin(poses) {
    const { solve, expand } = FB;
    const frame = (F) => ({ 0: F[0].slice(), 1: F[1].slice(), 2: F[2].slice() });
    const tgt = (s, k) => ({ at: s.J['ankle' + k].slice(), foot: frame(s.F['foot' + k]) });
    const s0 = solve(expand(poses.stand), CTX);
    for (const n in poses) {
      const p = poses[n], s = solve(expand(p), CTX);
      p.ik = { ankleL: p._swing === 'L' ? tgt(s, 'L') : tgt(s0, 'L'), ankleR: p._swing === 'R' ? tgt(s, 'R') : tgt(s0, 'R') };
      delete p._swing;
    }
    return poses;
  }
  window.EXERCISE = {
    id: 'farmer_walk',
    name: { tr: 'Farmer Walk', en: 'Farmer\'s Walk', es: 'Paseo del granjero' },
    category: { tr: 'Tüm vücut · Kavrama', en: 'Full body · Grip', es: 'Cuerpo completo · Agarre' },
    equipmentLabel: { tr: '2 ağır dambıl', en: '2 heavy dumbbells', es: '2 mancuernas pesadas' },
    muscles: ['forearms', 'upperback', 'core', 'glutes', 'calves'],
    tempo: '0.55',
    view: { yaw: 35, pitch: 7 },
    alt: { yaw: 90, pitch: 6, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
      text: { tr: 'Kulak, omuz ve kalça aynı çizgide', en: 'Ear, shoulder and hip stacked', es: 'Oreja, hombro y cadera en línea' } },
    setupMarks: [{ type: 'aline', joints: ['shoulderL', 'shoulderR'] }],
    props: [['dumbbell', { grip: 'neutral' }]],
    ctx: CTX,
    contacts: ['ballL', 'ballR'],
    get poses() { return this._poses || (this._poses = pin({ stand: Object.assign({}, STAND), stepR: step('R', 'L'), stepL: step('L', 'R') })); },
    rest: 'stand',
    rep: [
      { to: 'stepR', dur: 0.3, phase: 0 },
      { to: 'stand', dur: 0.25, phase: 0 },
      { to: 'stepL', dur: 0.3, phase: 1 },
      { to: 'stand', dur: 0.25, phase: 1 },
    ],
    setup: { tr: 'Dambılları kalçadan katlanarak, sırt düz al. Dik dur, omuzlar geride ve aşağıda, karın sıkı.',
      en: 'Pick the dumbbells up with a hip hinge, flat back. Stand tall, shoulders back and down, brace.',
      es: 'Levanta las mancuernas con bisagra de cadera, espalda recta. Erguida, hombros atrás y abajo.' },
    phases: [
      { name: { tr: 'Kısa adım', en: 'Short step', es: 'Paso corto' }, breath: 'easy', line: ['shoulderL', 'shoulderR'],
        text: { tr: 'Kısa ve hızlı adımlar. Omuzlar düz, dambıllar sallanmaz.', en: 'Short, quick steps. Shoulders level, the weights don\'t swing.', es: 'Pasos cortos y rápidos. Hombros nivelados, sin balancear el peso.' } },
      { name: { tr: 'Diğer adım', en: 'Next step', es: 'Siguiente paso' }, breath: 'easy', line: ['shoulderL', 'shoulderR'],
        text: { tr: 'Gövde dik ve sıkı. Kulplarını sıkıca kavra.', en: 'Torso tall and braced. Crush the handles.', es: 'Tronco erguido y firme. Aprieta las asas.' } },
    ],
    tempoText: { tr: 'Saniyede ~2 kısa adım · 20-40 sn yürü', en: '~2 short steps per second · walk 20-40 s', es: '~2 pasos cortos por segundo · camina 20-40 s' },
    mistakes: [
      { title: { tr: 'Öne eğilmek, baş önde', en: 'Leaning forward, head out', es: 'Inclinarse, cabeza adelantada' },
        fix: { tr: 'Göğüs yukarı, bakış ileri', en: 'Chest up, eyes forward', es: 'Pecho arriba, mirada al frente' },
        fixText: { tr: 'Kaburgalar kalçanın üstünde', en: 'Ribs stacked over the hips', es: 'Costillas sobre la cadera' },
        at: 'stand', pose: { trunk: 7, thoracic: 7, neck: -18, hip: 5, sh: -8 }, view: { yaw: 90, pitch: 6 }, line: ['pelvis', 'neck', 'head'], goodLine: ['pelvis', 'neck'], parts: ['chest', 'neck'] },
      { title: { tr: 'Omuzlar kulaklara kalkıyor', en: 'Shoulders shrug up', es: 'Hombros encogidos' },
        fix: { tr: 'Omuzlar aşağı ve geri', en: 'Shoulders down and back', es: 'Hombros abajo y atrás' },
        fixText: { tr: 'Boyun uzun, kürek kemikleri arka cepte', en: 'Long neck, shoulder blades in your back pockets', es: 'Cuello largo, escápulas hacia abajo' },
        at: 'stand', pose: { shrug: 0.055, protract: 0.02, neck: 6 }, view: { yaw: 12, pitch: 6 }, marks: ['shoulderL', 'shoulderR'], parts: ['upper', 'neck'] },
    ],
    cues: [{ tr: 'Dik dur, omuzlar aşağıda', en: 'Tall, shoulders down', es: 'Erguida, hombros abajo' },
      { tr: 'Kısa, hızlı adımlar', en: 'Short, quick steps', es: 'Pasos cortos y rápidos' },
      { tr: 'Kulpları sık, sallama', en: 'Crush the handles, no swing', es: 'Aprieta, sin balanceo' }],
  };
})();
