import { describe, expect, it } from 'vitest';
import { buildCalculatedMeal, calculateNutritionDays } from './recipeNutrition';
import { LOCALE_MEAL_TIMES, MEAL_IMAGES, REGIONAL_RECIPES } from './regionalRecipes';
import { buildMealTemplates } from './mealDatabase';

const meal = { id: 3, mealKey: 'lunch', calories: 700, protein: 45, carbs: 80, fat: 22, time: '13:00' };

describe('regional recipes', () => {
  it('serves a different food culture per language with images and titles', () => {
    const tr = buildCalculatedMeal(meal, { lang: 'tr', variant: 0 });
    const en = buildCalculatedMeal(meal, { lang: 'en', variant: 0 });
    const es = buildCalculatedMeal(meal, { lang: 'es', variant: 0 });
    expect(tr.recipeTitle).toBe(REGIONAL_RECIPES.tr.lunch[0].title);
    expect(en.recipeTitle).toBe(REGIONAL_RECIPES.en.lunch[0].title);
    expect(es.recipeTitle).toBe(REGIONAL_RECIPES.es.lunch[0].title);
    expect(tr.items.join(' ')).toContain('Bulgur');
    expect(es.items.join(' ')).toContain('Arroz');
    [tr, en, es].forEach((built) => expect(built.image).toBe(MEAL_IMAGES.lunch));
  });

  it('rotates through the catalog so a week does not repeat one dish', () => {
    const titles = new Set([0, 1, 2, 3].map((variant) => buildCalculatedMeal(meal, { lang: 'es', variant }).recipeTitle));
    expect(titles.size).toBe(REGIONAL_RECIPES.es.lunch.length);
  });

  it('renames the plate honestly when a restriction swaps the main ingredient', () => {
    const swapped = buildCalculatedMeal({ ...meal, mealKey: 'dinner' }, { lang: 'es', variant: 0, allergies: ['seafood'] });
    expect(swapped.recipeTitle).not.toBe(REGIONAL_RECIPES.es.dinner[0].title);
    expect(swapped.ingredients.some((part) => part.foodId === 'Sea Bass')).toBe(false);
  });

  it('keeps portions plate-like and calories near the target', () => {
    for (const lang of ['tr', 'en', 'es']) {
      const day = calculateNutritionDays([{ calories: 2600, macros: { protein: 160, carbs: 290, fat: 90 }, meals: [
        { ...meal, id: 1, mealKey: 'breakfast', calories: 650 }, { ...meal, id: 2, mealKey: 'snack', calories: 300 },
        { ...meal, id: 3 }, { ...meal, id: 4, mealKey: 'preWorkout', calories: 350 }, { ...meal, id: 5, mealKey: 'dinner', calories: 600 },
      ] }], { lang })[0];
      expect(Math.abs(day.calories - 2600) / 2600).toBeLessThan(0.08);
      day.meals.forEach((built) => built.ingredients.forEach((part) => expect(part.grams).toBeLessThanOrEqual(400)));
    }
  });

  it('applies each food culture\'s meal clock to the templates', () => {
    const es = buildMealTemplates('es').upper.meals({ protein: 150, carbs: 300, fat: 80 }, 2500);
    const en = buildMealTemplates('en').upper.meals({ protein: 150, carbs: 300, fat: 80 }, 2500);
    const tr = buildMealTemplates('tr').upper.meals({ protein: 150, carbs: 300, fat: 80 }, 2500);
    expect(es.find((m) => m.mealKey === 'dinner').time).toBe(LOCALE_MEAL_TIMES.es.dinner);
    expect(es.find((m) => m.mealKey === 'lunch').time).toBe('14:00');
    expect(en.find((m) => m.mealKey === 'dinner').time).toBe('19:00');
    expect(tr.find((m) => m.mealKey === 'dinner').time).toBe('21:00');
  });
});
