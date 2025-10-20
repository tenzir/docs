# write_xsv

Transforms event stream to XSV byte stream.

```tql
write_xsv field_separator=str, list_separator=str, null_value=str, [no_header=bool]
```

## Description

[Section titled “Description”](#description)

The [`xsv`](https://en.wikipedia.org/wiki/Delimiter-separated_values) format is a generalization of [comma-separated values (CSV)](https://en.wikipedia.org/wiki/Comma-separated_values) data in tabular form with a more flexible separator specification supporting tabs, commas, and spaces. The first line in an XSV file is the header that describes the field names. The remaining lines contain concrete values. One line corresponds to one event, minus the header.

The following table lists existing XSV configurations:

| Format                                  | Field Separator | List Separator | Null Value |
| --------------------------------------- | :-------------: | :------------: | :--------: |
| [`csv`](/reference/operators/write_csv) |       `,`       |       `;`      |    empty   |
| [`ssv`](/reference/operators/write_ssv) |    `<space>`    |       `,`      |     `-`    |
| [`tsv`](/reference/operators/write_tsv) |       `\t`      |       `,`      |     `-`    |

Note that nested records have dot-separated field names.

### `field_separator = str`

[Section titled “field\_separator = str”](#field_separator--str)

The string separating different fields.

### `list_separator = str`

[Section titled “list\_separator = str”](#list_separator--str)

The string separating different elements in a list within a single field.

### `null_value = str`

[Section titled “null\_value = str”](#null_value--str)

The string denoting an absent value.

### `no_header=bool (optional)`

[Section titled “no\_header=bool (optional)”](#no_headerbool-optional)

Whether to not print a header line containing the field names.

## Examples

[Section titled “Examples”](#examples)

```tql
from {x:1, y:true, z: "String"}
write_xsv field_separator="/", list_separator=";", null_value=""
```

```plaintext
x/y/z
1/true/String
```

## See Also

[Section titled “See Also”](#see-also)

[`print_xsv`](/reference/functions/print_xsv), [`write_csv`](/reference/operators/write_csv), [`write_lines`](/reference/operators/write_lines), [`write_ssv`](/reference/operators/write_ssv), [`write_tsv`](/reference/operators/write_tsv)