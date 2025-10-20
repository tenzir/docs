# is_alpha

Checks if a string contains only alphabetic characters.

```tql
is_alpha(x:string) -> bool
```

## Description

[Section titled “Description”](#description)

The `is_alpha` function returns `true` if `x` contains only alphabetic characters and `false` otherwise.

## Examples

[Section titled “Examples”](#examples)

### Check if a string is alphabetic

[Section titled “Check if a string is alphabetic”](#check-if-a-string-is-alphabetic)

```tql
from {x: "hello".is_alpha()}
```

```tql
{x: true}
```

## See Also

[Section titled “See Also”](#see-also)

[`is_alnum`](/reference/functions/is_alnum), [`is_lower`](/reference/functions/is_lower), [`is_numeric`](/reference/functions/is_numeric), [`is_printable`](/reference/functions/is_printable), [`is_upper`](/reference/functions/is_upper)