# count

Counts the events or non-null grouped values.

```tql
count(xs:list) -> int
```

## Description

[Section titled “Description”](#description)

The `count` function returns the number of non-null values in `xs`. When used without arguments, it counts the total number of events.

### `xs: list`

[Section titled “xs: list”](#xs-list)

The values to count.

## Examples

[Section titled “Examples”](#examples)

### Count the number of non-null values

[Section titled “Count the number of non-null values”](#count-the-number-of-non-null-values)

```tql
from {x: 1}, {x: null}, {x: 2}
summarize total=count(x)
```

```tql
{total: 2}
```

## See Also

[Section titled “See Also”](#see-also)

[`count_distinct`](/reference/functions/count_distinct)