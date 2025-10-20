# is_title

Checks if a string follows title case.

```tql
is_title(x:string) -> bool
```

## Description

[Section titled “Description”](#description)

The `is_title` function returns `true` if `x` is in title case and `false` otherwise.

## Examples

[Section titled “Examples”](#examples)

### Check if a string is in title case

[Section titled “Check if a string is in title case”](#check-if-a-string-is-in-title-case)

```tql
from {x: "Hello World".is_title()}
```

```tql
{x: true}
```

## See Also

[Section titled “See Also”](#see-also)

[`to_title`](/reference/functions/to_title)