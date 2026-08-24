import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ShareCard from './ShareCard';
import { LanguageProvider } from '../i18n/LanguageContext';

const plan = {
  userName: 'Test Kullanıcı',
  goal: 'Kas Gelişimi',
  dailyCalories: 2450,
  macros: { protein: 160, carbs: 280, fat: 78 },
  bmi: 23.2,
  userWeight: 74,
};

describe('ShareCard', () => {
  beforeEach(() => {
    localStorage.setItem('shredmatrix_lang', 'tr');
    window.scrollTo = vi.fn();
  });

  it('keeps the share summary and invitation actions clearly separated', () => {
    render(
      <LanguageProvider>
        <ShareCard plan={plan} onClose={vi.fn()} />
      </LanguageProvider>,
    );

    expect(screen.getByText('Paylaşım özeti')).toBeInTheDocument();
    expect(screen.getByText('Test Kullanıcı')).toBeInTheDocument();
    expect(screen.getByText('2450')).toBeInTheDocument();
    expect(screen.getByText('Arkadaşlarını Davet Et')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Kapat' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Davet Linkini Kopyala' })).toBeInTheDocument();
    expect(screen.getByText('Yalnızca bu kartta gördüğün bilgiler paylaşılır.')).toBeInTheDocument();
  });
});
