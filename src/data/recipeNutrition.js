import { FOODS } from './foodDatabase';
import { ECONOMY_SWAPS, MEAL_IMAGES, getRecipeCatalog } from './regionalRecipes';

// 2: regional recipe catalog with images, titles and plate-like portions.
export const NUTRITION_VERSION = 2;
const byName = new Map(FOODS.map((food) => [food.name.en, food]));
const round = (n) => Math.round(n * 10) / 10;
const stateLabels = {
  cooked: { tr: 'pişmiş', en: 'cooked', es: 'cocido' },
  dry: { tr: 'kuru', en: 'dry', es: 'seco' },
  edible: { tr: 'yenebilir kısım', en: 'edible portion', es: 'parte comestible' },
};
const SEAFOOD = new Set(['Salmon', 'Tuna', 'Sea Bass', 'Anchovy', 'Shrimp', 'Mussel']);
const GLUTEN = new Set(['Oatmeal', 'Whole Wheat Bread', 'White Bread', 'Rye Bread', 'Pasta (Cooked)', 'Bulgur', 'Bulgur Cooked', 'Couscous', 'Tortilla Wrap', 'Crackers', 'Granola', 'Simit (Turkish Bagel)']);
const NUTS = new Set(['Almonds', 'Walnuts', 'Hazelnuts', 'Pistachios', 'Cashews', 'Peanuts', 'Peanut Butter']);
const SOY = new Set(['Soy Sauce']);
const SESAME = new Set(['Tahini', 'Simit (Turkish Bagel)']);
// Dietary restrictions derived from the food record so every catalog food is covered.
const restrictions = Object.fromEntries(FOODS.map((food) => {
  const name = food.name.en;
  const keys = new Set();
  if (['Egg', 'Egg White'].includes(name)) { keys.add('egg'); keys.add('vegan'); }
  else if (food.cat === 'meat') { keys.add('vegan'); keys.add('vegetarian'); }
  if (food.cat === 'dairy') { keys.add('lactose'); keys.add('vegan'); }
  if (name === 'Honey') keys.add('vegan');
  if (SEAFOOD.has(name)) keys.add('seafood');
  if (GLUTEN.has(name)) keys.add('gluten');
  if (NUTS.has(name)) keys.add('nuts');
  if (SOY.has(name)) keys.add('soy');
  if (SESAME.has(name)) keys.add('sesame');
  return [name, [...keys]];
}));
const cooked = new Set(['Chicken Breast', 'Chicken Thigh', 'Turkey Breast', 'Ground Beef', 'Meatball', 'Salmon', 'Sea Bass', 'Shrimp', 'Rice (Cooked)', 'Brown Rice', 'Pasta (Cooked)', 'Bulgur Cooked', 'Couscous', 'Lentils (Cooked)', 'Chickpeas (Cooked)', 'White Beans (Cooked)', 'Quinoa', 'Egg', 'Potato', 'Sweet Potato']);
const dry = new Set(['Oatmeal']);
const permitted = (name, allergies) => !(restrictions[name] || []).some((key) => allergies.includes(key));
export const recipeAllergens = (name) => restrictions[name] || [];

// Picks a regional dish for the meal slot and resolves each part to the first
// food the member can eat. Economy budgets swap premium items for staples.
function recipeParts(mealKey, variant, allergies, budget, lang) {
  const catalog = getRecipeCatalog(lang, mealKey);
  const recipe = catalog[((variant % catalog.length) + catalog.length) % catalog.length];
  const parts = [];
  let substituted = false;
  recipe.parts.forEach(([alternatives, grams, min, max]) => {
    const candidates = budget === 'economy' ? alternatives.map((name) => ECONOMY_SWAPS[name] || name) : alternatives;
    const food = [...candidates, ...alternatives].find((name) => byName.has(name) && permitted(name, allergies));
    if (!food) return;
    if (food !== alternatives[0]) substituted = true;
    parts.push([food, grams, min, max]);
  });
  // A swapped protein makes the dish name wrong, so describe the plate instead.
  const title = substituted
    ? parts.filter(([, grams]) => grams >= 40).map(([food]) => byName.get(food).name[lang] || food).join(' + ')
    : recipe.title;
  return { title, parts };
}

function totals(parts) {
  return parts.reduce((sum, part) => {
    const food = byName.get(part.foodId);
    const ratio = part.grams / 100;
    return { calories: sum.calories + food.cal * ratio, protein: sum.protein + food.p * ratio, carbs: sum.carbs + food.c * ratio, fat: sum.fat + food.f * ratio };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
}

export function calculateRecipe(ingredients, lang = 'tr') {
  const parts = ingredients.map(({ foodId, grams }) => {
    const food = byName.get(foodId);
    if (!food || !Number.isFinite(grams) || grams <= 0) throw new Error('invalid_recipe_ingredient');
    const state = cooked.has(foodId) ? 'cooked' : dry.has(foodId) ? 'dry' : 'edible';
    const name = food.name[lang] || food.name.en;
    const alreadyStated = /cooked|cocid|pişmiş|haşlanmış/i.test(name);
    const label = state === 'edible' || alreadyStated ? name : `${name} (${stateLabels[state][lang] || stateLabels[state].en})`;
    return { foodId, grams: round(grams), state, label };
  });
  const values = totals(parts);
  return {
    ingredients: parts,
    items: parts.map((part) => `${part.label} · ${part.grams} g`),
    calories: Math.round(values.calories),
    protein: round(values.protein), carbs: round(values.carbs), fat: round(values.fat),
    nutritionVersion: NUTRITION_VERSION,
  };
}

export function buildCalculatedMeal(meal, { lang = 'tr', allergies = [], budget = 'moderate', variant = 0 } = {}) {
  const target = meal.targetNutrition || { calories: meal.calories, protein: meal.protein, carbs: meal.carbs, fat: meal.fat };
  const { title, parts: definitions } = recipeParts(meal.mealKey, variant, allergies, budget, lang);
  const parts = definitions.map(([foodId, grams]) => ({ foodId, grams }));
  const loss = () => {
    const actual = totals(parts);
    const macroLoss = ['calories', 'protein', 'carbs', 'fat'].reduce((sum, key) => {
      const desired = Math.max(1, Number(target[key]) || 1);
      return sum + (key === 'calories' ? 30 : 1) * ((actual[key] - desired) / desired) ** 2;
    }, 0);
    // Keep portions close to the dish's normal proportions so a calorie target
    // scales the whole plate instead of turning one side into the meal.
    const shapeLoss = parts.reduce((sum, part, index) => sum + ((part.grams - definitions[index][1]) / definitions[index][1]) ** 2, 0);
    return macroLoss + 0.3 * shapeLoss;
  };
  // Small bounded coordinate search. Targets guide portions, but displayed
  // values always come from the resulting recipe, even when the target differs.
  for (const step of [20, 5, 1]) {
    for (let pass = 0; pass < 35; pass++) {
      let changed = false;
      parts.forEach((part, index) => {
        const original = part.grams;
        let best = original;
        let bestLoss = loss();
        for (const direction of [-1, 1]) {
          part.grams = Math.max(definitions[index][2], Math.min(definitions[index][3], original + direction * step));
          const candidate = loss();
          if (candidate < bestLoss) { bestLoss = candidate; best = part.grams; }
        }
        part.grams = best;
        changed ||= best !== original;
      });
      if (!changed) break;
    }
  }
  // Final pass: scale the whole plate toward the calorie target within bounds.
  for (let pass = 0; pass < 3; pass++) {
    const actual = totals(parts).calories;
    const desired = Number(target.calories) || 0;
    if (!desired || !actual || Math.abs(actual - desired) / desired < 0.03) break;
    const factor = desired / actual;
    parts.forEach((part, index) => {
      part.grams = Math.round(Math.max(definitions[index][2], Math.min(definitions[index][3], part.grams * factor)));
    });
  }
  return {
    ...meal, ...calculateRecipe(parts, lang), targetNutrition: target, recipeVariant: variant,
    allergyAdjusted: allergies.some((key) => key !== 'none'),
    recipeTitle: title,
    image: MEAL_IMAGES[meal.mealKey] || meal.image || null,
    note: meal.note || null,
    // The old price was tied to a different recipe, not a current market quote.
    price: null,
  };
}

export function summarizeNutritionDay(day, meals = day.meals) {
  return {
    ...day, meals,
    targetCalories: day.targetCalories ?? day.calories,
    targetMacros: day.targetMacros ?? day.macros,
    calories: meals.reduce((sum, meal) => sum + meal.calories, 0),
    macros: Object.fromEntries(['protein', 'carbs', 'fat'].map((key) => [key, round(meals.reduce((sum, meal) => sum + meal[key], 0))])),
    totalPrice: null,
    nutritionVersion: NUTRITION_VERSION,
  };
}

export function calculateNutritionDays(days, options = {}) {
  return days.map((day, index) => summarizeNutritionDay(day,
    day.meals.map((meal, mealIndex) => buildCalculatedMeal(meal, { ...options, variant: index + mealIndex }))));
}
