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

  it('updates colors when the palette option changes, without remounting the container', () => {
    const sample = [
      { row: 'Mon', col: '8am', value: 1 },
      { row: 'Mon', col: '9am', value: 100 },
    ];
    const { container, rerender } = render(<Heatmap data={sample} options={{ palette: 'viridis' }} />);
    const fillBefore = container.querySelector('rect')?.getAttribute('fill');
    const svgBefore = container.querySelector('svg');

    rerender(<Heatmap data={sample} options={{ palette: 'plasma' }} />);

    expect(container.querySelector('svg')).toBe(svgBefore);
    expect(container.querySelector('rect')?.getAttribute('fill')).not.toBe(fillBefore);
  });

  it('renders diff mode when previousData is provided', () => {
    const { container } = render(
      <Heatmap
        data={[{ row: 'Mon', col: '8am', value: 100 }]}
        previousData={[{ row: 'Mon', col: '8am', value: 50 }]}
      />
    );
    const headers = Array.from(container.querySelectorAll('th')).map((th) => th.textContent);
    expect(headers).toEqual(expect.arrayContaining(['Previous', 'Current', 'Change']));
  });
});