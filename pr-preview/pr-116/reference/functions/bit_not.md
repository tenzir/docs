# bit_not

Computes the bit-wise NOT of its argument.

```tql
bit_not(x:number) -> number
```

## Description

[Section titled “Description”](#description)

The `bit_not` function computes the bit-wise NOT of `x`. The operation inverts each bit in the binary representation of the number.

### `x: number`

[Section titled “x: number”](#x-number)

The number to perform bit-wise NOT on.

## Examples

[Section titled “Examples”](#examples)

### Perform bit-wise NOT on an integer

[Section titled “Perform bit-wise NOT on an integer”](#perform-bit-wise-not-on-an-integer)

```tql
from {x: bit_not(5)}
```

```tql
{x: -6}
```

## See Also

[Section titled “See Also”](#see-also)

[`bit_and`](/reference/functions/bit_and), [`bit_or`](/reference/functions/bit_or), [`bit_xor`](/reference/functions/bit_xor), [`shift_left`](/reference/functions/shift_left), [`shift_right`](/reference/functions/shift_right)