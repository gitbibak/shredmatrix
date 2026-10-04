# Review to-do (TR renders, 2026-10-03)

Automatic sweep (`node dev/sweep.mjs all`): contact points sliding along the mat while touching it.
Fix these before EN/ES renders; then re-render TR for the fixed ids (`rm out/tr/<id>.mp4` + `node render.mjs <ids> --lang tr`).
Some short slides (< 8 cm) may be acceptable (natural pivots); check visually at the given times.

| cm | id | findings (time in s) |
|---|---|---|
| 84 | pigeon_pose | slide handR 83cm @7.7-9.9 · slide handL 84cm @7.8-9.9 |
| 34 | twist | slide toeR 34cm @12.0-12.7 · slide ballR 33cm @12.0-12.7 · slide toeL 8cm @17.9-18.3 · slide handL 26cm @13.8-14.2 |
| 34 | snake_twist | slide heelR 5cm @38.6-39.0 · slide toeR 34cm @7.2-8.0 · slide ballR 33cm @7.2-8.0 · slide toeL 15cm @18.4-19.2 · slide handL 27cm @9.5-10.1 |
| 34 | plank_to_push_up | slide handR 34cm @6.3-7.4 · slide handL 34cm @10.7-11.8 |
| 30 | hamstring_walkout | slide heelR 30cm @36.5-37.5 · slide heelL 30cm @36.5-37.5 |
| 27 | thread_the_needle | slide handR 27cm @8.0-9.5 |
| 23 | reclining_butterfly | slide handR 23cm @8.4-10.0 · slide handL 23cm @8.4-10.0 |
| 22 | legs_up_the_wall | slide handR 22cm @33.4-34.3 · slide handL 22cm @33.4-34.3 |
| 20 | devil_press | slide toeR 20cm @7.4-8.0 · slide ballR 10cm @7.4-7.7 · slide toeL 20cm @7.4-8.0 · slide ballL 10cm @7.4-7.7 |
| 20 | burpee | slide toeR 20cm @16.4-16.6 · slide toeL 20cm @16.4-16.6 · slide ballR 10cm @16.4-16.6 · slide ballL 10cm @16.4-16.6 |
| 18 | yin_sphinx | slide handR 18cm @30.7-31.5 · slide handL 18cm @30.7-31.5 |
| 17 | standing_split | slide heelL 17cm @10.6-11.1 · slide toeL 17cm @10.6-11.1 · slide ballL 17cm @10.6-11.1 |
| 17 | saw | slide heelR 17cm @33.1-34.0 |
| 17 | savasana | slide heelL 5cm @44.8-44.9 · slide handR 17cm @37.7-38.3 · slide handL 17cm @37.7-38.3 |
| 16 | side_leg_lift | slide handL 16cm @30.6-31.4 |
| 15 | bird_dog | slide kneeR 7cm @34.3-34.7 · slide kneeL 15cm @7.5-8.2 · slide toeL 8cm @8.4-8.8 |
| 14 | hip_thrust | slide heelR 14cm @34.6-35.4 · slide toeR 14cm @34.6-35.4 · slide ballR 14cm @34.6-35.4 · slide heelL 14cm @34.6-35.4 · slide toeL 14cm @34.6-35.4 · slide ballL 14cm @34.6-35.4 |
| 13 | spine_twist | slide heelR 13cm @31.0-31.7 · slide heelL 6cm @31.0-31.3 |
| 12 | reverse_lunge | slide heelL 5cm @7.3-7.5 · slide toeL 12cm @7.3-7.7 · slide ballL 10cm @7.3-7.6 |
| 11 | child_pose | slide handR 11cm @10.1-10.7 · slide handL 11cm @10.1-10.7 |
| 10 | side_bend | slide toeR 10cm @25.4-26.0 · slide ballR 10cm @25.4-26.0 · slide heelR 9cm @25.4-26.0 |
| 9 | pilates_push_up | slide handR 6cm @18.0-18.2 · slide handL 9cm @19.1-19.3 |
| 8 | sled_push | slide toeR 8cm @7.3-7.7 · slide toeL 8cm @16.0-16.3 |
| 8 | flying_crow | slide toeL 4cm @7.6-7.9 · slide ballL 8cm @32.8-33.0 |
| 7 | yin_saddle | slide kneeR 7cm @35.3-35.8 · slide kneeL 7cm @35.3-35.8 |
| 6 | supine_twist | slide kneeR 6cm @41.2-41.4 |
| 6 | knee_fold | slide heelR 6cm @7.2-7.2 · slide heelL 6cm @16.5-16.5 |
| 6 | farmer_walk | slide toeR 6cm @21.5-21.7 · slide toeL 6cm @22.0-22.3 |
| 5 | yin_dragon | slide toeL 5cm @42.6-42.8 |
| 5 | yin_butterfly | slide handR 5cm @17.3-17.6 · slide handL 5cm @17.3-17.6 |
| 5 | seated_forward_fold | slide handR 5cm @34.8-34.9 · slide handL 5cm @34.8-34.9 |
| 5 | firefly_pose | slide toeR 5cm @38.0-38.1 · slide toeL 5cm @38.0-38.1 |
| 4 | shoulder_bridge | slide heelR 4cm @34.4-34.5 |

## Visual check of the sweep (out/slidecheck/page*.png, 2026-10-03)
**Fix (clearly visible sliding):**
- plank_to_push_up: hands slide forearm→hand (6-12 s) → lift and place each hand (card:false keys).
- twist, snake_twist: feet glide into the thread/pike (7-8 s, 12-13 s) → pin feet (ankle ik every pose) and pivot on the balls.
- standing_split: standing (left) foot slides as she folds (10.6-11.1 s) → pin the standing ankle.
- devil_press (7.4-8 s), burpee (16.4 s): toes drag on jump back / jump in → airborne key so the feet leave the floor.
- bird_dog: knee slides in tabletop (7.5-8.2 s) → pin knees.
- side_bend: bottom foot slides (25.4-26 s) → pin feet.
- pigeon_pose: hands slide 84 cm while folding (7.8-9.9 s) → walk the hands forward in 2 lifted steps.
**Optional (natural or mistake-transition only, < 20 cm):** hamstring_walkout (heel slide variant), legs_up_the_wall, yin_sphinx, saw, side_leg_lift, hip_thrust, spine_twist, reverse_lunge, pilates_push_up, flying_crow, sled_push.
**OK (sliding is the movement itself):** thread_the_needle, child_pose (hands reach forward), reclining_butterfly, savasana; < 7 cm items.

## User findings (2026-10-04)
- barbell_row: wrist flips while gripping → FIXED in engine (grip palm orientation).
- cat_cow, chaturanga: hand/fingers inside the mat → FIXED in engine (palm 3 cm, level fingers).
- conventional_deadlift: hands not gripping the bar on the floor → FIXED in engine (grip point 0.4×hand).
- hip_thrust: back of the head hair disappears → FIXED in engine (lying hair clamp head − 20 cm).
- eight_angle_pose: body parts interpenetrate, broken → re-author (agent).

## Fixed 2026-10-04 (re-rendered TR only for these)
barbell_row, cat_cow, chaturanga, conventional_deadlift, hip_thrust (engine fixes) · plank_to_push_up, twist, snake_twist, standing_split, devil_press, burpee, bird_dog, side_bend, pigeon_pose (sliding). eight_angle_pose: being re-authored.
NOTE: other TR videos were rendered with the previous engine; EN/ES renders will use the fixed engine.
- 2026-10-04 batch 3: triceps_pushdown (hands flipping → fixed by the grip engine fix, re-render), thread_the_needle (elbow looks broken at ~7 s) → agent. User: no other major issues; EN/ES only after user approval.
- 2026-10-04 batch 2: plank_pose (engine fix, re-render), push_up (mat widened + engine fix, re-render), rolling_like_a_ball (arms through legs; hair fixed by engine), rowing_sprint (pelvis above seat), self_resisted_curl (left arm through body), side_crow (support not visible) → agent.
