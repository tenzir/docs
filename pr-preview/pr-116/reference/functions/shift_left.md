# shift_left

Performs a bit-wise left shift.

```tql
shift_left(lhs:number, rhs:number) -> number
```

## Description

[Section titled “Description”](#description)

The `shift_left` function performs a bit-wise left shift of `lhs` by `rhs` bit positions. Each left shift multiplies the number by 2.

### `lhs: number`

[Section titled “lhs: number”](#lhs-number)

The number to be shifted.

### `rhs: number`

[Section titled “rhs: number”](#rhs-number)

The number of bit positions to shift to the left.

## Examples

[Section titled “Examples”](#examples)

### Shift bits to the left

[Section titled “Shift bits to the left”](#shift-bits-to-the-left)

```tql
from {x: shift_left(5, 2)}
```

```tql
{x: 20}
```

## See Also

[Section titled “See Also”](#see-also)

[`shift_right`](/reference/functions/shift_right), [`bit_and`](/reference/functions/bit_and), [`bit_or`](/reference/functions/bit_or), [`bit_xor`](/reference/functions/bit_xor), [`bit_not`](/reference/functions/bit_not)