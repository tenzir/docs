# second

Extracts the second component from a timestamp with subsecond precision.

```tql
second(x: time) -> float
```

## Description

[Section titled “Description”](#description)

The `second` function extracts the second component from a timestamp as a floating-point number (0-59.999…) that includes subsecond precision.

### `x: time`

[Section titled “x: time”](#x-time)

The timestamp from which to extract the second.

## Examples

[Section titled “Examples”](#examples)

### Extract the second from a timestamp

[Section titled “Extract the second from a timestamp”](#extract-the-second-from-a-timestamp)

```tql
from {
  ts: 2024-06-15T14:30:45.123456,
}
second = ts.second()
```

```tql
{
  ts: 2024-06-15T14:30:45.123456,
  second: 45.123456,
}
```

### Extract only the full second component without subsecond precision

[Section titled “Extract only the full second component without subsecond precision”](#extract-only-the-full-second-component-without-subsecond-precision)

```tql
from {
  ts: 2024-06-15T14:30:45.123456,
}
full_second = ts.second().floor()
```

```tql
{
  ts: 2024-06-15T14:30:45.123456,
  full_second: 45,
}
```

## See also

[Section titled “See also”](#see-also)

[`year`](/reference/functions/year), [`month`](/reference/functions/month), [`day`](/reference/functions/day), [`hour`](/reference/functions/hour), [`minute`](/reference/functions/minute)