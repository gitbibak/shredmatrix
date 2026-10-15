import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AffiliateGear from './AffiliateGear';
import { getAffiliateProducts } from '../data/affiliateProducts';
import { trackEvent } from '../lib/analytics';

vi.mock('../lib/analytics', () => ({ trackEvent: vi.fn() }));
vi.mock('../data/affiliateProducts', async (importOriginal) => ({
  ...(await importOriginal()),
  getAffiliateProducts: vi.fn(),
}));

const product = { id: 'exercise-mat', label: 'Egzersiz matı', reason: 'Yer hareketleri için.', store: 'Trendyol', url: 'https://www.trendyol.com/x' };

describe('AffiliateGear', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders nothing until a link is configured', () => {
    getAffiliateProducts.mockReturnValue([]);
    const { container } = render(<AffiliateGear placement="seo_tr_dumbbell" set="dumbbell" lang="tr" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows a disclosed, sponsored link and tracks the click', () => {
    getAffiliateProducts.mockReturnValue([product]);
    render(<AffiliateGear placement="seo_tr_dumbbell" set="dumbbell" lang="tr" />);
    expect(screen.getByText(/ortaklık bağlantılarıdır/i)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /Ürünü incele · Trendyol/ });
    expect(link).toHaveAttribute('href', product.url);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toContain('sponsored');
    expect(link.getAttribute('rel')).toContain('nofollow');
    fireEvent.click(link);
    expect(trackEvent).toHaveBeenCalledWith('affiliate_link_click', { placement: 'seo_tr_dumbbell', productId: 'exercise-mat', language: 'tr', store: 'Trendyol' });
  });

  it('shows the exact Amazon Associates statement only when an Amazon link is present', () => {
    getAffiliateProducts.mockReturnValue([{ ...product, store: 'Amazon', url: 'https://www.amazon.com/s?k=mat&tag=fullbalance-20' }]);
    const { unmount } = render(<AffiliateGear placement="seo_es_band" set="band" lang="es" />);
    expect(screen.getByText('As an Amazon Associate I earn from qualifying purchases.')).toBeInTheDocument();
    unmount();
    getAffiliateProducts.mockReturnValue([product]);
    render(<AffiliateGear placement="seo_tr_band" set="band" lang="tr" />);
    expect(screen.queryByText(/As an Amazon Associate/)).not.toBeInTheDocument();
  });

  it('collapses in the app and keeps the disclosure', () => {
    getAffiliateProducts.mockReturnValue([{ ...product, store: '' }]);
    render(<AffiliateGear placement="app_home_basic" set="dumbbell" lang="es" compact />);
    expect(screen.getByText('¿Te falta equipamiento?')).toBeInTheDocument();
    expect(screen.getByText(/enlaces de afiliado/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: /Ver producto/ }));
    expect(trackEvent).toHaveBeenCalledWith('affiliate_link_click', { placement: 'app_home_basic', productId: 'exercise-mat', language: 'es' });
  });
});
