# is_numeric

Checks if a string contains only numeric characters.

```tql
is_numeric(x:string) -> bool
```

## Description

[Section titled “Description”](#description)

The `is_numeric` function returns `true` if `x` contains only numeric characters and `false` otherwise.

## Examples

[Section titled “Examples”](#examples)

### Check if a string is numeric

[Section titled “Check if a string is numeric”](#check-if-a-string-is-numeric)

```tql
from {x: "1234".is_numeric()}
```

```tql
{x: true}
```

## See Also

[Section titled “See Also”](#see-also)

[`is_alpha`](/reference/functions/is_alpha), [`is_alnum`](/reference/functions/is_alnum)