# enumerate

Add a field with the number of preceding events.

```tql
enumerate [out:field, group=any]
```

## Description

[Section titled “Description”](#description)

The `enumerate` operator adds a new field with the number of preceding events to the beginning of the input record.

### `out: field (optional)`

[Section titled “out: field (optional)”](#out-field-optional)

Sets the name of the output field.

Defaults to `"#"`.

### `group: any (optional)`

[Section titled “group: any (optional)”](#group-any-optional)

Groups events by the specified expression and enumerates within each group. When provided, an independent enumeration counter is used for each unique value of the grouping expression.

## Examples

[Section titled “Examples”](#examples)

### Enumerate the input by prepending row numbers

[Section titled “Enumerate the input by prepending row numbers”](#enumerate-the-input-by-prepending-row-numbers)

```tql
from {x: "a"}, {x: "b"}, {x: "c"}
enumerate
```

```tql
{"#": 0, x: "a"}
{"#": 1, x: "b"}
{"#": 2, x: "c"}
```

### Use a custom field for the row numbers

[Section titled “Use a custom field for the row numbers”](#use-a-custom-field-for-the-row-numbers)

```tql
from {x: true}, {x: false}
enumerate index
```

```tql
{index: 0, x: true}
{index: 1, x: false}
```

### Count within groups

[Section titled “Count within groups”](#count-within-groups)

```tql
from {x: 1}, {x: 2}, {x: 1}, {x: 2}
enumerate count, group=x
count = count + 1
```

```tql
{count: 1, x: 1}
{count: 1, x: 2}
{count: 2, x: 1}
{count: 2, x: 2}
```