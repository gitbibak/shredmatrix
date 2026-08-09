import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { LanguageProvider } from '../i18n/LanguageContext';
import AnalyticsConsent from './AnalyticsConsent';

function renderConsent() {
  return render(
    <LanguageProvider>
      <AnalyticsConsent />
    </LanguageProvider>,
  );
}

describe('AnalyticsConsent', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('shredmatrix_lang', 'tr');
    delete window.gtag;
    delete window.dataLayer;
  });

  it('explains the choice without exposing technical wording', () => {
    renderConsent();

    expect(screen.getByRole('dialog', { name: "Full Balance'ı birlikte geliştirelim" })).toBeInTheDocument();
    expect(screen.getByText('Sağlık ve hesap bilgilerin paylaşılmaz.', { exact: false })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ayrıntıları gör' })).toHaveAttribute('href', '/privacy');
  });

  it('stores a rejection and closes without enabling analytics', () => {
    renderConsent();
    fireEvent.click(screen.getByRole('button', { name: 'Hayır, teşekkürler' }));

    expect(localStorage.getItem('fullbalance_analytics_consent')).toBe('denied');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.querySelector('script[data-fullbalance-ga]')).not.toBeInTheDocument();
  });

  it('does not show again after a choice has been saved', () => {
    localStorage.setItem('fullbalance_analytics_consent', 'denied');
    renderConsent();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
