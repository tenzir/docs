# time

Casts an expression to a time value.

```tql
time(x:any) -> time
```

## Description

[Section titled “Description”](#description)

The `time` function casts the given string or number `x` to a time value.

## Examples

[Section titled “Examples”](#examples)

### Cast a string to a time value

[Section titled “Cast a string to a time value”](#cast-a-string-to-a-time-value)

```tql
from {x: time("2020-03-15")}
```

```tql
{x: 2020-03-15T00:00:00.000000}
```

## See Also

[Section titled “See Also”](#see-also)

[`ip`](/reference/functions/ip), [`string`](/reference/functions/string), [`subnet`](/reference/functions/subnet), [`uint`](/reference/functions/uint), [duration](/reference/functions/duration), [float](/reference/functions/float), [int](/reference/functions/int)