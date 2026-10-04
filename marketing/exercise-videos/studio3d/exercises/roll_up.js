/* Roll Up with a resistance band (Pilates mat; manifest: "Resistance Band Roll Up"). Band looped around the arches,
 * hands hold the ends (band prop = tube from the ball of each foot to the hand).
 * - All poses rest on the same two contacts [pelvis, heelR] (legs long on the mat, like seated_forward_fold): `hip` sets
 *   how far the trunk is up (hip < 0 = pelvis tilted back = imprint with the lower back on the mat), so the roll never
 *   switches contact sets.
 * - Articulation: flat -> curl (head and shoulder blades up, lower back still down) -> reach (C-curve over the legs)
 *   -> lowC (rolled back to the mid back: low back on the mat, upper back still curled) -> flat. Keys at the curl and
 *   lowC poses keep the spine peeling instead of lifting like a plank.
 * - Spec deviation: start arms reach to the ceiling holding the band (band version) instead of overhead on the mat; the
 *   spec's peel_up (upright) and reach_over_toes are merged into one reach pose and the tempo is 1.5-2.5-2.5-1.5 s
 *   (spec 2-3-2-5) so the video stays under 60 s. */
{
const MAT = 0.012;
const G = [['pelvis', MAT], ['heelR', MAT]];
const BASE = { trunk: 0, knee: 0, ankle: 2, flat: false, abd: 3, ground: G, handFlat: false, palm: 'in', curl: 0.9, shAbd: 8 };
const RAW = {
  flat: { ...BASE, hip: -2, lumbar: -3, thoracic: 2, neck: 14, sh: 64, el: 6 },
  curl: { ...BASE, hip: -6, lumbar: 4, thoracic: 28, neck: 40, sh: 78, el: 6 },
  reach: { ...BASE, hip: 80, lumbar: 32, thoracic: 34, neck: 40, sh: 150, el: 4 },
  lowC: { ...BASE, hip: -8, lumbar: 18, thoracic: 36, neck: 38, sh: 75, el: 6 },
};
for (const k in RAW) RAW[k].trunk = RAW[k].hip - 90;     // start the 2-contact solve with the legs near horizontal (no flip)
const CTX = { anchorX: ['pelvis'], anchorAt: [-0.3, 0] };

window.EXERCISE = {
  id: 'roll_up',
  name: { tr: 'Yuvarlanarak Kalkış (Roll Up)', en: 'Roll Up', es: 'Rodar hacia arriba (roll up)' },
  category: { tr: 'Pilates · Karın', en: 'Pilates · Core', es: 'Pilates · Core' },
  equipmentLabel: { tr: 'Mat · Direnç bandı', en: 'Mat · Resistance band', es: 'Esterilla · Banda elástica' },
  muscles: ['core', 'obliques'],
  tempo: '1.5-2.5-2.5-1.5',
  tempoReps: 1,
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 40, pitch: 18, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Bacaklar bitişik, kollar paralel', en: 'Legs together, arms parallel', es: 'Piernas juntas, brazos paralelos' } },
  contacts: ['pelvis', 'heelR', 'heelL'],
  props: [['mat', { at: [0.05, 0, 0], length: 1.9 }], ['band', { sides: ['L', 'R'] }]],
  ctx: CTX,
  poses: RAW,
  rest: 'flat',
  rep: [
    { to: 'curl', dur: 1.5, phase: 0 },
    { to: 'reach', dur: 2.5, phase: 1 },
    { to: 'lowC', dur: 2.5, phase: 2 },
    { to: 'flat', dur: 1.5, phase: 3 },
  ],
  setup: { tr: 'Sırtüstü yat, bacaklar uzun ve bitişik. Bant ayak tabanlarında, uçları ellerde, kollar tavana.',
    en: 'Lie on your back, legs long and together. Band around the arches, ends in your hands, arms up.',
    es: 'Boca arriba, piernas largas y juntas. Banda en los pies, extremos en las manos, brazos arriba.' },
  phases: [
    { name: { tr: 'Çeneyi indir, kıvrıl', en: 'Nod and curl', es: 'Barbilla y enróllate' }, breath: 'out',
      text: { tr: 'Baş ve kürek kemikleri kalkar, bel minderde kalır.', en: 'Head and shoulder blades lift; the low back stays down.', es: 'Cabeza y escápulas suben; la lumbar sigue abajo.' } },
    { name: { tr: 'Omur omur kalk', en: 'Peel up', es: 'Sube vértebra a vértebra' }, breath: 'out',
      text: { tr: 'Karın içe, C-kıvrımıyla bacakların üstüne uzan.', en: 'Belly scooped, reach over the legs in a C-curve.', es: 'Abdomen adentro, alárgate sobre las piernas en C.' } },
    { name: { tr: 'Geriye yuvarlan', en: 'Roll back down', es: 'Rueda hacia atrás' }, breath: 'in',
      text: { tr: 'Önce bel, sonra sırt; omur omur mindere in.', en: 'Low back first, then the mid back, one vertebra at a time.', es: 'Primero la lumbar, luego la espalda, vértebra a vértebra.' } },
    { name: { tr: 'Baş en son', en: 'Head last', es: 'La cabeza al final' }, breath: 'out',
      text: { tr: 'Baş mindere iner, kollar tavana döner.', en: 'Head down last, arms back to the ceiling.', es: 'La cabeza baja al final, brazos al techo.' } },
  ],
  tempoText: { tr: 'Kıvrıl · 2,5 sn kalk · 4 sn yavaşça in', en: 'Curl · 2.5 s up · 4 s slowly down', es: 'Enróllate · 2,5 s sube · 4 s baja' },
  mistakes: [
    { title: { tr: 'Bacaklar kalkıyor, savrulma', en: 'Legs lift, momentum swing', es: 'Las piernas suben, impulso' },
      fix: { tr: 'Ayaklar ağır, yavaş kalk', en: 'Heavy feet, roll slowly', es: 'Pies pesados, sube despacio' },
      fixText: { tr: 'Bantla ayakları sabitle, hareketi karından başlat', en: 'Anchor the feet with the band; start from the belly', es: 'Fija los pies con la banda; empieza desde el abdomen' },
      at: 'curl', pose: { ground: [['pelvis', MAT]], trunk: -62, hip: 50, lumbar: 2, thoracic: 18, neck: 30, sh: 70 }, marks: ['ankleR'], parts: ['thigh', 'shin'] },
    { title: { tr: 'Düz sırtla kalkmak', en: 'Lifting with a flat back', es: 'Subir con la espalda recta' },
      fix: { tr: 'Çene içeride, omur omur', en: 'Chin in, vertebra by vertebra', es: 'Barbilla adentro, vértebra a vértebra' },
      fixText: { tr: 'Önce baş ve göğüs kıvrılır, sonra bel', en: 'Curl head and chest first, then the low back', es: 'Primero cabeza y pecho, luego la lumbar' },
      at: 'lowC', pose: { hip: 38, lumbar: -4, thoracic: 0, neck: 6, sh: 85 }, line: ['pelvis', 'waist', 'neck'], parts: ['waist', 'chest'] },
  ],
  cues: [{ tr: 'Çene göğse, tekerlek gibi kıvrıl', en: 'Chin to chest, curl like a wheel', es: 'Barbilla al pecho, como una rueda' },
    { tr: 'Karın içe, ayaklar ağır', en: 'Belly scooped, feet heavy', es: 'Abdomen adentro, pies pesados' },
    { tr: 'Tırtıl gibi omur omur', en: 'Peel like a caterpillar', es: 'Como una oruga, vértebra a vértebra' }],
};
}
