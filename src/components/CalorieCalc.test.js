import { describe, expect, it } from 'vitest';
import { getMealEstimateRange } from './CalorieCalc';

describe('meal calorie estimate range', () => {
  it('returns zero for empty or invalid totals', () => {
    expect(getMealEstimateRange(0, true)).toEqual({ low: 0, high: 0 });
    expect(getMealEstimateRange('invalid', false)).toEqual({ low: 0, high: 0 });
  });

  it('uses a wider range when a photo is used as the meal reference', () => {
    expect(getMealEstimateRange(500, true)).toEqual({ low: 400, high: 650 });
    expect(getMealEstimateRange(500, false)).toEqual({ low: 450, high: 575 });
  });

  it('rounds displayed calorie bounds to whole numbers', () => {
    expect(getMealEstimateRange(333, true)).toEqual({ low: 266, high: 433 });
  });
});
