# duration

Casts an expression to a duration value.

```tql
duration(x:string) -> duration
```

## Description

[Section titled “Description”](#description)

The `duration` function casts the given string `x` to a duration value.

## Examples

[Section titled “Examples”](#examples)

### Cast a string to a duration

[Section titled “Cast a string to a duration”](#cast-a-string-to-a-duration)

```tql
from {str: "1ms"}
dur = duration(str)
```

```tql
{str: "1ms", dur: 1ms}
```

## See Also

[Section titled “See Also”](#see-also)

[time](/reference/functions/time)