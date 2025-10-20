# median

Computes the approximate median of all grouped values using a t-digest algorithm.

```tql
median(xs:list) -> float
```

## Description

[Section titled “Description”](#description)

The `median` function returns an approximate median of all numeric values in `xs`, computed with a t-digest algorithm.

### `xs: list`

[Section titled “xs: list”](#xs-list)

The values to evaluate.

## Examples

[Section titled “Examples”](#examples)

### Compute the median value

[Section titled “Compute the median value”](#compute-the-median-value)

```tql
from {x: 1}, {x: 2}, {x: 3}, {x: 4}
summarize median_value=median(x)
```

```tql
{median_value: 2.5}
```

## See Also

[Section titled “See Also”](#see-also)

[`mean`](/reference/functions/mean), [`mode`](/reference/functions/mode), [`quantile`](/reference/functions/quantile)