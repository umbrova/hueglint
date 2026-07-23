---
title: Installation
---

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
], { rowLabel: 'Day', colLabel: 'Hour', valueLabel: 'Requests' });
```

With React:

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