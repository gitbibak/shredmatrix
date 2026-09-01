import { describe, expect, it } from 'vitest';
import { buildMealPrompt, extractJsonObject, normalizeMealAnalysis, sanitizeVocabulary } from './mealAnalysis';

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

  it('keeps canonical and display names separate', () => {
    const result = normalizeMealAnalysis({
      is_food: true,
      items: [{ canonical_name: 'Rice (Cooked)', display_name: 'Pirinç pilavı', estimated_grams: 180, calories: 234 }],
    });
    expect(result.items[0]).toMatchObject({ name: 'Pirinç pilavı', canonical: 'Rice (Cooked)' });
  });

  it('caps calories at the physical maximum for the estimated weight', () => {
    const result = normalizeMealAnalysis({
      is_food: true,
      items: [{ name: 'Salad', estimated_grams: 100, calories: 3000 }],
    });
    expect(result.items[0].calories).toBe(900);
  });

  it('rejects empty and non-food responses', () => {
    expect(normalizeMealAnalysis({ is_food: false, items: [] }).isFood).toBe(false);
    expect(normalizeMealAnalysis({ is_food: 'false', items: [] }).isFood).toBe(false);
    expect(normalizeMealAnalysis({ is_food: true, items: [] }).isFood).toBe(false);
  });
});

describe('vocabulary and prompt', () => {
  it('sanitizes the client vocabulary', () => {
    const vocabulary = sanitizeVocabulary(['Rice (Cooked)', 'rice (cooked)', '<script>', 42, 'Chicken Breast']);
    expect(vocabulary).toEqual(['Rice (Cooked)', 'script', 'Chicken Breast']);
    expect(sanitizeVocabulary('nope')).toEqual([]);
    expect(sanitizeVocabulary(Array.from({ length: 500 }, (_, index) => `Food ${index}`))).toHaveLength(320);
  });

  it('includes the vocabulary and output language in the prompt', () => {
    const prompt = buildMealPrompt('tr', ['Rice (Cooked)', 'Chicken Breast']);
    expect(prompt).toContain('Rice (Cooked); Chicken Breast');
    expect(prompt).toContain('natural Turkish name');
    expect(buildMealPrompt('es')).toContain('generic English food name');
  });
});
