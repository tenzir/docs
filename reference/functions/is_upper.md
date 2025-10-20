# is_upper

Checks if a string is in uppercase.

```tql
is_upper(x:string) -> bool
```

## Description

[Section titled “Description”](#description)

The `is_upper` function returns `true` if `x` is entirely in uppercase; otherwise, it returns `false`.

## Examples

[Section titled “Examples”](#examples)

### Check if a string is uppercase

[Section titled “Check if a string is uppercase”](#check-if-a-string-is-uppercase)

```tql
from {x: "HELLO".is_upper()}
```

```tql
{x: true}
```

## See Also

[Section titled “See Also”](#see-also)

[`is_alpha`](/reference/functions/is_alpha), [`is_lower`](/reference/functions/is_lower), [`to_upper`](/reference/functions/to_upper)