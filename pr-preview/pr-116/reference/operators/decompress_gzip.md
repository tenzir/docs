# decompress_gzip

Decompresses a stream of bytes in the Gzip format.

```tql
decompress_gzip
```

## Description

[Section titled “Description”](#description)

The `decompress_gzip` operator decompresses bytes in a pipeline incrementally. The operator supports decompressing multiple concatenated streams of the same codec transparently.

## Examples

[Section titled “Examples”](#examples)

### Import Suricata events from a Gzip-compressed file

[Section titled “Import Suricata events from a Gzip-compressed file”](#import-suricata-events-from-a-gzip-compressed-file)

```tql
load_file "eve.json.gz"
decompress_brotli
decompress_gzip
import
```

## See Also

[Section titled “See Also”](#see-also)

[`compress_gzip`](/reference/operators/compress_gzip), [`decompress_brotli`](/reference/operators/decompress_brotli), [`decompress_bz2`](/reference/operators/decompress_bz2), [`decompress_gzip`](/reference/operators/decompress_gzip), [`decompress_lz4`](/reference/operators/decompress_lz4), [`decompress_zstd`](/reference/operators/decompress_zstd)