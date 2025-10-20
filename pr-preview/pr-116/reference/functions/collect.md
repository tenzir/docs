# collect

Creates a list of all non-null grouped values, preserving duplicates.

```tql
collect(xs:list) -> list
```

## Description

[Section titled “Description”](#description)

The `collect` function returns a list of all non-null values in `xs`, including duplicates.

### `xs: list`

[Section titled “xs: list”](#xs-list)

The values to collect.

## Examples

[Section titled “Examples”](#examples)

### Collect values into a list

[Section titled “Collect values into a list”](#collect-values-into-a-list)

```tql
from {x: 1}, {x: 2}, {x: 2}, {x: 3}
summarize values=collect(x)
```

```tql
{values: [1, 2, 2, 3]}
```

## See Also

[Section titled “See Also”](#see-also)

[`distinct`](/reference/functions/distinct), [`sum`](/reference/functions/sum)