/* Two-hand kettlebell swing (hard-style hinge). Feet planted, arms FK (straight "ropes"), hands together on one handle.
 * Engine limit worked around here: the stock `kettlebell` prop always hangs the bell straight down from the hands, which is
 * wrong for a swing (at the float and in the backswing the bell sits in line with the arms). This file registers a local
 * prop `swingBell` (bell body along the mean forearm direction, handle across both fists). */
(function () {
  const { V } = FB;
  FB.PROPS.swingBell = FB.PROPS.swingBell || function (sol) {
    const c = V.lerp(sol.J.handL, sol.J.handR, 0.5);
    const d = V.norm(V.add(sol.F.armL.fd, sol.F.armR.fd));
    const side = [0, 0, 1];
    const bell = V.add(c, V.mul(d, 0.15));
    sol.grip = { L: side, R: side }; sol.gripKind = 'pronated';
    const p = (a, b) => V.add(c, V.add(V.mul(d, a), V.mul(side, b)));
    return [{ t: 'sph', c: bell, r: 0.1, m: 'iron' },
      { t: 'tube', pts: [p(0.075, -0.075), p(0.0, -0.07), p(-0.022, 0), p(0.0, 0.07), p(0.075, 0.075)], r: 0.013, m: 'iron' }];
  };

  const ARMS = { shAbd: -11, el: 0, shRot: 0 };
  window.EXERCISE = {
    id: 'kettlebell_swing',
    name: { tr: 'Kettlebell Swing', en: 'Kettlebell Swing', es: 'Swing con kettlebell' },
    category: { tr: 'Bacak · Kalça', en: 'Legs · Glutes', es: 'Piernas · Glúteos' },
    equipmentLabel: { tr: 'Kettlebell', en: 'Kettlebell', es: 'Kettlebell' },
    muscles: ['glutes', 'hamstrings', 'core', 'lowerback'],
    tempo: '0.35-0.15-0.6',  // spec tempo (see tempoText: slowed on screen)
    view: { yaw: 90, pitch: 6 },
    alt: { yaw: 18, pitch: 7, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
      text: { tr: 'Çan bacakların arasından geçer, kollar gevşek', en: 'Bell passes between the legs, arms relaxed', es: 'La pesa pasa entre las piernas, brazos sueltos' } },
    setupView: { yaw: 30, pitch: 12 },
    setupMarks: [{ type: 'span', joints: ['ankleR', 'ankleL'], label: { tr: 'Omuzdan biraz geniş', en: 'Just wider than shoulders', es: 'Algo más que los hombros' } }],
    props: [['swingBell']],
    ctx: { anchorX: ['ankleL', 'ankleR'], plant: ['ankleL', 'ankleR'] },
    poses: {
      // hike: hinge ~60 deg, shins near vertical, bell between and behind the knees, back flat
      hike: Object.assign({ trunk: 58, hip: 86, knee: 34, abd: 11, hrot: 10, neck: -14, thoracic: -4, sh: 24 }, ARMS),
      // float: tall, glutes locked, arms ~horizontal, bell at chest height
      top: Object.assign({ trunk: 0, hip: 0, knee: 0, abd: 7.2, hrot: 10, neck: 0, sh: 84 }, ARMS),
    },
    rest: 'hike',
    rep: [
      { to: 'top', dur: 1.0, phase: 0 },
      { to: 'top', dur: 0.3, phase: 1 },
      { to: 'hike', dur: 1.1, phase: 2 },
    ],
    setup: { tr: 'Ayaklar omuzdan biraz geniş. Kalçadan katlan, iki elle sapı tut, çanı bacak arasına geri çek.',
      en: 'Feet just wider than shoulders. Hinge, grip the handle with both hands and hike it back between your legs.',
      es: 'Pies algo más abiertos que los hombros. Bisagra, agarra con ambas manos y lleva la pesa atrás.' },
    phases: [
      { name: { tr: 'Kalçayı patlat', en: 'Snap the hips', es: 'Extiende la cadera' }, breath: 'out',
        text: { tr: 'Kalça ve dizleri hızla aç, kalçanı sık. Kollar sadece yön verir.', en: 'Snap hips and knees straight, squeeze the glutes. Arms only guide.', es: 'Extiende cadera y rodillas de golpe. Los brazos solo guían.' } },
      { name: { tr: 'Süzül', en: 'Float', es: 'Flota' }, breath: 'hold', line: ['ankleR', 'hipR', 'shoulderR'],
        text: { tr: 'Dik dur, geriye yaslanma. Çan göğüs hizasında bir an asılı kalır.', en: 'Stand tall, don\'t lean back. The bell floats at chest height.', es: 'Erguida, sin inclinarte atrás. La pesa flota a la altura del pecho.' } },
      { name: { tr: 'Geri salınım', en: 'Backswing', es: 'Balanceo atrás' }, breath: 'in', arc: ['neck', 'hipR', 'kneeR'],
        text: { tr: 'Çan karna gelince kalçayı geri it. Sırt düz, kaval neredeyse dik.', en: 'When the bell reaches your belly, push the hips back. Flat back, shins near vertical.', es: 'Cuando llegue al abdomen, cadera atrás. Espalda recta, tibias casi verticales.' } },
    ],
    // shown ~2.5x slower than the real ~1.1 s swing: at full speed the hands travel >6 cm per 30 fps frame (qa limb-jump check)
    tempoText: { tr: 'Gerçekte ~1 sn\'de bir swing · burada yavaş çekim', en: 'Real pace ~1 s per swing · shown in slow motion', es: 'Ritmo real ~1 s por swing · aquí a cámara lenta' },
    tempoReps: 4,
    mistakes: [
      { title: { tr: 'Swing\'i squat\'a çevirmek', en: 'Squatting the swing', es: 'Convertirlo en sentadilla' },
        fix: { tr: 'Kalçadan katlan', en: 'Hinge, don\'t squat', es: 'Bisagra, no sentadilla' },
        fixText: { tr: 'Kalça geri, kaval kemiği neredeyse dik', en: 'Hips back, shins nearly vertical', es: 'Cadera atrás, tibias casi verticales' },
        at: 'hike', pose: { trunk: 32, hip: 104, knee: 92, neck: -6, sh: 12 }, line: ['kneeR', 'ankleR'], parts: ['thighR', 'shinR'] },
      { title: { tr: 'Altta sırt yuvarlanıyor', en: 'Rounded back at the bottom', es: 'Espalda redondeada abajo' },
        fix: { tr: 'Göğüs açık, sırt düz', en: 'Chest up, flat back', es: 'Pecho arriba, espalda recta' },
        fixText: { tr: 'Daha derin kalça menteşesi, nötr omurga', en: 'Hinge deeper at the hips, neutral spine', es: 'Más bisagra de cadera, columna neutra' },
        at: 'hike', pose: { trunk: 38, hip: 62, lumbar: 15, thoracic: 20, neck: 18, sh: 18 }, line: ['pelvis', 'waist', 'neck'], goodLine: ['pelvis', 'neck'], parts: ['waist', 'chest'] },
    ],
    cues: [{ tr: 'Katlan, çömelme', en: 'Hinge, don\'t squat', es: 'Bisagra, no sentadilla' },
      { tr: 'Kalçayı patlat, kollar halat', en: 'Snap the hips, arms are ropes', es: 'Cadera explosiva, brazos como cuerdas' },
      { tr: 'Çan göğüs hizasına', en: 'Bell to chest height', es: 'Pesa a la altura del pecho' }],
  };
})();
