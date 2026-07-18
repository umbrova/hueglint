import { afterEach, describe, it, expect } from 'vitest';
import { Heatmap } from '../src/index';

afterEach(() => {
  document.body.innerHTML = '';
});

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

  it('does not hide the SVG from assistive tech, since cells are individually focusable and labeled', () => {
    const el = document.createElement('div');
    const chart = new Heatmap(el);
    chart.load([{ row: 'Mon', col: '8am', value: 1 }]);
    expect(el.querySelector('svg')?.getAttribute('aria-hidden')).toBeNull();
  });

  it('still provides the accessible table as a complementary way to review the whole dataset', () => {
    const el = document.createElement('div');
    const chart = new Heatmap(el);
    chart.load([{ row: 'Mon', col: '8am', value: 1 }]);
    expect(el.querySelector('table')).not.toBeNull();
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

  it('gives every cell an accessible label', () => {
    const el = document.createElement('div');
    const chart = new Heatmap(el);
    chart.load([{ row: 'Mon', col: '8am', value: 42 }], { rowLabel: 'Day', colLabel: 'Hour' });
    const rect = el.querySelector('rect')!;
    expect(rect.getAttribute('aria-label')).toBe('Day Mon, Hour 8am: 42');
  });

  it('sets aria-describedby while visible, removes it on hide', () => {
    const el = document.createElement('div');
    const chart = new Heatmap(el);
    chart.load([{ row: 'Mon', col: '8am', value: 1 }]);
    const rect = el.querySelector('rect')!;
    rect.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    expect(rect.hasAttribute('aria-describedby')).toBe(true);
    rect.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    expect(rect.hasAttribute('aria-describedby')).toBe(false);
  });

  it('shows tooltip content on hover and hides on mouseleave', () => {
    const el = document.createElement('div');
    const chart = new Heatmap(el);
    chart.load([{ row: 'Mon', col: '8am', value: 42 }], { valueLabel: 'Requests' });
    const rect = el.querySelector('rect')!;
    rect.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    const tip = document.getElementById(rect.getAttribute('aria-describedby')!)!;
    expect(tip.textContent).toContain('42');
    expect(tip.textContent).toContain('Requests');
    rect.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    expect(tip.style.display).toBe('none');
  });

  it('supports a custom tooltipFormatter', () => {
    const el = document.createElement('div');
    const chart = new Heatmap(el, { tooltipFormatter: (cell) => `Custom: ${cell.value}` });
    chart.load([{ row: 'Mon', col: '8am', value: 7 }]);
    const rect = el.querySelector('rect')!;
    rect.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    const tip = document.getElementById(rect.getAttribute('aria-describedby')!)!;
    expect(tip.textContent).toBe('Custom: 7');
  });

  it('flips below the cell when there is no room above (mocked layout)', () => {
    const el = document.createElement('div');
    const chart = new Heatmap(el);
    chart.load([{ row: 'Mon', col: '8am', value: 1 }]);
    const rect = el.querySelector('rect')!;
    rect.getBoundingClientRect = () =>
      ({ top: 5, bottom: 25, left: 100, right: 150, width: 50, height: 20, x: 100, y: 5, toJSON() {} }) as DOMRect;
    rect.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    const tip = document.getElementById(rect.getAttribute('aria-describedby')!)!;
    expect(parseFloat(tip.style.top)).toBeGreaterThanOrEqual(25);
  });

  it('toggles the tooltip open and closed on repeated clicks of the same cell (touch/tap)', () => {
    const el = document.createElement('div');
    const chart = new Heatmap(el);
    chart.load([{ row: 'Mon', col: '8am', value: 1 }]);
    const rect = el.querySelector('rect')!;

    rect.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const tip = document.getElementById(rect.getAttribute('aria-describedby')!)!;
    expect(tip.style.display).toBe('block');

    rect.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(tip.style.display).toBe('none');
  });

  it('dismisses the tooltip when tapping/clicking outside the chart', () => {
    const el = document.createElement('div');
    const chart = new Heatmap(el);
    chart.load([{ row: 'Mon', col: '8am', value: 1 }]);
    const rect = el.querySelector('rect')!;

    rect.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const describedById = rect.getAttribute('aria-describedby')!;
    const tip = document.getElementById(describedById)!;
    expect(tip.style.display).toBe('block');

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(tip.style.display).toBe('none');
  });

  it('does not immediately dismiss when the triggering click itself bubbles to the document', () => {
    const el = document.createElement('div');
    const chart = new Heatmap(el);
    chart.load([{ row: 'Mon', col: '8am', value: 1 }]);
    const rect = el.querySelector('rect')!;

    rect.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const tip = document.getElementById(rect.getAttribute('aria-describedby')!)!;
    // If stopPropagation() weren't working, the same click event would
    // reach the document listener and immediately hide this.
    expect(tip.style.display).toBe('block');
  });

});