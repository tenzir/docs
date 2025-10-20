# has

Checks whether a record has a specified field.

```tql
has(x:record, field:string) -> bool
```

## Description

[Section titled “Description”](#description)

The `has` function returns `true` if the record contains the specified field and `false` otherwise.

## Examples

[Section titled “Examples”](#examples)

### Check if a record has a specific field

[Section titled “Check if a record has a specific field”](#check-if-a-record-has-a-specific-field)

```tql
from {
  x: "foo",
  y: null,
}
this = {
  has_x: this.has("x"),
  has_y: this.has("y"),
  has_z: this.has("z"),
}
```

```tql
{
  has_x: true,
  has_y: true,
  has_z: false,
}
```

## See Also

[Section titled “See Also”](#see-also)

[`is_empty`](/reference/functions/is_empty), [`keys`](/reference/functions/keys)