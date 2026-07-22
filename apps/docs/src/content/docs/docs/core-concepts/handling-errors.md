---
title: Handling errors
---

A hueglint chart can be in one of four states: **loading**, **ready**, **empty**, or **error**. Each renders differently, and each is a distinct situation — an empty dataset is not an error, and a validation failure is not the same as "still fetching."

## The three non-ready states

### Loading

Shown automatically between when a `Heatmap` instance is created and its first `.load()` call resolves. Renders a skeleton grid matching the container's dimensions, so there's no layout shift when real data arrives.

You don't need to do anything to get this — it's the default state of any newly created chart.

### Empty

Shown when `.load()` is called with a dataset that has zero rows. This is a normal, expected state — a new dashboard, a filter that matched nothing — not a failure. It renders a neutral message:

> No data to display
> Call .load() with your dataset

### Error

Shown when `.load()` receives data that fails validation, or when an unexpected error occurs during rendering. Unlike Empty, this state uses `role="alert"` so screen readers announce it immediately, and the container border uses the danger color token.

The on-screen message is intentionally short — enough for an end user to understand something's wrong, not a full technical dump:

> Unable to load chart data
> See console for details

The full detail goes to the browser console:

```
[hueglint] Validation error at index 3, row "Tue":
  expected value to be a number, got string ("42%")
```

## Customizing error handling

By default, hueglint renders its own error UI in place of the chart. If you'd rather handle errors yourself — log to your own error tracking, show nothing to the end user, or render a custom fallback — pass an `onError` callback:

```js
const chart = new Heatmap(el, {
  onError: (err) => {
    myErrorTracker.log(err);
    // return false to suppress hueglint's default error UI
    return false;
  }
});
```

Returning `false` from `onError` suppresses the built-in error state entirely — useful for production dashboards where you don't want raw error text visible to end users, but still want to know when something's wrong.

## Empty vs. error: which one fires?

| Situation | State |
|---|---|
| `.load([])` — valid, zero rows | Empty |
| `.load(null)` or `.load(undefined)` | Error |
| `.load([{ row: 'Mon', col: '8am', value: 'oops' }])` — wrong type | Error |
| `.load()` never called | Loading |
| Network request for your data fails, before you call `.load()` | Not a hueglint state — your app's responsibility. hueglint only knows about the data it's given. |

## Accessibility

Both Empty and Error states are exposed to the accessibility tree the same way the chart itself is — through the synced hidden data table. A screen reader user navigating to a chart in the Error state hears the alert immediately; one navigating to an Empty chart hears "No data to display" as normal table content, not as an alarm.