# count_if

Counts the events or non-null grouped values matching a given predicate.

```tql
count_if(xs:list, predicate:any -> bool) -> int
```

## Description

[Section titled “Description”](#description)

The `count_if` function returns the number of non-null values in `xs` that satisfy the given `predicate`.

### `xs: list`

[Section titled “xs: list”](#xs-list)

The values to count.

### `predicate: any -> bool`

[Section titled “predicate: any -> bool”](#predicate-any---bool)

The predicate to apply to each value to check whether it should be counted.

## Examples

[Section titled “Examples”](#examples)

### Count the number of values greater than 1

[Section titled “Count the number of values greater than 1”](#count-the-number-of-values-greater-than-1)

```tql
from {x: 1}, {x: null}, {x: 2}
summarize total=x.count_if(x => x > 1)
```

```tql
{total: 1}
```

## See Also

[Section titled “See Also”](#see-also)

[`count`](/reference/functions/count)