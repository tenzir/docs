# abs

Returns the absolute value.

```tql
abs(x:number) -> number
abs(x:duration) -> duration
```

## Description

[Section titled “Description”](#description)

This function returns the [absolute value](https://en.wikipedia.org/wiki/Absolute_value) for a number or a duration.

### `x: duration|number`

[Section titled “x: duration|number”](#x-durationnumber)

The value to compute absolute value for.

## Examples

[Section titled “Examples”](#examples)

```tql
from {x: -13.3}
x = x.abs()
```

```tql
{x: 13.3}
```