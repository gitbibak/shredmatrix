import { describe, expect, it } from 'vitest';
import { buildShoppingList } from './shoppingList';

describe('buildShoppingList', () => {
  const days = [
    { meals: [{ items: ['Yoğurt (200g) + ceviz', 'Muz (1 adet)'] }] },
    { meals: [{ items: ['Yoğurt (200g) + bal', 'Muz (1 adet)'] }] },
  ];

  it('splits combined ingredients and merges weekly duplicates', () => {
    expect(buildShoppingList(days, [0, 1])).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: 'Yoğurt (200g)', count: 2 }),
      expect.objectContaining({ label: 'Muz (1 adet)', count: 2 }),
      expect.objectContaining({ label: 'ceviz', count: 1 }),
    ]));
  });

  it('only includes the selected day', () => {
    const result = buildShoppingList(days, [0]);
    expect(result.some(item => item.label === 'bal')).toBe(false);
    expect(result.find(item => item.label === 'Yoğurt (200g)')?.count).toBe(1);
  });
});
