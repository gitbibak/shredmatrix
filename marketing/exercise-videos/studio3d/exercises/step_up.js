/* Step-up onto a 30 cm box, right leg works (foot stays flat on the box: ctx.plant + anchor, ground contact = right heel
 * on the box top). The left (trailing) foot has world IK targets in every pose: flat on the floor at the start, and at the
 * top the free-leg position of the FK pose (hip ~60, knee ~80), so it lifts off and taps back down without sliding.
 * Spec start (hip 80, knee 80 with the trailing leg straight on the floor) needs a ~45 cm box; on 30 cm the working knee
 * starts at ~92 with hip ~78. */
{
const BOX = 0.3;
const CTX = { anchorX: ['ankleR'], anchorAt: [0, 0.1] };
const G = [['heelR', BOX]];
const DB = { sh: 2, shAbd: 10, el: 6, palm: 'in', abd: 2, hrotR: 6, hrotL: 4, ground: G };
const RAW = {
  start: Object.assign({ trunk: 10, hipR: 78, kneeR: 92, hipL: 8, kneeL: 8, neck: -4 }, DB),
  top: Object.assign({ trunk: 0, hipR: 2, kneeR: 2, hipL: 60, kneeL: 80, ankleL: -10, flatL: false, neck: 0 }, DB),
};
function trailFoot(poses) {
  const { solve, expand, BODY: B } = FB;
  const fr = (F) => ({ 0: F[0].slice(), 1: F[1].slice(), 2: F[2].slice() });
  const st = solve(expand(Object.assign({}, poses.start, { ik: undefined })), CTX);
  const tp = solve(expand(Object.assign({}, poses.top, { ik: undefined })), CTX);
  poses.start.ik = { ankleL: { at: [st.J.ankleL[0], B.ankleH, st.J.ankleL[2]], foot: fr(st.F.footL) } };
  poses.top.ik = { ankleL: { at: tp.J.ankleL.slice(), foot: fr(tp.F.footL) } };
  return poses;
}

window.EXERCISE = {
  id: 'step_up',
  name: { tr: 'Step-Up', en: 'Step-Up', es: 'Subida al cajón' },
  category: { tr: 'Bacak · Kalça', en: 'Legs · Glutes', es: 'Piernas · Glúteos' },
  equipmentLabel: { tr: 'Kutu · Dambıl', en: 'Box · Dumbbells', es: 'Cajón · Mancuernas' },
  muscles: ['quads', 'glutes', 'hamstrings'],
  tempo: '1-0.4-2',
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 22, pitch: 8, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Diz ayak ucu yönünde, kalça düz', en: 'Knee over the toes, hips level', es: 'Rodilla sobre el pie, cadera nivelada' } },
  setupView: { yaw: 35, pitch: 14 },
  contacts: ['heelR', 'ballR', 'ballL'],
  props: [['box', { at: [0.07, 0, 0.17], size: [0.45, BOX, 0.4] }], ['dumbbell', { grip: 'neutral' }]],
  ctx: Object.assign({ plant: ['ankleR'] }, CTX),
  get poses() { return this._poses || (this._poses = trailFoot(RAW)); },
  rest: 'start',
  rep: [
    { to: 'top', dur: 1.2, phase: 0 },
    { to: 'top', dur: 0.4, phase: 1 },
    { to: 'start', dur: 2.0, phase: 2 },
  ],
  setup: { tr: 'Sağ ayağın tamamı kutuda, topuk dahil. Sol ayak yerde, dambıllar yanda. Sonra taraf değiştir.',
    en: 'Whole right foot on the box, heel included. Left foot on the floor. Switch sides after.',
    es: 'Todo el pie derecho en el cajón, talón incluido. Izquierdo en el suelo. Luego cambia de lado.' },
  phases: [
    { name: { tr: 'Yukarı it', en: 'Drive up', es: 'Sube' }, breath: 'out',
      text: { tr: 'Kutudaki topukla it; arka ayakla zıplama.', en: 'Press through the heel on the box; don’t push off the back foot.', es: 'Empuja con el talón del cajón; no te impulses atrás.' } },
    { name: { tr: 'Tepede dur', en: 'Stand tall', es: 'Arriba' }, breath: 'hold', line: ['ankleR', 'hipR', 'neck'],
      text: { tr: 'Tamamen dikleş, kalçanı sık. Sol diz önde.', en: 'Stand fully tall and squeeze the glute. Left knee up.', es: 'Erguida del todo, aprieta glúteo. Rodilla izquierda arriba.' } },
    { name: { tr: 'Yavaşça in', en: 'Lower slowly', es: 'Baja despacio' }, breath: 'in', arc: ['hipR', 'kneeR', 'ankleR'],
      text: { tr: 'Sağ dizi bükerek sol ayağı yere yavaşça indir.', en: 'Bend the right knee and lower the left foot slowly to the floor.', es: 'Flexiona la rodilla derecha y baja el pie izquierdo despacio.' } },
  ],
  tempoText: { tr: '1 sn çık · kısa dur · 2 sn in', en: '1 s up · brief hold · 2 s down', es: '1 s arriba · pausa · 2 s abajo' },
  mistakes: [
    { title: { tr: 'Diz içe kaçıyor', en: 'Knee caves in', es: 'La rodilla se va hacia dentro' },
      fix: { tr: 'Diz 2. parmak hizasında', en: 'Knee over the 2nd toe', es: 'Rodilla sobre el 2.º dedo' },
      fixText: { tr: 'Çıkarken diz ayak ucu yönünde kalır', en: 'The knee tracks over the toes as you rise', es: 'La rodilla sigue al pie al subir' },
      at: 'start', pose: { abdR: -10, hrotR: -14 }, view: { yaw: 22, pitch: 8 }, marks: ['kneeR'], parts: ['thighR', 'shinR'] },
    { title: { tr: 'Öne eğilmek', en: 'Leaning forward', es: 'Inclinarse adelante' },
      fix: { tr: 'Göğüs dik, ayak düz', en: 'Chest up, foot flat', es: 'Pecho arriba, pie plano' },
      fixText: { tr: 'Gövde dik; tüm ayakla kutuya bas', en: 'Torso upright; press with the whole foot', es: 'Torso erguido; apoya todo el pie' },
      at: 'start', pose: { trunk: 40, hipR: 108, kneeR: 98, hipL: 36, kneeL: 6, neck: -8 }, line: ['pelvis', 'neck'], parts: ['waist', 'chest'] },
  ],
  cues: [{ tr: 'Tüm ayak kutuda', en: 'Whole foot on the box', es: 'Todo el pie en el cajón' },
    { tr: 'Üstteki bacakla it', en: 'Drive through the top leg', es: 'Empuja con la pierna de arriba' },
    { tr: 'Yavaş in, düşme', en: 'Lower slowly, don’t drop', es: 'Baja despacio, sin caer' }],
};
}
