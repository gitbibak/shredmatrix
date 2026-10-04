/* Arm Circles with light weights (Pilates mat, standing). Front view.
 * Arms out to the sides at shoulder height (abduction 90), palms down, elbows soft (~10°), light dumbbells.
 * Hands are body-relative IK targets (holdL/holdR, thorax frame [fwd, up, outward]) so the circles are exact: centre C at
 * shoulder height and ~0.71 m out (soft elbows), keys on a 15 cm circle (top / front / bottom / back). The monotone spline
 * through the four keys gives a round path (each axis has zero speed exactly at its own extreme). One circle per second.
 * Rep = 3 forward circles (card on the first key, the rest are in-between keys `card: false`) + 3 backward circles.
 * FK arm params (shAbd 90, el 10) are kept close to the IK result so nothing jumps between keys.
 * Elbow pole points up/back: with the neutral dumbbell grip the palm faces along the elbow-bend direction, so this is what
 * turns the palms DOWN (fingers over the handle, thumb under). */
{
const R = 0.075;                    // circle radius (15 cm diameter)
const CX = 0.022, CU = 0.105, CO = 0.7265;   // centre in line with the shoulder (rig: shoulder at [0.022, 0.110, 0.168] from the chest)
const H = (f, u) => [CX + f, CU + u, CO - (f * f + u * u) / 1.12];   // keys on a sphere about the shoulder: same elbow bend all round
const BASE = { trunk: 0, hip: 0, knee: 5, abd: 3, neck: 0, sh: 0, shAbd: 90, el: 10,
  elbowPole: [-0.25, 1, 0], ground: [['heelR', 0]], flat: true };
const P = (f, u) => ({ ...BASE, holdL: H(f, u), holdR: H(f, u) });
const POSES = { c: P(0, 0), top: P(0, R), front: P(R, 0), bot: P(0, -R), back: P(-R, 0) };
const CF = (to, phase, dur = 0.25) => ({ to, dur, phase, card: false });
const FWD = ['front', 'bot', 'back', 'top'], BWD = ['back', 'bot', 'front', 'top'];
const loop = (seq, phase, n) => { const out = []; for (let i = 0; i < n; i++) for (const k of seq) out.push(CF(k, phase)); return out; };

window.EXERCISE = {
  id: 'arm_circles',
  name: { tr: 'Kol Daireleri', en: 'Arm Circles', es: 'Círculos de brazos' },
  category: { tr: 'Pilates · Omuz', en: 'Pilates · Shoulders', es: 'Pilates · Hombros' },
  equipmentLabel: { tr: 'Hafif dambıl (0,5-1,5 kg)', en: 'Light dumbbells (0.5-1.5 kg)', es: 'Mancuernas ligeras (0,5-1,5 kg)' },
  muscles: ['delts', 'upperback', 'core'],
  tempo: '1 tur/sn',
  tempoReps: 1,
  repLabel: { tr: 'SET', en: 'SET', es: 'SERIE' },
  view: { yaw: 0, pitch: 6 },
  alt: { yaw: 90, pitch: 6, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
    text: { tr: 'Gövde dik ve sabit, kaburgalar içeride', en: 'Torso tall and still, ribs knit', es: 'Torso erguido y quieto, costillas dentro' } },
  setupView: { yaw: 30, pitch: 10 },
  setupMarks: [{ type: 'aline', joints: ['handL', 'shoulderL', 'shoulderR', 'handR'] }],
  contacts: ['heelR', 'ballR', 'heelL', 'ballL'],
  props: [['dumbbell', { grip: 'neutral', len: 0.2, headR: 0.035 }], ['mat', { at: [0.05, 0, 0], length: 0.8, width: 1.0 }]],
  ctx: { anchorX: ['ankleL', 'ankleR'] },
  poses: POSES,
  rest: 'c',
  rep: [
    { to: 'top', dur: 0.4, phase: 0 }, ...loop(FWD, 0, 3), CF('c', 0, 0.4),
    { to: 'top', dur: 0.4, phase: 1 }, ...loop(BWD, 1, 3), CF('c', 1, 0.4),
  ],
  setup: { tr: 'Dik dur, ayaklar kalça genişliğinde. Kollar yanda omuz hizasında, avuçlar aşağı, dirsekler yumuşak.',
    en: 'Stand tall, feet hip-width. Arms out at shoulder height, palms down, elbows soft.',
    es: 'De pie, pies al ancho de cadera. Brazos a la altura de los hombros, palmas abajo, codos suaves.' },
  phases: [
    { name: { tr: 'İleri daireler', en: 'Circle forward', es: 'Círculos adelante' }, breath: 'easy', hold: 3.2,
      text: { tr: 'Omuzdan küçük, kontrollü daireler çiz. Omuzlar aşağıda, gövde sabit.', en: 'Draw small, controlled circles from the shoulder. Shoulders down, torso still.', es: 'Dibuja círculos pequeños desde el hombro. Hombros abajo, torso quieto.' } },
    { name: { tr: 'Geri daireler', en: 'Circle backward', es: 'Círculos atrás' }, breath: 'easy', hold: 3.2, line: ['handL', 'shoulderL', 'shoulderR', 'handR'],
      text: { tr: 'Yönü değiştir. Daireler aynı boyda, kollar omuz hizasında.', en: 'Reverse the direction. Same size circles, arms at shoulder height.', es: 'Cambia de dirección. Círculos iguales, brazos a la altura de los hombros.' } },
  ],
  tempoText: { tr: 'Saniyede bir daire · 8 ileri, 8 geri', en: 'One circle per second · 8 forward, 8 back', es: 'Un círculo por segundo · 8 adelante, 8 atrás' },
  mistakes: [
    { title: { tr: 'Omuzlar kulaklara kalkıyor', en: 'Shrugging shoulders', es: 'Hombros hacia las orejas' },
      text: { tr: 'Boyun kısalır, daireyi trapezler çizer.', en: 'The neck shortens and the traps take over.', es: 'El cuello se acorta y trabajan los trapecios.' },
      fix: { tr: 'Ağırlığı azalt, omuzları indir', en: 'Lighter weights, shoulders down', es: 'Menos peso, hombros abajo' },
      fixText: { tr: 'Kürek kemikleri aşağı kayar, boyun uzun', en: 'Shoulder blades slide down, long neck', es: 'Escápulas abajo, cuello largo' },
      at: 'c', pose: { shrug: 0.045, holdL: H(0, 0.04), holdR: H(0, 0.04), neck: -4 }, marks: ['shoulderL', 'shoulderR'], parts: ['upper', 'neck'] },
    { title: { tr: 'Gövde sallanıyor', en: 'Torso sways', es: 'El torso se balancea' },
      text: { tr: 'Daireler gövdeyi yana savurur.', en: 'The circles rock the whole body side to side.', es: 'Los círculos balancean todo el cuerpo.' },
      fix: { tr: 'Karnı topla, gövdeyi sabitle', en: 'Brace the core, keep the torso still', es: 'Activa el abdomen, torso quieto' },
      fixText: { tr: 'Sadece kollar hareket eder', en: 'Only the arms move', es: 'Solo se mueven los brazos' },
      at: 'c', pose: { side: 9, roll: 3 }, line: ['pelvis', 'neck'], goodLine: ['pelvis', 'neck'], parts: ['waist', 'chest'] },
  ],
  cues: [{ tr: 'Omuzlar aşağı, boyun uzun', en: 'Shoulders down, neck long', es: 'Hombros abajo, cuello largo' },
    { tr: 'Daire omuzdan başlar', en: 'Circle from the shoulder', es: 'El círculo nace en el hombro' },
    { tr: 'Kaburgalar içeride', en: 'Ribs stay knit', es: 'Costillas cerradas' }],
};
}
