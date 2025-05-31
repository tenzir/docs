---
title: move
category: Modify
example: 'move to=from, …'
---

Moves values from one field to another, removing the original field.

```tql
move to=from, …
```

## Description

Moves from the field `from` to the field `to`.

### `to: field`

The field to move into.

### `from: field`

The field to move from.

## Examples

```tql
from {x: 1, y: 2}
move z=y, w.x=x
```

```tql
{
  z: 2,
  w: {
    x: 1,
  },
}
```

## See Also

[`set`](/reference/operators/set)
