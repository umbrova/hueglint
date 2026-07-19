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
    for (let key2 of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key2) && key2 !== except)
        __defProp(to, key2, { get: () => from[key2], enumerable: !(desc = __getOwnPropDesc(from, key2)) || desc.enumerable });
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
function getDivergingColorScale() {
  return import_d3_scale_chromatic.interpolatePuOr;
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
function buildDiffAccessibleTable(diffs, context, id) {
  const table = document.createElement("table");
  table.id = id;
  table.style.cssText = VISUALLY_HIDDEN_STYLE;
  const caption = document.createElement("caption");
  caption.textContent = context.description ?? "Comparison between two datasets";
  table.appendChild(caption);
  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  [context.rowLabel ?? "Row", context.colLabel ?? "Column", "Previous", "Current", "Change"].forEach(
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
  for (const d of diffs) {
    const tr = document.createElement("tr");
    const sign = d.delta >= 0 ? "+" : "";
    [d.row, d.col, d.previousValue, d.currentValue, `${sign}${d.delta}`].forEach((v) => {
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

// src/diff.ts
var key = (row, col) => `${row}::${col}`;
function computeDiff(current, previous) {
  const prevMap = new Map(previous.map((c) => [key(c.row, c.col), c]));
  const results = [];
  const matched = /* @__PURE__ */ new Set();
  for (const cell of current) {
    const k = key(cell.row, cell.col);
    const prev = prevMap.get(k);
    if (!prev) {
      console.warn(
        `[hueglint] Cell (${cell.row}, ${cell.col}) has no matching comparison value \u2014 skipped from diff.`
      );
      continue;
    }
    matched.add(k);
    results.push({
      row: cell.row,
      col: cell.col,
      currentValue: cell.value,
      previousValue: prev.value,
      delta: cell.value - prev.value
    });
  }
  previous.forEach((c) => {
    if (!matched.has(key(c.row, c.col))) {
      console.warn(
        `[hueglint] Comparison cell (${c.row}, ${c.col}) has no matching current value \u2014 skipped from diff.`
      );
    }
  });
  if (results.length === 0) {
    throw new Error(
      "[hueglint] loadDiff(): no matching (row, col) pairs between current and comparison data."
    );
  }
  return results;
}
function normalizeDiffs(diffs) {
  const maxAbs = Math.max(...diffs.map((d) => Math.abs(d.delta)), 0);
  const result = /* @__PURE__ */ new Map();
  for (const d of diffs) {
    result.set(d, maxAbs === 0 ? 0.5 : 0.5 + d.delta / maxAbs * 0.5);
  }
  return result;
}
function defaultDiffTooltip(d, context) {
  const label = context.valueLabel ?? "Value";
  const sign = d.delta >= 0 ? "+" : "";
  return `${d.row}, ${d.col}
${label}: ${d.previousValue} \u2192 ${d.currentValue} (${sign}${d.delta})`;
}

// src/tooltip.ts
var TooltipController = class {
  constructor(instanceId) {
    this.activeTarget = null;
    this.onScroll = null;
    this.id = `${instanceId}-tooltip`;
    this.el = document.createElement("div");
    this.el.id = this.id;
    this.el.setAttribute("role", "tooltip");
    this.el.style.cssText = "position:fixed;pointer-events:none;background:#fff;border:1px solid #ccc;border-radius:4px;padding:6px 10px;font-size:13px;white-space:pre-line;box-shadow:0 2px 8px rgba(0,0,0,0.15);z-index:2147483647;display:none;max-width:220px;";
    document.body.appendChild(this.el);
  }
  show(target, content) {
    this.el.textContent = content;
    target.setAttribute("aria-describedby", this.id);
    this.el.style.display = "block";
    this.activeTarget = target;
    this.position(target);
    this.onScroll = () => this.position(target);
    window.addEventListener("scroll", this.onScroll, { capture: true, passive: true });
  }
  hide(target) {
    if (target && target !== this.activeTarget) return;
    this.el.style.display = "none";
    this.activeTarget?.removeAttribute("aria-describedby");
    this.activeTarget = null;
    if (this.onScroll) {
      window.removeEventListener("scroll", this.onScroll, { capture: true });
      this.onScroll = null;
    }
  }
  toggle(target, content) {
    if (this.activeTarget === target) {
      this.hide(target);
    } else {
      this.show(target, content);
    }
  }
  position(target) {
    const rect = target.getBoundingClientRect();
    const tipRect = this.el.getBoundingClientRect();
    const gap = 8;
    let top = rect.top - tipRect.height - gap;
    if (top < 0) top = rect.bottom + gap;
    let left = rect.left + rect.width / 2 - tipRect.width / 2;
    left = Math.max(gap, Math.min(left, window.innerWidth - tipRect.width - gap));
    this.el.style.left = `${left}px`;
    this.el.style.top = `${top}px`;
  }
  destroy() {
    if (this.onScroll) window.removeEventListener("scroll", this.onScroll, { capture: true });
    this.el.remove();
  }
};
var defaultFormatter = (cell, context) => {
  const label = context.valueLabel ?? "Value";
  const base = `${cell.row}, ${cell.col}
${label}: ${cell.value}`;
  if (cell.meta?.aggregated) {
    return `${base}
(average of ${String(cell.meta.count)} cells)`;
  }
  return base;
};
function attachTooltipEvents(cells, tooltip, context, formatter = defaultFormatter) {
  const cleanupFns = [];
  cells.forEach(({ el, cell }) => {
    const content = () => formatter(cell, context);
    const onShow = () => tooltip.show(el, content());
    const onHide = () => tooltip.hide(el);
    const onClick = (e) => {
      e.stopPropagation();
      tooltip.toggle(el, content());
    };
    el.addEventListener("mouseenter", onShow);
    el.addEventListener("mouseleave", onHide);
    el.addEventListener("focus", onShow);
    el.addEventListener("blur", onHide);
    el.addEventListener("click", onClick);
    cleanupFns.push(() => {
      el.removeEventListener("mouseenter", onShow);
      el.removeEventListener("mouseleave", onHide);
      el.removeEventListener("focus", onShow);
      el.removeEventListener("blur", onHide);
      el.removeEventListener("click", onClick);
    });
  });
  const onDocumentClick = () => tooltip.hide();
  document.addEventListener("click", onDocumentClick);
  cleanupFns.push(() => document.removeEventListener("click", onDocumentClick));
  return () => cleanupFns.forEach((fn) => fn());
}
function attachDiffTooltipEvents(cells, tooltip, context) {
  const cleanupFns = [];
  cells.forEach(({ el, diff }) => {
    const content = () => defaultDiffTooltip(diff, context);
    const onShow = () => tooltip.show(el, content());
    const onHide = () => tooltip.hide(el);
    const onClick = (e) => {
      e.stopPropagation();
      tooltip.toggle(el, content());
    };
    el.addEventListener("mouseenter", onShow);
    el.addEventListener("mouseleave", onHide);
    el.addEventListener("focus", onShow);
    el.addEventListener("blur", onHide);
    el.addEventListener("click", onClick);
    cleanupFns.push(() => {
      el.removeEventListener("mouseenter", onShow);
      el.removeEventListener("mouseleave", onHide);
      el.removeEventListener("focus", onShow);
      el.removeEventListener("blur", onHide);
      el.removeEventListener("click", onClick);
    });
  });
  const onDocumentClick = () => tooltip.hide();
  document.addEventListener("click", onDocumentClick);
  cleanupFns.push(() => document.removeEventListener("click", onDocumentClick));
  return () => cleanupFns.forEach((fn) => fn());
}

// src/states.ts
function buildLoadingState() {
  const el = document.createElement("div");
  el.setAttribute("data-hueglint-state", "loading");
  el.style.cssText = "display:grid;grid-template-columns:repeat(4,1fr);gap:4px;width:100%;height:100%;min-height:120px;";
  for (let i = 0; i < 16; i++) {
    const cell = document.createElement("div");
    cell.style.cssText = `background:#e0e0e0;border-radius:3px;animation:hueglint-pulse 1.4s ease-in-out infinite;animation-delay:${i % 4 * 0.1}s;`;
    el.appendChild(cell);
  }
  if (!document.getElementById("hueglint-pulse-keyframes")) {
    const style = document.createElement("style");
    style.id = "hueglint-pulse-keyframes";
    style.textContent = "@keyframes hueglint-pulse { 0%,100%{opacity:.4} 50%{opacity:.8} }";
    document.head.appendChild(style);
  }
  return el;
}
function buildEmptyState() {
  const el = document.createElement("div");
  el.setAttribute("data-hueglint-state", "empty");
  el.style.cssText = "display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;width:100%;height:100%;min-height:120px;text-align:center;color:#888;font-size:13px;";
  const title = document.createElement("p");
  title.textContent = "No data to display";
  title.style.cssText = "margin:0;";
  const subtitle = document.createElement("p");
  subtitle.textContent = "Call .load() with your dataset";
  subtitle.style.cssText = "margin:0;font-size:12px;color:#aaa;";
  el.append(title, subtitle);
  return el;
}
function buildErrorState(message) {
  const el = document.createElement("div");
  el.setAttribute("data-hueglint-state", "error");
  el.setAttribute("role", "alert");
  el.style.cssText = "display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;width:100%;height:100%;min-height:120px;text-align:center;border:1px solid #e33;border-radius:6px;color:#333;font-size:13px;";
  const title = document.createElement("p");
  title.textContent = message;
  title.style.cssText = "margin:0;";
  const subtitle = document.createElement("p");
  subtitle.textContent = "See console for details";
  subtitle.style.cssText = "margin:0;font-size:12px;color:#888;";
  el.append(title, subtitle);
  return el;
}

// src/aggregate.ts
var MIN_TOUCH_SIZE = 44;
function computeAggregationFactor(width, height, rowCount, colCount) {
  if (rowCount === 0 || colCount === 0) return 1;
  const naiveCellWidth = width / colCount;
  const naiveCellHeight = height / rowCount;
  const factorW = Math.max(1, Math.ceil(MIN_TOUCH_SIZE / naiveCellWidth));
  const factorH = Math.max(1, Math.ceil(MIN_TOUCH_SIZE / naiveCellHeight));
  return Math.max(factorW, factorH);
}
function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
function labelForGroup(group) {
  return group.length === 1 ? String(group[0]) : `${group[0]}\u2013${group[group.length - 1]}`;
}
function aggregateData(data, rows, cols, factor) {
  if (factor <= 1) return data;
  const rowGroups = chunk(rows, factor);
  const colGroups = chunk(cols, factor);
  const rowGroupIndex = /* @__PURE__ */ new Map();
  rowGroups.forEach((group, i) => group.forEach((r) => rowGroupIndex.set(r, i)));
  const colGroupIndex = /* @__PURE__ */ new Map();
  colGroups.forEach((group, i) => group.forEach((c) => colGroupIndex.set(c, i)));
  const buckets = /* @__PURE__ */ new Map();
  for (const cell of data) {
    const ri = rowGroupIndex.get(cell.row);
    const ci = colGroupIndex.get(cell.col);
    const key2 = `${ri}::${ci}`;
    const existing = buckets.get(key2);
    if (existing) {
      existing.sum += cell.value;
      existing.count += 1;
    } else {
      buckets.set(key2, {
        sum: cell.value,
        count: 1,
        rowLabel: labelForGroup(rowGroups[ri]),
        colLabel: labelForGroup(colGroups[ci])
      });
    }
  }
  const result = [];
  buckets.forEach((b) => {
    result.push({
      row: b.rowLabel,
      col: b.colLabel,
      value: b.sum / b.count,
      meta: { aggregated: true, count: b.count }
    });
  });
  return result;
}

// src/index.ts
var _Heatmap = class _Heatmap {
  constructor(el, options = {}) {
    this.el = el;
    this.id = `hueglint-${_Heatmap.instanceCount++}`;
    this.table = null;
    this.stateEl = null;
    this.resizeScheduled = false;
    this.rawData = [];
    this.data = [];
    this.diffs = null;
    this.mode = null;
    this.context = {};
    this.cleanupKeyboard = null;
    this.cleanupTooltip = null;
    this.options = options;
    const palette = options.palette ?? "viridis";
    if (!isValidPalette(palette)) {
      throw new Error(
        `[hueglint] Invalid palette "${palette}". Expected one of: viridis, plasma, cividis, magma, inferno.`
      );
    }
    this.palette = palette;
    this.tooltip = new TooltipController(this.id);
    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.setAttribute("width", "100%");
    this.svg.setAttribute("height", "100%");
    this.el.appendChild(this.svg);
    this.showState(buildLoadingState());
    this.resizeObserver = new ResizeObserver(() => {
      if (this.resizeScheduled) return;
      this.resizeScheduled = true;
      requestAnimationFrame(() => {
        this.resizeScheduled = false;
        if (this.mode === "normal") this.applyAggregationAndRender();
        else if (this.mode === "diff") this.renderDiff();
      });
    });
    this.resizeObserver.observe(this.el);
  }
  load(data, context = {}) {
    let validated;
    try {
      validated = validateData(data);
    } catch (err) {
      this.mode = null;
      this.handleError(err);
      return;
    }
    this.context = context;
    if (validated.length === 0) {
      this.mode = null;
      this.rawData = [];
      this.showState(buildEmptyState());
      return;
    }
    this.mode = "normal";
    this.rawData = validated;
    this.showState(null);
    this.applyAggregationAndRender();
  }
  loadDiff(current, previous, context = {}) {
    let validCurrent;
    let validPrevious;
    try {
      validCurrent = validateData(current);
      validPrevious = validateData(previous);
    } catch (err) {
      this.mode = null;
      this.handleError(err);
      return;
    }
    this.context = context;
    if (validCurrent.length === 0 && validPrevious.length === 0) {
      this.mode = null;
      this.diffs = null;
      this.showState(buildEmptyState());
      return;
    }
    let diffs;
    try {
      diffs = computeDiff(validCurrent, validPrevious);
    } catch (err) {
      this.mode = null;
      this.handleError(err);
      return;
    }
    this.mode = "diff";
    this.diffs = diffs;
    this.showState(null);
    this.renderDiff();
  }
  update(row, col, value) {
    if (this.mode !== "normal") {
      console.warn("[hueglint] update() is only supported outside diff mode.");
      return;
    }
    if (typeof value !== "number") {
      this.handleError(
        new Error(`[hueglint] update(): expected value to be a number, got ${typeof value}.`)
      );
      return;
    }
    const existing = this.rawData.find((c) => c.row === row && c.col === col);
    if (existing) {
      existing.value = value;
    } else {
      this.rawData.push({ row, col, value });
    }
    this.applyAggregationAndRender();
  }
  applyAggregationAndRender() {
    const width = this.el.clientWidth || 400;
    const height = this.el.clientHeight || 300;
    const rows = Array.from(new Set(this.rawData.map((d) => d.row)));
    const cols = Array.from(new Set(this.rawData.map((d) => d.col)));
    const factor = computeAggregationFactor(width, height, rows.length, cols.length);
    this.data = aggregateData(this.rawData, rows, cols, factor);
    this.render();
  }
  handleError(error) {
    console.error("[hueglint]", error);
    const suppressed = this.options.onError?.(error) === false;
    if (!suppressed) {
      this.showState(buildErrorState("Unable to load chart data"));
    }
  }
  showState(el) {
    if (this.stateEl) this.stateEl.remove();
    this.stateEl = el;
    if (el) {
      this.svg.style.display = "none";
      if (this.table) this.table.style.display = "none";
      this.el.appendChild(el);
    } else {
      this.svg.style.display = "";
      if (this.table) this.table.style.display = "";
    }
  }
  render() {
    this.cleanupKeyboard?.();
    this.cleanupTooltip?.();
    this.svg.innerHTML = "";
    const width = this.el.clientWidth || 400;
    const height = this.el.clientHeight || 300;
    const layout = computeLayout(this.data, width, height);
    const colorScale = getColorScale(this.palette);
    const normalized = normalizeValues(this.data);
    const gridCells = [];
    const tooltipCells = [];
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
      tooltipCells.push({ el: rect, cell });
    }
    this.cleanupKeyboard = setupRovingTabindex(gridCells);
    this.cleanupTooltip = attachTooltipEvents(
      tooltipCells,
      this.tooltip,
      this.context,
      this.options.tooltipFormatter
    );
    if (this.table) this.el.removeChild(this.table);
    this.table = buildAccessibleTable(this.data, this.context, `${this.id}-table`);
    this.el.appendChild(this.table);
  }
  renderDiff() {
    if (!this.diffs) return;
    this.cleanupKeyboard?.();
    this.cleanupTooltip?.();
    this.svg.innerHTML = "";
    const width = this.el.clientWidth || 400;
    const height = this.el.clientHeight || 300;
    const layout = computeLayout(this.diffs, width, height);
    const colorScale = getDivergingColorScale();
    const normalized = normalizeDiffs(this.diffs);
    const gridCells = [];
    const tooltipCells = [];
    for (const d of this.diffs) {
      const pos = layout.positions.get(d);
      const t = normalized.get(d);
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", String(pos.x));
      rect.setAttribute("y", String(pos.y));
      rect.setAttribute("width", String(layout.cellWidth));
      rect.setAttribute("height", String(layout.cellHeight));
      rect.setAttribute("fill", colorScale(t));
      const sign = d.delta >= 0 ? "+" : "";
      rect.setAttribute(
        "aria-label",
        `${this.context.rowLabel ?? "Row"} ${d.row}, ${this.context.colLabel ?? "Column"} ${d.col}: changed from ${d.previousValue} to ${d.currentValue} (${sign}${d.delta})`
      );
      this.svg.appendChild(rect);
      gridCells.push({
        el: rect,
        rowIndex: layout.rows.indexOf(d.row),
        colIndex: layout.cols.indexOf(d.col)
      });
      tooltipCells.push({ el: rect, diff: d });
    }
    this.cleanupKeyboard = setupRovingTabindex(gridCells);
    this.cleanupTooltip = attachDiffTooltipEvents(tooltipCells, this.tooltip, this.context);
    if (this.table) this.el.removeChild(this.table);
    this.table = buildDiffAccessibleTable(this.diffs, this.context, `${this.id}-table`);
    this.el.appendChild(this.table);
  }
  destroy() {
    this.resizeObserver.disconnect();
    this.cleanupKeyboard?.();
    this.cleanupTooltip?.();
    this.tooltip.destroy();
    this.stateEl?.remove();
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
