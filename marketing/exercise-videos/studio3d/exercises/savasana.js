/* Savasana (Corpse Pose) / Yoga Nidra position: long sitting -> lie back -> stillness -> back up to sitting.
 * - Both poses rest on the same two ground contacts [pelvis, heelR]: legs stay long on the mat while the trunk lowers.
 * - fitLie() (lazy, after the rig sets FB.BODY) bisects the thoracic angle so the upper back/shoulders rest on the mat and
 *   then the neck so the back of the head rests on it (thorax stays near flat, so the engine's lying ponytail clamp is on).
 * - Spec exit (roll to the right side, then press up) is shown as a slow roll up to sitting; the setup text mentions the side roll.
 * - Breathing is shown with the breath pill; the body itself stays completely still (the point of the pose). */
{
const MAT = 0.012;
const G = [['pelvis', MAT], ['heelR', MAT]];
const BASE = { knee: 0, flat: false, ground: G, curl: 0.25 };
const RAW = {
  sit: { ...BASE, trunk: 0, hip: 90, ankle: 2, abd: 4, hrot: 6, sh: 8, shAbd: 16, el: 12, palm: 'down', neck: 6, thoracic: 4 },
  lie: { ...BASE, trunk: -90, hip: 0, ankle: -22, abd: 9, hrot: 30, sh: 6, shAbd: 40, el: 6, palm: 'up', neck: 0, thoracic: 0 },
};
const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };

function fitLie(poses, extra) {
  const { solve, expand } = FB;
  const S = (p) => solve(expand(p), CTX).J;
  const bis = (p, key, joint, y, lo, hi) => {
    const f = (v) => S({ ...p, [key]: v })[joint][1] - y, up = f(hi) > f(lo);
    for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if ((f(m) > 0) === up) hi = m; else lo = m; }
    p[key] = +((lo + hi) / 2).toFixed(2);
  };
  const fit = (p) => { bis(p, 'thoracic', 'shoulderR', MAT + 0.092, -25, 25); bis(p, 'neck', 'head', MAT + 0.1, -30, 40); bis(p, 'sh', 'handR', MAT + 0.035, -40, 30); };
  fit(poses.lie);
  for (const [at, pose] of extra) { if (pose.dNeck !== undefined) { pose.thoracic = poses[at].thoracic; pose.neck = +(poses[at].neck + pose.dNeck).toFixed(2); continue; } const m = Object.assign({}, poses[at], pose); fit(m); pose.thoracic = m.thoracic; pose.neck = m.neck; }
  return poses;
}

window.EXERCISE = {
  id: 'savasana',
  name: { tr: 'Şavasana (Cesedin Pozu)', en: 'Savasana (Corpse Pose)', es: 'Savasana (postura del cadáver)' },
  category: { tr: 'Yoga · Gevşeme', en: 'Yoga · Relaxation', es: 'Yoga · Relajación' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['core'],
  tempo: '4-hold-4',
  hold: true, holdDur: 3,
  view: { yaw: 38, pitch: 24 },
  alt: { yaw: 90, pitch: 8, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
    text: { tr: 'Baş, sırt ve bacaklar yerde, omurga nötr', en: 'Head, back and legs down, neutral spine', es: 'Cabeza, espalda y piernas abajo, columna neutra' } },
  setupView: { yaw: 60, pitch: 16 },
  contacts: ['pelvis', 'heelR', 'heelL'],
  props: [['mat', { at: [-0.25, 0, 0], length: 1.95, width: 0.7 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fitLie(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'sit',
  rep: [
    { to: 'lie', dur: 4.0, phase: 0 },
    { to: 'lie', dur: 1.0, phase: 1 },
    { to: 'sit', dur: 4.0, phase: 2 },
  ],
  setup: { tr: 'Matın ortasında otur, bacaklar uzun, eller kalçanın yanında.',
    en: 'Sit in the middle of the mat, legs long, hands beside the hips.',
    es: 'Siéntate en el centro de la esterilla, piernas largas, manos junto a la cadera.' },
  phases: [
    { name: { tr: 'Sırtüstü uzan', en: 'Lie back', es: 'Túmbate' }, breath: 'out', slow: 1.0,
      text: { tr: 'Yavaşça sırtüstü uzan. Kollar yana açık, avuçlar yukarı, ayaklar yanlara düşsün.', en: 'Lie back slowly. Arms open, palms up, let the feet fall out.', es: 'Túmbate despacio. Brazos abiertos, palmas arriba, pies hacia fuera.' } },
    { name: { tr: 'Tamamen bırak', en: 'Let go', es: 'Suelta' }, breath: 'easy',
      text: { tr: 'Gözler kapalı, çene ve karın yumuşak. Bedeni ayaktan başa tara.', en: 'Eyes closed, jaw and belly soft. Scan the body from feet to head.', es: 'Ojos cerrados, mandíbula y abdomen suaves. Recorre el cuerpo de pies a cabeza.' } },
    { name: { tr: 'Yavaşça dön', en: 'Come back slowly', es: 'Vuelve despacio' }, breath: 'in', slow: 1.0,
      text: { tr: 'Nefesi derinleştir, parmakları oynat, yana dönüp yavaşça otur.', en: 'Deepen the breath, wiggle fingers and toes, roll to the side, sit up.', es: 'Respira hondo, mueve los dedos, gira de lado y siéntate.' } },
  ],
  tempoText: { tr: '4 sn uzan · 5-10 dk kal · 4 sn otur', en: '4 s lie down · stay 5-10 min · 4 s sit up', es: '4 s túmbate · 5-10 min · 4 s siéntate' },
  mistakes: [
    { title: { tr: 'Omuzlar ve boyun gergin', en: 'Tense shoulders and neck', es: 'Hombros y cuello tensos' },
      text: { tr: 'Omuzlar kulağa kalkar, baş yerden hafifçe kalkar.', en: 'Shoulders creep up, the head hovers off the mat.', es: 'Los hombros suben, la cabeza se despega.' },
      fix: { tr: 'Omuzları yere bırak', en: 'Let the shoulders drop', es: 'Deja caer los hombros' },
      fixText: { tr: 'Gerekirse başın altına katlanmış battaniye koy', en: 'Use a folded blanket under the head if needed', es: 'Usa una manta doblada bajo la cabeza si hace falta' },
      at: 'lie', pose: { shrug: 0.045, dNeck: 14, shAbd: 18, el: 14, curl: 0.85, palm: 'down' }, view: { yaw: 70, pitch: 14 }, marks: ['shoulderR', 'head'], parts: ['upper', 'neck'] },
    { title: { tr: 'Sürekli kıpırdanmak', en: 'Fidgeting', es: 'Moverse sin parar' },
      text: { tr: 'Diz kalkar, eller düzeltir; beden yerleşemez.', en: 'A knee lifts, the hands adjust; the body never settles.', es: 'Una rodilla sube, las manos ajustan; el cuerpo no se asienta.' },
      fix: { tr: 'Ayaktan başa tara, kıpırdama', en: 'Scan from the toes up, stay still', es: 'Recorre de los pies a la cabeza, quieta' },
      fixText: { tr: 'Her bölgeyi fark et ve bırak; beden ağır', en: 'Notice each part and let it go; the body heavy', es: 'Nota cada zona y suéltala; el cuerpo pesado' },
      at: 'lie', pose: { hipL: 55, kneeL: 95, ankleL: 0, abdL: 4, hrotL: 4, shR: 30, shAbdR: 12, elR: 95, palmR: 'down' }, marks: ['kneeL', 'handR'], parts: ['thighL', 'foreR'] },
  ],
  cues: [{ tr: 'Kontrolü bırak', en: 'Let go of control', es: 'Suelta el control' },
    { tr: 'Çene, karın ve eller yumuşak', en: 'Soft jaw, belly and hands', es: 'Mandíbula, abdomen y manos suaves' },
    { tr: 'Yavaşça çık', en: 'Come out slowly', es: 'Sal despacio' }],
};
}
