---
title: create_lookup_table
---

Creates a lookup table context.

```tql
context::create_lookup_table name:string
```

## Description

The `context::create_lookup_table` operator constructs a new context of type
[lookup table](../../../explanations/enrichment#lookup-table).

You can also create a lookup table as code by adding it to `tenzir.contexts` in
your `tenzir.yaml`:

```yaml title="<prefix>/etc/tenzir/tenzir.yaml"
tenzir:
  contexts:
    my-table:
      type: lookup-table
```

### `name: string`

The name of the new lookup table.

## Examples

### Create a new lookup table context

```tql
context::create_lookup_table "ctx"
```

## See Also

[`context::create_bloom_filter`](create_bloom_filter),
[`context::create_geoip`](create_geoip),
[`context::enrich`](enrich),
[`context::erase`](erase),
[`context::inspect`](inspect),
[`context::list`](list),
[`context::load`](load),
[`context::remove`](remove),
[`context::reset`](update),
[`context::save`](save),
[`context::update`](update)
