# length_bytes

Returns the length of a string in bytes.

```tql
length_bytes(x:string) -> int
```

## Description

[Section titled “Description”](#description)

The `length_bytes` function returns the byte length of the `x` string.

## Examples

[Section titled “Examples”](#examples)

### Get the byte length of a string

[Section titled “Get the byte length of a string”](#get-the-byte-length-of-a-string)

For ASCII strings, the byte length is the same as the number of characters:

```tql
from {x: "hello".length_bytes()}
```

```tql
{x: 5}
```

For Unicode, this may not be the case:

```tql
from {x: "👻".length_bytes()}
```

```tql
{x: 4}
```

## See Also

[Section titled “See Also”](#see-also)

[`length`](/reference/functions/length), [`length_chars`](/reference/functions/length_chars)