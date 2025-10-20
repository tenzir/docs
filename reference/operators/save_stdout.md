# save_stdout

Writes a byte stream to standard output.

```tql
save_stdout
```

## Description

[Section titled “Description”](#description)

Writes a byte stream to standard output. This is mostly useful when using the `tenzir` executable as part of a shell script.

## Examples

[Section titled “Examples”](#examples)

### Write colored, compact TQL-style

[Section titled “Write colored, compact TQL-style”](#write-colored-compact-tql-style)

```tql
from {x: "Hello World"}
write_tql compact=true, color=true
save_stdout
```

```tql
{x: "Hello World"}
```

## See Also

[Section titled “See Also”](#see-also)

[`load_stdin`](/reference/operators/load_stdin), [`save_file`](/reference/operators/save_file)