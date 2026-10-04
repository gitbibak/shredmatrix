/* Seated cable row. Seat (bench prop) + foot plate + low-row column with a V-handle.
 * The station is a prop defined in this file (FB.PROPS._rowStation): the foot plate is built from the planted feet,
 * the cable runs from the pulley to the V-handle apex, the two grips sit in the hands (neutral grip).
 * Hands are world IK targets (ROW) on a near-horizontal line: arms long at lower-sternum height -> handle at the navel.
 * Thigh angle is kept fixed while the trunk rocks: hip = 70 + trunk (hip measured to the trunk line). */
{
const { V } = FB;
const PUL = [1.32, 0.7, 0];
FB.PROPS._rowStation = (sol, o = {}) => {
  const out = [];
  // foot plate under both soles (feet are planted, so it never moves)
  const F = sol.F.footR, c = V.mul(V.add(V.add(sol.J.heelR, sol.J.toeR), V.add(sol.J.heelL, sol.J.toeL)), 0.25);
  const pc = V.add(V.add(c, V.mul(F[1], -0.02)), V.mul(F[0], -0.02));
  out.push({ t: 'box', c: [pc[0], pc[1], 0], s: [0.34, 0.035, 0.56], m: 'frameDark', R: [F[0], F[1], [0, 0, 1]], round: 0.01 });
  out.push({ t: 'box', c: [(pc[0] + PUL[0]) / 2 + 0.02, 0.025, 0], s: [PUL[0] - pc[0] + 0.25, 0.05, 0.22], m: 'frame' });
  out.push({ t: 'box', c: [-0.05, 0.025, 0], s: [1.0, 0.05, 0.16], m: 'frame' });
  // column + pulley + cable to the V-handle
  out.push({ t: 'box', c: [PUL[0] + 0.16, 1.0, 0], s: [0.2, 2.0, 0.48], m: 'frameDark', round: 0.01 });
  out.push({ t: 'sph', c: PUL, r: 0.045, m: 'iron' });
  const hm = V.lerp(sol.J.handL, sol.J.handR, 0.5), dir = V.norm(V.sub(PUL, hm)), apex = V.add(hm, V.mul(dir, 0.13));
  out.push({ t: 'tube', pts: [PUL, apex], r: 0.004, m: 'chrome' });
  for (const s of ['L', 'R']) {
    const h = sol.J['hand' + s];
    out.push({ t: 'cyl', a: V.add(h, [0, -0.065, 0]), b: V.add(h, [0, 0.065, 0]), r: 0.016, m: 'rubber' });
    out.push({ t: 'tube', pts: [V.add(h, [0, 0.07, 0]), V.add(V.lerp(h, apex, 0.5), [0, 0.03, 0]), apex], r: 0.011, m: 'chrome' });
    out.push({ t: 'tube', pts: [V.add(h, [0, -0.07, 0]), V.add(V.lerp(h, apex, 0.5), [0, -0.03, 0]), apex], r: 0.011, m: 'chrome' });
  }
  sol.grip = { L: [0, 1, 0], R: [0, 1, 0] }; sol.gripKind = 'neutral';
  return out;
};
const ROW = (x, y, z = 0.07) => ({ handL: { at: [x, y, -z] }, handR: { at: [x, y, z] } });
const SIT = { ground: [['pelvis', 0.53]], knee: 25, ankle: 8, flat: false, abd: 6, elbowPole: [-1, -0.35, 0.5], noAvoid: true };

window.EXERCISE = {
  id: 'seated_cable_row',
  name: { tr: 'Oturarak Kablo Row', en: 'Seated Cable Row', es: 'Remo sentado en polea' },
  category: { tr: 'Sırt', en: 'Back', es: 'Espalda' },
  equipmentLabel: { tr: 'Kablo, V-tutamak', en: 'Cable, V-handle', es: 'Polea, agarre en V' },
  muscles: ['lats', 'upperback', 'delts', 'biceps'],
  tempo: '1-1-2',
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 55, pitch: 28, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'İki dirsek eşit ve gövdeye yakın geriye gider', en: 'Both elbows travel back evenly, close to the body', es: 'Ambos codos van atrás igual, pegados al cuerpo' } },
  setupView: { yaw: 40, pitch: 12 },
  props: [['bench', { at: [-0.12, 0, 0], length: 0.62, height: 0.53, width: 0.32 }], ['_rowStation']],
  ctx: { anchorX: ['pelvis'], anchorAt: [0, 0], plant: ['ankleL', 'ankleR'] },
  contacts: ['pelvis', 'ballL', 'ballR'],
  poses: {
    // tall, very slight forward lean, arms long, shoulder blades reaching forward
    reach: { ...SIT, trunk: 10, hip: 80, neck: 2, protract: 0.035, ik: ROW(0.675, 0.92) },
    // handle at the navel, elbows behind the torso, shoulder blades squeezed, torso ~5° back
    row: { ...SIT, trunk: -5, hip: 65, thoracic: -4, neck: -2, protract: -0.025, ik: ROW(0.17, 0.81) },
  },
  rest: 'reach',
  rep: [
    { to: 'row', dur: 1.2, phase: 0 },
    { to: 'row', dur: 1.0, phase: 1 },
    { to: 'reach', dur: 2.0, phase: 2 },
  ],
  setup: { tr: 'Ayakları platforma koy, dizler hafif bükülü. Tutamağı avuçlar karşılıklı tut, dik otur.',
    en: 'Feet on the plate, knees slightly bent. Hold the handle palms facing, sit tall.',
    es: 'Pies en la plataforma, rodillas algo flexionadas. Agarre neutro, siéntate erguida.' },
  phases: [
    { name: { tr: 'Çek', en: 'Row', es: 'Tira' }, breath: 'out', line: ['pelvis', 'neck'],
      text: { tr: 'Dirsekleri kaburgaların yanından geriye sür. Tutamak göbeğe gelir.', en: 'Drive the elbows back along your ribs. Handle to the navel.', es: 'Lleva los codos atrás junto a las costillas. Agarre al ombligo.' } },
    { name: { tr: 'Sık', en: 'Squeeze', es: 'Aprieta' }, breath: 'hold', marks: [{ type: 'mark', joint: 'elbowR' }],
      text: { tr: 'Kürek kemiklerini 1 saniye sık. Göğüs yukarıda.', en: 'Squeeze the shoulder blades for 1 second. Chest up.', es: 'Junta las escápulas 1 segundo. Pecho arriba.' } },
    { name: { tr: 'Kontrollü uzat', en: 'Reach back out', es: 'Estira despacio' }, breath: 'in', line: ['pelvis', 'neck'],
      text: { tr: 'İki saniyede kolları uzat, kürekler öne kaysın. Sırt düz kalır.', en: 'Take two seconds to straighten the arms; let the blades slide forward. Back flat.', es: 'Dos segundos para estirar; deja que las escápulas avancen. Espalda recta.' } },
  ],
  tempoText: { tr: '1 sn çek · 1 sn sık · 2 sn uzat', en: '1 s row · 1 s squeeze · 2 s reach', es: '1 s tira · 1 s aprieta · 2 s estira' },
  mistakes: [
    { title: { tr: 'Geriye savrulmak', en: 'Swinging back', es: 'Balancearse atrás' },
      fix: { tr: 'Gövde neredeyse sabit', en: 'Keep the torso almost still', es: 'Torso casi quieto' },
      fixText: { tr: 'En fazla 5° geriye, işi sırt yapsın', en: 'At most 5° back; let the back do the work', es: 'Como mucho 5° atrás; que trabaje la espalda' },
      at: 'row', pose: { trunk: -27, hip: 43, thoracic: -2, neck: 0, ik: ROW(0.06, 0.78) },
      line: ['pelvis', 'neck'], parts: ['waist', 'chest'] },
    { title: { tr: 'Uzanırken sırt yuvarlanıyor', en: 'Back rounds at the stretch', es: 'Espalda redonda al estirar' },
      fix: { tr: 'Dik kal, karnı sık', en: 'Stay tall, brace', es: 'Erguida, abdomen firme' },
      fixText: { tr: 'Sadece kollar ve kürekler öne gider', en: 'Only the arms and shoulder blades reach forward', es: 'Solo brazos y escápulas van adelante' },
      at: 'reach', pose: { trunk: 16, hip: 86, lumbar: 11, thoracic: 16, neck: 14, ik: ROW(0.88, 0.74) },
      line: ['pelvis', 'waist', 'neck'], goodLine: ['pelvis', 'neck'], parts: ['waist', 'chest'] },
  ],
  cues: [{ tr: 'Dik otur, göğüs yukarı', en: 'Sit tall, chest up', es: 'Erguida, pecho arriba' },
    { tr: 'Tutamak göbeğe', en: 'Handle to the navel', es: 'Agarre al ombligo' },
    { tr: 'Dönüşü yavaşlat', en: 'Control the return', es: 'Controla la vuelta' }],
};
}
