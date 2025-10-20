# variance

Computes the variance of all grouped values.

```tql
variance(xs:list) -> float
```

## Description

[Section titled “Description”](#description)

The `variance` function returns the variance of all numeric values in `xs`.

### `xs: list`

[Section titled “xs: list”](#xs-list)

The values to evaluate.

## Examples

[Section titled “Examples”](#examples)

### Compute the variance of values

[Section titled “Compute the variance of values”](#compute-the-variance-of-values)

```tql
from {x: 1}, {x: 2}, {x: 3}
summarize variance_value=variance(x)
```

```tql
{variance_value: 0.666}
```

## See Also

[Section titled “See Also”](#see-also)

[`stddev`](/reference/functions/stddev), [`mean`](/reference/functions/mean)