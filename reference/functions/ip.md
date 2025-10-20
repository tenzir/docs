# ip

Casts an expression to an IP address.

```tql
ip(x:string) -> ip
```

## Description

[Section titled “Description”](#description)

The `ip` function casts the provided string `x` to an IP address.

## Examples

[Section titled “Examples”](#examples)

### Cast a string to an IP address

[Section titled “Cast a string to an IP address”](#cast-a-string-to-an-ip-address)

```tql
from {x: ip("1.2.3.4")}
```

```tql
{x: 1.2.3.4}
```

## See Also

[Section titled “See Also”](#see-also)

[`subnet`](/reference/functions/subnet), [`is_v4`](/reference/functions/is_v4), [`is_v6`](/reference/functions/is_v6), [`is_multicast`](/reference/functions/is_multicast), [`is_loopback`](/reference/functions/is_loopback), [`is_private`](/reference/functions/is_private), [`is_global`](/reference/functions/is_global), [`is_link_local`](/reference/functions/is_link_local), [`ip_category`](/reference/functions/ip_category), [`time`](/reference/functions/time), [`uint`](/reference/functions/uint), [float](/reference/functions/float), [int](/reference/functions/int), [string](/reference/functions/string)