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

// src/validate.ts
function validateData(data) {
  if (!Array.isArray(data)) {
    throw new Error("[hueglint] Expected an array of { row, col, value } cells.");
  }
  data.forEach((cell, i) => {
    if (typeof cell !== "object" || cell === null) {
      throw new Error(`[hueglint] Invalid cell at index ${i}: expected an object.`);
    }
    const c = cell;
    if (c.row === void 0 || c.col === void 0) {
      throw new Error(`[hueglint] Invalid cell at index ${i}: missing row or col.`);
    }
    if (typeof c.value !== "number") {
      throw new Error(
        `[hueglint] Invalid cell at index ${i}: expected value to be a number, got ${typeof c.value}.`
      );
    }
  });
  return data;
}

// src/layout.ts
function computeLayout(data, width, height) {
  const rows = Array.from(new Set(data.map((d) => d.row)));
  const cols = Array.from(new Set(data.map((d) => d.col)));
  const cellWidth = cols.length ? width / cols.length : 0;
  const cellHeight = rows.length ? height / rows.length : 0;
  const positions = /* @__PURE__ */ new Map();
  for (const cell of data) {
    positions.set(cell, {
      x: cols.indexOf(cell.col) * cellWidth,
      y: rows.indexOf(cell.row) * cellHeight
    });
  }
  return { rows, cols, cellWidth, cellHeight, positions };
}

// src/palette.ts
var import_d3_scale_chromatic = require("d3-scale-chromatic");
var PALETTES = {
  viridis: import_d3_scale_chromatic.interpolateViridis,
  plasma: import_d3_scale_chromatic.interpolatePlasma,
  cividis: import_d3_scale_chromatic.interpolateCividis,
  magma: import_d3_scale_chromatic.interpolateMagma,
  inferno: import_d3_scale_chromatic.interpolateInferno
};
function isValidPalette(value) {
  return typeof value === "string" && value in PALETTES;
}
function getColorScale(palette) {
  return PALETTES[palette];
}

// src/normalize.ts
function normalizeValues(data) {
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const result = /* @__PURE__ */ new Map();
  for (const cell of data) {
    const t = range === 0 ? 0.5 : (cell.value - min) / range;
    result.set(cell, t);
  }
  return result;
}

// src/a11y.ts
var VISUALLY_HIDDEN_STYLE = "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;";
function buildAccessibleTable(data, context, id) {
  const table = document.createElement("table");
  table.id = id;
  table.style.cssText = VISUALLY_HIDDEN_STYLE;
  const caption = document.createElement("caption");
  caption.textContent = context.description ?? `${context.valueLabel ?? "Value"} by ${context.rowLabel ?? "row"} and ${context.colLabel ?? "column"}`;
  table.appendChild(caption);
  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  [context.rowLabel ?? "Row", context.colLabel ?? "Column", context.valueLabel ?? "Value"].forEach(
    (label) => {
      const th = document.createElement("th");
      th.textContent = label;
      th.scope = "col";
      headRow.appendChild(th);
    }
  );
  thead.appendChild(headRow);
  table.appendChild(thead);
  const tbody = document.createElement("tbody");
  for (const cell of data) {
    const tr = document.createElement("tr");
    [cell.row, cell.col, cell.value].forEach((v) => {
      const td = document.createElement("td");
      td.textContent = String(v);
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  return table;
}

// src/keyboard.ts
var FOCUS_RING_COLOR = "#534AB7";
function setupRovingTabindex(cells) {
  if (cells.length === 0) return () => {
  };
  const grid = /* @__PURE__ */ new Map();
  cells.forEach((c) => grid.set(`${c.rowIndex},${c.colIndex}`, c));
  let active = cells[0];
  cells.forEach((c) => c.el.setAttribute("tabindex", c === active ? "0" : "-1"));
  function moveTo(next) {
    if (!next) return;
    active.el.setAttribute("tabindex", "-1");
    active = next;
    active.el.setAttribute("tabindex", "0");
    active.el.focus();
  }
  function handleKeydown(e) {
    const { rowIndex, colIndex } = active;
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        moveTo(grid.get(`${rowIndex},${colIndex + 1}`));
        break;
      case "ArrowLeft":
        e.preventDefault();
        moveTo(grid.get(`${rowIndex},${colIndex - 1}`));
        break;
      case "ArrowDown":
        e.preventDefault();
        moveTo(grid.get(`${rowIndex + 1},${colIndex}`));
        break;
      case "ArrowUp":
        e.preventDefault();
        moveTo(grid.get(`${rowIndex - 1},${colIndex}`));
        break;
    }
  }
  const cleanupFns = [];
  cells.forEach((c) => {
    const onFocus = () => {
      c.el.setAttribute("stroke", FOCUS_RING_COLOR);
      c.el.setAttribute("stroke-width", "2");
    };
    const onBlur = () => {
      c.el.removeAttribute("stroke");
      c.el.removeAttribute("stroke-width");
    };
    c.el.addEventListener("keydown", handleKeydown);
    c.el.addEventListener("focus", onFocus);
    c.el.addEventListener("blur", onBlur);
    cleanupFns.push(() => {
      c.el.removeEventListener("keydown", handleKeydown);
      c.el.removeEventListener("focus", onFocus);
      c.el.removeEventListener("blur", onBlur);
    });
  });
  return () => cleanupFns.forEach((fn) => fn());
}

// src/index.ts
var _Heatmap = class _Heatmap {
  constructor(el, options = {}) {
    this.el = el;
    this.id = `hueglint-${_Heatmap.instanceCount++}`;
    this.table = null;
    this.data = [];
    this.context = {};
    this.cleanupKeyboard = null;
    const palette = options.palette ?? "viridis";
    if (!isValidPalette(palette)) {
      throw new Error(
        `[hueglint] Invalid palette "${palette}". Expected one of: viridis, plasma, cividis, magma, inferno.`
      );
    }
    this.palette = palette;
    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.setAttribute("width", "100%");
    this.svg.setAttribute("height", "100%");
    this.el.appendChild(this.svg);
  }
  load(data, context = {}) {
    this.data = validateData(data);
    this.context = context;
    this.render();
  }
  render() {
    this.cleanupKeyboard?.();
    this.svg.innerHTML = "";
    const width = this.el.clientWidth || 400;
    const height = this.el.clientHeight || 300;
    const layout = computeLayout(this.data, width, height);
    const colorScale = getColorScale(this.palette);
    const normalized = normalizeValues(this.data);
    const gridCells = [];
    for (const cell of this.data) {
      const pos = layout.positions.get(cell);
      const t = normalized.get(cell);
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", String(pos.x));
      rect.setAttribute("y", String(pos.y));
      rect.setAttribute("width", String(layout.cellWidth));
      rect.setAttribute("height", String(layout.cellHeight));
      rect.setAttribute("fill", colorScale(t));
      rect.setAttribute(
        "aria-label",
        `${this.context.rowLabel ?? "Row"} ${cell.row}, ${this.context.colLabel ?? "Column"} ${cell.col}: ${cell.value}`
      );
      this.svg.appendChild(rect);
      gridCells.push({
        el: rect,
        rowIndex: layout.rows.indexOf(cell.row),
        colIndex: layout.cols.indexOf(cell.col)
      });
    }
    this.cleanupKeyboard = setupRovingTabindex(gridCells);
    if (this.table) this.el.removeChild(this.table);
    this.table = buildAccessibleTable(this.data, this.context, `${this.id}-table`);
    this.el.appendChild(this.table);
  }
  destroy() {
    this.cleanupKeyboard?.();
    this.svg.remove();
    this.table?.remove();
  }
};
_Heatmap.instanceCount = 0;
var Heatmap = _Heatmap;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Heatmap
});
