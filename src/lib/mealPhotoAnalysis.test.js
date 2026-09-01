import { describe, expect, it, vi } from 'vitest';
import { analysisItemsToMealItems, analyzeMealPhoto } from './mealPhotoAnalysis';

describe('meal photo API client', () => {
  it('posts the compressed image and returns the validated response', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ isFood: true, items: [] }),
    });
    await expect(analyzeMealPhoto('data:image/jpeg;base64,abc', 'tr', fetchImpl)).resolves.toMatchObject({ isFood: true });
    expect(fetchImpl).toHaveBeenCalledWith('/api/analyze-meal', expect.objectContaining({ method: 'POST' }));
  });

  it('converts automatic totals to editable per-100g meal items', () => {
    const [item] = analysisItemsToMealItems([{ name: 'Rice', grams: 200, calories: 260, protein: 5, carbs: 56, fat: 1, confidence: 0.8 }], 'en');
    expect(item).toMatchObject({ source: 'photo', grams: 200, cal: 260 });
    expect(item.food.cal).toBe(130);
  });

  it('uses the known food database instead of implausible model macros', () => {
    const foods = [{ name: { tr: 'Domates', en: 'Tomato', es: 'Tomate' }, cal: 18, p: 0.9, c: 3.9, f: 0.2, cat: 'veggie' }];
    const [item] = analysisItemsToMealItems([{ name: 'Tomatoes', grams: 100, calories: 20, protein: 20, carbs: 0, fat: 0 }], 'en', foods);
    expect(item).toMatchObject({ cal: 18, p: 0.9, c: 3.9, f: 0.2 });
    expect(item.food.name.tr).toBe('Domates');
  });

  it('does not treat a visible item count as grams', () => {
    const foods = [{ name: { tr: 'Zeytinyağı', en: 'Olive Oil', es: 'Aceite de Oliva' }, cal: 884, p: 0, c: 0, f: 100, cat: 'sauce' }];
    const [item] = analysisItemsToMealItems([{ name: 'Olive Oil', grams: 1, calories: 20 }], 'en', foods);
    expect(item.grams).toBe(14);
    expect(item.cal).toBe(124);
  });

  it('removes duplicate detections and zero-nutrition artifacts', () => {
    const foods = [
      { name: { tr: 'Zeytinyağı', en: 'Olive Oil', es: 'Aceite de Oliva' }, cal: 884, p: 0, c: 0, f: 100, cat: 'sauce' },
      { name: { tr: 'Marul', en: 'Lettuce', es: 'Lechuga' }, cal: 15, p: 1.4, c: 2.9, f: 0.2, cat: 'veggie' },
    ];
    const result = analysisItemsToMealItems([
      { name: 'Olive Oil', grams: 14, calories: 124, confidence: 0.8 },
      { name: 'Olive Oil', grams: 8, calories: 71, confidence: 0.9 },
      { name: 'Mixed Greens', grams: 50, calories: 8 },
      { name: 'Water', grams: 1, calories: 0, protein: 0, carbs: 0, fat: 0 },
    ], 'en', foods);

    expect(result).toHaveLength(2);
    expect(result.filter((item) => item.food.name.en === 'Olive Oil')).toHaveLength(1);
    expect(result.find((item) => item.food.name.en === 'Olive Oil')).toMatchObject({ grams: 14, confidence: 0.9 });
    expect(result.find((item) => item.food.name.en === 'Lettuce')).toMatchObject({ grams: 50 });
  });

  it('uses a realistic garnish amount for detected lemon juice', () => {
    const foods = [{ name: { tr: 'Limon', en: 'Lemon', es: 'Limón' }, cal: 29, p: 1.1, c: 9, f: 0.3, cat: 'fruit' }];
    const [item] = analysisItemsToMealItems([{ name: 'Lemon Juice', grams: 1, calories: 0 }], 'en', foods);
    expect(item.grams).toBe(15);
  });
});
