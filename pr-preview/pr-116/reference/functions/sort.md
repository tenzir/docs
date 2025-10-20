# sort

Sorts lists and record fields.

```tql
sort(xs:list|record) -> list|record
```

## Description

[Section titled “Description”](#description)

The `sort` function takes either a list or record as input, ordering lists by value and records by their field name.

### `xs: list|record`

[Section titled “xs: list|record”](#xs-listrecord)

The list or record to sort.

## Examples

[Section titled “Examples”](#examples)

### Sort values in a list

[Section titled “Sort values in a list”](#sort-values-in-a-list)

```tql
from {xs: [1, 3, 2]}
xs = xs.sort()
```

```tql
{xs: [1, 2, 3]}
```

### Sort a record by its field names

[Section titled “Sort a record by its field names”](#sort-a-record-by-its-field-names)

```tql
from {a: 1, c: 3, b: {y: true, x: false}}
this = this.sort()
```

```tql
{a: 1, b: {y: true, x: false}, c: 3}
```

Note that nested records are not automatically sorted. Use `b = b.sort()` to sort it manually.