# move

Moves values from one field to another, removing the original field.

```tql
move to=from, …
```

## Description

[Section titled “Description”](#description)

Moves from the field `from` to the field `to`.

### `to: field`

[Section titled “to: field”](#to-field)

The field to move into.

### `from: field`

[Section titled “from: field”](#from-field)

The field to move from.

## Examples

[Section titled “Examples”](#examples)

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

[Section titled “See Also”](#see-also)

[`set`](/reference/operators/set)