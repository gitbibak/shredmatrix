# Full Balance Exercise Studio 3D

Code-generated, 3D animated exercise technique videos for the Full Balance app (1080x1920, 60 fps, tr/en/es).
A realistic skinned character (MakeHuman, brand sportswear) is driven by an IK skeleton and composed into an approved motion-graphic template:
setup → step by step → tempo reps → common mistakes → cues.

- Approved reference: `out/reference/goblet_squat_tr_reference.mp4`
- **Read first:** `docs/LEARNINGS.md` (decisions and pitfalls), then `docs/AUTHORING.md` (how to write an exercise), then `docs/PRODUCTION_PLAN.md` (the 250-video plan).

## Layout
```
player.html            page that renders one exercise at time t (window.render(t), window.DURATION)
render.mjs             frames → H.264 mp4: node render.mjs <id,...|all> --lang tr,en,es --fps 60 --jobs 3 [--skip-existing]
engine/core.js         skeleton, FK, ground contacts, plants, 2-bone IK, knee/elbow poles, arm-torso collision avoidance
engine/composer.js     timeline (chapters, cards, overlays, camera framing, monotone-cubic pose splines), UI, overlays
engine/rig3d.js        three.js scene: skinned character retargeting, materials, muscle glow, ghost, props, lights, GTAO
engine/props.js        equipment as 3D primitives (dumbbell … reformer, wunda chair)
engine/draw.js         camera model (pinhole), body proportion spheres (muscle regions, overlays), SVG defs
exercises/*.js         one file per exercise; exercises/_manifest.json = all 250 specs + status
assets/female.glb      character (generated), female.rig.json (bone rest positions), bodypaint.png (baked sportswear)
pipeline/export_glb.py Blender export: sportswear paint, chest smoothing, subdivision, shoe recolour
pipeline/build_manifest.py   manifest from ../research/specs
dev/                   measure.mjs (angles vs spec), qa.mjs (automatic checks + contact sheet), stills/zoom/crop/hipsheet, serve.mjs
dev/fixtures/          visual test scenes (e.g. _reformer_test)
archive/               superseded 2D and hull-renderer experiments
```

## Requirements
- Node + Playwright (`npm install` in `..`, which also provides `three`), Google Chrome (rendering uses Chrome with Metal/WebGL), ffmpeg.
- Only to regenerate the character: Blender 4.5 (`~/Applications/Blender.app`) with the MPFB extension data on this Mac:
  `~/Applications/Blender.app/Contents/MacOS/Blender -b ../assets/humans/female.blend --python pipeline/export_glb.py`

## Quick start
```bash
node dev/serve.mjs                         # prints a preview URL (add &play to loop)
node dev/qa.mjs goblet_squat --sheet       # checks + out/qa/tr/goblet_squat.png
node render.mjs goblet_squat --lang tr --fps 60
```
