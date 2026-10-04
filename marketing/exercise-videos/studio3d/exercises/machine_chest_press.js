/* Seated machine chest press (chestPress prop: seat + backrest reclined 8°, lever arms from a pivot behind the
 * shoulders to neutral-grip handles that follow the hands). Pelvis anchored on the seat; hands use thorax-frame holds:
 * handles ~10 cm in front of the mid-chest (elbow ~90°, upper arm ~45° from the torso) -> arms nearly straight. */
{
const SEAT = { trunk: -8, hip: 79, knee: 85, abd: 10, hrot: 4, neck: 0, ground: [['pelvis', 0.45]], elbowPole: [-0.45, -0.6, 1] };
const H = (f, u, o, extra) => Object.assign({}, SEAT, { holdL: [f, u, o], holdR: [f, u, o] }, extra);
window.EXERCISE = {
  id: 'machine_chest_press',
  name: { tr: 'Makine Göğüs Press', en: 'Machine Chest Press', es: 'Press de pecho en máquina' },
  category: { tr: 'Göğüs · Kol', en: 'Chest · Arms', es: 'Pecho · Brazos' },
  equipmentLabel: { tr: 'Chest press makinesi', en: 'Chest press machine', es: 'Máquina de press de pecho' },
  muscles: ['chest', 'delts', 'triceps'],
  tempo: '1.5-0-2',
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 30, pitch: 10, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' }, text: { tr: 'Dirsekler gövdeye ~45°', en: 'Elbows ~45° from the torso', es: 'Codos a ~45° del torso' } },
  props: [['chestPress', { at: [0.09, 0, 0], seatH: 0.45, back: 8 }]],
  ctx: { anchorX: ['pelvis'], anchorAt: [0, 0], plant: ['ankleL', 'ankleR'] },
  poses: {
    start: H(0.32, -0.03, 0.31),
    end: H(0.61, -0.03, 0.18),
  },
  rest: 'start',
  rep: [
    { to: 'end', dur: 1.5, phase: 0 },
    { to: 'start', dur: 2.0, phase: 1 },
  ],
  setup: { tr: 'Koltuğu tutamaçlar göğsün ortasına gelecek şekilde ayarla. Sırt pedde, ayaklar yerde.',
    en: 'Set the seat so the handles line up with mid-chest. Back on the pad, feet flat.',
    es: 'Ajusta el asiento: asas a mitad del pecho. Espalda en el respaldo, pies en el suelo.' },
  phases: [
    { name: { tr: 'İtiş', en: 'Press', es: 'Empuja' }, breath: 'out',
      text: { tr: 'Tutamaçları düz ileri it, kollar neredeyse düzleşsin. Omuzlar aşağıda.', en: 'Push the handles straight forward until the arms are nearly straight. Shoulders down.', es: 'Empuja al frente hasta casi estirar los brazos. Hombros abajo.' } },
    { name: { tr: 'Geri dön', en: 'Return', es: 'Vuelve' }, breath: 'in', arc: ['shoulderR', 'elbowR', 'wristR'],
      text: { tr: 'Dirsekler 90° olana kadar yavaşça geri gel. Ağırlıkları çarptırma.', en: 'Come back slowly until the elbows reach 90°. Do not let the stack touch down.', es: 'Vuelve despacio hasta 90° de codo. Sin dejar caer la pila.' } },
  ],
  tempoText: { tr: '1,5 sn it · 2 sn dön', en: '1.5 s press · 2 s return', es: '1,5 s empuja · 2 s vuelve' },
  mistakes: [
    { title: { tr: 'Sırt pedden kalkıyor', en: 'Back leaves the pad', es: 'La espalda se despega' },
      fix: { tr: 'Sırtı pedde tut', en: 'Keep the back on the pad', es: 'Espalda en el respaldo' },
      fixText: { tr: 'Gerekirse ağırlığı azalt', en: 'Lower the weight if needed', es: 'Baja el peso si hace falta' },
      at: 'end', pose: { trunk: 6, lumbar: -16, hip: 70, holdL: [0.6, -0.08, 0.17], holdR: [0.6, -0.08, 0.17] }, line: ['pelvis', 'waist', 'neck'], parts: ['waist', 'chest'] },
    { title: { tr: 'Omuzlar kulağa kalkıyor', en: 'Shoulders shrug', es: 'Hombros encogidos' },
      fix: { tr: 'Omuzları aşağı çek', en: 'Pull the shoulders down', es: 'Hombros abajo' },
      fixText: { tr: 'Boyun uzun, kürek kemikleri geride', en: 'Long neck, shoulder blades back', es: 'Cuello largo, escápulas atrás' },
      at: 'end', pose: { shrug: 0.055, protract: 0.04, holdL: [0.64, 0.03, 0.17], holdR: [0.64, 0.03, 0.17] }, view: { yaw: 30, pitch: 10 }, marks: ['shoulderL', 'shoulderR'], parts: ['upper', 'neck'] },
  ],
  cues: [{ tr: 'Sırt pedde', en: 'Back on the pad', es: 'Espalda apoyada' }, { tr: 'Omuzlar aşağıda', en: 'Shoulders down', es: 'Hombros abajo' }, { tr: 'Kontrollü dönüş', en: 'Controlled return', es: 'Vuelta controlada' }],
};
}
