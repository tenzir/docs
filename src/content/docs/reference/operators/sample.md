---
title: sample
category: Filter
example: 'sample 30s, max_samples=2k'
---

Dynamically samples events from a event stream.

```tql
sample [period:duration, mode=string, min_events=int, max_rate=int, max_samples=int]
```

## Description

Dynamically samples input data from a stream based on the frequency of
receiving events for streams with varying load.

The operator counts the number of events received in the `period` and applies
the specified function on the count to calculate the sampling rate for the next
period.

### Understanding sampling rates

Each mode uses a mathematical function that converts the event count into a
sampling rate. For example, if you received 1,000 events in the previous period:

| Mode      | Calculation     | Rate | Events kept (approx) |
| --------- | --------------- | ---- | -------------------- |
| `"ln"`    | ln(1000) = 7    | 1:7  | 143 of 1000          |
| `"log2"`  | log2(1000) = 10 | 1:10 | 100 of 1000          |
| `"log10"` | log10(1000) = 3 | 1:3  | 333 of 1000          |
| `"sqrt"`  | sqrt(1000) = 32 | 1:32 | 31 of 1000           |

At higher volumes, the differences become more pronounced. With 1,000,000 events:

| Mode      | Calculation          | Rate   | Events kept (approx) |
| --------- | -------------------- | ------ | -------------------- |
| `"ln"`    | ln(1000000) = 14     | 1:14   | 71,429               |
| `"log2"`  | log2(1000000) = 20   | 1:20   | 50,000               |
| `"log10"` | log10(1000000) = 6   | 1:6    | 166,667              |
| `"sqrt"`  | sqrt(1000000) = 1000 | 1:1000 | 1,000                |

### When to use each mode

- **`"ln"`**: A balanced default for most use cases. Provides reasonable
  sampling without being too aggressive.
- **`"log2"`**: Use when you want slightly more aggressive downsampling than
  `"ln"` but still gradual scaling.
- **`"log10"`**: Use when you want to keep more data even at high volumes. The
  sampling rate increases slowly, so you retain a larger proportion of events.
- **`"sqrt"`**: Use for high-volume streams where you need aggressive
  downsampling. The rate scales fastest with event count, keeping storage and
  processing costs low.

### `period: duration (optional)`

The duration to count events in, that is, how often the sample rate is computed.

The sampling rate for the first window is `1:1`.

Defaults to `30s`.

### `mode = string (optional)`

The mode determines how aggressively sampling increases as event volume grows.
The operator counts how many events arrive during each period, then applies the
selected function to that count to compute the sampling rate (1:N) for the next
period.

The available modes are:

| Mode      | Function          | Sampling behavior                         |
| --------- | ----------------- | ----------------------------------------- |
| `"ln"`    | Natural logarithm | Moderate sampling, grows slowly           |
| `"log2"`  | Base-2 logarithm  | Slightly more aggressive than `ln`        |
| `"log10"` | Base-10 logarithm | Conservative sampling, keeps most data    |
| `"sqrt"`  | Square root       | Most aggressive, grows faster than others |

The default is `"ln"`.

### `min_events = int (optional)`

The minimum number of events that must be received during the previous sampling
period for the sampling mode to be applied in the current period. If the number
of events in a sample group falls below this threshold, a `1:1` sample rate is
used instead.

Defaults to `30`.

### `max_rate = int (optional)`

The sampling rate is capped to this value if the computed rate is higher than this.

### `max_samples = int (optional)`

The maximum number of events to emit per `period`.

## Examples

### Sample the input every 30s dynamically

Sample a feed `log-stream` every 30s dynamically, only changing rate when more
than 50 events (`min_events`) are received. Additionally, cap the max sampling
rate to `1:500`, that is, 1 sample for every 500 events or more (`max_rate`).

```tql
subscribe "log-stream"
sample 30s, min_events=50, max_rate=500
```

### Sample metrics every hour

Sample some `metrics` every hour, limiting the max samples per period to 5,000
samples (`max_samples`) and limiting the overall sample count to 100,000 samples
([`head`](/reference/operators/head)).

```tql
subscribe "metrics"
sample 1h, max_samples=5k
head 100k
```

### Use aggressive sampling for high-volume streams

For a high-volume network flow stream where storage costs are a concern, use
`sqrt` mode to aggressively reduce data volume:

```tql
subscribe "network-flows"
sample 1min, mode="sqrt"
```

With `sqrt` mode, if you receive 10,000 flows per minute, the sampling rate
becomes 1:100, keeping only about 100 events.

### Retain more data with conservative sampling

For verbose application logs where you want broader coverage even at high
volumes, use `log10` mode:

```tql
subscribe "app-logs"
sample 30s, mode="log10"
```

With `log10` mode, even at 100,000 events per period, the sampling rate is only
1:5, retaining about 20,000 events.

## See Also

[`deduplicate`](/reference/operators/deduplicate)
