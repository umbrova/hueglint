import { HeatmapCell, HeatmapContext, HeatmapOptions } from './types';
import { validateData } from './validate';
import { computeLayout } from './layout';
import { isValidPalette, getColorScale, Palette } from './palette';
import { normalizeValues } from './normalize';
import { buildAccessibleTable } from './a11y';

export class Heatmap {
  private static instanceCount = 0;
  private readonly id = `hueglint-${Heatmap.instanceCount++}`;

  private svg: SVGSVGElement;
  private table: HTMLTableElement | null = null;
  private data: HeatmapCell[] = [];
  private context: HeatmapContext = {};
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
    // The visual chart is presentational only — its real, authoritative
    // data lives in the table below, so screen readers should skip
    // the SVG entirely rather than trying to interpret shapes and colors.
    this.svg.setAttribute('aria-hidden', 'true');
    this.el.appendChild(this.svg);
  }

  load(data: unknown, context: HeatmapContext = {}): void {
    this.data = validateData(data);
    this.context = context;
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

    if (this.table) this.el.removeChild(this.table);
    this.table = buildAccessibleTable(this.data, this.context, `${this.id}-table`);
    this.el.appendChild(this.table);
  }

  destroy(): void {
    this.svg.remove();
    this.table?.remove();
  }
}