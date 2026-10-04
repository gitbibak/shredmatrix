/* Pull-up. Hanging: hands are world IK targets on the fixed bar (x 0, y BAR_Y), the body has no ground contact.
 * hang(p, el, dx) adds a lazy `pos` getter: it is evaluated when the engine expands the pose (after the rig has set
 * FB.BODY), solves the pose without pos, and lifts/moves the body so the shoulder sits at the distance from the bar
 * that gives the wanted elbow flexion `el`, with the shoulder `dx` behind the bar. Feet never touch the floor
 * (lowest point ~0.4 m up in the dead hang). Ankles together, one knee a little more bent (ankles "crossed"). */
{
const BAR_Y = 2.3, GZ = 0.245;
const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };
const IK = { handL: { at: [0, BAR_Y, -GZ] }, handR: { at: [0, BAR_Y, GZ] } };
function hang(p, el, dx) {
  const o = Object.assign({ elbowPole: [0.25, -1, 0.7], ik: IK, noAvoid: true, ground: [['pelvis', 0]], palm: 'forward', curl: 0.85, abd: -5, kneeL: (p.knee ?? 60) + 8, kneeR: (p.knee ?? 60) - 4 }, p);
  Object.defineProperty(o, 'pos', { enumerable: true, configurable: true, get() {
    const B = FB.BODY, q = {}; for (const k of Object.keys(o)) if (k !== 'pos' && k !== 'ik') q[k] = Object.getOwnPropertyDescriptor(o, k).value;
    const s = FB.solve(FB.expand(q), CTX), S = s.J.shoulderR;
    const f = B.fore + B.hand * 0.55, e = (180 - el) * Math.PI / 180;
    const d = Math.sqrt(B.upper * B.upper + f * f - 2 * B.upper * f * Math.cos(e));
    const dz = GZ - S[2], dy = Math.sqrt(Math.max(0, d * d - dx * dx - dz * dz));
    return [-dx - S[0], BAR_Y - dy - S[1], 0];
  } });
  return o;
}

window.EXERCISE = {
  id: 'pull_up',
  name: { tr: 'Barfiks (Pull-Up)', en: 'Pull-Up', es: 'Dominadas' },
  category: { tr: 'Sırt', en: 'Back', es: 'Espalda' },
  equipmentLabel: { tr: 'Barfiks barı', en: 'Pull-up bar', es: 'Barra de dominadas' },
  muscles: ['lats', 'upperback', 'biceps', 'core'],
  tempo: '1-0.5-2',
  view: { yaw: 12, pitch: 4 },
  alt: { yaw: 58, pitch: 4, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
    text: { tr: 'Gövde düz, bacaklar sabit, çene barın üstüne', en: 'Body long, legs still, chin over the bar', es: 'Cuerpo firme, piernas quietas, barbilla sobre la barra' } },
  setupView: { yaw: 35, pitch: 8 },
  setupMarks: [{ type: 'aline', joints: ['handL', 'shoulderL', 'shoulderR', 'handR'] }],
  props: [['pullupBar', { x: 0, y: BAR_Y }]],
  ctx: { anchorX: ['pelvis'], anchorAt: [0, 0] },
  contacts: ['handL', 'handR'],
  poses: {
    // dead hang: arms long, shoulders lightly set, knees bent ~60°, ankles together
    hang: hang({ trunk: 0, hip: 5, knee: 60, shrug: 0.015, neck: -2 }, 10, 0.02),
    // chin over the bar: elbows driven down to the ribs, chest up, slight lean back (~10°)
    top: hang({ trunk: -8, hip: 15, knee: 68, thoracic: -6, neck: -6, shrug: -0.015, protract: -0.02 }, 142, 0.09),
  },
  rest: 'hang',
  rep: [
    { to: 'top', dur: 1.5, phase: 0 },
    { to: 'top', dur: 0.5, phase: 1 },
    { to: 'hang', dur: 2.0, phase: 2 },
  ],
  setup: { tr: 'Barı avuçlar öne bakacak şekilde, omzundan biraz geniş tut. Kollar düz asıl, dizleri bük.',
    en: 'Overhand grip, a bit wider than your shoulders. Hang with straight arms, knees bent.',
    es: 'Agarre prono, algo más ancho que los hombros. Cuelga con brazos rectos, rodillas dobladas.' },
  phases: [
    { name: { tr: 'Çek', en: 'Pull', es: 'Tira' }, breath: 'out',
      text: { tr: 'Önce omuzları indir, sonra dirsekleri cebine doğru çek. Çene barı geçsin.', en: 'Set the shoulders down, then pull the elbows to your pockets. Chin over the bar.', es: 'Baja los hombros y lleva los codos a los bolsillos. Barbilla sobre la barra.' } },
    { name: { tr: 'Tepede dur', en: 'Hold at the top', es: 'Pausa arriba' }, breath: 'hold', line: ['handL', 'handR'],
      text: { tr: 'Göğüs bara yakın, omuzlar kulaktan uzak.', en: 'Chest close to the bar, shoulders away from the ears.', es: 'Pecho cerca de la barra, hombros lejos de las orejas.' } },
    { name: { tr: 'Kontrollü in', en: 'Lower slowly', es: 'Baja despacio' }, breath: 'in',
      text: { tr: 'İki saniyede kollar düzleşene kadar in. Sallanma.', en: 'Take two seconds down to straight arms. No swinging.', es: 'Dos segundos hasta estirar los brazos. Sin balanceo.' } },
  ],
  tempoText: { tr: '1,5 sn çek · 0,5 sn dur · 2 sn in', en: '1.5 s up · 0.5 s hold · 2 s down', es: '1,5 s sube · 0,5 s pausa · 2 s baja' },
  mistakes: [
    { title: { tr: 'Bacaklarla savrulmak', en: 'Kipping with the legs', es: 'Balancear las piernas' },
      fix: { tr: 'Bacaklar sabit', en: 'Keep the legs still', es: 'Piernas quietas' },
      fixText: { tr: 'Karnı sık, her tekrar ölü asılıştan başlasın', en: 'Brace the core; start every rep from a still hang', es: 'Abdomen firme; cada repetición desde colgado quieto' },
      at: 'hang', pose: hang({ trunk: -12, hip: 38, knee: 34, lumbar: -6, shrug: 0.015, neck: -2, kneeL: 40, kneeR: 30 }, 22, -0.03), view: { yaw: 58, pitch: 4 },
      line: ['ankleR', 'hipR', 'shoulderR'], parts: ['thigh', 'shin', 'waist'] },
    { title: { tr: 'Yarım tekrar', en: 'Half reps', es: 'Medias repeticiones' },
      fix: { tr: 'Tam aralık', en: 'Full range', es: 'Rango completo' },
      fixText: { tr: 'Altta kollar tam düz, üstte çene barın üstünde', en: 'Straight arms at the bottom, chin over the bar at the top', es: 'Brazos rectos abajo, barbilla sobre la barra arriba' },
      at: 'hang', pose: hang({ trunk: -3, hip: 8, knee: 62, shrug: 0, neck: -2 }, 68, 0.05), marks: ['elbowL', 'elbowR'], parts: ['upper', 'fore'] },
  ],
  cues: [{ tr: 'Göğüs bara', en: 'Chest to the bar', es: 'Pecho a la barra' },
    { tr: 'Dirsekler cebe', en: 'Elbows to your pockets', es: 'Codos a los bolsillos' },
    { tr: 'Ölü asılıştan başla', en: 'Start from a still hang', es: 'Empieza colgado y quieto' }],
};
}
