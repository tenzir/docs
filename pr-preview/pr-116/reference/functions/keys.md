# keys

Retrieves a list of field names from a record.

```tql
keys(x:record) -> list<string>
```

## Description

[Section titled “Description”](#description)

The `keys` function returns a list of strings containing all field names from the input record `x`.

### `x: record`

[Section titled “x: record”](#x-record)

The record whose field names you want to retrieve.

## Examples

[Section titled “Examples”](#examples)

### Get all field names from a record

[Section titled “Get all field names from a record”](#get-all-field-names-from-a-record)

```tql
from {x: 1, y: "hello", z: true}
select field_names = this.keys()
```

```tql
{
  field_names: ["x", "y", "z"],
}
```

### Use keys to dynamically access record fields

[Section titled “Use keys to dynamically access record fields”](#use-keys-to-dynamically-access-record-fields)

You can combine `keys` with sorting and element access to dynamically select fields from records. For example, the following collects the values from the element with the first key alphabetically in each record:

```tql
from (
  {foo: 10, bar: 20, baz: 30},
  {foo: 100, bar: 200},
  {baz: 300, qux: 400},
  {},
)
summarize first_sorted_key = this[this.keys().sort().first()]?.collect()
```

```tql
{
  first_sorted_key: [20, 200, 300],
}
```

### Use keys to get distribution of available fields

[Section titled “Use keys to get distribution of available fields”](#use-keys-to-get-distribution-of-available-fields)

```tql
from (
  {foo: 10, bar: 20, baz: 30},
  {foo: 100, bar: 200},
  {baz: 300, qux: 400},
  {},
)
select key = this.keys()
unroll key
top key
```

```tql
{name: "foo", count: 2}
{name: "bar", count: 2}
{name: "baz", count: 2}
{name: "qux", count: 1}
```

## See also

[Section titled “See also”](#see-also)

[`has`](/reference/functions/has), [`get`](/reference/functions/get)