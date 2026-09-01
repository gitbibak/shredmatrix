import { describe, expect, it } from 'vitest';
import { extractJsonObject, normalizeMealAnalysis } from './mealAnalysis';

describe('meal analysis response validation', () => {
  it('extracts JSON from a fenced model response', () => {
    expect(extractJsonObject('```json\n{"is_food":false}\n```')).toEqual({ is_food: false });
  });

  it('normalizes items and calculates a conservative range', () => {
    const result = normalizeMealAnalysis({
      is_food: true,
      meal_name: 'Chicken plate',
      confidence: 0.8,
      hidden_ingredients: [],
      items: [{ name: 'Chicken', estimated_grams: 150, calories: 250, protein_g: 35, carbs_g: 0, fat_g: 10, confidence: 0.9 }],
    });
    expect(result.isFood).toBe(true);
    expect(result.items[0]).toMatchObject({ name: 'Chicken', grams: 150, calories: 250 });
    expect(result.calorieRange).toEqual({ low: 190, high: 310 });
  });

  it('rejects empty and non-food responses', () => {
    expect(normalizeMealAnalysis({ is_food: false, items: [] }).isFood).toBe(false);
    expect(normalizeMealAnalysis({ is_food: 'false', items: [] }).isFood).toBe(false);
    expect(normalizeMealAnalysis({ is_food: true, items: [] }).isFood).toBe(false);
  });

});
