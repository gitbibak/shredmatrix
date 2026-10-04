/* Lying (prone) machine leg curl. legCurl prop (pad tilted 6 deg, knee end at o.at, roller behind the ankles follows the
 * legs). Contacts: chest + knee on the pad (two-contact ground), pelvis anchored, so the hips stay down while only the
 * knees bend. Hands grip the front of the pad (fixed world targets). */
(function () {
  const PAD = 0.6;
  // the machine's knee end faces +x, so the body is turned 180 deg (yaw) and the camera looks from -z to keep the right side near
  const HANDS = { handL: { at: [-0.74, 0.5, 0.22] }, handR: { at: [-0.74, 0.5, -0.22] } };
  const BASE = { yaw: 180, trunk: 96, hip: -2, flat: false, neck: -10, abd: 2, ground: [['chest', PAD], ['kneeR', PAD]], ik: HANDS, elbowPole: [-0.3, -0.4, 1], curl: 1 };
  window.EXERCISE = {
    id: 'lying_leg_curl',
    name: { tr: 'Lying Leg Curl', en: 'Lying Leg Curl', es: 'Curl femoral tumbado' },
    category: { tr: 'Bacak · Arka bacak', en: 'Legs · Hamstrings', es: 'Piernas · Isquios' },
    equipmentLabel: { tr: 'Leg curl makinesi', en: 'Leg curl machine', es: 'Máquina de curl femoral' },
    muscles: ['hamstrings', 'calves'],
    tempo: '1.5-0.5-2',
    view: { yaw: -90, pitch: 8 },
    alt: { yaw: -40, pitch: 22, title: { tr: 'Arkadan çapraz', en: 'Rear angle', es: 'Vista trasera' },
      text: { tr: 'Kalça pede bastırılı, topuklar kalçaya', en: 'Hips pressed down, heels to glutes', es: 'Cadera abajo, talones a los glúteos' } },
    setupView: { yaw: -130, pitch: 18 },
    contacts: ['chest', 'kneeR', 'ankleR'],
    props: [['legCurl', { at: [0.5, 0, 0], height: 0.55 }]],
    ctx: { anchorX: ['pelvis'], anchorAt: [-0.13, 0] },   // knees ~20 cm on the pad: the prop's weight stack sits 0.55 m past the pad end and would cut the feet otherwise
    poses: {
      start: Object.assign({}, BASE, { knee: 6, ankle: 0 }),
      top: Object.assign({}, BASE, { knee: 106, ankle: 5 }),
    },
    rest: 'start',
    rep: [
      { to: 'top', dur: 1.5, phase: 0 },
      { to: 'top', dur: 0.5, phase: 1 },
      { to: 'start', dur: 2.0, phase: 2 },
    ],
    setup: { tr: 'Yüzüstü yat, dizler pedin hemen dışında. Silindir topukların üstünde, kalça pede bastırılı.',
      en: 'Lie face down, knees just off the pad. Roller above the heels, hips pressed into the pad.',
      es: 'Boca abajo, rodillas justo fuera del banco. Rodillo sobre los talones, cadera pegada.' },
    phases: [
      { name: { tr: 'Bük', en: 'Curl', es: 'Flexiona' }, breath: 'out',
        text: { tr: 'Topukları kalçana doğru çek. Kalça pedde kalır.', en: 'Pull the heels toward your glutes. Hips stay on the pad.', es: 'Lleva los talones hacia los glúteos. La cadera no se levanta.' } },
      { name: { tr: 'Sık', en: 'Squeeze', es: 'Aprieta' }, breath: 'hold', arc: ['hipR', 'kneeR', 'ankleR'],
        text: { tr: 'Topuklar kalçaya yakın, diz açısı ~75°. Bir an sık.', en: 'Heels near the glutes, knee angle ~75°. Squeeze for a beat.', es: 'Talones cerca de los glúteos, rodilla a ~75°. Aprieta un instante.' } },
      { name: { tr: 'Yavaşça aç', en: 'Lower slowly', es: 'Baja despacio' }, breath: 'in',
        text: { tr: 'İki saniyede neredeyse düzleşene kadar indir; ağırlık çarpmasın.', en: 'Take two seconds to almost straight; don\'t let the stack slam.', es: 'Dos segundos hasta casi estirar; que el peso no golpee.' } },
    ],
    tempoText: { tr: '1,5 sn bük · 0,5 sn sık · 2 sn aç', en: '1.5 s curl · 0.5 s squeeze · 2 s lower', es: '1,5 s sube · 0,5 s aprieta · 2 s baja' },
    mistakes: [
      { title: { tr: 'Kalça pedden kalkıyor', en: 'Hips lift off the pad', es: 'La cadera se levanta' },
        fix: { tr: 'Kalçayı pede bastır', en: 'Press the hips down', es: 'Cadera pegada al banco' },
        fixText: { tr: 'Gerekirse ağırlığı azalt', en: 'Lower the weight if needed', es: 'Baja el peso si hace falta' },
        at: 'top', pose: { hip: 26, lumbar: -10, knee: 92 }, marks: ['pelvis'], line: ['chest', 'pelvis', 'kneeR'], goodLine: ['chest', 'pelvis', 'kneeR'], parts: ['pelvis', 'waist'] },
      { title: { tr: 'Yarım hareket', en: 'Partial range', es: 'Recorrido parcial' },
        fix: { tr: 'Tam aralıkta çalış', en: 'Use the full range', es: 'Recorrido completo' },
        fixText: { tr: 'Topukları kalçaya kadar getir', en: 'Bring the heels all the way up', es: 'Lleva los talones hasta arriba' },
        at: 'top', pose: { knee: 45, ankle: -4 }, marks: ['ankleR'], parts: ['thighR', 'shinR'] },
    ],
    cues: [{ tr: 'Kalça pedde', en: 'Hips stay down', es: 'Cadera abajo' },
      { tr: 'Topuklar kalçaya', en: 'Heels to glutes', es: 'Talones a los glúteos' },
      { tr: 'İnişi kontrol et', en: 'Control the lowering', es: 'Controla la bajada' }],
  };
})();
