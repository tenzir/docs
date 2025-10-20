# split

Splits a string into substrings.

```tql
split(x:string, pattern:string, [max:int], [reverse:bool]) -> list
```

## Description

[Section titled “Description”](#description)

The `split` function splits the input string `x` into a list of substrings using the specified `pattern`. Optional arguments allow limiting the number of splits (`max`) and reversing the splitting direction (`reverse`).

### `x: string`

[Section titled “x: string”](#x-string)

The string to split.

### `pattern: string`

[Section titled “pattern: string”](#pattern-string)

The delimiter or pattern used for splitting.

### `max: int (optional)`

[Section titled “max: int (optional)”](#max-int-optional)

The maximum number of splits to perform.

Defaults to `0`, meaning no limit.

### `reverse: bool (optional)`

[Section titled “reverse: bool (optional)”](#reverse-bool-optional)

If `true`, splits from the end of the string.

Defaults to `false`.

## Examples

[Section titled “Examples”](#examples)

### Split a string by a delimiter

[Section titled “Split a string by a delimiter”](#split-a-string-by-a-delimiter)

```tql
from {xs: split("a,b,c", ",")}
```

```tql
{xs: ["a", "b", "c"]}
```

### Limit the number of splits

[Section titled “Limit the number of splits”](#limit-the-number-of-splits)

```tql
from {xs: split("a-b-c", "-", max=1)}
```

```tql
{xs: ["a", "b-c"]}
```

## See Also

[Section titled “See Also”](#see-also)

[`split_regex`](/reference/functions/split_regex), [`join`](/reference/functions/join)