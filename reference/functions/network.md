# network

Retrieves the network address of a subnet.

```tql
network(x:subnet) -> ip
```

## Description

[Section titled “Description”](#description)

The `network` function returns the network address of a subnet.

## Examples

[Section titled “Examples”](#examples)

### Get the network address of a subnet

[Section titled “Get the network address of a subnet”](#get-the-network-address-of-a-subnet)

```tql
from {subnet: 192.168.0.0/16}
select ip = subnet.network()
```

```tql
{ip: 192.168.0.0}
```