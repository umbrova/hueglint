import { HeatmapCell } from './types';

export interface LayoutResult {
  rows: (string | number)[];
  cols: (string | number)[];
  cellWidth: number;
  cellHeight: number;
  positions: Map<HeatmapCell, { x: number; y: number }>;
}

export function computeLayout(data: HeatmapCell[], width: number, height: number): LayoutResult {
  const rows = Array.from(new Set(data.map((d) => d.row)));
  const cols = Array.from(new Set(data.map((d) => d.col)));
  const cellWidth = cols.length ? width / cols.length : 0;
  const cellHeight = rows.length ? height / rows.length : 0;
  const positions = new Map<HeatmapCell, { x: number; y: number }>();

  for (const cell of data) {
    positions.set(cell, {
      x: cols.indexOf(cell.col) * cellWidth,
      y: rows.indexOf(cell.row) * cellHeight,
    });
  }

  return { rows, cols, cellWidth, cellHeight, positions };
}