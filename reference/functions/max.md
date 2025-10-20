# max

Computes the maximum of all grouped values.

```tql
max(xs:list) -> number
```

## Description

[Section titled “Description”](#description)

The `max` function returns the largest numeric value in `xs`.

### `xs: list`

[Section titled “xs: list”](#xs-list)

The values to evaluate.

## Examples

[Section titled “Examples”](#examples)

### Find the maximum value

[Section titled “Find the maximum value”](#find-the-maximum-value)

```tql
from {x: 1}, {x: 2}, {x: 3}
summarize max_value=max(x)
```

```tql
{max_value: 3}
```

## See Also

[Section titled “See Also”](#see-also)

[`min`](/reference/functions/min), [`mean`](/reference/functions/mean), [`sum`](/reference/functions/sum)