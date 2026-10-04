/* Clam shell (Pilates mat, side-lying on the RIGHT side, top = left knee opens).
 * Side-lying base as side_kick_front_back.js: trunk 90 rolled -90 (roll + tips toward the character's LEFT), ground contacts
 * [hipR, shoulderR], head on the bottom hand, top hand flat on the mat in front of the chest.
 * Hips 45°, knees 90°, top thigh adducted 12° so the knees and heels rest on each other. Heels stay together: the top ankle
 * has the same world IK target in every pose (HEEL) and the knee is
 * opened with abdL 35 + hrotL 50 (spec end angles); IK keeps the heel on the bottom heel while the knee rises.
 * Feet-separate mistake: the ankle target moves 11 cm up. */
{
const G = [['hipR', 0.006], ['shoulderR', 0.006]];
const HEEL = [-0.6, 0.159, 0.026];   // top ankle in the closed pose (solved), kept as an IK target in every pose
const BASE = { trunk: 90, roll: -90, ground: G, flat: false, neck: 4,
  hip: 45, knee: 90, abdR: -0.5, abdL: -12, hrotL: 0, ankle: -15,
  holdR: [0.06, 0.37, 0.083], elbowPoleR: [0.7, 1, -0.25], palmR: [0, 0, -1], curlR: 0.3,
  ik: { ankleL: { at: HEEL } }, holdL: [0.25, 0, -0.2], elbowPoleL: [-0.2, 0.3, 1], handFlatL: true, handSurfaceL: 0.004, curlL: 0.1 };
const P = (o) => Object.assign({}, BASE, o);

window.EXERCISE = {
  id: 'clam_shell',
  name: { tr: 'İstiridye (Clam Shell)', en: 'Clam Shell', es: 'Concha (clam shell)' },
  category: { tr: 'Pilates · Kalça', en: 'Pilates · Hips', es: 'Pilates · Cadera' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['glutes', 'obliques'],
  side: 'L',
  tempo: '2-2',
  view: { yaw: -122, pitch: 22, zoom: 1.15 },
  alt: { yaw: -90, pitch: 12, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Topuklar birlikte, kalça geriye devrilmez', en: 'Heels together, the pelvis does not roll back', es: 'Talones juntos, la pelvis no rueda' } },
  setupView: { yaw: -60, pitch: 30 },
  setupMarks: [{ type: 'aline', joints: ['shoulderR', 'hipR'] }],
  contacts: ['shoulderR', 'hipR', 'kneeR', 'heelL', 'handL'],
  props: [['mat', { at: [0, 0.006, -0.15], length: 1.7, width: 0.75 }]],
  ctx: { anchorX: ['pelvis'], anchorAt: [0, 0] },
  poses: {
    closed: P({}),
    open: P({ abdL: 22, hrotL: 45 }),
  },
  rest: 'closed',
  rep: [
    { to: 'open', dur: 2.0, phase: 0 },
    { to: 'closed', dur: 2.0, phase: 1 },
  ],
  setup: { tr: 'Sağ yanına uzan, başını sağ eline koy. Kalça 45°, dizler 90° bükülü, topuklar bir arada. Sonra taraf değiştir.',
    en: 'Lie on your right side, head on your hand. Hips bent 45°, knees 90°, heels together. Then switch sides.',
    es: 'Túmbate sobre el lado derecho, cabeza en la mano. Cadera a 45°, rodillas a 90°, talones juntos. Luego cambia.' },
  phases: [
    { name: { tr: 'Dizi aç', en: 'Open', es: 'Abre' }, breath: 'out', arc: ['kneeR', 'hipL', 'kneeL'],
      text: { tr: 'Nefes ver, üst dizi istiridye gibi aç. Topuklar ayrılmaz, kalça sabit.', en: 'Exhale and open the top knee like a clam. Heels stay together, pelvis still.', es: 'Exhala y abre la rodilla como una concha. Talones juntos, pelvis quieta.' } },
    { name: { tr: 'Kapat', en: 'Close', es: 'Cierra' }, breath: 'in',
      text: { tr: 'Nefes al, dizi kontrollü şekilde kapat.', en: 'Inhale and close the knee with control.', es: 'Inhala y cierra la rodilla con control.' } },
  ],
  tempoText: { tr: '2 sn aç · 2 sn kapat', en: '2 s open · 2 s close', es: '2 s abre · 2 s cierra' },
  mistakes: [
    { title: { tr: 'Kalça geriye devriliyor', en: 'Pelvis rolls back', es: 'La pelvis rueda atrás' },
      fix: { tr: 'Kalçaları üst üste tut', en: 'Keep the hips stacked', es: 'Caderas apiladas' },
      fixText: { tr: 'Karnı sık, açıklığı azalt; hareket kalçadan', en: 'Brace the abs and open less; move from the hip', es: 'Abdomen firme, abre menos; desde la cadera' },
      at: 'open', pose: { roll: -106, abdL: 28, hrotL: 50 }, view: { yaw: -150, pitch: 30 }, line: ['hipL', 'hipR'], marks: ['hipL'], parts: ['pelvis', 'waist'] },
    { title: { tr: 'Ayaklar ayrılıyor', en: 'Feet separate', es: 'Los pies se separan' },
      fix: { tr: 'Topukları birbirine bastır', en: 'Press the heels together', es: 'Junta los talones' },
      fixText: { tr: 'Sadece diz açılır, topuklar hep temas eder', en: 'Only the knee opens, the heels always touch', es: 'Solo se abre la rodilla, los talones se tocan' },
      at: 'open', pose: { abdL: 20, hrotL: 20, ik: { ankleL: { at: [-0.56, 0.27, -0.04] } } }, marks: ['heelL', 'heelR'], parts: ['shinL'] },
  ],
  cues: [{ tr: 'Topuklar bir arada', en: 'Heels stay together', es: 'Talones juntos' },
    { tr: 'Belden değil, kalçadan aç', en: 'Open from the hip, not the back', es: 'Abre desde la cadera, no la espalda' },
    { tr: 'Kalçalar üst üste', en: 'Stacked hips', es: 'Caderas apiladas' }],
};
}
