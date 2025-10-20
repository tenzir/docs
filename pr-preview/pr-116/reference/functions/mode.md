# mode

Takes the most common non-null grouped value.

```tql
mode(xs:list) -> any
```

## Description

[Section titled “Description”](#description)

The `mode` function returns the most frequently occurring non-null value in `xs`.

### `xs: list`

[Section titled “xs: list”](#xs-list)

The values to evaluate.

## Examples

[Section titled “Examples”](#examples)

### Find the mode of values

[Section titled “Find the mode of values”](#find-the-mode-of-values)

```tql
from {x: 1}, {x: 1}, {x: 2}, {x: 3}
summarize mode_value=mode(x)
```

```tql
{mode_value: 1}
```

## See Also

[Section titled “See Also”](#see-also)

[`median`](/reference/functions/median), [`value_counts`](/reference/functions/value_counts)