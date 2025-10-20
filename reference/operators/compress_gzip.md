# compress_gzip

Compresses a stream of bytes using gzip compression.

```tql
compress_gzip [level=int, window_bits=int, format=string]
```

## Description

[Section titled “Description”](#description)

The `compress_gzip` operator compresses bytes in a pipeline incrementally.

### `level = int (optional)`

[Section titled “level = int (optional)”](#level--int-optional)

The compression level to use. The supported values depend on the codec used. If omitted, the default level for the codec is used.

### `window_bits = int (optional)`

[Section titled “window\_bits = int (optional)”](#window_bits--int-optional)

A number representing the encoder window bits.

### `format = string (optional)`

[Section titled “format = string (optional)”](#format--string-optional)

A string representing the used format. Possible values are `zlib`, `deflate` and `gzip`.

Defaults to `gzip`.

## Examples

[Section titled “Examples”](#examples)

### Export all events in a Gzip-compressed NDJSON file

[Section titled “Export all events in a Gzip-compressed NDJSON file”](#export-all-events-in-a-gzip-compressed-ndjson-file)

```tql
export
write_ndjson
compress_gzip
save_file "/tmp/backup.json.gz"
```

### Compress using Gzip deflate

[Section titled “Compress using Gzip deflate”](#compress-using-gzip-deflate)

```tql
export
write_ndjson
compress_gzip format="deflate"
```

### Recompress a Gzip-compressed file at a different compression level

[Section titled “Recompress a Gzip-compressed file at a different compression level”](#recompress-a-gzip-compressed-file-at-a-different-compression-level)

```tql
load_file "in.gzip"
decompress_gzip
compress_gzip level=18
save_file "out.gzip"
```

## See Also

[Section titled “See Also”](#see-also)

[`compress_brotli`](/reference/operators/compress_brotli), [`compress_bz2`](/reference/operators/compress_bz2), [`compress_lz4`](/reference/operators/compress_lz4), [`compress_zstd`](/reference/operators/compress_zstd), [`decompress_gzip`](/reference/operators/decompress_gzip)