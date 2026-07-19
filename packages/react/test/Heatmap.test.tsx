import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { StrictMode, createRef } from 'react';
import { Heatmap, HeatmapHandle } from '../src/index';

describe('Heatmap (React)', () => {
  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  it('renders a container and loads data', () => {
    const { container } = render(
      <Heatmap data={[{ row: 'Mon', col: '8am', value: 1 }]} />
    );
    expect(container.querySelectorAll('rect').length).toBe(1);
  });

  it('survives React Strict Mode double-invoke without duplicating cells', () => {
    const { container } = render(
      <StrictMode>
        <Heatmap data={[{ row: 'Mon', col: '8am', value: 1 }]} />
      </StrictMode>
    );
    // If destroy() weren't idempotent, Strict Mode's mount → unmount →
    // remount cycle would leave stale DOM behind alongside the new render.
    expect(container.querySelectorAll('rect').length).toBe(1);
  });

  it('reloads data when the data prop changes, without recreating the container', () => {
    const { container, rerender } = render(
      <Heatmap data={[{ row: 'Mon', col: '8am', value: 1 }]} />
    );
    const svgBefore = container.querySelector('svg');
    rerender(<Heatmap data={[{ row: 'Tue', col: '9am', value: 2 }]} />);
    const svgAfter = container.querySelector('svg');
    expect(svgAfter).toBe(svgBefore); // same SVG element, not a fresh one
    expect(container.querySelector('rect')?.getAttribute('aria-label')).toContain('Tue');
  });

  it('exposes an imperative update() via ref', () => {
    const ref = createRef<HeatmapHandle>();
    const { container } = render(
      <Heatmap ref={ref} data={[{ row: 'Mon', col: '8am', value: 1 }]} />
    );
    ref.current?.update('Mon', '8am', 99);
    expect(container.querySelector('rect')?.getAttribute('aria-label')).toContain('99');
  });
});