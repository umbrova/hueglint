import { describe, it, expect, vi, afterEach} from 'vitest';
import { Heatmap } from '../src/index';

describe('Heatmap', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

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

  it('renders an Error state instead of throwing on invalid data', () => {
    const el = document.createElement('div');
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const chart = new Heatmap(el);
    expect(() => chart.load([{ row: 'Mon', col: '8am', value: 'not a number' }])).not.toThrow();
    expect(el.querySelector('[role="alert"]')).not.toBeNull();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
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

  it('changes colors when setPalette is called, without recreating the chart', () => {
    const el = document.createElement('div');
    const chart = new Heatmap(el);
    chart.load([
      { row: 'Mon', col: '8am', value: 1 },
      { row: 'Mon', col: '9am', value: 100 },
    ]);
    const svgBefore = el.querySelector('svg');
    const fillBefore = el.querySelector('rect')?.getAttribute('fill');

    chart.setPalette('plasma');

    expect(el.querySelector('svg')).toBe(svgBefore);
    expect(el.querySelector('rect')?.getAttribute('fill')).not.toBe(fillBefore);
  });

  it('warns and ignores an invalid palette passed to setPalette', () => {
    const el = document.createElement('div');
    const chart = new Heatmap(el);
    chart.load([{ row: 'Mon', col: '8am', value: 1 }]);
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fillBefore = el.querySelector('rect')?.getAttribute('fill');
    chart.setPalette('rainbow' as unknown as never);
    expect(el.querySelector('rect')?.getAttribute('fill')).toBe(fillBefore);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('warns and has no effect calling setPalette while in diff mode', () => {
    const el = document.createElement('div');
    const chart = new Heatmap(el);
    chart.loadDiff([{ row: 'Mon', col: '8am', value: 10 }], [{ row: 'Mon', col: '8am', value: 5 }]);
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fillBefore = el.querySelector('rect')?.getAttribute('fill');
    chart.setPalette('plasma');
    expect(el.querySelector('rect')?.getAttribute('fill')).toBe(fillBefore);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
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