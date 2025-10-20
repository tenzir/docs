# min

Computes the minimum of all grouped values.

```tql
min(xs:list) -> number
```

## Description

[Section titled “Description”](#description)

The `min` function returns the smallest numeric value in `xs`.

### `xs: list`

[Section titled “xs: list”](#xs-list)

The values to evaluate.

## Examples

[Section titled “Examples”](#examples)

### Find the minimum value

[Section titled “Find the minimum value”](#find-the-minimum-value)

```tql
from {x: 1}, {x: 2}, {x: 3}
summarize min_value=min(x)
```

```tql
{min_value: 1}
```

## See Also

[Section titled “See Also”](#see-also)

[`max`](/reference/functions/max), [`mean`](/reference/functions/mean), [`sum`](/reference/functions/sum)