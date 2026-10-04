/* Self-resisted biceps curl (strength_pull), right arm works, left hand presses down on the right wrist. No equipment.
 * Right arm: FK (upper arm nearly still, elbow 5 -> 135-145).
 * Left arm: the engine cannot attach one hand to the other arm, and linear interpolation of an IK target would leave
 * the arc of the right wrist. Work-around inside this file: a no-geometry prop (`_resistHand`) re-solves the left arm
 * every rendered frame with FB.ik2 so the left palm sits on the flexor side of the right forearm just above the wrist.
 * The FK left arm in the poses is a close approximation (used by measure/qa and the ghost).
 * Spec: shoulder 0 -> 15, elbow 5 -> 135 (145 at the squeeze), resisting elbow 60 -> 80. Used elbow 14 -> 124: at the bottom
 * the forearm tips forward a little so the other hand can rest on it from above, and above ~125° the flexor side of the
 * forearm faces the chest, leaving no room for the pressing hand (it must stay on top of the forearm).  * Fix 2026-10-04: start elbow 14->40, shR 14 (forearm in front of the belly so the left hand can reach without crossing the torso); left elbow pole forward/outward [0.8,-0.3,-0.5] so the left arm routes in front of the torso.
 */
{
const { V, M, BODY } = FB;
FB.PROPS._resistHand = (sol) => {
  const J = sol.J, F = sol.F, a = F.armR, T = F.thorax;
  const u = a.u, fd = a.fd;
  let p = V.sub(V.mul(u, -1), V.mul(fd, V.dot(V.mul(u, -1), fd)));             // flexor side of the forearm
  if (V.len(p) < 0.25) p = V.add(p, V.mul(a.b, 0.6));
  p = V.norm(p);
  const target = V.add(V.add(J.wristR, V.mul(fd, -0.035)), V.mul(p, 0.055));
  const pole = M.apply(T, [0.8, -0.3, -0.5]);
  const r = FB.ik2(J.shoulderL, target, BODY.upper, BODY.fore + BODY.hand * 0.55, pole);
  const fdL = V.norm(V.sub(r.end, r.mid)), uL = V.norm(V.sub(r.mid, J.shoulderL));
  let bL = V.sub(fdL, V.mul(uL, V.dot(fdL, uL))); bL = V.len(bL) > 1e-4 ? V.norm(bL) : F.armL.b;
  J.elbowL = r.mid; J.handL = r.end; J.wristL = V.sub(r.end, V.mul(fdL, BODY.hand * 0.55));
  F.armL = { u: uL, fd: fdL, b: bL };
  return [];
};
const BASE = { knee: 5, abd: 4, neck: 2, headTurn: -8, palmL: 'down', curlL: 0.55, shL: 22, shAbdL: 4, shRotL: 35, elL: 62 };

window.EXERCISE = {
  id: 'self_resisted_curl',
  name: { tr: 'Kendi Kendine Dirençli Biceps Curl', en: 'Self-Resisted Biceps Curl', es: 'Curl de bíceps con auto-resistencia' },
  category: { tr: 'Kol', en: 'Arms', es: 'Brazos' },
  equipmentLabel: { tr: 'Ekipmansız', en: 'No equipment', es: 'Sin equipo' },
  muscles: ['biceps', 'forearms'],
  tempo: '3-1-3',
  view: { yaw: 24, pitch: 5 },
  alt: { yaw: 90, pitch: 6, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
    text: { tr: 'Çalışan dirsek kaburgaların yanında kalır', en: 'The working elbow stays by the ribs', es: 'El codo que trabaja queda junto a las costillas' } },
  props: [['_resistHand']],
  ctx: { anchorX: ['ankleL', 'ankleR'], plant: ['ankleL', 'ankleR'] },
  poses: {
    start: Object.assign({}, BASE, { shR: 14, shAbdR: 6, elR: 40, palmR: 'forward' }),
    top: Object.assign({}, BASE, { shR: 14, shAbdR: 6, shRotR: -6, elR: 124, shL: 30, elL: 80, palmR: 'forward' }),
  },
  rest: 'start',
  rep: [
    { to: 'top', dur: 3.0, phase: 0 },
    { to: 'top', dur: 1.0, phase: 1 },
    { to: 'start', dur: 3.0, phase: 2 },
  ],
  setup: { tr: 'Dik dur. Sağ kol aşağıda, avuç öne. Sol elini sağ bileğinin üstüne koy. Sonra taraf değiştir.',
    en: 'Stand tall. Right arm down, palm forward. Left hand on top of the right wrist. Then switch sides.',
    es: 'De pie. Brazo derecho abajo, palma al frente. Mano izquierda sobre la muñeca. Luego cambia.' },
  phases: [
    { name: { tr: 'Dirence karşı kaldır', en: 'Curl against it', es: 'Sube contra la mano' }, breath: 'out', line: ['shoulderR', 'elbowR'],
      text: { tr: 'Sol el aşağı bastırırken sağ kolu üç saniyede kaldır.', en: 'Curl the right arm in three seconds while the left hand pushes down.', es: 'Sube en tres segundos mientras la mano izquierda empuja abajo.' } },
    { name: { tr: 'Tepede sık', en: 'Squeeze', es: 'Aprieta' }, breath: 'hold', marks: [{ type: 'mark', joint: 'elbowR' }],
      text: { tr: 'Bir saniye en güçlü şekilde sık. Dirsek yanda.', en: 'Squeeze as hard as you can for a second. Elbow at your side.', es: 'Aprieta al máximo un segundo. Codo al costado.' } },
    { name: { tr: 'Direnerek indir', en: 'Resist on the way down', es: 'Resiste al bajar' }, breath: 'in', line: ['shoulderR', 'elbowR'],
      text: { tr: 'Sol el bastırır, sağ kol direnerek üç saniyede iner.', en: 'The left hand pushes, the right arm resists for three seconds.', es: 'La izquierda empuja, la derecha resiste tres segundos.' } },
  ],
  tempoText: { tr: '3 sn kaldır · 1 sn sık · 3 sn indir', en: '3 s up · 1 s squeeze · 3 s down', es: '3 s sube · 1 s aprieta · 3 s baja' },
  mistakes: [
    { title: { tr: 'Gövde yana eğiliyor', en: 'Leaning and shrugging', es: 'Inclinarse y encoger' },
      fix: { tr: 'Omuzlar düz, gövde dik', en: 'Shoulders level, torso tall', es: 'Hombros nivelados, torso recto' },
      fixText: { tr: 'Baskıyı biraz azalt, hareket yumuşak olsun', en: 'Ease the pressure so the motion stays smooth', es: 'Reduce la presión para un movimiento suave' },
      at: 'top', pose: { side: 12, shrugR: 0.05, elR: 104 }, view: { yaw: 6, pitch: 5 }, line: ['shoulderL', 'shoulderR'], parts: ['chest', 'waist', 'neck'] },
    { title: { tr: 'Dirsek öne kaçıyor', en: 'Elbow drifts forward', es: 'El codo va adelante' },
      fix: { tr: 'Dirseği yanda sabitle', en: 'Pin the elbow', es: 'Fija el codo' },
      fixText: { tr: 'Üst kol yanda kalır, işi biceps yapar', en: 'Upper arm stays put so the biceps work', es: 'El brazo no se mueve y trabaja el bíceps' },
      at: 'top', pose: { shR: 42, elR: 112 }, view: { yaw: 80, pitch: 6 }, marks: ['elbowR'], line: ['shoulderR', 'elbowR'], parts: ['upperR'] },
  ],
  cues: [{ tr: 'Diğer elle aşağı bastır', en: 'Push down with the other hand', es: 'Empuja con la otra mano' },
    { tr: 'Yavaşça karşı koy', en: 'Curl slowly against it', es: 'Sube despacio contra ella' },
    { tr: 'Dirsek yanında', en: 'Elbow at your side', es: 'Codo al costado' }],
};
}
