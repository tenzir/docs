# capitalize

Capitalizes the first character of a string.

```tql
capitalize(x:string) -> string
```

## Description

[Section titled “Description”](#description)

The `capitalize` function returns the input string with the first character converted to uppercase and the rest to lowercase.

## Examples

[Section titled “Examples”](#examples)

### Capitalize a lowercase string

[Section titled “Capitalize a lowercase string”](#capitalize-a-lowercase-string)

```tql
from {x: "hello world".capitalize()}
```

```tql
{x: "Hello world"}
```

## See Also

[Section titled “See Also”](#see-also)

[`to_upper`](/reference/functions/to_upper), [`to_lower`](/reference/functions/to_lower), [`to_title`](/reference/functions/to_title)