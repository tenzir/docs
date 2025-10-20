# ends_with

Checks if a string ends with a specified substring.

```tql
ends_with(x:string, suffix:string) -> bool
```

## Description

[Section titled “Description”](#description)

The `ends_with` function returns `true` if `x` ends with `suffix` and `false` otherwise.

## Examples

[Section titled “Examples”](#examples)

### Check if a string ends with a substring

[Section titled “Check if a string ends with a substring”](#check-if-a-string-ends-with-a-substring)

```tql
from {x: "hello".ends_with("lo")}
```

```tql
{x: true}
```

## See Also

[Section titled “See Also”](#see-also)

[`starts_with`](/reference/functions/starts_with)