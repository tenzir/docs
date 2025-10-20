# any

Computes the disjunction (OR) of all grouped boolean values.

```tql
any(xs:list) -> bool
```

## Description

[Section titled “Description”](#description)

The `any` function returns `true` if any value in `xs` is `true` and `false` otherwise.

### `xs: list`

[Section titled “xs: list”](#xs-list)

A list of boolean values.

## Examples

[Section titled “Examples”](#examples)

### Check if any value is true

[Section titled “Check if any value is true”](#check-if-any-value-is-true)

```tql
from {x: false}, {x: false}, {x: true}
summarize result=any(x)
```

```tql
{result: true}
```

## See Also

[Section titled “See Also”](#see-also)

[`all`](/reference/functions/all)