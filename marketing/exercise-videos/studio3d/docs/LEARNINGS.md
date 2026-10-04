# Learnings (session 2026-10-02 / 03)

What was tried, what the user rejected or approved, and the technical lessons that the 250-exercise production must keep.

## Style decisions (user feedback, in order)

| Attempt | Result |
|---|---|
| Earlier sessions: SDF raymarched mannequin, Blender MakeHuman realistic render, AI clay character | All rejected ("hiç birini beğenmedim") |
| 2D flat vector character + motion-graphic template (cards, angle arcs, wrong/right) | Composition liked; character "too flat" |
| 3D convex-hull-of-spheres body (three.js) | Looked like a mannequin: seams, tube limbs, AO artifacts. Not shown as final |
| **Skinned MakeHuman model in three.js, driven by our IK skeleton** | **Approved** ("gayet güzel") after fixes below |

What the user explicitly asked for and approved:
- Realistic but clean 3D look, brand colours (navy background, orange top, navy leggings with orange stripe, cyan accents).
- Smooth, fluid motion; the whole body and its joints stay consistent while moving (no popping, no cloth glitches).
- No sharp/hard lines on the figure (chest crease, jagged garment edges).
- Arms must never pass through the body.
- The movement must be shown correctly (checked against the research spec).
- The video must be easy to understand.

Reference video: `out/reference/goblet_squat_tr_reference.mp4`.

## Rendering / character

1. **One skinned surface, clothes painted on.** Separate cloth meshes (MPFB sportsuit) deform differently from the body under linear-blend skinning: poke-through, sagging crotch gusset, jagged waistline, patches. Removing the cloth mesh and baking the sportswear into the body texture (`pipeline/export_glb.py`, per-texel rules on the rest-pose position) fixed all of it at once.
2. **Bake garment edges per texel with soft masks** (smoothstep over ~2 mm), never per vertex: vertex colours give blobby, jagged edges.
3. **Stripes/panels by geometry, not normals.** A normal-based stripe turned into wide ovals on flat thigh sides. Use constant arc length around the bone axis (1.6 cm).
4. **Chest crease** comes from the low-poly bust plus a garment edge sitting on the crease. Fix: Taubin (volume-preserving) smoothing around the bust in the rest mesh, subdivision level 2 for the body, garment hem moved off the crease.
5. **Feet inside shoes**: don't mask (delete) them, which leaves a hole above the shoe. Keep them and paint socks.
6. Keep MakeHuman's original skin weights; hand-edited weight "rebalancing" made deformation worse.
7. Eyes need the texture alpha (cornea): export images with `export_image_format='AUTO'`, never JPEG, and use `alphaTest` on the eye material.
8. GTAO noise looked like dotted skin; use 24 samples, denoise radius 9, blend 0.7.
9. Muscle highlight: sphere blobs looked like stains. Use smooth tubes along the working bone segments plus a fresnel rim glow (`muscleSegments()` in `engine/rig3d.js`).
10. Target-pose "ghost" = translucent clone of the skinned model (SkeletonUtils.clone), not a 2D silhouette.

## Rig / motion

11. **BODY dimensions come from the rig** (`setupBody()` in rig3d.js reads bone rest positions). The IK skeleton and the mesh then agree within 1-2 cm, so feet stay on the floor and hands on the bar.
12. **Retargeting:** spine/pelvis/head/feet use the delta of our segment frame applied to the bone's rest rotation. Limbs aim at our next joint, with twist from the elbow/knee hinge. Hands are oriented by palm direction. Fingers curl around grips.
13. **Interpolation:** a monotone cubic (Fritsch-Carlson) spline over pose keyframes gives continuous velocity and no overshoot. Piecewise ease-in-out stopped at every key and looked robotic. Render at 60 fps.
14. When a pose changes its `ground` contact set, the two solutions are blended (`_gAlt`). Prefer keeping the same contact names across poses and only changing heights.
15. **Knee IK pole:** use the FK knee direction when the knee is bent and the thigh's forward axis when it is straight, with a smooth blend. Using only the thigh axis flung the knees sideways at 120° hip flexion; using only the knee direction popped at full extension.
16. **Elbow IK pole default** = opposite of the FK bend direction (stable when the arm is straight).
17. **Torso collision:** arms are swivelled about the shoulder→hand axis until upper arm and forearm clear an elliptic torso (`avoidTorso` in core.js). Of the two clearing directions, the lower elbow wins. The torso ellipse matches the real mesh (a 0.105/0.09 m, b 0.138/0.118 m).
18. **Goblet / front-held weights:** hands at chest +0.08 m, 0.20 m forward, elbows pointing down (`elbowPole: [0.4, -1, -0.3]`), `protract: 0.03`. Hands too close to the shoulders force the elbows out sideways.
19. Ponytail is part of the MakeHuman mesh (rigid with the head); no physics needed.

## Correctness checks that caught real bugs
- `dev/measure.mjs` showed knees 17 cm outside the toes (pole bug) and a valgus mistake of 22 cm (exaggerated; 12 cm is enough).
- Per-frame bone angular-velocity scan (no pops > 1°/frame) proved the remaining "hip glitches" were skinning/cloth, not the rig.
- Always zoom (`dev/zoom.mjs`, `dev/hipsheet.mjs`) at full resolution. The 360 px contact sheets hide most artifacts.

## Video template (approved structure, ~45 s)
intro (title, 3/4 → main view) → **setup** (3/4 camera, contact dots, stance "span" marker) → **step by step** (slow, phase cards with breath pill, target ghost; angle arc only on the hold/bottom phase) → **tempo reps** (rep counter from 1, breath pill synced to the moving phase, muscle glow, alt camera with a caption above the card) → **2 mistakes** (red tint + rings/lines → green fix) → **3 cues** → logo.
- Chapter banners and view captions sit just above the bottom card, never over the character or the card text.
- No trace paths that run behind the body (confusing); arcs only where the angle is the teaching point.

## Batch exemplars (2026-10-03) — engine changes that came out of them
- Plates hid the body in the true side view → near-camera plates rendered see-through (`XRAY` in rig3d.js); always use the spec's side view.
- Ponytail went through bench/mat/carriage when lying → vertex clamp in the hair shader at head height - 9.5 cm while lying.
- Error tint was one big sphere (whole torso red) → tubes per listed segment, side suffix allowed.
- IK snapped at full reach → soft reach in `ik2` (0.4 mm band). A 12 mm band capped knee extension at 11° on the reformer; keep it tiny.
- Ghost caused AO speckles → ghost/xray meshes excluded from the GTAO pass; ghost writes depth with polygon offset.
- Oscillation inside a pose (Hundred) → `ex.pump`; card reading time; `palm`/`curl` for free hands; `repLabel`.
- Reformer headrest was too short for the rig's head → 0.25 m headrest centred at carriage -0.52; `footbarH` option.
- Spec numbers are sometimes mutually inconsistent (bench press hip 90° with feet on floor; barbell row hip/shin vs bar near knees). Rule: match the joint angles that define the technique (elbow, knee, trunk, bar path), document the rest in the file header.
- Weight-bearing hands floated with the heel of the palm lifted → flat-hand IK: arm targets the wrist (palm centre on the support, wrist 4 cm above, extended ~90°); hand ground contacts use the wrist height.
- Push-up bottom: the realistic chest is ~12 cm deep — chest contact 0.11 (not 0.06) or the face touches the mat.
- `lerpPose` must blend nested arrays into new arrays (shared references let the spline mutate pose data).
