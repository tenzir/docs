# save_zmq

Sends bytes as ZeroMQ messages.

```tql
save_zmq [endpoint:str, listen=bool, connect=bool, monitor=bool]
```

## Description

[Section titled “Description”](#description)

The `save_zmq` operator sends bytes as a ZeroMQ message via a `PUB` socket.

Indpendent of the socket type, the `save_zmq` operator supports specfiying the direction of connection establishment with `listen` and `connect`. This can be helpful to work around firewall restrictions and fit into broader set of existing ZeroMQ applications.

With the `monitor` option, you can activate message buffering for TCP sockets that hold off sending messages until *at least one* remote peer has connected. This can be helpful when you want to delay publishing until you have one connected subscriber, e.g., when the publisher spawns before any subscriber exists.

### `endpoint: str (optional)`

[Section titled “endpoint: str (optional)”](#endpoint-str-optional)

The endpoint for connecting to or listening on a ZeroMQ socket.

Defaults to `tcp://127.0.0.1:5555`.

### `listen = bool (optional)`

[Section titled “listen = bool (optional)”](#listen--bool-optional)

Bind to the ZeroMQ socket.

Defaults to `true`.

### `connect = bool (optional)`

[Section titled “connect = bool (optional)”](#connect--bool-optional)

Connect to the ZeroMQ socket.

Defaults to `false`.

### `monitor = bool (optional)`

[Section titled “monitor = bool (optional)”](#monitor--bool-optional)

Monitors a 0mq socket over TCP until the remote side establishes a connection.

## Examples

[Section titled “Examples”](#examples)

### Publish events by connecting to a PUB socket

[Section titled “Publish events by connecting to a PUB socket”](#publish-events-by-connecting-to-a-pub-socket)

```tql
from {x: 42}
write_csv
save_zmq connect=true
```

## See Also

[Section titled “See Also”](#see-also)

[`load_zmq`](/reference/operators/load_zmq)