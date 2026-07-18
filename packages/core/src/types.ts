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

export interface HeatmapOptions {
  palette?: Palette;
  tooltipFormatter?: TooltipFormatter;
}