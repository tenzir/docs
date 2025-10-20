# write_tsv

Transforms event stream to TSV (Tab-Separated Values) byte stream.

```tql
write_tsv [list_separator=str, null_value=str, no_header=bool]
```

## Description

[Section titled “Description”](#description)

The `write_tsv` operator transforms an event stream into a byte stream by writing the events as TSV.

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

Write an event as TSV.

```tql
from {x:1, y:true, z: "String"}
write_tsv
```

```plaintext
x  y  z
1  true  String
```

## See Also

[Section titled “See Also”](#see-also)

[`write_csv`](/reference/operators/write_csv), [`write_lines`](/reference/operators/write_lines), [`write_ssv`](/reference/operators/write_ssv), [`write_xsv`](/reference/operators/write_xsv)