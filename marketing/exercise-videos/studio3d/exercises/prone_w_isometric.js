/* Prone W isometric hold. Lying face down on the mat: pelvis + toes are the two ground contacts (same names in every pose).
 * Arm angles in the prone thorax frame: shAbd = angle from the "toward the feet" direction in the floor plane,
 * sh > 0 moves the arm toward the floor (while cos(shAbd) > 0), sh < 0 lifts it toward the ceiling.
 * W = upper arms ~45° from the torso, elbows 90°, forearms toward the head (bend [0,1,0] = thorax up = toward the head). */
{
const PRONE = { trunk: 82, hip: -8, knee: 0, ankle: -35, flat: false, abd: 3, neck: 10, el: 90, shAbd: 45,
  bend: [0, 1, 0], palm: 'down', curl: 0.25, ground: [['pelvis', 0.012], ['toeR', 0.012]] };

window.EXERCISE = {
  id: 'prone_w_isometric',
  name: { tr: 'Yüzüstü W İzometrik', en: 'Prone W Isometric Hold', es: 'Mantenimiento isométrico en W (prono)' },
  category: { tr: 'Üst sırt', en: 'Upper back', es: 'Espalda alta' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['upperback', 'delts'],
  tempo: '2-hold-2',
  view: { yaw: 90, pitch: 10 },
  alt: { yaw: 20, pitch: 40, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Kollar W şeklinde, dirsekler kaburgalara doğru', en: 'Arms in a W, elbows drawn toward the ribs', es: 'Brazos en W, codos hacia las costillas' } },
  setupView: { yaw: 35, pitch: 45 },
  props: [['mat', { at: [-0.3, 0.006, 0], length: 2.0, width: 0.7 }]],
  ctx: { anchorX: ['pelvis'], anchorAt: [-0.2, 0] },
  contacts: ['chest', 'pelvis', 'toeL', 'toeR'],
  poses: {
    // lying face down, arms resting on the mat in a W, forehead just above the mat
    rest: { ...PRONE, sh: 22, thoracic: 0, protract: 0 },
    // hands and elbows ~10 cm off the mat, blades squeezed down and back, chest barely lifted
    lift: { ...PRONE, sh: 4, thoracic: -6, neck: 8, protract: -0.03 },
  },
  rest: 'rest',
  rep: [
    { to: 'lift', dur: 2.0, phase: 0 },
    { to: 'lift', dur: 2.0, phase: 1 },
    { to: 'rest', dur: 2.0, phase: 2 },
  ],
  hold: true, holdDur: 6, tempoReps: 1,
  setup: { tr: 'Yüzüstü yat, alnın minderin hemen üstünde. Kolları W yap: dirsekler 90°, kollar gövdeden 45° açık.',
    en: 'Lie face down, forehead just above the mat. Arms in a W: elbows at 90°, upper arms 45° from the body.',
    es: 'Boca abajo, frente justo sobre la esterilla. Brazos en W: codos a 90°, brazos a 45° del cuerpo.' },
  phases: [
    { name: { tr: 'Kaldır', en: 'Lift', es: 'Eleva' }, breath: 'out',
      text: { tr: 'Elleri ve dirsekleri minderden kaldır. Kürekler aşağı ve geriye.', en: 'Lift hands and elbows off the mat. Blades down and back.', es: 'Eleva manos y codos. Escápulas abajo y atrás.' } },
    { name: { tr: 'W’de tut', en: 'Hold the W', es: 'Mantén la W' }, breath: 'easy', hold: 3.2, line: ['handL', 'elbowL', 'shoulderL', 'shoulderR', 'elbowR', 'handR'],
      text: { tr: '10-30 saniye tut, sakin nefes al. Çene içeride, alın aşağıda.', en: 'Hold 10–30 seconds, breathing steadily. Chin tucked, forehead low.', es: 'Mantén 10–30 segundos respirando. Barbilla adentro, frente baja.' } },
    { name: { tr: 'Yavaş bırak', en: 'Lower slowly', es: 'Baja despacio' }, breath: 'in',
      text: { tr: 'Kolları kontrollü indir, 30-60 saniye dinlen.', en: 'Lower the arms with control, rest 30–60 seconds.', es: 'Baja los brazos con control, descansa 30–60 segundos.' } },
  ],
  tempoText: { tr: '2 sn kaldır · 10-30 sn tut · 2 sn indir', en: '2 s lift · 10–30 s hold · 2 s lower', es: '2 s eleva · 10–30 s mantén · 2 s baja' },
  mistakes: [
    { title: { tr: 'Baş kalkıyor, bel çukurlaşıyor', en: 'Head up, back arched', es: 'Cabeza arriba, espalda arqueada' },
      fix: { tr: 'Alın aşağıda, karın sıkı', en: 'Forehead down, abs braced', es: 'Frente abajo, abdomen firme' },
      fixText: { tr: 'Göğüs sadece hafifçe kalkar; kalkış kürek kemiklerinden', en: 'Chest lifts only slightly; the lift comes from the blades', es: 'El pecho sube solo un poco; eleva desde las escápulas' },
      at: 'lift', pose: { thoracic: -11, lumbar: -9, neck: -22 }, view: { yaw: 90, pitch: 8 },
      line: ['pelvis', 'waist', 'neck', 'head'], goodLine: ['pelvis', 'neck'], parts: ['waist', 'neck'] },
    { title: { tr: 'Omuzlar kulağa kalkıyor', en: 'Shoulders hike up', es: 'Hombros hacia las orejas' },
      fix: { tr: 'Kürekleri aşağı çek', en: 'Draw the blades down', es: 'Baja las escápulas' },
      fixText: { tr: 'Boyun uzun, omuzlar kulaktan uzak', en: 'Long neck, shoulders away from the ears', es: 'Cuello largo, hombros lejos de las orejas' },
      at: 'lift', pose: { shrug: 0.06, protract: 0.01 }, view: { yaw: 20, pitch: 40 }, marks: ['shoulderL', 'shoulderR'], parts: ['upper', 'neck'] },
  ],
  cues: [{ tr: 'Dirsekler kaburgalara', en: 'Elbows to the ribs', es: 'Codos a las costillas' },
    { tr: 'Kürekleri sık', en: 'Squeeze the blades', es: 'Junta las escápulas' },
    { tr: 'Tutarken nefes al', en: 'Breathe through the hold', es: 'Respira durante la pausa' }],
};
}
