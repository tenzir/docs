# subscribe

Subscribes to events from a channel with a topic.

```tql
subscribe [topic:string...]
```

## Description

[Section titled “Description”](#description)

The `subscribe` operator subscribes to events from a channel with the specified topic. Multiple `subscribe` operators with the same topic receive the same events.

Subscribers propagate back pressure to publishers. If a subscribing pipeline fails to keep up, all publishers will slow down as well to a matching speed to avoid data loss. This mechanism is disabled for pipelines that are not visible on the overview page on [app.tenzir.com](https://app.tenzir.com), which drop data rather than slow down their publishers.

### `topic: string... (optional)`

[Section titled “topic: string... (optional)”](#topic-string-optional)

Optional channel names to subscribe to. If unspecified, the operator subscribes to the topic `main`.

## Examples

[Section titled “Examples”](#examples)

### Subscribe to the events under a topic

[Section titled “Subscribe to the events under a topic”](#subscribe-to-the-events-under-a-topic)

```tql
subscribe "zeek-conn"
```

### Subscribe to the multiple topics

[Section titled “Subscribe to the multiple topics”](#subscribe-to-the-multiple-topics)

```tql
subscribe "alerts", "notices", "critical"
```

## See Also

[Section titled “See Also”](#see-also)

[`export`](/reference/operators/export), [`publish`](/reference/operators/publish)