import { describe, it, expect, vi, afterEach} from 'vitest';
import { Heatmap } from '../../src/index';

describe('Heatmap', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('shows a Loading state immediately after construction, before load() is called', () => {
    const el = document.createElement('div');
    new Heatmap(el);
    expect(el.querySelector('[data-hueglint-state="loading"]')).not.toBeNull();
  });

  it('shows an Empty state for a zero-row dataset, not an Error', () => {
    const el = document.createElement('div');
    const chart = new Heatmap(el);
    chart.load([]);
    expect(el.querySelector('[data-hueglint-state="empty"]')).not.toBeNull();
    expect(el.querySelector('[role="alert"]')).toBeNull();
  });

  it('calls onError with the actual error object', () => {
    const el = document.createElement('div');
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onError = vi.fn();
    const chart = new Heatmap(el, { onError });
    chart.load([{ row: 'Mon', col: '8am', value: 'bad' }]);
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
    errorSpy.mockRestore();
  });

  it('suppresses the default Error UI when onError returns false', () => {
    const el = document.createElement('div');
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const chart = new Heatmap(el, { onError: () => false });
    chart.load([{ row: 'Mon', col: '8am', value: 'bad' }]);
    expect(el.querySelector('[role="alert"]')).toBeNull();
    errorSpy.mockRestore();
  });

  it('clears the Loading state once real data loads successfully', () => {
    const el = document.createElement('div');
    const chart = new Heatmap(el);
    chart.load([{ row: 'Mon', col: '8am', value: 1 }]);
    expect(el.querySelector('[data-hueglint-state="loading"]')).toBeNull();
  });

});