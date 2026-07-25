---
title: Accessibility
---

hueglint is built to satisfy specific, named WCAG success criteria out of the box — not as a general claim, but as a concrete list you can check against your own compliance requirements.

## What's satisfied by default, and how

### 1.4.1 — Use of color

Color is never the only signal a cell carries. Every chart uses one of five perceptually uniform, CVD-safe palettes (viridis, plasma, cividis, magma, inferno) — each varies in *lightness*, not just hue, so a value is distinguishable even with no color perception at all. Pattern and texture layer on top as a secondary channel where relevant, and diff mode uses a purple-orange diverging scale specifically because it stays distinguishable for the most common forms of color vision deficiency (unlike a red-green diverging scale, which does not).

### 1.4.3 — Contrast (minimum)

All five default palettes, and the diverging scale used in diff mode, are chosen and tested to maintain sufficient contrast across their full range — not just at the extremes.

### 2.1.1 — Keyboard

Every cell is individually focusable and reachable via arrow-key navigation, using a roving tabindex — the whole chart is one stop in the page's tab order, and arrow keys move focus between cells from there. Navigation is based on actual grid position (row/column), not array order, so it stays correct even if your data isn't sorted the way it's visually laid out.

### 4.1.2 — Name, role, value

Every cell has an accessible name via `aria-label` describing its row, column, and value. Tooltips are linked to their cell via `aria-describedby`, so screen readers announce the same detail a sighted user sees on hover. A synced, hidden data table mirrors the entire dataset for screen reader users who want to review the whole chart structurally rather than cell-by-cell — with a real `<caption>` and `scope="col"` headers, not just a table-shaped `<div>`.

## Additional support beyond the four core criteria

- **Visible focus indicator** (2.4.7) — a visible ring on the active cell, driven by real focus/blur events, so it works correctly regardless of how focus arrived (keyboard, mouse click, or a screen reader's own navigation commands).
- **`prefers-reduced-motion`** — the loading skeleton's pulse animation is disabled in favor of a static, dimmed appearance when the user's OS-level motion preference requests it.
- **`forced-colors` and `prefers-contrast: more`** — under Windows High Contrast Mode, cells opt out of forced color normalization (preserving the CVD-safe palette rather than having it flattened to system colors) and gain a visible border so boundaries stay distinguishable. Under a general "more contrast" preference, cells gain a subtler border for the same reason.
- **Auto-generated summary** — a short summary (highest value, lowest value, and where) is read before the full data table, so screen reader users get context before navigating potentially thousands of cells one at a time. Customizable via `summaryFormatter`, using either a template string (`{maxValue}`, `{maxRow}`, `{maxCol}`, `{minValue}`, `{minRow}`, `{minCol}`, `{rowLabel}`, `{colLabel}`, `{valueLabel}`) or a full function for complete control.

## Planned, not yet implemented

- **Zoom and reflow** (1.4.4 / 1.4.10) testing independent from mobile-container responsiveness
- **Streaming-specific accessibility** (a pause control, throttled live-region announcements) — tied to the real-time streaming feature (Pro, not yet shipped), not useful before that exists
- **RTL layout support** — designed for with CSS logical properties from the start, but not yet built or tested

## Configuring for your own audience

```js
// Disable touch-target protection to render every cell at full resolution
const chart = new Heatmap(el, { minCellSize: 1 });
```

- `minCellSize` — the default 44px touch-target floor exists for touch accessibility. It's configurable, not fixed, because it's a usability recommendation for one interaction mode (touch), not a correctness guarantee — a desktop-only dense overview chart may reasonably use a smaller value. Lowering it is a real, visible tradeoff (worse tap precision), not a free option, so make that choice deliberately rather than by default.
- `ariaLabelFormatter` and `summaryFormatter` — override the per-cell and chart-level text for domain-specific terminology, using either a simple template string or a full formatter function.

## What's deliberately not included, and why

- **Audio/sonification** — a legitimate accessibility technique in general, but not pursued here. It isn't required by WCAG (the data table already satisfies the text-alternative requirement), it doesn't match how screen reader users already navigate structured content, and it carries real autoplay/interruption constraints (1.4.2) for a feature that would be additive rather than closing an actual gap.

## Verifying this yourself

Every claim in the "what's satisfied by default" and "additional support" sections above is backed by an automated test in hueglint's own test suite — `axe-core` and targeted unit tests run in CI on every change specifically so these claims stay true release over release, not just at launch. The "planned" items are not yet covered, since they don't exist yet.