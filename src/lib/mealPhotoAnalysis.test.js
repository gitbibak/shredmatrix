import { describe, expect, it, vi } from 'vitest';
import {
  analysisItemsToMealItems,
  analyzeMealPhoto,
  buildFoodVocabulary,
  findKnownFood,
  getPhotoEstimateRange,
  rescaleMealItem,
  suggestHiddenIngredients,
} from './mealPhotoAnalysis';
import { FOODS } from '../components/CalorieCalc';

const byEn = (name) => FOODS.find((food) => food.name.en === name);

describe('meal photo API client', () => {
  it('posts the compressed image with the canonical vocabulary', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ isFood: true, items: [] }),
    });
    await expect(analyzeMealPhoto('data:image/jpeg;base64,abc', 'tr', fetchImpl, ['Rice (Cooked)'])).resolves.toMatchObject({ isFood: true });
    const [, options] = fetchImpl.mock.calls[0];
    expect(JSON.parse(options.body)).toEqual({ image: 'data:image/jpeg;base64,abc', language: 'tr', vocabulary: ['Rice (Cooked)'] });
  });

  it('builds the vocabulary from English database names without salt or water', () => {
    const vocabulary = buildFoodVocabulary(FOODS);
    expect(vocabulary).toContain('Chicken Breast');
    expect(vocabulary).not.toContain('Salt');
    expect(vocabulary.length).toBeGreaterThan(150);
  });
});

describe('food matching', () => {
  it('matches canonical names from the database exactly', () => {
    expect(findKnownFood('Tavuk göğsü ızgara', FOODS, 'Chicken Breast')).toBe(byEn('Chicken Breast'));
    expect(findKnownFood('Pirinç pilavı', FOODS, 'Rice (Cooked)')).toBe(byEn('Rice (Cooked)'));
  });

  it('does not confuse a sauce or juice with the raw ingredient', () => {
    expect(findKnownFood('Tomato sauce', FOODS)).not.toBe(byEn('Tomato'));
    expect(findKnownFood('Orange juice', FOODS)).not.toBe(byEn('Orange'));
  });

  it('prefers the most specific variant and keeps egg white separate from egg', () => {
    expect(findKnownFood('Egg', FOODS)).toBe(byEn('Egg'));
    expect(findKnownFood('Fried eggs', FOODS)).toBeNull();
    expect(findKnownFood('Egg white', FOODS)).toBe(byEn('Egg White'));
    expect(findKnownFood('Whole wheat bread', FOODS)).toBe(byEn('Whole Wheat Bread'));
  });

  it('understands common aliases and localized names', () => {
    expect(findKnownFood('Bulgur pilaf', FOODS)).toBe(byEn('Bulgur Cooked'));
    expect(findKnownFood('Feta', FOODS)).toBe(byEn('White Cheese'));
    expect(findKnownFood('Beyaz peynir', FOODS)).toBe(byEn('White Cheese'));
    expect(findKnownFood('Aceite de oliva', FOODS)).toBe(byEn('Olive Oil'));
  });

  it('returns null for foods that are not in the database', () => {
    expect(findKnownFood('Dragon fruit sorbet', FOODS)).toBeNull();
  });
});

describe('analysis item conversion', () => {
  it('converts automatic totals to editable per-100g meal items', () => {
    const [item] = analysisItemsToMealItems([{ name: 'Rice', grams: 200, calories: 260, protein: 5, carbs: 56, fat: 1, confidence: 0.8 }], 'en');
    expect(item).toMatchObject({ source: 'photo', grams: 200, cal: 260, matched: false });
    expect(item.food.cal).toBe(130);
  });

  it('uses the known food database instead of implausible model macros', () => {
    const foods = [{ name: { tr: 'Domates', en: 'Tomato', es: 'Tomate' }, cal: 18, p: 0.9, c: 3.9, f: 0.2, cat: 'veggie' }];
    const [item] = analysisItemsToMealItems([{ name: 'Tomatoes', grams: 100, calories: 20, protein: 20, carbs: 0, fat: 0 }], 'en', foods);
    expect(item).toMatchObject({ cal: 18, p: 0.9, c: 3.9, f: 0.2, matched: true });
    expect(item.food.name.tr).toBe('Domates');
  });

  it('caps runaway calorie density for unknown foods', () => {
    const [item] = analysisItemsToMealItems([{ name: 'Mystery stew', grams: 200, calories: 2400 }], 'en');
    expect(item.food.cal).toBe(600);
    expect(item.cal).toBe(1200);
  });

  it('does not inflate a small amount of oil to a tablespoon', () => {
    const [item] = analysisItemsToMealItems([{ name: 'Olive Oil', grams: 1, calories: 20 }], 'en', FOODS);
    expect(item.grams).toBe(1);
    expect(item.cal).toBe(9);
  });

  it('does not overwrite a realistic small portion with a default', () => {
    const [item] = analysisItemsToMealItems([{ name: 'Chicken Breast', grams: 60, calories: 99 }], 'en', FOODS);
    expect(item.grams).toBe(60);
  });

  it('removes duplicate detections and zero-nutrition artifacts', () => {
    const result = analysisItemsToMealItems([
      { name: 'Olive Oil', grams: 14, calories: 124, confidence: 0.8 },
      { name: 'Olive Oil', grams: 8, calories: 71, confidence: 0.9 },
      { name: 'Mixed Greens', grams: 50, calories: 8 },
      { name: 'Water', grams: 1, calories: 0, protein: 0, carbs: 0, fat: 0 },
    ], 'en', FOODS);

    expect(result).toHaveLength(2);
    expect(result.find((item) => item.food.name.en === 'Olive Oil')).toMatchObject({ grams: 14, confidence: 0.9 });
    expect(result.find((item) => item.food.name.en === 'Lettuce')).toMatchObject({ grams: 50 });
  });

  it('preserves a small garnish amount instead of inventing more food', () => {
    const [item] = analysisItemsToMealItems([{ name: 'Lemon Juice', grams: 1, calories: 0 }], 'en', FOODS);
    expect(item.grams).toBe(1);
  });

  it('rescales a meal item when the user edits the weight', () => {
    const [item] = analysisItemsToMealItems([{ name: 'Chicken Breast', grams: 100, calories: 165 }], 'en', FOODS);
    const doubled = rescaleMealItem(item, 200);
    expect(doubled.cal).toBe(330);
    expect(doubled.p).toBeCloseTo(62);
    expect(rescaleMealItem(item, 0).grams).toBe(1);
  });
});

describe('hidden ingredients and ranges', () => {
  it('maps hidden ingredients to database foods with sensible default grams', () => {
    const suggestions = suggestHiddenIngredients(['cooking oil', 'butter', 'sugar', 'butter'], FOODS);
    expect(suggestions.map((entry) => entry.food?.name.en)).toEqual(['Sunflower Oil', 'Butter', 'Sugar']);
    expect(suggestions[0].grams).toBe(12);
  });

  it('keeps unknown hidden ingredients as text-only hints', () => {
    const [suggestion] = suggestHiddenIngredients(['secret marinade'], FOODS);
    expect(suggestion).toMatchObject({ label: 'secret marinade', food: null, grams: 0 });
  });

  it('widens the estimate range when confidence is low or hidden calories are likely', () => {
    expect(getPhotoEstimateRange(500, 0.9, 0)).toEqual({ low: 395, high: 605 });
    const uncertain = getPhotoEstimateRange(500, 0.4, 2);
    expect(uncertain.low).toBeLessThan(395);
    expect(uncertain.high).toBeGreaterThan(605);
    expect(getPhotoEstimateRange(0)).toEqual({ low: 0, high: 0 });
  });
});
