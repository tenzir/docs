# length_chars

Returns the length of a string in characters.

```tql
length_chars(x:string) -> int
```

## Description

[Section titled “Description”](#description)

The `length_chars` function returns the character length of the `x` string.

## Examples

[Section titled “Examples”](#examples)

### Get the character length of a string

[Section titled “Get the character length of a string”](#get-the-character-length-of-a-string)

For ASCII strings, the character length is the same as the number of bytes:

```tql
from {x: "hello".length_chars()}
```

```tql
{x: 5}
```

For Unicode, this may not be the case:

```tql
from {x: "👻".length_chars()}
```

```tql
{x: 1}
```

## See Also

[Section titled “See Also”](#see-also)

[`length`](/reference/functions/length), [`length_bytes`](/reference/functions/length_bytes)