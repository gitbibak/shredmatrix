/* Reformer Hamstring Stretch (kneeling runner's stretch). Facing the footbar (+x): FRONT (right, near the camera) foot flat
 * on the standing platform (fixed), BACK (left) knee and shin resting on the carriage with the toes toward the shoulder
 * block, both hands flat on the footbar. Pushing the carriage back straightens the front knee into a long hamstring stretch
 * with a flat back; in the hold the front toes lift (heel stays down).
 * - Front foot: anchorX ankleR + flat heel on the platform (0.38).
 * - Back leg: from the hip height of each pose the back thigh angle is solved so the knee rests on the pad with the shin
 *   flat on it (top of the foot down); the ankle is then pinned (pose.ik), so the knee never lifts between keys.
 * - Carriage centre = back toe x + 0.33 (toes just in front of the shoulder block; knee well on the pad) in EVERY frame: the carriage moves with the knee.
 * - Hold: the front foot rotates about the heel (toes up ~15°; anchor = right heel), pinned with ik.
 * - Spec reading: front knee -> ~5° and the toes-up hold are matched; with the hands on the footbar and the front leg long, the trunk folds to ~65-70° (spec 45°); spec hip flexion 45-55 is the thigh angle of a
 *   standing hinge, the kneeling version measures ~95-110° trunk-thigh. Kneeling limits the hip height, so straightening the
 *   front knee needs a long carriage travel (~55 cm, spec 35-40). */
{
const TOP = 0.38, BARY = TOP + 0.36 + 0.022, BX = 1.04;   // footbar slid one notch toward the foot end
const CTX = { anchorX: ['heelR'], anchorAt: [0.84, 0.088] };
const HANDS = { ik: { handL: { at: [BX - 0.01, BARY + 0.03, -0.11] }, handR: { at: [BX - 0.01, BARY + 0.03, 0.11] } }, handFlat: true, handSurface: BARY, elbowPole: [-0.6, -0.4, 0.6] };
const BASE = { abd: 2, ground: [['heelR', TOP]], flatR: false, flatL: false, ankleL: -62, lumbar: 0, thoracic: 0, neck: -2, sh: 70, el: 5, noAvoid: true, pole: { kneeR: [0.5, 1, 0] }, ...HANDS };
// T = trunk lean, th = front thigh angle from vertical, kneeR = front knee, toes = front toes-up angle (hold)
const P = (T, th, kneeR, o = {}) => Object.assign({}, BASE, { trunk: T, hipR: th + T, kneeR, _T: T }, o);
const RAW = {
  start: P(18, 95, 122),
  push: P(62, 66, 5),
  hold: P(66, 68, 3, { _toes: 15 }),
};
function fit(poses, extra) {
  const { V, M, solve, expand, D2R } = FB;
  const go = (p) => {
    const T = p.trunk, s0 = solve(expand(Object.assign({}, p, { ik: { handL: p.ik.handL, handR: p.ik.handR } })), CTX);
    const h = s0.J.hipL[1], dk = Math.min(0.41, h - (TOP + 0.04));
    const phi = Math.acos(dk / 0.416) / D2R;               // back thigh angle behind vertical
    p.hipL = +(T - phi).toFixed(2); p.kneeL = +(90 - phi).toFixed(2);
    const s = solve(expand(Object.assign({}, p, { ik: { handL: p.ik.handL, handR: p.ik.handR } })), CTX);
    const ik = { handL: p.ik.handL, handR: p.ik.handR, ankleL: { at: s.J.ankleL.slice(), foot: s.F.footL.map((c) => c.slice()) } };
    {                                                       // front foot: flat (or toes up in the hold) about the fixed heel; flatR false in ALL poses (a boolean switch would jump)
      const toes = p._toes || 0;
      const fa = (q) => { const t = solve(expand(Object.assign({}, p, { flatR: false, ankleR: q, ik: { handL: p.ik.handL, handR: p.ik.handR } })), CTX).J;
        return Math.atan2(t.toeR[1] - t.heelR[1], t.toeR[0] - t.heelR[0]) / D2R; };
      let lo = -120, hi = 60;
      for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (fa(m) > toes) hi = m; else lo = m; }
      p.flatR = false; p.ankleR = +((lo + hi) / 2).toFixed(2);
      const t = solve(expand(Object.assign({}, p, { ik: { handL: p.ik.handL, handR: p.ik.handR } })), CTX);
      ik.ankleR = { at: t.J.ankleR.slice(), foot: t.F.footR.map((c) => c.slice()) };
    }
    p.ik = ik;
  };
  for (const k in poses) go(poses[k]);
  for (const [at, pose] of extra) { const m = Object.assign({}, poses[at], pose); go(m); Object.assign(pose, { hipL: m.hipL, kneeL: m.kneeL, ik: m.ik, flatR: m.flatR, ankleR: m.ankleR }); }
  return poses;
}

window.EXERCISE = {
  id: 'hamstring_stretch',
  name: { tr: 'Hamstring Esnetme', en: 'Hamstring Stretch', es: 'Estiramiento de isquiotibiales' },
  category: { tr: 'Reformer · Esneme', en: 'Reformer · Stretch', es: 'Reformer · Estiramiento' },
  equipmentLabel: { tr: 'Reformer · 1 kırmızı yay · platform', en: 'Reformer · 1 red spring · platform', es: 'Reformer · 1 muelle rojo · plataforma' },
  muscles: ['hamstrings', 'glutes', 'calves'],
  side: 'R',
  tempo: '2-4-2',
  hold: true, holdDur: 4,
  view: { yaw: 90, pitch: 6, zoom: 1.05 },
  alt: { yaw: 25, pitch: 10, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Kalçalar düz, ön diz ayakla aynı hizada', en: 'Hips square, front knee in line with the foot', es: 'Caderas niveladas, rodilla alineada con el pie' } },
  setupView: { yaw: 50, pitch: 16 },
  props: [['reformer', { springs: 1, platform: true, footbarX: BX, carriage: (sol) => sol.J.toeL[0] + 0.33 }]],
  ctx: CTX,
  contacts: ['heelR', 'kneeL', 'ankleL', 'handL', 'handR'],
  get poses() { return this._poses || (this._poses = fit(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'start',
  rep: [
    { to: 'push', dur: 2.0, phase: 0 },
    { to: 'hold', dur: 1.2, phase: 1 },
    { to: 'start', dur: 2.0, phase: 2 },
  ],
  tempoReps: 2,
  setup: { tr: 'Sağ ayak platformda, sol diz kızakta; ayak üstü pedde. Eller footbar\'da, sırt uzun. Sonra taraf değiştir.',
    en: 'Right foot on the platform, left knee on the carriage, top of the foot down. Hands on the footbar, long back. Then switch.',
    es: 'Pie derecho en la plataforma, rodilla izquierda en el carro. Manos en la barra, espalda larga. Luego cambia.' },
  phases: [
    { name: { tr: 'Kızağı geri it', en: 'Push back', es: 'Empuja atrás' }, breath: 'in',
      text: { tr: 'Arka dizle kızağı it, kalça geri gider. Ön diz uzar, sırt düz kalır.', en: 'Slide the carriage back with the back knee. The front knee straightens, back stays flat.', es: 'Desliza el carro con la rodilla de atrás. La delantera se estira, espalda plana.' } },
    { name: { tr: 'Parmakları kaldır, kal', en: 'Lift the toes, hold', es: 'Eleva los dedos, mantén' }, breath: 'easy', hold: 3, arc: ['hipR', 'kneeR', 'ankleR'],
      text: { tr: 'Topuk yerde, parmaklar yukarı. Kalçadan katlan, sakin nefes al.', en: 'Heel down, toes up. Fold from the hips and breathe easy.', es: 'Talón abajo, dedos arriba. Pliega desde la cadera y respira.' } },
    { name: { tr: 'Kontrollü dön', en: 'Return slowly', es: 'Vuelve despacio' }, breath: 'out',
      text: { tr: 'Ön dizi bükerek kızağı yavaşça geri getir.', en: 'Bend the front knee and bring the carriage in slowly.', es: 'Flexiona la rodilla delantera y trae el carro despacio.' } },
  ],
  tempoText: { tr: '2 sn it · 4 sn esnet · 2 sn dön', en: '2 s push · 4 s stretch · 2 s return', es: '2 s empuja · 4 s estira · 2 s vuelve' },
  mistakes: [
    { title: { tr: 'Sırt yuvarlanıyor', en: 'Back rounds', es: 'La espalda se redondea' },
      fix: { tr: 'Kalçadan katlan', en: 'Hinge from the hips', es: 'Pliega desde la cadera' },
      fixText: { tr: 'Göğüs öne uzar, bel düz kalır', en: 'Chest reaches forward, lower back stays flat', es: 'El pecho va adelante, lumbar plana' },
      at: 'hold', pose: { trunk: 52, hipR: 120, lumbar: 18, thoracic: 20, neck: 18 }, line: ['pelvis', 'waist', 'neck'], parts: ['waist', 'chest'] },
    { title: { tr: 'Kalça yana açılıyor', en: 'Pelvis twists open', es: 'La pelvis se abre' },
      fix: { tr: 'Kalçaları düz tut', en: 'Keep the hips square', es: 'Caderas cuadradas' },
      fixText: { tr: 'İki kalça kemiği footbar\'a baksın', en: 'Both hip bones face the footbar', es: 'Ambas crestas miran a la barra' },
      at: 'hold', pose: { twist: 0, roll: -6, hrotL: 26, abdL: 6 }, view: { yaw: 30, pitch: 12 }, line: ['hipL', 'hipR'], marks: ['hipL'], parts: ['pelvis'] },
  ],
  cues: [{ tr: 'Sırt uzun', en: 'Long back', es: 'Espalda larga' },
    { tr: 'Destek bacağı sabit', en: 'Support leg stable', es: 'Pierna de apoyo estable' },
    { tr: 'Topuk aşağı, parmaklar yukarı', en: 'Heel down, toes up', es: 'Talón abajo, dedos arriba' }],
};
}
