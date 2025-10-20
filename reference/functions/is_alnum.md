# is_alnum

Checks if a string is alphanumeric.

```tql
is_alnum(x:string) -> bool
```

## Description

[Section titled “Description”](#description)

The `is_alnum` function returns `true` if `x` contains only alphanumeric characters and `false` otherwise.

## Examples

[Section titled “Examples”](#examples)

### Check if a string is alphanumeric

[Section titled “Check if a string is alphanumeric”](#check-if-a-string-is-alphanumeric)

```tql
from {x: "hello123".is_alnum()}
```

```tql
{x: true}
```

## See Also

[Section titled “See Also”](#see-also)

[`is_alpha`](/reference/functions/is_alpha), [`is_numeric`](/reference/functions/is_numeric), [`is_printable`](/reference/functions/is_printable)