# sum

Computes the sum of all values.

```tql
sum(xs:list) -> int
```

## Description

[Section titled “Description”](#description)

The `sum` function computes the total of all number values.

### `xs: list`

[Section titled “xs: list”](#xs-list)

The values to aggregate.

## Examples

[Section titled “Examples”](#examples)

### Compute a sum over a group of events

[Section titled “Compute a sum over a group of events”](#compute-a-sum-over-a-group-of-events)

```tql
from {x: 1}, {x: 2}, {x: 3}
summarize n=sum(x)
```

```tql
{n: 6}
```

## See Also

[Section titled “See Also”](#see-also)

[`collect`](/reference/functions/collect), [`max`](/reference/functions/max), [`mean`](/reference/functions/mean), [`min`](/reference/functions/min)