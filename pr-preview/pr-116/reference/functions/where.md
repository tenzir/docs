# where

Filters list elements based on a predicate.

```tql
where(xs:list, any->bool) -> list
```

## Description

[Section titled “Description”](#description)

The `where` function keeps only elements of a list for which a predicate evaluates to `true`.

### `xs: list`

[Section titled “xs: list”](#xs-list)

A list of values.

### `function: any -> bool`

[Section titled “function: any -> bool”](#function-any---bool)

A lambda function that is evaluated for each list element.

## Examples

[Section titled “Examples”](#examples)

### Keep only elements greater than 3

[Section titled “Keep only elements greater than 3”](#keep-only-elements-greater-than-3)

```tql
from {
  xs: [1, 2, 3, 4, 5]
}
xs = xs.where(x => x > 3)
```

```tql
{
  xs: [4, 5]
}
```

## See Also

[Section titled “See Also”](#see-also)

[`map`](/reference/functions/map)