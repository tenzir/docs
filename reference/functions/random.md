# random

Generates a random number in *\[0,1]*.

```tql
random() -> float
```

## Description

[Section titled “Description”](#description)

The `random` function generates a random number by drawing from a [uniform distribution](https://en.wikipedia.org/wiki/Continuous_uniform_distribution) in the interval *\[0,1]*.

## Examples

[Section titled “Examples”](#examples)

### Generate a random number

[Section titled “Generate a random number”](#generate-a-random-number)

```tql
from {x: random()}
```

```tql
{x: 0.19634716885782455}
```

## See Also

[Section titled “See Also”](#see-also)

[`uuid`](/reference/functions/uuid)