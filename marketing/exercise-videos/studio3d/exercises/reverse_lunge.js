/* Reverse lunge: the right leg stays in front and works (near the camera); the left foot steps back and returns.
 * Front (right) foot: ctx.plant + anchor. Left foot: world IK targets in every pose (ik.ankleL with a foot frame):
 *   start = flat beside the right foot, air = lifted ~10 cm halfway back (toes slightly down), bottom = on the ball/toe
 *   at REAR_TOE with the heel up 60° (rigid shoe pivoting on the toe tip). The 'air' keys make the foot lift and land
 *   instead of sliding (start -> air -> bottom on the way back, bottom -> air -> start on the way in).
 * Body height: single ground contact on the front heel. */
{
const CTX = { anchorX: ['ankleR'], anchorAt: [0, 0.1] };
const G = [['heelR', 0]];
const REAR_TOE = [-0.74, 0, -0.1];
const DB = { sh: 2, shAbd: 9, el: 6, palm: 'in', ground: G, abd: 2, hrotR: 6, hrotL: 4 };
const RAW = {
  start: Object.assign({ trunk: 0, hip: 2, knee: 2, neck: 0 }, DB),
  air: Object.assign({ trunk: 4, hipR: 14, kneeR: 16, hipL: -22, kneeL: 55, neck: -2 }, DB),
  bottom: Object.assign({ trunk: 10, hipR: 99, kneeR: 99, hipL: -12, kneeL: 96, neck: -6 }, DB),
};
RAW.air2 = Object.assign({}, RAW.air);
const FOOT = { start: 'flat', air: [-0.34, 0.23, 20], air2: [-0.34, 0.23, 20], bottom: 'toe' };
function leftFoot(poses, mistakes) {
  const { V, solve, expand, BODY: B } = FB;
  const s = solve(expand(Object.assign({}, poses.start, { ik: undefined })), CTX);
  const z = s.J.ankleL[2], side = [0, 0, 1];
  const frame = (deg) => { const a = -deg * Math.PI / 180; return { 0: V.rot([1, 0, 0], side, a), 1: V.rot([0, 1, 0], side, a), 2: side }; };
  const tgt = (spec, deg) => {
    if (spec === 'flat') return { at: [s.J.ankleL[0], B.ankleH, z], foot: frame(0) };
    if (spec === 'toe') { const F = frame(deg); return { at: V.sub([REAR_TOE[0], 0, z], V.add(V.mul(F[0], B.toe), V.mul(F[1], -B.ankleH))), foot: F }; }
    return { at: [spec[0], spec[1], z], foot: frame(spec[2]) };
  };
  for (const k in poses) poses[k].ik = Object.assign({}, poses[k].ik, { ankleL: tgt(FOOT[k], 60) });
  for (const m of mistakes) m.pose.ik = Object.assign({}, m.pose.ik, { ankleL: tgt('toe', m.rear || 60) });
  return poses;
}

window.EXERCISE = {
  id: 'reverse_lunge',
  name: { tr: 'Geri Lunge', en: 'Reverse Lunge', es: 'Zancada hacia atrás' },
  category: { tr: 'Bacak · Kalça', en: 'Legs · Glutes', es: 'Piernas · Glúteos' },
  equipmentLabel: { tr: 'Dambıl (isteğe bağlı)', en: 'Dumbbells (optional)', es: 'Mancuernas (opcional)' },
  muscles: ['quads', 'glutes', 'hamstrings'],
  tempo: '2-0.3-1.7',
  view: { yaw: 90, pitch: 5 },
  alt: { yaw: 22, pitch: 8, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Ön diz ayak ucu yönünde', en: 'Front knee over the toes', es: 'Rodilla delantera sobre el pie' } },
  setupView: { yaw: 30, pitch: 12 },
  setupMarks: [{ type: 'span', joints: ['ankleR', 'ankleL'], label: { tr: 'Kalça genişliği', en: 'Hip width', es: 'Ancho de cadera' } }],
  contacts: ['heelR', 'ballR', 'heelL', 'ballL'],
  props: [['dumbbell', { grip: 'neutral' }]],
  ctx: Object.assign({ plant: ['ankleR'] }, CTX),
  get poses() { return this._poses || (this._poses = leftFoot(RAW, this.mistakes)); },
  rest: 'start',
  rep: [
    { to: 'air', dur: 0.6, phase: 0 },
    { to: 'bottom', dur: 1.4, phase: 1 },
    { to: 'bottom', dur: 0.3, phase: 2 },
    { to: 'air2', dur: 1.0, phase: 3 },
    { to: 'start', dur: 0.7, phase: 4 },
  ],
  setup: { tr: 'Ayaklar kalça genişliğinde, dambıllar yanda. Sol ayak geri gider. Sonra taraf değiştir.',
    en: 'Feet hip-width, dumbbells at your sides. The left foot steps back. Then switch sides.',
    es: 'Pies al ancho de cadera, mancuernas a los lados. El pie izquierdo va atrás. Cambia de lado.' },
  phases: [
    { name: { tr: 'Geri adım', en: 'Step back', es: 'Paso atrás' }, breath: 'in',
      text: { tr: 'Sol ayağı yaklaşık bir metre geri al.', en: 'Step the left foot about a metre back.', es: 'Lleva el pie izquierdo un metro atrás.' } },
    { name: { tr: 'Aşağı in', en: 'Lower', es: 'Baja' }, breath: 'in',
      text: { tr: 'Arka parmak ucuna bas, arka dizi yere doğru indir.', en: 'Land on the back toes and lower the back knee toward the floor.', es: 'Apoya la punta y baja la rodilla trasera.' } },
    { name: { tr: 'Dipte dur', en: 'Pause', es: 'Pausa' }, breath: 'hold', arc: ['hipR', 'kneeR', 'ankleR'], line: ['pelvis', 'neck'],
      text: { tr: 'İki diz yaklaşık 90°. Ön topuk yerde, gövde dik.', en: 'Both knees about 90°. Front heel down, torso tall.', es: 'Ambas rodillas a unos 90°. Talón abajo, torso erguido.' } },
    { name: { tr: 'Ön ayakla it', en: 'Drive up', es: 'Empuja' }, breath: 'out',
      text: { tr: 'Ön topuk ve orta ayakla yeri it.', en: 'Push the floor away with the front heel and mid-foot.', es: 'Empuja el suelo con el talón delantero.' } },
    { name: { tr: 'Ayakları birleştir', en: 'Step in', es: 'Junta los pies' }, breath: 'out',
      text: { tr: 'Arka ayağı öndekinin yanına getir, dik dur.', en: 'Bring the back foot beside the front one and stand tall.', es: 'Trae el pie trasero junto al delantero.' } },
  ],
  tempoText: { tr: '2 sn geri ve in · kısa dur · 1,7 sn dön', en: '2 s back and down · brief pause · 1.7 s return', es: '2 s atrás y abajo · pausa · 1,7 s vuelta' },
  mistakes: [
    { title: { tr: 'Ön diz içe kaçıyor', en: 'Front knee caves in', es: 'Rodilla delantera hacia dentro' },
      fix: { tr: 'Diz 2. parmak hizasında', en: 'Knee over the 2nd toe', es: 'Rodilla sobre el 2.º dedo' },
      fixText: { tr: 'Ön diz ayak ucu yönünde kalır', en: 'Front knee tracks over the toes', es: 'Rodilla sobre el pie' },
      at: 'bottom', pose: { abdR: -8, hrotR: -12 }, view: { yaw: 22, pitch: 8 }, marks: ['kneeR'], parts: ['thighR', 'shinR'] },
    { title: { tr: 'Gövde öne kapanıyor', en: 'Torso folds forward', es: 'El torso se dobla' },
      fix: { tr: 'Dik kal, ön bacak çalışsın', en: 'Stay tall, front leg works', es: 'Erguida, trabaja la pierna delantera' },
      fixText: { tr: 'Ağırlık ön ayakta, gövde hafif önde', en: 'Weight on the front foot, slight lean only', es: 'Peso en el pie delantero, poca inclinación' },
      at: 'bottom', rear: 52, pose: { trunk: 40, hipR: 112, kneeR: 84, hipL: 10, kneeL: 82, thoracic: 8, neck: -6 }, line: ['pelvis', 'neck'], parts: ['waist', 'chest'] },
  ],
  cues: [{ tr: 'Geri adım, düz aşağı', en: 'Step back, drop straight down', es: 'Paso atrás, baja recto' },
    { tr: 'Ön topuk yerde', en: 'Front heel down', es: 'Talón delantero abajo' },
    { tr: 'Ön ayakla geri dön', en: 'Push through the front foot', es: 'Vuelve empujando con el pie delantero' }],
};
}
