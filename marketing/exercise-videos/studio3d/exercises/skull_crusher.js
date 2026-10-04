/* Skull crusher (lying triceps extension) with dumbbells, neutral grip, on a flat bench. Body set-up copied from
 * dumbbell_bench_press.js. Pure FK arms: the upper arm stays fixed (sh 93 = ~10° behind vertical), only the elbow bends;
 * `bend` [0, 1, 0] folds the forearm toward the head so the bells come down beside the forehead. */
{
const BODY = { trunk: -90, hip: -10, knee: 92, neck: 14, abd: 12, ground: [['shoulderR', 0.45], ['pelvis', 0.45]], sh: 93, shAbd: 6, shRot: 0, bend: [0, 1, 0] };
window.EXERCISE = {
  id: 'skull_crusher',
  name: { tr: 'Skull Crusher', en: 'Skull Crusher', es: 'Rompecráneos' },
  category: { tr: 'Kol', en: 'Arms', es: 'Brazos' },
  equipmentLabel: { tr: 'Dambıl · Düz bench', en: 'Dumbbells · Flat bench', es: 'Mancuernas · Banco plano' },
  muscles: ['triceps'],
  tempo: '2-0-1.5',
  view: { yaw: 90, pitch: 9 },
  alt: { yaw: 22, pitch: 34, zoom: 1.08, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' }, text: { tr: 'Dirsekler dar, tavana bakar', en: 'Elbows narrow, pointing up', es: 'Codos cerrados, hacia el techo' } },
  props: [['bench', { at: [-0.4, 0, 0], length: 1.2, height: 0.45 }], ['bench', { at: [-0.4, 0, 0], length: 1.2, height: 0.39 }], ['dumbbell', { grip: 'neutral', len: 0.26 }]],
  ctx: { anchorX: ['pelvis'], anchorAt: [0, 0], plant: ['ankleL', 'ankleR'] },
  poses: {
    top: Object.assign({}, BODY, { el: 3 }),
    bottom: Object.assign({}, BODY, { el: 115 }),
  },
  rest: 'top',
  rep: [
    { to: 'bottom', dur: 2.0, phase: 0 },
    { to: 'top', dur: 1.5, phase: 1 },
  ],
  setup: { tr: 'Benchte sırtüstü, ayaklar yerde. Dambıllar alnın üstünde, kollar dikten biraz geride.',
    en: 'Lie on the bench, feet flat. Bells over the forehead, arms tilted slightly back.',
    es: 'Túmbate en el banco, pies en el suelo. Mancuernas sobre la frente, brazos algo atrás.' },
  phases: [
    { name: { tr: 'İndir', en: 'Lower', es: 'Baja' }, breath: 'in', arc: ['shoulderR', 'elbowR', 'wristR'], line: ['shoulderR', 'elbowR'],
      text: { tr: 'Sadece dirsekleri bük, dambılları alnın yanına indir. Üst kol sabit.', en: 'Bend only the elbows and lower the bells beside the forehead. Upper arms still.', es: 'Flexiona solo los codos y baja junto a la frente. Brazos quietos.' } },
    { name: { tr: 'Uzat', en: 'Extend', es: 'Extiende' }, breath: 'out', line: ['shoulderR', 'elbowR'],
      text: { tr: 'Dirsekleri düzelt, dambıllar başlangıca döner.', en: 'Straighten the elbows; the bells return to the start.', es: 'Estira los codos; las mancuernas vuelven al inicio.' } },
  ],
  tempoText: { tr: '2 sn indir · 1,5 sn uzat', en: '2 s down · 1.5 s up', es: '2 s abajo · 1,5 s arriba' },
  mistakes: [
    { title: { tr: 'Dirsekler yana açılıyor', en: 'Elbows flare out', es: 'Codos abiertos' },
      fix: { tr: 'Dirsekleri dar tut', en: 'Keep the elbows narrow', es: 'Codos cerrados' },
      fixText: { tr: 'Dirsekler omuz genişliğinde, tavana bakar', en: 'Elbows shoulder-width, pointing up', es: 'Codos al ancho de hombros, hacia arriba' },
      at: 'bottom', pose: { shAbd: 30, shRot: 35 }, view: { yaw: 22, pitch: 34, zoom: 1.08 }, marks: ['elbowL', 'elbowR'], parts: ['upperR', 'upperL'] },
    { title: { tr: 'Üst kol sallanıyor', en: 'Upper arms swing', es: 'Los brazos se balancean' },
      fix: { tr: 'Üst kolu sabitle', en: 'Lock the upper arms', es: 'Fija los brazos' },
      fixText: { tr: 'Hareket sadece dirsekten', en: 'Move only at the elbow', es: 'Mueve solo el codo' },
      at: 'bottom', pose: { sh: 62 }, line: ['shoulderR', 'elbowR'], parts: ['upperR', 'foreR'] },
  ],
  cues: [{ tr: 'Dirsekler dar', en: 'Elbows narrow', es: 'Codos cerrados' }, { tr: 'Üst kol sabit', en: 'Upper arms fixed', es: 'Brazos fijos' }, { tr: 'Ayaklar yerde, karın sıkı', en: 'Feet planted, abs tight', es: 'Pies firmes, abdomen firme' }],
};
}
