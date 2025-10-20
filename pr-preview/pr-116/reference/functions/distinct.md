# distinct

Creates a sorted list without duplicates of non-null grouped values.

```tql
distinct(xs:list) -> list
```

## Description

[Section titled “Description”](#description)

The `distinct` function returns a sorted list containing unique, non-null values in `xs`.

### `xs: list`

[Section titled “xs: list”](#xs-list)

The values to deduplicate.

## Examples

[Section titled “Examples”](#examples)

### Get distinct values in a list

[Section titled “Get distinct values in a list”](#get-distinct-values-in-a-list)

```tql
from {x: 1}, {x: 2}, {x: 2}, {x: 3}
summarize unique=distinct(x)
```

```tql
{unique: [1, 2, 3]}
```

## See Also

[Section titled “See Also”](#see-also)

[`collect`](/reference/functions/collect), [`count_distinct`](/reference/functions/count_distinct), [`value_counts`](/reference/functions/value_counts)