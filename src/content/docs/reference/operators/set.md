---
title: set
---

Assigns a value to a field, creating it if necessary.

```tql
field = expr
set field=expr...
```

## Description

Assigns a value to a field, creating it if necessary. If the field does not
exist, it is appended to the end. If the field name is a path such as
`foo.bar.baz`, records for `foo` and `bar` will be created if they do not exist
yet.

Within assignments, the `move` keyword in front of a field causes a field to be
removed from the input after evaluation.

:::tip
The `set` operator is implied whenever a direct assignment is written. We
recommend to use the implicit version. For example, use `test = 42` instead of
`set test=42`.

A more detailed description of assignments can be found
[here](../language/statements.md#assignment).
:::

## Examples

### Append a new field

```tql
from {a: 1, b: 2}
c = a + b
```

```tql
{a: 1, b: 2, c: 3}
```

### Update an existing field

```tql
from {a: 1, b: 2}
a = "Hello"
```

```tql
{a: "Hello", b: 2}
```

### Move a field

```tql
from {a: 1}
b = move a
```

```tql
{b: 1}
```

## See Also

[`move`](move)
