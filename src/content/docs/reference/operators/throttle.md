---
title: throttle
category: Flow Control
example: 'throttle rate=1000'
---

Limits the throughput of events in a pipeline.

```tql
throttle rate=int, [window=duration, weight=int, drop]
```

## Description

The `throttle` operator controls the data rate of a pipeline by limiting
throughput to a maximum rate. By default, it limits the number of events per
second. With a custom `weight` expression, it can limit based on bytes or other
metrics.

This operator is useful for:

- Preventing downstream systems from being overwhelmed
- Controlling costs when sending data to metered endpoints
- Testing pipeline behavior under rate-limited conditions
- Smoothing bursty traffic patterns

When the rate limit is exceeded, the operator pauses the pipeline until the
next window begins. If `drop` is specified, excess events are dropped instead.

### `rate = int`

The maximum rate per window.

By default (when `weight=1`), this represents events per window. When `weight`
is a custom expression, this represents the maximum sum of weight values per
window.

Supports standard numeric suffixes like `K`, `M`, `G` for thousands, millions,
and billions, or `Ki`, `Mi`, `Gi` for kibibytes, mebibytes, and gibibytes when
measuring bytes.

### `window = duration (optional)`

The time window over which the rate is measured.

Smaller windows react faster to traffic bursts but may be less smooth. Larger
windows provide smoother rate limiting but take longer to adapt to changes.

Defaults to `1s`.

### `weight = int (optional)`

An expression that evaluates to a weight value for each event.

Defaults to `1`, which counts events. Use a custom expression to limit based on
bytes or other metrics. The expression is evaluated for each event. For example:

- `this.print_ndjson().length()` - Serialize event to NDJSON and get byte length
- `this.size` - Use a pre-computed size field
- `this.payload.length()` - Compute size from a payload field
- `1024` - Assume a fixed size per event

### `drop (optional)`

Drop events that exceed the rate limit instead of pausing the pipeline.

## Examples

### Limit to 1,000 events per second

Limit the number of events processed:

```tql
from "https://api.example.com/events" { read_json }
throttle rate=1000
```

### Limit to 100 events over a 5-second window

Use a larger window for smoother rate limiting:

```tql
from "kafka://events"
throttle rate=100, window=5s
```

### Limit JSON API responses to 10 MiB/s

Limit throughput based on the serialized size of events:

```tql
from "https://api.example.com/events" { read_json }
throttle rate=10Mi, weight=this.print_ndjson().length()
to "output.json"
```

### Throttle network traffic using payload size

Use the payload field size for byte-based rate limiting:

```tql
from "network-capture.pcap" { read_pcap }
throttle rate=100Mi, weight=this.payload_length, window=5s
```

### Fixed-size event rate limiting

Assume each event is 512 bytes and limit to 1 MiB/s:

```tql
from "input.json" { read_json }
throttle rate=1Mi, weight=512
```

### Drop events instead of pausing

Drop excess events when the rate limit is reached:

```tql
from "input.json" { read_json }
throttle rate=500, drop
```

## See Also

[`batch`](/reference/operators/batch),
[`buffer`](/reference/operators/buffer)
