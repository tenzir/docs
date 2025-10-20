# sqrt

Computes the square root of a number.

```tql
sqrt(x:number) -> float
```

## Description

[Section titled “Description”](#description)

The `sqrt` function computes the [square root](https://en.wikipedia.org/wiki/Square_root) of any non-negative number `x`.

## Examples

[Section titled “Examples”](#examples)

### Compute the square root of an integer

[Section titled “Compute the square root of an integer”](#compute-the-square-root-of-an-integer)

```tql
from {x: sqrt(49)}
```

```tql
{x: 7.0}
```

### Fail to compute the square root of a negative number

[Section titled “Fail to compute the square root of a negative number”](#fail-to-compute-the-square-root-of-a-negative-number)

```tql
from {x: sqrt(-1)}
```

```tql
{x: null}
```