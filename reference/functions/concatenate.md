# concatenate

Merges two lists.

```tql
concatenate(xs:list, ys:list) -> list
```

## Description

[Section titled “Description”](#description)

The `concatenate` function returns a list containing all elements from the lists `xs` and `ys` in order. The expression `concatenate(xs, ys)` is equivalent to `[...xs, ...ys]`.

## Examples

[Section titled “Examples”](#examples)

### Concatenate two lists

[Section titled “Concatenate two lists”](#concatenate-two-lists)

```tql
from {xs: [1, 2], ys: [3, 4]}
zs = concatenate(xs, ys)
```

```tql
{
  xs: [1, 2],
  ys: [3, 4],
  zs: [1, 2, 3, 4]
}
```

## See Also

[Section titled “See Also”](#see-also)

[`append`](/reference/functions/append), [`merge`](/reference/functions/merge), [`prepend`](/reference/functions/prepend), [`zip`](/reference/functions/zip)