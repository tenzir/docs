# all

Computes the conjunction (AND) of all grouped boolean values.

```tql
all(xs:list) -> bool
```

## Description

[Section titled “Description”](#description)

The `all` function returns `true` if all values in `xs` are `true` and `false` otherwise.

### `xs: list`

[Section titled “xs: list”](#xs-list)

A list of boolean values.

## Examples

[Section titled “Examples”](#examples)

### Check if all values are true

[Section titled “Check if all values are true”](#check-if-all-values-are-true)

```tql
from {x: true}, {x: true}, {x: false}
summarize result=all(x)
```

```tql
{result: false}
```

## See Also

[Section titled “See Also”](#see-also)

[`any`](/reference/functions/any)