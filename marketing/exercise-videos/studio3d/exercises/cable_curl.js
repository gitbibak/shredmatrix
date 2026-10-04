/* Cable curl (strength_pull). Facing a low pulley, straight bar attachment, supinated grip. FK arms like barbell_curl.
 * Local prop `_cableCurlStation`: weight-stack tower to the left + low pulley in front of the feet, cable to the bar centre and a
 * short straight bar between the hands (the engine's `cable` prop has no bar attachment). Stack plates rise with the bar.
 * Spec: trunk 0-5, shoulder 0 -> 20, elbow 5 -> 145-150. */
{
const { V } = FB;
const PUL = [0.62, 0.1, 0];
FB.PROPS._cableCurlStation = (sol) => {
  const hL = sol.J.handL, hR = sol.J.handR, c = V.lerp(hL, hR, 0.5), ax = V.norm(V.sub(hR, hL));
  const ext = 0.07, out = [];
  // functional-trainer style: tower off to the left (never hides the body in side or front view), low arm to the pulley
  out.push({ t: 'box', c: [PUL[0] + 0.1, 1.05, -0.78], s: [0.3, 2.1, 0.24], m: 'frameDark', round: 0.01 });
  out.push({ t: 'box', c: [PUL[0], 0.06, -0.39], s: [0.08, 0.08, 0.78], m: 'frame' });
  out.push({ t: 'sph', c: PUL, r: 0.04, m: 'iron' });
  out.push({ t: 'tube', pts: [PUL, c], r: 0.004, m: 'chrome' });
  out.push({ t: 'cyl', a: V.add(hL, V.mul(ax, -ext)), b: V.add(hR, V.mul(ax, ext)), r: 0.014, m: 'chrome' });
  // stack: plates lifted by the cable travel (bar height above its lowest point)
  const lift = Math.max(0, Math.min(0.5, (c[1] - 0.86) * 0.6));
  out.push({ t: 'box', c: [PUL[0] + 0.1, 0.36 + lift, -0.64], s: [0.22, 0.4, 0.04], m: 'plate' });
  sol.grip = { L: [0, 0, 1], R: [0, 0, 1] }; sol.gripKind = 'supinated';
  return out;
};

window.EXERCISE = {
  id: 'cable_curl',
  name: { tr: 'Kablo Curl', en: 'Cable Curl', es: 'Curl en polea' },
  category: { tr: 'Kol', en: 'Arms', es: 'Brazos' },
  equipmentLabel: { tr: 'Kablo · Düz bar', en: 'Cable · Straight bar', es: 'Polea · Barra recta' },
  muscles: ['biceps', 'forearms'],
  tempo: '1-0.5-2',
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 22, pitch: 6, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Dirsekler gövdenin yanında, açılmaz', en: 'Elbows stay at your sides', es: 'Codos junto al cuerpo' } },
  setupView: { yaw: 40, pitch: 10 },
  setupMarks: [{ type: 'span', joints: ['ankleR', 'ankleL'], label: { tr: 'Kalça genişliği', en: 'Hip width', es: 'Ancho de cadera' } }],
  props: [['_cableCurlStation']],
  ctx: { anchorX: ['ankleL', 'ankleR'], plant: ['ankleL', 'ankleR'] },
  poses: {
    start: { trunk: 3, hip: 3, knee: 6, abd: 4, sh: 5, shAbd: 5, el: 8, neck: -1 },
    top: { trunk: 3, hip: 3, knee: 6, abd: 4, sh: 18, shAbd: 5, el: 146, neck: -1 },
  },
  rest: 'start',
  rep: [
    { to: 'top', dur: 1.0, phase: 0 },
    { to: 'top', dur: 0.5, phase: 1 },
    { to: 'start', dur: 2.0, phase: 2 },
  ],
  setup: { tr: 'Alçak makaraya dön, yarım adım geri dur. Barı omuz genişliğinde, avuçlar yukarı tut.',
    en: 'Face the low pulley, half a step back. Shoulder-width grip, palms up.',
    es: 'Frente a la polea baja, medio paso atrás. Agarre al ancho de hombros, palmas arriba.' },
  phases: [
    { name: { tr: 'Kaldır', en: 'Curl', es: 'Sube' }, breath: 'out', line: ['shoulderR', 'elbowR'],
      text: { tr: 'Barı göğse doğru kaldır. Üst kol kaburgaların yanında kalır.', en: 'Curl the bar toward your chest. Upper arms stay by the ribs.', es: 'Sube la barra al pecho. Brazos junto a las costillas.' } },
    { name: { tr: 'Tepede sık', en: 'Squeeze', es: 'Aprieta' }, breath: 'hold', marks: [{ type: 'mark', joint: 'elbowR' }],
      text: { tr: 'Biceps’i sık, kablo gergin kalır.', en: 'Squeeze the biceps, the cable stays tight.', es: 'Aprieta el bíceps, el cable sigue tenso.' } },
    { name: { tr: 'Kontrollü indir', en: 'Lower slowly', es: 'Baja despacio' }, breath: 'in', line: ['shoulderR', 'elbowR'],
      text: { tr: 'İki saniyede indir. Ağırlık yığına oturmadan dur.', en: 'Two seconds down. Stop before the stack touches.', es: 'Dos segundos. Para antes de que la pila toque.' } },
  ],
  tempoText: { tr: '1 sn kaldır · 0,5 sn sık · 2 sn indir', en: '1 s up · 0.5 s squeeze · 2 s down', es: '1 s sube · 0,5 s aprieta · 2 s baja' },
  mistakes: [
    { title: { tr: 'Geriye yaslanmak', en: 'Leaning back to swing', es: 'Echarse atrás' },
      fix: { tr: 'Dik dur, hafiflet', en: 'Stand tall, go lighter', es: 'Recto, menos peso' },
      fixText: { tr: 'Omuzlar kalçanın üstünde kalır', en: 'Shoulders stay over the hips', es: 'Hombros sobre la cadera' },
      at: 'top', pose: { trunk: -12, hip: -10, knee: 10, lumbar: -5 }, line: ['pelvis', 'neck'], goodLine: ['pelvis', 'neck'], parts: ['waist', 'chest'] },
    { title: { tr: 'Dirsekler öne kaçıyor', en: 'Elbows moving forward', es: 'Codos hacia delante' },
      fix: { tr: 'Üst kolu sabitle', en: 'Pin the upper arms', es: 'Fija los brazos' },
      fixText: { tr: 'Dirsekler kaburgaların yanında kalır', en: 'Elbows stay beside the ribs', es: 'Codos junto a las costillas' },
      at: 'top', pose: { sh: 55, el: 128 }, marks: ['elbowR'], line: ['shoulderR', 'elbowR'], parts: ['upperR', 'upperL'] },
  ],
  cues: [{ tr: 'Dirsekler kaburgada', en: 'Elbows by your ribs', es: 'Codos en las costillas' },
    { tr: 'Kablo hep gergin', en: 'Keep the cable tight', es: 'Cable siempre tenso' },
    { tr: 'Dönüşü kontrol et', en: 'Control the return', es: 'Controla la vuelta' }],
};
}
