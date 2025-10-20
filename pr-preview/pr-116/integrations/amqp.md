# AMQP

The [Advanced Message Queuing Protocol (AMQP)](https://www.amqp.org/) is an open standard application layer protocol for message-oriented middleware.

The diagram below shows the key abstractions and how they relate to a pipeline:

![AMQP Diagram](/pr-preview/pr-116/_astro/amqp.B-TDw5B5_19DKCs.svg)

Tenzir supports sending and receiving messages via AMQP version 0-9-1.

URL Support

The URL scheme `amqp://` dispatches to [`load_amqp`](/reference/operators/load_amqp) and [`save_amqp`](/reference/operators/save_amqp) for seamless URL-style use via [`from`](/reference/operators/from) and [`to`](/reference/operators/to).

## Examples

[Section titled “Examples”](#examples)

### Send events to an AMQP exchange

[Section titled “Send events to an AMQP exchange”](#send-events-to-an-amqp-exchange)

```tql
from {
  x: 42,
  y: "foo",
}
to "amqp://admin:pass@0.0.0.1:5672/vhost"
```

### Receive events from an AMQP queue

[Section titled “Receive events from an AMQP queue”](#receive-events-from-an-amqp-queue)

```tql
from "amqp://admin:pass@0.0.0.1:5672/vhost"
```