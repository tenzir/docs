# publish

Publishes events to a channel with a topic.

```tql
publish [topic:string]
```

## Description

[Section titled “Description”](#description)

The `publish` operator publishes events at a node in a channel with the specified topic. All [`subscribers`](/reference/operators/subscribe) of the channel operator receive the events immediately.

Note

The `publish` operator does not guarantee that events stay in their original order.

### `topic: string (optional)`

[Section titled “topic: string (optional)”](#topic-string-optional)

An optional topic for publishing events under. If unspecified, the operator publishes events to the topic `main`.

## Examples

[Section titled “Examples”](#examples)

### Publish Zeek connection logs under the fixed topic `zeek`

[Section titled “Publish Zeek connection logs under the fixed topic zeek”](#publish-zeek-connection-logs-under-the-fixed-topic-zeek)

```tql
from "conn.log.gz" {
  decompress_gzip
  read_zeek_tsv
}
publish "zeek"
```

### Publish Suricata events under a dynamic topic depending on their event type

[Section titled “Publish Suricata events under a dynamic topic depending on their event type”](#publish-suricata-events-under-a-dynamic-topic-depending-on-their-event-type)

```tql
from "eve.json" {
  read_suricata
}
publish f"suricata.{event_type}"
```

## See Also

[Section titled “See Also”](#see-also)

[`import`](/reference/operators/import), [`subscribe`](/reference/operators/subscribe)