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
import {
  interpolateViridis,
  interpolatePlasma,
  interpolateCividis,
  interpolateMagma,
  interpolateInferno
} from "d3-scale-chromatic";
var PALETTES = {
  viridis: interpolateViridis,
  plasma: interpolatePlasma,
  cividis: interpolateCividis,
  magma: interpolateMagma,
  inferno: interpolateInferno
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

// src/index.ts
var Heatmap = class {
  constructor(el, options = {}) {
    this.el = el;
    this.data = [];
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
  load(data, _context) {
    this.data = validateData(data);
    this.render();
  }
  render() {
    this.svg.innerHTML = "";
    const width = this.el.clientWidth || 400;
    const height = this.el.clientHeight || 300;
    const layout = computeLayout(this.data, width, height);
    const colorScale = getColorScale(this.palette);
    const normalized = normalizeValues(this.data);
    for (const cell of this.data) {
      const pos = layout.positions.get(cell);
      const t = normalized.get(cell);
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", String(pos.x));
      rect.setAttribute("y", String(pos.y));
      rect.setAttribute("width", String(layout.cellWidth));
      rect.setAttribute("height", String(layout.cellHeight));
      rect.setAttribute("fill", colorScale(t));
      this.svg.appendChild(rect);
    }
  }
  destroy() {
    this.el.removeChild(this.svg);
  }
};
export {
  Heatmap
};
