# is_printable

Checks if a string contains only printable characters.

```tql
is_printable(x:string) -> bool
```

## Description

[Section titled “Description”](#description)

The `is_printable` function returns `true` if `x` contains only printable characters and `false` otherwise.

## Examples

[Section titled “Examples”](#examples)

### Check if a string is printable

[Section titled “Check if a string is printable”](#check-if-a-string-is-printable)

```tql
from {x: "hello".is_printable()}
```

```tql
{x: true}
```

## See Also

[Section titled “See Also”](#see-also)

[`is_alnum`](/reference/functions/is_alnum), [`is_alpha`](/reference/functions/is_alpha)