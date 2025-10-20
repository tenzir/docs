# where

Keeps only events for which the given predicate is true.

```tql
where predicate:bool
```

## Description

[Section titled “Description”](#description)

The `where` operator only keeps events that match the provided predicate and discards all other events. Only events for which it evaluates to `true` pass.

## Examples

[Section titled “Examples”](#examples)

### Keep only events where `src_ip` is `1.2.3.4`

[Section titled “Keep only events where src\_ip is 1.2.3.4”](#keep-only-events-where-src_ip-is-1234)

```tql
where src_ip == 1.2.3.4
```

### Use a nested field name and a temporal constraint on the `ts` field

[Section titled “Use a nested field name and a temporal constraint on the ts field”](#use-a-nested-field-name-and-a-temporal-constraint-on-the-ts-field)

```tql
where id.orig_h == 1.2.3.4 and ts > now() - 1h
```

### Combine subnet, size and duration constraints

[Section titled “Combine subnet, size and duration constraints”](#combine-subnet-size-and-duration-constraints)

```tql
where src_ip in 10.10.5.0/25 and (orig_bytes > 1Mi or duration > 30min)
```

## See Also

[Section titled “See Also”](#see-also)

[`assert`](/reference/operators/assert), [`drop`](/reference/operators/drop), [`select`](/reference/operators/select)