import type { HeatmapContext } from '@hueglint/core';
import serverLoad from './server-load.json';
import salesByRegion from './sales-by-region.json';
import supportTickets from './support-tickets.json';

export interface SampleCell {
  row: string;
  col: string;
  value: number;
}

export interface Dataset {
  label: string;
  context: HeatmapContext;
  data: SampleCell[];
  previousData: SampleCell[];
}

export const datasets: Record<string, Dataset> = {
  serverLoad,
  salesByRegion,
  supportTickets,
};