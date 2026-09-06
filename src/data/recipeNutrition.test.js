import { describe, expect, it } from 'vitest';
import { buildCalculatedMeal, calculateRecipe, summarizeNutritionDay, recipeAllergens } from './recipeNutrition';
import { buildShoppingList } from '../utils/shoppingList';

const template = { id: 1, mealKey: 'lunch', calories: 650, protein: 40, carbs: 75, fat: 20 };
describe('ingredient-based nutrition', () => {
  it('computes values from weighed food, not the personal target', () => {
    const recipe = calculateRecipe([{ foodId: 'Chicken Breast', grams: 200 }, { foodId: 'Rice (Cooked)', grams: 150 }], 'en');
    expect(recipe.calories).toBe(525);
    expect(recipe.protein).toBe(66.1);
    expect(recipe.carbs).toBe(42);
    expect(recipe.items.join(' ')).toContain('200 g');
    expect(recipe.ingredients.every((part) => part.state === 'cooked')).toBe(true);
  });
  it('rejects missing food identifiers and invalid portions', () => {
    expect(() => calculateRecipe([{ foodId: 'unknown', grams: 100 }])).toThrow();
    expect(() => calculateRecipe([{ foodId: 'Chicken Breast', grams: NaN }])).toThrow();
  });
  it('recalculates food substitutions and preserves the original target', () => {
    const first = buildCalculatedMeal(template, { variant: 0, lang: 'en' });
    const next = buildCalculatedMeal(first, { variant: 1, lang: 'en' });
    expect(next.items).not.toEqual(first.items);
    expect(next.targetNutrition).toEqual(first.targetNutrition);
    expect(next.calories).toBe(calculateRecipe(next.ingredients).calories);
    const day = summarizeNutritionDay({ calories: 1300, macros: {}, meals: [first, next] });
    expect(day.calories).toBe(first.calories + next.calories);
  });
  it('applies dietary restrictions to structured ingredients in every language', () => {
    const allergies = ['vegan', 'gluten', 'nuts', 'egg', 'lactose', 'seafood', 'soy', 'sesame'];
    for (const lang of ['tr', 'en', 'es']) {
      for (const mealKey of ['breakfast', 'snack', 'lunch', 'preWorkout', 'dinner']) {
        const meal = buildCalculatedMeal({ ...template, mealKey }, { lang, allergies });
        expect(meal.ingredients.every((part) => !recipeAllergens(part.foodId).some((a) => allergies.includes(a)))).toBe(true);
        expect(meal.calories).toBe(calculateRecipe(meal.ingredients).calories);
      }
    }
  });
  it('aggregates grams, including different portions of the same food', () => {
    const first = calculateRecipe([{ foodId: 'Chicken Breast', grams: 120 }]);
    const second = calculateRecipe([{ foodId: 'Chicken Breast', grams: 180 }]);
    const list = buildShoppingList([{ meals: [first, second] }], [0]);
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ grams: 300, count: 1 });
    expect(list[0].label).toContain('300 g');
  });
});
