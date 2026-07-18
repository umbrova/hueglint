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

// src/index.ts
var Heatmap = class {
  constructor(el) {
    this.el = el;
    this.data = [];
    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.setAttribute("width", "100%");
    this.svg.setAttribute("height", "100%");
    this.el.appendChild(this.svg);
  }
  load(data, _context) {
    this.data = validateData(data);
    this.render();
  }
  render() {
    this.svg.innerHTML = "";
    const width = this.el.clientWidth || 400;
    const height = this.el.clientHeight || 300;
    const layout = computeLayout(this.data, width, height);
    for (const cell of this.data) {
      const pos = layout.positions.get(cell);
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", String(pos.x));
      rect.setAttribute("y", String(pos.y));
      rect.setAttribute("width", String(layout.cellWidth));
      rect.setAttribute("height", String(layout.cellHeight));
      rect.setAttribute("fill", "#888");
      this.svg.appendChild(rect);
    }
  }
  destroy() {
    this.el.removeChild(this.svg);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Heatmap
});
