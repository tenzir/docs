# write_ssv

Transforms event stream to SSV (Space-Separated Values) byte stream.

```tql
write_ssv [list_separator=str, null_value=str, no_header=bool]
```

## Description

[Section titled “Description”](#description)

The `write_ssv` operator transforms an event stream into a byte stream by writing the events as SSV.

### `list_separator = str (optional)`

[Section titled “list\_separator = str (optional)”](#list_separator--str-optional)

The string separating different elements in a list within a single field.

Defaults to `","`.

### `null_value = str (optional)`

[Section titled “null\_value = str (optional)”](#null_value--str-optional)

The string denoting an absent value.

Defaults to `"-"`.

### `no_header = bool (optional)`

[Section titled “no\_header = bool (optional)”](#no_header--bool-optional)

Whether to not print a header line containing the field names.

## Examples

[Section titled “Examples”](#examples)

Write an event as SSV.

```tql
from {x:1, y:true, z: "String"}
write_ssv
```

```plaintext
x y z
1 true String
```

## See Also

[Section titled “See Also”](#see-also)

[`print_ssv`](/reference/functions/print_ssv), [`read_ssv`](/reference/operators/read_ssv), [`write_csv`](/reference/operators/write_csv), [`write_lines`](/reference/operators/write_lines), [`write_tsv`](/reference/operators/write_tsv), [`write_xsv`](/reference/operators/write_xsv)