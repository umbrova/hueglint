---
title: Data format
---

hueglint expects an array of flat objects, not a matrix:

```js
[
  { row: 'Mon', col: '8am', value: 42 },
  { row: 'Mon', col: '9am', value: 58 },
]
```

Each cell requires `row`, `col`, and a numeric `value`. An optional `meta` field can carry any additional data specific to your use case.