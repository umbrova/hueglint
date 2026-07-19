import { describe, it, expect, vi, afterEach} from 'vitest';
import { Heatmap } from '../src/index';

describe('Heatmap', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });


  it('makes exactly one cell tabbable at a time (roving tabindex)', () => {
    const el = document.createElement('div');
    const chart = new Heatmap(el);
    chart.load([
      { row: 'Mon', col: '8am', value: 1 },
      { row: 'Mon', col: '9am', value: 2 },
    ]);
    const rects = el.querySelectorAll('rect');
    const tabbable = Array.from(rects).filter((r) => r.getAttribute('tabindex') === '0');
    expect(tabbable.length).toBe(1);
  });

  it('moves focus right on ArrowRight, based on grid position not array order', () => {
    const el = document.createElement('div');
    const chart = new Heatmap(el);
    chart.load([
      { row: 'Mon', col: '9am', value: 2 }, // deliberately out of visual order
      { row: 'Mon', col: '8am', value: 1 },
    ]);
    const rects = el.querySelectorAll('rect');
    const firstCol = Array.from(rects).find((r) => r.getAttribute('tabindex') === '0')!;
    firstCol.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    const nowFocused = Array.from(rects).filter((r) => r.getAttribute('tabindex') === '0');
    expect(nowFocused.length).toBe(1);
    expect(nowFocused[0]).not.toBe(firstCol);
  });

  it('does not error moving off the edge of the grid', () => {
    const el = document.createElement('div');
    const chart = new Heatmap(el);
    chart.load([{ row: 'Mon', col: '8am', value: 1 }]);
    const rect = el.querySelector('rect')!;
    expect(() =>
      rect.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    ).not.toThrow();
  });

});