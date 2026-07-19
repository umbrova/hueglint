import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Heatmap as CoreHeatmap } from '@hueglint/core';
import type { HeatmapContext, HeatmapOptions } from '@hueglint/core';

export interface HeatmapHandle {
  update: (row: string | number, col: string | number, value: number) => void;
}

export interface HeatmapProps {
  data: unknown;
  context?: HeatmapContext;
  options?: HeatmapOptions;
}

export const Heatmap = forwardRef<HeatmapHandle, HeatmapProps>(function Heatmap(
  { data, context, options },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<CoreHeatmap | null>(null);

  // Instance created once per mount. `options` is captured at construction
  // time only — changing it after mount does not reconfigure the chart in
  // v1. That's a deliberate scope limit, not an oversight: reconfiguring
  // palette/tooltipFormatter live would mean destroy-and-recreate logic
  // that deserves its own design pass, not a guess bundled into this phase.
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
    chartRef.current?.load(data, context);
  }, [data, context]);

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