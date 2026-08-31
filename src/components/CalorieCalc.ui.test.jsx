import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CalorieCalc from './CalorieCalc';
import { LanguageProvider } from '../i18n/LanguageContext';

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
      expect(preview.getAttribute('src')).toMatch(/^data:image\/jpeg;base64,/);
    });
  });
});
