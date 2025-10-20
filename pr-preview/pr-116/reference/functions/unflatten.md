# unflatten

Unflattens nested data.

```tql
unflatten(x:record, [separator=string]) -> record
```

## Description

[Section titled “Description”](#description)

The `unflatten` function creates nested records out of fields whose names include a separator.

Note

`unflatten` uses a heuristic to determine the unflattened schema. Thus, the schema of a record that has been flattened using [`flatten`](/reference/functions/flatten) and unflattened afterwards may not be identical to the schema of the unmodified record.

### `x: record`

[Section titled “x: record”](#x-record)

The record you want to unflatten.

### `separator: string (optional)`

[Section titled “separator: string (optional)”](#separator-string-optional)

The separator to use for splitting field names.

Defaults to `"."`.

## Examples

[Section titled “Examples”](#examples)

### Unflatten fields at the dot character

[Section titled “Unflatten fields at the dot character”](#unflatten-fields-at-the-dot-character)

```tql
// Note the fields in double quotes that are single fields that contain a
// literal "." in their field name, as opposed to nested records.
from {
  src_ip: 147.32.84.165,
  src_port: 1141,
  dest_ip: 147.32.80.9,
  dest_port: 53,
  event_type: "dns",
  "dns.type": "query",
  "dns.id": 553,
  "dns.rrname": "irc.freenode.net",
  "dns.rrtype": "A",
  "dns.tx_id": 0,
  "dns.grouped.A": ["tenzir.com"],
}
this = unflatten(this)
```

```tql
{
  src_ip: 147.32.84.165,
  src_port: 1141,
  dest_ip: 147.32.80.9,
  dest_port: 53,
  event_type: "dns",
  dns: {
    type: "query",
    id: 553,
    rrname: "irc.freenode.net",
    rrtype: "A",
    tx_id: 0,
    grouped: {
      A: [
        "tenzir.com",
      ],
    },
  },
}
```

## See Also

[Section titled “See Also”](#see-also)

[`flatten`](/reference/functions/flatten)