/* Half-kneeling hip flexor stretch (Pilates mat; right knee down on a folded pad, left foot forward; right hip is stretched).
 * Kneeling setup as camel_pose.js: two ground contacts [kneeR, ankleR] (right shin and top of the foot on the pad) in every
 * pose, knees anchored; the front (left) foot is planted from the start pose (IK), so the front knee bends as the pelvis
 * moves. The contacts fix the right shin, so the right thigh's world angle comes from kneeR (95 = 5° behind vertical) and
 * hipR only rotates the pelvis on the thigh: posterior tilt = more hipR extension + lumbar flexion (thorax stays vertical).
 * Shift forward = kneeR 79 -> pelvis ~12 cm forward over the planted front foot. Hold: right arm overhead + slight side bend left.
 * Hands: left hand on the front thigh (holdL in every pose); right arm FK (relaxed by the side -> overhead) so it sweeps
 * forward-up in an arc instead of a straight hand path through the head. */
{
const MAT = 0.012, PAD = 0.03;
const G = [['kneeR', MAT + PAD], ['ankleR', MAT + PAD - 0.03]];
const BASE = { trunk: 0, hipL: 94, kneeL: 90, hipR: 6, kneeR: 95, ankleR: -62, flatR: false, abd: 3, ground: G, neck: 2, curl: 0.25,
  holdL: [0.3, -0.33, 0.04], elbowPoleL: [-0.4, -1, 0.6], shR: 12, shAbdR: 14, elR: 18, palmR: 'in', noAvoid: true };
const P = (o) => Object.assign({}, BASE, o);
const CTX = { anchorX: ['kneeR'], anchorAt: [-0.15, 0.1] };

window.EXERCISE = {
  id: 'hip_flexor_stretch',
  name: { tr: 'Kalça Fleksörü Esnetme', en: 'Hip Flexor Stretch', es: 'Estiramiento de flexores de cadera' },
  category: { tr: 'Pilates · Esneme', en: 'Pilates · Stretch', es: 'Pilates · Estiramiento' },
  equipmentLabel: { tr: 'Mat · Ped', en: 'Mat · Pad', es: 'Esterilla · Cojín' },
  muscles: ['quads', 'glutes', 'core'],
  side: 'R',
  tempo: '2-2.5-hold-2',
  hold: true, holdDur: 2.5,
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 20, pitch: 10, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Kalça düz, ön diz ayak hizasında', en: 'Pelvis level, front knee over the foot', es: 'Pelvis nivelada, rodilla sobre el pie' } },
  setupView: { yaw: 55, pitch: 12 },
  setupMarks: [{ type: 'aline', joints: ['kneeL', 'ankleL'] }],
  contacts: ['kneeR', 'ankleR', 'heelL', 'toeL'],
  props: [['mat', { at: [-0.05, 0.006, 0], length: 1.8, width: 0.7 }], ['blanket', { at: [-0.32, MAT - 0.03 + PAD - 0.03, 0.09], size: [0.62, 0.03, 0.26] }]],
  ctx: Object.assign({ plant: ['ankleL'] }, CTX),
  poses: {
    start: P({}),
    tuck: P({ lumbar: 12, hipR: -6 }),
    shift: P({ lumbar: 14, hipR: -28, kneeR: 79 }),
    hold: P({ lumbar: 14, hipR: -28, kneeR: 79, side: 10, shR: 168, shAbdR: 12, elR: 6, curlR: 0.05 }),
  },
  rest: 'start',
  rep: [
    { to: 'tuck', dur: 2.0, phase: 0 },
    { to: 'shift', dur: 2.5, phase: 1 },
    { to: 'hold', dur: 2.0, phase: 2 },
    { to: 'start', dur: 2.0, phase: 3 },
  ],
  setup: { tr: 'Sağ diz pedde, sol ayak önde; ön diz bileğin üstünde. Gövde dik, eller ön uylukta. Sonra taraf değiştir.',
    en: 'Right knee on the pad, left foot forward, front knee over the ankle. Tall torso, hands on the front thigh. Then switch.',
    es: 'Rodilla derecha en el cojín, pie izquierdo delante. Tronco erguido, manos en el muslo. Luego cambia de lado.' },
  phases: [
    { name: { tr: 'Kuyruk sokumunu içe al', en: 'Tuck the tailbone', es: 'Mete el coxis' }, breath: 'out',
      text: { tr: 'Nefes ver, pelvisi geriye devir, arka bacağın kalçasını sık.', en: 'Exhale, tilt the pelvis back and squeeze the back-leg glute.', es: 'Exhala, bascula la pelvis atrás y aprieta el glúteo de atrás.' } },
    { name: { tr: 'Öne kaydır', en: 'Shift forward', es: 'Desplaza adelante' }, breath: 'in', line: ['kneeR', 'hipR', 'shoulderR'],
      text: { tr: 'Kalçayı birkaç cm öne kaydır; sağ kalçanın önünde gerilmeyi hisset.', en: 'Shift the hips a few cm forward; feel the stretch at the front of the right hip.', es: 'Lleva la cadera unos cm adelante; siente la cadera derecha.' } },
    { name: { tr: 'Esnemede kal', en: 'Hold', es: 'Mantén' }, breath: 'easy',
      text: { tr: 'Sağ kolu yukarı uzat, hafifçe sola eğil. 20-30 sn yavaş nefes.', en: 'Reach the right arm up and lean slightly left. 20–30 s, slow breaths.', es: 'Brazo derecho arriba, inclínate un poco a la izquierda. 20–30 s.' } },
    { name: { tr: 'Bırak', en: 'Release', es: 'Suelta' }, breath: 'out',
      text: { tr: 'Kolu indir, başlangıca dön ve taraf değiştir.', en: 'Lower the arm, come back to the start and switch sides.', es: 'Baja el brazo, vuelve al inicio y cambia de lado.' } },
  ],
  tempoText: { tr: '2 sn içe al · 2-3 sn öne · 20-30 sn kal · 2 sn bırak', en: '2 s tuck · 2–3 s shift · hold 20–30 s · 2 s release', es: '2 s coxis · 2–3 s adelante · 20–30 s · 2 s suelta' },
  tempoReps: 1,
  mistakes: [
    { title: { tr: 'Bel çukurlaşıyor', en: 'Lower back arches', es: 'La lumbar se arquea' },
      fix: { tr: 'Pelvisi içe al, daha az kay', en: 'Tuck the pelvis, shift less', es: 'Mete la pelvis, desplaza menos' },
      fixText: { tr: 'Gerilme kuyruk sokumunu içe almaktan gelir, eğilmekten değil', en: 'The stretch comes from tucking, not leaning', es: 'El estiramiento viene de meter la pelvis, no de inclinarse' },
      at: 'shift', pose: { lumbar: -14, thoracic: -4, hipR: -8 }, line: ['pelvis', 'waist', 'neck'], parts: ['waist', 'pelvis'] },
    { title: { tr: 'Ön diz çok öne kaçıyor', en: 'Front knee shoots forward', es: 'La rodilla se va muy adelante' },
      fix: { tr: 'Ön ayağı biraz ileri al', en: 'Step the front foot forward', es: 'Adelanta un poco el pie' },
      fixText: { tr: 'Ön diz ayak bileğinin üstünde kalsın', en: 'Keep the front knee over the ankle', es: 'Rodilla delantera sobre el tobillo' },
      at: 'shift', pose: { kneeR: 68, hipR: -38 }, line: ['kneeL', 'ankleL'], marks: ['kneeL'], parts: ['shinL'] },
  ],
  cues: [{ tr: 'Önce kuyruk sokumunu içe al', en: 'Tuck the tailbone first', es: 'Primero mete el coxis' },
    { tr: 'Gerilme eğilmekten değil, içe almaktan', en: 'The stretch comes from tucking, not leaning', es: 'Estira metiendo la pelvis, no inclinando' },
    { tr: 'Göğüs dik', en: 'Tall chest', es: 'Pecho erguido' }],
};
}
