# set

Assigns a value to a field, creating it if necessary.

```tql
field = expr
set field=expr...
```

## Description

[Section titled “Description”](#description)

Assigns a value to a field, creating it if necessary. If the field does not exist, it is appended to the end. If the field name is a path such as `foo.bar.baz`, records for `foo` and `bar` will be created if they do not exist yet.

Within assignments, the `move` keyword in front of a field causes a field to be removed from the input after evaluation.

Implied operator

The `set` operator is implied whenever a direct assignment is written. We recommend to use the implicit version. For example, use `test = 42` instead of `set test=42`.

Read our [language documentation](/explanations/language/statements/#assignment) for a more detailed description.

## Examples

[Section titled “Examples”](#examples)

### Append a new field

[Section titled “Append a new field”](#append-a-new-field)

```tql
from {a: 1, b: 2}
c = a + b
```

```tql
{a: 1, b: 2, c: 3}
```

### Update an existing field

[Section titled “Update an existing field”](#update-an-existing-field)

```tql
from {a: 1, b: 2}
a = "Hello"
```

```tql
{a: "Hello", b: 2}
```

### Move a field

[Section titled “Move a field”](#move-a-field)

```tql
from {a: 1}
b = move a
```

```tql
{b: 1}
```

## See Also

[Section titled “See Also”](#see-also)

[`move`](/reference/operators/move)