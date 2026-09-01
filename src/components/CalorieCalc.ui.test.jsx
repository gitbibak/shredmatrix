import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CalorieCalc from './CalorieCalc';
import { LanguageProvider } from '../i18n/LanguageContext';

vi.mock('../lib/mealPhotoAnalysis', () => ({
  prepareMealPhoto: vi.fn().mockResolvedValue('data:image/jpeg;base64,compressed'),
  analyzeMealPhoto: vi.fn().mockResolvedValue({
    isFood: true,
    calorieRange: { low: 180, high: 300 },
    hiddenIngredients: [],
    items: [{ name: 'Tavuk', grams: 150, calories: 240, protein: 32, carbs: 2, fat: 10, confidence: 0.8 }],
  }),
  analysisItemsToMealItems: vi.fn().mockReturnValue([{
    id: 'photo-test', source: 'photo', grams: 150, cal: 240, p: 32, c: 2, f: 10,
    food: { name: { tr: 'Tavuk', en: 'Chicken', es: 'Pollo' }, cal: 160, p: 21.33, c: 1.33, f: 6.67, cat: 'photo' },
  }]),
}));

function renderCalculator() {
  return render(
    <LanguageProvider>
      <CalorieCalc language="tr" embedded />
    </LanguageProvider>,
  );
}

describe('meal photo controls', () => {
  it('keeps camera capture separate from the photo library', () => {
    renderCalculator();

    expect(screen.getByLabelText('Fotoğraf çek')).toHaveAttribute('capture', 'environment');
    expect(screen.getByLabelText('Galeriden seç')).not.toHaveAttribute('capture');
  });

  it('shows a local preview after choosing a meal photo', async () => {
    renderCalculator();
    const file = new File(['meal-image'], 'meal.jpg', { type: 'image/jpeg' });

    fireEvent.change(screen.getByLabelText('Galeriden seç'), { target: { files: [file] } });

    await waitFor(() => {
      const preview = screen.getByAltText('Kalori tahmini için seçilen öğün');
      expect(preview.getAttribute('src')).toBe('data:image/jpeg;base64,compressed');
    });

    expect(await screen.findByText('Otomatik tahmin hazır')).toBeInTheDocument();
    expect(screen.getByText('Tavuk')).toBeInTheDocument();
    expect(screen.getByText('~150g')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Yiyecek ara...')).not.toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    expect(screen.getByText('Başka bir işlem yapman gerekmiyor.', { exact: false })).toBeInTheDocument();
  });
});
