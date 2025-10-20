# prepend

Inserts an element at the start of a list.

```tql
prepend(xs:list, x:any) -> list
```

## Description

[Section titled “Description”](#description)

The `prepend` function returns the list `xs` with `x` inserted at the front. The expression `xs.prepend(y)` is equivalent to `[x, ...xs]`.

## Examples

[Section titled “Examples”](#examples)

### Prepend a number to a list

[Section titled “Prepend a number to a list”](#prepend-a-number-to-a-list)

```tql
from {xs: [1, 2]}
xs = xs.prepend(3)
```

```tql
{xs: [3, 1, 2]}
```

## See Also

[Section titled “See Also”](#see-also)

[`add`](/reference/functions/add), [`append`](/reference/functions/append), [`concatenate`](/reference/functions/concatenate), [`remove`](/reference/functions/remove)