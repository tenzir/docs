# context::load

Loads context state.

```tql
context::load name:string
```

## Description

[Section titled “Description”](#description)

The `context::load` operator replaces the state of the specified context with its (binary) input.

### `name: string`

[Section titled “name: string”](#name-string)

The name of the context whose state to update.

## Examples

[Section titled “Examples”](#examples)

### Replace the database of a GeoIP context

[Section titled “Replace the database of a GeoIP context”](#replace-the-database-of-a-geoip-context)

```tql
load_file "ultra-high-res.mmdb", mmap=true
context::load "ctx"
```

## See Also

[Section titled “See Also”](#see-also)

[`context::create_bloom_filter`](/reference/operators/context/create_bloom_filter), [`context::create_lookup_table`](/reference/operators/context/create_lookup_table), [`context::remove`](/reference/operators/context/remove), [`context::reset`](/reference/operators/context/reset), [`context::save`](/reference/operators/context/save), [`create_geoip`](/reference/operators/context/create_geoip), [`enrich`](/reference/operators/context/enrich), [`erase`](/reference/operators/context/erase), [`inspect`](/reference/operators/context/inspect), [`list`](/reference/operators/context/list), [`update`](/reference/operators/context/update)