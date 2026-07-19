import { describe, it, expect, vi, afterEach} from 'vitest';
import { Heatmap } from '../src/index';

describe('Heatmap', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders diff cells only for matching (row, col) pairs, warning on mismatches', () => {
    const el = document.createElement('div');
    const chart = new Heatmap(el);
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    chart.loadDiff(
      [{ row: 'Mon', col: '8am', value: 50 }, { row: 'Tue', col: '9am', value: 10 }],
      [{ row: 'Mon', col: '8am', value: 30 }]
    );

    expect(el.querySelectorAll('rect').length).toBe(1);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('renders an Error state when current and comparison data have no overlap at all', () => {
    const el = document.createElement('div');
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const chart = new Heatmap(el);
    chart.loadDiff([{ row: 'Mon', col: '8am', value: 1 }], [{ row: 'Tue', col: '9am', value: 1 }]);
    expect(el.querySelector('[role="alert"]')).not.toBeNull();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('shows a before → after tooltip for diff cells', () => {
    const el = document.createElement('div');
    const chart = new Heatmap(el);
    chart.loadDiff(
      [{ row: 'Mon', col: '8am', value: 410 }],
      [{ row: 'Mon', col: '8am', value: 342 }]
    );
    const rect = el.querySelector('rect')!;
    rect.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const tip = document.getElementById(rect.getAttribute('aria-describedby')!)!;
    expect(tip.textContent).toContain('342 → 410');
    expect(tip.textContent).toContain('+68');
  });

  it('renders a diff table with Previous/Current/Change columns', () => {
    const el = document.createElement('div');
    const chart = new Heatmap(el);
    chart.loadDiff([{ row: 'Mon', col: '8am', value: 410 }], [{ row: 'Mon', col: '8am', value: 342 }]);
    const headers = Array.from(el.querySelectorAll('th')).map((th) => th.textContent);
    expect(headers).toEqual(expect.arrayContaining(['Previous', 'Current', 'Change']));
  });  
});