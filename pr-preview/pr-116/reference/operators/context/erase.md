# context::erase

Removes entries from a context.

```tql
context::erase name:string, key=any
```

## Description

[Section titled “Description”](#description)

The `context::erase` operator removes data from a context.

Use the `key` argument to specify the field in the input that should be deleted from the context.

### `name: string`

[Section titled “name: string”](#name-string)

The name of the context to remove entries from.

### `key = any`

[Section titled “key = any”](#key--any)

The field that represents the enrichment key in the data.

## Examples

[Section titled “Examples”](#examples)

### Delete entries from a context

[Section titled “Delete entries from a context”](#delete-entries-from-a-context)

```plaintext
from {network: 10.0.0.1/16}
context::erase "network-classification", key=network
```

## See Also

[Section titled “See Also”](#see-also)

[`context::create_bloom_filter`](/reference/operators/context/create_bloom_filter), [`context::create_lookup_table`](/reference/operators/context/create_lookup_table), [`context::inspect`](/reference/operators/context/inspect), [`context::load`](/reference/operators/context/load), [`context::remove`](/reference/operators/context/remove), [`context::reset`](/reference/operators/context/reset), [`context::save`](/reference/operators/context/save), [`create_geoip`](/reference/operators/context/create_geoip), [`enrich`](/reference/operators/context/enrich), [`list`](/reference/operators/context/list), [`update`](/reference/operators/context/update)