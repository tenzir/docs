# trim_end

Trims whitespace or specified characters from the end of a string.

```tql
trim_end(x:string, [chars:string]) -> string
```

## Description

[Section titled “Description”](#description)

The `trim_end` function removes characters from the end of `x`.

When called with one argument, it removes trailing whitespace. When called with two arguments, it removes any characters found in `chars` from the end of the string.

### `x: string`

[Section titled “x: string”](#x-string)

The string to trim.

### `chars: string (optional)`

[Section titled “chars: string (optional)”](#chars-string-optional)

A string where each character represents a character to remove. Any character found in this string will be trimmed from the end.

Defaults to whitespace characters.

## Examples

[Section titled “Examples”](#examples)

### Trim whitespace from the end

[Section titled “Trim whitespace from the end”](#trim-whitespace-from-the-end)

```tql
from {x: "hello ".trim_end()}
```

```tql
{x: "hello"}
```

### Trim specific characters

[Section titled “Trim specific characters”](#trim-specific-characters)

```tql
from {x: "/path/to/file/".trim_end("/")}
```

```tql
{x: "/path/to/file"}
```

### Trim multiple characters

[Section titled “Trim multiple characters”](#trim-multiple-characters)

```tql
from {x: "hello/-/".trim_end("/-")}
```

```tql
{x: "hello"}
```

## See Also

[Section titled “See Also”](#see-also)

[`trim`](/reference/functions/trim), [`trim_start`](/reference/functions/trim_start)