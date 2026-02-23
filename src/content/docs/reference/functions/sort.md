---
title: sort
category: List, Record
example: 'xs.sort()'
---

Sorts lists and record fields.

```tql
sort(xs:list|record, [desc=bool, cmp=(a, b) => bool]) -> list|record
```

## Description

The `sort` function takes either a list or record as input, ordering lists by
value and records by their field name.

### `xs: list|record`

The list or record to sort.

### `desc = bool (optional)`

When `true`, sorts the list in descending order.

The `desc` parameter only applies to lists. For records, fields are always
sorted ascending by key name.

Defaults to `false`.

### `cmp = (a, b) => bool (optional)`

A binary lambda that receives two elements and returns a boolean indicating
whether the first element should come before the second. This lets you define a
custom sort order, for example to sort a list of records by a specific field.

The `cmp` parameter only applies to lists. When combined with `desc=true`, the
comparison is reversed by swapping the arguments before passing them to the
lambda.

## Examples

### Sort values in a list

```tql
from {xs: [1, 3, 2]}
xs = xs.sort()
```

```tql
{xs: [1, 2, 3]}
```

### Sort a record by its field names

```tql
from {a: 1, c: 3, b: {y: true, x: false}}
this = this.sort()
```

```tql
{a: 1, b: {y: true, x: false}, c: 3}
```

Note that nested records are not automatically sorted. Use `b = b.sort()` to sort it
manually.

### Sort in descending order

```tql
from {xs: [3, 1, 2]}
xs = xs.sort(desc=true)
```

```tql
{xs: [3, 2, 1]}
```

### Sort records by a specific field using a custom comparator

```tql
from {xs: [{v: 2, id: "b"}, {v: 1, id: "a"}, {v: 2, id: "c"}]}
xs = xs.sort(cmp=(a, b) => a.v < b.v)
```

```tql
{xs: [{v: 1, id: "a"}, {v: 2, id: "b"}, {v: 2, id: "c"}]}
```
