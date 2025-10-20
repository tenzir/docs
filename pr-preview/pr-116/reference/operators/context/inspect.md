# context::inspect

Resets a context.

```tql
context::inspect name:string
```

## Description

[Section titled “Description”](#description)

The `context::inspect` operator shows details about a specified context.

### `name: string`

[Section titled “name: string”](#name-string)

The name of the context to inspect.

## Examples

[Section titled “Examples”](#examples)

### Inspect a context

[Section titled “Inspect a context”](#inspect-a-context)

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

[Section titled “See Also”](#see-also)

[`context::create_bloom_filter`](/reference/operators/context/create_bloom_filter), [`context::create_lookup_table`](/reference/operators/context/create_lookup_table), [`context::erase`](/reference/operators/context/enrich), [`context::load`](/reference/operators/context/load), [`context::remove`](/reference/operators/context/remove), [`context::reset`](/reference/operators/context/reset), [`context::save`](/reference/operators/context/save), [`create_geoip`](/reference/operators/context/create_geoip), [`erase`](/reference/operators/context/erase), [`list`](/reference/operators/context/list), [`update`](/reference/operators/context/update)