# save_tcp

Saves bytes to a TCP or TLS connection.

```tql
save_tcp endpoint:string, [retry_delay=duration, max_retry_count=int,
                           tls=bool, cacert=string, certifle=string,
                           keyfile=string, skip_peer_verification=bool]
```

## Description

[Section titled “Description”](#description)

Saves bytes to the given endpoint via TCP or TLS. Attempts to reconnect automatically for `max_retry_count` in case of recoverable connection errors.

Note

Due to the nature of TCP a disconnect can still lead to lost and or incomplete events on the receiving end.

### `endpoint: string`

[Section titled “endpoint: string”](#endpoint-string)

The endpoint to which the server will connect. Must be of the form `[tcp://]<hostname>:<port>`. You can also use an IANA service name instead of a numeric port.

### `retry_delay = duration (optional)`

[Section titled “retry\_delay = duration (optional)”](#retry_delay--duration-optional)

The amount of time to wait before attempting to reconnect in case a connection attempt fails and the error is deemed recoverable. Defaults to `30s`.

### \`max\_retry\_count = int (optional)

[Section titled “\`max\_retry\_count = int (optional)”](#max_retry_count--int-optional)

The number of retries to attempt in case of connection errors before transitioning into the error state. Defaults to `10`.

### `tls = bool (optional)`

Enables TLS.

Defaults to `false`.

### `cacert = string (optional)`

Path to the CA certificate used to verify the server’s certificate.

Defaults to the Tenzir configuration value `tenzir.cacert`, which in turn defaults to a common cacert location for the system.

### `certfile = string (optional)`

Path to the client certificate.

### `keyfile = string (optional)`

Path to the key for the client certificate.

### `skip_peer_verification = bool (optional)`

Toggles TLS certificate verification.

Defaults to `false`.

## Examples

[Section titled “Examples”](#examples)

### Transform incoming Syslog to BITZ and save over TCP

[Section titled “Transform incoming Syslog to BITZ and save over TCP”](#transform-incoming-syslog-to-bitz-and-save-over-tcp)

```tql
load_tcp "0.0.0.0:8090" { read_syslog }
write_bitz
save_tcp "127.0.0.1:4000"
```

### Save to localhost with TLS

[Section titled “Save to localhost with TLS”](#save-to-localhost-with-tls)

```tql
subscribe "feed"
write_json
save_tcp "127.0.0.1:4000", tls=true, skip_peer_verification=true
```