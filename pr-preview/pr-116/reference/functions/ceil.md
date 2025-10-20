# ceil

Computes the ceiling of a number or a time/duration with a specified unit.

```tql
ceil(x:number)
ceil(x:time, unit:duration)
ceil(x:duration, unit:duration)
```

## Description

[Section titled “Description”](#description)

The `ceil` function takes the [ceiling](https://en.wikipedia.org/wiki/Floor_and_ceiling_functions) of a number `x`.

For time and duration values, use the second `unit` argument to define the rounding unit.

## Examples

[Section titled “Examples”](#examples)

### Take the ceiling of integers

[Section titled “Take the ceiling of integers”](#take-the-ceiling-of-integers)

```tql
from {
  x: ceil(3.4),
  y: ceil(3.5),
  z: ceil(-3.4),
}
```

```tql
{
  x: 4,
  y: 4,
  z: -3,
}
```

### Round time and duration values up to a unit

[Section titled “Round time and duration values up to a unit”](#round-time-and-duration-values-up-to-a-unit)

```tql
from {
  x: ceil(2024-02-24, 1y),
  y: ceil(10m, 1h)
}
```

```tql
{
  x: 2025-01-01,
  y: 1h,
}
```

## See Also

[Section titled “See Also”](#see-also)

[`floor`](/reference/functions/floor), [`round`](/reference/functions/round)