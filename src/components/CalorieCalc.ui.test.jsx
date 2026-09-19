import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CalorieCalc from './CalorieCalc';
import { LanguageProvider } from '../i18n/LanguageContext';
import { analyzeMealPhoto } from '../lib/mealPhotoAnalysis';
import { trackEvent } from '../lib/analytics';

vi.mock('../lib/analytics', () => ({ trackEvent: vi.fn() }));

vi.mock('../lib/mealPhotoAnalysis', async (importOriginal) => ({
  ...(await importOriginal()),
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
  it('completes the estimate visibly once and permits completion after portion changes', async () => {
    renderCalculator();
    fireEvent.change(screen.getByLabelText('Galeriden seç'), {
      target: { files: [new File(['photo'], 'meal.jpg', { type: 'image/jpeg' })] },
    });
    const complete = await screen.findByRole('button', { name: 'Tahmini tamamla' });
    trackEvent.mockClear();
    fireEvent.click(complete);
    expect(screen.getByRole('status')).toHaveTextContent('Tahmin tamamlandı');
    expect(screen.getByRole('status')).toHaveTextContent('hesabına kaydedilmez');
    expect(screen.getByRole('button', { name: 'Tahmin tamamlandı' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Tahmin tamamlandı' }));
    expect(trackEvent).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByLabelText('Porsiyonu artır'));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tahmini tamamla' }));
    expect(screen.getByRole('status')).toHaveTextContent('Tahmin tamamlandı');
    expect(trackEvent).toHaveBeenCalledTimes(2);
  });

  it.each(['throw', 'reject'])('keeps completion working when analytics fails: %s', async (failure) => {
    renderCalculator();
    fireEvent.change(screen.getByLabelText('Galeriden seç'), {
      target: { files: [new File(['photo'], 'meal.jpg', { type: 'image/jpeg' })] },
    });
    const complete = await screen.findByRole('button', { name: 'Tahmini tamamla' });
    trackEvent.mockImplementationOnce(() => {
      if (failure === 'throw') throw new Error('analytics unavailable');
      return Promise.reject(new Error('analytics unavailable'));
    });
    fireEvent.click(complete);
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Tahmin tamamlandı'));
  });

  it('retries the selected photo after an analysis failure', async () => {
    analyzeMealPhoto.mockRejectedValueOnce(new Error('temporary failure'));
    renderCalculator();
    fireEvent.change(screen.getByLabelText('Galeriden seç'), {
      target: { files: [new File(['photo'], 'meal.jpg', { type: 'image/jpeg' })] },
    });
    const retry = await screen.findByRole('button', { name: 'Analizi tekrar dene' });
    fireEvent.click(retry);
    expect(await screen.findByText('Otomatik tahmin hazır')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Analizi tekrar dene' })).not.toBeInTheDocument();
    expect(screen.getByAltText('Kalori tahmini için seçilen öğün')).toBeInTheDocument();
  });
  it('does not restore results after the photo was removed during analysis', async () => {
    let finish;
    analyzeMealPhoto.mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
    renderCalculator();
    fireEvent.change(screen.getByLabelText('Galeriden seç'), { target: { files: [new File(['photo'], 'meal.jpg', { type: 'image/jpeg' })] } });
    await screen.findByAltText('Kalori tahmini için seçilen öğün');
    await waitFor(() => expect(finish).toBeTypeOf('function'));
    fireEvent.click(screen.getByRole('button', { name: 'Öğün fotoğrafını kaldır' }));
    finish({ isFood: true, items: [{ name: 'Tavuk', grams: 150, calories: 240 }] });
    await waitFor(() => expect(screen.queryByText('Otomatik tahmin hazır')).not.toBeInTheDocument());
    expect(screen.queryByAltText('Kalori tahmini için seçilen öğün')).not.toBeInTheDocument();
  });
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
    expect(screen.getByText('150g')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Yiyecek ara...')).not.toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    expect(screen.getByText('Başka bir işlem yapman gerekmiyor.', { exact: false })).toBeInTheDocument();

    // Portions stay editable after the automatic estimate.
    fireEvent.click(screen.getByLabelText('Porsiyonu artır'));
    expect(screen.getByText('175g')).toBeInTheDocument();
    expect(screen.getByText('280 kcal')).toBeInTheDocument();

    // Manual search can be reopened to add a missed food.
    fireEvent.click(screen.getByText('Eksik yiyecek ekle'));
    expect(screen.getByPlaceholderText('Yiyecek ara...')).toBeInTheDocument();
  });
});
