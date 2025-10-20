# load_udp

Loads bytes from a UDP socket.

```tql
load_udp endpoint:str, [connect=bool, insert_newlines=bool]
```

## Description

[Section titled “Description”](#description)

Loads bytes from a UDP socket. The operator defaults to creating a socket in listening mode. Use `connect=true` if the operator should initiate the connection instead.

When you have a socket in listening mode, use `0.0.0.0` to accept connections on all interfaces. The [`nics`](/reference/operators/nics) operator lists all all available interfaces.

### `endpoint: str`

[Section titled “endpoint: str”](#endpoint-str)

The address of the remote endpoint to load bytes from. Must be of the format: `[udp://]host:port`.

### `connect = bool (optional)`

[Section titled “connect = bool (optional)”](#connect--bool-optional)

Connect to `endpoint` instead of listening at it.

Defaults to `false`.

### `insert_newlines = bool (optional)`

[Section titled “insert\_newlines = bool (optional)”](#insert_newlines--bool-optional)

Append a newline character (`\n`) at the end of every datagram.

This option comes in handy in combination with line-based parsers downstream, such as NDJSON.

Defaults to `false`.

## Examples

[Section titled “Examples”](#examples)

### Import JSON via UDP by listenting on localhost

[Section titled “Import JSON via UDP by listenting on localhost”](#import-json-via-udp-by-listenting-on-localhost)

```tql
load_udp "127.0.0.1:56789"
import
```

## See Also

[Section titled “See Also”](#see-also)

[`save_udp`](/reference/operators/save_udp)