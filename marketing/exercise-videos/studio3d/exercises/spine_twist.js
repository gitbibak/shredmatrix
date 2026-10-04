/* Spine Twist (Pilates mat, seated). Seated base from spine_stretch_forward.js: every pose rests on [pelvis, heelR] (legs
 * long and together on the mat, feet flexed), sit bones anchored (anchorX pelvis). Arms in a T at shoulder height, palms down.
 * Rotation = `twist` (+ chest to the LEFT, split lumbar/thoracic by the engine): -55 right, +55 left; the head follows a
 * little further (headTurn). The classical "two small pulses" are only mentioned in the card (card:false in-between keys
 * would leave a card-less gap after the rotation card).
 * Front view (spec) with a slight angle so the legs are not fully foreshortened; alt = side view (tall posture). */
{
const MAT = 0.012;
const G = [['pelvis', MAT], ['heelR', MAT]];
const BASE = { trunk: 0, hip: 90, knee: 0, ankle: 8, flat: false, abd: 3, hrot: 2, ground: G, lumbar: -2, thoracic: 0, neck: 2,
  sh: 0, shAbd: 88, el: 3, palm: 'down', curl: 0.05, twist: 0, headTurn: 0 };
const P = (o) => Object.assign({}, BASE, o);

window.EXERCISE = {
  id: 'spine_twist',
  name: { tr: 'Omurga Döndürme (Spine Twist)', en: 'Spine Twist', es: 'Giro de columna (spine twist)' },
  category: { tr: 'Pilates · Rotasyon', en: 'Pilates · Rotation', es: 'Pilates · Rotación' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['obliques', 'core', 'lowerback'],
  tempo: '2-1.5-2',
  tempoReps: 1,
  view: { yaw: 14, pitch: 16 },
  alt: { yaw: 90, pitch: 6, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
    text: { tr: 'Omurga dik, tepe tavana uzanır', en: 'Spine tall, crown reaching up', es: 'Columna erguida, coronilla arriba' } },
  setupView: { yaw: 40, pitch: 14 },
  contacts: ['pelvis', 'heelR', 'heelL'],
  props: [['mat', { at: [0.1, 0, 0], length: 1.5 }]],
  ctx: { anchorX: ['pelvis'], anchorAt: [-0.3, 0] },
  poses: {
    tall: P({}),
    right: P({ twist: -55, headTurn: -12 }),
    left: P({ twist: 55, headTurn: 12 }),
  },
  rest: 'tall',
  rep: [
    { to: 'right', dur: 2.0, phase: 0 },
    { to: 'tall', dur: 1.5, phase: 1 },
    { to: 'left', dur: 2.0, phase: 2 },
    { to: 'tall', dur: 1.5, phase: 1 },
  ],
  setup: { tr: 'Dik otur, bacaklar uzun ve bitişik, ayaklar bükülü. Kollar omuz hizasında yana açık, avuçlar aşağı.',
    en: 'Sit tall, legs long and together, feet flexed. Arms out to the sides at shoulder height, palms down.',
    es: 'Siéntate erguida, piernas largas y juntas, pies flexionados. Brazos en cruz, palmas abajo.' },
  phases: [
    { name: { tr: 'Nefes ver, sağa dön', en: 'Exhale, twist right', es: 'Exhala, gira a la derecha' }, breath: 'out', line: ['shoulderL', 'shoulderR'],
      text: { tr: 'Gövdeyi sağa döndür, sonunda iki küçük vuruş. Kalça yerinde, omurga uzun.', en: 'Twist right, two small pulses at the end. Hips stay put, spine long.', es: 'Gira a la derecha, dos pulsos al final. Cadera quieta, columna larga.' } },
    { name: { tr: 'Nefes al, ortaya', en: 'Inhale, centre', es: 'Inhala, al centro' }, breath: 'in',
      text: { tr: 'Ortaya dönerken biraz daha uzan.', en: 'Return to centre and grow taller.', es: 'Vuelve al centro y crece hacia arriba.' } },
    { name: { tr: 'Nefes ver, sola dön', en: 'Exhale, twist left', es: 'Exhala, gira a la izquierda' }, breath: 'out', line: ['shoulderL', 'shoulderR'],
      text: { tr: 'Aynısını sola yap. İki oturma kemiği de yerde.', en: 'Same to the left. Both sit bones stay down.', es: 'Igual a la izquierda. Ambos isquiones abajo.' } },
  ],
  tempoText: { tr: '2 sn dön · 1,5 sn ortaya · 2 sn diğer yana', en: '2 s twist · 1.5 s centre · 2 s other side', es: '2 s gira · 1,5 s centro · 2 s otro lado' },
  mistakes: [
    { title: { tr: 'Kalça dönüşe katılıyor', en: 'Hips turn with the twist', es: 'La cadera gira también' },
      text: { tr: 'Bir oturma kemiği kalkar, kalça kayar.', en: 'One sit bone lifts and the hips shift.', es: 'Un isquion se levanta y la cadera se desplaza.' },
      fix: { tr: 'İki oturma kemiğini sabitle', en: 'Anchor both sit bones', es: 'Ancla ambos isquiones' },
      fixText: { tr: 'Dönüş beldeki kaslardan gelir; gerekirse havlu üstüne otur', en: 'The turn comes from the waist; sit on a towel if needed', es: 'El giro sale de la cintura; siéntate en una toalla si hace falta' },
      at: 'right', pose: { roll: -8, yaw: -10, twist: -45, ground: [['pelvis', MAT + 0.012], ['heelR', MAT]] }, view: { yaw: 0, pitch: 12 }, line: ['hipL', 'hipR'], marks: ['hipL'], parts: ['pelvis'] },
    { title: { tr: 'Sırt çöküyor', en: 'Slumping', es: 'Espalda hundida' },
      text: { tr: 'Göğüs çöker, sırt yuvarlanır.', en: 'The chest collapses and the back rounds.', es: 'El pecho se hunde y la espalda se redondea.' },
      fix: { tr: 'Belden yukarı uzan', en: 'Lift out of the waist', es: 'Crece desde la cintura' },
      fixText: { tr: 'Tepe tavana, dönerken boy uzar', en: 'Crown to the ceiling; grow taller as you turn', es: 'Coronilla al techo; crece al girar' },
      at: 'tall', pose: { trunk: -12, lumbar: 20, thoracic: 14, neck: 14 }, view: { yaw: 70, pitch: 8 }, line: ['pelvis', 'waist', 'neck'], parts: ['waist', 'chest'] },
  ],
  cues: [{ tr: 'Uzan ve dön', en: 'Grow tall and rotate', es: 'Crece y gira' },
    { tr: 'İki oturma kemiği yerde', en: 'Both sit bones stay down', es: 'Ambos isquiones abajo' },
    { tr: 'Omurgayı havlu gibi sık', en: 'Wring out the spine', es: 'Escurre la columna como una toalla' }],
};
}
