/* Side kick up-down (Pilates mat, side-lying on the RIGHT side, top = left leg works).
 * Side-lying base as side_kick_front_back.js: trunk 90 rolled -90 (roll + tips toward the character's LEFT), ground contacts
 * [hipR, shoulderR], head on the bottom hand (elbow forward on the mat), top hand flat on the mat in front of the chest.
 * Top leg turned out 30° (hrotL) and lifted in the frontal plane: abdL 45 at the top, 5 at the bottom (never resting).
 * Abduction is not in measure.mjs; it was measured as the angle between the two thighs (see report). */
{
const G = [['hipR', 0.006], ['shoulderR', 0.006]];
const BASE = { trunk: 90, roll: -90, ground: G, flat: false, neck: 4,
  hipR: 30, kneeR: 0, abdR: -2, ankleR: -10,
  hipL: 28, kneeL: 0, abdL: 5, hrotL: 30, ankleL: 10,
  holdR: [0.06, 0.37, 0.083], elbowPoleR: [0.7, 1, -0.25], palmR: [0, 0, -1], curlR: 0.3,
  holdL: [0.25, 0, -0.2], elbowPoleL: [-0.2, 0.3, 1], handFlatL: true, handSurfaceL: 0.004, curlL: 0.1 };
const P = (o) => Object.assign({}, BASE, o);

window.EXERCISE = {
  id: 'side_kick_up_down',
  name: { tr: 'Yan Tekme Yukarı-Aşağı', en: 'Side Kick Up-Down', es: 'Patada lateral arriba-abajo' },
  category: { tr: 'Pilates · Kalça', en: 'Pilates · Hips', es: 'Pilates · Cadera' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['glutes', 'obliques', 'core'],
  side: 'L',
  tempo: '1.5-1.5',
  view: { yaw: -68, pitch: 16, zoom: 1.12 },
  alt: { yaw: -118, pitch: 14, title: { tr: 'Ayak tarafından', en: 'From the feet', es: 'Desde los pies' },
    text: { tr: 'Kalçalar üst üste, bacak yana kalkar', en: 'Hips stacked, the leg rises to the side', es: 'Caderas apiladas, la pierna sube de lado' } },
  setupView: { yaw: -95, pitch: 14 },
  setupMarks: [{ type: 'aline', joints: ['shoulderR', 'hipR'] }],
  contacts: ['shoulderR', 'hipR', 'kneeR', 'ankleR', 'handL'],
  props: [['mat', { at: [0, 0.006, -0.12], length: 1.95, width: 0.7 }]],
  ctx: { anchorX: ['pelvis'], anchorAt: [0, 0] },
  poses: {
    low: P({}),
    up: P({ abdL: 43, ankleL: -40 }),
  },
  rest: 'low',
  rep: [
    { to: 'up', dur: 1.5, phase: 0 },
    { to: 'low', dur: 1.5, phase: 1 },
  ],
  setup: { tr: 'Sağ yanına uzan, başını sağ eline koy. Bacaklar hafif önde, üst bacağı hafif dışa çevir. Sonra taraf değiştir.',
    en: 'Lie on your right side, head on your right hand. Legs slightly forward, top leg turned out a little. Then switch sides.',
    es: 'Túmbate sobre el lado derecho, cabeza en la mano. Piernas un poco adelante, la de arriba algo rotada hacia fuera. Luego cambia.' },
  phases: [
    { name: { tr: 'Yukarı kaldır', en: 'Lift', es: 'Eleva' }, breath: 'in', arc: ['ankleR', 'hipR', 'ankleL'],
      text: { tr: 'Ayak ucu uzun, üst bacağı yaklaşık 45° yukarı kaldır. Kalçalar üst üste.', en: 'Point the foot and lift the top leg to about 45°. Hips stay stacked.', es: 'Pie en punta, sube la pierna a unos 45°. Caderas apiladas.' } },
    { name: { tr: 'Kontrollü indir', en: 'Lower with control', es: 'Baja con control' }, breath: 'out',
      text: { tr: 'Ayağı bük, bacağı alt bacağın hemen üstüne indir. Bırakıp dinlenme.', en: 'Flex the foot and lower to just above the bottom leg. No resting.', es: 'Flexiona el pie y baja justo encima de la otra pierna. Sin apoyar.' } },
  ],
  tempoText: { tr: '1,5 sn kaldır · 1,5 sn indir', en: '1.5 s up · 1.5 s down', es: '1,5 s arriba · 1,5 s abajo' },
  mistakes: [
    { title: { tr: 'Kalça geriye devriliyor', en: 'Top hip rolls back', es: 'La cadera rueda atrás' },
      fix: { tr: 'Daha az kaldır', en: 'Lift a little less', es: 'Sube un poco menos' },
      fixText: { tr: 'Kalçalar üst üste, diz öne bakar; yükseklik kalçadan gelir', en: 'Hips stacked, knee faces forward; height comes from the hip', es: 'Caderas apiladas, rodilla al frente; la altura sale de la cadera' },
      at: 'up', pose: { roll: -104, abdL: 52, hrotL: 50 }, view: { yaw: -118, pitch: 14 }, line: ['hipL', 'hipR'], marks: ['hipL'], parts: ['pelvis'] },
    { title: { tr: 'Alt bel çöküyor', en: 'Bottom waist sags', es: 'La cintura cae' },
      fix: { tr: 'Beli mattan kaldır', en: 'Lift the waist off the mat', es: 'Despega la cintura' },
      fixText: { tr: 'Alt kaburgalarla mat arasında küçük bir boşluk bırak', en: 'Keep a small gap between the lower ribs and the mat', es: 'Deja un pequeño hueco entre costillas y esterilla' },
      at: 'up', pose: { side: 24, abdR: -8 }, view: { yaw: -92, pitch: 8 }, marks: ['waist'], parts: ['waist'] },
  ],
  cues: [{ tr: 'Kalçadan kaldır, ayaktan değil', en: 'Lift from the hip, not the foot', es: 'Eleva desde la cadera, no desde el pie' },
    { tr: 'Kontrollü indir, dinlenme', en: 'Lower with control, no resting', es: 'Baja con control, sin apoyar' },
    { tr: 'Bel uzun', en: 'Keep the waist long', es: 'Cintura larga' }],
};
}
