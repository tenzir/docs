# pad_end

Pads a string at the end to a specified length.

```tql
pad_end(x:string, length:int, [pad_char:string]) -> string
```

## Description

[Section titled “Description”](#description)

The `pad_end` function pads the string `x` at the end with `pad_char` (default: space) until it reaches the specified `length`. If the string is already longer than or equal to the specified length, it returns the original string unchanged.

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
from {x: "hello".pad_end(10)}
```

```tql
{x: "hello     "}
```

### Pad with custom character

[Section titled “Pad with custom character”](#pad-with-custom-character)

```tql
from {x: "hello".pad_end(10, ".")}
```

```tql
{x: "hello....."}
```

### String already long enough

[Section titled “String already long enough”](#string-already-long-enough)

```tql
from {x: "hello world".pad_end(5)}
```

```tql
{x: "hello world"}
```

## See Also

[Section titled “See Also”](#see-also)

[`pad_start`](/reference/functions/pad_start), [`trim`](/reference/functions/trim), [`trim_end`](/reference/functions/trim_end)