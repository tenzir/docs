# parent_dir

Extracts the parent directory from a file path.

```tql
parent_dir(x:string) -> string
```

## Description

[Section titled “Description”](#description)

The `parent_dir` function returns the parent directory path of the given file path, excluding the file name.

## Examples

[Section titled “Examples”](#examples)

### Extract the parent directory from a file path

[Section titled “Extract the parent directory from a file path”](#extract-the-parent-directory-from-a-file-path)

```tql
from {x: parent_dir("/path/to/log.json")}
```

```tql
{x: "/path/to"}
```

## See Also

[Section titled “See Also”](#see-also)

[`file_name`](/reference/functions/file_name)