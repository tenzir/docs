# string

Casts an expression to a string.

```tql
string(x:any) -> string
```

## Description

[Section titled “Description”](#description)

The `string` function casts the given value `x` to a string.

## Examples

[Section titled “Examples”](#examples)

### Cast an IP address to a string

[Section titled “Cast an IP address to a string”](#cast-an-ip-address-to-a-string)

```tql
from {x: string(1.2.3.4)}
```

```tql
{x: "1.2.3.4"}
```

## See Also

[Section titled “See Also”](#see-also)

[`ip`](/reference/functions/ip), [`subnet`](/reference/functions/subnet), [`time`](/reference/functions/time), [`uint`](/reference/functions/uint), [float](/reference/functions/float), [int](/reference/functions/int)