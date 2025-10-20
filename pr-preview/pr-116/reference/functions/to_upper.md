# to_upper

Converts a string to uppercase.

```tql
to_upper(x:string) -> string
```

## Description

[Section titled “Description”](#description)

The `to_upper` function converts all characters in `x` to uppercase.

## Examples

[Section titled “Examples”](#examples)

### Convert a string to uppercase

[Section titled “Convert a string to uppercase”](#convert-a-string-to-uppercase)

```tql
from {x: "hello".to_upper()}
```

```tql
{x: "HELLO"}
```

## See Also

[Section titled “See Also”](#see-also)

[`capitalize`](/reference/functions/capitalize), [`is_upper`](/reference/functions/is_upper), [`to_lower`](/reference/functions/to_lower), [`to_title`](/reference/functions/to_title)