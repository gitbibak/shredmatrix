import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '../i18n/LanguageContext';
import Onboarding from './Onboarding';

function renderOnboarding(onSubmit = vi.fn()) {
  localStorage.setItem('shredmatrix_lang', 'tr');
  render(
    <LanguageProvider>
      <Onboarding onSubmit={onSubmit} />
    </LanguageProvider>,
  );
  return onSubmit;
}

describe('Onboarding step flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('moves from health to allergy step before submitting the plan', async () => {
    const onSubmit = renderOnboarding();

    fireEvent.click(screen.getByRole('button', { name: /Devam/i }));
    fireEvent.change(await screen.findByPlaceholderText(/Adınızı girin/i), { target: { value: 'Tolga' } });
    fireEvent.click(screen.getByRole('button', { name: /Devam/i }));
    fireEvent.click(screen.getByRole('button', { name: /Devam/i }));
    fireEvent.click(screen.getByRole('button', { name: /Devam/i }));

    expect(await screen.findByText(/Herhangi bir sağlık sorununuz var mı/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Devam/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(await screen.findByText(/Gıda alerjiniz veya hassasiyetiniz var mı/i)).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /Programı Oluştur/i })).toBeInTheDocument();
  });
});
