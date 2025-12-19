---
title: random
category: Utility
example: 'random()'
---

Generates a random number in _[0,1]_.

```tql
random() -> float
```

## Description

The `random` function generates a random number by drawing from a [uniform
distribution](https://en.wikipedia.org/wiki/Continuous_uniform_distribution) in
the interval _[0,1]_.

## Examples

### Generate a random number

```tql
from {x: random()}
```

```tql
{x: 0.19634716885782455}
```

## See Also

[`uuid`](/reference/functions/uuid)
