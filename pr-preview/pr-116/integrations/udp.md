# UDP

The [User Datagram Protocol (UDP)](https://en.wikipedia.org/wiki/User_Datagram_Protocol) is a connection-less protocol to send messages on an IP network. Tenzir supports writing to and reading from UDP sockets, both in server (listening) and client (connect) mode.

![UDP](/pr-preview/pr-116/_astro/udp.BzerWlJj_19DKCs.svg)

Use the IP address `0.0.0.0` to listen on all available network interfaces.

URL Support

The URL scheme `udp://` dispatches to [`load_udp`](/reference/operators/load_udp) and [`save_udp`](/reference/operators/save_udp) for seamless URL-style use via [`from`](/reference/operators/from) and [`to`](/reference/operators/to).

## Examples

[Section titled “Examples”](#examples)

### Accept Syslog messages over UDP

[Section titled “Accept Syslog messages over UDP”](#accept-syslog-messages-over-udp)

```tql
from "udp://127.0.0.1:541", insert_newlines=true {
  read_syslog
}
```

### Send events to a UDP socket

[Section titled “Send events to a UDP socket”](#send-events-to-a-udp-socket)

```tql
from {message: "Tenzir"}
to "udp://1.2.3.4:8080" {
  write_ndjson
}
```