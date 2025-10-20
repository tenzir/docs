# starts_with

Checks if a string starts with a specified substring.

```tql
starts_with(x:string, prefix:string) -> bool
```

## Description

[Section titled “Description”](#description)

The `starts_with` function returns `true` if `x` starts with `prefix` and `false` otherwise.

## Examples

[Section titled “Examples”](#examples)

### Check if a string starts with a substring

[Section titled “Check if a string starts with a substring”](#check-if-a-string-starts-with-a-substring)

```tql
from {x: "hello".starts_with("he")}
```

```tql
{x: true}
```

## See Also

[Section titled “See Also”](#see-also)

[`ends_with`](/reference/functions/ends_with)