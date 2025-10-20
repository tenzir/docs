# write_tql

Transforms the input event stream to a TQL notation byte stream.

```tql
write_tql [strip=bool, color=bool, compact=bool,
           strip_null_fields=bool, strip_nulls_in_lists=bool,
           strip_empty_records=bool, strip_empty_lists=bool]
```

## Description

[Section titled “Description”](#description)

Transforms the input event stream to a TQL notation byte stream.

Tip

`write_tql color=true` is the default sink for terminal output.

### `strip = bool (optional)`

[Section titled “strip = bool (optional)”](#strip--bool-optional)

Enables all `strip_*` options.

Defaults to `false`.

### `compact = bool (optional)`

[Section titled “compact = bool (optional)”](#compact--bool-optional)

Write one event per line, omitting linebreaks and indentation of records.

Defaults to `false`.

### `color = bool (optional)`

[Section titled “color = bool (optional)”](#color--bool-optional)

Colorize the output.

Defaults to `false`.

### `strip_null_fields = bool (optional)`

[Section titled “strip\_null\_fields = bool (optional)”](#strip_null_fields--bool-optional)

Strips all fields with a `null` value from records.

Defaults to `false`.

### `strip_nulls_in_lists = bool (optional)`

[Section titled “strip\_nulls\_in\_lists = bool (optional)”](#strip_nulls_in_lists--bool-optional)

Strips all `null` values from lists.

Defaults to `false`.

### `strip_empty_records = bool (optional)`

[Section titled “strip\_empty\_records = bool (optional)”](#strip_empty_records--bool-optional)

Strips empty records, including those that only became empty by stripping.

Defaults to `false`.

### `strip_empty_lists = bool (optional)`

[Section titled “strip\_empty\_lists = bool (optional)”](#strip_empty_lists--bool-optional)

Strips empty lists, including those that only became empty by stripping.

Defaults to `false`.

## Examples

[Section titled “Examples”](#examples)

### Print an event as TQL

[Section titled “Print an event as TQL”](#print-an-event-as-tql)

```tql
from {activity_id: 16, activity_name: "Query", rdata: 31.3.245.133, dst_endpoint: {ip: 192.168.4.1, port: 53}}
write_tql
```

```tql
{
  activity_id: 16,
  activity_name: "Query",
  rdata: 31.3.245.133,
  dst_endpoint: {
    ip: 192.168.4.1,
    port: 53,
  },
}
```

### Strip null fields

[Section titled “Strip null fields”](#strip-null-fields)

```tql
from {yes: 1, no: null}
write_tql strip_null_fields=true
```

```tql
{
  yes: 1,
}
```

## See Also

[Section titled “See Also”](#see-also)

[`write_json`](/reference/operators/write_json)