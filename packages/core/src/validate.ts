import { HeatmapCell } from './types';

export function validateData(data: unknown): HeatmapCell[] {
  if (!Array.isArray(data)) {
    throw new Error('[hueglint] Expected an array of { row, col, value } cells.');
  }
  data.forEach((cell, i) => {
    if (typeof cell !== 'object' || cell === null) {
      throw new Error(`[hueglint] Invalid cell at index ${i}: expected an object.`);
    }
    const c = cell as Record<string, unknown>;
    if (c.row === undefined || c.col === undefined) {
      throw new Error(`[hueglint] Invalid cell at index ${i}: missing row or col.`);
    }
    if (typeof c.value !== 'number') {
      throw new Error(
        `[hueglint] Invalid cell at index ${i}: expected value to be a number, got ${typeof c.value}.`
      );
    }
  });
  return data as HeatmapCell[];
}