# last

Takes the last non-null grouped value.

```tql
last(xs:list) -> any
```

## Description

[Section titled “Description”](#description)

The `last` function returns the last non-null value in `xs`.

### `xs: list`

[Section titled “xs: list”](#xs-list)

The values to search.

## Examples

[Section titled “Examples”](#examples)

### Get the last non-null value

[Section titled “Get the last non-null value”](#get-the-last-non-null-value)

```tql
from {x: 1}, {x: 2}, {x: null}
summarize last_value=last(x)
```

```tql
{last_value: 2}
```

## See Also

[Section titled “See Also”](#see-also)

[`first`](/reference/functions/first)