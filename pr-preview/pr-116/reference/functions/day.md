# day

Extracts the day component from a timestamp.

```tql
day(x: time) -> int
```

## Description

[Section titled “Description”](#description)

The `day` function extracts the day component from a timestamp as an integer (1-31).

### `x: time`

[Section titled “x: time”](#x-time)

The timestamp from which to extract the day.

## Examples

[Section titled “Examples”](#examples)

### Extract the day from a timestamp

[Section titled “Extract the day from a timestamp”](#extract-the-day-from-a-timestamp)

```tql
from {
  ts: 2024-06-15T14:30:45.123456,
}
day = ts.day()
```

```tql
{
  ts: 2024-06-15T14:30:45.123456,
  day: 15,
}
```

## See also

[Section titled “See also”](#see-also)

[`year`](/reference/functions/year), [`month`](/reference/functions/month), [`hour`](/reference/functions/hour), [`minute`](/reference/functions/minute), [`second`](/reference/functions/second)