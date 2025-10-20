# bit_and

Computes the bit-wise AND of its arguments.

```tql
bit_and(lhs:number, rhs:number) -> number
```

## Description

[Section titled “Description”](#description)

The `bit_and` function computes the bit-wise AND of `lhs` and `rhs`. The operation is performed on each corresponding bit position of the two numbers.

### `lhs: number`

[Section titled “lhs: number”](#lhs-number)

The left-hand side operand.

### `rhs: number`

[Section titled “rhs: number”](#rhs-number)

The right-hand side operand.

## Examples

[Section titled “Examples”](#examples)

### Perform bit-wise AND on integers

[Section titled “Perform bit-wise AND on integers”](#perform-bit-wise-and-on-integers)

```tql
from {x: bit_and(5, 3)}
```

```tql
{x: 1}
```

## See Also

[Section titled “See Also”](#see-also)

[`bit_or`](/reference/functions/bit_or), [`bit_xor`](/reference/functions/bit_xor), [`bit_not`](/reference/functions/bit_not), [`shift_left`](/reference/functions/shift_left), [`shift_right`](/reference/functions/shift_right)