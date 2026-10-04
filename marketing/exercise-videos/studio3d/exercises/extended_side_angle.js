/* Extended side angle (Utthita Parsvakonasana), right side, forearm-on-thigh version. Front view, stance along z.
 * rest = the pose itself; rep = hold -> Warrior II -> hold (spec start = Warrior II). With Warrior II as rest the mistake
 * chapter's 0.9-1.2 s rest <-> pose jumps moved the hands > 6 cm/frame.
 * Feet: back-foot spot from the Warrior II pose (same as warrior_2.js), ctx.plant = both ankles; every pose re-fits the
 * front-leg abduction so the straight back leg reaches its planted ankle (front knee stays ~90).
 * Side bend: small pelvis `roll` + large spine `side` (core.js: negative roll/side tip toward the character's right).
 * Right arm: world IK target in BOTH poses (Warrior II = its FK T-arm hand position, hold = forearm resting across the
 * right thigh, hand by the knee, elbow back: pole [-1,-0.4,0] stays perpendicular to the frontal-plane arm path, a down/out
 * pole went degenerate mid-transition and flipped the elbow 45 cm) so the hand glides between them without an IK on/off pop. Left arm FK over the ear. */
{
const CTX = { anchorX: ['ankleR'], anchorAt: [0, 0.55] };
const G = [['heelR', 0]];
const LEGS = { kneePoleR: [0, 0, 1], hrotR: 90, hipL: 0, kneeL: 0, flatL: true, footOutL: -12, ground: G };
const RAW = {
  w2: Object.assign({ trunk: 0, abdR: 84, kneeR: 86, neck: 2, headTurn: -70, shAbd: 90, el: 2, palm: 'down', curl: 0.1, elbowPoleR: [-1, -0.9, 0], noAvoid: true }, LEGS),
  hold: Object.assign({ trunk: 0, roll: -8, side: -40, twist: 6, fit: true, kneeR: 88, neck: 0, headTurn: 35,
    shAbdL: 168, shL: 6, elL: 3, palmL: 'down', curl: 0.1, el: 90, elbowPoleR: [-1, -0.9, 0], noAvoid: true, palmR: 'down' }, LEGS),
};
function feet(poses, mistakes) {
  const { V, solve, expand, BODY: B } = FB;
  const fk = (p) => solve(expand(Object.assign({}, p, { ik: undefined })), CTX);
  const bis = (f, lo, hi) => { let flo = f(lo); for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2, fm = f(m); if ((fm > 0) === (flo > 0)) { lo = m; flo = fm; } else hi = m; } return (lo + hi) / 2; };
  poses.w2.abdL = bis((a) => fk(Object.assign({}, poses.w2, { abdL: a })).J.ankleL[1] - B.ankleH, 0, 85);
  const s = fk(poses.w2);
  const BACK = { at: s.J.ankleL.slice(), foot: [s.F.footL[0].slice(), s.F.footL[1].slice(), s.F.footL[2].slice()] };
  const L = (B.thigh + B.shin) * 0.9996;
  const pin = (p, isHold) => {
    if (p.fit) p.abdR = bis((a) => V.len(V.sub(fk(Object.assign({}, p, { abdR: a })).J.hipL, BACK.at)) - L, 40, 140);
    const q = fk(p), d = V.sub(BACK.at, q.J.hipL), P = q.F.pelvis;
    p.abdL = Math.atan2(-V.dot(d, P[2]), -V.dot(d, P[1])) * 180 / Math.PI;
    p.hipL = Math.atan2(V.dot(d, P[0]), -V.dot(d, P[1])) * 180 / Math.PI;
    // right hand: T-arm FK spot (Warrior II) or on top of the right thigh, by the knee (hold)
    const hand = isHold ? V.add(V.lerp(q.J.kneeR, q.J.hipR, 0.12), [0.02, 0.075, 0]) : q.J.handR.slice();
    p.ik = Object.assign({}, p.ik, { ankleL: BACK, handR: { at: hand } });
    return p;
  };
  pin(poses.w2, false); pin(poses.hold, true);
  for (const m of mistakes) {
    const mp = pin(Object.assign({}, poses[m.at], m.pose), true);
    for (const k of ['abdR', 'abdL', 'hipL', 'ik']) m.pose[k] = mp[k];
  }
  return poses;
}

window.EXERCISE = {
  id: 'extended_side_angle',
  name: { tr: 'Uzatılmış Yan Açı', en: 'Extended Side Angle', es: 'Ángulo lateral extendido' },
  category: { tr: 'Yoga · Bacak · Yan esneme', en: 'Yoga · Legs · Side stretch', es: 'Yoga · Piernas · Lateral' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['quads', 'glutes', 'obliques', 'adductors'],
  tempo: '5-8-4',
  hold: true, holdDur: 3,
  view: { yaw: 0, pitch: 6 },
  alt: { yaw: 50, pitch: 10, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Diz bileğin üstünde, göğüs açık', en: 'Knee over the ankle, chest open', es: 'Rodilla sobre el tobillo, pecho abierto' } },
  setupView: { yaw: 30, pitch: 16 },
  setupMarks: [{ type: 'aline', joints: ['heelL', 'shoulderL', 'handL'] }],
  contacts: ['heelR', 'ballR', 'heelL', 'ballL'],
  props: [['mat', { at: [0.02, 0, 0.0], length: 0.75, width: 1.9 }]],
  ctx: Object.assign({ plant: ['ankleL', 'ankleR'] }, CTX),
  get poses() { return this._poses || (this._poses = feet(RAW, this.mistakes)); },
  rest: 'hold',
  rep: [
    { to: 'w2', dur: 3.5, phase: 0 },
    { to: 'hold', dur: 4.5, phase: 1 },
    { to: 'hold', dur: 1.0, phase: 2 },
  ],
  setup: { tr: 'Savaşçı II duruşu: sağ diz 90°, sol ayak hafif içe. Sonra taraf değiştir.',
    en: 'Warrior II stance: right knee at 90°, left foot slightly in. Then switch sides.',
    es: 'Postura de Guerrero II: rodilla derecha a 90°, pie izquierdo un poco dentro.' },
  phases: [
    { name: { tr: 'Savaşçı II', en: 'Warrior II', es: 'Guerrero II' }, breath: 'in', slow: 1.0,
      text: { tr: 'Nefes al, kollar omuz hizasında, diz bileğin üstünde.', en: 'Inhale, arms at shoulder height, knee over the ankle.', es: 'Inhala, brazos a la altura de hombros, rodilla sobre el tobillo.' } },
    { name: { tr: 'Yana uzan', en: 'Reach and lower', es: 'Alarga y baja' }, breath: 'out', slow: 1.0,
      text: { tr: 'Nefes ver: sağ kol uyluğa dayanır, sol kol kulağın üstüne.', en: 'Exhale: right arm rests on the thigh, left arm over the ear.', es: 'Exhala: brazo derecho en el muslo, el izquierdo sobre la oreja.' } },
    { name: { tr: 'Pozda kal', en: 'Hold', es: 'Mantén' }, breath: 'easy', line: ['heelL', 'shoulderL', 'handL'],
      text: { tr: 'Arka topuktan parmak uçlarına tek uzun çizgi.', en: 'One long line from the back heel to the fingertips.', es: 'Una línea larga del talón trasero a los dedos.' } },
  ],
  tempoText: { tr: '5 sn in · 3-5 nefes kal · nefes alarak kalk', en: '5 s down · stay 3-5 breaths · inhale to rise', es: '5 s bajar · 3-5 respiraciones · inhala y sube' },
  mistakes: [
    { title: { tr: 'Uyluğa çöküyor', en: 'Collapsing onto the thigh', es: 'Hundirse sobre el muslo' },
      text: { tr: 'Ağırlık ön kola biner, göğüs çöker.', en: 'The forearm takes the weight, the chest sinks.', es: 'El antebrazo carga el peso, el pecho se hunde.' },
      fix: { tr: 'Karınla yüksel', en: 'Lift from the core', es: 'Sube desde el abdomen' },
      fixText: { tr: 'Kol uyluğa hafifçe dokunur, gövde uzun', en: 'Forearm rests lightly, torso long', es: 'Antebrazo apoyado suave, torso largo' },
      at: 'hold', pose: { side: -38, thoracic: 18, twist: -14, shrug: 0.04, neck: 14, headTurn: 0 }, view: { yaw: 35, pitch: 10 }, marks: ['shoulderR'], parts: ['chest', 'waist'] },
    { title: { tr: 'Ön diz içe kaçıyor', en: 'Front knee drifts in', es: 'La rodilla se va hacia dentro' },
      text: { tr: 'Diz baş parmağa doğru içe düşer.', en: 'The knee falls toward the big toe.', es: 'La rodilla cae hacia el dedo gordo.' },
      fix: { tr: 'Dizi dışa it', en: 'Press the knee out', es: 'Empuja la rodilla hacia fuera' },
      fixText: { tr: 'Diz bileğin tam üstünde', en: 'Knee stacked over the ankle', es: 'Rodilla sobre el tobillo' },
      at: 'hold', pose: { kneePoleR: [0.22, 0, 1], hrotR: 82 }, view: { yaw: 40, pitch: 34 }, marks: ['kneeR'], parts: ['thighR', 'shinR'] },
  ],
  cues: [{ tr: 'Topuktan parmaklara uzun çizgi', en: 'Long line heel to fingers', es: 'Línea larga del talón a los dedos' },
    { tr: 'Diz bileğin üstünde', en: 'Knee over the ankle', es: 'Rodilla sobre el tobillo' },
    { tr: 'Üst kaburgalar yukarı döner', en: 'Roll the top ribs up', es: 'Costillas de arriba hacia el techo' }],
};
}
