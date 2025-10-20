# print_ssv

Prints a record as a space-separated string of values.

```tql
print_ssv(input:record, [list_separator=str, null_value=str]) -> string
```

## Description

The `print_ssv` function prints a record’s values as a space separated string.

### `input: record`

The record you want to print.

### `list_separator = str (optional)`

The string separating the elements in list fields.

Defaults to `","`.

### `null_value = str (optional)`

The string denoting an absent value.

Defaults to `"-"`.

## Examples

[Section titled “Examples”](#examples)

### Print a record as space

[Section titled “Print a record as space”](#print-a-record-as-space)

```tql
from {x:1, y:true, z: "String"}
output = this.print_ssv()
```

```tql
{
  x: 1,
  y: true,
  z: "String",
  output: "1 true String",
}
```

## See Also

[Section titled “See Also”](#see-also)

[`parse_ssv`](/reference/functions/parse_ssv), [`write_ssv`](/reference/operators/write_ssv)