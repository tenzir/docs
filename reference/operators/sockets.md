# sockets

Shows a snapshot of open sockets.

```tql
sockets
```

## Description

[Section titled “Description”](#description)

The `sockets` operator shows a snapshot of all currently open sockets.

## Schemas

[Section titled “Schemas”](#schemas)

Tenzir emits socket information with the following schema.

### `tenzir.socket`

[Section titled “tenzir.socket”](#tenzirsocket)

Contains detailed information about the socket.

| Field         | Type     | Description                                        |
| :------------ | :------- | :------------------------------------------------- |
| `pid`         | `uint64` | The process identifier.                            |
| `process`     | `string` | The name of the process involved.                  |
| `protocol`    | `uint64` | The protocol used for the communication.           |
| `local_addr`  | `ip`     | The local IP address involved in the connection.   |
| `local_port`  | `port`   | The local port number involved in the connection.  |
| `remote_addr` | `ip`     | The remote IP address involved in the connection.  |
| `remote_port` | `port`   | The remote port number involved in the connection. |
| `state`       | `string` | The current state of the connection.               |

## Examples

[Section titled “Examples”](#examples)

### Show process ID, local, and remote IP address of all sockets

[Section titled “Show process ID, local, and remote IP address of all sockets”](#show-process-id-local-and-remote-ip-address-of-all-sockets)

```tql
sockets
select pid, local_addr, remote_addr
```

## See Also

[Section titled “See Also”](#see-also)

[`files`](/reference/operators/files), [`processes`](/reference/operators/processes)