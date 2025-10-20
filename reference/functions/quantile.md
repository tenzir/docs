# quantile

Computes the specified quantile of all grouped values.

```tql
quantile(xs:list, q=float) -> float
```

## Description

[Section titled “Description”](#description)

The `quantile` function returns the quantile of all numeric values in `xs`, specified by the argument `q`, which should be a value between 0 and 1.

### `xs: list`

[Section titled “xs: list”](#xs-list)

The values to evaluate.

### `q: float`

[Section titled “q: float”](#q-float)

The quantile to compute, where `q=0.5` represents the median.

## Examples

[Section titled “Examples”](#examples)

### Compute the 0.5 quantile (median) of values

[Section titled “Compute the 0.5 quantile (median) of values”](#compute-the-05-quantile-median-of-values)

```tql
from {x: 1}, {x: 2}, {x: 3}, {x: 4}
summarize median_value=quantile(x, q=0.5)
```

```tql
{median_value: 2.5}
```

## See Also

[Section titled “See Also”](#see-also)

[`median`](/reference/functions/median), [`mean`](/reference/functions/mean)