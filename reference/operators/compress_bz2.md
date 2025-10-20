# compress_bz2

Compresses a stream of bytes using bz2 compression.

```tql
compress_bz2 [level=int]
```

## Description

[Section titled “Description”](#description)

The `compress_bz2` operator compresses bytes in a pipeline incrementally.

### `level = int (optional)`

[Section titled “level = int (optional)”](#level--int-optional)

The compression level to use. The supported values depend on the codec used. If omitted, the default level for the codec is used.

## Examples

[Section titled “Examples”](#examples)

### Export all events in a Bzip2-compressed NDJSON file

[Section titled “Export all events in a Bzip2-compressed NDJSON file”](#export-all-events-in-a-bzip2-compressed-ndjson-file)

```tql
export
write_ndjson
compress_bz2
save_file "/tmp/backup.json.bz2"
```

### Recompress a Bzip2-compressed file at a different compression level

[Section titled “Recompress a Bzip2-compressed file at a different compression level”](#recompress-a-bzip2-compressed-file-at-a-different-compression-level)

```tql
load_file "in.bz2"
decompress_bz2
compress_bz2 level=18
save_file "out.bz2"
```

## See Also

[Section titled “See Also”](#see-also)

[`compress_brotli`](/reference/operators/compress_brotli), [`compress_gzip`](/reference/operators/compress_gzip), [`compress_lz4`](/reference/operators/compress_lz4), [`compress_zstd`](/reference/operators/compress_zstd), [`decompress_bz2`](/reference/operators/decompress_bz2)