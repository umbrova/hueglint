import { HeatmapCell, HeatmapContext } from './types';

export interface DiffResult {
  row: string | number;
  col: string | number;
  currentValue: number;
  previousValue: number;
  delta: number;
}

const key = (row: string | number, col: string | number) => `${row}::${col}`;

export function computeDiff(current: HeatmapCell[], previous: HeatmapCell[]): DiffResult[] {
  const prevMap = new Map(previous.map((c) => [key(c.row, c.col), c]));
  const results: DiffResult[] = [];
  const matched = new Set<string>();

  for (const cell of current) {
    const k = key(cell.row, cell.col);
    const prev = prevMap.get(k);
    if (!prev) {
      console.warn(
        `[hueglint] Cell (${cell.row}, ${cell.col}) has no matching comparison value — skipped from diff.`
      );
      continue;
    }
    matched.add(k);
    results.push({
      row: cell.row,
      col: cell.col,
      currentValue: cell.value,
      previousValue: prev.value,
      delta: cell.value - prev.value,
    });
  }

  previous.forEach((c) => {
    if (!matched.has(key(c.row, c.col))) {
      console.warn(
        `[hueglint] Comparison cell (${c.row}, ${c.col}) has no matching current value — skipped from diff.`
      );
    }
  });

  if (results.length === 0) {
    throw new Error(
      '[hueglint] loadDiff(): no matching (row, col) pairs between current and comparison data.'
    );
  }
  return results;
}

// 0.5 = no change, so the diverging scale centers correctly regardless
// of whether values mostly increased or mostly decreased.
export function normalizeDiffs(diffs: DiffResult[]): Map<DiffResult, number> {
  const maxAbs = Math.max(...diffs.map((d) => Math.abs(d.delta)), 0);
  const result = new Map<DiffResult, number>();
  for (const d of diffs) {
    result.set(d, maxAbs === 0 ? 0.5 : 0.5 + (d.delta / maxAbs) * 0.5);
  }
  return result;
}

export function defaultDiffTooltip(d: DiffResult, context: HeatmapContext): string {
  const label = context.valueLabel ?? 'Value';
  const sign = d.delta >= 0 ? '+' : '';
  return `${d.row}, ${d.col}\n${label}: ${d.previousValue} → ${d.currentValue} (${sign}${d.delta})`;
}