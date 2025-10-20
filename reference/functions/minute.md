# minute

Extracts the minute component from a timestamp.

```tql
minute(x: time) -> int
```

## Description

[Section titled “Description”](#description)

The `minute` function extracts the minute component from a timestamp as an integer (0-59).

### `x: time`

[Section titled “x: time”](#x-time)

The timestamp from which to extract the minute.

## Examples

[Section titled “Examples”](#examples)

### Extract the minute from a timestamp

[Section titled “Extract the minute from a timestamp”](#extract-the-minute-from-a-timestamp)

```tql
from {
  ts: 2024-06-15T14:30:45.123456,
}
minute = ts.minute()
```

```tql
{
  ts: 2024-06-15T14:30:45.123456,
  minute: 30,
}
```

## See also

[Section titled “See also”](#see-also)

[`year`](/reference/functions/year), [`month`](/reference/functions/month), [`day`](/reference/functions/day), [`hour`](/reference/functions/hour), [`second`](/reference/functions/second)