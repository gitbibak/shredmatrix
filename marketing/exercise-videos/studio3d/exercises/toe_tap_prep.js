/* Toe Tap Prep (Pilates mat, supine, head down). Supine base from knee_fold: pelvis + waist contacts in every pose,
 * arms long with palms resting on the mat. Both legs start in tabletop (thigh vertical, knee 90). One leg lowers from
 * the hip with the knee held at 90°; fit() bisects the hip angle so the toes just touch the mat (spec: thigh ~45° from the
 * mat). Right and left are separate moves. */
{
const MAT = 0.008;
const G = (w = 0.004) => [['pelvis', MAT], ['waist', MAT + w]];
const BASE = { trunk: -90, abd: 3, hrot: 2, flat: false, hip: 96, knee: 90, ankle: -14, lumbar: -4, thoracic: 3, neck: 16,
  sh: -11, shAbd: 12, el: 4, palm: 'down', curl: 0.1, ground: G() };
const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };
const RAW = { top: { ...BASE }, tapR: { ...BASE, ankleR: -58 }, tapL: { ...BASE, ankleL: -58 } };

function fit(poses, extra) {
  const { solve, expand } = FB;
  const S = (p) => solve(expand(p), CTX).J;
  for (const s of ['R', 'L']) {
    const p = poses['tap' + s]; let lo = 30, hi = 96;           // less hip flexion -> toes lower
    for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (S({ ...p, ['hip' + s]: m })['toe' + s][1] > MAT + 0.004) hi = m; else lo = m; }
    p['hip' + s] = +((lo + hi) / 2).toFixed(2);
  }
  // mistakes that tip the pelvis (arch): keep the legs' world angles, the change is in the back
  for (const [at, pose] of extra) if (pose._dh) for (const s of ['L', 'R']) pose['hip' + s] = (poses[at]['hip' + s] ?? poses[at].hip) + pose._dh;
  return poses;
}

window.EXERCISE = {
  id: 'toe_tap_prep',
  name: { tr: 'Parmak Ucu Dokunuşu Hazırlığı (Toe Tap Prep)', en: 'Toe Tap Prep', es: 'Preparación de toque de puntas (toe tap prep)' },
  category: { tr: 'Pilates · Karın', en: 'Pilates · Core', es: 'Pilates · Core' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['core', 'obliques'],
  tempo: '1.5-1.5',
  tempoReps: 1,
  view: { yaw: 90, pitch: 6, zoom: 1.08 },
  alt: { yaw: 14, pitch: 24, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Pelvis bir masa gibi düz', en: 'Pelvis flat like a tabletop', es: 'Pelvis plana como una mesa' } },
  setupView: { yaw: 40, pitch: 22 },
  setupMarks: [{ type: 'aline', joints: ['hipR', 'kneeR'] }, { type: 'aline', joints: ['kneeR', 'ankleR'] }],
  contacts: ['pelvis', 'waist', 'head', 'handR'],
  props: [['mat', { at: [0.05, 0.006, 0], length: 1.8 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fit(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'top',
  rep: [
    { to: 'tapR', dur: 1.5, phase: 0 },
    { to: 'top', dur: 1.5, phase: 1 },
    { to: 'tapL', dur: 1.5, phase: 2 },
    { to: 'top', dur: 1.5, phase: 1 },
  ],
  setup: { tr: 'Sırtüstü yat, iki bacak masa pozisyonunda: diz kalçanın üstünde, kaval yere paralel. Kollar yanda.',
    en: 'Lie on your back, both legs in tabletop: knees over hips, shins parallel to the floor. Arms long.',
    es: 'Boca arriba, piernas en mesa: rodillas sobre la cadera, espinillas paralelas. Brazos largos.' },
  phases: [
    { name: { tr: 'Sağ ayakla dokun', en: 'Tap the right toes', es: 'Toca con el pie derecho' }, breath: 'in', arc: ['hipR', 'kneeR', 'ankleR'],
      text: { tr: 'Diz 90°de kalsın, bacağı kalçadan indir. Parmak uçları minderi hafifçe öper.', en: 'Keep the knee at 90° and lower from the hip until the toes lightly tap.', es: 'Rodilla a 90°, baja desde la cadera hasta rozar la esterilla.' } },
    { name: { tr: 'Masaya dön', en: 'Back to tabletop', es: 'Vuelve a la mesa' }, breath: 'out',
      text: { tr: 'Nefes ver, karın içe, bacağı geri getir. Pelvis sallanmaz.', en: 'Exhale, belly in, bring the leg back. The pelvis does not rock.', es: 'Exhala, abdomen adentro, sube la pierna. La pelvis no se mueve.' } },
    { name: { tr: 'Sol ayakla dokun', en: 'Tap the left toes', es: 'Toca con el pie izquierdo' }, breath: 'in',
      text: { tr: 'Şimdi sol bacak. Hareket yalnızca kalça ekleminden.', en: 'Now the left leg. Move only from the hip joint.', es: 'Ahora la pierna izquierda. Solo desde la cadera.' } },
  ],
  tempoText: { tr: '1,5 sn dokun · 1,5 sn dön · taraf değiştir', en: '1.5 s tap · 1.5 s return · alternate', es: '1,5 s toca · 1,5 s vuelve · alterna' },
  mistakes: [
    { title: { tr: 'Bel kavisleniyor', en: 'Lower back arches', es: 'La lumbar se arquea' },
      fix: { tr: 'Daha az indir', en: 'Lower less', es: 'Baja menos' },
      fixText: { tr: 'Bel minderden kalkmadan dokunabildiğin kadar', en: 'Only as far as the back stays down', es: 'Solo hasta donde la lumbar siga abajo' },
      at: 'tapR', pose: { lumbar: -16, thoracic: -4, ground: G(0.03), _dh: 23 }, marks: ['waist'], parts: ['waist', 'pelvis'] },
    { title: { tr: 'Destek bacak göğse kayıyor', en: 'Support leg drifts in', es: 'La pierna de apoyo se acerca' },
      fix: { tr: 'Destek dizi kalçanın üstünde', en: 'Support knee over the hip', es: 'Rodilla de apoyo sobre cadera' },
      fixText: { tr: 'Uyluk dik kalsın, yalnızca çalışan bacak hareket eder', en: 'Thigh stays vertical; only the working leg moves', es: 'El muslo queda vertical; solo se mueve la otra pierna' },
      at: 'tapR', pose: { hipL: 122 }, marks: ['kneeL'], line: ['hipL', 'kneeL'], parts: ['thighL'] },
  ],
  cues: [{ tr: 'Pelvis masa gibi', en: 'Pelvis like a tabletop', es: 'Pelvis como una mesa' },
    { tr: 'Yalnızca kalçadan hareket', en: 'Move from the hip only', es: 'Muévete solo desde la cadera' },
    { tr: 'İnerken karın içe', en: 'Belly scoops as the leg lowers', es: 'Abdomen adentro al bajar' }],
};
}
