import { HeatmapCell, HeatmapContext, HeatmapOptions } from './types';
import { validateData } from './validate';
import { computeLayout } from './layout';
import { isValidPalette, getColorScale, Palette } from './palette';
import { normalizeValues } from './normalize';
import { buildAccessibleTable } from './a11y';
import { setupRovingTabindex, GridCellRef } from './keyboard';
import { TooltipController, attachTooltipEvents } from './tooltip';

export class Heatmap {
  private static instanceCount = 0;
  private readonly id = `hueglint-${Heatmap.instanceCount++}`;

  private svg: SVGSVGElement;
  private table: HTMLTableElement | null = null;
  private tooltip: TooltipController;
  private data: HeatmapCell[] = [];
  private context: HeatmapContext = {};
  private palette: Palette;
  private cleanupKeyboard: (() => void) | null = null;
  private cleanupTooltip: (() => void) | null = null;

  constructor(private el: HTMLElement, options: HeatmapOptions = {}) {
    const palette = options.palette ?? 'viridis';
    if (!isValidPalette(palette)) {
      throw new Error(
        `[hueglint] Invalid palette "${palette}". Expected one of: viridis, plasma, cividis, magma, inferno.`
      );
    }
    this.palette = palette;
    this.tooltip = new TooltipController(this.id, options.tooltipFormatter);

    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('width', '100%');
    this.svg.setAttribute('height', '100%');
    this.el.appendChild(this.svg);
  }

  load(data: unknown, context: HeatmapContext = {}): void {
    this.data = validateData(data);
    this.context = context;
    this.render();
  }

  private render(): void {
    this.cleanupKeyboard?.();
    this.cleanupTooltip?.();
    this.svg.innerHTML = '';
    const width = this.el.clientWidth || 400;
    const height = this.el.clientHeight || 300;
    const layout = computeLayout(this.data, width, height);
    const colorScale = getColorScale(this.palette);
    const normalized = normalizeValues(this.data);
    const gridCells: GridCellRef[] = [];
    const tooltipCells: { el: SVGRectElement; cell: HeatmapCell }[] = [];

    for (const cell of this.data) {
      const pos = layout.positions.get(cell)!;
      const t = normalized.get(cell)!;
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', String(pos.x));
      rect.setAttribute('y', String(pos.y));
      rect.setAttribute('width', String(layout.cellWidth));
      rect.setAttribute('height', String(layout.cellHeight));
      rect.setAttribute('fill', colorScale(t));
      rect.setAttribute(
        'aria-label',
        `${this.context.rowLabel ?? 'Row'} ${cell.row}, ${this.context.colLabel ?? 'Column'} ${cell.col}: ${cell.value}`
      );
      this.svg.appendChild(rect);

      gridCells.push({
        el: rect,
        rowIndex: layout.rows.indexOf(cell.row),
        colIndex: layout.cols.indexOf(cell.col),
      });
      tooltipCells.push({ el: rect, cell });
    }

    this.cleanupKeyboard = setupRovingTabindex(gridCells);
    this.cleanupTooltip = attachTooltipEvents(tooltipCells, this.tooltip, this.context);

    if (this.table) this.el.removeChild(this.table);
    this.table = buildAccessibleTable(this.data, this.context, `${this.id}-table`);
    this.el.appendChild(this.table);
  }

  destroy(): void {
    this.cleanupKeyboard?.();
    this.cleanupTooltip?.();
    this.tooltip.destroy();
    this.svg.remove();
    this.table?.remove();
  }
}