---
title: batch
category: Internals
example: 'batch timeout=1s'
---

The `batch` operator controls the batch size of events.

```tql
batch [limit:int, timeout=duration]
```

## Description

The `batch` operator takes its input and rewrites it into batches of up to the
desired size.

:::caution[Advanced feature]
The `batch` operator is a lower-level building block that lets users explicitly
control batching, which otherwise is controlled automatically by Tenzir's
underlying pipeline execution engine. Use with caution!
:::

:::note[Multiple schemas]
The operator maintains separate buffers for each distinct schema. Each buffer
has independent timeout tracking and fills until reaching the `limit`, at which
point it flushes immediately.
:::

### `limit: int (optional)`

How many events to put into one batch at most.

Defaults to `65536`.

### `timeout = duration (optional)`

Specifies a maximum latency for events passing through the batch operator. If no
new events arrive within the timeout period, any buffered events are flushed.

Defaults to `1min`.
