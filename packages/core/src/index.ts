import { HeatmapCell, HeatmapContext, HeatmapOptions } from './types';
import { validateData } from './validate';
import { computeLayout } from './layout';
import { isValidPalette, getColorScale, getDivergingColorScale, Palette } from './palette';
import { normalizeValues } from './normalize';
import { buildAccessibleTable, buildDiffAccessibleTable } from './a11y';
import { setupRovingTabindex, GridCellRef } from './keyboard';
import { TooltipController, attachTooltipEvents, attachDiffTooltipEvents } from './tooltip';
import { computeDiff, normalizeDiffs, DiffResult } from './diff';
import { buildLoadingState, buildEmptyState, buildErrorState } from './states';

export class Heatmap {
  private static instanceCount = 0;
  private readonly id = `hueglint-${Heatmap.instanceCount++}`;

  private svg: SVGSVGElement;
  private table: HTMLTableElement | null = null;
  private tooltip: TooltipController;
  private stateEl: HTMLElement | null = null;
  private data: HeatmapCell[] = [];
  private diffs: DiffResult[] | null = null;
  private context: HeatmapContext = {};
  private palette: Palette;
  private options: HeatmapOptions;
  private cleanupKeyboard: (() => void) | null = null;
  private cleanupTooltip: (() => void) | null = null;

  constructor(private el: HTMLElement, options: HeatmapOptions = {}) {
    this.options = options;
    const palette = options.palette ?? 'viridis';
    if (!isValidPalette(palette)) {
      throw new Error(
        `[hueglint] Invalid palette "${palette}". Expected one of: viridis, plasma, cividis, magma, inferno.`
      );
    }
    this.palette = palette;
    this.tooltip = new TooltipController(this.id);

    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('width', '100%');
    this.svg.setAttribute('height', '100%');
    this.el.appendChild(this.svg);

    this.showState(buildLoadingState());
  }

  load(data: unknown, context: HeatmapContext = {}): void {
    let validated: HeatmapCell[];
    try {
      validated = validateData(data);
    } catch (err) {
      this.handleError(err as Error);
      return;
    }
    this.context = context;
    if (validated.length === 0) {
      this.data = [];
      this.showState(buildEmptyState());
      return;
    }
    this.data = validated;
    this.showState(null);
    this.render();
  }

  loadDiff(current: unknown, previous: unknown, context: HeatmapContext = {}): void {
    let validCurrent: HeatmapCell[];
    let validPrevious: HeatmapCell[];
    try {
      validCurrent = validateData(current);
      validPrevious = validateData(previous);
    } catch (err) {
      this.handleError(err as Error);
      return;
    }
    this.context = context;
    if (validCurrent.length === 0 && validPrevious.length === 0) {
      this.diffs = null;
      this.showState(buildEmptyState());
      return;
    }
    let diffs: DiffResult[];
    try {
      diffs = computeDiff(validCurrent, validPrevious);
    } catch (err) {
      this.handleError(err as Error);
      return;
    }
    this.diffs = diffs;
    this.showState(null);
    this.renderDiff();
  }

  private handleError(error: Error): void {
    console.error('[hueglint]', error);
    const suppressed = this.options.onError?.(error) === false;
    if (!suppressed) {
      this.showState(buildErrorState('Unable to load chart data'));
    }
  }

  private showState(el: HTMLElement | null): void {
    if (this.stateEl) this.stateEl.remove();
    this.stateEl = el;
    if (el) {
      this.svg.style.display = 'none';
      if (this.table) this.table.style.display = 'none';
      this.el.appendChild(el);
    } else {
      this.svg.style.display = '';
      if (this.table) this.table.style.display = '';
    }
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
    this.cleanupTooltip = attachTooltipEvents(
      tooltipCells,
      this.tooltip,
      this.context,
      this.options.tooltipFormatter
    );

    if (this.table) this.el.removeChild(this.table);
    this.table = buildAccessibleTable(this.data, this.context, `${this.id}-table`);
    this.el.appendChild(this.table);
  }

  private renderDiff(): void {
    if (!this.diffs) return;
    this.cleanupKeyboard?.();
    this.cleanupTooltip?.();
    this.svg.innerHTML = '';
    const width = this.el.clientWidth || 400;
    const height = this.el.clientHeight || 300;
    const layout = computeLayout(this.diffs, width, height);
    const colorScale = getDivergingColorScale();
    const normalized = normalizeDiffs(this.diffs);
    const gridCells: GridCellRef[] = [];
    const tooltipCells: { el: SVGRectElement; diff: DiffResult }[] = [];

    for (const d of this.diffs) {
      const pos = layout.positions.get(d)!;
      const t = normalized.get(d)!;
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', String(pos.x));
      rect.setAttribute('y', String(pos.y));
      rect.setAttribute('width', String(layout.cellWidth));
      rect.setAttribute('height', String(layout.cellHeight));
      rect.setAttribute('fill', colorScale(t));
      const sign = d.delta >= 0 ? '+' : '';
      rect.setAttribute(
        'aria-label',
        `${this.context.rowLabel ?? 'Row'} ${d.row}, ${this.context.colLabel ?? 'Column'} ${d.col}: ` +
          `changed from ${d.previousValue} to ${d.currentValue} (${sign}${d.delta})`
      );
      this.svg.appendChild(rect);
      gridCells.push({
        el: rect,
        rowIndex: layout.rows.indexOf(d.row),
        colIndex: layout.cols.indexOf(d.col),
      });
      tooltipCells.push({ el: rect, diff: d });
    }

    this.cleanupKeyboard = setupRovingTabindex(gridCells);
    this.cleanupTooltip = attachDiffTooltipEvents(tooltipCells, this.tooltip, this.context);

    if (this.table) this.el.removeChild(this.table);
    this.table = buildDiffAccessibleTable(this.diffs, this.context, `${this.id}-table`);
    this.el.appendChild(this.table);
  }

  destroy(): void {
    this.cleanupKeyboard?.();
    this.cleanupTooltip?.();
    this.tooltip.destroy();
    this.stateEl?.remove();
    this.svg.remove();
    this.table?.remove();
  }
}