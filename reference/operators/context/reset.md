# context::reset

Resets a context.

```tql
context::reset name:string
```

## Description

[Section titled “Description”](#description)

The `context::reset` operator erases all data that has been added with `context::update`.

### `name: string`

[Section titled “name: string”](#name-string)

The name of the context to reset.

## Examples

[Section titled “Examples”](#examples)

### Reset a context

[Section titled “Reset a context”](#reset-a-context)

```tql
context::reset "ctx"
```

## See Also

[Section titled “See Also”](#see-also)

[`context::create_bloom_filter`](/reference/operators/context/create_bloom_filter), [`context::create_geoip`](/reference/operators/context/create_geoip), [`context::create_lookup_table`](/reference/operators/context/create_lookup_table), [`context::load`](/reference/operators/context/load), [`context::remove`](/reference/operators/context/remove), [`context::save`](/reference/operators/context/save), [`enrich`](/reference/operators/context/enrich), [`erase`](/reference/operators/context/erase), [`inspect`](/reference/operators/context/inspect), [`list`](/reference/operators/context/list), [`update`](/reference/operators/context/update)