// src/Heatmap.tsx
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Heatmap as CoreHeatmap } from "@hueglint/core";
import { jsx } from "react/jsx-runtime";
var Heatmap = forwardRef(function Heatmap2({ data, previousData, context, options }, ref) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  useEffect(() => {
    if (!containerRef.current) return;
    chartRef.current = new CoreHeatmap(containerRef.current, options);
    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, []);
  useEffect(() => {
    if (previousData !== void 0) {
      chartRef.current?.loadDiff(data, previousData, context);
    } else {
      chartRef.current?.load(data, context);
    }
  }, [data, previousData, context]);
  useEffect(() => {
    if (options?.palette) {
      chartRef.current?.setPalette(options.palette);
    }
  }, [options?.palette]);
  useEffect(() => {
    chartRef.current?.setMinCellSize(options?.minCellSize);
  }, [options?.minCellSize]);
  useImperativeHandle(
    ref,
    () => ({
      update: (row, col, value) => {
        chartRef.current?.update(row, col, value);
      }
    }),
    []
  );
  return /* @__PURE__ */ jsx("div", { ref: containerRef, style: { width: "100%", height: "100%" } });
});
export {
  Heatmap
};
