# mean

Computes the mean of all grouped values.

```tql
mean(xs:list) -> float
```

## Description

[Section titled “Description”](#description)

The `mean` function returns the average of all numeric values in `xs`.

### `xs: list`

[Section titled “xs: list”](#xs-list)

The values to average.

## Examples

[Section titled “Examples”](#examples)

### Compute the mean value

[Section titled “Compute the mean value”](#compute-the-mean-value)

```tql
from {x: 1}, {x: 2}, {x: 3}
summarize avg=mean(x)
```

```tql
{avg: 2.0}
```

## See Also

[Section titled “See Also”](#see-also)

[`max`](/reference/functions/max), [`median`](/reference/functions/median), [`min`](/reference/functions/min), [`quantile`](/reference/functions/quantile), [`stddev`](/reference/functions/stddev), [`sum`](/reference/functions/sum), [`variance`](/reference/functions/variance)