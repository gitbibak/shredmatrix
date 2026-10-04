/* Knee Fold (Pilates mat, supine, head down). Same supine base as neutral_pelvis_breathing: pelvis + waist contacts in
 * every pose (lower back still), heels fitted to the mat, ankles planted from the rest pose. The working leg is released
 * with `unplant` and folds to tabletop (thigh vertical, shin parallel to the floor); right and left are separate moves.
 * Arms long by the sides, hands resting palm-down on the mat. */
{
const MAT = 0.008;
const G = (w = 0.004) => [['pelvis', MAT], ['waist', MAT + w]];
const BASE = { trunk: -90, abd: 3, hrot: 2, flat: true, hip: 60, knee: 100, lumbar: -4, thoracic: 3, neck: 16,
  sh: -11, shAbd: 12, el: 4, palm: 'down', curl: 0.1, ground: G() };
const FOLD = (s) => ({ ['hip' + s]: 96, ['knee' + s]: 90, ['ankle' + s]: -12, ['flat' + s]: false });
const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };

function fit(poses, extra) {
  const { solve, expand } = FB;
  const S = (p) => solve(expand(p), { anchorX: CTX.anchorX, anchorAt: CTX.anchorAt }).J;
  let lo = 70, hi = 140;
  for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (S({ ...poses.down, knee: m }).heelR[1] > MAT + 0.002) lo = m; else hi = m; }
  const k = +((lo + hi) / 2).toFixed(2);
  for (const n in poses) for (const s of ['L', 'R']) if (poses[n]['knee' + s] === undefined) poses[n]['knee' + s] = k;
  for (const n in poses) delete poses[n].knee;
  // mistakes that tilt the pelvis: keep the support foot where it is in the rest pose (ankle IK target)
  const J0 = S(poses.down);
  for (const [at, pose] of extra) if (pose._pinL) pose.ik = { ankleL: { at: J0.ankleL.slice(), foot: FB.solve(FB.expand(poses.down), CTX).F.footL } };
  return poses;
}
const RAW = { down: { ...BASE }, foldR: { ...BASE, ...FOLD('R') }, foldL: { ...BASE, ...FOLD('L') } };

window.EXERCISE = {
  id: 'knee_fold',
  name: { tr: 'Diz Katlama (Knee Fold)', en: 'Knee Fold', es: 'Pliegue de rodilla (knee fold)' },
  category: { tr: 'Pilates · Karın', en: 'Pilates · Core', es: 'Pilates · Core' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['core', 'obliques'],
  tempo: '2-2',
  tempoReps: 1,
  view: { yaw: 90, pitch: 6, zoom: 1.08 },
  alt: { yaw: 12, pitch: 24, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Pelvis düz kalır, iki yana yatmaz', en: 'The pelvis stays level, no rocking', es: 'La pelvis queda nivelada, sin balanceo' } },
  setupView: { yaw: 40, pitch: 22 },
  setupMarks: [{ type: 'span', joints: ['ankleR', 'ankleL'], label: { tr: 'Kalça genişliği', en: 'Hip width', es: 'Ancho de cadera' } }],
  contacts: ['pelvis', 'waist', 'head', 'heelR', 'ballR'],
  props: [['mat', { at: [0.05, 0.006, 0], length: 1.8 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fit(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'down',
  rep: [
    { to: 'foldR', dur: 2.0, phase: 0 },
    { to: 'down', dur: 2.0, phase: 1 },
    { to: 'foldL', dur: 2.0, phase: 2 },
    { to: 'down', dur: 2.0, phase: 1 },
  ],
  setup: { tr: 'Sırtüstü yat, dizler bükülü, ayaklar kalça genişliğinde. Pelvis nötr, kollar yanda, avuçlar yere.',
    en: 'Lie on your back, knees bent, feet hip-width. Neutral pelvis, arms long, palms down.',
    es: 'Boca arriba, rodillas flexionadas, pies al ancho de cadera. Pelvis neutra, brazos largos, palmas abajo.' },
  phases: [
    { name: { tr: 'Sağ dizi katla', en: 'Fold the right knee', es: 'Pliega la rodilla derecha' }, breath: 'out', line: ['hipR', 'kneeR'],
      text: { tr: 'Karın içe, ayağı kaldır. Diz kalçanın üstünde, kaval yere paralel.', en: 'Belly in, float the foot up. Knee over the hip, shin parallel to the floor.', es: 'Abdomen adentro, eleva el pie. Rodilla sobre la cadera, espinilla paralela.' } },
    { name: { tr: 'Ayağı indir', en: 'Lower the foot', es: 'Baja el pie' }, breath: 'in',
      text: { tr: 'Aynı yoldan parmak uçlarını mindere bırak. Pelvis kıpırdamaz.', en: 'Return the toes to the mat on the same path. The pelvis stays still.', es: 'Vuelve los dedos a la esterilla por el mismo camino. Pelvis quieta.' } },
    { name: { tr: 'Sol dizi katla', en: 'Fold the left knee', es: 'Pliega la rodilla izquierda' }, breath: 'out',
      text: { tr: 'Şimdi sol bacak. Hareket derin karından başlar.', en: 'Now the left leg. Lift from the deep belly.', es: 'Ahora la pierna izquierda. Eleva desde el abdomen profundo.' } },
  ],
  tempoText: { tr: '2 sn katla · 2 sn indir · taraf değiştir', en: '2 s fold · 2 s lower · alternate', es: '2 s pliega · 2 s baja · alterna' },
  mistakes: [
    { title: { tr: 'Pelvis yana yatıyor', en: 'Pelvis tilts to the side', es: 'La pelvis se inclina' },
      fix: { tr: 'Pelvis masa gibi sabit', en: 'Pelvis still like a table', es: 'Pelvis quieta como una mesa' },
      fixText: { tr: 'Hareketi küçült, kaburgalar aşağıda', en: 'Smaller range, ribs knitted down', es: 'Menos rango, costillas abajo' },
      at: 'foldR', pose: { roll: -5, pos: [0, 0.016, 0], hipR: 100, _pinL: 1 }, view: { yaw: 12, pitch: 24 }, line: ['hipL', 'hipR'], parts: ['pelvis'] },
    { title: { tr: 'Bel minderden kalkıyor', en: 'Lower back arches', es: 'La lumbar se arquea' },
      fix: { tr: 'Alt karnı çalıştır', en: 'Engage the lower belly', es: 'Activa el bajo vientre' },
      fixText: { tr: 'Bel nötr, kalkan ayak daha alçakta', en: 'Neutral back, keep the lifting foot lower', es: 'Lumbar neutra, el pie más bajo' },
      at: 'foldR', pose: { lumbar: -16, thoracic: -4, ground: G(0.03), _pinL: 1 }, marks: ['waist'], parts: ['waist', 'pelvis'] },
  ],
  cues: [{ tr: 'Pelvis masa gibi sabit', en: 'Pelvis still like a table', es: 'Pelvis quieta como una mesa' },
    { tr: 'Derin karından kaldır', en: 'Lift from the deep belly', es: 'Eleva desde el abdomen profundo' },
    { tr: 'Diz kalçanın üstünde', en: 'Knee over the hip', es: 'Rodilla sobre la cadera' }],
};
}
