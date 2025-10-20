# replace_regex

Replaces characters within a string based on a regular expression.

```tql
replace_regex(x:string, pattern:string, replacement:string, [max=int]) -> string
```

## Description

[Section titled “Description”](#description)

The `replace_regex` function returns a new string where substrings in `x` that match `pattern` are replaced with `replacement`, up to `max` times. If `max` is omitted, all matches are replaced.

### `x: string`

[Section titled “x: string”](#x-string)

The subject to replace the action on.

### `pattern: string`

[Section titled “pattern: string”](#pattern-string)

The pattern (as regular expression) to replace in `x`.

### `replacement: string`

[Section titled “replacement: string”](#replacement-string)

The replacement value for `pattern`.

### `max = int (optional)`

[Section titled “max = int (optional)”](#max--int-optional)

The maximum number of replacements to perform.

If the option is not set, all occurrences are replaced.

## Examples

[Section titled “Examples”](#examples)

### Replace all matches of a regular expression

[Section titled “Replace all matches of a regular expression”](#replace-all-matches-of-a-regular-expression)

```tql
from {x: replace_regex("hello", "l+", "y")}
```

```tql
{x: "heyo"}
```

### Replace a limited number of matches

[Section titled “Replace a limited number of matches”](#replace-a-limited-number-of-matches)

```tql
from {x: replace_regex("hellolo", "l+", "y", max=1)}
```

```tql
{x: "heyolo"}
```

## See Also

[Section titled “See Also”](#see-also)

[`replace`](/reference/functions/replace)