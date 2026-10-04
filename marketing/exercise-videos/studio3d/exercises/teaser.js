/* Teaser (Pilates mat). One ground contact [pelvis] in every pose (no contact-set blending); `trunk` is the real lean
 * (lying = -90, V-sit chord ~30° behind vertical) and the legs hold ~45° from the mat throughout
 * (thigh elevation = hip - 90 - trunk, so `hip` changes with the trunk).
 * - flat: legs at 45°, arms long by the sides on the mat (spec's
 *   easier arm option; overhead arms made the hands whip through 150° in the 1 s return). curl: head and shoulder blades up, arms forward (the nod that starts the
 *   roll, so the spine peels instead of lifting like a plank). V: long spine, arms parallel to the legs. The roll down
 *   returns through the curl, then the head lies down.
 * - Arms: fit() (lazy) bisects the shoulder flexion so the arms point at the wanted elevation (V: parallel to the legs). */
{
const G = [['pelvis', 0.008]];
const BASE = { ground: G, knee: 0, ankle: -30, flat: false, abd: 0, hrot: 4, shAbd: 6, el: 3, palm: 'in', curl: 0.15 };
const LEG = 45;
const RAW = {
  flat: { ...BASE, trunk: -90, lumbar: -2, thoracic: 2, neck: 14, sh: 8, shAbd: 10, palm: 'down', _elev: null },
  curl: { ...BASE, trunk: -88, lumbar: 8, thoracic: 30, neck: 40, _elev: 22 },
  v: { ...BASE, trunk: -36, lumbar: 6, thoracic: 6, neck: 6, _elev: LEG },
};
for (const k in RAW) RAW[k].hip = LEG + 90 + RAW[k].trunk;
const CTX = { anchorX: ['pelvis'], anchorAt: [-0.1, 0] };

function fit(poses, extra) {
  const { V, solve, expand } = FB;
  const S = (p) => solve(expand(p), CTX).J;
  const arms = (p) => {
    if (p._elev == null) return;
    const f = (sh) => { const J = S({ ...p, sh }); const d = V.norm(V.sub(J.handR, J.shoulderR)); return Math.asin(d[1]) * 180 / Math.PI - p._elev; };
    let lo = 0, hi = 150;
    for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (f(m) > 0) hi = m; else lo = m; }
    p.sh = +((lo + hi) / 2).toFixed(1);
  };
  for (const k in poses) arms(poses[k]);
  for (const [at, pose] of extra) { const m = Object.assign({}, poses[at], pose); arms(m); pose.sh = m.sh; }
  return poses;
}

window.EXERCISE = {
  id: 'teaser',
  name: { tr: 'Teaser (V-Oturuş)', en: 'Teaser', es: 'Teaser (V-sit)' },
  category: { tr: 'Pilates · Karın', en: 'Pilates · Core', es: 'Pilates · Core' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['core', 'obliques', 'quads'],
  tempo: '2.5-2-3',
  tempoReps: 1,
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 40, pitch: 16, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Kollar bacaklara paralel, göğüs açık', en: 'Arms parallel to the legs, chest open', es: 'Brazos paralelos a las piernas, pecho abierto' } },
  contacts: ['pelvis'],
  props: [['mat', { at: [0, 0, 0], length: 1.9 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fit(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'flat',
  rep: [
    { to: 'curl', dur: 1.0, phase: 0 },
    { to: 'v', dur: 1.5, phase: 1 },
    { to: 'v', dur: 2.0, phase: 2 },
    { to: 'curl', dur: 2.0, phase: 3 },
    { to: 'flat', dur: 1.0, phase: 4 },
  ],
  setup: { tr: 'Sırtüstü yat, bacaklar bitişik ve 45°de. Kollar yanda, kaburgalar aşağıda.',
    en: 'Lie on your back, legs together at 45°. Arms by your sides, ribs knitted down.',
    es: 'Boca arriba, piernas juntas a 45°. Brazos a los lados, costillas abajo.' },
  phases: [
    { name: { tr: 'Kollar öne, çene içe', en: 'Arms forward, nod', es: 'Brazos al frente, barbilla' }, breath: 'in',
      text: { tr: 'Kollar öne gelir, baş ve kürek kemikleri kalkar.', en: 'Arms come forward; head and shoulder blades lift.', es: 'Brazos al frente; cabeza y escápulas suben.' } },
    { name: { tr: 'Nefes ver, V’ye kalk', en: 'Exhale, roll up to a V', es: 'Exhala, sube a la V' }, breath: 'out',
      text: { tr: 'Omur omur kalk, bacaklar 45°de sabit.', en: 'Roll up one vertebra at a time; legs stay at 45°.', es: 'Sube vértebra a vértebra; piernas fijas a 45°.' } },
    { name: { tr: 'V’de dengede kal', en: 'Balance in the V', es: 'Equilibrio en la V' }, breath: 'hold', arc: ['kneeR', 'hipR', 'neck'],
      text: { tr: 'Sırt uzun, göğüs açık, kollar bacaklara paralel.', en: 'Long spine, open chest, arms parallel to the legs.', es: 'Espalda larga, pecho abierto, brazos paralelos.' } },
    { name: { tr: 'Omur omur in', en: 'Roll down', es: 'Baja vértebra a vértebra' }, breath: 'out',
      text: { tr: 'Beli yuvarla ve yavaşça in; bacaklar düşmez.', en: 'Round the low back and lower slowly; the legs do not drop.', es: 'Redondea la lumbar y baja; las piernas no caen.' } },
    { name: { tr: 'Baş en son', en: 'Head last', es: 'La cabeza al final' }, breath: 'out',
      text: { tr: 'Baş mindere iner, kollar yana; bacaklar 45°de kalır.', en: 'Head down last, arms by the sides; legs stay at 45°.', es: 'La cabeza al final, brazos a los lados; piernas a 45°.' } },
  ],
  tempoText: { tr: '2,5 sn kalk · 2 sn kal · 3 sn in', en: '2.5 s up · 2 s hold · 3 s down', es: '2,5 s sube · 2 s mantén · 3 s baja' },
  mistakes: [
    { title: { tr: 'Bacaklar düşüyor, savrulma', en: 'Legs drop, arms swing', es: 'Las piernas caen, impulso' },
      fix: { tr: 'Bacaklar 45°de, yavaş kalk', en: 'Legs at 45°, roll slowly', es: 'Piernas a 45°, sube despacio' },
      fixText: { tr: 'Hareket karından başlar, bacaklar sabit', en: 'The abs lead; the legs stay still', es: 'El abdomen guía; las piernas quietas' },
      at: 'v', pose: { trunk: -46, hip: 58, _elev: 30 }, marks: ['ankleR'], parts: ['thigh', 'shin'] },
    { title: { tr: 'Sırt çöküyor', en: 'Back collapses', es: 'La espalda se hunde' },
      fix: { tr: 'Göğsü kaldır, sırt uzun', en: 'Lift the chest, long spine', es: 'Eleva el pecho, espalda larga' },
      fixText: { tr: 'Gerekirse dizleri bük, omurga uzun kalsın', en: 'Bend the knees if needed; keep the spine long', es: 'Dobla las rodillas si hace falta; columna larga' },
      at: 'v', pose: { trunk: -72, lumbar: 30, thoracic: 26, neck: 24, hip: 63, _elev: 35 }, line: ['pelvis', 'waist', 'neck'], parts: ['waist', 'chest'] },
  ],
  cues: [{ tr: 'Tekerlek gibi kalk, bacaklar uzun', en: 'Roll up like a wheel, long legs', es: 'Sube como una rueda, piernas largas' },
    { tr: 'Göğüs açık, çökme yok', en: 'Chest open, no collapse', es: 'Pecho abierto, sin hundirte' },
    { tr: 'Kollar ayak parmaklarına', en: 'Reach the arms to the toes', es: 'Brazos hacia los pies' }],
};
}
