# hueglint

**Clarity, not just color.**

Accessible-by-default heatmaps for the web. CVD-safe palettes, honest tooltips, native diff mode, and a screen-reader-friendly data table — all on by default, not bolted on.

> This project is in early development. APIs are not yet stable.

## Why hueglint

Most heatmap libraries answer "how much is here?" with color alone — which quietly excludes the roughly 1 in 12 men and 1 in 200 women with some form of color vision deficiency, and anyone relying on a screen reader gets nothing at all. hueglint is built the other way around: every chart ships with a CVD-safe palette, a synced accessible data table, and keyboard navigation by default, with no configuration required.

## Packages

| Package | Description |
|---|---|
| [`@hueglint/core`](./packages/core) | Framework-agnostic core engine |
| [`@hueglint/react`](./packages/react) | React bindings |

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

## Documentation

Full docs: [hueglint.umbrova.com](https://hueglint.umbrova.com) *(coming soon)*

## Development

This is a pnpm workspace managed with Turborepo.

```bash
pnpm install
pnpm turbo build test lint
```

## License

MIT © [Your name] — part of the [Umbrova](https://umbrova.com) family of tools.
