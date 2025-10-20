# append

Inserts an element at the back of a list.

```tql
append(xs:list, x:any) -> list
```

## Description

[Section titled “Description”](#description)

The `append` function returns the list `xs` with `x` inserted at the end. The expression `xs.append(x)` is equivalent to `[...xs, x]`.

## Examples

[Section titled “Examples”](#examples)

### Append a number to a list

[Section titled “Append a number to a list”](#append-a-number-to-a-list)

```tql
from {xs: [1, 2]}
xs = xs.append(3)
```

```tql
{xs: [1, 2, 3]}
```

## See Also

[Section titled “See Also”](#see-also)

[`add`](/reference/functions/add), [`concatenate`](/reference/functions/concatenate), [`prepend`](/reference/functions/prepend), [`remove`](/reference/functions/remove)