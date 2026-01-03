---
title: time
category: Type System/Conversion
example: 'time("2020-03-15")'
---

Casts an expression to a time value.

```tql
time(x:any) -> time
```

## Description

The `time` function parses the given string `x` to a time value. It
automatically recognizes many common timestamp formats without requiring a
format string.

### Supported formats

The function accepts the following input formats:

| Format              | Example                                             |
| :------------------ | :-------------------------------------------------- |
| ISO 8601 date       | `2024-01-15`                                        |
| ISO 8601 datetime   | `2024-01-15T10:30:45`                               |
| Datetime with space | `2024-01-15 10:30:45`                               |
| Fractional seconds  | `2024-01-15T10:30:45.123456`                        |
| With timezone       | `2024-01-15T10:30:45Z`, `2024-01-15T10:30:45+02:00` |
| Unix timestamp      | `@1705316445`, `@1705316445.123`                    |
| Current time        | `now`                                               |
| Relative future     | `now + 1h`, `in 2h`                                 |
| Relative past       | `now - 30min`, `5min ago`                           |

For timestamps in non-standard formats, use
[`parse_time`](/reference/functions/parse_time) with an explicit format string.

## Examples

### Parse ISO 8601 timestamps

```tql
from {
  date_only: time("2024-01-15"),
  with_time: time("2024-01-15T10:30:45"),
  with_space: time("2024-01-15 10:30:45"),
  fractional: time("2024-01-15T10:30:45.123456"),
}
```

```tql
{
  date_only: 2024-01-15T00:00:00Z,
  with_time: 2024-01-15T10:30:45Z,
  with_space: 2024-01-15T10:30:45Z,
  fractional: 2024-01-15T10:30:45.123456Z,
}
```

### Parse timestamps with timezones

```tql
from {
  utc: time("2024-01-15T10:30:45Z"),
  positive_offset: time("2024-01-15T10:30:45+02:00"),
  negative_offset: time("2024-01-15T10:30:45-05:00"),
}
```

```tql
{
  utc: 2024-01-15T10:30:45Z,
  positive_offset: 2024-01-15T08:30:45Z,
  negative_offset: 2024-01-15T15:30:45Z,
}
```

### Parse Unix timestamps

Prefix Unix timestamps with `@`:

```tql
from {
  unix_seconds: time("@1705316445"),
  unix_fractional: time("@1705316445.123456"),
}
```

```tql
{
  unix_seconds: 2024-01-15T11:00:45Z,
  unix_fractional: 2024-01-15T11:00:45.123456Z,
}
```

### Use relative time expressions

```tql
from {
  current: time("now"),
  future: time("now + 2h"),
  past: time("now - 30min"),
  in_future: time("in 1d"),
  in_past: time("5min ago"),
}
```

### Parse timestamps in a pipeline

```tql
from {timestamp: "2024-01-15T10:30:45Z"}
timestamp = timestamp.time()
```

```tql
{
  timestamp: 2024-01-15T10:30:45Z,
}
```

## See Also

[`format_time`](/reference/functions/format_time),
[`parse_time`](/reference/functions/parse_time)

[`duration`](/reference/functions/duration),
[`float`](/reference/functions/float),
[`int`](/reference/functions/int),
[`ip`](/reference/functions/ip),
[`string`](/reference/functions/string),
[`subnet`](/reference/functions/subnet),
[`uint`](/reference/functions/uint)
