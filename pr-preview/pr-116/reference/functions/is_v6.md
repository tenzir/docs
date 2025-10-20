# is_v6

Checks whether an IP address has version number 6.

```tql
is_v6(x:ip) -> bool
```

## Description

[Section titled “Description”](#description)

The `is_v6` function checks whether the version number of a given IP address `x` is 6.

## Examples

[Section titled “Examples”](#examples)

### Check if an IP is IPv6

[Section titled “Check if an IP is IPv6”](#check-if-an-ip-is-ipv6)

```tql
from {
  x: 1.2.3.4.is_v6(),
  y: ::1.is_v6(),
}
```

```tql
{
  x: false,
  y: true,
}
```

## See Also

[Section titled “See Also”](#see-also)

[`is_v4`](/reference/functions/is_v4), [`is_multicast`](/reference/functions/is_multicast), [`is_loopback`](/reference/functions/is_loopback), [`is_private`](/reference/functions/is_private), [`is_global`](/reference/functions/is_global), [`is_link_local`](/reference/functions/is_link_local), [`ip_category`](/reference/functions/ip_category)