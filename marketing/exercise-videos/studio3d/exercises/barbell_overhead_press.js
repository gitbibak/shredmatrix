/* Standing barbell overhead press. Bar = midpoint of the hands; hands use thorax-frame holds expressed from the shoulder
 * joint (lazy `poses`/`mistakes`, FB.BODY is only correct after the rig loads). Rack position: bar on the clavicles,
 * elbows slightly in front of the bar -> lockout over the shoulders / mid-foot with the head through the window. */
{
const { V } = FB;
const BASE = { abd: 7, hrot: 8, knee: 2, hip: 0, trunk: 0, elbowPole: [1, -0.3, 0.8], noAvoid: true };
const GRIP = 0.06;   // hands this far outside the shoulder joints (grip ~1.1x shoulder width)
const SH = () => { const s = FB.solve(FB.expand(BASE), {}); const T = s.F.thorax, d = V.sub(s.J.shoulderR, s.J.chest); return [V.dot(d, T[0]), V.dot(d, T[1]), V.dot(d, T[2])]; };
const BAR = (f, u, extra) => { const s = SH(); const h = [s[0] + f, s[1] + u, s[2] + GRIP]; return Object.assign({}, BASE, { holdL: h, holdR: h.slice() }, extra); };
window.EXERCISE = {
  id: 'barbell_overhead_press',
  name: { tr: 'Overhead Press', en: 'Barbell Overhead Press', es: 'Press militar con barra' },
  category: { tr: 'Omuz · Kol', en: 'Shoulders · Arms', es: 'Hombros · Brazos' },
  equipmentLabel: { tr: 'Halter', en: 'Barbell', es: 'Barra' },
  muscles: ['delts', 'triceps', 'upperback', 'core'],
  tempo: '1.5-0-2',
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 16, pitch: 6, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' }, text: { tr: 'Tutuş omuzların hemen dışında', en: 'Grip just outside the shoulders', es: 'Agarre justo fuera de los hombros' } },
  setupView: { yaw: 30, pitch: 10 },
  setupMarks: [{ type: 'span', joints: ['ankleR', 'ankleL'], label: { tr: 'Kalça genişliği', en: 'Hip width', es: 'Ancho de cadera' } }],
  props: [['barbell', { grip: 'pronated' }]],
  ctx: { anchorX: ['ankleL', 'ankleR'], plant: ['ankleL', 'ankleR'] },
  get poses() {
    return this._p || (this._p = {
      rack: BAR(0.15, 0.07, { neck: -8 }),
      top: BAR(-0.03, 0.575, { neck: 4, trunk: 2 }),
    });
  },
  rest: 'rack',
  rep: [
    { to: 'top', dur: 1.5, phase: 0 },
    { to: 'rack', dur: 2.0, phase: 1 },
  ],
  setup: { tr: 'Ayaklar kalça genişliğinde, kalça sıkı. Bar köprücük kemiğinde, ön kollar dik.',
    en: 'Feet hip-width, glutes tight. Bar on the collarbones, forearms vertical.',
    es: 'Pies al ancho de cadera, glúteos firmes. Barra en las clavículas, antebrazos verticales.' },
  phases: [
    { name: { tr: 'İtiş', en: 'Press', es: 'Empuja' }, breath: 'out', line: ['ankleR', 'shoulderR', 'wristR'],
      text: { tr: 'Barı yüzüne yakın düz yukarı it. Tepede baş kolların arasına girer.', en: 'Press straight up close to the face. At the top the head moves through.', es: 'Empuja recto cerca de la cara. Arriba la cabeza pasa entre los brazos.' } },
    { name: { tr: 'İndir', en: 'Lower', es: 'Baja' }, breath: 'in',
      text: { tr: 'Barı kontrollü şekilde köprücük kemiğine indir, başı biraz geri al.', en: 'Lower the bar under control to the collarbones, head back a little.', es: 'Baja la barra con control a las clavículas, cabeza un poco atrás.' } },
  ],
  tempoText: { tr: '1,5 sn it · 2 sn indir', en: '1.5 s up · 2 s down', es: '1,5 s arriba · 2 s abajo' },
  get mistakes() {
    return this._m || (this._m = [
      { title: { tr: 'Bel geriye yatıyor', en: 'Leaning back', es: 'Inclinarse atrás' },
        fix: { tr: 'Kalçayı sık, kaburgaları indir', en: 'Glutes tight, ribs down', es: 'Glúteos firmes, costillas abajo' },
        fixText: { tr: 'Gövde dik, bar orta ayağın üstünde', en: 'Torso upright, bar over mid-foot', es: 'Torso recto, barra sobre el mediopié' },
        at: 'top', pose: { trunk: -7, lumbar: -12, hip: -5 }, line: ['ankleR', 'pelvis', 'neck'], parts: ['waist', 'pelvis'] },
      { title: { tr: 'Bar öne kaçıyor', en: 'Bar drifts forward', es: 'La barra se va adelante' },
        fix: { tr: 'Barı yüze yakın tut', en: 'Keep the bar close to the face', es: 'Barra cerca de la cara' },
        fixText: { tr: 'Bar dik bir çizgide, omuzların üstünde biter', en: 'Straight bar path, ending over the shoulders', es: 'Trayectoria recta, termina sobre los hombros' },
        at: 'top', pose: BAR(0.22, 0.49, { neck: -6 }), line: ['ankleR', 'shoulderR', 'wristR'], parts: ['upperR', 'foreR'] },
    ]);
  },
  cues: [{ tr: 'Kalça sıkı, kaburgalar aşağı', en: 'Glutes tight, ribs down', es: 'Glúteos firmes, costillas abajo' }, { tr: 'Bar yüze yakın', en: 'Bar close to the face', es: 'Barra cerca de la cara' }, { tr: 'Tepede baş içeri', en: 'Head through at the top', es: 'Cabeza adentro arriba' }],
};
}
