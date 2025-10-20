# length

Retrieves the length of a list.

```tql
length(xs:list) -> int
```

## Description

[Section titled “Description”](#description)

The `length` function returns the number of elements in the list `xs`.

## Examples

[Section titled “Examples”](#examples)

### Get the length of a list

[Section titled “Get the length of a list”](#get-the-length-of-a-list)

```tql
from {n: [1, 2, 3].length()}
```

```tql
{n: 3}
```

## See Also

[Section titled “See Also”](#see-also)

[`is_empty`](/reference/functions/is_empty), [`length_bytes`](/reference/functions/length_bytes), [`length_chars`](/reference/functions/length_chars)