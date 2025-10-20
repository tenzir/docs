# select

Selects some values and discards the rest.

```tql
select (field|assignment)...
```

## Description

[Section titled “Description”](#description)

This operator keeps only the provided fields and drops the rest.

### `field`

[Section titled “field”](#field)

The field to keep. If it does not exist, it’s given the value `null` and a warning is emitted.

### `assignment`

[Section titled “assignment”](#assignment)

An assignment of the form `<field>=<expr>`.

## Examples

[Section titled “Examples”](#examples)

### Select and create columns

[Section titled “Select and create columns”](#select-and-create-columns)

Keep `a` and introduce `y` with the value of `b`:

```tql
from {a: 1, b: 2, c: 3}
select a, y=b
```

```tql
{a: 1, y: 2}
```

A more complex example with expressions and selection through records:

```tql
from {
  name: "foo",
  pos: {
    x: 1,
    y: 2,
  },
  state: "active",
}
select id=name.to_upper(), pos.x, added=true
```

```tql
{
  id: "FOO",
  pos: {
    x: 1,
  },
  added: true,
}
```

## See Also

[Section titled “See Also”](#see-also)

[`drop`](/reference/operators/drop), [`where`](/reference/operators/where)