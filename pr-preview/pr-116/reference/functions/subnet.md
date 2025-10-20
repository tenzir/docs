# subnet

Casts an expression to a subnet value.

```tql
subnet(x:string) -> subnet
```

## Description

[Section titled “Description”](#description)

The `subnet` function casts an expression to a subnet.

### `x: string`

[Section titled “x: string”](#x-string)

The string expression to cast.

## Examples

[Section titled “Examples”](#examples)

### Cast a string to a subnet

[Section titled “Cast a string to a subnet”](#cast-a-string-to-a-subnet)

```tql
from {x: subnet("1.2.3.4/16")}
```

```tql
{x: 1.2.0.0/16}
```

## See Also

[Section titled “See Also”](#see-also)

[`int`](/reference/functions/int), [`ip`](/reference/functions/ip), [`is_v4`](/reference/functions/is_v4), [`is_v6`](/reference/functions/is_v6), [`is_multicast`](/reference/functions/is_multicast), [`is_loopback`](/reference/functions/is_loopback), [`is_private`](/reference/functions/is_private), [`is_global`](/reference/functions/is_global), [`is_link_local`](/reference/functions/is_link_local), [`ip_category`](/reference/functions/ip_category), [`time`](/reference/functions/time), [`uint`](/reference/functions/uint), [float](/reference/functions/float), [string](/reference/functions/string)