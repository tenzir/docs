---
title: create_lookup_table
---

Creates a lookup table context.

```tql
context::create_lookup_table name:string
```

## Description

The `context::create_lookup_table` operator constructs a new context of type
[lookup table](../../../enrichment/README.md#lookup-table).

You can also create a lookup table as code by adding it to `tenzir.contexts` in
your `tenzir.yaml`:

```yaml {0} title="<prefix>/etc/tenzir/tenzir.yaml"
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

[`context::create_bloom_filter`](create_bloom_filter.md),
[`context::create_geoip`](create_geoip.md),
[`context::enrich`](enrich.md),
[`context::erase`](erase.md),
[`context::inspect`](inspect.md),
[`context::list`](list.md),
[`context::load`](load.md),
[`context::remove`](remove.md),
[`context::reset`](update.md),
[`context::save`](save.md),
[`context::update`](update.md),
