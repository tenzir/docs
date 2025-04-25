---
title: erase
---

Removes entries from a context.

```tql
context::erase name:string, key=any
```

## Description

The `context::erase` operator removes data from a context.

Use the `key` argument to specify the field in the input that should be
deleted from the context.

### `name: string`

The name of the context to remove entries from.

### `key = any`

The field that represents the enrichment key in the data.

## Examples

### Delete entries from a context

```
from {network: 10.0.0.1/16}
context::erase "network-classification", key=network
```

## See Also

[`context::create_bloom_filter`](create_bloom_filter),
[`context::create_geoip`](create_geoip),
[`context::create_lookup_table`](create_lookup_table),
[`context::enrich`](enrich),
[`context::inspect`](inspect),
[`context::list`](list),
[`context::load`](load),
[`context::remove`](remove),
[`context::reset`](reset),
[`context::save`](save),
[`context::update`](update)
