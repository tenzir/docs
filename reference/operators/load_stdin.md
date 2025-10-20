# load_stdin

Accepts bytes from standard input.

```tql
load_stdin
```

## Description

[Section titled “Description”](#description)

Accepts bytes from standard input. This is mostly useful when using the `tenzir` executable as part of a shell script.

## Examples

[Section titled “Examples”](#examples)

### Pipe text into `tenzir`

[Section titled “Pipe text into tenzir”](#pipe-text-into-tenzir)

```sh
echo "Hello World" | tenzir
```

```tql
load_stdin
read_lines
```

```tql
{
  line: "Hello World",
}
```

## See Also

[Section titled “See Also”](#see-also)

[`save_stdout`](/reference/operators/save_stdout), [`load_file`](/reference/operators/load_file)