---
title: reset
---

Resets a context.

```tql
context::reset name:string
```

## Description

The `context::reset` operator erases all data that has been added with
`context::update`.

### `name: string`

The name of the context to reset.

## Examples

### Reset a context

```tql
context::reset "ctx"
```

## See Also

[`context::create_bloom_filter`](create_bloom_filter),
[`context::create_geoip`](create_geoip),
[`context::create_lookup_table`](create_lookup_table),
[`context::enrich`](enrich),
[`context::erase`](erase),
[`context::inspect`](inspect),
[`context::list`](list),
[`context::load`](load),
[`context::remove`](remove),
[`context::save`](save),
[`context::update`](update)
