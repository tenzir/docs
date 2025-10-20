# trim_start

Trims whitespace or specified characters from the start of a string.

```tql
trim_start(x:string, [chars:string]) -> string
```

## Description

[Section titled “Description”](#description)

The `trim_start` function removes characters from the beginning of `x`.

When called with one argument, it removes leading whitespace. When called with two arguments, it removes any characters found in `chars` from the start of the string.

### `x: string`

[Section titled “x: string”](#x-string)

The string to trim.

### `chars: string (optional)`

[Section titled “chars: string (optional)”](#chars-string-optional)

A string where each character represents a character to remove. Any character found in this string will be trimmed from the start.

Defaults to whitespace characters.

## Examples

[Section titled “Examples”](#examples)

### Trim whitespace from the start

[Section titled “Trim whitespace from the start”](#trim-whitespace-from-the-start)

```tql
from {x: " hello".trim_start()}
```

```tql
{x: "hello"}
```

### Trim specific characters

[Section titled “Trim specific characters”](#trim-specific-characters)

```tql
from {x: "/path/to/file".trim_start("/")}
```

```tql
{x: "path/to/file"}
```

### Trim multiple characters

[Section titled “Trim multiple characters”](#trim-multiple-characters)

```tql
from {x: "/-/hello".trim_start("/-")}
```

```tql
{x: "hello"}
```

## See Also

[Section titled “See Also”](#see-also)

[`trim`](/reference/functions/trim), [`trim_end`](/reference/functions/trim_end)