import { describe, it, expect } from 'vitest';
import { Heatmap } from '../src/index';

describe('Heatmap', () => {
  it('renders one rect per cell', () => {
    const el = document.createElement('div');
    Object.defineProperty(el, 'clientWidth', { value: 400 });
    Object.defineProperty(el, 'clientHeight', { value: 300 });

    const chart = new Heatmap(el);
    chart.load([
      { row: 'Mon', col: '8am', value: 42 },
      { row: 'Mon', col: '9am', value: 58 },
    ]);

    expect(el.querySelectorAll('rect').length).toBe(2);
  });

  it('throws a clear error on invalid data', () => {
    const el = document.createElement('div');
    const chart = new Heatmap(el);
    expect(() => chart.load([{ row: 'Mon', col: '8am', value: 'not a number' }])).toThrow(
      /expected value to be a number/
    );
  });

  it('cleans up on destroy', () => {
    const el = document.createElement('div');
    const chart = new Heatmap(el);
    chart.destroy();
    expect(el.querySelector('svg')).toBeNull();
  });
});