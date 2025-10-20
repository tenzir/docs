# pad_start

Pads a string at the start to a specified length.

```tql
pad_start(x:string, length:int, [pad_char:string]) -> string
```

## Description

[Section titled “Description”](#description)

The `pad_start` function pads the string `x` at the start with `pad_char` (default: space) until it reaches the specified `length`. If the string is already longer than or equal to the specified length, it returns the original string unchanged.

### `x: string`

[Section titled “x: string”](#x-string)

The string to pad.

### `length: int`

[Section titled “length: int”](#length-int)

The target length of the resulting string.

### `pad_char: string`

[Section titled “pad\_char: string”](#pad_char-string)

The character to use for padding. Must be a single character. Defaults to a space.

Defaults to `" "`.

## Examples

[Section titled “Examples”](#examples)

### Pad with spaces

[Section titled “Pad with spaces”](#pad-with-spaces)

```tql
from {x: "hello".pad_start(10)}
```

```tql
{x: "     hello"}
```

### Pad with custom character

[Section titled “Pad with custom character”](#pad-with-custom-character)

```tql
from {x: "42".pad_start(5, "0")}
```

```tql
{x: "00042"}
```

### String already long enough

[Section titled “String already long enough”](#string-already-long-enough)

```tql
from {x: "hello world".pad_start(5)}
```

```tql
{x: "hello world"}
```

## See Also

[Section titled “See Also”](#see-also)

[`pad_end`](/reference/functions/pad_end), [`trim`](/reference/functions/trim), [`trim_start`](/reference/functions/trim_start)