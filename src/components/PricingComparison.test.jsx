import { render, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PricingComparison from './PricingComparison';
import { pricingPages } from '../data/pricingPages';

describe('PricingComparison', () => {
  it.each(pricingPages)('preserves mobile and desktop comparisons in $lang', page => {
    const { container } = render(<PricingComparison headings={page.compareHead} rows={page.compareRows} />);
    const mobile = container.querySelector('.sm\\:hidden');
    const desktop = container.querySelector('table');
    expect(mobile.querySelectorAll('section')).toHaveLength(page.compareRows.length);
    expect(desktop.querySelectorAll('tbody tr')).toHaveLength(page.compareRows.length);
    page.compareRows.forEach(([feature, ours, theirs], index) => {
      const row = within(mobile.querySelectorAll('section')[index]);
      expect(row.getByRole('heading', { name: feature })).toBeInTheDocument();
      expect(row.getByText(ours)).toBeInTheDocument();
      expect(row.getByText(theirs)).toBeInTheDocument();
    });
    expect(desktop).toHaveClass('table-fixed', 'w-full');
    expect(container.innerHTML).not.toContain('min-w-[');
  });
});
