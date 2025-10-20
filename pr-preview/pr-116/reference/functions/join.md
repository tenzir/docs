# join

Joins a list of strings into a single string using a separator.

```tql
join(xs:list, [separator:string]) -> string
```

## Description

[Section titled “Description”](#description)

The `join` function concatenates the elements of the input list `xs` into a single string, separated by the specified `separator`.

### `xs: list`

[Section titled “xs: list”](#xs-list)

A list of strings to join.

### `separator: string (optional)`

[Section titled “separator: string (optional)”](#separator-string-optional)

The string used to separate elements in the result.

Defaults to `""`.

## Examples

[Section titled “Examples”](#examples)

### Join a list of strings with a comma

[Section titled “Join a list of strings with a comma”](#join-a-list-of-strings-with-a-comma)

```tql
from {x: join(["a", "b", "c"], "-")}
```

```tql
{x: "a-b-c"}
```

## See Also

[Section titled “See Also”](#see-also)

[`split`](/reference/functions/split), [`split_regex`](/reference/functions/split_regex)