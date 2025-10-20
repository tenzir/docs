# parse_xsv

Parses a string as delimiter separated values.

```tql
parse_xsv(input:string, field_separator=string, list_separator=string, null_value=string,
          header=list<string>|string,
         [auto_expand=bool, quotes=string, schema=string,
          selector=string, schema_only=bool, raw=bool,
          unflatten_separator=string]) -> record
```

## Description

[Section titled “Description”](#description)

The `parse_xsv` function parses a string as [XSV](https://en.wikipedia.org/wiki/Delimiter-separated_values), a generalization of CSV with a more flexible separator specification.

The following table lists existing XSV configurations:

| Format                                  | Field Separator | List Separator | Null Value |
| --------------------------------------- | :-------------: | :------------: | :--------: |
| [`csv`](/reference/functions/parse_csv) |       `,`       |       `;`      |    empty   |
| [`ssv`](/reference/functions/parse_ssv) |    `<space>`    |       `,`      |     `-`    |
| [`tsv`](/reference/functions/parse_tsv) |       `\t`      |       `,`      |     `-`    |

### `header = list<string>|string`

[Section titled “header = list\<string>|string”](#header--liststringstring)

A list of strings to be used as the column names, or a `string` to be parsed as the `header` for the parsed values.

### `field_separator = string`

[Section titled “field\_separator = string”](#field_separator--string)

The string separating different fields.

### `list_separator = string`

[Section titled “list\_separator = string”](#list_separator--string)

The `string` separating the elements *inside* a list. If this string is found outside of quotes in a field, that field will become a list. If this string is empty, list parsing is disabled.

### `null_value = string`

[Section titled “null\_value = string”](#null_value--string)

The string denoting an absent value.

### `auto_expand = bool (optional)`

[Section titled “auto\_expand = bool (optional)”](#auto_expand--bool-optional)

Automatically add fields to the schema when encountering events with too many values instead of dropping the excess values.

### `quotes = string (optional)`

[Section titled “quotes = string (optional)”](#quotes--string-optional)

A string of not escaped characters that are supposed to be considered as quotes.

Defaults to the characters `"'`.

### `raw = bool (optional)`

Use only the raw types that are native to the parsed format. Fields that have a type specified in the chosen `schema` will still be parsed according to the schema.

### `schema = string (optional)`

Provide the name of a schema to be used by the parser.

If a schema with a matching name is installed, the result will always have all fields from that schema.

* Fields that are specified in the schema, but did not appear in the input will be null.
* Fields that appear in the input, but not in the schema will also be kept. Use `schema_only=true` to reject fields that are not in the schema.

If the given schema does not exist, this option instead assigns the output schema name only.

The `schema` option is incompatible with the `selector` option.

### `selector = string (optional)`

Designates a field value as schema name with an optional dot-separated prefix.

The string is parsed as `<fieldname>[:<prefix>]`. The `prefix` is optional and will be prepended to the field value to generate the schema name.

For example, the Suricata EVE JSON format includes a field `event_type` that contains the event type. Setting the selector to `event_type:suricata` causes an event with the value `flow` for the field `event_type` to map onto the schema `suricata.flow`.

The `selector` option is incompatible with the `schema` option.

### `schema_only = bool (optional)`

When working with an existing schema, this option will ensure that the output schema has *only* the fields from that schema.

If the schema name is obtained via a `selector` and it does not exist, this has no effect.

This option requires either `schema` or `selector` to be set.

### `unflatten_separator = string (optional)`

A delimiter that, if present in keys, causes values to be treated as values of nested records.

A popular example of this is the [Zeek JSON](/reference/operators/read_zeek_json) format. It includes the fields `id.orig_h`, `id.orig_p`, `id.resp_h`, and `id.resp_p` at the top-level. The data is best modeled as an `id` record with four nested fields `orig_h`, `orig_p`, `resp_h`, and `resp_p`.

Without an unflatten separator, the data looks like this:

Without unflattening

```json
{
  "id.orig_h": "1.1.1.1",
  "id.orig_p": 10,
  "id.resp_h": "1.1.1.2",
  "id.resp_p": 5
}
```

With the unflatten separator set to `.`, Tenzir reads the events like this:

With 'unflatten'

```json
{
  "id": {
    "orig_h": "1.1.1.1",
    "orig_p": 10,
    "resp_h": "1.1.1.2",
    "resp_p": 5
  }
}
```

## Examples

[Section titled “Examples”](#examples)

```tql
from { input: "1,2,3" }
output = input.parse_xsv(
  field_separator=",",
  list_separator= ";",
  null_value="",
  header=["a","b","c"],
)
```

```tql
{
  input: "1,2,3",
  output: {
    a: 1,
    b: 2,
    c: 3,
  },
}
```

## See Also

[Section titled “See Also”](#see-also)

[`read_xsv`](/reference/operators/read_xsv), [`parse_csv`](/reference/functions/parse_csv), [`parse_ssv`](/reference/functions/parse_ssv), [`parse_tsv`](/reference/functions/parse_tsv)