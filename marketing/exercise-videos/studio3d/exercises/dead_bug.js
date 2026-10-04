// Dead bug. Supine (trunk -90) on two ground contacts [pelvis, waist] like the_hundred, so the lower back stays pressed
// into the mat; head resting (neck solved so the head sits on the mat). Opposite arm and leg lower to hover above the mat,
// both sides shown (right arm + left leg, then left arm + right leg).
const MAT = 0.008;
const G = [['pelvis', MAT], ['waist', MAT - 0.012]];
const TOP = { trunk: -90, lumbar: 2, thoracic: 4, neck: 6, hip: 90, knee: 90, ankle: 0, flat: false, abd: 4,
  sh: 90, shAbd: 4, el: 0, palm: 'in', curl: 0.35, ground: G };
const EXT = (arm, leg) => Object.assign({}, TOP, { ['sh' + arm]: 172, ['shAbd' + arm]: 8, ['hip' + leg]: 2, ['knee' + leg]: 5, ['ankle' + leg]: -20 });

window.EXERCISE = {
  id: 'dead_bug',
  name: { tr: 'Dead Bug', en: 'Dead Bug', es: 'Dead bug (bicho muerto)' },
  category: { tr: 'Karın · Core', en: 'Core', es: 'Core' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['core', 'obliques'],
  tempo: '2-0-2',
  tempoReps: 1,
  view: { yaw: 90, pitch: 8, zoom: 1.05 },
  alt: { yaw: 50, pitch: 26, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' },
    text: { tr: 'Çapraz eşleşme: sağ kol, sol bacak', en: 'Opposite pairing: right arm, left leg', es: 'Pareja cruzada: brazo derecho, pierna izquierda' } },
  setupView: { yaw: 45, pitch: 20 },
  setupMarks: [{ type: 'aline', joints: ['hipR', 'kneeR'] }, { type: 'aline', joints: ['shoulderR', 'wristR'] }],
  contacts: ['pelvis', 'waist', 'head'],
  props: [['mat', { at: [0.1, 0.004, 0], length: 1.9 }]],
  ctx: { anchorX: ['pelvis'], anchorAt: [0, 0] },
  poses: { top: TOP, extR: EXT('R', 'L'), extL: EXT('L', 'R') },
  rest: 'top',
  rep: [
    { to: 'extR', dur: 2.0, phase: 0 },
    { to: 'top', dur: 2.0, phase: 1 },
    { to: 'extL', dur: 2.0, phase: 2 },
    { to: 'top', dur: 2.0, phase: 1 },
  ],
  setup: { tr: 'Sırtüstü yat. Kollar omuzların üstünde dik, kalça ve dizler 90°. Beli mata bastır.',
    en: 'Lie on your back. Arms straight up over the shoulders, hips and knees at 90°. Press the lower back down.',
    es: 'Boca arriba. Brazos rectos sobre los hombros, cadera y rodillas a 90°. Pega la lumbar al suelo.' },
  phases: [
    { name: { tr: 'Sağ kol, sol bacak', en: 'Right arm, left leg', es: 'Brazo derecho, pierna izquierda' }, breath: 'out', line: ['pelvis', 'waist', 'neck'],
      text: { tr: 'Sağ kolu başın arkasına, sol bacağı öne uzat. Yere değmeden dur.', en: 'Lower the right arm overhead and extend the left leg. Stop just above the floor.', es: 'Baja el brazo derecho atrás y estira la pierna izquierda. Para sin tocar el suelo.' } },
    { name: { tr: 'Başlangıca dön', en: 'Back to start', es: 'Vuelve al inicio' }, breath: 'in',
      text: { tr: 'Kol ve bacağı yavaşça 90° pozisyonuna geri getir. Bel mattan kalkmaz.', en: 'Slowly bring the arm and leg back to 90°. The lower back stays down.', es: 'Vuelve despacio a 90°. La lumbar no se despega.' } },
    { name: { tr: 'Sol kol, sağ bacak', en: 'Left arm, right leg', es: 'Brazo izquierdo, pierna derecha' }, breath: 'out',
      text: { tr: 'Şimdi diğer taraf: sol kol geriye, sağ bacak öne.', en: 'Now the other side: left arm back, right leg out.', es: 'Ahora el otro lado: brazo izquierdo atrás, pierna derecha adelante.' } },
  ],
  tempoText: { tr: '2 sn uzat · 2 sn dön · taraf değiştir', en: '2 s extend · 2 s return · alternate', es: '2 s extiende · 2 s vuelve · alterna' },
  mistakes: [
    { title: { tr: 'Bel mattan kalkıyor', en: 'Lower back arches', es: 'La lumbar se arquea' },
      fix: { tr: 'Hareketi kısalt, karnı sık', en: 'Shorten the range, brace', es: 'Reduce el rango, aprieta el abdomen' },
      fixText: { tr: 'Bel mata yapışık kaldığı kadar uzat', en: 'Only go as far as the back stays down', es: 'Solo hasta donde la lumbar siga abajo' },
      at: 'extR', pose: { lumbar: -16, thoracic: -16, hipL: 31, hipR: 122, shR: 160, ground: [['pelvis', MAT], ['waist', MAT + 0.027]] }, marks: ['waist'], parts: ['waist', 'pelvis'] },
    { title: { tr: 'Aynı taraf kol ve bacak', en: 'Same-side arm and leg', es: 'Brazo y pierna del mismo lado' },
      fix: { tr: 'Çapraz çalış', en: 'Work opposite limbs', es: 'Trabaja en cruz' },
      fixText: { tr: 'Sağ kol giderken sol bacak gider', en: 'Right arm goes with the left leg', es: 'Brazo derecho con pierna izquierda' },
      at: 'extR', pose: { shR: 90, shAbdR: 4, shL: 168, shAbdL: 8 }, view: { yaw: 50, pitch: 26 }, marks: ['handL', 'ankleL'], parts: ['upperL', 'foreL', 'thighL', 'shinL'] },
  ],
  cues: [{ tr: 'Beli mata bastır', en: 'Press the lower back down', es: 'Lumbar contra el suelo' },
    { tr: 'Çapraz kol ve bacak', en: 'Opposite arm and leg', es: 'Brazo y pierna opuestos' },
    { tr: 'Yavaş, kaburgalar aşağıda', en: 'Slow, ribs down', es: 'Lento, costillas abajo' }],
};
