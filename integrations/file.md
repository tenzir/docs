# File

Tenzir supports reading from and writing to files, including non-regular files, such as [Unix domain sockets](https://en.wikipedia.org/wiki/Unix_domain_socket), standard input, standard output, and standard error.

![File](/_astro/file.BdqTXxJ3_19DKCs.svg)

When `~` is the first character in the file path, the operator substitutes it with the `$HOME` environment variable.

URL Support

The URL scheme `file://` dispatches to [`load_file`](/reference/operators/load_file) and [`save_file`](/reference/operators/save_file) for seamless URL-style use via [`from`](/reference/operators/from) and [`to`](/reference/operators/to).

## Examples

[Section titled “Examples”](#examples)

### Read a file

[Section titled “Read a file”](#read-a-file)

Read from a file and parse it in the format applied by the file extension:

```tql
from "/tmp/file.json"
```

The [`from`](/reference/operators/from) operator automatically decompresses the file, if the suffix list contains a [supported compression algorithm](/reference/operators/from#compression):

```tql
from "/tmp/file.json.gz"
```

Some operators perform better when the entire file arrives as a single block of bytes, such as the [`yara`](/reference/operators/yara) operator. In this case, passing `mmap=true` runs more efficiently:

```tql
from "/sandbox/malware.gz", mmap=true {
  decompress "gzip"
  yara "rule.yaml"
}
```

### Follow a file

[Section titled “Follow a file”](#follow-a-file)

A pipeline typically completes once it reads the end of a file. Pass `follow=true` to disable this behavior and instead wait for new data written to it. This is similar to running `tail -f` on a file.

```plaintext
from "/tmp/never-ending-stream.ndjson", follow=true
```

### Write a file

[Section titled “Write a file”](#write-a-file)

Write to a file in the format implied by the file extension:

```tql
version
to "/tmp/tenzir-version.json"
```

The [`to`](/reference/operators/to) operator automatically compresses the file, if the suffix list contains a [supported compression algorithm](/reference/operators/to#compression):

```tql
version
to "/tmp/tenzir-version.json.bz2"
```

### Append to a file

[Section titled “Append to a file”](#append-to-a-file)

In case the file exists and you do not want to overwrite it, pass `append=true` as option:

```tql
from {x: 42}
to "/tmp/event.csv", append=true
```

### Read/write a Unix domain socket

[Section titled “Read/write a Unix domain socket”](#readwrite-a-unix-domain-socket)

Pass `uds=true` to signal that the file is a Unix domain socket:

```tql
to "/tmp/socket", uds=true {
  write_ndjson
}
```

When reading from a Unix domain socket, Tenzir automatically figures out whether the file is regular or a socket:

```tql
from "/tmp/socket" {
  read_ndjson
}
```