/* Lat pulldown (latPulldown machine). Seated, thighs under the pad (thigh kept horizontal: hip = 90 + trunk),
 * feet planted. The bar is driven by world IK targets (BAR) so it travels on a straight, near-vertical line in front
 * of the face: overhead at arm's length -> collarbone. Main view is the spec's front view.
 * Spec note: elbow 100° at the bottom cannot coexist with the bar at the collarbone and vertical forearms (that needs ~0.36 m
 * shoulder-to-hand distance); the bar-to-collarbone path wins, so the bottom elbow measures ~130°. The machine sits 0.1 m back
 * so the head clears the stack column in the lean-back mistake. */
{
const BAR = (x, y, z = 0.33) => ({ handL: { at: [x, y, -z] }, handR: { at: [x, y, z] } });
const SEAT = { ground: [['pelvis', 0.43]], knee: 90, abd: 6, elbowPole: [-0.25, -1, 0.55] };

window.EXERCISE = {
  id: 'lat_pulldown',
  name: { tr: 'Lat Pulldown', en: 'Lat Pulldown', es: 'Jalón al pecho' },
  category: { tr: 'Sırt', en: 'Back', es: 'Espalda' },
  equipmentLabel: { tr: 'Lat pulldown makinesi', en: 'Lat pulldown machine', es: 'Máquina de jalón' },
  muscles: ['lats', 'upperback', 'biceps'],
  tempo: '1-0.5-2',
  view: { yaw: 10, pitch: 6 },
  alt: { yaw: 82, pitch: 6, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
    text: { tr: 'Bar yüzün önünden dik iner, köprücük kemiğine', en: 'The bar drops straight past the face to the collarbone', es: 'La barra baja recta por delante de la cara a la clavícula' } },
  setupView: { yaw: 40, pitch: 10 },
  setupMarks: [{ type: 'aline', joints: ['handL', 'shoulderL', 'shoulderR', 'handR'] }],
  props: [['latPulldown', { at: [-0.1, 0, 0], seatH: 0.43 }]],
  ctx: { anchorX: ['pelvis'], anchorAt: [0, 0], plant: ['ankleL', 'ankleR'] },
  contacts: ['pelvis', 'ballL', 'ballR'],
  poses: {
    // slight lean back, arms long overhead, shoulders allowed to rise into the lat stretch
    top: { ...SEAT, trunk: -10, hip: 80, neck: -4, shrug: 0.02, ik: BAR(0.03, 1.537) },
    // shoulders down, elbows driven down beside the ribs, bar at the collarbone, chest up
    bottom: { ...SEAT, trunk: -13, hip: 77, neck: -6, thoracic: -4, shrug: -0.01, protract: -0.015, ik: BAR(0.05, 1.03) },
  },
  rest: 'top',
  rep: [
    { to: 'bottom', dur: 1.3, phase: 0 },
    { to: 'bottom', dur: 0.5, phase: 1 },
    { to: 'top', dur: 2.0, phase: 2 },
  ],
  setup: { tr: 'Dizleri pedin altına sabitle. Barı omzunun 1,5 katı genişlikte, avuçlar öne bakarak tut.',
    en: 'Lock your thighs under the pad. Overhand grip about 1.5× shoulder width.',
    es: 'Fija los muslos bajo el rodillo. Agarre prono, 1,5 veces el ancho de hombros.' },
  phases: [
    { name: { tr: 'Çek', en: 'Pull', es: 'Tira' }, breath: 'out',
      text: { tr: 'Önce omuzları indir, sonra dirsekleri aşağı çek. Bar köprücük kemiğine gelir.', en: 'Shoulders down first, then drive the elbows down. Bar to the collarbone.', es: 'Primero baja los hombros, luego los codos. Barra a la clavícula.' } },
    { name: { tr: 'Sık', en: 'Squeeze', es: 'Aprieta' }, breath: 'hold', marks: [{ type: 'mark', joint: 'elbowR' }],
      text: { tr: 'Göğüs yukarıda, dirsekler kaburgaların yanında. Kanatları sık.', en: 'Chest up, elbows beside the ribs. Squeeze the lats.', es: 'Pecho arriba, codos junto a las costillas. Aprieta los dorsales.' } },
    { name: { tr: 'Kontrollü bırak', en: 'Let it rise', es: 'Sube controlando' }, breath: 'in',
      text: { tr: 'İki saniyede kollar düzleşene kadar bırak. Ağırlık yığına çarpmasın.', en: 'Take two seconds until the arms are straight. Don’t let the stack slam.', es: 'Dos segundos hasta estirar los brazos. Que las placas no golpeen.' } },
  ],
  tempoText: { tr: '1 sn çek · 0,5 sn sık · 2 sn bırak', en: '1 s pull · 0.5 s squeeze · 2 s up', es: '1 s tira · 0,5 s aprieta · 2 s sube' },
  mistakes: [
    { title: { tr: 'Fazla geriye yatmak', en: 'Leaning way back', es: 'Inclinarse demasiado atrás' },
      fix: { tr: 'Hafif geriye yaslan', en: 'Lean back only a little', es: 'Inclínate solo un poco' },
      fixText: { tr: 'Gövde 10-15° geride, bar göğsün üstüne', en: 'Torso 10–15° back, bar to the upper chest', es: 'Torso 10–15° atrás, barra a la parte alta del pecho' },
      at: 'bottom', pose: { trunk: -30, hip: 60, thoracic: 0, neck: -2, ik: BAR(0.12, 0.84) }, view: { yaw: 80, pitch: 6 },
      line: ['pelvis', 'neck'], parts: ['waist', 'chest'] },
    { title: { tr: 'Barı enseye çekmek', en: 'Pulling behind the neck', es: 'Tirar detrás de la nuca' },
      fix: { tr: 'Barı önden çek', en: 'Pull to the front', es: 'Tira por delante' },
      fixText: { tr: 'Bar yüzün önünden köprücük kemiğine iner', en: 'Bar passes in front of the face to the collarbone', es: 'La barra pasa por delante de la cara a la clavícula' },
      at: 'bottom', pose: { trunk: 2, hip: 88, thoracic: 6, neck: 26, ik: BAR(-0.2, 1.24) }, view: { yaw: 62, pitch: 8 },
      marks: ['head'], parts: ['neck', 'upper'] },
  ],
  cues: [{ tr: 'Önce omuzlar aşağı', en: 'Shoulders down first', es: 'Primero hombros abajo' },
    { tr: 'Bar köprücük kemiğine', en: 'Bar to the collarbone', es: 'Barra a la clavícula' },
    { tr: 'Tepede tam esne', en: 'Full stretch at the top', es: 'Estira completo arriba' }],
};
}
