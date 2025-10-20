# since_epoch

Interprets a time value as duration since the Unix epoch.

```tql
since_epoch(x:time) -> duration
```

## Description

[Section titled “Description”](#description)

The `since_epoch` function turns a time value into a duration since the [Unix epoch](https://en.wikipedia.org/wiki/Unix_time), i.e., since 00:00:00 UTC on January 1970.

## Examples

[Section titled “Examples”](#examples)

### Retrive the Unix time for a given date

[Section titled “Retrive the Unix time for a given date”](#retrive-the-unix-time-for-a-given-date)

```tql
from { x: since_epoch(2021-02-24) }
```

```tql
{x: 18682.0d}
```

## See Also

[Section titled “See Also”](#see-also)

[`from_epoch`](/reference/functions/from_epoch), [`now`](/reference/functions/now)