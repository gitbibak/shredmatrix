import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { LanguageProvider } from '../i18n/LanguageContext';
import AnalyticsConsent from './AnalyticsConsent';

function renderConsent(props = {}) {
  return render(
    <LanguageProvider>
      <AnalyticsConsent active delayMs={0} {...props} />
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

  it('stays hidden outside the authenticated app', () => {
    renderConsent({ active: false });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('explains the optional choice after the user enters the app', async () => {
    renderConsent();

    expect(await screen.findByRole('dialog', { name: 'Anonim kullanım analizine izin verilsin mi?' })).toBeInTheDocument();
    expect(screen.getByText('Reddetsen de uygulamanın tüm özellikleri çalışır.', { exact: false })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ayrıntıları gör' })).toHaveAttribute('href', '/privacy');
  });

  it('stores a rejection and closes without enabling analytics', async () => {
    renderConsent();
    fireEvent.click(await screen.findByRole('button', { name: 'İzin verme' }));

    expect(localStorage.getItem('fullbalance_analytics_consent')).toBe('denied');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.querySelector('script[data-fullbalance-ga]')).not.toBeInTheDocument();
  });

  it('does not show again after a choice has been saved', async () => {
    localStorage.setItem('fullbalance_analytics_consent', 'denied');
    renderConsent();

    await new Promise((resolve) => setTimeout(resolve, 5));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
