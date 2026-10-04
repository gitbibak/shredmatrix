/* Incline push-up. Hands on the edge of a bench set crosswise (custom prop FB.PROPS._crossBench, the stock bench
 * runs along x and is too narrow for the hands), feet on the toes. Two-point ground contacts like push_up.js:
 * Spec says a 60 cm surface with trunk 58° and arms ~90° to the trunk: impossible together for this body (a 60 cm
 * surface gives ~45°). A standard 45 cm bench is used: top trunk ~51°, bottom ~66° (spec 58/62); hands slightly ahead of the
 * shoulders at the top so the forearms are near vertical at the bottom (elbow ~103°).
 * top = hands on the pad + toes, bottom = shoulder height + toes, hands planted. */
{
const H = 0.45, BX = 0.56;     // pad height, pad centre x (front edge under the hands)
FB.PROPS._crossBench = () => {
  const c = [BX, 0, 0], W = 1.1, D = 0.32;
  const out = [{ t: 'box', c: [c[0], H - 0.045, 0], s: [D, 0.09, W], m: 'pad', round: 0.02 }];
  for (const z of [-W / 2 + 0.12, W / 2 - 0.12]) {
    out.push({ t: 'box', c: [c[0], (H - 0.09) / 2, z], s: [0.06, H - 0.09, 0.06], m: 'frame' });
    out.push({ t: 'box', c: [c[0], 0.02, z], s: [D + 0.12, 0.04, 0.08], m: 'frame' });
  }
  return out;
};
window.EXERCISE = {
  id: 'incline_push_up',
  name: { tr: 'Eğimli Şınav', en: 'Incline Push-Up', es: 'Flexión inclinada' },
  category: { tr: 'Göğüs · Kol', en: 'Chest · Arms', es: 'Pecho · Brazos' },
  equipmentLabel: { tr: 'Bench veya kutu', en: 'Bench or box', es: 'Banco o cajón' },
  muscles: ['chest', 'triceps', 'delts', 'core'],
  tempo: '2-0-1',
  view: { yaw: 90, pitch: 7 },
  alt: { yaw: 35, pitch: 16, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' }, text: { tr: 'Dirsekler gövdeye ~45° açıyla', en: 'Elbows ~45° from the torso', es: 'Codos a ~45° del torso' } },
  props: [['_crossBench']],
  ctx: { anchorX: ['toeL', 'toeR'], anchorAt: [-0.75, 0], plant: ['handL', 'handR'] },
  poses: {
    top: { trunk: 52, sh: 62, flat: false, shAbd: 16, el: 0, ankle: -30, abd: 4, neck: -6, ground: [['wristR', H + 0.05], ['toeR', 0]], handSurface: H, handFlat: true, elbowPole: [-0.3, -1, 0.75] },
    bottom: { trunk: 64, sh: 20, flat: false, shAbd: 28, el: 100, ankle: -24, abd: 4, neck: -4, ground: [['shoulderR', 0.63], ['toeR', 0]], handSurface: H, handFlat: true, elbowPole: [-0.3, -1, 0.75] },
  },
  rest: 'top',
  rep: [
    { to: 'bottom', dur: 2.0, phase: 0 },
    { to: 'top', dur: 1.0, phase: 1 },
  ],
  setup: { tr: 'Eller benchin kenarında, omuzdan biraz geniş. Ayak uçlarında, baştan topuğa düz çizgi.',
    en: 'Hands on the bench edge, a bit wider than the shoulders. On your toes, straight from head to heels.',
    es: 'Manos en el borde del banco, algo más abiertas que los hombros. De puntillas, cuerpo recto.' },
  setupMarks: [{ type: 'aline', joints: ['ankleR', 'pelvis', 'shoulderR'], color: '#22d38a' }],
  phases: [
    { name: { tr: 'İniş', en: 'Lower', es: 'Baja' }, breath: 'in', arc: ['shoulderR', 'elbowR', 'wristR'], line: ['ankleR', 'pelvis', 'shoulderR'],
      text: { tr: 'Dirsekleri ~45° açıyla bük, göğsü benchin kenarına indir.', en: 'Bend the elbows at ~45° and bring the chest to the bench edge.', es: 'Flexiona los codos a ~45° y lleva el pecho al borde del banco.' } },
    { name: { tr: 'İtiş', en: 'Push', es: 'Empuja' }, breath: 'out', line: ['ankleR', 'pelvis', 'shoulderR'],
      text: { tr: 'Benchi kendinden uzağa it, kollar düzleşsin. Vücut tek parça.', en: 'Push the bench away until the arms are straight. Body moves as one.', es: 'Empuja el banco hasta estirar los brazos. El cuerpo va en bloque.' } },
  ],
  tempoText: { tr: '2 sn in · 1 sn çık', en: '2 s down · 1 s up', es: '2 s abajo · 1 s arriba' },
  mistakes: [
    { title: { tr: 'Kalça çöküyor', en: 'Hips sag', es: 'La cadera se hunde' },
      fix: { tr: 'Karnı ve kalçayı sık', en: 'Brace abs and glutes', es: 'Aprieta abdomen y glúteos' },
      fixText: { tr: 'Omuz, kalça ve ayak bileği aynı çizgide', en: 'Shoulder, hip and ankle in one line', es: 'Hombro, cadera y tobillo alineados' },
      at: 'bottom', pose: { hip: -20, lumbar: -12, ground: [['shoulderR', 0.63], ['toeR', 0]] }, line: ['ankleR', 'pelvis', 'shoulderR'], parts: ['pelvis', 'waist'] },
    { title: { tr: 'Baş öne uzanıyor', en: 'Head pokes forward', es: 'La cabeza se adelanta' },
      fix: { tr: 'Boynu nötr tut', en: 'Keep the neck neutral', es: 'Cuello neutro' },
      fixText: { tr: 'Önce göğüs gelir, çene değil', en: 'The chest leads, not the chin', es: 'Llega el pecho, no la barbilla' },
      at: 'bottom', pose: { neck: -38 }, marks: ['head'], parts: ['neck', 'face', 'hair'] },
  ],
  cues: [{ tr: 'Vücut tek çizgi', en: 'Body in one line', es: 'Cuerpo en línea' }, { tr: 'Dirsekler ~45°', en: 'Elbows ~45°', es: 'Codos a ~45°' }, { tr: 'Göğüs bench kenarına', en: 'Chest to the bench edge', es: 'Pecho al borde del banco' }],
};
}
