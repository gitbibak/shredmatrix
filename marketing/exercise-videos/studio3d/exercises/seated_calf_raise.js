/* Seated calf raise machine (seatedCalf prop: seat, knee pad on the thighs above the knees, foot block under the balls).
 * Pelvis on the seat (single ground contact, anchored). Built lazily: the seat height is solved so the balls of the feet
 * rest on the block top (0.10 m) with knees at 90; every pose then pins the ball of each foot to that spot with ankle IK
 * targets (position + foot frame), so plantarflexion lifts the heels, the knees and the pad while the pelvis stays seated.
 * Hands rest on the knee pad (targets follow the pose's knees). */
(function () {
  const BLOCK = 0.1;
  const BASE = { trunk: 0, hip: 90, knee: 90, abd: 4, flat: false, neck: 4, elbowPole: [-0.2, -1, 0.6], curl: 0.8, palm: 'down' };
  const bis = (f, lo, hi, n = 40) => { for (let i = 0; i < n; i++) { const m = (lo + hi) / 2; if (f(m) > 0) hi = m; else lo = m; } return (lo + hi) / 2; };
  const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };
  let SEAT = 0.5;

  function build(extra) {
    const { solve, expand, V } = FB;
    const frame = (F) => ({ 0: F[0].slice(), 1: F[1].slice(), 2: F[2].slice() });
    const sv = (p) => solve(expand(Object.assign({}, p, { ik: undefined })), CTX);
    const g = (h) => [['pelvis', h]];
    SEAT = bis((h) => sv(Object.assign({}, BASE, { ankle: 0, ground: g(h) })).J.ballR[1] - BLOCK, 0.3, 0.7);
    const ref = sv(Object.assign({}, BASE, { ankle: 0, ground: g(SEAT) }));
    // dy: the rig has no toe joint, so on tiptoe the ball rides a little higher to keep the rigid shoe tip out of the block
    const pin = (p, dy = 0) => {
      p.ground = g(SEAT);
      const s = sv(p), ik = {};
      for (const k of ['L', 'R']) ik['ankle' + k] = { at: V.add(s.J['ankle' + k], V.sub(V.add(ref.J['ball' + k], [0, dy, 0]), s.J['ball' + k])), foot: frame(s.F['foot' + k]) };
      p.ik = ik;
      const s2 = solve(expand(p), CTX);
      for (const k of ['L', 'R']) { const sg = k === 'R' ? 1 : -1; ik['hand' + k] = { at: V.add(s2.J['knee' + k], [-0.1, 0.17, sg * 0.04]) }; }
      return p;
    };
    const poses = { start: pin(Object.assign({}, BASE, { ankle: 0 })), bottom: pin(Object.assign({}, BASE, { ankle: 20 })), top: pin(Object.assign({}, BASE, { ankle: -45 }), 0.025) };
    for (const [at, mp] of extra) { const m = pin(Object.assign({}, poses[at], mp), mp.ankle !== undefined ? 0.008 : 0.025); mp.ik = m.ik; mp.ground = m.ground; }
    return poses;
  }

  window.EXERCISE = {
    id: 'seated_calf_raise',
    name: { tr: 'Oturarak Calf Raise', en: 'Seated Calf Raise', es: 'Elevación de talones sentado' },
    category: { tr: 'Bacak · Baldır', en: 'Legs · Calves', es: 'Piernas · Gemelos' },
    equipmentLabel: { tr: 'Seated calf makinesi', en: 'Seated calf machine', es: 'Máquina de gemelo sentado' },
    muscles: ['calves'],
    tempo: '1.5-1-1',
    view: { yaw: 90, pitch: 6, zoom: 1.05 },
    alt: { yaw: 22, pitch: 10, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
      text: { tr: 'Topuklar düz yukarı, dizler pedin altında', en: 'Heels straight up, knees under the pad', es: 'Talones rectos, rodillas bajo el soporte' } },
    setupView: { yaw: 40, pitch: 14 },
    contacts: ['pelvis', 'ballR'],
    props: [['seatedCalf', { at: [0, 0, 0], get seatH() { return SEAT; } }]],
    ctx: CTX,
    get poses() { return this._poses || (this._poses = build(this.mistakes.map((m) => [m.at, m.pose]))); },
    rest: 'start',
    rep: [
      { to: 'bottom', dur: 1.5, phase: 0 },
      { to: 'top', dur: 1.0, phase: 1 },
      { to: 'top', dur: 1.0, phase: 2 },
    ],
    setup: { tr: 'Dik otur, dizler 90° ve pedin altında. Ayak tabanının ön kısmı platformda, topuklar boşta.',
      en: 'Sit tall, knees at 90° under the pad. Balls of the feet on the platform, heels hanging.',
      es: 'Siéntate erguida, rodillas a 90° bajo el soporte. Metatarsos en la plataforma, talones libres.' },
    phases: [
      { name: { tr: 'Esnet', en: 'Stretch', es: 'Estira' }, breath: 'in', line: ['heelR', 'ballR'],
        text: { tr: 'Topukları olabildiğince indir, altta 1 sn bekle.', en: 'Lower the heels as far as you can and pause 1 s.', es: 'Baja los talones al máximo y pausa 1 s.' } },
      { name: { tr: 'Yüksel', en: 'Rise', es: 'Sube' }, breath: 'out', line: ['heelR', 'ballR'],
        text: { tr: 'Ayak ucundan iterek pedi yukarı kaldır.', en: 'Push through the balls of the feet to lift the pad.', es: 'Empuja con los metatarsos y sube el soporte.' } },
      { name: { tr: 'Tepede sık', en: 'Squeeze', es: 'Aprieta' }, breath: 'hold',
        text: { tr: 'Baldırı 1 sn sık. Sekme yok.', en: 'Squeeze the calves for 1 s. No bouncing.', es: 'Aprieta 1 s. Sin rebotes.' } },
    ],
    tempoText: { tr: '1,5 sn in · 1 sn yüksel · 1 sn sık', en: '1.5 s down · 1 s up · 1 s squeeze', es: '1,5 s abajo · 1 s arriba · 1 s aprieta' },
    mistakes: [
      { title: { tr: 'Yarım hareket', en: 'Partial range', es: 'Recorrido parcial' },
        fix: { tr: 'Tam esnet, tam yüksel', en: 'Full stretch, full rise', es: 'Estira y sube del todo' },
        fixText: { tr: 'Altta 1 sn dur, sekmeden kalk', en: 'Pause 1 s at the bottom, no bounce', es: 'Pausa 1 s abajo, sin rebote' },
        at: 'top', pose: { ankle: -12 }, marks: ['heelR'], line: ['heelR', 'ballR'], parts: ['shinR'] },
      { title: { tr: 'Gövdeyle sallanmak', en: 'Rocking the torso', es: 'Balancear el tronco' },
        fix: { tr: 'Dik otur, sadece bilekler', en: 'Sit still, move only the ankles', es: 'Quieta, solo los tobillos' },
        fixText: { tr: 'Gerekirse yükü azalt', en: 'Lighten the load if needed', es: 'Baja el peso si hace falta' },
        at: 'top', pose: { trunk: -16, hip: 76, neck: -8 }, marks: ['neck'], line: ['pelvis', 'neck'], parts: ['chest', 'waist'] },
    ],
    cues: [{ tr: 'Tam esnet', en: 'Full stretch', es: 'Estira del todo' },
      { tr: 'Altta dur, sekme', en: 'Pause, no bouncing', es: 'Pausa, sin rebote' },
      { tr: 'Ayak ucunda yüksel', en: 'Rise high on the toes', es: 'Sube alto' }],
  };
})();
