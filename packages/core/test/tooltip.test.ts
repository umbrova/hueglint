import { describe, it, expect, vi, afterEach} from 'vitest';
import { Heatmap } from '../src/index';

describe('Heatmap', () => {
  afterEach(() => {
    document.body.innerHTML = '';
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

  it('repositions the tooltip on scroll while it is open', () => {
    const el = document.createElement('div');
    const chart = new Heatmap(el);
    chart.load([{ row: 'Mon', col: '8am', value: 1 }]);
    const rect = el.querySelector('rect')!;

    let callCount = 0;
    rect.getBoundingClientRect = () => {
      callCount++;
      return { top: 100, bottom: 120, left: 50, right: 100, width: 50, height: 20, x: 50, y: 100, toJSON() {} } as DOMRect;
    };

    rect.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const callsAfterShow = callCount;

    window.dispatchEvent(new Event('scroll'));
    expect(callCount).toBeGreaterThan(callsAfterShow);
  });

  it('removes the scroll listener once the tooltip is hidden', () => {
    const el = document.createElement('div');
    const chart = new Heatmap(el);
    chart.load([{ row: 'Mon', col: '8am', value: 1 }]);
    const rect = el.querySelector('rect')!;

    let callCount = 0;
    rect.getBoundingClientRect = () => {
      callCount++;
      return { top: 100, bottom: 120, left: 50, right: 100, width: 50, height: 20, x: 50, y: 100, toJSON() {} } as DOMRect;
    };

    rect.dispatchEvent(new MouseEvent('click', { bubbles: true })); // show
    rect.dispatchEvent(new MouseEvent('click', { bubbles: true })); // hide again
    const callsAfterHide = callCount;

    window.dispatchEvent(new Event('scroll'));
    expect(callCount).toBe(callsAfterHide); // scroll after hide should do nothing
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

});