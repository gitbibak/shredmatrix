/* Double Straight Leg Stretch / Lower Lift (Pilates mat, supine curl-up). the_hundred base: pelvis + waist contacts,
 * thoracic 30 + neck 40 unchanged, so only the hip moves: legs together and straight from 90° down to ~45° and back.
 * Hands cradle the back of the skull with elbows wide (HEAD() from chest_lift: hand targets in the thorax frame from
 * the neck angle). */
{
const MAT = 0.008;
const G = (w = -0.016) => [['pelvis', MAT], ['waist', MAT + w]];
const HEAD = (n, out = 0.07, back = 0.115, el = [0.05, 0.25, 1]) => {
  const B = FB.BODY, r = n * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
  const hx = (B.headFwd ?? 0.05) * c + (B.headUp ?? 0.19) * s, hy = -(B.headFwd ?? 0.05) * s + (B.headUp ?? 0.19) * c;
  const p = [hx - back * c, B.thorax * 0.5 + hy + back * s];
  return { holdL: [p[0], p[1], out], holdR: [p[0], p[1], out], elbowPole: el, handFlat: false, palm: [c, -s, -0.7], curl: 0.45 };
};
const BASE = { trunk: -90, abd: 0, hrot: 4, lumbar: 6, thoracic: 30, neck: 40, knee: 0, ankle: -30, flat: false, ground: G(), _n: 40 };
const RAW = { up: { ...BASE, hip: 78 }, low: { ...BASE, hip: 33 } };
const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };
function fit(poses, extra) {
  for (const k in poses) Object.assign(poses[k], HEAD(poses[k]._n));
  for (const [, pose] of extra) if (pose._n !== undefined) Object.assign(pose, HEAD(pose._n));
  return poses;
}

window.EXERCISE = {
  id: 'double_straight_leg_stretch',
  name: { tr: 'Çift Düz Bacak İndirme (Double Straight Leg Stretch)', en: 'Double Straight Leg Stretch (Lower Lift)', es: 'Estiramiento de ambas piernas rectas (double straight leg stretch)' },
  category: { tr: 'Pilates · Karın', en: 'Pilates · Core', es: 'Pilates · Core' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['core', 'obliques'],
  tempo: '2-2',
  view: { yaw: 90, pitch: 6, zoom: 1.02 },
  alt: { yaw: 22, pitch: 22, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Bacaklar bitişik, dirsekler geniş', en: 'Legs together, elbows wide', es: 'Piernas juntas, codos abiertos' } },
  setupView: { yaw: 45, pitch: 20 },
  contacts: ['pelvis', 'waist'],
  props: [['mat', { at: [0.05, 0.006, 0], length: 2.0 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fit(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'up',
  rep: [
    { to: 'low', dur: 2.0, phase: 0 },
    { to: 'up', dur: 2.0, phase: 1 },
  ],
  setup: { tr: 'Eller başın arkasında, dirsekler geniş. Baş ve kürek kemiklerini kaldır, bacaklar düz ve dik.',
    en: 'Hands behind the head, elbows wide. Curl head and shoulder blades up, legs straight up to the ceiling.',
    es: 'Manos tras la cabeza, codos abiertos. Eleva cabeza y escápulas, piernas rectas hacia el techo.' },
  phases: [
    { name: { tr: 'Nefes al, bacakları indir', en: 'Inhale, lower the legs', es: 'Inhala, baja las piernas' }, breath: 'in',
      text: { tr: 'Bitişik bacakları 45°ye indir; bel minderden kalkmadan.', en: 'Lower the legs together to 45°, without the back lifting.', es: 'Baja las piernas juntas a 45°, sin despegar la lumbar.' } },
    { name: { tr: 'Nefes ver, kaldır', en: 'Exhale, lift', es: 'Exhala, sube' }, breath: 'out', line: ['pelvis', 'waist'],
      text: { tr: 'Karın içe, bacakları 90°ye geri getir. Gövde kıpırdamaz.', en: 'Belly in, bring the legs back to 90°. The trunk stays still.', es: 'Abdomen adentro, sube las piernas a 90°. El tronco no se mueve.' } },
  ],
  tempoText: { tr: '2 sn indir · 2 sn kaldır', en: '2 s lower · 2 s lift', es: '2 s baja · 2 s sube' },
  mistakes: [
    { title: { tr: 'Bel minderden kalkıyor', en: 'Lower back peels off', es: 'La lumbar se despega' },
      fix: { tr: 'Daha yukarıda dur', en: 'Stop higher', es: 'Para más arriba' },
      fixText: { tr: 'Bel yapışık kaldığı kadar indir; gerekirse 60°', en: 'Lower only while the back stays down; 60° if needed', es: 'Baja solo mientras la lumbar siga abajo; 60° si hace falta' },
      at: 'low', pose: { lumbar: -10, thoracic: 22, ground: G(0.03), hip: 40, _n: 40 }, marks: ['waist'], parts: ['waist', 'pelvis'] },
    { title: { tr: 'Baş düşüyor', en: 'Head drops', es: 'La cabeza cae' },
      fix: { tr: 'Kıvrımı koru', en: 'Keep the curl', es: 'Mantén la flexión' },
      fixText: { tr: 'Baş ellerde ağır; set arasında dinlen', en: 'Head heavy in the hands; rest between sets', es: 'Cabeza pesada en las manos; descansa entre series' },
      at: 'low', pose: { thoracic: 8, neck: 16, _n: 16 }, marks: ['head'], parts: ['neck', 'chest'] },
  ],
  cues: [{ tr: 'Bacaklar tek bir mızrak gibi', en: 'Legs together like one spear', es: 'Piernas juntas como una lanza' },
    { tr: 'Bel yapışık kalana kadar in', en: 'Lower only while the back stays glued', es: 'Baja mientras la lumbar siga pegada' },
    { tr: 'Kıvrım yukarıda', en: 'Keep the curl up', es: 'Mantén la flexión arriba' }],
};
}
