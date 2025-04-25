---
title: capitalize
---

Capitalizes the first character of a string.

```tql
capitalize(x:string) -> string
```

## Description

The `capitalize` function returns the input string with the first character
converted to uppercase and the rest to lowercase.

## Examples

### Capitalize a lowercase string

```tql
from {x: "hello world".capitalize()}
```

```tql
{x: "Hello world"}
```

## See Also

[`to_upper`](to_upper), [`to_lower`](to_lower), [`to_title`](to_title)
