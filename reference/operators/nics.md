# nics

Shows a snapshot of available network interfaces.

```tql
nics
```

## Description

[Section titled “Description”](#description)

The `nics` operator shows a snapshot of all available network interfaces.

## Schemas

[Section titled “Schemas”](#schemas)

Tenzir emits network interface card information with the following schema.

### `tenzir.nic`

[Section titled “tenzir.nic”](#tenzirnic)

Contains detailed information about the network interface.

| Field         | Type     | Description                                                                  |
| :------------ | :------- | :--------------------------------------------------------------------------- |
| `name`        | `string` | The name of the network interface.                                           |
| `description` | `string` | A brief note or explanation about the network interface.                     |
| `addresses`   | `list`   | A list of IP addresses assigned to the network interface.                    |
| `loopback`    | `bool`   | Indicates if the network interface is a loopback interface.                  |
| `up`          | `bool`   | Indicates if the network interface is up and can transmit data.              |
| `running`     | `bool`   | Indicates if the network interface is running and operational.               |
| `wireless`    | `bool`   | Indicates if the network interface is a wireless interface.                  |
| `status`      | `record` | A record containing detailed status information about the network interface. |

The record `status` has the following schema:

| Field            | Type   | Description                                           |
| :--------------- | :----- | :---------------------------------------------------- |
| `unknown`        | `bool` | Indicates if the network interface status is unknown. |
| `connected`      | `bool` | Indicates if the network interface is connected.      |
| `disconnected`   | `bool` | Indicates if the network interface is disconnected.   |
| `not_applicable` | `bool` | Indicates if the network interface is not applicable. |

## Examples

[Section titled “Examples”](#examples)

### List all connected network interfaces

[Section titled “List all connected network interfaces”](#list-all-connected-network-interfaces)

```tql
nics
where status.connected
```

## See Also

[Section titled “See Also”](#see-also)

[`load_nic`](/reference/operators/load_nic)