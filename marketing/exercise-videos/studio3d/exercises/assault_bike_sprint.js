/* Air (assault) bike sprint. Seated: single ground contact pelvis on the saddle, pelvis anchored.
 * Feet: ankle IK targets on the pedal circle (crank r 0.17 m) at four crank angles (0/90/180/270 deg, left foot +180);
 * the engine's monotone spline through the four keys rounds the path into a near-circle.
 * Hands: IK targets on the moving handles, which swing on an arc around a low front pivot, pushed forward with the
 * opposite leg's down-stroke. The bike (fan, frame, saddle, cranks, swinging handles) is a prop defined in this file
 * (FB.PROPS._airBike). One rep = one crank revolution, shown ~3x slower than a real ~1.4 Hz sprint (qa limb-jump check). */
(function () {
  const { V } = FB;
  const SEAT = 0.95, C = [0.3, 0.33], R = 0.17, PIV = [0.72, 0.42], HL = 0.72;
  FB.PROPS._airBike = (sol) => {
    const out = [];
    // fan + frame
    out.push({ t: 'cyl', a: [0.95, 0.5, -0.12], b: [0.95, 0.5, 0.12], r: 0.36, m: 'frameDark', seg: 32 });
    out.push({ t: 'cyl', a: [0.95, 0.5, -0.13], b: [0.95, 0.5, 0.13], r: 0.08, m: 'iron' });
    out.push({ t: 'tube', pts: [[-0.05, SEAT - 0.04, 0], [0.0, 0.55, 0], [C[0], C[1], 0], [0.95, 0.5, 0]], r: 0.035, m: 'frame' });
    out.push({ t: 'tube', pts: [[0.95, 0.5, 0], [0.75, 0.95, 0]], r: 0.03, m: 'frame' });
    out.push({ t: 'box', c: [0.35, 0.03, 0], s: [1.6, 0.06, 0.08], m: 'frame' });
    for (const x of [-0.35, 1.0]) out.push({ t: 'box', c: [x, 0.03, 0], s: [0.08, 0.06, 0.6], m: 'frame' });
    out.push({ t: 'box', c: [-0.04, SEAT - 0.03, 0], s: [0.28, 0.06, 0.2], m: 'pad', round: 0.02 });
    // cranks + pedals follow the feet
    for (const s of ['L', 'R']) {
      const sg = s === 'L' ? -1 : 1, b = sol.J['ball' + s];
      const p = [b[0], b[1] + 0.008, sg * 0.11];
      out.push({ t: 'tube', pts: [[C[0], C[1], sg * 0.07], p], r: 0.014, m: 'chrome' });
      out.push({ t: 'box', c: [p[0], p[1], sg * 0.13], s: [0.1, 0.025, 0.09], m: 'iron' });
      // handle: from the pivot to the fist and a little beyond
      const h = sol.J['hand' + s], pv = [PIV[0], PIV[1], sg * 0.2];
      const d = V.norm(V.sub(h, pv));
      out.push({ t: 'tube', pts: [pv, h], r: 0.018, m: 'frame' });
      out.push({ t: 'cyl', a: V.add(h, V.mul(d, -0.07)), b: V.add(h, V.mul(d, 0.06)), r: 0.02, m: 'rubber' });
    }
    out.push({ t: 'cyl', a: [C[0], C[1], -0.08], b: [C[0], C[1], 0.08], r: 0.05, m: 'iron' });
    sol.grip = { L: V.norm(V.sub(sol.J.handL, [PIV[0], PIV[1], -0.2])), R: V.norm(V.sub(sol.J.handR, [PIV[0], PIV[1], 0.2])) }; sol.gripKind = 'neutral';
    return out;
  };
  const D = Math.PI / 180;
  // crank angle a (deg, 0 = right pedal forward, 90 = right pedal down... measured clockwise in the side view)
  const pedal = (a) => [C[0] + R * Math.cos(-a * D), C[1] + R * Math.sin(-a * D)];
  const ankleAt = (a, sg) => { const p = pedal(a); return [p[0] - 0.105, p[1] + 0.085, sg * 0.12]; };
  // handle swing: right handle forward when the left leg pushes down (left pedal forward-down -> a = 180..270)
  const handAt = (sw, sg) => { const t = (90 + 18 + sw) * D; return [PIV[0] + HL * Math.cos(t) * 1, PIV[1] + HL * Math.sin(t), sg * 0.24]; };
  const BASE = { trunk: 15, neck: -6, hip: 75, knee: 70, ankle: 0, flat: false, abd: 2, ground: [['pelvis', SEAT]],
    elbowPole: [-0.4, -1, 0.5], palm: 'in', curl: 1 };
  const key = (a, sw) => Object.assign({}, BASE, { ik: {
    ankleR: { at: ankleAt(a, 1) }, ankleL: { at: ankleAt(a + 180, -1) },
    handR: { at: handAt(sw, 1) }, handL: { at: handAt(-sw, -1) } } });

  window.EXERCISE = {
    id: 'assault_bike_sprint',
    name: { tr: 'Air Bike Sprint', en: 'Assault Bike Sprint', es: 'Sprint en air bike' },
    category: { tr: 'Kondisyon · Tüm vücut', en: 'Conditioning · Full body', es: 'Acondicionamiento · Cuerpo completo' },
    equipmentLabel: { tr: 'Air bike', en: 'Air bike', es: 'Air bike' },
    muscles: ['quads', 'glutes', 'delts', 'chest', 'upperback'],
    tempo: '20 s / 40 s',
    tempoReps: 3,
    repLabel: { tr: 'TUR', en: 'TURN', es: 'VUELTA' },
    view: { yaw: 90, pitch: 6 },
    alt: { yaw: 25, pitch: 8, title: { tr: 'Önden çapraz', en: 'Front angle', es: 'Vista frontal' },
      text: { tr: 'Bir kol iterken diğeri çeker', en: 'One arm pushes while the other pulls', es: 'Un brazo empuja y el otro tira' } },
    setupView: { yaw: 40, pitch: 10 },
    props: [['_airBike']],
    ctx: { anchorX: ['pelvis'], anchorAt: [0, 0] },
    contacts: ['pelvis', 'ballR', 'ballL', 'handR', 'handL'],
    poses: { a0: key(0, -14), a90: key(90, 0), a180: key(180, 14), a270: key(270, 0) },
    rest: 'a0',
    rep: [
      { to: 'a90', dur: 0.55, phase: 0, ease: 'linear' },
      { to: 'a180', dur: 0.55, phase: 0, ease: 'linear' },
      { to: 'a270', dur: 0.55, phase: 1, ease: 'linear' },
      { to: 'a0', dur: 0.55, phase: 1, ease: 'linear' },
    ],
    setup: { tr: 'Sele yüksekliği: alttaki bacak neredeyse düz. Dik otur, gövde hafif önde, eller kollarda.',
      en: 'Seat height: the bottom leg is nearly straight. Sit tall, slight forward lean, hands on the handles.',
      es: 'Altura del sillín: la pierna de abajo casi recta. Erguida, algo inclinada, manos en los manillares.' },
    phases: [
      { name: { tr: 'Sağ bacak bas, sol kol it', en: 'Right leg down, left arm push', es: 'Pierna der. baja, brazo izq. empuja' }, breath: 'out',
        text: { tr: 'Pedala basarken karşı kol kolu iter, diğeri çeker.', en: 'As one leg drives down, the opposite arm pushes and the other pulls.', es: 'Al bajar una pierna, el brazo opuesto empuja.' } },
      { name: { tr: 'Sol bacak bas, sağ kol it', en: 'Left leg down, right arm push', es: 'Pierna izq. baja, brazo der. empuja' }, breath: 'in',
        text: { tr: 'Pürüzsüz bir daire çiz, gövde dik ve sabit.', en: 'Draw a smooth circle; torso tall and steady.', es: 'Círculo suave; torso erguido y estable.' } },
    ],
    tempoText: { tr: '20 sn sprint · 40 sn hafif · burada yavaş çekim', en: '20 s sprint · 40 s easy · shown in slow motion', es: '20 s sprint · 40 s suave · a cámara lenta' },
    mistakes: [
      { title: { tr: 'Sadece bacak çalışıyor', en: 'Legs only', es: 'Solo las piernas' },
        fix: { tr: 'Kolları it ve çek', en: 'Push and pull with the arms', es: 'Empuja y tira con los brazos' },
        fixText: { tr: 'Kollar gücün bir kısmını üretir', en: 'The arms add a share of the power', es: 'Los brazos aportan potencia' },
        at: 'a180', pose: { ik: { ankleR: { at: ankleAt(180, 1) }, ankleL: { at: ankleAt(0, -1) }, handR: { at: handAt(0, 1) }, handL: { at: handAt(0, -1) } }, el: 20 },
        marks: ['handR', 'handL'], parts: ['upperR', 'foreR'] },
      { title: { tr: 'Sele çok alçak', en: 'Seat too low', es: 'Sillín demasiado bajo' },
        fix: { tr: 'Seleyi yükselt', en: 'Raise the seat', es: 'Sube el sillín' },
        fixText: { tr: 'Alttaki diz ~20° bükülü, neredeyse düz', en: 'Bottom knee ~20° bent, nearly straight', es: 'Rodilla de abajo ~20°, casi recta' },
        at: 'a90', pose: { ground: [['pelvis', SEAT - 0.14]] }, line: ['hipR', 'kneeR', 'ankleR'], marks: ['kneeR'], parts: ['thighR', 'shinR'] },
    ],
    cues: [{ tr: 'Kolları it VE çek', en: 'Push AND pull the handles', es: 'Empuja Y tira' },
      { tr: 'Dik otur', en: 'Sit tall', es: 'Siéntate erguida' },
      { tr: 'Pürüzsüz bacak dairesi', en: 'Smooth leg circle', es: 'Círculo de piernas suave' }],
  };
})();
