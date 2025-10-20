# read_all

Parses an incoming bytes stream into a single event.

```tql
read_all [binary=bool]
```

## Description

[Section titled “Description”](#description)

The `read_all` operator takes its input bytes and produces a single event that contains everything. This is useful if the entire stream is needed for further processing at once.

The resulting events have a single field called `data`.

### `binary = bool (optional)`

[Section titled “binary = bool (optional)”](#binary--bool-optional)

Treat the input as binary data instead of UTF-8 text. When enabled, invalid UTF-8 sequences will not cause warnings, and the resulting `data` field will be of type `blob` instead of `string`.

## Examples

[Section titled “Examples”](#examples)

### Read an entire text file into a single event

[Section titled “Read an entire text file into a single event”](#read-an-entire-text-file-into-a-single-event)

```tql
load_file "data.txt"
read_all
```

```tql
{data: "<file contents>"}
```

### Read an entire binary file into a single event

[Section titled “Read an entire binary file into a single event”](#read-an-entire-binary-file-into-a-single-event)

```tql
load_file "data.bin"
read_all binary=true
```

```tql
{data: b"<file contents>"}
```

## See Also

[Section titled “See Also”](#see-also)

[`read_delimited`](/reference/operators/read_delimited), [`read_delimited_regex`](/reference/operators/read_delimited_regex), [`read_lines`](/reference/operators/read_lines),