import fs from 'node:fs';
import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const { generatePlan } = await server.ssrLoadModule('/src/data/planGenerator.js');
const goals = ['muscle', 'fat_loss', 'yoga', 'pilates', 'reformer', 'meditation'];
const envs = ['gym', 'home_bodyweight', 'home_basic', 'studio', 'home_reformer'];
const exps = ['beginner', 'intermediate', 'advanced'];
const days = [null, 3, 4, 5];
const health = [[], ['back_pain'], ['knee_issue'], ['shoulder_injury'], ['wrist_issue'], ['heart_condition'], ['back_pain', 'knee_issue', 'shoulder_injury', 'wrist_issue']];
const focus = [[], ['glutes_legs'], ['core'], ['back_posture'], ['chest_arms'], ['shoulders'], ['glutes_legs', 'core']];
const map = new Map();
let plans = 0;
for (const g of goals) for (const env of envs) for (const ex of exps) for (const d of days) for (const h of health) for (const f of focus) for (const ph of [0, 1, 2, 3]) {
  if (!['muscle', 'fat_loss'].includes(g) && f.length) continue;
  for (const lang of ['tr', 'en', 'es']) {
    let plan;
    try { plan = generatePlan({ name: 'x', age: 30, gender: 'female', height: 170, weight: 70, experience: ex, activityLevel: 'moderate', primaryGoal: g, workSchedule: 'flexible', budget: 'moderate', healthConditions: h, allergies: [], trainingEnvironment: env, focusAreas: f, trainingDaysPerWeek: d }, ph, lang); } catch (e) { continue; }
    plans++;
    (plan.workoutSplit || []).forEach((day, di) => (day.exercises || []).forEach((e, ei) => {
      const key = `${g}|${di}|${ei}|${e.name}`;
      if (lang !== 'tr') return;
      const cur = map.get(e.name) || { name: e.name, goals: new Set(), envs: new Set(), equipment: e.equipment, muscles: e.muscles, reps: e.reps, count: 0 };
      cur.goals.add(g); cur.envs.add(env); cur.count++;
      map.set(e.name, cur);
    }));
  }
}
const list = [...map.values()].map((v) => ({ ...v, goals: [...v.goals], envs: [...v.envs] })).sort((a, b) => b.count - a.count);
fs.writeFileSync(new URL('./exercises-raw.json', import.meta.url), JSON.stringify(list, null, 1));
console.log('plans', plans, 'unique', list.length);
const byGoal = {}; list.forEach((e) => e.goals.forEach((g) => (byGoal[g] = (byGoal[g] || 0) + 1)));
console.log(byGoal);

await server.close();
