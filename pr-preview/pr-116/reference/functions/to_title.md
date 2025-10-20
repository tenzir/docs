# to_title

Converts a string to title case.

```tql
to_title(x:string) -> string
```

## Description

[Section titled “Description”](#description)

The `to_title` function converts all words in `x` to title case.

## Examples

[Section titled “Examples”](#examples)

### Convert a string to title case

[Section titled “Convert a string to title case”](#convert-a-string-to-title-case)

```tql
from {x: "hello world".to_title()}
```

```tql
{x: "Hello World"}
```

## See Also

[Section titled “See Also”](#see-also)

[`capitalize`](/reference/functions/capitalize), [`is_title`](/reference/functions/is_title), [`to_lower`](/reference/functions/to_lower), [`to_upper`](/reference/functions/to_upper)