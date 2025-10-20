# to_lower

Converts a string to lowercase.

```tql
to_lower(x:string) -> string
```

## Description

[Section titled “Description”](#description)

The `to_lower` function converts all characters in `x` to lowercase.

## Examples

[Section titled “Examples”](#examples)

### Convert a string to lowercase

[Section titled “Convert a string to lowercase”](#convert-a-string-to-lowercase)

```tql
from {x: "HELLO".to_lower()}
```

```tql
{x: "hello"}
```

## See Also

[Section titled “See Also”](#see-also)

[`capitalize`](/reference/functions/capitalize), [`is_lower`](/reference/functions/is_lower), [`to_title`](/reference/functions/to_title), [`to_upper`](/reference/functions/to_upper)