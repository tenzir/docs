# zip

Combines two lists into a list of pairs.

```tql
zip(xs:list, ys:list) -> list
```

## Description

[Section titled “Description”](#description)

The `zip` function returns a list containing records with two fields `left` and `right`, each containing the respective elements of the input lists.

If both lists are null, `zip` returns null. If one of the lists is null or has a mismatching length, missing values are filled in with nulls, using the longer list’s length, and a warning is emitted.

## Examples

[Section titled “Examples”](#examples)

### Combine two lists

[Section titled “Combine two lists”](#combine-two-lists)

```tql
from {xs: [1, 2], ys: [3, 4]}
select zs = zip(xs, ys)
```

```tql
{
  zs: [
    {left: 1, right: 3},
    {left: 2, right: 4}
  ]
}
```

## See Also

[Section titled “See Also”](#see-also)

[`concatenate`](/reference/functions/concatenate), [`map`](/reference/functions/map)