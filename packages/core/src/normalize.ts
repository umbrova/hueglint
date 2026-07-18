import { HeatmapCell } from './types';

export function normalizeValues(data: HeatmapCell[]): Map<HeatmapCell, number> {
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  const result = new Map<HeatmapCell, number>();
  for (const cell of data) {
    const t = range === 0 ? 0.5 : (cell.value - min) / range;
    result.set(cell, t);
  }
  return result;
}