# Production plan: 250 exercise videos (tr / en / es)

Status lives in `exercises/_manifest.json` (`todo → authored → qa_passed → approved → rendered`).
Re-run `python3 pipeline/build_manifest.py` after adding files; it keeps existing statuses.

## 0. Done (2026-10-03)
- Engine (IK skeleton, skinned 3D character, motion-graphic template), approved reference: `out/reference/goblet_squat_tr_reference.mp4`.
- Pilots: `goblet_squat` (approved), `push_up`, `lateral_raise` (QA passed in 3D, need a final look).
- Tools: `dev/measure.mjs`, `dev/qa.mjs`, `dev/stills.mjs`, `dev/zoom.mjs`, `dev/hipsheet.mjs`, `render.mjs`.
- Props for every spec except machines: dumbbell, goblet, kettlebell, barbell, rack, bench, incline bench, mat, block, bolster, blanket, strap, ring, ball, foam roller, wall, pole, step, pull-up bar, band, cable, **reformer**, **wunda chair**. Reformer fixture: `dev/fixtures/_reformer_test.js`.

## 1. Before the batches
1. ~~Machine props~~ done 2026-10-03: legPress, hackSquat, legCurl, legExtension, seatedCalf, latPulldown, pecDeck, chestPress (fixtures in dev/fixtures/).
2. Author 1 exemplar per batch yourself (or have it reviewed) before fanning out: `back_squat` (legs), `bent_over_row` (pull), `plank` (core / hold), `downward_dog` (yoga hold), `hundred` (pilates mat), `footwork` (reformer). These become the copy templates for that batch.

## 2. Batches (parallel agents)
| batch | count | main props | template |
|---|---|---|---|
| strength_legs_hinge | 29 | barbell, rack, dumbbell, bench, machines | goblet_squat / back_squat |
| strength_pull | 30 | dumbbell, barbell, cable, pull-up bar, bench | bent_over_row |
| strength_push_core_conditioning | 36 | bench, dumbbell, barbell, mat | push_up / plank |
| yoga | 49 | mat, block, bolster, blanket, strap, wall | downward_dog |
| pilates_mat | 59 | mat, ring, ball, foam roller | hundred |
| reformer | 47 | reformer, box, straps, wunda chair | footwork |

- Agent type: `motion-designer` (Opus). 10-12 exercises per agent, at most 4 agents at a time (each runs headless Chrome with WebGL on this Mac).
- Every agent works only on its own `exercises/<id>.js` files. Agents must NOT edit `engine/`, `player.html`, `pipeline/` or assets; they report engine problems in their summary instead.
- The main session reviews every contact sheet (`out/qa/tr/<id>.png`) before setting `approved`. Show a sample of finished videos to the user early (after the first 10-15).

### Agent brief template
```
Goal: author Full Balance exercise animation files for: <ids>.
Repo: shredmatrix/marketing/exercise-videos/studio3d. Read docs/LEARNINGS.md and docs/AUTHORING.md first, then the template exercise <template>.js.
Spec for each id: ../research/specs/<batch>.json (angles, phases, tempo, breathing, cues, mistakes); names/app names in exercises/_manifest.json.
For each id: write exercises/<id>.js (tr/en/es text, natural and short), then
  node dev/measure.mjs <id>   -> angles within ~5-8° of the spec
  node dev/qa.mjs <id> --sheet -> must print ✓; open out/qa/tr/<id>.png and dev/zoom.mjs close-ups and check contacts,
  joint directions, held objects, arms outside the body, readable cards, visible mistakes.
Do not edit engine/, player.html, pipeline/ or assets/. Do not render final videos.
Report: per id one line (✓ / problem), the measured key angles vs spec, and any engine limitation you hit.
```

## 3. Review gates
- Gate A: the 6 batch exemplars are approved by the user (style is fixed; this checks each new body position and apparatus).
- Gate B: every exercise has `qa_passed` and a human look at its contact sheet.
- Gate C: spot-check 10% of the renders in all three languages (text fits, no missing translations).

## 4. Render
```bash
node render.mjs all --lang tr,en,es --fps 60 --jobs 3 --skip-existing   # out/<lang>/<id>.mp4
```
About 95 s per video per job → 750 videos ≈ 6-7 h with 3 jobs. 30 fps halves it if needed.

## 5. App integration (separate task, needs the user's decision)
- Host: Supabase Storage or the Cloudflare worker/CDN already used by the app.
- Map every app exercise name → spec id via `app_names` in the manifest. Replace the YouTube search link in `src/components/WorkoutPanel.jsx` (`videoUrl`) with the video for the user's language; keep YouTube as the fallback for names without a video (`non_demo` items such as full flows).

## Schedule (agreed 2026-10-03): sessions of 3-4 h/day, 60 fps, TR first
Measured: authoring ≈ 8-10 min per exercise per agent (4 agents in parallel); render ≈ 70 s wall per video (3 jobs, 60 fps).
| session | work | result |
|---|---|---|
| 1 | wave 1: strength legs + pull (55 exercises), review, TR render of the approved ones | ~55 TR videos |
| 2 | wave 2: push/core (34) + yoga (49) | ~83 |
| 3 | wave 3: pilates mat (58) + reformer (46) | ~104 |
| 4 | remaining TR renders + fixes from the user's review | 250 TR |
| 5-7 | EN + ES renders (≈ 9.5 h) — can run unattended overnight if possible | 750 total |
Everything is resumable: exercise files persist, `render.mjs --skip-existing`, statuses in the manifest.
Before a session: keep the Mac on power, lid open; `caffeinate -dims` in a terminal prevents sleep while it runs.
Waves: agent brief = docs/AGENT_BRIEF.md.

## Progress log
- 2026-10-03 session 1-2: 117 approved (legs 27/29, pull 30/30, push/core 31/36 incl. exemplars, yoga 25/49, pilates 1/59, reformer 1/47). TR renders ~111+.
  Needs fix: single_leg_glute_bridge, glute_bridge_march (resting palm-down hands). Drafts in drafts/: burpee, clean_and_press. Not started: devil_press.
  Engine to-do before the next wave (from agent reports): resting flat hand off-support; ponytail clamp for tilted supine (bridge); one-sided muscle glow;
  elbow flip when the upper arm points along the trunk forward axis (auto `bend`); continuous palm twist (replace arnold_press Object.prototype hack);
  longer mistake transitions for holds; non-numeric keys (palm/flat/handFlat) blending; flat hand unreachable → keep it on the wrist; `roll`/`side` sign in docs;
  supine floor clearances (chest/waist) in qa; tighter framing for lying poses; props get time input (rope waves).
  Next: engine fixes → yoga remaining 24 → pilates mat 58 → reformer 46 → remaining push 3 → EN/ES renders.
- Engine fixes 2026-10-03 (afternoon): resting supine hands, flat-hand wrist follow on overreach, smooth fk bend, hair floor clamp, palm vectors, one-sided glow (`side`), longer mistake transitions, qa lying clearances, flatter fingers on supports. Snapshot regression (`dev/snapshot.mjs`) showed only intended changes.
  TODO final pass: re-render TR videos of hand-on-floor exercises (finger slope changed slightly) so TR/EN/ES match.
- 2026-10-03 22:16: ALL 250 exercises approved and rendered in TR (out/tr/, 2.4 GB). Manifest status = rendered.
  Next: user review of TR → EN + ES renders: `node render.mjs all --lang en,es --fps 60 --jobs 3 --skip-existing` (~9-10 h; 30 fps ≈ 5 h).
  Engine to-do (non-blocking, from agent reports): wrist extension for gripping hands (true front rack), lateral neck bend, smarter mistake-transition timing (rest→mistake path), card:false keys inside the previous card, boolean keys blending, qa slide check (dev/slide.mjs) into qa.mjs.
- 2026-10-04: user review round fixed 23 videos (engine: grip orientation, flat palms, bar grip point, lying hair clamp; files: sliding, interpenetration, eight_angle_pose prep version). TR delivery (720p60, 772 MB) uploaded to R2 v1/tr; app switched to in-app videos for TR and deployed (worker version 1c0c5a3a). Old experiments removed from marketing/exercise-videos.
  NOTE: TR masters other than the 23 fixed ones were rendered with the earlier engine; EN/ES renders will use the current engine.
  Next (user approval): EN + ES renders → encode → upload v1/en, v1/es → enable in EXERCISE_VIDEO_LANGS.
