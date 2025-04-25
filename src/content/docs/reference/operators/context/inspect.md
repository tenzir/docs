---
title: inspect
---

Resets a context.

```tql
context::inspect name:string
```

## Description

The `context::inspect` operator shows details about a specified context.

### `name: string`

The name of the context to inspect.

## Examples

### Inspect a context

Add data to the lookup table:

```tql
from {x:1, y:"a"},
     {x:2, y:"b"}
context::update "ctx", key=x, value=y
```

Retrieve the lookup table contents:

```tql
context::inspect "ctx"
```

```tql
{key: 2, value: "b"}
{key: 1, value: "a"}
```

## See Also

[`context::create_bloom_filter`](create_bloom_filter),
[`context::create_geoip`](create_geoip),
[`context::create_lookup_table`](create_lookup_table),
[`context::enrich`](enrich),
[`context::erase`](enrich),
[`context::list`](list),
[`context::load`](load),
[`context::remove`](remove),
[`context::reset`](reset),
[`context::save`](save),
[`context::update`](update)
