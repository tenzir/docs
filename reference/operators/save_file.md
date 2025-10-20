# save_file

Writes a byte stream to a file.

```tql
save_file path:string, [append=bool, real_time=bool, uds=bool]
```

## Description

[Section titled “Description”](#description)

Writes a byte stream to a file.

### `path: string`

[Section titled “path: string”](#path-string)

The file path to write to. If intermediate directories do not exist, they will be created. When `~` is the first character, it will be substituted with the value of the `$HOME` environment variable.

### `append = bool (optional)`

[Section titled “append = bool (optional)”](#append--bool-optional)

If `true`, appends to the file instead of overwriting it.

### `real_time = bool (optional)`

[Section titled “real\_time = bool (optional)”](#real_time--bool-optional)

If `true`, immediately synchronizes the file with every chunk of bytes instead of buffering bytes to batch filesystem write operations.

### `uds = bool (optional)`

[Section titled “uds = bool (optional)”](#uds--bool-optional)

If `true`, creates a Unix Domain Socket instead of a normal file. Cannot be combined with `append=true`.

## Examples

[Section titled “Examples”](#examples)

### Save bytes to a file

[Section titled “Save bytes to a file”](#save-bytes-to-a-file)

```tql
save_file "/tmp/out.txt"
```

## See Also

[Section titled “See Also”](#see-also)

[`files`](/reference/operators/files), [`load_file`](/reference/operators/load_file), [`save_stdout`](/reference/operators/save_stdout)