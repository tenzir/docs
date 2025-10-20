# replace

Replaces characters within a string.

```tql
replace(x:string, pattern:string, replacement:string, [max=int]) -> string
```

## Description

[Section titled “Description”](#description)

The `replace` function returns a new string where occurrences of `pattern` in `x` are replaced with `replacement`, up to `max` times. If `max` is omitted, all occurrences are replaced.

### `x: string`

[Section titled “x: string”](#x-string)

The subject to replace the action on.

### `pattern: string`

[Section titled “pattern: string”](#pattern-string)

The pattern to replace in `x`.

### `replacement: string`

[Section titled “replacement: string”](#replacement-string)

The replacement value for `pattern`.

### `max = int (optional)`

[Section titled “max = int (optional)”](#max--int-optional)

The maximum number of replacements to perform.

If the option is not set, all occurrences are replaced.

## Examples

[Section titled “Examples”](#examples)

### Replace all occurrences of a character

[Section titled “Replace all occurrences of a character”](#replace-all-occurrences-of-a-character)

```tql
from {x: "hello".replace("l", "r")}
```

```tql
{x: "herro"}
```

### Replace a limited number of occurrences

[Section titled “Replace a limited number of occurrences”](#replace-a-limited-number-of-occurrences)

```tql
from {x: "hello".replace("l", "r", max=1)}
```

```tql
{x: "herlo"}
```

## See Also

[Section titled “See Also”](#see-also)

[`replace_regex`](/reference/functions/replace_regex), [`replace`](/reference/operators/replace)