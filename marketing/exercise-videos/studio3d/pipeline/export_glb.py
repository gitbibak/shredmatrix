# Blender: export the MPFB female to GLB for the three.js renderer (anim/assets/female.glb) and dump rest-pose
# bone positions (anim/assets/female.rig.json).
#
# Sportswear is painted onto the body as vertex colours instead of separate cloth meshes, so there is one skinned
# surface: no cloth/body interpenetration, no sagging gussets, identical deformation everywhere.
#   COLOR_0.rgb = albedo (linear), COLOR_0.a = fabric (1) / skin (0)
#
# ~/Applications/Blender.app/Contents/MacOS/Blender -b source/female.blend --python pipeline/export_glb.py
import bpy, json, os, numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'assets')
os.makedirs(OUT, exist_ok=True)

rig = bpy.data.objects['FB_female_rig']
rig.data.pose_position = 'REST'
bpy.context.view_layer.update()

def lin(h):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]

SKIN = lin('#eab196')
NAVY = lin('#27345f')
NAVY_BAND = lin('#1e2950')
ORANGE = lin('#ff6a14')
ORANGE_DK = lin('#e0560a')
PANEL = lin('#1e2950')

# ---- rig + bounds json (Blender coords: z up, character faces -y, character's right = -x)
bones = {}
for b in rig.data.bones:
    bones[b.name] = { 'head': list(rig.matrix_world @ b.head_local), 'tail': list(rig.matrix_world @ b.tail_local), 'parent': b.parent.name if b.parent else None }
dg = bpy.context.evaluated_depsgraph_get()
bounds = {}
for o in bpy.data.objects:
    if o.type != 'MESH': continue
    ev = o.evaluated_get(dg); me = ev.to_mesh()
    vs = np.array([list(o.matrix_world @ v.co) for v in me.vertices])
    bounds[o.name] = { 'min': vs.min(0).tolist(), 'max': vs.max(0).tolist() }
    ev.to_mesh_clear()
json.dump({ 'bones': bones, 'bounds': bounds }, open(os.path.join(OUT, 'female.rig.json'), 'w'), indent=1)

# ---- remove the cloth mesh; keep the whole body (only feet stay hidden inside the shoes)
suit = bpy.data.objects['FB_female_body.female_sportsuit01']
bpy.data.objects.remove(suit, do_unlink=True)
body = bpy.data.objects['FB_female_body']
for m in list(body.modifiers):
    if m.type == 'MASK' and m.vertex_group in ('Delete.female_sportsuit01', 'Delete.shoes05'): body.modifiers.remove(m)

# ---- soften the chest: volume-preserving (Taubin) smoothing around the bust and the under-bust crease
me = body.data
co = np.array([list(v.co) for v in me.vertices])
wco = np.array([list(body.matrix_world @ v.co) for v in me.vertices])
nbr = [[] for _ in range(len(co))]
for e in me.edges: a, b = e.vertices; nbr[a].append(b); nbr[b].append(a)
wgt = np.zeros(len(co))
for cx in (0.085, -0.085):
    d = np.linalg.norm((wco - np.array([cx, -0.11, 1.245])) * np.array([1.0, 0.8, 1.0]), axis=1)
    wgt = np.maximum(wgt, np.clip(1 - d / 0.14, 0, 1))
wgt = wgt * wgt * (3 - 2 * wgt)
idx = np.where(wgt > 0)[0]
cur = co.copy()
for it in range(14):
    for lam in (0.55, -0.58):
        avg = np.array([cur[nbr[i]].mean(0) if nbr[i] else cur[i] for i in idx])
        cur[idx] += (lam * wgt[idx])[:, None] * (avg - cur[idx])
delta = cur - co
for v in me.vertices: v.co = cur[v.index]
if me.shape_keys:
    for kb in me.shape_keys.key_blocks:
        kd = np.array([list(p.co) for p in kb.data]); kd += delta
        kb.data.foreach_set('co', kd.ravel())
me.update()
print('chest smoothed', len(idx), 'max shift', float(np.abs(delta).max()))

# ---- paint the sportswear into a texture (per-pixel rules on the rest-pose position/normal of every UV texel)
me = body.data
me.calc_loop_triangles()
uvl = me.uv_layers.active.data
gidx = {g.name: g.index for g in body.vertex_groups}
ARMG = set(gidx[n] for n in ('upperarm_l', 'upperarm_r', 'lowerarm_l', 'lowerarm_r', 'hand_l', 'hand_r') if n in gidx)
nv = len(me.vertices)
VP = np.array([list(body.matrix_world @ v.co) for v in me.vertices])
VN = np.array([list((body.matrix_world.to_3x3() @ v.normal).normalized()) for v in me.vertices])
VA = np.array([sum(g.weight for g in v.groups if g.group in ARMG) for v in me.vertices])
keep = set(i for i, m in enumerate(me.materials) if m and any(k in m.name for k in ('lips', 'nail')))
TS = 2048
pos = np.zeros((TS, TS, 3), np.float32); nrm = np.zeros((TS, TS, 3), np.float32); arm = np.zeros((TS, TS), np.float32); hit = np.zeros((TS, TS), bool)
for tri in me.loop_triangles:
    if tri.material_index in keep: continue
    uv = np.array([uvl[l].uv[:] for l in tri.loops]) * TS
    vi = list(tri.vertices)
    x0, y0 = np.floor(uv.min(0)).astype(int); x1, y1 = np.ceil(uv.max(0)).astype(int)
    x0, y0 = max(x0, 0), max(y0, 0); x1, y1 = min(x1, TS - 1), min(y1, TS - 1)
    if x1 < x0 or y1 < y0: continue
    xs, ys = np.meshgrid(np.arange(x0, x1 + 1) + 0.5, np.arange(y0, y1 + 1) + 0.5)
    (ax, ay), (bx, by), (cx, cy) = uv
    den = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy)
    if abs(den) < 1e-9: continue
    l0 = ((by - cy) * (xs - cx) + (cx - bx) * (ys - cy)) / den
    l1 = ((cy - ay) * (xs - cx) + (ax - cx) * (ys - cy)) / den
    l2 = 1 - l0 - l1
    m = (l0 >= -0.02) & (l1 >= -0.02) & (l2 >= -0.02)
    if not m.any(): continue
    L = np.stack([l0, l1, l2], -1)[m]
    yy, xx = (ys[m] - 0.5).astype(int), (xs[m] - 0.5).astype(int)
    pos[yy, xx] = L @ VP[vi]; nrm[yy, xx] = L @ VN[vi]; arm[yy, xx] = L @ VA[vi]; hit[yy, xx] = True
n = nrm / np.maximum(1e-6, np.linalg.norm(nrm, axis=-1, keepdims=True))
X, Y, Z = pos[..., 0], pos[..., 1], pos[..., 2]
img = np.zeros((TS, TS, 4), np.float32)
def sm(d, e=0.0018):                                   # soft edge: 0..1 across ~2e metres (anti-aliased boundaries)
    return np.clip(0.5 + d / (2 * e), 0, 1)
def layer(mask, hexc, fab):
    h = hexc.lstrip('#'); c = np.array([int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)] + [fab], np.float32)
    m = (mask * hit)[..., None]
    img[:] = img * (1 - m) + c[None, None, :] * m
layer(np.ones_like(X), '#eab196', 0.0)
ax_ = np.abs(X)
legs = sm(1.03 - Z) * sm(0.30 - ax_)
layer(legs, '#27345f', 1.0)
layer(legs * sm(Z - 1.006), '#1f2a52', 1.0)                                       # waistband
# outer side stripe: constant 1.6 cm arc around the leg axis (hip -> knee -> ankle bone line)
def axis_at(z, side):
    hb, kb, ab = (np.array(bones[n + side]['head']) for n in ('thigh_', 'calf_', 'foot_'))
    t1 = np.clip((hb[2] - z) / (hb[2] - kb[2]), 0, 1); t2 = np.clip((kb[2] - z) / (kb[2] - ab[2]), 0, 1)
    up = z >= kb[2]
    ax = np.where(up, hb[0] + (kb[0] - hb[0]) * t1, kb[0] + (ab[0] - kb[0]) * t2)
    ay = np.where(up, hb[1] + (kb[1] - hb[1]) * t1, kb[1] + (ab[1] - kb[1]) * t2)
    return ax, ay
stripe = np.zeros_like(X)
lat = n[..., 0] * np.sign(X)
for side, sgn in (('l', 1), ('r', -1)):
    axx, ayy = axis_at(Z, side)
    dx, dy = (X - axx) * sgn, Y - ayy
    r = np.hypot(dx, dy); ang = np.arctan2(dy, dx)
    stripe = np.maximum(stripe, (np.sign(X) == sgn) * sm(dx) * sm(0.008 - np.abs(ang) * r))
layer(legs * stripe * sm(Z - 0.3, 0.01) * sm(0.985 - Z) * sm(lat - 0.6, 0.05), '#ff6a14', 1.0)
layer(legs * sm(0.125 - Z, 0.003), '#e9edf3', 1.0)                                # socks (feet sit inside the shoes)
# sports top: U-neck front, higher back, curved armholes, straps over the shoulders
neck = np.where(Y < -0.02, 1.335 + 2.2 * ax_ ** 2, 1.395 + 1.0 * ax_ ** 2)
armhole = 1.40 - 3.2 * np.maximum(0, ax_ - 0.095)
body_top = sm(Z - 1.172) * sm(0.158 - ax_) * sm(np.minimum(neck, armhole) - Z)
strap = sm(ax_ - 0.066) * sm(0.108 - ax_) * sm(1.48 - Z) * sm(Z - 1.3)
top = np.maximum(body_top, strap)
layer(top, '#ff6a14', 1.0)
layer(top * sm(1.19 - Z, 0.0025), '#d9520a', 1.0)                                  # soft hem band
# dilate into empty texels so UV seams do not bleed
filled = hit.copy()
for _ in range(6):
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        src = np.roll(np.roll(img, dy, 0), dx, 1); sh = np.roll(np.roll(filled, dy, 0), dx, 1)
        mm = ~filled & sh; img[mm] = src[mm]; filled |= mm
tex = bpy.data.images.new('bodypaint', TS, TS, alpha=True)
tex.pixels[:] = img.ravel()
tex.filepath_raw = os.path.join(OUT, 'bodypaint.png'); tex.file_format = 'PNG'; tex.save()
mat = bpy.data.materials.new('bodypaint'); mat.use_nodes = True
nt = mat.node_tree; bsdf = nt.nodes['Principled BSDF']
tn = nt.nodes.new('ShaderNodeTexImage'); tn.image = tex
nt.links.new(tn.outputs['Color'], bsdf.inputs['Base Color']); nt.links.new(tn.outputs['Alpha'], bsdf.inputs['Alpha'])
mat.blend_method = 'OPAQUE'
me.materials.append(mat); bi = len(me.materials) - 1
for poly in me.polygons:
    if poly.material_index not in keep: poly.material_index = bi
print('painted texture', int(hit.sum()), 'texels')

# ---- shoes: green accents -> brand orange
shoe = bpy.data.materials['FB_female_body.shoes05']
for nd in shoe.node_tree.nodes:
    if nd.type == 'TEX_IMAGE' and nd.image and 'diffuse' in nd.image.name:
        im = nd.image; w2, h2 = im.size
        q = np.array(im.pixels[:]).reshape(h2, w2, 4)
        R, Gc, Bc = q[..., 0], q[..., 1], q[..., 2]
        gm = (Gc > R + 0.08) & (Gc > Bc + 0.05)
        L = (0.3 * R + 0.59 * Gc + 0.11 * Bc)[gm]
        q[gm, :3] = np.clip(np.array([1.0, 0.42, 0.05])[None, :] * np.clip(L / max(1e-3, L.mean()), 0.5, 1.4)[:, None], 0, 1)
        im2 = bpy.data.images.new('shoe_fb', w2, h2, alpha=True); im2.pixels[:] = q.ravel()
        im2.filepath_raw = os.path.join(OUT, 'shoe_fb.png'); im2.file_format = 'PNG'; im2.save(); nd.image = im2

# ---- subdivision level 1 for export
for o in bpy.data.objects:
    for m in getattr(o, 'modifiers', []):
        if m.type == 'SUBSURF': m.levels = 2 if o.name == 'FB_female_body' else 1; m.render_levels = m.levels

# ---- export
bpy.ops.object.select_all(action='DESELECT')
for o in bpy.data.objects: o.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, 'female.glb'), export_format='GLB', use_selection=True,
    export_apply=True, export_skins=True, export_morph=False, export_animations=False, export_yup=True,
    export_image_format='AUTO', export_materials='EXPORT')
print('EXPORTED')
