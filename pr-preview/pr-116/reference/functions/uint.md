# uint

Casts an expression to an unsigned integer.

```tql
uint(x:number|string, base=int) -> uint
```

## Description

[Section titled “Description”](#description)

The `uint` function casts the provided value `x` to an unsigned integer. Non-integer values are truncated.

### `x: number|string`

[Section titled “x: number|string”](#x-numberstring)

The input to convert.

### `base = int`

[Section titled “base = int”](#base--int)

Base (radix) to parse a string as. Can be `10` or `16`.

If `16`, the string inputs may be optionally prefixed by `0x` or `0X`, e.g., `0x134`.

Defaults to `10`.

## Examples

[Section titled “Examples”](#examples)

### Cast a floating-point number to an unsigned integer

[Section titled “Cast a floating-point number to an unsigned integer”](#cast-a-floating-point-number-to-an-unsigned-integer)

```tql
from {x: uint(4.2)}
```

```tql
{x: 4}
```

### Parse a hexadecimal number

[Section titled “Parse a hexadecimal number”](#parse-a-hexadecimal-number)

```tql
from {x: uint("0x42", base=16)}
```

```tql
{x: 66}
```

## See Also

[Section titled “See Also”](#see-also)

[`ip`](/reference/functions/ip), [`subnet`](/reference/functions/subnet), [`time`](/reference/functions/time), [float](/reference/functions/float), [int](/reference/functions/int), [string](/reference/functions/string)