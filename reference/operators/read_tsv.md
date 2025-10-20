# read_tsv

Read TSV (Tab-Separated Values) from a byte stream.

```tql
read_tsv [list_separator=string, null_value=string, comments=bool, header=string,
          quotes=string, auto_expand=bool,
          schema=string, selector=string, schema_only=bool, raw=bool, unflatten_separator=string]
```

## Description

[Section titled “Description”](#description)

The `read_tsv` operator transforms a byte stream into a event stream by parsing the bytes as [TSV](https://en.wikipedia.org/wiki/Tab-separated_values).

### `auto_expand = bool (optional)`

[Section titled “auto\_expand = bool (optional)”](#auto_expand--bool-optional)

Automatically add fields to the schema when encountering events with too many values instead of dropping the excess values.

### `comments = bool (optional)`

[Section titled “comments = bool (optional)”](#comments--bool-optional)

Treat lines beginning with ”#” as comments.

### `header = list<string>|string (optional)`

[Section titled “header = list\<string>|string (optional)”](#header--liststringstring-optional)

A list of strings to be used as the column names, or a `string` to be parsed as the `header` for the parsed values. If unspecified, the first line of the input is used as the header.

### `list_separator = string (optional)`

[Section titled “list\_separator = string (optional)”](#list_separator--string-optional)

The `string` separating the elements *inside* a list. If this string is found outside of quotes in a field, that field will become a list. If this string is empty, list parsing is disabled.

Defaults to `,`.

### `null_value = string (optional)`

[Section titled “null\_value = string (optional)”](#null_value--string-optional)

The `string` denoting an absent value.

Defaults to `-`.

### `quotes = string (optional)`

[Section titled “quotes = string (optional)”](#quotes--string-optional)

A string of not escaped characters that are supposed to be considered as quotes.

Defaults to the characters `"'`.

### `merge = bool (optional)`

Merges all incoming events into a single schema\* that converges over time. This option is usually the fastest *for reading* highly heterogeneous data, but can lead to huge schemas filled with nulls and imprecise results. Use with caution.

\*: In selector mode, only events with the same selector are merged.

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

### Parse a TSV file

[Section titled “Parse a TSV file”](#parse-a-tsv-file)

input.tsv

```txt
message  count  ip
text  42  "1.1.1.1"
"longer string"  100  "1.1.1.2"
```

```tql
load "input.tsv"
read_tsv
```

```tql
{message: "text", count: 42, ip: 1.1.1.1}
{message: "longer string", count: 100, ip: 1.1.1.2}
```

## See Also

[Section titled “See Also”](#see-also)

[`parse_tsv`](/reference/functions/parse_tsv), [`read_csv`](/reference/operators/read_csv), [`read_ssv`](/reference/operators/read_ssv), [`read_xsv`](/reference/operators/read_xsv)