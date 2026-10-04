/* Warrior I (Virabhadrasana I), right leg in front (near the camera), left foot back and turned out ~50°.
 * Starts in the wide stance (legs straight, arms already overhead: the mistake chapter jumps rest -> mistake -> rest in
 * ~1 s, and a full arm sweep there moved the hands > 6 cm/frame; IK hands-on-hips also flipped the elbows) instead of tadasana, so both feet are planted for the whole
 * video and never slide (the step back is described in the setup card).
 * Feet: ctx.plant = both ankles, captured from the rest stance. The back-foot spot is computed once (lazy `poses`):
 *   - in the hold pose (front hip 95 / knee 92, trunk upright) the straight back leg is swung back (FK bisection on hipL)
 *     until the flat, turned-out foot lands on the mat -> BACK target (ankle + foot frame);
 *   - every pose gets ik.ankleL = BACK and its FK hipL is re-fitted to point at it (stable knee pole, straight back knee);
 *   - the rest stance finds the front-hip angle (straight front knee) that puts the straight back leg exactly on BACK.
 * Spec inconsistency: front thigh parallel + upright trunk + straight back leg with the heel down forces ~55-60° back-hip
 * extension (spec says -20). Matched the technique-defining angles (front hip ~95, front knee ~92, trunk ~0, back knee 0,
 * stance ~1.2 m) and left the back-hip angle to the geometry. */
{
const CTX = { anchorX: ['ankleR'], anchorAt: [0.25, 0.1] };
const G = [['heelR', 0]];
const UP = { sh: 174, shAbd: 9, el: 4, palm: 'in', curl: 0.15 };
const LEGS = { kneePoleR: [1, 0, 0], abd: 3, hrotR: 4, hrotL: 34, footOutL: 50, flatL: true, ground: G };
const RAW = {
  stance: Object.assign({ trunk: 0, kneeR: 0, kneeL: 0, neck: 0, fit: 'hipR' }, LEGS, UP),
  hold: Object.assign({ trunk: 0, hipR: 97, kneeR: 92, kneeL: 0, thoracic: -5, neck: -18, sh: 176, shAbd: 9, el: 3, palm: 'in', curl: 0.1 }, LEGS),
};
function backFoot(poses, mistakes) {
  const { V, solve, expand, BODY: B } = FB;
  const fk = (p) => solve(expand(Object.assign({}, p, { ik: undefined, holdL: undefined, holdR: undefined })), CTX);
  const bis = (f, lo, hi) => { let flo = f(lo); for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2, fm = f(m); if ((fm > 0) === (flo > 0)) { lo = m; flo = fm; } else hi = m; } return (lo + hi) / 2; };
  // straight back leg swung back until the ankle sits at ankle height (flat foot on the mat)
  const fitHipL = (p) => { p.hipL = bis((h) => fk(Object.assign({}, p, { hipL: h })).J.ankleL[1] - B.ankleH, 20, -100); return p; };
  fitHipL(poses.hold);
  const s = fk(poses.hold);
  const frame = (F) => [F[0].slice(), F[1].slice(), F[2].slice()];
  const BACK = { at: s.J.ankleL.slice(), foot: frame(s.F.footL) };
  const L = (B.thigh + B.shin) * 0.9996;
  const pin = (p) => {
    if (p.fit === 'hipR') p.hipR = bis((h) => V.len(V.sub(fk(Object.assign({}, p, { hipR: h, hipL: -h })).J.hipL, BACK.at)) - L, 0, 70);
    // FK back thigh pointing at BACK (pole + measure stay consistent with the IK leg)
    const q = fk(p), d = V.sub(BACK.at, q.J.hipL);
    const up = V.norm(V.sub(q.J.neck, q.J.pelvis)), fw = q.F.pelvis[0];
    p.hipL = Math.atan2(V.dot(d, fw), -V.dot(d, up)) * 180 / Math.PI;
    p.ik = Object.assign({}, p.ik, { ankleL: BACK });
    return p;
  };
  for (const k in poses) pin(poses[k]);
  for (const m of mistakes) m.pose.ik = Object.assign({}, m.pose.ik, { ankleL: BACK });
  return poses;
}

window.EXERCISE = {
  id: 'warrior_1',
  name: { tr: 'Savaşçı I', en: 'Warrior I', es: 'Guerrero I' },
  category: { tr: 'Yoga · Bacak · Omuz', en: 'Yoga · Legs · Shoulders', es: 'Yoga · Piernas · Hombros' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['quads', 'glutes', 'delts', 'core'],
  tempo: '4-8-3',
  hold: true, holdDur: 4,
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 14, pitch: 8, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Kalça öne dönük, kollar omuz genişliğinde', en: 'Hips face forward, arms shoulder-width', es: 'Cadera al frente, brazos al ancho de hombros' } },
  setupView: { yaw: 40, pitch: 14 },
  setupMarks: [{ type: 'span', joints: ['heelR', 'heelL'], label: { tr: '~1,2 m', en: '~1.2 m', es: '~1,2 m' } }],
  contacts: ['heelR', 'ballR', 'heelL', 'ballL'],
  props: [['mat', { at: [-0.25, 0, 0], length: 1.9 }]],
  ctx: Object.assign({ plant: ['ankleL', 'ankleR'] }, CTX),
  get poses() { return this._poses || (this._poses = backFoot(RAW, this.mistakes)); },
  rest: 'stance',
  rep: [
    { to: 'hold', dur: 4.0, phase: 0 },
    { to: 'hold', dur: 1.0, phase: 1 },
    { to: 'stance', dur: 3.0, phase: 2 },
  ],
  setup: { tr: 'Sol ayağı ~1,2 m geri al, 45-60° dışa çevir. Topuk yerde, kollar yukarıda. Sonra taraf değiştir.',
    en: 'Step the left foot ~1.2 m back, turned out 45-60°. Heel down, arms overhead. Then switch sides.',
    es: 'Pie izquierdo ~1,2 m atrás, girado 45-60°. Talón abajo, brazos arriba. Luego cambia de lado.' },
  phases: [
    { name: { tr: 'Ön dizi bük', en: 'Bend the front knee', es: 'Flexiona la rodilla' }, breath: 'out', slow: 1.1,
      text: { tr: 'Nefes vererek ön dizi 90°ye bük, kollar uzar.', en: 'Exhale and bend the front knee to 90°, arms reach up.', es: 'Exhala y flexiona la rodilla a 90°, brazos arriba.' } },
    { name: { tr: 'Pozda kal', en: 'Hold', es: 'Mantén' }, breath: 'easy', arc: ['hipR', 'kneeR', 'ankleR'],
      text: { tr: 'Diz bileğin üstünde, arka bacak düz, topuk yerde.', en: 'Knee over the ankle, back leg straight, heel down.', es: 'Rodilla sobre el tobillo, pierna trasera recta.' } },
    { name: { tr: 'Çık', en: 'Release', es: 'Sal' }, breath: 'in', slow: 1.1,
      text: { tr: 'Nefes alarak ön bacağı düzelt.', en: 'Inhale and straighten the front leg.', es: 'Inhala y estira la pierna delantera.' } },
  ],
  tempoText: { tr: '4 sn gir · 3-5 nefes kal · 3 sn çık', en: '4 s in · stay 3-5 breaths · 3 s out', es: '4 s entrar · 3-5 respiraciones · 3 s salir' },
  mistakes: [
    { title: { tr: 'Ön diz içe kaçıyor', en: 'Front knee caves in', es: 'Rodilla delantera hacia dentro' },
      text: { tr: 'Diz orta hatta doğru kayar.', en: 'The knee drifts toward the midline.', es: 'La rodilla se va hacia el centro.' },
      fix: { tr: 'Dizi 2. parmağa yönelt', en: 'Knee over the 2nd toe', es: 'Rodilla sobre el 2.º dedo' },
      fixText: { tr: 'Diz ayak ucu yönünde, bileğin üstünde', en: 'Knee tracks the toes, over the ankle', es: 'Rodilla sobre el pie y el tobillo' },
      at: 'hold', pose: { kneePoleR: [1, 0, -0.14], hrotR: -6 }, view: { yaw: 14, pitch: 8 }, marks: ['kneeR'], parts: ['thighR', 'shinR'] },
    { title: { tr: 'Kalça yana açılıyor', en: 'Hips open sideways', es: 'La cadera se abre' },
      text: { tr: 'Kalça arka bacağa doğru döner.', en: 'The pelvis turns toward the back leg.', es: 'La pelvis gira hacia la pierna trasera.' },
      fix: { tr: 'Kalçayı öne çevir', en: 'Square the hips', es: 'Cadera al frente' },
      fixText: { tr: 'Sağ kalça geri, sol kalça öne', en: 'Right hip back, left hip forward', es: 'Cadera derecha atrás, izquierda adelante' },
      at: 'hold', pose: { yaw: 22, twist: -6 }, view: { yaw: 10, pitch: 30 }, marks: ['hipL', 'hipR'], parts: ['pelvis', 'waist'] },
  ],
  cues: [{ tr: 'Ön diz bileğin üstünde', en: 'Front knee over the ankle', es: 'Rodilla sobre el tobillo' },
    { tr: 'Kalça öne dönük', en: 'Hips square', es: 'Cadera al frente' },
    { tr: 'Arka topuk yerde', en: 'Back heel grounded', es: 'Talón trasero abajo' }],
};
}
