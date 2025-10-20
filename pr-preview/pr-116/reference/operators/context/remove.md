# context::remove

Deletes a context.

```tql
context::remove name:string
```

## Description

[Section titled “Description”](#description)

The `context::remove` operator deletes the specified context.

### `name: string`

[Section titled “name: string”](#name-string)

The name of the context to delete.

## Examples

[Section titled “Examples”](#examples)

### Delete a context

[Section titled “Delete a context”](#delete-a-context)

```tql
context::delete "ctx"
```

## See Also

[Section titled “See Also”](#see-also)

[`context::create_bloom_filter`](/reference/operators/context/create_bloom_filter), [`context::create_lookup_table`](/reference/operators/context/create_lookup_table), [`context::inspect`](/reference/operators/context/inspect), [`context::load`](/reference/operators/context/load), [`context::save`](/reference/operators/context/save), [`create_geoip`](/reference/operators/context/create_geoip), [`enrich`](/reference/operators/context/enrich), [`erase`](/reference/operators/context/erase), [`list`](/reference/operators/context/list), [`reset`](/reference/operators/context/reset), [`update`](/reference/operators/context/update)