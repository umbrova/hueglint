# hueglint

**Clarity, not just color.**

Accessible-by-default heatmaps for the web. CVD-safe palettes, honest tooltips, native diff mode, and a screen-reader-friendly data table — all on by default, not bolted on.

> Pre-1.0 and not yet published to npm. Core, accessibility, diff mode, and the React adapter are built and tested; see Status below.

## Why hueglint

Most heatmap libraries answer "how much is here?" with color alone — which quietly excludes the roughly 1 in 12 men and 1 in 200 women with some form of color vision deficiency, and anyone relying on a screen reader gets nothing at all. hueglint is built the other way around: every chart ships with a CVD-safe palette, a synced accessible data table, and keyboard navigation by default, with no configuration required.

## Features

- **CVD-safe by default** — five perceptually uniform palettes (viridis, plasma, cividis, magma, inferno), each varying in lightness, not just hue
- **Native diff mode** — compare two datasets directly, with a purple-orange diverging scale chosen specifically to stay readable for the most common forms of color vision deficiency
- **Full keyboard navigation** — roving tabindex, arrow keys move focus by actual grid position, not array order
- **A real, synced accessible table** — mirrors every chart for screen reader users, with a proper caption and column headers, plus an auto-generated summary read before it
- **Correct tooltips** — accurate positioning with viewport collision handling, touch support, customizable formatting
- **Loading / empty / error states**, with an `onError` callback so you can fully own error handling in production
- **Responsive by default** — cells reflow and aggregate to protect a configurable minimum touch-target size, not just resize
- **Respects `prefers-reduced-motion`, `forced-colors`, and `prefers-contrast`** out of the box

## Packages

| Package | Description |
|---|---|
| [`@hueglint/core`](./packages/core) | Framework-agnostic core engine |
| [`@hueglint/react`](./packages/react) | React bindings |

A Vue adapter is planned for a future release.

## Installation

```bash
npm install @hueglint/core     # vanilla / any framework
npm install @hueglint/react    # React
```

## Quick start

```js
import { Heatmap } from '@hueglint/core';

const chart = new Heatmap(document.getElementById('chart'));
chart.load([
  { row: 'Mon', col: '8am', value: 42 },
  { row: 'Mon', col: '9am', value: 58 },
]);
```

With React:

```jsx
import { Heatmap } from '@hueglint/react';

function Dashboard() {
  return <Heatmap data={data} context={{ rowLabel: 'Day', colLabel: 'Hour', valueLabel: 'Requests' }} />;
}
```

## Diff mode

```js
chart.loadDiff(thisWeekData, lastWeekData, { valueLabel: 'Requests' });
```

## Documentation

Full docs, live playground, and guides: [hueglint.umbrova.com](https://hueglint.umbrova.com)

## Status

- Core engine, accessibility suite, diff mode, responsive/touch-target behavior, and the React adapter are built and covered by an automated test suite (including `axe-core` in CI)
- Deployed docs site with a live, interactive playground
- **Not yet published to npm** — install via the monorepo for now if you want to try it before release
- Versioned `0.0.x` — expect breaking changes before `1.0.0`

## Development

This is a pnpm workspace managed with Turborepo.

```bash
pnpm install
pnpm turbo build test lint
```

## License

MIT © [Your name] — part of the [Umbrova](https://umbrova.com) family of tools.