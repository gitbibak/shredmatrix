/* 3D renderer (three.js). Every body part is the smooth convex hull of its spheres (analytic normals),
 * lit like a soft studio render: key light with soft shadows, hemisphere fill, cyan/orange rim lights, room environment.
 * Muscle highlight and error tint are shader uniforms. Exposes window.FB3 = { init, render }. */
import * as THREE from 'three';
import { ConvexHull } from 'three/addons/math/ConvexHull.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const FB = window.FB;
const { V, M } = FB;

// ---------- unit sphere samples ----------
function icoPoints(sub) {
  const g = new THREE.IcosahedronGeometry(1, sub);
  const pos = g.attributes.position, seen = new Map(), out = [];
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const k = `${x.toFixed(4)},${y.toFixed(4)},${z.toFixed(4)}`;
    if (!seen.has(k)) { seen.set(k, 1); out.push([x, y, z]); }
  }
  return out;
}
const ICO = { 1: icoPoints(1), 2: icoPoints(2), 3: icoPoints(3) };

// hull of spheres -> BufferGeometry with analytic normals
function hullGeometry(sph, sub = 2) {
  const pts = [], cs = [], rs = [];
  sph.forEach(([c, r], i) => {
    cs.push(c); rs.push(r);
    for (const u of ICO[sub]) { const v = new THREE.Vector3(c[0] + u[0] * r, c[1] + u[1] * r, c[2] + u[2] * r); v.si = i; pts.push(v); }
  });
  let hull;
  try { hull = new ConvexHull().setFromPoints(pts); } catch (e) { return null; }
  const P = [], N = [];
  for (const f of hull.faces) {
    let e = f.edge; const tri = [];
    do { tri.push(e.head().point); e = e.next; } while (e !== f.edge);
    for (let k = 1; k + 1 < tri.length; k++) for (const p of [tri[0], tri[k], tri[k + 1]]) {
      P.push(p.x, p.y, p.z);
      const c = cs[p.si], r = rs[p.si];
      N.push((p.x - c[0]) / r, (p.y - c[1]) / r, (p.z - c[2]) / r);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
  return g;
}

// ---------- materials ----------
const MUS_MAX = 6;
function bodyMat(params) {
  const m = new THREE.MeshPhysicalMaterial(params);
  m.userData.u = {
    uMus: { value: Array.from({ length: MUS_MAX }, () => new THREE.Vector4(0, -9, 0, 0.01)) },
    uMusI: { value: new Array(MUS_MAX).fill(0) },
    uTint: { value: new THREE.Color('#ff3b4e') }, uTintA: { value: 0 },
    uGlow: { value: new THREE.Color('#00c8ff') },
  };
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, m.userData.u);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
      varying vec3 vWP; uniform vec4 uMus[${MUS_MAX}]; uniform float uMusI[${MUS_MAX}]; uniform vec3 uTint; uniform float uTintA; uniform vec3 uGlow;`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      float mg = 0.0;
      for (int i = 0; i < ${MUS_MAX}; i++) { float d = distance(vWP, uMus[i].xyz); mg += uMusI[i] * (1.0 - smoothstep(uMus[i].w * 0.35, uMus[i].w * 1.25, d)); }
      mg = clamp(mg, 0.0, 1.0);
      diffuseColor.rgb = mix(diffuseColor.rgb, uGlow * 0.55, mg * 0.75);
      totalEmissiveRadiance += uGlow * mg * 0.55;
      diffuseColor.rgb = mix(diffuseColor.rgb, uTint, uTintA * 0.7);
      totalEmissiveRadiance += uTint * uTintA * 0.35;`);
  };
  return m;
}
const MAT = {
  skin: bodyMat({ color: '#efb08a', roughness: 0.55, sheen: 0.35, sheenColor: new THREE.Color('#ffd0b5'), sheenRoughness: 0.6, clearcoat: 0.04 }),
  skinFar: null,
  legs: bodyMat({ color: '#2f3d70', roughness: 0.6, sheen: 0.7, sheenColor: new THREE.Color('#8093e6'), sheenRoughness: 0.45 }),
  top: bodyMat({ color: '#ff6a00', roughness: 0.58, sheen: 0.55, sheenColor: new THREE.Color('#ffb27a'), sheenRoughness: 0.5 }),
  shoe: bodyMat({ color: '#f2f4f8', roughness: 0.48, sheen: 0.2 }),
  sole: bodyMat({ color: '#ff6d00', roughness: 0.5 }),
  lace: bodyMat({ color: '#b9c3d3', roughness: 0.6 }),
  hair: bodyMat({ color: '#3b2619', roughness: 0.42, sheen: 1.0, sheenColor: new THREE.Color('#b07a5c'), sheenRoughness: 0.35, side: THREE.DoubleSide }),
  tie: bodyMat({ color: '#00b0ff', roughness: 0.4 }),
  band: bodyMat({ color: '#1e2a55', roughness: 0.55, sheen: 0.5, sheenColor: new THREE.Color('#5b6fc8') }),
  eye: bodyMat({ color: '#1b1412', roughness: 0.18, clearcoat: 1 }),
  brow: bodyMat({ color: '#3b2619', roughness: 0.6 }),
};
const PMAT = {
  iron: new THREE.MeshPhysicalMaterial({ color: '#343c4e', metalness: 0.55, roughness: 0.42, clearcoat: 0.3 }),
  chrome: new THREE.MeshPhysicalMaterial({ color: '#d6dbe4', metalness: 1, roughness: 0.2 }),
  plate: new THREE.MeshPhysicalMaterial({ color: '#232a3b', metalness: 0.3, roughness: 0.5 }),
  pad: new THREE.MeshPhysicalMaterial({ color: '#2a3247', roughness: 0.5, sheen: 0.4, sheenColor: new THREE.Color('#5a6788') }),
  frame: new THREE.MeshPhysicalMaterial({ color: '#8d98ab', metalness: 0.65, roughness: 0.32 }),
  wood: new THREE.MeshPhysicalMaterial({ color: '#c99b6d', roughness: 0.6 }),
  mat: new THREE.MeshPhysicalMaterial({ color: '#173463', roughness: 0.85, sheen: 0.3, sheenColor: new THREE.Color('#3f7fd0') }),
  wall: new THREE.MeshPhysicalMaterial({ color: '#1b2748', roughness: 0.9 }),
  band: new THREE.MeshPhysicalMaterial({ color: '#22d38a', roughness: 0.5 }),
  rubber: new THREE.MeshPhysicalMaterial({ color: '#1f2433', roughness: 0.7 }),
};

// ---------- scene ----------
let renderer, scene, cam3, root, key, rimC, rimO, hemi, floor, composer, gtao, hairCapGeo;
function init(canvas, W = 1080, H = 1920) {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(1);
  renderer.setSize(W, H, false);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.7;
  cam3 = new THREE.PerspectiveCamera(30, W / H, 0.1, 100);
  hemi = new THREE.HemisphereLight('#d8e8ff', '#26305a', 1.25); scene.add(hemi);
  key = new THREE.DirectionalLight('#fff3e6', 3.0);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.025; key.shadow.radius = 4;
  const sc = key.shadow.camera; sc.left = -1.7; sc.right = 1.7; sc.top = 1.7; sc.bottom = -1.7; sc.near = 0.5; sc.far = 12;
  scene.add(key, key.target);
  rimC = new THREE.DirectionalLight('#33c2ff', 2.2); scene.add(rimC, rimC.target);
  rimO = new THREE.DirectionalLight('#ff8a3d', 1.3); scene.add(rimO, rimO.target);
  floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.ShadowMaterial({ color: '#000814', opacity: 0.5 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  root = new THREE.Group(); scene.add(root);
  W_ = W; H_ = H;
  const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
  composer = new EffectComposer(renderer, rt);
  composer.setPixelRatio(1); composer.setSize(W, H);
  composer.addPass(new RenderPass(scene, cam3, null, new THREE.Color(0, 0, 0), 0));
  gtao = new GTAOPass(scene, cam3, W, H);
  gtao.output = GTAOPass.OUTPUT.Default;
  gtao.blendIntensity = 0.9;
  gtao.updateGtaoMaterial({ radius: 0.12, distanceExponent: 1.4, thickness: 1.2, scale: 1.0, samples: 16, distanceFallOff: 1.0 });
  gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 16 });
  composer.addPass(gtao);
  composer.addPass(new OutputPass());
  hairCapGeo = new THREE.SphereGeometry(1, 64, 40, 0, Math.PI * 2, 0, Math.PI * 0.585);
  hairCapGeo.rotateZ(1.0);
}
let W_ = 1080, H_ = 1920;

function setCamera(cam) {
  cam3.position.set(...cam.pos);
  cam3.up.set(0, 1, 0);
  cam3.lookAt(...cam.tgt);
  cam3.updateMatrixWorld();
  // pinhole with principal point (cx, cy) in pixels, y down
  const n = 0.1, f = 100, fx = cam.f, W = W_, H = H_;
  cam3.projectionMatrix.set(
    2 * fx / W, 0, 1 - 2 * cam.cx / W, 0,
    0, 2 * fx / H, 2 * cam.cy / H - 1, 0,
    0, 0, -(f + n) / (f - n), -2 * f * n / (f - n),
    0, 0, -1, 0);
  const pm = cam3.projectionMatrix;
  cam3.projectionMatrixInverse.copy(pm).invert();
}

// ---------- detail parts ----------
function detailParts(sol, parts, opt) {
  const { J, F } = sol;
  const out = [];
  const H = F.head, hc = J.head, T = F.thorax, L = F.lumbar;
  const lt = (fr, o, off) => V.add(o, M.apply(fr, off));
  for (const p of parts) {
    if (p.id.startsWith('hand') || p.id === 'hair' || p.id === 'face') continue;
    if (p.id.startsWith('foot')) {
      out.push({ id: p.id, mat: 'shoe', sph: p.sph, side: p.side });
      out.push({ id: p.id + 'sole', mat: 'sole', sph: p.sole.map(([c, r]) => [c, r * 1.25]).concat(p.sph.slice(0, 1).map(([c, r]) => [V.add(c, [0, -0.012, 0]), r * 0.9])), side: p.side, sub: 1 });
      continue;
    }
    out.push(Object.assign({}, p));
  }
  // head: face + hair cap + nose + ears (+ eyes, brows)
  out.push({ id: 'face', mat: 'skin', sph: [[lt(H, hc, [0.028, -0.012, 0]), 0.09], [lt(H, hc, [0.04, -0.058, 0]), 0.066], [lt(H, hc, [-0.01, 0.0, 0]), 0.095]], sub: 3 });
  out.push({ id: 'nose', mat: 'skin', sph: [[lt(H, hc, [0.112, -0.022, 0]), 0.012], [lt(H, hc, [0.1, 0.005, 0]), 0.009]], sub: 1 });
  out.push({ id: 'hairback', mat: 'hair', sph: [[lt(H, hc, [-0.05, -0.02, 0]), 0.082], [lt(H, hc, [-0.06, -0.06, 0]), 0.06]], sub: 2 });
  for (const sg of [-1, 1]) {
    out.push({ id: 'ear', mat: 'skin', sph: [[lt(H, hc, [-0.005, -0.022, sg * 0.093]), 0.018], [lt(H, hc, [-0.012, -0.0, sg * 0.09]), 0.016]], sub: 1 });
    if (opt.face !== false) {
      out.push({ id: 'eye', mat: 'eye', sph: [[lt(H, hc, [0.1, -0.005, sg * 0.036]), 0.0105]], sub: 1 });
      out.push({ id: 'brow', mat: 'brow', sph: [[lt(H, hc, [0.104, 0.029, sg * 0.022]), 0.0052], [lt(H, hc, [0.097, 0.03, sg * 0.05]), 0.0048]], sub: 1 });
    }
  }
  // ponytail
  const base = lt(H, hc, [-0.1, 0.05, 0]);
  let dir = V.norm(M.apply(H, [-1, 0.45, 0])); if (dir[1] > 0.3) dir = V.norm([dir[0], 0.3, dir[2]]);
  const pts = [base]; let q = base;
  const sway = opt.sway || [0, 0, 0];
  for (let i = 1; i <= 7; i++) {
    dir = V.norm(V.add(V.add(dir, [0, -0.8, 0]), V.mul(sway, 0.35 * i / 7)));
    q = V.add(q, V.mul(dir, 0.04)); if (q[1] < 0.015) q = [q[0], 0.015, q[2]]; pts.push(q);
  }
  const rad = [0.03, 0.036, 0.038, 0.035, 0.031, 0.026, 0.02, 0.013];
  for (let i = 0; i < pts.length - 1; i++) out.push({ id: 'pony', mat: 'hair', sph: [[pts[i], rad[i]], [pts[i + 1], rad[i + 1]]], sub: 2 });
  out.push({ id: 'tie', mat: 'tie', sph: [[base, 0.024]], sub: 2 });
  // sports-top straps and leggings waistband
  for (const sg of [-1, 1]) out.push({ id: 'strap', mat: 'top', sph: [[lt(T, J.waist, [0.07, 0.2, sg * 0.075]), 0.014], [lt(T, J.waist, [0.0, 0.265, sg * 0.1]), 0.016], [lt(T, J.waist, [-0.075, 0.21, sg * 0.08]), 0.014]], sub: 1, chain: true });
  const ring = [];
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; for (const y of [0.075, 0.105]) ring.push([lt(L, J.pelvis, [Math.cos(a) * 0.104 + 0.004, y, Math.sin(a) * 0.15]), 0.006]); }
  out.push({ id: 'waistband', mat: 'band', sph: ring, sub: 1 });
  // hands
  for (const s of ['L', 'R']) out.push(...handParts(sol, s, opt));
  return out;
}

function handParts(sol, s, opt) {
  const { J, F } = sol;
  const sg = s === 'R' ? 1 : -1;
  const W = J['wrist' + s];
  let fd = F['arm' + s].fd, b = F['arm' + s].b;
  const grip = sol.grip && sol.grip[s];
  let wA, pn;
  const onFloor = J['hand' + s][1] < 0.07 && !grip;
  if (onFloor) {
    const fw = M.apply(F.thorax, [0, 1, 0]); let h = V.norm([fw[0], 0, fw[2]]); if (!isFinite(h[0])) h = [1, 0, 0];
    fd = V.norm(V.add(V.mul(fd, 0.25), V.mul(h, 0.75))); fd = V.norm([fd[0], Math.min(fd[1], -0.05), fd[2]]);
    pn = [0, -1, 0]; wA = V.norm(V.cross(fd, pn));
  } else if (grip) {
    wA = V.norm(V.sub(grip, V.mul(fd, V.dot(grip, fd)))); pn = V.norm(V.cross(wA, fd)); if (V.dot(pn, V.sub(V.lerp(J.handL, J.handR, 0.5), J['hand' + s])) < 0 && !sol.grip.cup) pn = V.mul(pn, -1);
  } else {
    wA = V.norm(V.sub(b, V.mul(fd, V.dot(b, fd)))); pn = V.norm(V.cross(fd, wA)); pn = V.mul(pn, sg * -1);
  }
  const at = (a, w, n) => V.add(W, V.add(V.mul(fd, a), V.add(V.mul(wA, w), V.mul(pn, n))));
  const palm = [[at(0.0, 0, 0), 0.024], [at(0.03, 0.016, 0.0), 0.022], [at(0.03, -0.016, 0.0), 0.022], [at(0.068, 0.02, 0.004), 0.017], [at(0.068, -0.02, 0.004), 0.017]];
  const parts = [{ id: 'hand' + s, mat: 'skin', sph: palm, side: s, sub: 2 }];
  if (grip || opt.fist) {
    parts.push({ id: 'fingers' + s, mat: 'skin', sph: [[at(0.075, 0.02, 0.02), 0.016], [at(0.075, -0.02, 0.02), 0.016], [at(0.06, 0.02, 0.04), 0.015], [at(0.06, -0.02, 0.04), 0.015]], sub: 1 });
    parts.push({ id: 'thumb' + s, mat: 'skin', sph: [[at(0.02, 0.026, 0.012), 0.013], [at(0.05, 0.028, 0.03), 0.011]], sub: 1 });
  } else {
    parts.push({ id: 'fingers' + s, mat: 'skin', sph: [[at(0.07, 0.019, 0.004), 0.015], [at(0.07, -0.019, 0.004), 0.015], [at(0.125, 0.017, 0.012), 0.011], [at(0.125, -0.017, 0.012), 0.011]], sub: 1 });
    parts.push({ id: 'thumb' + s, mat: 'skin', sph: [[at(0.015, 0.028, 0.01), 0.013], [at(0.05, 0.045, 0.02), 0.01]], sub: 1 });
  }
  return parts;
}

// ---------- props ----------
function propMesh(d) {
  const m = PMAT[d.m] || PMAT.iron;
  let mesh;
  if (d.t === 'cyl') {
    const a = new THREE.Vector3(...d.a), b = new THREE.Vector3(...d.b);
    const L = a.distanceTo(b);
    const g = new THREE.CylinderGeometry(d.r, d.r, L, d.seg || 28, 1, false);
    if (d.seg === 6) g.rotateY(Math.PI / 6);
    mesh = new THREE.Mesh(g, m);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  } else if (d.t === 'box') {
    const g = new THREE.BoxGeometry(...d.s);
    mesh = new THREE.Mesh(g, m); mesh.position.set(...d.c);
  } else if (d.t === 'sph') {
    mesh = new THREE.Mesh(new THREE.SphereGeometry(d.r, 32, 20), m); mesh.position.set(...d.c);
  } else if (d.t === 'tube') {
    const curve = new THREE.CatmullRomCurve3(d.pts.map((p) => new THREE.Vector3(...p)));
    mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(2, d.pts.length * 6), d.r, 10, false), m);
  }
  mesh.castShadow = true; mesh.receiveShadow = true;
  return mesh;
}

// ---------- render ----------
function clear() {
  for (const c of [...root.children]) { root.remove(c); c.geometry.dispose(); }
}

function render(sol, cam, opt = {}, props = []) {
  clear();
  setCamera(cam);
  // lights relative to the camera so every view reads the same
  const ctr = V.lerp(sol.J.pelvis, sol.J.chest, 0.5);
  const right = cam.right, eye = cam.eye;
  const kp = V.add(ctr, V.add(V.mul(right, -2.2), V.add([0, 3.6, 0], V.mul(eye, 2.6))));
  key.position.set(...kp); key.target.position.set(...ctr);
  const rc = V.add(ctr, V.add(V.mul(right, -2.5), V.add([0, 1.6, 0], V.mul(eye, -2.6))));
  rimC.position.set(...rc); rimC.target.position.set(...ctr);
  const ro = V.add(ctr, V.add(V.mul(right, 2.6), V.add([0, 1.2, 0], V.mul(eye, -2.0))));
  rimO.position.set(...ro); rimO.target.position.set(...ctr);
  floor.position.y = 0.0005;

  // props first (they may set sol.grip used by the hands)
  const pmeshes = props.map(propMesh);
  const parts = detailParts(sol, FB.bodySpheres(sol), opt);
  const hl = opt.highlight || {}, tint = opt.tint;
  for (const p of parts) {
    let geo;
    if (p.chain) { // tube through spheres: hull per consecutive pair
      for (let i = 0; i + 1 < p.sph.length; i++) addMesh(hullGeometry([p.sph[i], p.sph[i + 1]], 1), p, hl, tint);
      continue;
    }
    geo = hullGeometry(p.sph, p.sub || 2);
    if (geo) addMesh(geo, p, hl, tint);
  }
  for (const m of pmeshes) root.add(m);
  // hair cap: spherical shell in the head frame, hairline tilted (high at the forehead, low at the nape)
  const Hf = sol.F.head, hc = sol.J.head;
  const cap = new THREE.Mesh(hairCapGeo, MAT.hair);
  const c0 = V.add(hc, M.apply(Hf, [-0.014, 0.01, 0]));
  cap.matrixAutoUpdate = false;
  cap.matrix.makeBasis(new THREE.Vector3(...Hf[0]), new THREE.Vector3(...Hf[1]), new THREE.Vector3(...Hf[2]));
  cap.matrix.scale(new THREE.Vector3(0.106, 0.108, 0.1));
  cap.matrix.setPosition(...c0);
  cap.castShadow = true; cap.receiveShadow = true;
  cap.onBeforeRender = () => { const u = MAT.hair.userData.u; for (let i = 0; i < MUS_MAX; i++) u.uMusI.value[i] = 0; u.uTintA.value = 0; };
  root.add(cap);
  composer.render();
}

function addMesh(geo, p, hl, tint) {
  const mat = MAT[p.mat] || MAT.skin;
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true; mesh.receiveShadow = true;
  const mus = [];
  if (p.muscles) for (const k in p.muscles) { const a = hl[k]; if (!a) continue; for (const [c, r] of p.muscles[k]) mus.push([c, r, a]); }
  const tA = tint && tint.amount > 0 && (!tint.parts || tint.parts.some((k) => p.id.startsWith(k))) ? tint.amount : 0;
  mesh.onBeforeRender = () => {
    const u = mat.userData.u;
    for (let i = 0; i < MUS_MAX; i++) {
      const m = mus[i];
      if (m) { u.uMus.value[i].set(m[0][0], m[0][1], m[0][2], m[1]); u.uMusI.value[i] = m[2]; } else { u.uMusI.value[i] = 0; }
    }
    u.uTintA.value = tA;
  };
  root.add(mesh);
}

window.FB3 = { init, render, THREE };
window.dispatchEvent(new Event('fb3ready'));
