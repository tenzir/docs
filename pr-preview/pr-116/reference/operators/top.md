# top

Shows the most common values.

```tql
top x:field
```

## Description

[Section titled “Description”](#description)

Shows the most common values for a given field. For each value, a new event containing its count will be produced. In general, `top x` is equivalent to:

```tql
summarize x, count=count()
sort -count
```

This operator is the dual to [`rare`](/reference/operators/rare).

Potentially High Memory Usage

Use caution when applying this operator to large inputs. It currently buffers all data in memory. Out-of-core processing is on our roadmap.

### `x: field`

[Section titled “x: field”](#x-field)

The field to find the most common values for.

## Examples

[Section titled “Examples”](#examples)

### Find the most common values

[Section titled “Find the most common values”](#find-the-most-common-values)

```tql
from {x: "B"}, {x: "A"}, {x: "A"}, {x: "B"}, {x: "A"}, {x: "D"}, {x: "C"}, {x: "C"}
top x
```

```tql
{x: "A", count: 3}
{x: "B", count: 2}
{x: "C", count: 2}
{x: "D", count: 1}
```

### Show the 5 top-most values

[Section titled “Show the 5 top-most values”](#show-the-5-top-most-values)

```tql
top id.orig_h
head 5
```

## See Also

[Section titled “See Also”](#see-also)

[`summarize`](/reference/operators/summarize), [`rare`](/reference/operators/rare), [`sort`](/reference/operators/sort)