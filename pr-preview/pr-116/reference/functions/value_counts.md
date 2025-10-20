# value_counts

Returns a list of all grouped values alongside their frequency.

```tql
value_counts(xs:list) -> list
```

## Description

[Section titled “Description”](#description)

The `value_counts` function returns a list of all unique non-null values in `xs` alongside their occurrence count.

### `xs: list`

[Section titled “xs: list”](#xs-list)

The values to evaluate.

## Examples

[Section titled “Examples”](#examples)

### Get value counts

[Section titled “Get value counts”](#get-value-counts)

```tql
from {x: 1}, {x: 2}, {x: 2}, {x: 3}
summarize counts=value_counts(x)
```

```tql
{counts: [{value: 1, count: 1}, {value: 2, count: 2}, {value: 3, count: 1}]}
```

## See Also

[Section titled “See Also”](#see-also)

[`mode`](/reference/functions/mode), [`distinct`](/reference/functions/distinct)