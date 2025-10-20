# rare

Shows the least common values.

```tql
rare x:field
```

## Description

[Section titled “Description”](#description)

Shows the least common values for a given field. For each unique value, a new event containing its count will be produced. In general, `rare x` is equivalent to:

This operator is the dual to [`top`](/reference/operators/top).

```tql
summarize x, count=count()
sort count
```

Potentially High Memory Usage

Use caution when applying this operator to large inputs. It currently buffers all data in memory. Out-of-core processing is on our roadmap.

### `x: field`

[Section titled “x: field”](#x-field)

The name of the field to find the least common values for.

## Examples

[Section titled “Examples”](#examples)

### Find the least common values

[Section titled “Find the least common values”](#find-the-least-common-values)

```tql
from {x: "B"}, {x: "A"}, {x: "A"}, {x: "B"}, {x: "A"}, {x: "D"}, {x: "C"}, {x: "C"}
rare x
```

```tql
{x: "D", count: 1}
{x: "C", count: 2}
{x: "B", count: 2}
{x: "A", count: 3}
```

### Show the five least common values for `id.orig_h`

[Section titled “Show the five least common values for id.orig\_h”](#show-the-five-least-common-values-for-idorig_h)

```tql
rare id.orig_h
head 5
```

## See Also

[Section titled “See Also”](#see-also)

[`summarize`](/reference/operators/summarize), [`sort`](/reference/operators/sort), [`top`](/reference/operators/top)