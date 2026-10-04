# Full Balance Exercise Studio 3D

Code-generated, 3D animated exercise technique videos for the Full Balance app (1080x1920, 60 fps, tr/en/es).
A realistic skinned character (MakeHuman, brand sportswear) is driven by an IK skeleton and composed into an approved motion-graphic template:
setup → step by step → tempo reps → common mistakes → cues.

- Approved reference: `out/reference/goblet_squat_tr_reference.mp4`
- **Read first:** `docs/LEARNINGS.md` (decisions and pitfalls), then `docs/AUTHORING.md` (how to write an exercise), then `docs/PRODUCTION_PLAN.md` (the 250-video plan).

## Layout
```
player.html            page that renders one exercise at time t (window.render(t), window.DURATION)
render.mjs             frames → 1080p H.264 masters: node render.mjs <id,...|all> --lang tr,en,es --fps 60 --jobs 3 [--skip-existing]
engine/                core.js (skeleton, IK, contacts, collisions) · composer.js (timeline, cards, overlays) · rig3d.js (three.js character) · props.js (equipment) · draw.js (camera, overlays)
exercises/*.js         one file per exercise (250); exercises/_manifest.json = all specs + status
assets/                female.glb (generated character), female.rig.json, bodypaint.png, shoe_fb.png
source/female.blend    MakeHuman source model for pipeline/export_glb.py
pipeline/              export_glb.py (Blender) · build_manifest.py · build_video_map.py (→ src/data/exerciseVideoMap.js)
                       encode_delivery.sh + encode_one.sh (720p delivery + posters) · upload_r2.sh (→ Cloudflare R2)
dev/                   qa.mjs · measure.mjs · sweep.mjs (sliding/pops) · slide.mjs · snapshot.mjs (engine regression) · stills/zoom/crop/hipsheet · review.py · slidesheet.mjs
dev/fixtures/          visual test scenes (_reformer_test, machines)
drafts/                superseded drafts kept for reference
docs/                  LEARNINGS · AUTHORING · AGENT_BRIEF · PRODUCTION_PLAN · REVIEW_TODO · APP_INTEGRATION_PLAN
out/                   (not in git) <lang>/<id>.mp4 masters · delivery/v1/<lang>/ · qa/ · snapshots/
```

## Live
- Videos: `https://media.fullbalance.app/v1/<lang>/<id>.mp4` (+ `.jpg` poster), Cloudflare R2 bucket `fullbalance-media`.
- App: `src/data/exerciseVideos.js` (EXERCISE_VIDEO_LANGS = ['tr']), `src/components/ExerciseVideoModal.jsx`.
- New language: render → `pipeline/encode_delivery.sh <lang>` → `pipeline/upload_r2.sh <lang>` → add the language to EXERCISE_VIDEO_LANGS → deploy.

## Requirements
- Node + Playwright (`npm install` in `..`, which also provides `three`), Google Chrome (rendering uses Chrome with Metal/WebGL), ffmpeg.
- Only to regenerate the character: Blender 4.5 (`~/Applications/Blender.app`) with the MPFB extension data on this Mac:
  `~/Applications/Blender.app/Contents/MacOS/Blender -b source/female.blend --python pipeline/export_glb.py`

## Quick start
```bash
node dev/serve.mjs                         # prints a preview URL (add &play to loop)
node dev/qa.mjs goblet_squat --sheet       # checks + out/qa/tr/goblet_squat.png
node render.mjs goblet_squat --lang tr --fps 60
```
