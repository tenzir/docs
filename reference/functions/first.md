# first

Takes the first non-null grouped value.

```tql
first(xs:list) -> any
```

## Description

[Section titled “Description”](#description)

The `first` function returns the first non-null value in `xs`.

### `xs: list`

[Section titled “xs: list”](#xs-list)

The values to search.

## Examples

[Section titled “Examples”](#examples)

### Get the first non-null value

[Section titled “Get the first non-null value”](#get-the-first-non-null-value)

```tql
from {x: null}, {x: 2}, {x: 3}
summarize first_value=first(x)
```

```tql
{first_value: 2}
```

## See Also

[Section titled “See Also”](#see-also)

[`last`](/reference/functions/last)