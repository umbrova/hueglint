# @hueglint/react

React bindings for [hueglint](https://www.npmjs.com/package/@hueglint/core) — accessible-by-default heatmaps for the web.

## Installation

```bash
npm install @hueglint/react
```

## Quick start

```jsx
import { Heatmap } from '@hueglint/react';

function Dashboard() {
  return (
    <Heatmap
      data={data}
      context={{ rowLabel: 'Day', colLabel: 'Hour', valueLabel: 'Requests' }}
    />
  );
}
```

## Full documentation

[hueglint.umbrova.com](https://hueglint.umbrova.com) — live playground, guides, and API reference.

## Repository

[github.com/umbrova/hueglint](https://github.com/umbrova/hueglint)

## License

MIT