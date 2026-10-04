/* Side Kick Circles (Pilates mat, side-lying on the RIGHT side, top = left leg works). Base copied from
 * side_kick_front_back.js (approved): trunk 90 rolled -90, ground [hipR, shoulderR], head on the bottom hand (elbow bent
 * variant of the spec), top hand flat on the mat in front of the chest, bottom leg 30° forward.
 * - The top leg stays at hip height and draws a ~20 cm circle at the ankle: four card-less keys around a centre of
 *   hip 8° / abduction 6° with a 7° radius (front, up, back, down), joined by the monotone spline. Two circles forward
 *   (front -> up -> back -> down), then two in reverse. Spec asks for 5 each in 3 s; 2 per direction at ~1.2 s per circle
 *   keeps the path readable on video (said in the tempo card).
 * - Only the card move of each phase gets a card; the circling keys play at real speed right after it. */
{
const G = [['hipR', 0.006], ['shoulderR', 0.006]];
const BASE = { trunk: 90, roll: -90, ground: G, flat: false, neck: 4,
  hipR: 30, kneeR: 0, abdR: -2, ankleR: -10,
  hipL: 0, kneeL: 0, abdL: 0, ankleL: -25,
  holdR: [0.06, 0.37, 0.083], elbowPoleR: [0.7, 1, -0.25], palmR: [0, 0, -1], curlR: 0.3,
  holdL: [0.25, 0, -0.2], elbowPoleL: [-0.2, 0.3, 1], handFlatL: true, handSurfaceL: 0.004, curlL: 0.1 };
const P = (o) => Object.assign({}, BASE, o);
const C = [8, 6], R = 7;
const pt = (dh, da) => P({ hipL: C[0] + dh * R, abdL: C[1] + da * R });
const K = (to, dur = 0.3) => ({ to, dur, card: false });

window.EXERCISE = {
  id: 'side_kick_circles',
  name: { tr: 'Yan Tekme Daireler', en: 'Side Kick Circles', es: 'Patada lateral con círculos' },
  category: { tr: 'Pilates · Kalça', en: 'Pilates · Hips', es: 'Pilates · Cadera' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['glutes', 'obliques', 'core'],
  side: 'L',
  tempo: '3-3',
  view: { yaw: -62, pitch: 30, zoom: 1.12 },
  alt: { yaw: -100, pitch: 14, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
    text: { tr: 'Daire kalçadan çizilir, kalça sabit', en: 'The circle comes from the hip joint, pelvis still', es: 'El círculo sale de la cadera, pelvis quieta' } },
  setupView: { yaw: -100, pitch: 16 },
  setupMarks: [{ type: 'aline', joints: ['shoulderR', 'hipR'] }],
  contacts: ['shoulderR', 'hipR', 'kneeR', 'ankleR', 'handL'],
  props: [['mat', { at: [0, 0.006, -0.12], length: 1.95, width: 0.7 }]],
  ctx: { anchorX: ['pelvis'], anchorAt: [0, 0] },
  poses: {
    start: P({}),
    F: pt(1, 0), U: pt(0, 1), B: pt(-1, 0), D: pt(0, -1),
  },
  rest: 'start',
  rep: [
    { to: 'F', dur: 0.5, phase: 0 }, K('U'), K('B'), K('D'), K('F'), K('U'), K('B'), K('D'),
    { to: 'B', dur: 0.3, phase: 1 }, K('U'), K('F'), K('D'), K('B'), K('U'), K('F'), K('D'),
  ],
  setup: { tr: 'Sağ yanına uzan, başını sağ eline koy. Bacaklar hafif önde, üst bacak kalça hizasında. Sonra taraf değiştir.',
    en: 'Lie on your right side, head on your right hand. Legs slightly forward, top leg at hip height. Then switch sides.',
    es: 'Túmbate sobre el lado derecho, cabeza en la mano. Piernas un poco adelante, la de arriba a la altura de la cadera. Luego cambia.' },
  phases: [
    { name: { tr: 'Öne doğru daire', en: 'Circle forward', es: 'Círculo adelante' }, breath: 'easy',
      text: { tr: 'Üst bacak kalça hizasında küçük daireler çizer: öne, yukarı, geriye, aşağı.', en: 'The top leg draws small circles at hip height: forward, up, back, down.', es: 'La pierna de arriba dibuja círculos pequeños: adelante, arriba, atrás, abajo.' } },
    { name: { tr: 'Yönü değiştir', en: 'Reverse', es: 'Cambia de sentido' }, breath: 'easy',
      text: { tr: 'Aynı küçük daireyi ters yöne çiz. Kalça ve gövde sabit.', en: 'Draw the same small circle the other way. Pelvis and torso still.', es: 'El mismo círculo al revés. Pelvis y tronco quietos.' } },
  ],
  tempoText: { tr: 'Her yöne 5 daire · burada 2 tanesi gösteriliyor', en: '5 circles each way · 2 shown here', es: '5 círculos por sentido · aquí se ven 2' },
  mistakes: [
    { title: { tr: 'Kalça dairelerle sallanıyor', en: 'Pelvis rocks with the circles', es: 'La pelvis se balancea' },
      fix: { tr: 'Daireyi küçült', en: 'Make the circle smaller', es: 'Haz el círculo más pequeño' },
      fixText: { tr: 'Kalçalar üst üste; sadece bacak döner', en: 'Hips stacked; only the leg circles', es: 'Caderas apiladas; solo gira la pierna' },
      at: 'B', pose: { roll: -103, lumbar: -10, hipL: -12, abdL: 10 }, view: { yaw: -90, pitch: 64 }, line: ['hipL', 'hipR'], marks: ['hipL'], parts: ['pelvis', 'waist'] },
    { title: { tr: 'Bacak kalçanın altına düşüyor', en: 'Leg drops below the hip', es: 'La pierna cae bajo la cadera' },
      fix: { tr: 'Bacağı kaldır, yavaşla', en: 'Lift the leg, slow down', es: 'Sube la pierna, más lento' },
      fixText: { tr: 'Daire kalça hizasında kalır', en: 'The circle stays at hip height', es: 'El círculo se queda a la altura de la cadera' },
      at: 'D', pose: { abdL: -11 }, view: { yaw: -100, pitch: 14 }, line: ['hipL', 'ankleL'], marks: ['ankleL'], parts: ['thighL', 'shinL'] },
  ],
  cues: [{ tr: 'Daireyi kalça ekleminden çiz', en: 'Draw the circle from the hip joint', es: 'Dibuja el círculo desde la cadera' },
    { tr: 'Kalça sessiz kalır', en: 'The pelvis stays quiet', es: 'La pelvis se queda quieta' },
    { tr: 'Dairenin her noktasına uğra', en: 'Hit every point of the circle', es: 'Pasa por cada punto del círculo' }],
};
}
