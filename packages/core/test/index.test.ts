import { describe, it, expect } from 'vitest';
import { Heatmap } from '../src/index';

describe('Heatmap', () => {
  it('constructs without throwing', () => {
    const el = document.createElement('div');
    expect(() => new Heatmap(el)).not.toThrow();
  });
});