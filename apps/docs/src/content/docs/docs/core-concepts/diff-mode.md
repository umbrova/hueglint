---
title: Diff mode
---

Compare two datasets directly — hueglint renders the delta between them on a diverging color scale, instead of you building two separate charts and eyeballing the difference.

```js
chart.loadDiff(thisWeekData, lastWeekData, { valueLabel: 'Requests' });
```

The diverging scale is purple-to-orange, not red-to-green — a deliberate choice, since red-green is the exact color pair that's unreadable for the most common form of color vision deficiency. Tooltips in diff mode show the actual before-and-after values, not just the delta, so you always have the real numbers to hand.

Diff mode requires the two datasets to share at least some matching `(row, col)` pairs. Mismatched cells are skipped with a console warning rather than silently dropped without explanation — a completely empty overlap throws a clear error instead of rendering nothing.