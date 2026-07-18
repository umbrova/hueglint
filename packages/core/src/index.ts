import { HeatmapCell, HeatmapContext, HeatmapOptions } from './types';
import { validateData } from './validate';
import { computeLayout } from './layout';
import { isValidPalette, getColorScale, Palette } from './palette';
import { normalizeValues } from './normalize';

export class Heatmap {
  private svg: SVGSVGElement;
  private data: HeatmapCell[] = [];
  private palette: Palette;

  constructor(private el: HTMLElement, options: HeatmapOptions = {}) {
    const palette = options.palette ?? 'viridis';
    if (!isValidPalette(palette)) {
      throw new Error(
        `[hueglint] Invalid palette "${palette}". Expected one of: viridis, plasma, cividis, magma, inferno.`
      );
    }
    this.palette = palette;

    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('width', '100%');
    this.svg.setAttribute('height', '100%');
    this.el.appendChild(this.svg);
  }

  load(data: unknown, _context?: HeatmapContext): void {
    this.data = validateData(data);
    this.render();
  }

  private render(): void {
    this.svg.innerHTML = '';
    const width = this.el.clientWidth || 400;
    const height = this.el.clientHeight || 300;
    const layout = computeLayout(this.data, width, height);
    const colorScale = getColorScale(this.palette);
    const normalized = normalizeValues(this.data);

    for (const cell of this.data) {
      const pos = layout.positions.get(cell)!;
      const t = normalized.get(cell)!;
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', String(pos.x));
      rect.setAttribute('y', String(pos.y));
      rect.setAttribute('width', String(layout.cellWidth));
      rect.setAttribute('height', String(layout.cellHeight));
      rect.setAttribute('fill', colorScale(t));
      this.svg.appendChild(rect);
    }
  }

  destroy(): void {
    this.el.removeChild(this.svg);
  }
}