# file_name

Extracts the file name from a file path.

```tql
file_name(x:string) -> string
```

## Description

[Section titled “Description”](#description)

The `file_name` function returns the file name component of a file path, excluding the parent directories.

## Examples

[Section titled “Examples”](#examples)

### Extract the file name from a file path

[Section titled “Extract the file name from a file path”](#extract-the-file-name-from-a-file-path)

```tql
from {x: file_name("/path/to/log.json")}
```

```tql
{x: "log.json"}
```

## See Also

[Section titled “See Also”](#see-also)

[`parent_dir`](/reference/functions/parent_dir)