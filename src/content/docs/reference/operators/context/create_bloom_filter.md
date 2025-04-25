---
title: create_bloom_filter
---

Creates a Bloom filter context.

```tql
context::create_bloom_filter name:string, capacity=int, fp_probability=float
```

## Description

The `context::create_bloom_filter` operator constructs a new context of type
[Bloom filter](../../../enrichment/README.md#bloom-filter).

To find suitable values for the capacity and false-positive probability, Consult
Thomas Hurst's [Bloom Filter Calculator](https://hur.st/bloomfilter/). The
parameter `p` corresponds to `capacity` and `p` to `fp_probability`.

You can also create a Bloom filter context as code by adding it to
`tenzir.contexts` in your `tenzir.yaml`:

```yaml {0} title="<prefix>/etc/tenzir/tenzir.yaml"
tenzir:
  contexts:
    my-iocs:
      type: bloom-filter
      arguments:
        capacity: 1B
        fp-probability: 0.001
```

Making changes to `arguments` of an already created context has no effect.

### `name: string`

The name of the new Bloom filter.

### `capacity = uint`

The maximum number of items in the filter that maintain the false positive
probability. Adding more elements does not yield an error, but lookups will
more likely return false positives.

### `fp_probability = float`

The false-positive probability of the Bloom filter.

## Examples

### Create a new Bloom filter context

```tql
context::create_bloom_filter "ctx", capacity=1B, fp_probability=0.001
```

## See Also

[`context::create_lookup_table`](create_lookup_table),
[`context::create_geoip`](create_geoip),
[`context::enrich`](enrich),
[`context::erase`](erase),
[`context::inspect`](inspect),
[`context::list`](list),
[`context::load`](load),
[`context::remove`](remove),
[`context::reset`](update),
[`context::save`](save),
[`context::update`](update),
