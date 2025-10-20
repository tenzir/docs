# Kafka

[Apache Kafka](https://kafka.apache.org) is a distributed open-source message broker. The Tenzir integration can publish (send messages to a topic) or subscribe (receive) messages from a topic.

![Kafka Diagram](/_astro/kafka.C4MFfO6p_19DKCs.svg)

Internally, we use Confluent’s official [librdkafka](https://github.com/confluentinc/librdkafka) library, which gives us full control in passing options.

URL Support

The URL scheme `kafka://` dispatches to [`load_kafka`](/reference/operators/load_kafka) and [`save_kafka`](/reference/operators/save_kafka) for seamless URL-style use via [`from`](/reference/operators/from) and [`to`](/reference/operators/to).

## Examples

[Section titled “Examples”](#examples)

### Send events to a Kafka topic

[Section titled “Send events to a Kafka topic”](#send-events-to-a-kafka-topic)

```tql
from {
  x: 42,
  y: "foo",
}
to "kafka://topic" {
  write_ndjson
}
```

### Subscribe to a topic

[Section titled “Subscribe to a topic”](#subscribe-to-a-topic)

The `offset` option controls where to start reading:

```tql
from "kafka://topic", offset="beginning" {
  read_ndjson
}
```

Other values are `"end"` to read at the last offset, `"stored"` to read at the stored offset, a positive integer representing an absolute offset, or a negative integer representing a relative offset counting from the end.