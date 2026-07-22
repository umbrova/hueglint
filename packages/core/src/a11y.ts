import { HeatmapCell, HeatmapContext, SummaryFormatter } from './types';
import { DiffResult } from './diff';

const VISUALLY_HIDDEN_STYLE =
  'position:absolute;width:1px;height:1px;padding:0;margin:-1px;' +
  'overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';

export function buildAccessibleTable(
  data: HeatmapCell[],
  context: HeatmapContext,
  id: string
): HTMLDivElement {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = VISUALLY_HIDDEN_STYLE;

  const table = document.createElement('table');
  table.id = id;

  const caption = document.createElement('caption');
  caption.textContent =
    context.description ??
    `${context.valueLabel ?? 'Value'} by ${context.rowLabel ?? 'row'} and ${context.colLabel ?? 'column'}`;
  table.appendChild(caption);

  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  [context.rowLabel ?? 'Row', context.colLabel ?? 'Column', context.valueLabel ?? 'Value'].forEach(
    (label) => {
      const th = document.createElement('th');
      th.textContent = label;
      th.scope = 'col';
      headRow.appendChild(th);
    }
  );
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  for (const cell of data) {
    const tr = document.createElement('tr');
    [cell.row, cell.col, cell.value].forEach((v) => {
      const td = document.createElement('td');
      td.textContent = String(v);
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);

  wrapper.appendChild(table);
  return wrapper;
}

export function buildDiffAccessibleTable(
  diffs: DiffResult[],
  context: HeatmapContext,
  id: string
): HTMLDivElement {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = VISUALLY_HIDDEN_STYLE;

  const table = document.createElement('table');
  table.id = id;

  const caption = document.createElement('caption');
  caption.textContent = context.description ?? 'Comparison between two datasets';
  table.appendChild(caption);

  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  [context.rowLabel ?? 'Row', context.colLabel ?? 'Column', 'Previous', 'Current', 'Change'].forEach(
    (label) => {
      const th = document.createElement('th');
      th.textContent = label;
      th.scope = 'col';
      headRow.appendChild(th);
    }
  );
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  for (const d of diffs) {
    const tr = document.createElement('tr');
    const sign = d.delta >= 0 ? '+' : '';
    [d.row, d.col, d.previousValue, d.currentValue, `${sign}${d.delta}`].forEach((v) => {
      const td = document.createElement('td');
      td.textContent = String(v);
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);

  wrapper.appendChild(table);
  return wrapper;
}

interface SummaryStats {
  maxValue: number; maxRow: string | number; maxCol: string | number;
  minValue: number; minRow: string | number; minCol: string | number;
  rowLabel: string; colLabel: string; valueLabel: string;
}

function computeStats(data: HeatmapCell[], context: HeatmapContext): SummaryStats {
  let max = data[0];
  let min = data[0];
  for (const c of data) {
    if (c.value > max.value) max = c;
    if (c.value < min.value) min = c;
  }
  return {
    maxValue: max.value, maxRow: max.row, maxCol: max.col,
    minValue: min.value, minRow: min.row, minCol: min.col,
    rowLabel: context.rowLabel ?? 'Row',
    colLabel: context.colLabel ?? 'Column',
    valueLabel: context.valueLabel ?? 'Value',
  };
}

const DEFAULT_SUMMARY_TEMPLATE =
  '{valueLabel} by {rowLabel} and {colLabel}. Highest: {maxValue} at {rowLabel} {maxRow}, {colLabel} {maxCol}. Lowest: {minValue} at {rowLabel} {minRow}, {colLabel} {minCol}.';

function applyTemplate(template: string, s: SummaryStats): string {
  return template
    .replace(/{maxValue}/g, String(s.maxValue)).replace(/{maxRow}/g, String(s.maxRow)).replace(/{maxCol}/g, String(s.maxCol))
    .replace(/{minValue}/g, String(s.minValue)).replace(/{minRow}/g, String(s.minRow)).replace(/{minCol}/g, String(s.minCol))
    .replace(/{rowLabel}/g, s.rowLabel).replace(/{colLabel}/g, s.colLabel).replace(/{valueLabel}/g, s.valueLabel);
}

export function buildSummaryElement(
  data: HeatmapCell[],
  context: HeatmapContext,
  summary: string | SummaryFormatter | undefined
): HTMLParagraphElement {
  const p = document.createElement('p');
  p.style.cssText = VISUALLY_HIDDEN_STYLE;
  if (data.length === 0) return p;
  if (typeof summary === 'function') {
    p.textContent = summary(data, context);
  } else {
    p.textContent = applyTemplate(summary ?? DEFAULT_SUMMARY_TEMPLATE, computeStats(data, context));
  }
  return p;
}