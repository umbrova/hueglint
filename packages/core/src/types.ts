import { Palette } from './palette';
import { TooltipFormatter } from './tooltip';

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

export type SummaryFormatter = (data: HeatmapCell[], context: HeatmapContext) => string;

export interface HeatmapOptions {
  palette?: Palette;
  tooltipFormatter?: TooltipFormatter;
  onError?: (error: Error) => boolean | void;
  minCellSize?: number;
  summaryFormatter?: string | SummaryFormatter;
}