---
title: save
---

Saves context state.

```tql
context::save name:string
```

## Description

The `context::save` operator dumps the state of the specified context into its
(binary) output.

### `name: string`

The name of the context whose state to save.

## Examples

### Store the database of a GeoIP context

```tql
context::save "ctx"
save_file "snapshot.mmdb"
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
[`context::reset`](reset),
[`context::update`](update)
