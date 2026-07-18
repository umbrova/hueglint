import { HeatmapCell, HeatmapContext } from './types';

// Standard "visually hidden but still accessible" pattern — content is
// removed from the visual layout entirely, but stays in the accessibility
// tree, so screen readers reach it while sighted users never see it.
const VISUALLY_HIDDEN_STYLE =
  'position:absolute;width:1px;height:1px;padding:0;margin:-1px;' +
  'overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';

export function buildAccessibleTable(
  data: HeatmapCell[],
  context: HeatmapContext,
  id: string
): HTMLTableElement {
  const table = document.createElement('table');
  table.id = id;
  table.style.cssText = VISUALLY_HIDDEN_STYLE;

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

  return table;
}