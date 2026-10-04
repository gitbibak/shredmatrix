/* Seated resistance-band row on the floor. Band looped around the arches (band prop: ball of each foot -> hand).
 * Pelvis sits on the mat, feet are planted from the rest pose (heels on the mat, toes up).
 * Spec note: "hip_flexion 85 with trunk 5°" cannot put straight legs on the floor; with the trunk at the spec angle the
 * long-sitting hip measures ~97° (thigh just above horizontal). Trunk, elbow and shoulder angles follow the spec. */
{
const { V, M } = FB;
// band looped under the arches: runs along the sole, wraps over the toes and goes to the hand
FB.PROPS._footBand = (sol) => {
  const out = [];
  for (const s of ['L', 'R']) {
    const F = sol.F['foot' + s], dn = V.mul(F[1], -0.012), heel = sol.J['heel' + s], toe = sol.J['toe' + s];
    const arch = V.add(V.lerp(heel, toe, 0.45), dn), front = V.add(V.lerp(heel, toe, 0.9), V.mul(F[1], -0.004));
    const over = V.add(toe, V.add(V.mul(F[0], 0.012), V.mul(F[1], 0.02)));
    out.push({ t: 'tube', pts: [arch, front, over, sol.J['hand' + s]], r: 0.008, m: 'band' });
  }
  return out;
};
const SIT = { ground: [['pelvis', 0.012]], knee: 10, ankle: 0, flat: false, abd: 4, palm: 'in', curl: 1, elbowPole: [-1, -0.3, 0.3] };

window.EXERCISE = {
  id: 'band_row',
  name: { tr: 'Direnç Bandı Row', en: 'Resistance Band Row', es: 'Remo con banda de resistencia' },
  category: { tr: 'Sırt', en: 'Back', es: 'Espalda' },
  equipmentLabel: { tr: 'Direnç bandı', en: 'Resistance band', es: 'Banda elástica' },
  muscles: ['lats', 'upperback', 'delts', 'biceps'],
  tempo: '1-1-2',
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 30, pitch: 14, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Dirsekler gövdeye yakın, eller kaburgalara', en: 'Elbows close to the body, hands to the ribs', es: 'Codos pegados, manos a las costillas' } },
  setupView: { yaw: 40, pitch: 16 },
  props: [['mat', { at: [0.3, 0.006, 0], length: 1.7 }], ['_footBand']],
  ctx: { anchorX: ['pelvis'], anchorAt: [0, 0], plant: ['ankleL', 'ankleR'] },
  contacts: ['pelvis', 'heelL', 'heelR'],
  poses: {
    // tall long-sitting, band taut, arms straight forward at chest height, shoulder blades reaching forward
    reach: { ...SIT, trunk: 5, hip: 97.5, neck: 2, sh: 80, shAbd: 2, el: 0, protract: 0.03 },
    // hands at the lower ribs, elbows behind the torso, blades squeezed, torso upright
    row: { ...SIT, trunk: 0, hip: 92.5, neck: 0, sh: -14, shAbd: 10, el: 108, protract: -0.025 },
  },
  rest: 'reach',
  rep: [
    { to: 'row', dur: 1.2, phase: 0 },
    { to: 'row', dur: 1.0, phase: 1 },
    { to: 'reach', dur: 2.0, phase: 2 },
  ],
  setup: { tr: 'Bacaklar uzun, dizler hafif bükülü. Bandı ayak tabanından geçir, uçlarını avuçlar içe bakacak tut.',
    en: 'Legs long, knees soft. Loop the band around your feet and hold the ends, palms facing in.',
    es: 'Piernas largas, rodillas suaves. Pasa la banda por los pies y sujeta los extremos, palmas hacia dentro.' },
  phases: [
    { name: { tr: 'Çek', en: 'Row', es: 'Tira' }, breath: 'out', line: ['pelvis', 'neck'],
      text: { tr: 'Elleri alt kaburgalara çek, dirsekler gövdenin yanından geriye.', en: 'Pull the hands to the lower ribs, elbows back along the body.', es: 'Lleva las manos a las costillas bajas, codos atrás junto al cuerpo.' } },
    { name: { tr: 'Sık', en: 'Squeeze', es: 'Aprieta' }, breath: 'hold', marks: [{ type: 'mark', joint: 'elbowR' }],
      text: { tr: 'Kürek kemiklerini 1 saniye sık. Gövde dik.', en: 'Squeeze the shoulder blades for 1 second. Torso upright.', es: 'Junta las escápulas 1 segundo. Torso erguido.' } },
    { name: { tr: 'Yavaş bırak', en: 'Slow return', es: 'Vuelve despacio' }, breath: 'in',
      text: { tr: 'İki saniyede kolları uzat, bant gergin kalsın.', en: 'Take two seconds to straighten the arms; keep the band taut.', es: 'Dos segundos para estirar; la banda sigue tensa.' } },
  ],
  tempoText: { tr: '1 sn çek · 1 sn sık · 2 sn bırak', en: '1 s row · 1 s squeeze · 2 s return', es: '1 s tira · 1 s aprieta · 2 s vuelve' },
  mistakes: [
    { title: { tr: 'Geriye yatarak çekmek', en: 'Leaning back to finish', es: 'Echarse atrás para terminar' },
      fix: { tr: 'Dik otur', en: 'Stay upright', es: 'Mantente erguida' },
      fixText: { tr: 'Gövde dik, işi kollar ve sırt yapar', en: 'Torso upright; arms and back do the work', es: 'Torso erguido; trabajan brazos y espalda' },
      at: 'row', pose: { trunk: -23, hip: 69.5, thoracic: -3 }, line: ['pelvis', 'neck'], parts: ['waist', 'chest'] },
    { title: { tr: 'Omuzlar kulağa kalkıyor', en: 'Shoulders shrug up', es: 'Hombros encogidos' },
      fix: { tr: 'Omuzları aşağı indir', en: 'Shoulders down', es: 'Hombros abajo' },
      fixText: { tr: 'Boyun uzun, kürekler aşağı ve geriye', en: 'Long neck; blades down and back', es: 'Cuello largo; escápulas abajo y atrás' },
      at: 'row', pose: { shrug: 0.06, neck: 6, sh: -6, el: 115 }, view: { yaw: 30, pitch: 10 }, marks: ['shoulderL', 'shoulderR'], parts: ['upper', 'neck'] },
  ],
  cues: [{ tr: 'Dik otur', en: 'Sit tall', es: 'Siéntate erguida' },
    { tr: 'Dirsekler geriye', en: 'Elbows back', es: 'Codos atrás' },
    { tr: 'Yavaş bırak', en: 'Slow return', es: 'Vuelve despacio' }],
};
}
