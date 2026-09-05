import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '../i18n/LanguageContext';
import Onboarding from './Onboarding';

function renderOnboarding(onSubmit = vi.fn(), props = {}) {
  localStorage.setItem('shredmatrix_lang', 'tr');
  render(
    <LanguageProvider>
      <Onboarding onSubmit={onSubmit} {...props} />
    </LanguageProvider>,
  );
  return onSubmit;
}

describe('Onboarding step flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows health and allergy choices together before submitting the plan', async () => {
    const onSubmit = renderOnboarding();

    fireEvent.click(screen.getByRole('button', { name: /Devam/i }));
    fireEvent.change(await screen.findByPlaceholderText(/Adınızı girin/i), { target: { value: 'Tolga' } });
    fireEvent.click(screen.getByRole('button', { name: /Devam/i }));

    // Focus step: weekly day count plus optional priority regions.
    expect(await screen.findByText(/Haftada kaç gün antrenman yapabilirsin/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^3\s*gün \/ hafta/i }));
    fireEvent.click(screen.getByRole('button', { name: /Kalça & Bacak/i }));
    fireEvent.click(screen.getByRole('button', { name: /Karın & Core/i }));
    fireEvent.click(screen.getByRole('button', { name: /Omuz$/i }));
    fireEvent.click(screen.getByRole('button', { name: /Devam/i }));

    expect(await screen.findByText(/Herhangi bir sağlık sorununuz var mı/i)).toBeInTheDocument();
    expect(await screen.findByText(/Gıda alerjiniz veya beslenme tercihiniz var mı/i)).toBeInTheDocument();
    fireEvent.click(await screen.findByRole('button', { name: /Programı Oluştur/i }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      bodyFatPercentage: null,
      healthConditions: ['none'],
      allergies: ['none'],
      trainingDaysPerWeek: 3,
      // Selecting a third region replaces the oldest choice.
      focusAreas: ['core', 'shoulders'],
    }));
  });

  it('keeps saved health data and still shows allergy choices while editing', async () => {
    localStorage.setItem('fb_onboarding_draft', JSON.stringify({
      step: 3,
      name: 'Old Draft',
      healthConditions: ['none'],
      allergies: ['none'],
    }));

    const onSubmit = renderOnboarding(vi.fn(), {
      initialData: {
        name: 'Tolga',
        age: 32,
        gender: 'male',
        height: 175,
        weight: 75,
        experience: 'intermediate',
        activityLevel: 'moderate',
        primaryGoal: 'muscle',
        healthConditions: ['back_pain'],
        allergies: ['none'],
      },
      resetDraftKey: 1,
    });

    fireEvent.click(screen.getByRole('button', { name: /Devam/i }));
    fireEvent.click(screen.getByRole('button', { name: /Devam/i }));
    expect(await screen.findByText(/Öncelikli bölge/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Devam/i }));

    expect(await screen.findByText(/Herhangi bir sağlık sorununuz var mı/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(await screen.findByText(/Gıda alerjiniz veya beslenme tercihiniz var mı/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Bel Ağrısı/i })).toHaveClass('border-orange-500');
  });

  it('shows equipment choices only when they change the generated program', () => {
    renderOnboarding();

    expect(screen.getByText(/Nerede çalışacaksın/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^Yoga/i }));
    expect(screen.queryByText(/Nerede çalışacaksın/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^Reformer/i }));
    expect(screen.getByText(/Nerede çalışacaksın/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ev reformeri/i })).toBeInTheDocument();
  });
});
