import { describe, it, expect, vi, afterEach} from 'vitest';
import { Heatmap } from '../src/index';

describe('Heatmap', () => {
  afterEach(() => {
    document.body.innerHTML = '';
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

  it('gives every cell an accessible label', () => {
    const el = document.createElement('div');
    const chart = new Heatmap(el);
    chart.load([{ row: 'Mon', col: '8am', value: 42 }], { rowLabel: 'Day', colLabel: 'Hour' });
    const rect = el.querySelector('rect')!;
    expect(rect.getAttribute('aria-label')).toBe('Day Mon, Hour 8am: 42');
  });

});