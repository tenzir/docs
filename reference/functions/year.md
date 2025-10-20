# year

Extracts the year component from a timestamp.

```tql
year(x: time) -> int
```

## Description

[Section titled “Description”](#description)

The `year` function extracts the year component from a timestamp as an integer.

### `x: time`

[Section titled “x: time”](#x-time)

The timestamp from which to extract the year.

## Examples

[Section titled “Examples”](#examples)

### Extract the year from a timestamp

[Section titled “Extract the year from a timestamp”](#extract-the-year-from-a-timestamp)

```tql
from {
  ts: 2024-06-15T14:30:45.123456,
}
year = ts.year()
```

```tql
{
  ts: 2024-06-15T14:30:45.123456,
  year: 2024,
}
```

## See also

[Section titled “See also”](#see-also)

[`month`](/reference/functions/month), [`day`](/reference/functions/day), [`hour`](/reference/functions/hour), [`minute`](/reference/functions/minute), [`second`](/reference/functions/second)