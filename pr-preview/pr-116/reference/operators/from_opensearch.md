# from_opensearch

Receives events via Opensearch Bulk API.

```tql
from_opensearch [url:string, keep_actions=bool, max_request_size=int, tls=bool,
                 certfile=string, keyfile=string, password=string]
```

## Description

[Section titled “Description”](#description)

The `from_opensearch` operator emulates simple situations for the [Opensearch Bulk API](https://opensearch.org/docs/latest/api-reference/document-apis/bulk/).

### `url: string (optional)`

[Section titled “url: string (optional)”](#url-string-optional)

URL to listen on.

Must have the form `host[:port]`.

Defaults to `"0.0.0.0:9200"`.

### `keep_actions = bool (optional)`

[Section titled “keep\_actions = bool (optional)”](#keep_actions--bool-optional)

Whether to keep the command objects such as `{"create": ...}`.

Defaults to `false`.

### `max_request_size = int (optional)`

[Section titled “max\_request\_size = int (optional)”](#max_request_size--int-optional)

The maximum size of an incoming request to accept.

Defaults to `10Mib`.

### `tls = bool (optional)`

[Section titled “tls = bool (optional)”](#tls--bool-optional)

Enables TLS.

Defaults to `false`.

### `certfile = string (optional)`

[Section titled “certfile = string (optional)”](#certfile--string-optional)

Path to the client certificate. Required if `tls` is `true`.

### `keyfile = string (optional)`

[Section titled “keyfile = string (optional)”](#keyfile--string-optional)

Path to the key for the client certificate. Required if `tls` is `true`.

### `password = string (optional)`

[Section titled “password = string (optional)”](#password--string-optional)

Password for keyfile.

## Examples

[Section titled “Examples”](#examples)

### Listen on port 8080 on an interface with IP 1.2.3.4

[Section titled “Listen on port 8080 on an interface with IP 1.2.3.4”](#listen-on-port-8080-on-an-interface-with-ip-1234)

```tql
from_opensearch "1.2.3.4:8080"
```

### Listen with TLS

[Section titled “Listen with TLS”](#listen-with-tls)

```tql
from_opensearch tls=true, certfile="server.crt", keyfile="private.key"
```

## See also

[Section titled “See also”](#see-also)

[`to_opensearch`](/reference/operators/to_opensearch)