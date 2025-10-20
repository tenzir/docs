# is_v4

Checks whether an IP address has version number 4.

```tql
is_v4(x:ip) -> bool
```

## Description

[Section titled “Description”](#description)

The `ipv4` function checks whether the version number of a given IP address `x` is 4.

## Examples

[Section titled “Examples”](#examples)

### Check if an IP is IPv4

[Section titled “Check if an IP is IPv4”](#check-if-an-ip-is-ipv4)

```tql
from {
  x: 1.2.3.4.is_v4(),
  y: ::1.is_v4(),
}
```

```tql
{
  x: true,
  y: false,
}
```

## See Also

[Section titled “See Also”](#see-also)

[`is_v6`](/reference/functions/is_v6), [`is_multicast`](/reference/functions/is_multicast), [`is_loopback`](/reference/functions/is_loopback), [`is_private`](/reference/functions/is_private), [`is_global`](/reference/functions/is_global), [`is_link_local`](/reference/functions/is_link_local), [`ip_category`](/reference/functions/ip_category)