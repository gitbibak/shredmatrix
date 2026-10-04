/* Dumbbell floor press. Supine on a mat, knees bent, feet planted. Contacts [shoulderR, heelR] like glute_bridge.js
 * (upper-back contact 4.5 cm up, thoracic 10 / lumbar -4 so the spine joints clear the floor check).
 * Dumbbells use thorax-frame hold targets: lockout over the mid-chest -> upper arms resting on the floor ~45° from the
 * torso with the forearms vertical. */
{
const MAT = 0.012;
const G = [['shoulderR', MAT + 0.045], ['heelR', MAT]];
const BASE = { trunk: -90, hip: 55, knee: 110, abd: 6, thoracic: 10, lumbar: -4, neck: -8, ground: G, elbowPole: [-0.3, -0.75, 0.6] };
const HOLD = (f, u, s, extra) => Object.assign({}, BASE, { holdL: [f, u, s], holdR: [f, u, s] }, extra);
window.EXERCISE = {
  id: 'dumbbell_floor_press',
  name: { tr: 'Dumbbell Floor Press', en: 'Dumbbell Floor Press', es: 'Press de suelo con mancuernas' },
  category: { tr: 'Göğüs · Kol', en: 'Chest · Arms', es: 'Pecho · Brazos' },
  equipmentLabel: { tr: 'Dambıl · Mat', en: 'Dumbbells · Mat', es: 'Mancuernas · Esterilla' },
  muscles: ['chest', 'triceps', 'delts'],
  tempo: '2-1-1',
  view: { yaw: 28, pitch: 34, zoom: 1.1 },
  alt: { yaw: 90, pitch: 8, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' }, text: { tr: 'Ön kollar dik, dambıllar göğsün üstüne', en: 'Forearms vertical, press over the chest', es: 'Antebrazos verticales, empuja sobre el pecho' } },
  props: [['mat', { at: [-0.35, 0.006, 0], length: 1.85 }], ['dumbbell', { grip: 'pronated' }]],
  ctx: { anchorX: ['ankleL', 'ankleR'], anchorAt: [0.3, 0], plant: ['ankleL', 'ankleR'] },
  poses: {
    top: HOLD(0.6, 0.02, 0.22),
    bottom: HOLD(0.265, -0.06, 0.37),
  },
  rest: 'top',
  rep: [
    { to: 'bottom', dur: 2.0, phase: 0 },
    { to: 'bottom', dur: 1.0, phase: 1 },
    { to: 'top', dur: 1.0, phase: 2 },
  ],
  setup: { tr: 'Sırtüstü yat, dizler bükülü, ayaklar yerde. Dambıllar göğsün üstünde, kollar dik.',
    en: 'Lie on your back, knees bent, feet flat. Dumbbells over the chest, arms straight.',
    es: 'Túmbate boca arriba, rodillas flexionadas. Mancuernas sobre el pecho, brazos rectos.' },
  phases: [
    { name: { tr: 'İniş', en: 'Lower', es: 'Baja' }, breath: 'in',
      text: { tr: 'Üst kollar yere değene kadar indir. Dirsekler gövdeye ~45°.', en: 'Lower until the upper arms touch the floor. Elbows ~45° from the torso.', es: 'Baja hasta que los brazos toquen el suelo. Codos a ~45° del torso.' } },
    { name: { tr: 'Yerde dur', en: 'Pause', es: 'Pausa' }, breath: 'hold', arc: ['shoulderR', 'elbowR', 'wristR'], line: ['elbowR', 'wristR'],
      text: { tr: 'Dirsekler yere hafifçe değer, 1 saniye dur. Sekme yok.', en: 'Elbows rest lightly on the floor for 1 second. No bounce.', es: 'Codos apoyados suave 1 segundo. Sin rebote.' } },
    { name: { tr: 'İtiş', en: 'Press', es: 'Empuja' }, breath: 'out',
      text: { tr: 'Dambılları göğsün üstüne doğru it, kollar düzleşsin.', en: 'Press the bells up over the chest until the arms are straight.', es: 'Empuja sobre el pecho hasta estirar los brazos.' } },
  ],
  tempoText: { tr: '2 sn in · 1 sn dur · 1 sn it', en: '2 s down · 1 s pause · 1 s up', es: '2 s abajo · 1 s pausa · 1 s arriba' },
  mistakes: [
    { title: { tr: 'Dirsekler 90° açılıyor', en: 'Elbows flare to 90°', es: 'Codos abiertos a 90°' },
      fix: { tr: 'Dirsekleri ~45° topla', en: 'Tuck the elbows to ~45°', es: 'Cierra los codos a ~45°' },
      fixText: { tr: 'Omuzlar korunur, göğüs çalışır', en: 'Spares the shoulders, loads the chest', es: 'Cuida los hombros y trabaja el pecho' },
      at: 'bottom', pose: { holdL: [0.265, 0.07, 0.43], holdR: [0.265, 0.07, 0.43], elbowPole: [-0.3, -0.1, 1] }, marks: ['elbowL', 'elbowR'], parts: ['upperR', 'upperL'] },
    { title: { tr: 'Bel kavisleniyor', en: 'Lower back arches', es: 'La zona lumbar se arquea' },
      fix: { tr: 'Beli yere yakın tut', en: 'Keep the low back down', es: 'Mantén la zona lumbar abajo' },
      fixText: { tr: 'Ayaklar yerde, karın sıkı', en: 'Feet flat, abs braced', es: 'Pies en el suelo, abdomen firme' },
      at: 'bottom', pose: { lumbar: -22, hip: 62 }, view: { yaw: 90, pitch: 8 }, marks: ['waist'], parts: ['waist', 'pelvis'] },
  ],
  cues: [{ tr: 'Dirsekler yere hafifçe', en: 'Elbows touch lightly', es: 'Codos tocan suave' }, { tr: 'Dur, sekme', en: 'Pause, no bounce', es: 'Pausa, sin rebote' }, { tr: 'Bilekler düz', en: 'Wrists straight', es: 'Muñecas rectas' }],
};
}
