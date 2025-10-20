# print_tsv

Prints a record as a tab-separated string of values.

```tql
print_tsv(input:record, [list_separator=str, null_value=str]) -> string
```

## Description

The `print_tsv` function prints a record’s values as a tab separated string.

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

```tql
from {
  x:1,
  y:true,
  z: "String"
}
output = this.print_tsv()
```

```tql
{
  x: 1,
  y: true,
  z: "String",
  output: "1\ttrue\tString",
}
```

## See Also

[Section titled “See Also”](#see-also)

[`parse_tsv`](/reference/functions/parse_tsv), [`write_tsv`](/reference/operators/write_tsv)