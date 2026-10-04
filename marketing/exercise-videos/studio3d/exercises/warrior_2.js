/* Warrior II (Virabhadrasana II), right leg bent (camera right in the front view), stance along the character's z axis.
 * Same foot logic as warrior_1.js: starts in the wide stance (legs straight, arms already out at shoulder height, so the
 * mistake chapter's quick rest <-> mistake jumps do not swing the arms), both ankles planted from the rest stance.
 * The back-foot spot comes from the hold pose: straight left leg abducted (FK bisection on abdL) until the flat foot is on the
 * mat; every pose gets ik.ankleL there and the rest stance finds the front-leg abduction (straight knee) that reaches it.
 * Front leg: abduction ~84 + external rotation 90 + knee ~86 = thigh near parallel, shin vertical, knee over the ankle and
 * pointing over the toes (kneePoleR = straight out in every pose; the knee-in mistake turns the pole toward the front).
 * Spec decomposition (hip flexion 95 / abduction 45 / ext. rotation 90) describes the same thigh position; measure.mjs's
 * hip_flexion_R (trunk vs thigh) therefore reads ~85-90. */
{
const CTX = { anchorX: ['ankleR'], anchorAt: [0, 0.55] };
const G = [['heelR', 0]];
const ARMS = { shAbd: 90, sh: 0, el: 2, palm: 'down', curl: 0.1 };
const LEGS = { kneePoleR: [0, 0, 1], hrotR: 90, hipL: 0, kneeL: 0, flatL: true, footOutL: -12, ground: G };
const RAW = {
  stance: Object.assign({ trunk: 0, kneeR: 0, neck: 0, headTurn: -20, fit: 'abdR' }, LEGS, ARMS),
  hold: Object.assign({ trunk: 0, abdR: 84, kneeR: 86, neck: 2, headTurn: -78 }, LEGS, ARMS),
};
function backFoot(poses, mistakes) {
  const { V, solve, expand, BODY: B } = FB;
  const fk = (p) => solve(expand(Object.assign({}, p, { ik: undefined })), CTX);
  const bis = (f, lo, hi) => { let flo = f(lo); for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2, fm = f(m); if ((fm > 0) === (flo > 0)) { lo = m; flo = fm; } else hi = m; } return (lo + hi) / 2; };
  poses.hold.abdL = bis((a) => fk(Object.assign({}, poses.hold, { abdL: a })).J.ankleL[1] - B.ankleH, 0, 85);
  const s = fk(poses.hold);
  const BACK = { at: s.J.ankleL.slice(), foot: [s.F.footL[0].slice(), s.F.footL[1].slice(), s.F.footL[2].slice()] };
  const L = (B.thigh + B.shin) * 0.9996;
  const pin = (p) => {
    if (p.fit === 'abdR') p.abdR = bis((a) => V.len(V.sub(fk(Object.assign({}, p, { abdR: a })).J.hipL, BACK.at)) - L, 5, 70);
    // FK left leg pointing at BACK (abduction in the frontal plane) so the IK pole and the FK agree
    const q = fk(p), d = V.sub(BACK.at, q.J.hipL), up = V.norm(V.sub(q.J.neck, q.J.pelvis)), rt = q.F.pelvis[2];
    p.abdL = Math.atan2(-V.dot(d, rt), -V.dot(d, up)) * 180 / Math.PI;
    p.ik = Object.assign({}, p.ik, { ankleL: BACK });
    return p;
  };
  for (const k in poses) pin(poses[k]);
  for (const m of mistakes) m.pose.ik = Object.assign({}, m.pose.ik, { ankleL: BACK });
  return poses;
}

window.EXERCISE = {
  id: 'warrior_2',
  name: { tr: 'Savaşçı II', en: 'Warrior II', es: 'Guerrero II' },
  category: { tr: 'Yoga · Bacak · Omuz', en: 'Yoga · Legs · Shoulders', es: 'Yoga · Piernas · Hombros' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['quads', 'glutes', 'adductors', 'delts'],
  tempo: '5-8-3',
  hold: true, holdDur: 4,
  view: { yaw: 0, pitch: 6 },
  alt: { yaw: 90, pitch: 8, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
    text: { tr: 'Omuzlar kalçanın üstünde, gövde dik', en: 'Shoulders over hips, torso tall', es: 'Hombros sobre la cadera, torso erguido' } },
  setupView: { yaw: 30, pitch: 16 },
  setupMarks: [{ type: 'span', joints: ['ankleL', 'ankleR'], label: { tr: 'Geniş duruş', en: 'Wide stance', es: 'Postura amplia' } }],
  contacts: ['heelR', 'ballR', 'heelL', 'ballL'],
  props: [['mat', { at: [0.02, 0, 0.0], length: 0.75, width: 1.9 }]],
  ctx: Object.assign({ plant: ['ankleL', 'ankleR'] }, CTX),
  get poses() { return this._poses || (this._poses = backFoot(RAW, this.mistakes)); },
  rest: 'stance',
  rep: [
    { to: 'hold', dur: 5.0, phase: 0 },
    { to: 'hold', dur: 1.0, phase: 1 },
    { to: 'stance', dur: 3.0, phase: 2 },
  ],
  setup: { tr: 'Ayaklar geniş açık. Sağ ayak 90° dışa, sol ayak hafif içe. Kollar omuz hizasında. Sonra taraf değiştir.',
    en: 'Wide stance. Right foot out 90°, left foot slightly in. Arms at shoulder height. Then switch sides.',
    es: 'Pies muy abiertos. Pie derecho a 90°, izquierdo un poco hacia dentro. Brazos a la altura de hombros.' },
  phases: [
    { name: { tr: 'Ön dizi bük', en: 'Bend the front knee', es: 'Flexiona la rodilla' }, breath: 'out', slow: 1.0,
      text: { tr: 'Nefes vererek sağ dizi 90°ye bük, bakış sağ elin üstünde.', en: 'Exhale, bend the right knee to 90°, gaze over the right hand.', es: 'Exhala, flexiona la rodilla derecha a 90°, mirada sobre la mano.' } },
    { name: { tr: 'Pozda kal', en: 'Hold', es: 'Mantén' }, breath: 'easy', arc: ['hipR', 'kneeR', 'ankleR'],
      text: { tr: 'Diz bileğin üstünde, kollar yere paralel, gövde ortada.', en: 'Knee over the ankle, arms level, torso centred.', es: 'Rodilla sobre el tobillo, brazos nivelados, torso centrado.' } },
    { name: { tr: 'Çık', en: 'Release', es: 'Sal' }, breath: 'in', slow: 1.1,
      text: { tr: 'Nefes alarak ön bacağı düzelt.', en: 'Inhale and straighten the front leg.', es: 'Inhala y estira la pierna delantera.' } },
  ],
  tempoText: { tr: '5 sn gir · 3-5 nefes kal · 3 sn çık', en: '5 s in · stay 3-5 breaths · 3 s out', es: '5 s entrar · 3-5 respiraciones · 3 s salir' },
  mistakes: [
    { title: { tr: 'Ön diz içe düşüyor', en: 'Front knee caves in', es: 'La rodilla cae hacia dentro' },
      text: { tr: 'Diz baş parmağa doğru içe kayar.', en: 'The knee falls toward the big toe.', es: 'La rodilla cae hacia el dedo gordo.' },
      fix: { tr: 'Dizi serçe parmağa doğru it', en: 'Press the knee toward the little toe', es: 'Lleva la rodilla hacia el dedo pequeño' },
      fixText: { tr: 'Diz ayak bileğinin tam üstünde', en: 'Knee stacked over the ankle', es: 'Rodilla justo sobre el tobillo' },
      at: 'hold', pose: { kneePoleR: [0.2, 0, 1], hrotR: 82 }, view: { yaw: 40, pitch: 34 }, marks: ['kneeR'], parts: ['thighR', 'shinR'] },
    { title: { tr: 'Gövde öne bacağa eğiliyor', en: 'Torso leans over the front leg', es: 'El torso se inclina' },
      text: { tr: 'Gövde sağ bacağın üstüne kayar.', en: 'The upper body tips toward the front leg.', es: 'El torso se va sobre la pierna delantera.' },
      fix: { tr: 'Omuzları kalçanın üstüne diz', en: 'Stack shoulders over hips', es: 'Hombros sobre la cadera' },
      fixText: { tr: 'Gövde iki ayağın ortasında, dik', en: 'Torso tall, centred between the feet', es: 'Torso erguido, entre los pies' },
      at: 'hold', pose: { side: 22, neck: 4 }, line: ['pelvis', 'neck'], goodLine: ['pelvis', 'neck'], parts: ['waist', 'chest'] },
  ],
  cues: [{ tr: 'Diz bileğin üstünde', en: 'Knee over the ankle', es: 'Rodilla sobre el tobillo' },
    { tr: 'Kollar güçlü ve düz', en: 'Arms strong and level', es: 'Brazos firmes y nivelados' },
    { tr: 'Gövde ortada, uzun', en: 'Torso centred and tall', es: 'Torso centrado y largo' }],
};
}
