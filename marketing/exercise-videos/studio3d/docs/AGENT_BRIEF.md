# Brief for exercise-authoring agents

Working dir: shredmatrix/marketing/exercise-videos/studio3d
1. Read fully: docs/LEARNINGS.md, docs/AUTHORING.md. Then read the approved template(s) named in your task and any other exercise in exercises/ that is close to yours.
2. For each id in your list: the spec is the object with that id in ../research/specs/<batch>.json (angles, phases, tempo, breathing, cues, mistakes). Names/app names: exercises/_manifest.json.
3. Write exercises/<id>.js with natural, short tr (main), en, es texts (cards ≤ ~95 characters). Two most important spec mistakes, clearly visible but believable (measure them). Arc only where the angle is the lesson. True camera view per spec (plates are see-through automatically).
4. Verify each one, iterate until good:
   node dev/measure.mjs <id>          -> key angles within ~5-8° of the spec (when the spec is internally inconsistent, match the angles that define the technique and note it in a header comment)
   node dev/qa.mjs <id> --sheet       -> must print ✓ (floor, plants, limb flips, cards); then LOOK at out/qa/tr/<id>.png with the Read tool
   node dev/zoom.mjs <id> <t> <joint> 150 /tmp/<id>_<x>.png -> full-res close-ups of contacts (feet/hands/back on surfaces), grips, arms outside the body, knees over toes
   node dev/qa.mjs <id> --lang en ; node dev/qa.mjs <id> --lang es
5. Rules: do NOT edit engine/, player.html, pipeline/, assets/, render.mjs, docs/, the manifest or other exercises. Do not render videos. Keep scratch files in /tmp/<your-batch-name>/ only. Work around engine limits inside your exercise file; if impossible, still deliver the best version and describe the limit precisely.
6. Final report (concise, one block per id): ✓/✗, 2-3 key measured angles vs spec, mistakes chosen, any limitation (exact repro). End with a list of engine limitations seen across your batch.

## Engine updates (2026-10-03, after waves 1-2) — use these instead of the old workarounds
- Supine bodies: hands planted/resting on the floor below 7.5 cm now lie palm-down with fingers continuing the reach (no more "fingers toward the head", no need to hover hands at 6-7 cm). Prone/quadruped hands stay weight-bearing.
- Flat hand out of reach stays attached to the wrist (no detached palm).
- Upper arm pointing along the trunk's forward axis no longer flips the elbow (smooth blend); `bend` overrides are optional now.
- Ponytail is clamped above the floor in every pose (bridges are fine).
- `palm: [fwd, up, outward]` vector blends smoothly between poses (rotating palms).
- `side: 'R'|'L'` on the exercise → muscle glow only on that side (one-sided exercises).
- Mistake transitions get longer automatically when the mistake pose is far from the correct one.
- qa floor check uses realistic lying clearances (chest/waist 6 cm) — no need to float the back.
- `roll` and `side` (lateral bend): + tips toward the character's LEFT.
- Regression tool: `node dev/snapshot.mjs diff <id>` (do not run save).
- Flows (sun salutations, jumps between poses): rep move `{ to:'air', dur:0.35, card:false }` = in-between pose with no card (use it for the airborne moment so feet LIFT instead of sliding); `cuesReplay: false` keeps the cues chapter short; `maxDuration: 80` allowed for flows only.
- Mat placement: `mat.at` must be an array (functions are not supported for the mat).
- 2026-10-04 engine changes: bar/handle grips now orient the palm from the forearm × handle axis (no wrist flip); IK grip point is 0.4×hand from the wrist (bar sits in the fingers); flat palms rest 3 cm above the floor (clear the mat) with level fingers; the lying ponytail clamp is head − 20 cm.
- Sliding check (mandatory for floor work): `node dev/sweep.mjs <id>` must print "0 flagged" (or only natural slides you justify).
