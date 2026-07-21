import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Heatmap as CoreHeatmap } from '@hueglint/core';
import type { HeatmapContext, HeatmapOptions } from '@hueglint/core';

export interface HeatmapHandle {
  update: (row: string | number, col: string | number, value: number) => void;
}

export interface HeatmapProps {
  data: unknown;
  previousData?: unknown;
  context?: HeatmapContext;
  options?: HeatmapOptions;
}

export const Heatmap = forwardRef<HeatmapHandle, HeatmapProps>(function Heatmap(
  { data, previousData, context, options },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<CoreHeatmap | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    chartRef.current = new CoreHeatmap(containerRef.current, options);
    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (previousData !== undefined) {
      chartRef.current?.loadDiff(data, previousData, context);
    } else {
      chartRef.current?.load(data, context);
    }
  }, [data, previousData, context]);

  // Palette can change after mount without recreating the whole chart —
  // recreating on every options change would destroy tooltip/DOM state
  // for no reason, so this only touches the one thing that actually changed.
  useEffect(() => {
    if (options?.palette) {
      chartRef.current?.setPalette(options.palette);
    }
  }, [options?.palette]);

  useImperativeHandle(
    ref,
    () => ({
      update: (row, col, value) => {
        chartRef.current?.update(row, col, value);
      },
    }),
    []
  );

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
});