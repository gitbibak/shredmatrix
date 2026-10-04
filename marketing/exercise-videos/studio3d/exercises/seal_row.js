/* Seal row (strength_pull). Face down on a high, narrow flat bench, arms hanging straight on both sides of it, the bar
 * under the bench; row until the bar touches the steel rail under the pad (local prop `_sealRail`). Body contacts: pelvis + knees on the pad (the
 * torso is FK from the hips, so the "head up / arched back" mistake lifts the chest off the pad while the legs stay).
 * Bar: barbell prop between world IK hand targets built lazily from the solved shoulders (rig dimensions).
 * Bench 0.75 m, plates r 0.225: the plates hang ~4 cm above the floor at the bottom.
 * Spec: trunk 90, elbow 0 -> 100-105, elbows flared 60-75° from the torso. */
{
const { V } = FB;
const H = 0.75, Z = 0.235, CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };
const BODY = { trunk: 90, hip: 4, knee: 0, ankle: -85, flat: false, neck: 4, shAbd: 10, ground: [['pelvis', H], ['kneeR', H]], elbowPole: [-1, -0.05, 1.1] };
const startB = Object.assign({}, BODY, { protract: 0.05 });
const topB = Object.assign({}, BODY, { protract: -0.04 });
const archB = Object.assign({}, topB, { lumbar: -12, thoracic: -6, neck: -34 });
const shrugB = Object.assign({}, topB, { shrug: 0.06, neck: 10 });
const bar = (pose, kind) => {
  const s = FB.solve(FB.expand(pose), CTX), sh = V.lerp(s.J.shoulderL, s.J.shoulderR, 0.5);
  const x = +(sh[0] - 0.03).toFixed(3), y = kind === 'hang' ? +(sh[1] - 0.552).toFixed(3) : +(H - 0.09 - 0.06 - 0.016).toFixed(3);
  return { handL: { at: [x, y, -Z] }, handR: { at: [x, y, Z] } };
};
// steel rail under the pad (the bar touches it at the top)
FB.PROPS._sealRail = () => [{ t: 'box', c: [-0.15, H - 0.09 - 0.03, 0], s: [1.5, 0.06, 0.12], m: 'frame' }];
let _lazy = null;
const lazy = () => _lazy || (_lazy = {
  poses: { start: Object.assign({}, startB, { ik: bar(startB, 'hang') }), top: Object.assign({}, topB, { ik: bar(topB, 'top') }) },
  mistakes: [
    { title: { tr: 'Baş kalkıyor, bel çukurlaşıyor', en: 'Head up, lower back arching', es: 'Cabeza arriba, lumbar arqueada' },
      fix: { tr: 'Çene aşağı, gövde düz', en: 'Chin down, body flat', es: 'Barbilla abajo, cuerpo plano' },
      fixText: { tr: 'Göğüs pedde kalır, sadece kollar ve kürek kemikleri hareket eder', en: 'Chest stays on the pad; only arms and shoulder blades move', es: 'Pecho en el banco; solo brazos y escápulas' },
      at: 'top', pose: Object.assign({}, archB, { ik: bar(topB, 'top') }), line: ['pelvis', 'waist', 'head'], goodLine: ['pelvis', 'head'], parts: ['waist', 'chest', 'neck'] },
    { title: { tr: 'Omuzlar kulağa kalkıyor', en: 'Shrugging up', es: 'Encoger los hombros' },
      fix: { tr: 'Omuzları kalçaya doğru çek', en: 'Shoulders down toward the hips', es: 'Hombros hacia la cadera' },
      fixText: { tr: 'Önce kürek kemiklerini indir, sonra çek', en: 'Set the shoulder blades down, then pull', es: 'Baja las escápulas y luego tira' },
      at: 'top', pose: Object.assign({}, shrugB, { ik: bar(topB, 'top') }), view: { yaw: 40, pitch: 30 }, marks: ['shoulderL', 'shoulderR'], parts: ['upper', 'neck'] },
  ],
});

window.EXERCISE = {
  id: 'seal_row',
  name: { tr: 'Seal Row', en: 'Seal Row', es: 'Remo foca (Seal Row)' },
  category: { tr: 'Sırt', en: 'Back', es: 'Espalda' },
  equipmentLabel: { tr: 'Barbell · Yüksek bench', en: 'Barbell · High bench', es: 'Barra · Banco alto' },
  muscles: ['lats', 'upperback', 'delts', 'biceps'],
  tempo: '1-1-2',
  view: { yaw: 90, pitch: 8 },
  alt: { yaw: 36, pitch: 22, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Bar benchin altına değer, dirsekler yana açık', en: 'Bar touches under the bench, elbows out', es: 'La barra toca bajo el banco, codos afuera' } },
  props: [['_sealRail'], ['bench', { at: [-0.28, 0, 0], length: 1.9, width: 0.26, height: H }], ['barbell', { grip: 'pronated' }]],
  ctx: CTX,
  get poses() { return lazy().poses; },
  rest: 'start',
  rep: [
    { to: 'top', dur: 1.2, phase: 0 },
    { to: 'top', dur: 1.0, phase: 1 },
    { to: 'start', dur: 2.0, phase: 2 },
  ],
  setup: { tr: 'Yüksek bench’e yüzüstü uzan, çene ön uçta. Kollar benchin iki yanından sarkar, barı üstten tut.',
    en: 'Lie face down on a high bench, chin at the front edge. Arms hang either side, overhand grip.',
    es: 'Boca abajo en un banco alto, barbilla en el borde. Brazos colgando, agarre prono.' },
  phases: [
    { name: { tr: 'Çek', en: 'Row', es: 'Tira' }, breath: 'out', line: ['pelvis', 'head'],
      text: { tr: 'Barı benchin altına değene kadar çek. Vücut düz kalır.', en: 'Pull until the bar touches under the bench. Body stays flat.', es: 'Tira hasta tocar bajo el banco. Cuerpo plano.' } },
    { name: { tr: 'Sık', en: 'Squeeze', es: 'Aprieta' }, breath: 'hold', marks: [{ type: 'mark', joint: 'elbowR' }],
      text: { tr: 'Bir saniye kürek kemiklerini sık.', en: 'Squeeze the shoulder blades for a second.', es: 'Junta las escápulas un segundo.' } },
    { name: { tr: 'Kontrollü indir', en: 'Control down', es: 'Baja controlado' }, breath: 'in', line: ['pelvis', 'head'],
      text: { tr: 'Kollar düzleşene kadar indir, plakalar yere değmez.', en: 'Lower until the arms are straight; plates never touch the floor.', es: 'Baja hasta estirar; los discos no tocan el suelo.' } },
  ],
  tempoText: { tr: '1 sn çek · 1 sn sık · 2 sn indir', en: '1 s row · 1 s squeeze · 2 s lower', es: '1 s tira · 1 s aprieta · 2 s baja' },
  get mistakes() { return lazy().mistakes; },
  cues: [{ tr: 'Bara benche çek', en: 'Pull to the bench', es: 'Tira hacia el banco' },
    { tr: 'Kürek kemiklerini sık', en: 'Squeeze the shoulder blades', es: 'Junta las escápulas' },
    { tr: 'Bel çukurlaşmasın', en: 'Do not arch', es: 'No arquees' }],
};
}
