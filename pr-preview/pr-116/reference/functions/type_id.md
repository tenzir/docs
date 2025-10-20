# type_id

Retrieves the type id of an expression.

```tql
type_id(x:any) -> string
```

## Description

[Section titled “Description”](#description)

The `type_id` function returns the type id of the given value `x`.

## Examples

[Section titled “Examples”](#examples)

### Retrieve the type of a numeric expression

[Section titled “Retrieve the type of a numeric expression”](#retrieve-the-type-of-a-numeric-expression)

```tql
from {x: type_id(1 + 3.2)}
```

```tql
{x: "41615fdb30a38aaf"}
```

## See also

[Section titled “See also”](#see-also)

[`type_of`](/reference/functions/type_of)