/* Single-leg calf raise on a step edge (right foot works, near the camera), left foot lifted behind (knee 90).
 * Ball of the right foot rests on the step (ground ballR, anchored), heel hangs off (`flat: false`).
 * Balance: fingertips of the right hand on a rail in front (`pole` prop; a `wall` prop is 2.6 m tall and would shrink the
 * framing), hand on a fixed world target, so the elbow bends a little as the body rises.
 * The rig has no toe joint: at the top the ball rides 1.8 cm higher so the rigid shoe tip does not dip into the step. */
(function () {
  const STEP = 0.2;
  const RAIL = [0.235, 0, 0.32];   // beside the step (step half-width 0.25)
  const HAND = { handR: { at: [RAIL[0] - 0.035, 1.24, RAIL[2] - 0.02] } };
  const BASE = { trunk: 0, hip: 0, knee: 0, abd: 2, flatR: false, neck: 0,
    hipL: -6, kneeL: 90, flatL: false, ankleL: -25, abdL: 0,
    shL: -2, shAbdL: 8, elL: 8, ik: HAND, elbowPoleR: [-0.4, -1, 0.5], palmR: 'in', curlR: 0.45, ground: [['ballR', STEP]] };
  window.EXERCISE = {
    id: 'single_leg_calf_raise',
    name: { tr: 'Tek Bacak Calf Raise', en: 'Single-Leg Calf Raise', es: 'Elevación de talón a una pierna' },
    category: { tr: 'Bacak · Baldır', en: 'Legs · Calves', es: 'Piernas · Gemelos' },
    equipmentLabel: { tr: 'Step · Destek', en: 'Step · Rail', es: 'Step · Apoyo' },
    muscles: ['calves'],
    tempo: '1.5-1-1',
    view: { yaw: 90, pitch: 4 },
    alt: { yaw: 150, pitch: 10, title: { tr: 'Arkadan çapraz', en: 'Rear angle', es: 'Vista trasera' },
      text: { tr: 'Bilek dik, topuk düz yukarı', en: 'Ankle stacked, heel rises straight', es: 'Tobillo alineado, talón recto arriba' } },
    setupView: { yaw: 140, pitch: 14 },
    contacts: ['ballR', 'handR'],
    props: [['step', { at: [0.17, 0, 0], size: [0.4, STEP, 0.5] }], ['pole', { at: RAIL, height: 1.3 }]],
    ctx: { anchorX: ['ballR'], anchorAt: [0, 0.1] },
    poses: {
      start: Object.assign({}, BASE, { ankleR: 0 }),
      bottom: Object.assign({}, BASE, { ankleR: 15 }),
      top: Object.assign({}, BASE, { ankleR: -48, ground: [['ballR', STEP + 0.018]] }),
    },
    rest: 'start',
    rep: [
      { to: 'bottom', dur: 1.5, phase: 0 },
      { to: 'top', dur: 1.0, phase: 1 },
      { to: 'top', dur: 1.0, phase: 2 },
    ],
    setup: { tr: 'Sağ ayağın ön kısmı step kenarında, sol ayak arkada, diz 90°. Parmak uçlarıyla desteğe hafifçe dokun. Sonra taraf değiştir.',
      en: 'Right forefoot on the step edge, left foot up behind, knee 90°. Fingertips lightly on the rail. Then switch sides.',
      es: 'Antepié derecho en el borde, pie izquierdo atrás, rodilla a 90°. Dedos en el apoyo. Luego cambia de lado.' },
    phases: [
      { name: { tr: 'Esnet', en: 'Stretch', es: 'Estira' }, breath: 'in', line: ['heelR', 'ballR'],
        text: { tr: 'Topuğu stepin altına yavaşça indir, diz düz.', en: 'Slowly lower the heel below the step, knee straight.', es: 'Baja el talón bajo el step despacio, rodilla recta.' } },
      { name: { tr: 'Yüksel', en: 'Rise', es: 'Sube' }, breath: 'out', line: ['kneeR', 'ankleR', 'ballR'],
        text: { tr: 'Ayak ucuna olabildiğince yüksel. Desteğe yüklenme.', en: 'Press up as high as you can. Don\'t lean on the rail.', es: 'Sube lo más alto posible. No te apoyes en la barra.' } },
      { name: { tr: 'Tepede tut', en: 'Hold the top', es: 'Mantén arriba' }, breath: 'hold',
        text: { tr: 'Baldırı 1 sn sık, sonra yavaşça in.', en: 'Squeeze for 1 s, then lower slowly.', es: 'Aprieta 1 s y baja despacio.' } },
    ],
    tempoText: { tr: '1,5 sn in · 1 sn yüksel · 1 sn tut', en: '1.5 s down · 1 s up · 1 s hold', es: '1,5 s abajo · 1 s arriba · 1 s mantén' },
    mistakes: [
      { title: { tr: 'Destekten çekerek kalkmak', en: 'Pulling up on the rail', es: 'Tirar de la barra para subir' },
        fix: { tr: 'Sadece parmak uçları', en: 'Fingertips only', es: 'Solo la punta de los dedos' },
        fixText: { tr: 'Gövde dik, işi baldır yapar', en: 'Torso upright, the calf does the work', es: 'Tronco erguido, trabaja el gemelo' },
        at: 'top', pose: { trunk: 12, hip: 10, shrugR: 0.035, ik: { handR: { at: [RAIL[0] - 0.035, 1.19, RAIL[2] - 0.02] } } }, marks: ['handR', 'shoulderR'], line: ['pelvis', 'neck'], parts: ['upperR', 'foreR'] },
      { title: { tr: 'Sekerek yarım tekrar', en: 'Bouncing half reps', es: 'Rebotes cortos' },
        fix: { tr: 'Altta ve üstte dur', en: 'Pause at the bottom and top', es: 'Pausa abajo y arriba' },
        fixText: { tr: 'Tam esnet, tam yüksel', en: 'Full stretch, full rise', es: 'Estira y sube del todo' },
        at: 'top', pose: { ankleR: -12, ground: [['ballR', STEP + 0.005]] }, marks: ['heelR'], line: ['heelR', 'ballR'], parts: ['shinR'] },
    ],
    cues: [{ tr: 'Tam esnet, tam yüksel', en: 'Full stretch, full rise', es: 'Estira y sube del todo' },
      { tr: 'Desteğe yüklenme', en: 'Don\'t lean on the rail', es: 'No te cuelgues de la barra' },
      { tr: 'Yavaş in', en: 'Slow lowering', es: 'Baja despacio' }],
  };
})();
