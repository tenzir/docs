---
title: remove
---

Deletes a context.

```tql
context::remove name:string
```

## Description

The `context::remove` operator deletes the specified context.

### `name: string`

The name of the context to delete.

## Examples

### Delete a context

```tql
context::delete "ctx"
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
[`context::reset`](update),
[`context::save`](save),
[`context::update`](update)
