import { FOODS } from './foodDatabase';

export const NUTRITION_VERSION = 1;
const byName = new Map(FOODS.map((food) => [food.name.en, food]));
const round = (n) => Math.round(n * 10) / 10;
const stateLabels = {
  cooked: { tr: 'pişmiş', en: 'cooked', es: 'cocido' },
  dry: { tr: 'kuru', en: 'dry', es: 'seco' },
  edible: { tr: 'yenebilir kısım', en: 'edible portion', es: 'parte comestible' },
};
const restrictions = {
  'Chicken Breast': ['vegan', 'vegetarian'], 'Turkey Breast': ['vegan', 'vegetarian'],
  Salmon: ['seafood', 'vegan', 'vegetarian'], Egg: ['egg', 'vegan'],
  Yogurt: ['lactose', 'vegan'], 'Greek Yogurt': ['lactose', 'vegan'],
  'Cottage Cheese': ['lactose', 'vegan'],
  Oatmeal: ['gluten'], 'Whole Wheat Bread': ['gluten'],
  Almonds: ['nuts'], Walnuts: ['nuts'], 'Peanut Butter': ['nuts'],
};
const cooked = new Set(['Chicken Breast', 'Turkey Breast', 'Rice (Cooked)', 'Brown Rice', 'Lentils (Cooked)', 'Chickpeas (Cooked)', 'Quinoa', 'Egg']);
const dry = new Set(['Oatmeal']);
const permitted = (name, allergies) => !(restrictions[name] || []).some((key) => allergies.includes(key));
export const recipeAllergens = (name) => restrictions[name] || [];
const choose = (names, allergies) => names.find((name) => permitted(name, allergies));

// Recipes use existing food records, never numbers allocated from a calorie
// target. Bounds prevent a target from turning oil/nuts into an entire meal.
function recipeParts(mealKey, variant, allergies, budget) {
  const protein = choose(budget === 'economy'
    ? variant % 2 ? ['Lentils (Cooked)', 'Chickpeas (Cooked)'] : ['Chickpeas (Cooked)', 'Lentils (Cooked)']
    : variant % 2 ? ['Turkey Breast', 'Lentils (Cooked)'] : ['Chicken Breast', 'Chickpeas (Cooked)'], allergies);
  const grain = choose(variant % 2 ? ['Brown Rice', 'Rice (Cooked)'] : ['Quinoa', 'Rice (Cooked)'], allergies);
  if (mealKey === 'breakfast') {
    if (permitted('Oatmeal', allergies) && permitted('Yogurt', allergies)) {
      return [['Oatmeal', 60, 25, 130], [choose(['Greek Yogurt', 'Yogurt'], allergies), 180, 100, 350], [variant % 2 ? 'Apple' : 'Banana', 100, 50, 180], [choose(variant % 2 ? ['Walnuts', 'Olive Oil'] : ['Almonds', 'Olive Oil'], allergies), 12, 3, 25]];
    }
    return [[variant % 2 ? 'Lentils (Cooked)' : 'Chickpeas (Cooked)', 150, 70, 300], ['Rice (Cooked)', 100, 50, 300], ['Tomato', 120, 80, 180], ['Olive Oil', 8, 3, 20]];
  }
  if (['snack', 'afternoonSnack', 'preWorkout'].includes(mealKey)) {
    const base = choose(['Cottage Cheese', 'Chickpeas (Cooked)'], allergies);
    return [[base, 130, 60, 260], [variant % 2 ? 'Apple' : 'Banana', 130, 60, 220], [choose(['Walnuts', 'Rice Cake'], allergies), 20, 5, 45]];
  }
  return [[protein, 150, 70, 300], [grain, 180, 60, 450], [variant % 2 ? 'Carrot' : 'Cucumber', 120, 80, 200], ['Olive Oil', 12, 3, 25]];
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
    return { foodId, grams: round(grams), state, label: `${food.name[lang] || food.name.en} (${stateLabels[state][lang] || stateLabels[state].en})` };
  });
  const values = totals(parts);
  return {
    ingredients: parts,
    items: parts.map((part) => `${part.label}: ${part.grams} g`),
    calories: Math.round(values.calories),
    protein: round(values.protein), carbs: round(values.carbs), fat: round(values.fat),
    nutritionVersion: NUTRITION_VERSION,
  };
}

export function buildCalculatedMeal(meal, { lang = 'tr', allergies = [], budget = 'moderate', variant = 0 } = {}) {
  const target = meal.targetNutrition || { calories: meal.calories, protein: meal.protein, carbs: meal.carbs, fat: meal.fat };
  const definitions = recipeParts(meal.mealKey, variant, allergies, budget);
  const parts = definitions.map(([foodId, grams]) => ({ foodId, grams }));
  const loss = () => {
    const actual = totals(parts);
    return ['calories', 'protein', 'carbs', 'fat'].reduce((sum, key) => {
      const desired = Math.max(1, Number(target[key]) || 1);
      return sum + (key === 'calories' ? 30 : 1) * ((actual[key] - desired) / desired) ** 2;
    }, 0);
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
  return {
    ...meal, ...calculateRecipe(parts, lang), targetNutrition: target, recipeVariant: variant,
    allergyAdjusted: allergies.some((key) => key !== 'none'),
    image: null,
    note: null,
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
