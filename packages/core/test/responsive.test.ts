import { describe, it, expect, afterEach } from 'vitest';
import { Heatmap } from '../src/index';
import { computeAggregationFactor, aggregateData } from '../src/aggregate';

describe('computeAggregationFactor', () => {
  it('returns 1 when cells are already above the minimum touch size', () => {
    expect(computeAggregationFactor(800, 800, 4, 4)).toBe(1);
  });

  it('returns a factor greater than 1 when cells would be smaller than the minimum', () => {
    // 100px / 20 cols = 5px cells, far below the 44px minimum
    expect(computeAggregationFactor(100, 100, 20, 20)).toBeGreaterThan(1);
  });

  it('returns 1 for empty data rather than dividing by zero', () => {
    expect(computeAggregationFactor(400, 300, 0, 0)).toBe(1);
  });
});

describe('aggregateData', () => {
  it('averages values within each aggregated block', () => {
    const data = [
      { row: 'Mon', col: '8am', value: 10 },
      { row: 'Mon', col: '9am', value: 20 },
      { row: 'Tue', col: '8am', value: 30 },
      { row: 'Tue', col: '9am', value: 40 },
    ];
    const result = aggregateData(data, ['Mon', 'Tue'], ['8am', '9am'], 2);
    expect(result.length).toBe(1);
    expect(result[0].value).toBe(25); // (10+20+30+40)/4
    expect(result[0].meta?.count).toBe(4);
  });

  it('passes data through unchanged when factor is 1', () => {
    const data = [{ row: 'Mon', col: '8am', value: 10 }];
    expect(aggregateData(data, ['Mon'], ['8am'], 1)).toBe(data);
  });
});

describe('Heatmap responsive rendering', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders fewer cells than raw data when the container is too small for one-to-one rendering', () => {
    const el = document.createElement('div');
    Object.defineProperty(el, 'clientWidth', { value: 80, configurable: true });
    Object.defineProperty(el, 'clientHeight', { value: 80, configurable: true });
    const chart = new Heatmap(el);
    chart.load([
      { row: 'Mon', col: '8am', value: 1 },
      { row: 'Mon', col: '9am', value: 2 },
      { row: 'Tue', col: '8am', value: 3 },
      { row: 'Tue', col: '9am', value: 4 },
    ]);
    expect(el.querySelectorAll('rect').length).toBeLessThan(4);
  });

  it('renders one rect per cell when the container is large enough', () => {
    const el = document.createElement('div');
    Object.defineProperty(el, 'clientWidth', { value: 800, configurable: true });
    Object.defineProperty(el, 'clientHeight', { value: 800, configurable: true });
    const chart = new Heatmap(el);
    chart.load([
      { row: 'Mon', col: '8am', value: 1 },
      { row: 'Mon', col: '9am', value: 2 },
    ]);
    expect(el.querySelectorAll('rect').length).toBe(2);
  });
});