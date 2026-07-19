import { HeatmapCell } from './types';

export const MIN_TOUCH_SIZE = 44;

interface AggregateBucket {
  sum: number;
  count: number;
  rowLabel: string;
  colLabel: string;
}

export function computeAggregationFactor(
  width: number,
  height: number,
  rowCount: number,
  colCount: number
): number {
  if (rowCount === 0 || colCount === 0) return 1;
  const naiveCellWidth = width / colCount;
  const naiveCellHeight = height / rowCount;
  const factorW = Math.max(1, Math.ceil(MIN_TOUCH_SIZE / naiveCellWidth));
  const factorH = Math.max(1, Math.ceil(MIN_TOUCH_SIZE / naiveCellHeight));
  // A single uniform factor keeps aggregated blocks square rather than
  // stretched rectangles — simpler to reason about and to label.
  return Math.max(factorW, factorH);
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function labelForGroup(group: (string | number)[]): string {
  return group.length === 1 ? String(group[0]) : `${group[0]}–${group[group.length - 1]}`;
}

export function aggregateData(
  data: HeatmapCell[],
  rows: (string | number)[],
  cols: (string | number)[],
  factor: number
): HeatmapCell[] {
  if (factor <= 1) return data;

  const rowGroups = chunk(rows, factor);
  const colGroups = chunk(cols, factor);
  const rowGroupIndex = new Map<string | number, number>();
  rowGroups.forEach((group, i) => group.forEach((r) => rowGroupIndex.set(r, i)));
  const colGroupIndex = new Map<string | number, number>();
  colGroups.forEach((group, i) => group.forEach((c) => colGroupIndex.set(c, i)));

  const buckets = new Map<string, AggregateBucket>();

  for (const cell of data) {
    const ri = rowGroupIndex.get(cell.row)!;
    const ci = colGroupIndex.get(cell.col)!;
    const key = `${ri}::${ci}`;
    const existing = buckets.get(key);
    if (existing) {
      existing.sum += cell.value;
      existing.count += 1;
    } else {
      buckets.set(key, {
        sum: cell.value,
        count: 1,
        rowLabel: labelForGroup(rowGroups[ri]),
        colLabel: labelForGroup(colGroups[ci]),
      });
    }
  }

  const result: HeatmapCell[] = [];
  buckets.forEach((b) => {
    result.push({
      row: b.rowLabel,
      col: b.colLabel,
      value: b.sum / b.count,
      meta: { aggregated: true, count: b.count },
    });
  });
  return result;
}