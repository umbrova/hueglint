"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  Heatmap: () => Heatmap
});
module.exports = __toCommonJS(index_exports);

// src/Heatmap.tsx
var import_react = require("react");
var import_core = require("@hueglint/core");
var import_jsx_runtime = require("react/jsx-runtime");
var Heatmap = (0, import_react.forwardRef)(function Heatmap2({ data, previousData, context, options }, ref) {
  const containerRef = (0, import_react.useRef)(null);
  const chartRef = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
    if (!containerRef.current) return;
    chartRef.current = new import_core.Heatmap(containerRef.current, options);
    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, []);
  (0, import_react.useEffect)(() => {
    if (previousData !== void 0) {
      chartRef.current?.loadDiff(data, previousData, context);
    } else {
      chartRef.current?.load(data, context);
    }
  }, [data, previousData, context]);
  (0, import_react.useEffect)(() => {
    if (options?.palette) {
      chartRef.current?.setPalette(options.palette);
    }
  }, [options?.palette]);
  (0, import_react.useEffect)(() => {
    chartRef.current?.setMinCellSize(options?.minCellSize);
  }, [options?.minCellSize]);
  (0, import_react.useImperativeHandle)(
    ref,
    () => ({
      update: (row, col, value) => {
        chartRef.current?.update(row, col, value);
      }
    }),
    []
  );
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: containerRef, style: { width: "100%", height: "100%" } });
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Heatmap
});
