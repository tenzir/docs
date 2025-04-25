---
title: load
---

Loads context state.

```tql
context::load name:string
```

## Description

The `context::load` operator replaces the state of the specified context with
its (binary) input.

### `name: string`

The name of the context whose state to update.

## Examples

### Replace the database of a GeoIP context

```tql
load_file "ultra-high-res.mmdb", mmap=true
context::load "ctx"
```

## See Also

[`context::create_bloom_filter`](create_bloom_filter),
[`context::create_geoip`](create_geoip),
[`context::create_lookup_table`](create_lookup_table),
[`context::enrich`](enrich),
[`context::erase`](erase),
[`context::inspect`](inspect),
[`context::list`](list),
[`context::remove`](remove),
[`context::reset`](reset),
[`context::save`](save),
[`context::update`](update)
