# compress

Compresses a stream of bytes.

```tql
compress codec:string, [level=int]
```

Deprecated

The `compress` operator is deprecated. You should use the [bespoke operators](/reference/operators#encode--decode) instead. These operators offer more options for some of the formats.

## Description

[Section titled “Description”](#description)

The `compress` operator compresses bytes in a pipeline incrementally with a known codec.

Streaming Compression

The operator uses [Apache Arrow’s compression utilities](https://arrow.apache.org/docs/cpp/api/utilities.html#compression) under the hood, and transparently supports all options that Apache Arrow supports for streaming compression.

Besides the supported `brotli`, `bz2`, `gzip`, `lz4`, and `zstd`, Apache Arrow also ships with codecs for `lzo`, `lz4_raw`, `lz4_hadoop` and `snappy`, which only support oneshot compression. Support for them is not currently implemented.

### `codec: string`

[Section titled “codec: string”](#codec-string)

An identifier of the codec to use. Currently supported are `brotli`, `bz2`, `gzip`, `lz4`, and `zstd`.

### `level = int (optional)`

[Section titled “level = int (optional)”](#level--int-optional)

The compression level to use. The supported values depend on the codec used. If omitted, the default level for the codec is used.

## Examples

[Section titled “Examples”](#examples)

### Export all events in a Gzip-compressed NDJSON file

[Section titled “Export all events in a Gzip-compressed NDJSON file”](#export-all-events-in-a-gzip-compressed-ndjson-file)

```tql
export
write_ndjson
compress "gzip"
save_file "/tmp/backup.json.gz"
```

### Recompress a Zstd-compressed file at a higher compression level

[Section titled “Recompress a Zstd-compressed file at a higher compression level”](#recompress-a-zstd-compressed-file-at-a-higher-compression-level)

```tql
load_file "in.zst"
decompress "zstd"
compress "zstd", level=18
save_file "out.zst"
```