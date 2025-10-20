# add

Adds an element into a list if it doesn’t already exist (set-insertion).

```tql
add(xs:list, x:any) -> list
```

## Description

[Section titled “Description”](#description)

The `add` function returns the list `xs` with `x` added at the end, but only if `x` is not already present in the list. This performs a set-insertion operation, ensuring no duplicate values in the resulting list.

### `xs: list`

[Section titled “xs: list”](#xs-list)

The list to add to.

### `x: any`

[Section titled “x: any”](#x-any)

An element to add to the list. If this is of a type incompatible with the list, it will be considered as `null`.

## Examples

[Section titled “Examples”](#examples)

### Add a new element to a list

[Section titled “Add a new element to a list”](#add-a-new-element-to-a-list)

```tql
from {xs: [1, 2, 3]}
xs = xs.add(4)
```

```tql
{xs: [1, 2, 3, 4]}
```

### Try to add an existing element

[Section titled “Try to add an existing element”](#try-to-add-an-existing-element)

```tql
from {xs: [1, 2, 3]}
xs = xs.add(2)
```

```tql
{xs: [1, 2, 3]}
```

### Add to an empty list

[Section titled “Add to an empty list”](#add-to-an-empty-list)

```tql
from {xs: []}
xs = xs.add("hello")
```

```tql
{xs: ["hello"]}
```

## See Also

[Section titled “See Also”](#see-also)

[`append`](/reference/functions/append), [`prepend`](/reference/functions/prepend), [`remove`](/reference/functions/remove) [`distinct`](/reference/functions/distinct)