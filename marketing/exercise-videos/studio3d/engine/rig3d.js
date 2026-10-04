/* 3D renderer with a skinned MakeHuman character (assets/female.glb, exported by pipeline/export_glb.py).
 * The engine's IK skeleton (core.js) is retargeted onto the rig every frame:
 *   spine/pelvis/head/feet: delta rotation of our segment frame applied to the bone's rest orientation
 *   limbs: aim the bone at our next joint, twist from the elbow/knee hinge; hands from palm direction; fingers curl for grips.
 * BODY dimensions are taken from the rig so IK contacts (feet on floor, hands on bars) land on the mesh.
 * Exposes window.FB3 = { init, render }. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { clone as skClone } from 'three/addons/utils/SkeletonUtils.js';

const FB = window.FB;
const { V, M } = FB;
const v3 = (a) => new THREE.Vector3(a[0], a[1], a[2]);
const arr = (v) => [v.x, v.y, v.z];

// ---------- materials ----------
const SEG_MAX = 10, TINT_MAX = 8;
function withFx(m) {
  m.userData.u = {
    uSegA: { value: Array.from({ length: SEG_MAX }, () => new THREE.Vector4(0, -9, 0, 0.01)) },
    uSegB: { value: Array.from({ length: SEG_MAX }, () => new THREE.Vector4(0, -9, 0, 0)) },
    uTint: { value: new THREE.Color('#ff2a3d') }, uTintA: { value: 0 },
    uTA: { value: Array.from({ length: TINT_MAX }, () => new THREE.Vector4(0, -9, 0, 0.01)) }, uTB: { value: Array.from({ length: TINT_MAX }, () => new THREE.Vector4(0, -9, 0, 0)) },
    uGlow: { value: new THREE.Color('#00c8ff') },
  };
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, m.userData.u);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
      varying vec3 vWP; uniform vec4 uSegA[${SEG_MAX}]; uniform vec4 uSegB[${SEG_MAX}]; uniform vec3 uTint; uniform float uTintA; uniform vec4 uTA[${TINT_MAX}]; uniform vec4 uTB[${TINT_MAX}]; uniform vec3 uGlow;`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      float mg = 0.0;
      for (int i = 0; i < ${SEG_MAX}; i++) {
        vec3 a = uSegA[i].xyz, b = uSegB[i].xyz; vec3 ab = b - a;
        float h = clamp(dot(vWP - a, ab) / max(dot(ab, ab), 1e-6), 0.0, 1.0);
        float d = distance(vWP, a + ab * h);
        mg = max(mg, uSegB[i].w * (1.0 - smoothstep(uSegA[i].w * 0.75, uSegA[i].w * 1.35, d)));
      }
      mg = clamp(mg, 0.0, 1.0);
      float fres = pow(1.0 - clamp(abs(dot(normalize(vNormal), normalize(vViewPosition))), 0.0, 1.0), 2.0);
      diffuseColor.rgb = mix(diffuseColor.rgb, uGlow * 0.5, mg * 0.12);
      totalEmissiveRadiance += uGlow * mg * (0.16 + 1.25 * fres);
      float tw = 0.0;
      for (int i = 0; i < ${TINT_MAX}; i++) {
        vec3 a = uTA[i].xyz, ab = uTB[i].xyz - a;
        float h = clamp(dot(vWP - a, ab) / max(dot(ab, ab), 1e-6), 0.0, 1.0);
        tw = max(tw, uTB[i].w * (1.0 - smoothstep(uTA[i].w * 0.8, uTA[i].w * 1.3, distance(vWP, a + ab * h))));
      }
      tw *= uTintA;
      diffuseColor.rgb = mix(diffuseColor.rgb, uTint, tw * 0.6);
      totalEmissiveRadiance += uTint * tw * 0.3;`);
  };
  return m;
}
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
  foam: new THREE.MeshPhysicalMaterial({ color: '#5b6cf0', roughness: 0.8, sheen: 0.4, sheenColor: new THREE.Color('#9aa6ff') }),
  bolster: new THREE.MeshPhysicalMaterial({ color: '#3a4f7a', roughness: 0.85, sheen: 0.6, sheenColor: new THREE.Color('#8fa3d6') }),
  blanket: new THREE.MeshPhysicalMaterial({ color: '#c9b79c', roughness: 0.95, sheen: 0.7, sheenColor: new THREE.Color('#f2e6d0') }),
  ballSoft: new THREE.MeshPhysicalMaterial({ color: '#00b0ff', roughness: 0.45, clearcoat: 0.4 }),
  ring: new THREE.MeshPhysicalMaterial({ color: '#2a3247', roughness: 0.4, metalness: 0.2 }),
  strapMat: new THREE.MeshPhysicalMaterial({ color: '#ff8a3d', roughness: 0.7 }),
  rope: new THREE.MeshPhysicalMaterial({ color: '#d8dde6', roughness: 0.6 }),
  woodDark: new THREE.MeshPhysicalMaterial({ color: '#8a5a3b', roughness: 0.55, clearcoat: 0.3 }),
  woodLight: new THREE.MeshPhysicalMaterial({ color: '#d2a679', roughness: 0.55, clearcoat: 0.2 }),
  springA: new THREE.MeshPhysicalMaterial({ color: '#ffd23f', roughness: 0.4, metalness: 0.4 }),
  springB: new THREE.MeshPhysicalMaterial({ color: '#ff5a5a', roughness: 0.4, metalness: 0.4 }),
  frameDark: new THREE.MeshPhysicalMaterial({ color: '#3a4256', metalness: 0.5, roughness: 0.4 }),
};

// body with sportswear painted in COLOR_0 (rgb albedo, a = fabric)
function paintMat(map) {
  const m = withFx(new THREE.MeshPhysicalMaterial({ map, color: '#ffffff', roughness: 0.52, sheen: 0.45, sheenColor: new THREE.Color('#c9d2ee'), sheenRoughness: 0.5 }));
  const fx = m.onBeforeCompile;
  m.onBeforeCompile = (sh) => {
    fx(sh);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <map_fragment>', `float fab = 0.0;
        #ifdef USE_MAP
          vec4 sdc = texture2D( map, vMapUv ); diffuseColor.rgb *= sdc.rgb; fab = sdc.a;
        #endif`)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n roughnessFactor = mix(roughnessFactor, 0.74, fab);');
  };
  return m;
}

// ---------- scene ----------
const hairClamp = { u: { value: -10 }, inv: { value: new THREE.Matrix4() }, set y(v) { this.u.value = v; } }, hairMats = [];
let renderer, scene, cam3, propRoot, key, rimC, rimO, hemi, floor, composer, model, bones = {}, rest = {}, fxMats = [], ghost, ghostBones = {}, ghostMat;
let W_ = 1080, H_ = 1920;

async function init(canvas, W = 1080, H = 1920) {
  W_ = W; H_ = H;
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(1); renderer.setSize(W, H, false); renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.65;
  cam3 = new THREE.PerspectiveCamera(30, W / H, 0.1, 100);
  hemi = new THREE.HemisphereLight('#dce9ff', '#2a3256', 0.95); scene.add(hemi);
  key = new THREE.DirectionalLight('#fff2e4', 3.0); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0003; key.shadow.normalBias = 0.02; key.shadow.radius = 5;
  Object.assign(key.shadow.camera, { left: -1.8, right: 1.8, top: 1.8, bottom: -1.8, near: 0.5, far: 14 });
  scene.add(key, key.target);
  rimC = new THREE.DirectionalLight('#38c6ff', 2.4); scene.add(rimC, rimC.target);
  rimO = new THREE.DirectionalLight('#ff8a3d', 1.4); scene.add(rimO, rimO.target);
  floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ color: '#00040e', opacity: 0.5 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  propRoot = new THREE.Group(); scene.add(propRoot);

  const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
  composer = new EffectComposer(renderer, rt); composer.setPixelRatio(1); composer.setSize(W, H);
  composer.addPass(new RenderPass(scene, cam3, null, new THREE.Color(0, 0, 0), 0));
  const gtao = new GTAOPass(scene, cam3, W, H);
  gtao.output = GTAOPass.OUTPUT.Default; gtao.blendIntensity = 0.7;
  gtao.updateGtaoMaterial({ radius: 0.09, distanceExponent: 1.5, thickness: 1.0, scale: 1.0, samples: 24, distanceFallOff: 1.0 });
  gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 9, rings: 3, samples: 24 });
  // ghost and see-through props stay out of the AO normal/depth pass (they caused speckles)
  const ov = gtao._overrideVisibility.bind(gtao);
  gtao._overrideVisibility = function () { ov(); this.scene.traverse((o) => { if (o.visible && o.userData && o.userData.noAO) { o.visible = false; this._visibilityCache.push(o); } }); };
  composer.addPass(gtao);
  composer.addPass(new OutputPass());

  const base = new URL('../assets/', import.meta.url);
  const [gltf, rigInfo] = await Promise.all([
    new GLTFLoader().loadAsync(new URL('female.glb', base).href),
    fetch(new URL('female.rig.json', base)).then((r) => r.json()),
  ]);
  model = new THREE.Group();
  model.rotation.y = Math.PI / 2;           // glTF (faces +Z) -> engine (faces +X, right = +Z)
  model.add(gltf.scene); scene.add(model);
  gltf.scene.traverse((o) => {
    if (o.isBone) bones[o.name] = o;
    if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false; o.material = material(o.material); }
  });
  model.updateMatrixWorld(true);
  for (const n in bones) {
    const b = bones[n];
    rest[n] = { q: b.getWorldQuaternion(new THREE.Quaternion()), p: b.getWorldPosition(new THREE.Vector3()), lq: b.quaternion.clone(), lp: b.position.clone() };
  }
  setupBody(rigInfo);
  // ghost: translucent copy of the character for target poses
  ghostMat = new THREE.MeshBasicMaterial({ color: '#8fdcff', transparent: true, opacity: 0.2, depthWrite: true, polygonOffset: true, polygonOffsetFactor: 4, polygonOffsetUnits: 16 });
  ghost = new THREE.Group(); ghost.rotation.y = Math.PI / 2;
  const gs = skClone(gltf.scene); ghost.add(gs);
  gs.traverse((o) => { if (o.isBone) ghostBones[o.name] = o; if (o.isMesh) { o.material = ghostMat; o.castShadow = false; o.receiveShadow = false; o.frustumCulled = false; o.renderOrder = 5; const nm = (o.name || '').toLowerCase(); if (/eyebrow|eyelash|high-poly|ponytail/.test(nm)) o.visible = false; o.userData.noAO = true; } });
  ghost.visible = false; scene.add(ghost);
}

function material(m) {
  const name = (m.name || '').toLowerCase();
  const map = m.map || null, nrm = m.normalMap || null;
  if (map) map.anisotropy = 8;
  let out;
  if (name.includes('bodypaint')) out = paintMat(map);
  else if (name.includes('sportsuit')) out = withFx(new THREE.MeshPhysicalMaterial({ map, normalMap: nrm, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -8, roughness: 0.7, sheen: 0.35, sheenColor: new THREE.Color('#c8d0e8'), sheenRoughness: 0.5 }));
  else if (name.includes('ponytail')) {
    out = new THREE.MeshPhysicalMaterial({ map, color: '#7a5038', roughness: 0.48, sheen: 1, sheenColor: new THREE.Color('#c08e6a'), sheenRoughness: 0.35, alphaTest: 0.45, side: THREE.DoubleSide });
    out.onBeforeCompile = (sh) => {
      sh.uniforms.uHairY = hairClamp.u; sh.uniforms.uInvModel = hairClamp.inv;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uHairY; uniform mat4 uInvModel;')
        .replace('#include <skinning_vertex>', '#include <skinning_vertex>\n{ vec4 hw = modelMatrix * vec4(transformed, 1.0); if (hw.y < uHairY) { hw.y = uHairY + (hw.y - uHairY) * 0.08; transformed = (uInvModel * hw).xyz; } }');
    };
    hairMats.push(out);
  }
  else if (name.includes('eyebrow') || name.includes('eyelash')) out = new THREE.MeshStandardMaterial({ map, color: '#2a1a12', roughness: 0.7, alphaTest: 0.35, transparent: false, side: THREE.DoubleSide });
  else if (name.includes('high-poly')) out = new THREE.MeshPhysicalMaterial({ map, roughness: 0.15, clearcoat: 1, alphaTest: 0.5 });
  else if (name.includes('shoes')) out = new THREE.MeshPhysicalMaterial({ map, roughness: 0.55, sheen: 0.2 });
  else if (name.includes('under_legs')) out = withFx(new THREE.MeshPhysicalMaterial({ color: new THREE.Color('#27345f'), roughness: 0.7, sheen: 0.35, sheenColor: new THREE.Color('#c8d0e8'), sheenRoughness: 0.5, polygonOffset: true, polygonOffsetFactor: 6, polygonOffsetUnits: 24 }));
  else if (name.includes('under_top')) out = withFx(new THREE.MeshPhysicalMaterial({ color: new THREE.Color('#ff6a14'), roughness: 0.7, sheen: 0.35, sheenColor: new THREE.Color('#c8d0e8'), sheenRoughness: 0.5, polygonOffset: true, polygonOffsetFactor: 6, polygonOffsetUnits: 24 }));
  else if (name.includes('lips')) out = withFx(new THREE.MeshPhysicalMaterial({ color: '#c8786a', roughness: 0.4, sheen: 0.3 }));
  else if (name.includes('nail')) out = new THREE.MeshPhysicalMaterial({ color: '#f0bba5', roughness: 0.3 });
  else out = paintMat();
  if (out.userData.u) fxMats.push(out);
  return out;
}

// ---------- body dimensions from the rig ----------
function setupBody(info) {
  const P = (n) => rest[n].p;
  const B = FB.BODY;
  const mid = (a, b) => a.clone().add(b).multiplyScalar(0.5);
  const hipC = mid(P('thigh_l'), P('thigh_r'));
  const sole = info.bounds['FB_female_body.shoes05'].min[2];
  const shoeBack = info.bounds['FB_female_body.shoes05'].max[1], shoeFront = info.bounds['FB_female_body.shoes05'].min[1];
  const ankleB = info.bones.foot_r.head;
  const waist = P('spine_02'), neck = P('neck_01');
  Object.assign(B, {
    hipHalf: Math.abs(P('thigh_r').z - hipC.z),
    thigh: P('thigh_r').distanceTo(P('calf_r')), shin: P('calf_r').distanceTo(P('foot_r')),
    ankleH: ankleB[2] - sole, heel: shoeBack - ankleB[1] - 0.004, toe: ankleB[1] - shoeFront - 0.004,
    lumbar: waist.y - hipC.y, thorax: neck.y - waist.y,
    shoulderHalf: P('upperarm_r').z - neck.z, shoulderDrop: neck.y - P('upperarm_r').y, shoulderFwd: P('upperarm_r').x - neck.x,
    upper: P('upperarm_r').distanceTo(P('lowerarm_r')), fore: P('lowerarm_r').distanceTo(P('hand_r')),
    hand: P('hand_r').distanceTo(P('middle_01_r')) * 1.25,
    headFwd: 0.05, headUp: 0.19, headR: 0.105, neck: 0.12,
  });
  FB.RIG = { hipC };
  // rest directions for aimed limbs
  const sub = (a, b) => P(a).clone().sub(P(b)).normalize();
  for (const s of ['l', 'r']) {
    const fwd = new THREE.Vector3(1, 0, 0);
    rest['thigh_' + s].d = sub('calf_' + s, 'thigh_' + s); rest['thigh_' + s].s = fwd.clone();
    rest['calf_' + s].d = sub('foot_' + s, 'calf_' + s); rest['calf_' + s].s = fwd.clone();
    const du = sub('lowerarm_' + s, 'upperarm_' + s), df = sub('hand_' + s, 'lowerarm_' + s);
    const hinge = du.clone().cross(df).normalize();
    rest['upperarm_' + s].d = du; rest['upperarm_' + s].s = hinge;
    rest['lowerarm_' + s].d = df; rest['lowerarm_' + s].s = hinge.clone();
    const dh = sub('middle_01_' + s, 'hand_' + s);
    const t = sub('index_01_' + s, 'pinky_01_' + s);
    let pn = s === 'r' ? t.clone().cross(dh) : dh.clone().cross(t);   // palm normal (right: n = t x f, left: n = f x t)
    rest['hand_' + s].d = dh; rest['hand_' + s].s = pn.normalize();
    // finger curl axes (hand-rest frame -> world rest), curl toward the palm
    for (const f of ['index', 'middle', 'ring', 'pinky', 'thumb']) {
      const a = P(f + '_01_' + s), b = P(f + '_02_' + s);
      const fd = b.clone().sub(a).normalize();
      rest[f + '_01_' + s].axis = fd.clone().cross(rest['hand_' + s].s).normalize();
    }
  }
}

// ---------- retarget ----------
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion();
const qFrame = (F) => new THREE.Quaternion().setFromRotationMatrix(_m.makeBasis(v3(F[0]), v3(F[1]), v3(F[2])));
function basisQ(d, s) {
  const x = d.clone().normalize();
  const y = s.clone().sub(x.clone().multiplyScalar(s.dot(x))).normalize();
  const z = x.clone().cross(y);
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
}
function aimQ(name, dNow, sNow) {
  const r = rest[name];
  const qr = basisQ(r.d, r.s), qn = basisQ(dNow, sNow);
  return qn.multiply(qr.invert()).multiply(r.q);
}
let B_ = null;
function setWorldQ(name, qw) {
  const b = B_[name];
  b.parent.getWorldQuaternion(_q2);
  b.quaternion.copy(_q2.invert().multiply(qw));
  b.updateWorldMatrix(false, false);
}
function deltaQ(name, F) { return qFrame(F).multiply(rest[name].q); }

function slerpF(Fa, Fb, t) { const qa = qFrame(Fa), qb = qFrame(Fb); qa.slerp(qb, t); const m = new THREE.Matrix4().makeRotationFromQuaternion(qa); const e = m.elements; return [[e[0], e[1], e[2]], [e[4], e[5], e[6]], [e[8], e[9], e[10]]]; }

function handPose(sol, s, propInfo) {
  const { J, F } = sol, sg = s === 'R' ? 1 : -1;
  const fd = v3(F['arm' + s].fd), b = v3(F['arm' + s].b);
  const T = (v) => v3(M.apply(F.thorax, v));
  const grip = propInfo.grip && propInfo.grip[s];
  let dh = fd.clone(), pref, curl = 0.3;
  if (!grip && (F['handFlat' + s] || J['hand' + s][1] < 0.075)) {           // flat, weight-bearing: palm from the wrist to the palm centre
    dh = v3(J['hand' + s]).sub(v3(J['wrist' + s])); dh.y = 0; dh.normalize();   // fingers lie flat on the support
    pref = new THREE.Vector3(0, -1, 0); curl = 0.05;
  } else if (grip) {
    curl = 1;
    const kind = propInfo.gripKind || 'neutral';
    // bar/handle grips: palm normal is perpendicular to the forearm and the handle axis (stable for any elbow angle);
    // pronated = knuckles forward (palm toward the thighs when hanging, forward when pressing overhead), supinated = opposite
    const ax = v3(grip).normalize();
    if (kind === 'pronated' || kind === 'supinated') { pref = fd.clone().cross(ax); if (pref.lengthSq() < 1e-4) pref = b.clone(); if (kind === 'supinated') pref.negate(); }
    else pref = kind === 'cup' ? T([0.2, 0.6, -0.6 * sg]) : T([0, 0, -sg]);
  } else pref = T([0.15, 0, -sg]).add(b.clone().multiplyScalar(0.35));
  // explicit palm direction for free hands: pose.palm / palmL / palmR = 'down' | 'up' | 'in' | 'out' | 'forward' | 'back'
  const pp = sol.pose && (sol.pose['palm' + s] ?? sol.pose.palm);
  if (Array.isArray(pp) && !grip) pref = T([pp[0], pp[1], pp[2] * sg]);
  else if (pp && !grip) pref = { down: new THREE.Vector3(0, -1, 0), up: new THREE.Vector3(0, 1, 0), in: T([0, 0, -sg]), out: T([0, 0, sg]), forward: T([1, 0, 0]), back: T([-1, 0, 0]) }[pp] || pref;
  const pc = sol.pose && (sol.pose['curl' + s] ?? sol.pose.curl);
  if (typeof pc === 'number') curl = pc;
  const pn = pref.clone().sub(dh.clone().multiplyScalar(pref.dot(dh)));
  if (pn.lengthSq() < 1e-6) pn.copy(b); pn.normalize();
  return { dh, pn, curl };
}

const FINGERS = [['index', [62, 75, 45]], ['middle', [65, 78, 45]], ['ring', [66, 78, 45]], ['pinky', [68, 75, 45]], ['thumb', [18, 30, 25]]];

function retarget(sol, propInfo, bones, root) {
  B_ = bones;
  const { J, F } = sol;
  const R = FB.RIG;
  // pelvis position + spine
  const qp = deltaQ('pelvis', F.pelvis);
  const off = rest.pelvis.p.clone().sub(R.hipC).applyQuaternion(qFrame(F.pelvis));
  const pw = v3(J.pelvis).add(off);
  setWorldQ('pelvis', qp);
  bones.pelvis.position.copy(bones.pelvis.parent.worldToLocal(pw.clone()));
  bones.pelvis.updateWorldMatrix(false, false);
  setWorldQ('spine_01', deltaQ('spine_01', F.lumbar));
  setWorldQ('spine_02', deltaQ('spine_02', F.thorax));
  setWorldQ('spine_03', deltaQ('spine_03', F.thorax));
  setWorldQ('neck_01', deltaQ('neck_01', slerpF(F.thorax, F.head, 0.5)));
  setWorldQ('head', deltaQ('head', F.head));
  for (const S of ['L', 'R']) {
    const s = S.toLowerCase(), sg = S === 'R' ? 1 : -1;
    // clavicle follows the thorax (+ shrug)
    const shrug = (sol.pose && (sol.pose['shrug' + S] ?? sol.pose.shrug)) || 0;
    const qc = deltaQ('clavicle_' + s, F.thorax);
    if (shrug) qc.premultiply(new THREE.Quaternion().setFromAxisAngle(v3(M.apply(F.thorax, [1, 0, 0])), -sg * shrug * 3.2));
    setWorldQ('clavicle_' + s, qc);
    // arm
    const arm = F['arm' + S];
    const u = v3(arm.u), fdv = v3(arm.fd), bb = v3(arm.b);
    const hinge = u.clone().cross(bb).normalize();
    setWorldQ('upperarm_' + s, aimQ('upperarm_' + s, v3(J['elbow' + S]).sub(bones['upperarm_' + s].getWorldPosition(new THREE.Vector3())).normalize(), hinge));
    setWorldQ('lowerarm_' + s, aimQ('lowerarm_' + s, v3(J['wrist' + S]).sub(bones['lowerarm_' + s].getWorldPosition(new THREE.Vector3())).normalize(), hinge));
    const hp = handPose(sol, S, propInfo);
    const qh = aimQ('hand_' + s, hp.dh, hp.pn);
    setWorldQ('hand_' + s, qh);
    const qHD = qh.clone().multiply(rest['hand_' + s].q.clone().invert());
    for (const [f, ang] of FINGERS) {
      const axis = rest[f + '_01_' + s].axis.clone().applyQuaternion(qHD);
      let acc = 0;
      for (let k = 1; k <= 3; k++) {
        const n = `${f}_0${k}_${s}`; if (!B_[n]) continue;
        acc += ang[k - 1] * hp.curl * Math.PI / 180;
        const qw = new THREE.Quaternion().setFromAxisAngle(axis, acc).multiply(qHD.clone().multiply(rest[n].q));
        setWorldQ(n, qw);
      }
    }
    // leg
    const kneeF = v3(M.apply(F['thigh' + S], [1, 0, 0]));
    setWorldQ('thigh_' + s, aimQ('thigh_' + s, v3(J['knee' + S]).sub(bones['thigh_' + s].getWorldPosition(new THREE.Vector3())).normalize(), kneeF));
    const shinF = v3(M.apply(F['shin' + S], [1, 0, 0]));
    setWorldQ('calf_' + s, aimQ('calf_' + s, v3(J['ankle' + S]).sub(bones['calf_' + s].getWorldPosition(new THREE.Vector3())).normalize(), shinF));
    setWorldQ('foot_' + s, deltaQ('foot_' + s, F['foot' + S]));
    setWorldQ('ball_' + s, deltaQ('ball_' + s, F['foot' + S]));
  }
  root.updateMatrixWorld(true);
}

// ---------- props ----------
// plates (and other bulky items tagged xray) between the camera and the body are drawn see-through so they never hide the technique
const XRAY = new THREE.MeshPhysicalMaterial({ color: '#6f7fa8', roughness: 0.4, metalness: 0.2, transparent: true, opacity: 0.28, depthWrite: false });
function propMesh(d, view) {
  let m = PMAT[d.m] || PMAT.iron;
  if (view && (d.m === 'plate' || d.xray)) {
    const c = d.c || V.lerp(d.a, d.b, 0.5);
    if (V.dot(V.sub(c, view.body), view.eye) > 0.12) m = XRAY;
  }
  let mesh;
  if (d.t === 'cyl') {
    const a = v3(d.a), b = v3(d.b);
    const g = new THREE.CylinderGeometry(d.r, d.r, a.distanceTo(b), d.seg || 28, 1, false);
    if (d.seg === 6) g.rotateY(Math.PI / 6);
    mesh = new THREE.Mesh(g, m);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  } else if (d.t === 'box') {
    mesh = new THREE.Mesh(d.round ? roundedBox(d.s, d.round) : new THREE.BoxGeometry(...d.s), m); mesh.position.set(...d.c);
    if (d.R) mesh.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(v3(d.R[0]), v3(d.R[1]), v3(d.R[2])));
  } else if (d.t === 'torus') {
    const a = v3(d.a), b = v3(d.b), R = Math.max(0.05, a.distanceTo(b) / 2 + d.r);
    mesh = new THREE.Mesh(new THREE.TorusGeometry(R, d.r, 14, 48), m);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    const ax = b.clone().sub(a).normalize(); const up = Math.abs(ax.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    mesh.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(ax, up.clone().sub(ax.clone().multiplyScalar(up.dot(ax))).normalize(), ax.clone().cross(up).normalize()));
  } else if (d.t === 'sph') {
    mesh = new THREE.Mesh(new THREE.SphereGeometry(d.r, 32, 20), m); mesh.position.set(...d.c);
  } else if (d.t === 'tube') {
    const curve = new THREE.CatmullRomCurve3(d.pts.map(v3));
    mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(2, d.pts.length * 6), d.r, 10, false), m);
  }
  mesh.castShadow = true; mesh.receiveShadow = true;
  return mesh;
}

// working-muscle regions as segments [a, b, radius, intensity]
function muscleSegments(sol, hl, only) {
  const { J, F } = sol, out = [];
  const T = (o, v) => V.add(o, M.apply(F.thorax, v)), P = (o, v) => V.add(o, M.apply(F.pelvis, v));
  const add = (k, a, b, r) => { const i = hl[k]; if (i) out.push([a, b, r, i]); };
  for (const s of (only ? [only] : ['L', 'R'])) {
    const sg = s === 'R' ? 1 : -1;
    const kneeUp = V.lerp(J['knee' + s], J['hip' + s], 0.12);
    add('quads', J['hip' + s], kneeUp, 0.1); add('hamstrings', J['hip' + s], kneeUp, 0.1); add('adductors', J['hip' + s], kneeUp, 0.1);
    add('calves', J['knee' + s], V.lerp(J['knee' + s], J['ankle' + s], 0.75), 0.07); add('tibialis', J['knee' + s], J['ankle' + s], 0.06);
    add('glutes', P(J.pelvis, [-0.07, 0.0, 0.07 * sg]), P(J.pelvis, [-0.05, -0.06, 0.08 * sg]), 0.11);
    add('delts', J['shoulder' + s], V.lerp(J['shoulder' + s], J['elbow' + s], 0.25), 0.07);
    add('biceps', V.lerp(J['shoulder' + s], J['elbow' + s], 0.2), J['elbow' + s], 0.055); add('triceps', V.lerp(J['shoulder' + s], J['elbow' + s], 0.2), J['elbow' + s], 0.055);
    add('forearms', J['elbow' + s], J['wrist' + s], 0.05);
    add('chest', T(J.chest, [0.08, 0.08, 0.02 * sg]), T(J.chest, [0.06, 0.1, 0.13 * sg]), 0.08);
    add('lats', T(J.chest, [-0.04, 0.1, 0.1 * sg]), T(J.waist, [-0.03, 0.05, 0.09 * sg]), 0.08);
    add('upperback', T(J.chest, [-0.08, 0.16, 0.0]), T(J.chest, [-0.07, 0.12, 0.12 * sg]), 0.08);
    add('obliques', T(J.waist, [0.02, 0.0, 0.11 * sg]), P(J.pelvis, [0.02, 0.12, 0.11 * sg]), 0.06);
  }
  add('core', T(J.waist, [0.09, 0.08, 0]), P(J.pelvis, [0.08, 0.08, 0]), 0.08);
  add('lowerback', T(J.waist, [-0.08, 0.05, 0]), P(J.pelvis, [-0.08, 0.08, 0]), 0.08);
  return out.slice(0, SEG_MAX);
}

// box with rounded edges (soft studio look)
const _rb = new Map();
function roundedBox(size, r) {
  const k = size.join(',') + ':' + r; if (_rb.has(k)) return _rb.get(k).clone();
  const g = new THREE.BoxGeometry(size[0], size[1], size[2], 6, 4, 6), p = g.attributes.position, h = size.map((v) => v / 2), q = new THREE.Vector3();
  const rr = Math.min(r, ...h);
  for (let i = 0; i < p.count; i++) {
    q.fromBufferAttribute(p, i);
    const inner = new THREE.Vector3(Math.max(-h[0] + rr, Math.min(h[0] - rr, q.x)), Math.max(-h[1] + rr, Math.min(h[1] - rr, q.y)), Math.max(-h[2] + rr, Math.min(h[2] - rr, q.z)));
    const d = q.clone().sub(inner); if (d.lengthSq() > 1e-12) q.copy(inner.add(d.normalize().multiplyScalar(rr)));
    p.setXYZ(i, q.x, q.y, q.z);
  }
  g.computeVertexNormals(); _rb.set(k, g); return g.clone();
}

// error tint regions per body part id prefix (optionally with side suffix, e.g. 'upperR')
function tintSegments(sol, parts) {
  const J = sol.J, out = [];
  const lim = (base, S, a, b, r) => out.push([J[a + S], J[b + S], r]);
  const want = parts || ['thigh', 'shin', 'foot', 'upper', 'fore', 'hand', 'pelvis', 'waist', 'chest', 'neck', 'face'];
  for (const p of want) {
    const m = /^([a-z]+)([LR]?)$/.exec(p); if (!m) continue;
    const base = m[1], sides = m[2] ? [m[2]] : ['L', 'R'];
    for (const S of sides) {
      if (base === 'thigh') lim(base, S, 'hip', 'knee', 0.1);
      else if (base === 'shin') lim(base, S, 'knee', 'ankle', 0.07);
      else if (base === 'foot') lim(base, S, 'heel', 'toe', 0.06);
      else if (base === 'upper') lim(base, S, 'shoulder', 'elbow', 0.065);
      else if (base === 'fore') lim(base, S, 'elbow', 'wrist', 0.05);
      else if (base === 'hand') lim(base, S, 'wrist', 'hand', 0.06);
    }
    if (base === 'pelvis') out.push([J.hipL, J.hipR, 0.13]);
    else if (base === 'waist') out.push([J.pelvis, J.waist, 0.14]);
    else if (base === 'chest') out.push([J.waist, J.neck, 0.15]);
    else if (base === 'neck') out.push([J.neck, J.head, 0.07]);
    else if (base === 'face' || base === 'hair' || base === 'head') out.push([J.head, J.head, 0.13]);
  }
  return out.slice(0, TINT_MAX);
}

// ---------- camera ----------
function setCamera(cam) {
  cam3.position.set(...cam.pos); cam3.up.set(0, 1, 0); cam3.lookAt(...cam.tgt); cam3.updateMatrixWorld();
  const n = 0.1, f = 100, fx = cam.f, W = W_, H = H_;
  cam3.projectionMatrix.set(2 * fx / W, 0, 1 - 2 * cam.cx / W, 0, 0, 2 * fx / H, 2 * cam.cy / H - 1, 0, 0, 0, -(f + n) / (f - n), -2 * f * n / (f - n), 0, 0, -1, 0);
  cam3.projectionMatrixInverse.copy(cam3.projectionMatrix).invert();
}

// ---------- frame ----------
function render(sol, cam, opt = {}, props = [], propInfo = {}) {
  for (const c of [...propRoot.children]) { propRoot.remove(c); c.geometry.dispose(); }
  setCamera(cam);
  const ctr = V.lerp(sol.J.pelvis, sol.J.chest, 0.5), right = cam.right, eye = cam.eye;
  key.position.set(...V.add(ctr, V.add(V.mul(right, -2.2), V.add([0, 3.6, 0], V.mul(eye, 2.6))))); key.target.position.set(...ctr);
  rimC.position.set(...V.add(ctr, V.add(V.mul(right, -2.5), V.add([0, 1.6, 0], V.mul(eye, -2.6))))); rimC.target.position.set(...ctr);
  rimO.position.set(...V.add(ctr, V.add(V.mul(right, 2.6), V.add([0, 1.2, 0], V.mul(eye, -2.0))))); rimO.target.position.set(...ctr);
  sol.pose = opt.pose;
  retarget(sol, propInfo, bones, model);
  if (opt.ghost && opt.ghost.amount > 0.01) {
    opt.ghost.sol.pose = opt.ghost.pose;
    retarget(opt.ghost.sol, propInfo, ghostBones, ghost);
    ghostMat.opacity = 0.17 * opt.ghost.amount; ghost.visible = true;
  } else ghost.visible = false;
  const view = { eye: cam.eye, body: V.lerp(sol.J.pelvis, sol.J.neck, 0.5) };
  for (const d of props) { const pm = propMesh(d, view); if (pm.material === XRAY) { pm.castShadow = false; pm.renderOrder = 4; pm.userData.noAO = true; } propRoot.add(pm); }
  // muscle highlight: smooth tubes along the working segments (fresnel rim glow in the shader)
  const segs = muscleSegments(sol, opt.highlight || {}, opt.side);
  const tsegs = opt.tint && opt.tint.amount > 0 ? tintSegments(sol, opt.tint.parts) : [];
  for (const m of fxMats) {
    const u = m.userData.u;
    for (let i = 0; i < SEG_MAX; i++) { const q = segs[i]; if (q) { u.uSegA.value[i].set(q[0][0], q[0][1], q[0][2], q[2]); u.uSegB.value[i].set(q[1][0], q[1][1], q[1][2], q[3]); } else u.uSegB.value[i].w = 0; }
    for (let i = 0; i < TINT_MAX; i++) { const q = tsegs[i]; if (q) { u.uTA.value[i].set(q[0][0], q[0][1], q[0][2], q[2]); u.uTB.value[i].set(q[1][0], q[1][1], q[1][2], 1); } else u.uTB.value[i].w = 0; }
    u.uTintA.value = tsegs.length ? opt.tint.amount : 0;
  }
  // ponytail rests on the support surface when lying (never through the floor, mat, bench or carriage)
  const tu = V.norm(V.sub(sol.J.neck, sol.J.waist)), lying = Math.max(0, Math.min(1, (0.75 - Math.abs(tu[1])) / 0.45));
  hairClamp.y = Math.max(0.012, sol.J.head[1] - 0.2 - (1 - lying) * 2.0);   // only the ponytail is clamped, never the scalp hair
  model.traverse((o) => { if (o.isMesh && hairMats.includes(o.material)) hairClamp.inv.value.copy(o.matrixWorld).invert(); });
  composer.render();
}

window.FB3 = { init, render, THREE, bones: () => bones };
window.dispatchEvent(new Event('fb3ready'));
