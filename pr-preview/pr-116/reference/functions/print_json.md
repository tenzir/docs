# print_json

Transforms a value into a JSON string.

```tql
print_json(input:any, [strip=bool, color=bool, arrays_of_objects=bool,
                       strip_null_fields=bool, strip_nulls_in_lists=bool,
                       strip_empty_records=bool, strip_empty_lists=bool]) -> string
```

## Description

[Section titled “Description”](#description)

Transforms a value into a JSON string.

### `input: any`

The value to print as a JSON value.

### `strip = bool (optional)`

Enables all `strip_*` options.

Defaults to `false`.

### `color = bool (optional)`

Colorize the output.

Defaults to `false`.

### `strip_null_fields = bool (optional)`

Strips all fields with a `null` value from records.

Defaults to `false`.

### `strip_nulls_in_lists = bool (optional)`

Strips all `null` values from lists.

Defaults to `false`.

### `strip_empty_records = bool (optional)`

Strips empty records, including those that only became empty by stripping.

Defaults to `false`.

### `strip_empty_lists = bool (optional)`

Strips empty lists, including those that only became empty by stripping.

Defaults to `false`.

## Examples

[Section titled “Examples”](#examples)

### Print without null fields

[Section titled “Print without null fields”](#print-without-null-fields)

```tql
from {x: 0}, {x:null}, {x: { x: 0, y: 1 } }, { x: [0,1,2,] }
x = x.print_json(strip_null_fields=true)
```

```tql
{
  x: "0",
}
{
  x: null,
}
{
  x: "{\n  \"x\": 0,\n  \"y\": 1\n}",
}
{
  x: "[\n  0,\n  1,\n  2\n]",
}
```

## See also

[Section titled “See also”](#see-also)

[`write_json`](/reference/operators/write_json), [`print_ndjson`](/reference/functions/print_ndjson), [`parse_json`](/reference/functions/parse_json)