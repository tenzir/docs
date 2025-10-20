# contains_null

Checks whether the input contains any `null` values.

```tql
contains_null(x:any) -> bool
```

## Description

[Section titled “Description”](#description)

The `contains_null` function checks if the input contains any `null` values recursively.

### `x: any`

[Section titled “x: any”](#x-any)

The input to check for `null` values.

## Examples

[Section titled “Examples”](#examples)

### Check if list has null values

[Section titled “Check if list has null values”](#check-if-list-has-null-values)

```tql
from {x: [{a: 1}, {}]}
contains_null = x.contains_null()
```

```tql
{
  x: [
    {
      a: 1,
    },
    {
      a: null,
    },
  ],
  contains_null: true,
}
```

### Check a record with null values

[Section titled “Check a record with null values”](#check-a-record-with-null-values)

```tql
from {x: "foo", y: null}
contains_null = this.contains_null()
```

```tql
{
  x: "foo",
  y: null,
  contains_null: true,
}
```

## See Also

[Section titled “See Also”](#see-also)

[`has`](/reference/functions/has), [`is_empty`](/reference/functions/is_empty) [`contains`](/reference/functions/contains)