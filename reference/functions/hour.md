# hour

Extracts the hour component from a timestamp.

```tql
hour(x: time) -> int
```

## Description

[Section titled “Description”](#description)

The `hour` function extracts the hour component from a timestamp as an integer (0-23).

### `x: time`

[Section titled “x: time”](#x-time)

The timestamp from which to extract the hour.

## Examples

[Section titled “Examples”](#examples)

### Extract the hour from a timestamp

[Section titled “Extract the hour from a timestamp”](#extract-the-hour-from-a-timestamp)

```tql
from {
  ts: 2024-06-15T14:30:45.123456,
}
hour = ts.hour()
```

```tql
{
  ts: 2024-06-15T14:30:45.123456,
  hour: 14,
}
```

## See also

[Section titled “See also”](#see-also)

[`year`](/reference/functions/year), [`month`](/reference/functions/month), [`day`](/reference/functions/day), [`minute`](/reference/functions/minute), [`second`](/reference/functions/second)