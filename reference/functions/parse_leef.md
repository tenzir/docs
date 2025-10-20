# parse_leef

Parses a string as a LEEF message

```tql
parse_leef(input:string, [schema=string, selector=string, schema_only=bool,
           raw=bool, unflatten_separator=string]) -> record
```

## Description

[Section titled “Description”](#description)

The `parse_leef` function parses a string as a LEEF message

### `input: string`

[Section titled “input: string”](#input-string)

The string to parse.

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
from { input: "LEEF:1.0|Microsoft|MSExchange|2016|15345|src=10.50.1.1  dst=2.10.20.20  spt=1200" }
output = input.parse_leef()
```

```tql
{
  input: "LEEF:1.0|Microsoft|MSExchange|2016|15345|src=10.50.1.1\tdst=2.10.20.20\tspt=1200",
  output: {
    leef_version: "1.0",
    vendor: "Microsoft",
    product_name: "MSExchange",
    product_version: "2016",
    event_class_id: "15345",
    attributes: {
      src: 10.50.1.1,
      dst: 2.10.20.20,
      spt: 1200,
    },
  },
}
```

# See Also

[Section titled “See Also”](#see-also)

[`read_leef`](/reference/operators/read_leef), [`print_leef`](/reference/functions/print_leef), [`parse_cef`](/reference/functions/parse_cef), [`read_syslog`](/reference/operators/read_syslog), [`write_syslog`](/reference/operators/write_syslog)