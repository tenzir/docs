# stddev

Computes the standard deviation of all grouped values.

```tql
stddev(xs:list) -> float
```

## Description

[Section titled “Description”](#description)

The `stddev` function returns the standard deviation of all numeric values in `xs`.

### `xs: list`

[Section titled “xs: list”](#xs-list)

The values to evaluate.

## Examples

[Section titled “Examples”](#examples)

### Compute the standard deviation of values

[Section titled “Compute the standard deviation of values”](#compute-the-standard-deviation-of-values)

```tql
from {x: 1}, {x: 2}, {x: 3}
summarize stddev_value=stddev(x)
```

```tql
{stddev_value: 0.816}
```

## See Also

[Section titled “See Also”](#see-also)

[`variance`](/reference/functions/variance), [`mean`](/reference/functions/mean)