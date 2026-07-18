export interface HeatmapCell {
  row: string | number;
  col: string | number;
  value: number;
  meta?: Record<string, unknown>;
}

export interface HeatmapContext {
  rowLabel?: string;
  colLabel?: string;
  valueLabel?: string;
  description?: string;
}