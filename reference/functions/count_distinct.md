# count_distinct

Counts all distinct non-null grouped values.

```tql
count_distinct(xs:list) -> int
```

## Description

[Section titled “Description”](#description)

The `count_distinct` function returns the number of unique, non-null values in `xs`.

### `xs: list`

[Section titled “xs: list”](#xs-list)

The values to count.

## Examples

[Section titled “Examples”](#examples)

### Count distinct values

[Section titled “Count distinct values”](#count-distinct-values)

```tql
from {x: 1}, {x: 2}, {x: 2}, {x: 3}
summarize unique=count_distinct(x)
```

```tql
{unique: 3}
```

## See Also

[Section titled “See Also”](#see-also)

[`count`](/reference/functions/count), [`distinct`](/reference/functions/distinct)