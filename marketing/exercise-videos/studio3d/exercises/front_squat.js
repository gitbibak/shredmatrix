/* Barbell front squat (copy of back_squat.js). Bar = midpoint of the hands (barbell prop): holdL/holdR put the hands just
 * ~20 cm outside the shoulders, 6-7 cm in front of the shoulder joints, so the bar rests on the front delts with the elbows high
 * (elbowPole forward). The rig forearm+hand (0.30 m) is longer than the upper arm, so a narrow clean grip folds the elbows
 * down; the hands sit wider instead. noAvoid: the torso swivel flipped the elbows behind the body in the elbows-drop mistake.
 * Spec bottom: trunk 25, hip 128, knee 135, shin 32 (upright torso, knees travel forward). */
{
const RACK = { holdL: [0.09, 0.13, 0.38], holdR: [0.09, 0.13, 0.38], elbowPole: [1, -0.05, 0.25], sh: 90, el: 130, shAbd: 15, noAvoid: true };
window.EXERCISE = {
  id: 'front_squat',
  name: { tr: 'Front Squat', en: 'Barbell Front Squat', es: 'Sentadilla frontal' },
  category: { tr: 'Bacak · Kalça', en: 'Legs · Glutes', es: 'Piernas · Glúteos' },
  equipmentLabel: { tr: 'Halter', en: 'Barbell', es: 'Barra' },
  muscles: ['quads', 'glutes', 'adductors', 'core', 'upperback'],
  tempo: '2-0.5-1',
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 35, pitch: 10, title: { tr: 'Çapraz bak', en: 'Angle view', es: 'Vista en ángulo' }, text: { tr: 'Dirsekler yüksek, bar omuzların önünde', en: 'Elbows high, bar on the front of the shoulders', es: 'Codos altos, barra sobre los hombros' } },
  setupView: { yaw: 32, pitch: 12 },
  setupMarks: [{ type: 'span', joints: ['ankleR', 'ankleL'], label: { tr: 'Omuz genişliği', en: 'Shoulder width', es: 'Ancho de hombros' } }],
  props: [['barbell', { grip: 'pronated' }]],
  ctx: { anchorX: ['ankleL', 'ankleR'], plant: ['ankleL', 'ankleR'] },
  poses: {
    start: Object.assign({ trunk: 2, hip: 0, abd: 7, hrot: 20, neck: 0 }, RACK),
    bottom: Object.assign({ trunk: 30, hip: 124, knee: 134, abd: 14, hrot: 22, neck: -10, thoracic: -4 }, RACK),
  },
  rest: 'start',
  rep: [
    { to: 'bottom', dur: 2.0, phase: 0 },
    { to: 'bottom', dur: 0.5, phase: 1 },
    { to: 'start', dur: 1.0, phase: 2 },
  ],
  setup: { tr: 'Bar omuzların önünde, köprücük kemiğine yakın. Parmaklar barın altında, dirsekler yukarı.',
    en: 'Bar on the front of the shoulders, near the collarbones. Fingers under the bar, elbows up.',
    es: 'Barra delante de los hombros, junto a las clavículas. Dedos bajo la barra, codos arriba.' },
  phases: [
    { name: { tr: 'İniş', en: 'Lower', es: 'Baja' }, breath: 'in',
      text: { tr: 'Nefes al, karnı sık. Dik bir gövdeyle aşağı otur, dizler öne gider.', en: 'Breathe in and brace. Sit straight down with an upright torso; knees travel forward.', es: 'Inhala y aprieta. Baja recta con el torso erguido; rodillas hacia delante.' } },
    { name: { tr: 'Dipte dur', en: 'Pause', es: 'Pausa' }, breath: 'hold', arc: ['hipR', 'kneeR', 'ankleR'], line: ['pelvis', 'neck'],
      text: { tr: 'Uyluk paralelin biraz altında. Dirsekler hâlâ yüksek, topuklar yerde.', en: 'Thighs just below parallel. Elbows still high, heels down.', es: 'Muslos algo bajo la paralela. Codos altos, talones abajo.' } },
    { name: { tr: 'Kalkış', en: 'Drive up', es: 'Sube' }, breath: 'out',
      text: { tr: 'Orta ayaktan it, dirsekleri yukarıda tutarak dikleş.', en: 'Drive through mid-foot and stand tall, elbows up.', es: 'Empuja con el mediopié y sube con los codos arriba.' } },
  ],
  tempoText: { tr: '2 sn in · 0,5 sn dur · 1 sn kalk', en: '2 s down · 0.5 s pause · 1 s up', es: '2 s abajo · 0,5 s pausa · 1 s arriba' },
  mistakes: [
    { title: { tr: 'Dirsekler düşüyor', en: 'Elbows drop', es: 'Los codos caen' },
      fix: { tr: 'Dirsekleri yukarı it', en: 'Drive the elbows up', es: 'Sube los codos' },
      fixText: { tr: 'Üst kollar yere paralel, bar omuzda kalır', en: 'Upper arms level, the bar stays on the shoulders', es: 'Brazos paralelos al suelo, barra en los hombros' },
      at: 'bottom', pose: { holdL: [0.14, 0.16, 0.24], holdR: [0.14, 0.16, 0.24], elbowPole: [0.2, -1, 0.3], thoracic: 6, trunk: 33 },
      view: { yaw: 60, pitch: 8 }, marks: ['elbowR', 'elbowL'], parts: ['upper', 'fore'] },
    { title: { tr: 'Gövde öne kapanıyor', en: 'Torso folds forward', es: 'El torso se dobla' },
      fix: { tr: 'Göğüs dik, üst sırt sıkı', en: 'Chest tall, upper back tight', es: 'Pecho arriba, espalda alta firme' },
      fixText: { tr: 'Kalça ve göğüs birlikte yükselir', en: 'Hips and chest rise together', es: 'Cadera y pecho suben a la vez' },
      at: 'bottom', pose: { trunk: 50, hip: 128, knee: 98, neck: -12 }, line: ['pelvis', 'neck'], parts: ['pelvis', 'waist', 'chest'] },
  ],
  cues: [{ tr: 'Dirsekler yüksek', en: 'Elbows high', es: 'Codos altos' }, { tr: 'Gövde dik', en: 'Torso upright', es: 'Torso erguido' }, { tr: 'Orta ayaktan it', en: 'Drive through mid-foot', es: 'Empuja con el mediopié' }],
};
}
