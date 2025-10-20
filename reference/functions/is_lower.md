# is_lower

Checks if a string is in lowercase.

```tql
is_lower(x:string) -> bool
```

## Description

[Section titled “Description”](#description)

The `is_lower` function returns `true` if `x` is entirely in lowercase and `false` otherwise.

## Examples

[Section titled “Examples”](#examples)

### Check if a string is lowercase

[Section titled “Check if a string is lowercase”](#check-if-a-string-is-lowercase)

```tql
from {x: "hello".is_lower()}
```

```tql
{x: true}
```

## See Also

[Section titled “See Also”](#see-also)

[`is_alpha`](/reference/functions/is_alpha), [`is_upper`](/reference/functions/is_upper), [`to_lower`](/reference/functions/to_lower)