/* Criss-Cross (Pilates mat, supine curl-up with rotation). the_hundred base: pelvis + waist contacts keep the pelvis
 * square on the mat; thoracic 35 + neck 40 hold the curl and `twist` (-40 = chest toward the right) rotates the rib cage,
 * so the left shoulder travels toward the bent right knee. Hands cradle the skull (HEAD() from chest_lift, thorax frame,
 * so they turn with the ribs), elbows wide. Rest = turned right with the right knee in; the switch through centre is one
 * move, right and left are the two moves of a rep. Main view = front 3/4 (spec), side view as the alt. */
{
const MAT = 0.008;
const G = (w = -0.016) => [['pelvis', MAT], ['waist', MAT + w]];
const HEAD = (n, out = 0.07, back = 0.115, el = [0.05, 0.25, 1]) => {
  const B = FB.BODY, r = n * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
  const hx = (B.headFwd ?? 0.05) * c + (B.headUp ?? 0.19) * s, hy = -(B.headFwd ?? 0.05) * s + (B.headUp ?? 0.19) * c;
  const p = [hx - back * c, B.thorax * 0.5 + hy + back * s];
  return { holdL: [p[0], p[1], out], holdR: [p[0], p[1], out], elbowPoleL: el, elbowPoleR: el, handFlat: false, palm: [c, -s, -0.7], curl: 0.45 };
};
const BASE = { trunk: -90, abd: 2, hrot: 6, lumbar: 6, thoracic: 35, neck: 40, flat: false, ground: G(), ...{} };
const LEGS = (inS, longS, tw) => ({ ['hip' + inS]: 108, ['knee' + inS]: 130, ['ankle' + inS]: -25,
  ['hip' + longS]: 33, ['knee' + longS]: 0, ['ankle' + longS]: -32, twist: tw });
const RAW = { toR: { ...BASE, ...LEGS('R', 'L', -40) }, toL: { ...BASE, ...LEGS('L', 'R', 40) } };
const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };
function fit(poses) {
  for (const k in poses) Object.assign(poses[k], HEAD(poses[k].neck));
  return poses;
}

window.EXERCISE = {
  id: 'criss_cross',
  name: { tr: 'Çapraz Bükülme (Criss-Cross)', en: 'Criss-Cross', es: 'Criss-cross (rotación cruzada)' },
  category: { tr: 'Pilates · Karın', en: 'Pilates · Core', es: 'Pilates · Core' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['obliques', 'core'],
  tempo: '1-1',
  view: { yaw: 42, pitch: 22, zoom: 1.02 },
  alt: { yaw: 90, pitch: 6, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
    text: { tr: 'Uzun bacak 45°de, bel minderde', en: 'Long leg at 45°, lower back down', es: 'Pierna larga a 45°, lumbar abajo' } },
  contacts: ['pelvis', 'waist'],
  props: [['mat', { at: [0.05, 0.006, 0], length: 2.0 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fit(RAW)); },
  rest: 'toR',
  rep: [
    { to: 'toL', dur: 1.0, phase: 0 },
    { to: 'toR', dur: 1.0, phase: 1 },
  ],
  setup: { tr: 'Eller başın arkasında, baş ve kürek kemikleri havada. Sağ diz içeride, sol bacak 45°de uzun.',
    en: 'Hands behind the head, head and shoulder blades up. Right knee in, left leg long at 45°.',
    es: 'Manos tras la cabeza, cabeza y escápulas arriba. Rodilla derecha adentro, pierna izquierda a 45°.' },
  phases: [
    { name: { tr: 'Sola dön', en: 'Rotate left', es: 'Gira a la izquierda' }, breath: 'out', line: ['hipL', 'hipR'],
      text: { tr: 'Bacaklar yer değiştirir; sağ omuz sol dize döner. Dönüş kaburgalardan.', en: 'Switch legs; the right shoulder turns toward the left knee. Rotate from the ribs.', es: 'Cambia de pierna; el hombro derecho gira hacia la rodilla izquierda.' } },
    { name: { tr: 'Sağa dön', en: 'Rotate right', es: 'Gira a la derecha' }, breath: 'out',
      text: { tr: 'Ortadan geçip diğer tarafa. Pelvis kare ve sabit.', en: 'Pass through centre to the other side. Pelvis square and still.', es: 'Pasa por el centro al otro lado. Pelvis cuadrada y quieta.' } },
  ],
  tempoText: { tr: 'Her yöne 1 sn · dönerken nefes ver', en: '1 s each way · exhale as you rotate', es: '1 s por lado · exhala al girar' },
  mistakes: [
    { title: { tr: 'Dirsek uzanıyor, gövde dönmüyor', en: 'Elbow reaches, ribs don’t turn', es: 'El codo va, las costillas no giran' },
      fix: { tr: 'Göğüs kemiğini dize döndür', en: 'Turn the breastbone to the knee', es: 'Gira el esternón hacia la rodilla' },
      fixText: { tr: 'Dirsekler geniş kalır, dönüş kaburgalardan', en: 'Elbows stay wide; the turn comes from the ribs', es: 'Codos abiertos; el giro viene de las costillas' },
      at: 'toR', pose: { twist: -8, elbowPoleL: [1, 0.2, 0.15] }, marks: ['elbowL', 'chest'], parts: ['upperL', 'chest'] },
    { title: { tr: 'Pelvis sallanıyor', en: 'Pelvis rocks', es: 'La pelvis se balancea' },
      fix: { tr: 'Kalçalar kare kalsın', en: 'Keep the hips square', es: 'Caderas cuadradas' },
      fixText: { tr: 'Yalnızca kaburgalar döner, pelvis minderde sabit', en: 'Only the ribs rotate; the pelvis stays still', es: 'Solo giran las costillas; la pelvis queda quieta' },
      at: 'toR', pose: { roll: -7, pos: [0, 0.02, 0] }, view: { yaw: 18, pitch: 24 }, line: ['hipL', 'hipR'], parts: ['pelvis'] },
  ],
  cues: [{ tr: 'Kaburgalardan dön', en: 'Rotate from the ribs', es: 'Gira desde las costillas' },
    { tr: 'Dirsekler geniş', en: 'Elbows wide', es: 'Codos abiertos' },
    { tr: 'Uzun bacak 45°de', en: 'Long leg at 45°', es: 'Pierna larga a 45°' }],
};
}
