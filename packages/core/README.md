# @hueglint/core

Framework-agnostic core engine for hueglint — accessible-by-default heatmaps for the web.

CVD-safe palettes, honest tooltips, native diff mode, and a screen-reader-friendly data table, all on by default.

## Installation

```bash
npm install @hueglint/core
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

Using React? See [`@hueglint/react`](https://www.npmjs.com/package/@hueglint/react) instead.

## Full documentation

[hueglint.umbrova.com](https://hueglint.umbrova.com) — live playground, guides, and API reference.

## Repository

[github.com/umbrova/hueglint](https://github.com/umbrova/hueglint)

## License

MIT