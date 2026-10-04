/* Bent-over barbell row. Template for the strength_pull batch.
 * Hands are driven by absolute IK targets (`ik`, world metres, x = forward, z = right) so the bar follows a
 * fixed, near-vertical path regardless of small torso changes. Feet are planted (rest pose = start).
 * Bar path: start (x 0.14, y 0.572) hanging just in front of the knees -> top (x 0.015, y 0.913) at the navel.
 * If a pose's torso changes (mistakes), recompute that pose's `ik` targets (dev/eval.mjs). */
{
const BAR = (x, y, z = 0.22) => ({ handL: { at: [x, y, -z] }, handR: { at: [x, y, z] } });

window.EXERCISE = {
  id: 'barbell_row',
  name: { tr: 'Barbell Row', en: 'Bent-Over Barbell Row', es: 'Remo con barra' },
  category: { tr: 'Sırt', en: 'Back', es: 'Espalda' },
  equipmentLabel: { tr: 'Barbell', en: 'Barbell', es: 'Barra' },
  muscles: ['lats', 'upperback', 'delts', 'biceps'],
  tempo: '1-0.5-2',
  // rear-oblique side view: at yaw 90 the near plate (r 0.225, on the bar axis) hides hands, arms and torso
  view: { yaw: 90, pitch: 8 },
  alt: { yaw: 38, pitch: 12, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Dirsekler gövdeye yakın, geriye gider', en: 'Elbows stay close and travel back', es: 'Codos pegados, van hacia atrás' } },
  setupView: { yaw: 32, pitch: 12 },
  setupMarks: [
    { type: 'aline', joints: ['handL', 'handR'] },
    { type: 'span', joints: ['ankleR', 'ankleL'], label: { tr: 'Kalça genişliği', en: 'Hip width', es: 'Ancho de cadera' } },
  ],
  props: [['barbell', { grip: 'pronated' }]],
  ctx: { anchorX: ['ankleL', 'ankleR'], plant: ['ankleL', 'ankleR'] },
  poses: {
    // hinge: trunk ~50° from vertical, hips back, soft knees, shins near vertical; arms hang, bar just in front of the knees
    start: { trunk: 52, hip: 82, knee: 33, abd: 9, hrot: 10, neck: -6, protract: 0.025, elbowPole: [-1, -0.2, 0.35], ik: BAR(0.14, 0.572) },
    // bar at the navel, elbows behind the torso, shoulder blades squeezed; torso rises only ~4°
    top: { trunk: 48, hip: 78, knee: 33, abd: 9, hrot: 10, neck: -6, protract: -0.02, elbowPole: [-1, -0.2, 0.35], ik: BAR(0.015, 0.913) },
  },
  rest: 'start',
  rep: [
    { to: 'top', dur: 1.0, phase: 0 },
    { to: 'top', dur: 0.5, phase: 1 },
    { to: 'start', dur: 2.0, phase: 2 },
  ],
  setup: { tr: 'Barı omuzdan biraz geniş, avuçlar sana dönük tut. Kalçayı geriye it, sırt düz, dizler hafif bükülü.',
    en: 'Overhand grip, a bit wider than your shoulders. Push the hips back, flat back, soft knees.',
    es: 'Agarre prono, algo más ancho que los hombros. Cadera atrás, espalda recta, rodillas suaves.' },
  phases: [
    { name: { tr: 'Çek', en: 'Pull', es: 'Tira' }, breath: 'out', line: ['pelvis', 'neck'],
      text: { tr: 'Dirsekleri geriye, kalçana doğru çek. Bar göbeğe gelir, gövde sabit.', en: 'Drive the elbows back toward your hips. Bar to the navel, torso still.', es: 'Lleva los codos atrás hacia la cadera. Barra al ombligo, torso quieto.' } },
    { name: { tr: 'Sık', en: 'Squeeze', es: 'Aprieta' }, breath: 'hold', line: ['pelvis', 'neck'], marks: [{ type: 'mark', joint: 'elbowL' }],
      text: { tr: 'Kürek kemiklerini birbirine sık. Dirsekler gövdenin arkasında.', en: 'Squeeze the shoulder blades together. Elbows behind the torso.', es: 'Junta las escápulas. Codos por detrás del torso.' } },
    { name: { tr: 'Kontrollü indir', en: 'Lower slowly', es: 'Baja despacio' }, breath: 'in', line: ['pelvis', 'neck'],
      text: { tr: 'İki saniyede kollar düzleşene kadar indir. Bel düz kalır.', en: 'Take two seconds until the arms are straight. Lower back stays flat.', es: 'Dos segundos hasta estirar los brazos. La espalda baja sigue recta.' } },
  ],
  tempoText: { tr: '1 sn çek · 0,5 sn sık · 2 sn indir', en: '1 s pull · 0.5 s squeeze · 2 s lower', es: '1 s tira · 0,5 s aprieta · 2 s baja' },
  mistakes: [
    { title: { tr: 'Bel yuvarlanıyor', en: 'Rounded lower back', es: 'Espalda redondeada' },
      fix: { tr: 'Göğsü aç, karnı sık', en: 'Chest proud, brace', es: 'Pecho abierto, abdomen firme' },
      fixText: { tr: 'Kalçadan katlan, sırt baştan kalçaya düz', en: 'Hinge at the hips, back flat from head to hips', es: 'Bisagra de cadera, espalda recta' },
      at: 'start', pose: { trunk: 44, hip: 74, lumbar: 17, thoracic: 18, neck: -10, ik: BAR(0.245, 0.412) },
      line: ['pelvis', 'waist', 'neck'], goodLine: ['pelvis', 'neck'], parts: ['waist', 'chest'] },
    { title: { tr: 'Gövdeyle savurmak', en: 'Jerking with the torso', es: 'Tirar con el torso' },
      fix: { tr: 'Gövde açısını koru', en: 'Keep the torso angle', es: 'Mantén el ángulo del torso' },
      fixText: { tr: 'Sadece kollar ve sırt çalışır, daha hafif ağırlık seç', en: 'Only arms and back move; go lighter', es: 'Solo se mueven brazos y espalda; usa menos peso' },
      at: 'top', pose: { trunk: 22, hip: 40, knee: 22, neck: -4, ik: BAR(0.075, 1.03) },
      line: ['pelvis', 'neck'], parts: ['pelvis', 'waist', 'chest'] },
  ],
  cues: [{ tr: 'Sırt düz, kalça geride', en: 'Flat back, hips back', es: 'Espalda recta, cadera atrás' },
    { tr: 'Dirsekler arka cebe', en: 'Elbows to back pockets', es: 'Codos a los bolsillos traseros' },
    { tr: 'Bar göbeğe, gövde sabit', en: 'Bar to navel, torso still', es: 'Barra al ombligo, torso quieto' }],
};
}
