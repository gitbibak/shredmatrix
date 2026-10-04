/* Plank to push-up (up-down plank). Hands are driven by world IK targets per pose (forearm plank: palms forward of the
 * elbows; high plank: palms where the elbows were). Two-point ground contacts (elbow/shoulder + toe) set the body height.
 * The rep is shown with the right arm leading both ways; the cards tell the viewer to switch the lead arm each rep. */
{
const E = 0.21, ZH = 0.17;  // elbow / high-plank palm x, hand half-width
const LOW = (z) => [E + 0.3, 0, z];
const UP = (z) => [E - 0.05, 0, z];
const HANDS = (l, r) => ({ ik: { handL: { at: l(-ZH) }, handR: { at: r(ZH) } } });
const B = { handFlat: true, handSurfaceL: 0, handSurfaceR: 0, abd: 6, ankle: -36, neck: -8, trunk: 80, elbowPole: [-0.2, -1, 0.3] };
window.EXERCISE = {
  id: 'plank_to_push_up',
  name: { tr: "Plank'ten Şınava", en: 'Plank to Push-Up', es: 'Plancha a flexión' },
  category: { tr: 'Karın · Göğüs', en: 'Core · Chest', es: 'Core · Pecho' },
  equipmentLabel: { tr: 'Vücut ağırlığı · Mat', en: 'Bodyweight · Mat', es: 'Peso corporal · Esterilla' },
  muscles: ['core', 'obliques', 'triceps', 'delts', 'chest'],
  tempo: '1.5-0-1.5',
  view: { yaw: 90, pitch: 7 },
  alt: { yaw: 20, pitch: 14, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' }, text: { tr: 'Kalça sağa sola sallanmaz', en: 'Hips stay level, no rocking', es: 'Cadera nivelada, sin balanceo' } },
  props: [['mat', { at: [-0.3, 0.006, 0], length: 1.9 }]],
  ctx: { anchorX: ['toeL', 'toeR'], anchorAt: [-1.25, 0] },
  get poses() {
    const base = {
      low: { ...B, sh: 90, el: 90, ground: [['shoulderR', 0.235], ['toeR', 0]], ...HANDS(LOW, LOW) },
      midUp: { ...B, sh: 80, el: 45, twist: -28, ground: [['shoulderR', 0.394], ['toeR', 0]], ...HANDS(LOW, UP) },
      high: { ...B, sh: 70, el: 0, ground: [['shoulderR', 0.465], ['toeR', 0]], ...HANDS(UP, UP) },
      midDown: { ...B, sh: 80, el: 45, twist: 28, ground: [['shoulderR', 0.24], ['toeR', 0]], ...HANDS(UP, LOW) },
    };
    // hand moves: liftA = moving palm raised ~11 cm at its start spot (card:false), liftB = palm held over the new spot (the card's slow
    // move, constant height), then it is set down (card:false). The other palm stays planted the whole time.
    const lift = (n, from, to, h) => {
      const raised = (pose, ref) => ({ ...pose, handSurface: undefined, ['handSurface' + h.slice(-1)]: 0.07, ik: { ...pose.ik, [h]: { at: [ref.ik[h].at[0], 0.11, ref.ik[h].at[2]] } } });
      return { ['liftA' + n]: raised(base[from], base[from]), ['liftB' + n]: raised(base[to], base[to]) };
    };
    return { ...base, ...lift('R1', 'low', 'midUp', 'handR'), ...lift('L1', 'midUp', 'high', 'handL'), ...lift('R2', 'high', 'midDown', 'handR'), ...lift('L2', 'midDown', 'low', 'handL') };
  },
  rest: 'low',
  rep: [
    { to: 'liftAR1', dur: 0.15, phase: 0, card: false },
    { to: 'liftBR1', dur: 0.5, phase: 0 },
    { to: 'midUp', dur: 0.4, phase: 0, card: false },
    { to: 'liftAL1', dur: 0.15, phase: 0, card: false },
    { to: 'liftBL1', dur: 0.5, phase: 0 },
    { to: 'high', dur: 0.4, phase: 0, card: false },
    { to: 'liftAR2', dur: 0.15, phase: 1, card: false },
    { to: 'liftBR2', dur: 0.5, phase: 1 },
    { to: 'midDown', dur: 0.4, phase: 1, card: false },
    { to: 'liftAL2', dur: 0.15, phase: 1, card: false },
    { to: 'liftBL2', dur: 0.5, phase: 1 },
    { to: 'low', dur: 0.4, phase: 1, card: false },
  ],
  setup: { tr: 'Önkol plankı: dirsekler omuzların altında, ayaklar kalçadan biraz geniş. Vücut düz.',
    en: 'Forearm plank: elbows under the shoulders, feet a bit wider than the hips. Body straight.',
    es: 'Plancha de antebrazos: codos bajo los hombros, pies algo más abiertos que la cadera.' },
  setupMarks: [{ type: 'aline', joints: ['ankleR', 'pelvis', 'shoulderR'], color: '#22d38a' }],
  phases: [
    { name: { tr: 'Yukarı', en: 'Press up', es: 'Sube' }, breath: 'out', line: ['ankleR', 'pelvis', 'shoulderR'],
      text: { tr: 'Sağ eli dirseğin yerine koy, kolu düzelt; sonra sol. Kalça sabit.', en: 'Right palm where the elbow was, straighten; then the left. Hips stay still.', es: 'Palma derecha donde estaba el codo, estira; luego la izquierda. Cadera quieta.' } },
    { name: { tr: 'Aşağı', en: 'Lower', es: 'Baja' }, breath: 'in', line: ['ankleR', 'pelvis', 'shoulderR'],
      text: { tr: 'Önce sağ, sonra sol önkolu yere indir. Her tekrarda öncü kolu değiştir.', en: 'Lower the right forearm, then the left. Switch the lead arm each rep.', es: 'Baja el antebrazo derecho y luego el izquierdo. Cambia de brazo cada vez.' } },
  ],
  tempoText: { tr: '1,5 sn çık · 1,5 sn in', en: '1.5 s up · 1.5 s down', es: '1,5 s arriba · 1,5 s abajo' },
  mistakes: [
    { title: { tr: 'Kalça sallanıyor', en: 'Hips rock side to side', es: 'La cadera se balancea' },
      fix: { tr: 'Ayakları aç, yavaşla', en: 'Widen the feet, slow down', es: 'Abre los pies, ve más lento' },
      fixText: { tr: 'Kalça kollar değişirken bile düz kalır', en: 'Hips stay level while the arms switch', es: 'La cadera no se mueve al cambiar de brazo' },
      at: 'low', pose: { side: 14 }, view: { yaw: 20, pitch: 14 }, marks: ['pelvis'], parts: ['pelvis', 'waist'] },
    { title: { tr: 'Kalça yukarı kalkıyor', en: 'Hips pike up', es: 'La cadera sube' },
      fix: { tr: 'Karnı sık', en: 'Brace the abs', es: 'Aprieta el abdomen' },
      fixText: { tr: 'Omuz, kalça ve ayak bileği aynı çizgide', en: 'Shoulder, hip and ankle in one line', es: 'Hombro, cadera y tobillo alineados' },
      at: 'low', pose: { hip: 34, flat: false }, line: ['ankleR', 'pelvis', 'shoulderR'], parts: ['pelvis', 'waist'] },
  ],
  cues: [{ tr: 'Kalçayı sık', en: 'Squeeze the glutes', es: 'Aprieta glúteos' }, { tr: 'Kalça hep aynı seviyede', en: 'Hips stay level', es: 'Cadera nivelada' }, { tr: 'Öncü kolu değiştir', en: 'Switch the lead arm', es: 'Cambia el brazo guía' }],
};
}
