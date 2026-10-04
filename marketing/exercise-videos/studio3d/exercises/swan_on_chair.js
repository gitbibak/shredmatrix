/* Wunda Chair Swan. Lying prone with the hips on the front of the seat, legs long behind, chest out over the front edge and
 * both hands flat on the pedal below the shoulders (pedal pressed down). Pump: the elbows bend ~60° and the chest lifts a
 * little as the pedal rises ~15 cm; Lift: the arms straighten and the spine extends (~20°) as the pedal rises to the top;
 * then she lowers back to the start, pressing the pedal down under control.
 * - Body yaw 180 (head toward the pedal, -x); pelvis resting on the seat (ground pelvis at the seat top), anchored.
 * - Hands: per pose the shoulder angle is solved so the hand (at the pose's elbow angle) lies on the pedal pad circle
 *   around the hinge, then pinned there (world IK, flat hands). `_swanChair` draws the chair and puts the pedal pad under the right hand every frame (follow).
 * - Side view from her right (camera at -z). */
{
const CH = [0.45, 0, 0], SEAT = 0.68, HINGE = [CH[0] - 0.32, 0.08], RP = 0.42, PADR = 0.03, D2R = Math.PI / 180;
const CPALM = PADR + 0.022;
// Wunda chair drawn like the engine's wundaChair, but the pedal end is placed right under the contact point every frame
// (angle AND length from the hinge, contact = pad top), so the hand/foot never leaves the pad, also between keys.
const padPt = (a, c) => [HINGE[0] - RP * Math.cos(a * D2R), HINGE[1] + RP * Math.sin(a * D2R) + c];
FB.PROPS._swanChair = (sol) => {
  const { V } = FB, c = CH, H = 0.62, D = 0.6, W = 0.6, q = sol.J.handR;
  const out = [{ t: 'box', c: V.add(c, [0, H / 2, 0]), s: [D, H, W], m: 'woodLight', round: 0.02 }, { t: 'box', c: V.add(c, [0, H + 0.03, 0]), s: [D, 0.06, W], m: 'pad', round: 0.02 }];
  const hinge = [HINGE[0], HINGE[1], 0], dx = Math.max(0.03, HINGE[0] - q[0]), dy = Math.max(0.02, q[1] - (CPALM) - HINGE[1]);
  const a = Math.atan2(dy, dx), L = Math.hypot(dx, dy), end = V.add(hinge, [-Math.cos(a) * L, Math.sin(a) * L, 0]);
  out.push({ t: 'cyl', a: V.add(hinge, [0, 0, -W / 2 + 0.05]), b: V.add(hinge, [0, 0, W / 2 - 0.05]), r: 0.02, m: 'chrome' });
  out.push({ t: 'cyl', a: V.add(end, [0, 0, -W / 2 + 0.05]), b: V.add(end, [0, 0, W / 2 - 0.05]), r: 0.03, m: 'pad' });
  for (const sz of [-W / 2 + 0.05, W / 2 - 0.05]) out.push({ t: 'cyl', a: V.add(hinge, [0, 0, sz]), b: V.add(end, [0, 0, sz]), r: 0.014, m: 'chrome' });
  return out;
};

const CTX = { anchorX: ['pelvis'], anchorAt: [CH[0] - 0.24, 0] };
const BASE = { yaw: 180, trunk: 90, ground: [['pelvis', SEAT]], hip: 0, knee: 2, abd: 2, flat: false, ankle: -40, lumbar: 0, thoracic: 0, neck: 8,
  sh: 90, shAbd: 10, el: 3, handFlat: true, elbowPole: [-0.3, -0.2, 1], noAvoid: true };
const P = (o) => Object.assign({}, BASE, o);
const RAW = {
  down: P({ sh: 88, el: 5 }),
  pump: P({ sh: 70, el: 50, lumbar: -4, thoracic: -6, neck: 2 }),
  lift: P({ sh: 64, el: 12, lumbar: -12, thoracic: -20, neck: -6 }),
};
function fit(poses, extra) {
  const { V, solve, expand } = FB;
  const go = (p) => {
    // shoulder flexion scanned so the flat palm (5 cm ahead of / 2 cm below the FK wrist, fingers forward) lies on the pad circle
    const at = (sh) => solve(expand(Object.assign({}, p, { sh, ik: undefined, handFlat: false })), CTX).J;
    let best = null;
    for (let sh = -10; sh <= 160; sh += 0.25) {
      const w = at(sh).wristR, h = [w[0] - 0.051, w[1] - 0.02, w[2]], e = Math.abs(Math.hypot(h[0] - HINGE[0], h[1] - CPALM - HINGE[1]) - RP);
      if (h[0] < HINGE[0] - 0.03 && h[1] > HINGE[1] + CPALM && (!best || e < best.e)) best = { sh, e, h };
    }
    p.sh = best.sh; p._err = +best.e.toFixed(4);
    const h = best.h, ik = {};
    for (const s of ['L', 'R']) ik['hand' + s] = { at: [h[0], h[1], s === 'R' ? -0.19 : 0.19] };
    p.ik = ik; p.handSurface = h[1] - 0.022;
    p._ped = +(Math.atan2(h[1] - CPALM - HINGE[1], HINGE[0] - h[0]) / D2R).toFixed(1);
  };
  for (const k in poses) go(poses[k]);
  for (const [at, pose] of extra) { const m = Object.assign({}, poses[at], pose); go(m); Object.assign(pose, { sh: m.sh, ik: m.ik, handSurface: m.handSurface }); }
  return poses;
}

window.EXERCISE = {
  id: 'swan_on_chair',
  name: { tr: 'Chair\'de Swan', en: 'Swan on Chair', es: 'Cisne en la silla' },
  category: { tr: 'Wunda Chair · Sırt', en: 'Wunda Chair · Back', es: 'Wunda Chair · Espalda' },
  equipmentLabel: { tr: 'Wunda chair · orta yay', en: 'Wunda chair · medium spring', es: 'Wunda chair · muelle medio' },
  muscles: ['lowerback', 'upperback', 'triceps', 'glutes', 'core'],
  tempo: '1.5-1.5-2',
  view: { yaw: -90, pitch: 6, zoom: 1.0 },
  alt: { yaw: -140, pitch: 14, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Göğüs öne ve yukarı, boyun uzun', en: 'Chest forward and up, long neck', es: 'Pecho adelante y arriba, cuello largo' } },
  setupView: { yaw: -130, pitch: 18 },
  props: [['_swanChair', {}]],
  ctx: CTX,
  contacts: ['pelvis', 'handL', 'handR'],
  get poses() { return this._poses || (this._poses = fit(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'down',
  rep: [
    { to: 'pump', dur: 1.5, phase: 0 },
    { to: 'lift', dur: 1.5, phase: 1 },
    { to: 'down', dur: 2.0, phase: 2 },
  ],
  setup: { tr: 'Kalçalar oturağın ön kenarında, bacaklar uzun. Eller omuz altında pedalda, pedal aşağıda.',
    en: 'Hips on the front of the seat, legs long. Hands on the pedal under the shoulders, pedal down.',
    es: 'Cadera al borde del asiento, piernas largas. Manos en el pedal bajo los hombros, pedal abajo.' },
  phases: [
    { name: { tr: 'Dirsekleri bük', en: 'Bend the elbows', es: 'Flexiona los codos' }, breath: 'out',
      text: { tr: 'Dirsekler geriye bükülür, pedal biraz kalkar. Göğüs hafifçe öne uzar.', en: 'Elbows bend back, the pedal rises a little. The chest reaches slightly forward.', es: 'Los codos se doblan atrás, el pedal sube un poco. El pecho se alarga.' } },
    { name: { tr: 'Göğsü kaldır', en: 'Lift the chest', es: 'Eleva el pecho' }, breath: 'out', line: ['pelvis', 'waist', 'neck', 'head'],
      text: { tr: 'Kollar uzar, omurga uzun bir yayla uzanır; pedal tepeye kalkar.', en: 'The arms straighten and the spine extends in a long arc; the pedal rises to the top.', es: 'Los brazos se estiran y la columna se extiende en arco largo; el pedal sube.' } },
    { name: { tr: 'Kontrollü in', en: 'Lower with control', es: 'Baja con control' }, breath: 'in',
      text: { tr: 'Göğsü indirirken pedalı yavaşça aşağı bastır.', en: 'Lower the chest and press the pedal down slowly.', es: 'Baja el pecho y presiona el pedal despacio.' } },
  ],
  tempoText: { tr: '1,5 sn bük · 1,5 sn kaldır · 2 sn in', en: '1.5 s bend · 1.5 s lift · 2 s lower', es: '1,5 s flexiona · 1,5 s eleva · 2 s baja' },
  mistakes: [
    { title: { tr: 'Pedal kontrolsüz kalkıyor', en: 'Pedal slams up', es: 'El pedal sube de golpe' },
      fix: { tr: 'Pedalı kontrol et', en: 'Control the pedal', es: 'Controla el pedal' },
      fixText: { tr: 'Kollar yayı tutar, göğüs çökmeden yükselir', en: 'The arms hold the spring, the chest rises without collapsing', es: 'Los brazos sostienen el muelle, el pecho no se hunde' },
      at: 'pump', pose: { sh: 40, el: 115, shrug: 0.045, lumbar: 4, thoracic: 10, neck: 22 }, line: ['shoulderR', 'elbowR', 'handR'], marks: ['handR'], parts: ['upperR', 'foreR', 'neck'] },
    { title: { tr: 'Boyun geriye kırılıyor', en: 'Neck cranks back', es: 'El cuello se quiebra atrás' },
      fix: { tr: 'Boyun uzun', en: 'Long neck', es: 'Cuello largo' },
      fixText: { tr: 'Bakış öne-aşağı, baş omurganın devamı', en: 'Gaze forward-down, head continues the spine', es: 'Mirada al frente-abajo, cabeza alineada' },
      at: 'lift', pose: { neck: -38, lumbar: -14, thoracic: -8 }, line: ['neck', 'head'], marks: ['head'], parts: ['neck', 'waist'] },
  ],
  cues: [{ tr: 'Karın içeride', en: 'Core engaged', es: 'Core activo' },
    { tr: 'Pedalı kontrol et', en: 'Control the pedal', es: 'Controla el pedal' },
    { tr: 'Omuzlar kulaktan uzak', en: 'Shoulders away from the ears', es: 'Hombros lejos de las orejas' }],
};
}
