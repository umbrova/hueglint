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

  it('applies different colors based on value', () => {
    const el = document.createElement('div');
    Object.defineProperty(el, 'clientWidth', { value: 400 });
    Object.defineProperty(el, 'clientHeight', { value: 300 });
    const chart = new Heatmap(el);
    chart.load([
      { row: 'Mon', col: '8am', value: 1 },
      { row: 'Mon', col: '9am', value: 100 },
    ]);
    const rects = el.querySelectorAll('rect');
    expect(rects[0].getAttribute('fill')).not.toBe(rects[1].getAttribute('fill'));
  });

  it('throws a clear error on an invalid palette', () => {
    const el = document.createElement('div');
    expect(() => new Heatmap(el, { palette: 'rainbow' as any })).toThrow(/Invalid palette/);
  });

  it('does not produce NaN colors when all values are identical', () => {
    const el = document.createElement('div');
    const chart = new Heatmap(el);
    chart.load([
      { row: 'Mon', col: '8am', value: 5 },
      { row: 'Tue', col: '9am', value: 5 },
    ]);
    const rect = el.querySelector('rect');
    expect(rect?.getAttribute('fill')).not.toContain('NaN');
  });

  it('renders an accessible table alongside the visual chart', () => {
    const el = document.createElement('div');
    const chart = new Heatmap(el);
    chart.load(
      [{ row: 'Mon', col: '8am', value: 42 }],
      { rowLabel: 'Day', colLabel: 'Hour', valueLabel: 'Requests' }
    );

    const table = el.querySelector('table');
    expect(table).not.toBeNull();
    expect(table?.querySelector('caption')?.textContent).toContain('Requests');
    expect(table?.querySelectorAll('th').length).toBe(3);
    expect(table?.querySelectorAll('td')[2].textContent).toBe('42');
  });

  it('hides the SVG from assistive tech since the table is the real source', () => {
    const el = document.createElement('div');
    const chart = new Heatmap(el);
    chart.load([{ row: 'Mon', col: '8am', value: 1 }]);
    expect(el.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('gives each instance a unique table id, even with identical data', () => {
    const el1 = document.createElement('div');
    const el2 = document.createElement('div');
    const chart1 = new Heatmap(el1);
    const chart2 = new Heatmap(el2);
    chart1.load([{ row: 'Mon', col: '8am', value: 1 }]);
    chart2.load([{ row: 'Mon', col: '8am', value: 1 }]);

    const id1 = el1.querySelector('table')?.id;
    const id2 = el2.querySelector('table')?.id;
    expect(id1).not.toBe(id2);
  });

  it('cleans up on destroy', () => {
    const el = document.createElement('div');
    const chart = new Heatmap(el);
    chart.destroy();
    expect(el.querySelector('svg')).toBeNull();
  });

  it('is safe to call destroy() more than once', () => {
    const el = document.createElement('div');
    const chart = new Heatmap(el);
    chart.load([{ row: 'Mon', col: '8am', value: 1 }]);
    expect(() => {
      chart.destroy();
      chart.destroy();
    }).not.toThrow();
  });

  it('is safe to call destroy() before load() was ever called', () => {
    const el = document.createElement('div');
    const chart = new Heatmap(el);
    expect(() => chart.destroy()).not.toThrow();
  });
});