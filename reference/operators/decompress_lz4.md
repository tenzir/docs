# decompress_lz4

Decompresses a stream of bytes in the Lz4 format.

```tql
decompress_lz4
```

## Description

[Section titled “Description”](#description)

The `decompress_lz4` operator decompresses bytes in a pipeline incrementally. The operator supports decompressing multiple concatenated streams of the same codec transparently.

## Examples

[Section titled “Examples”](#examples)

### Import Suricata events from a LZ4-compressed file

[Section titled “Import Suricata events from a LZ4-compressed file”](#import-suricata-events-from-a-lz4-compressed-file)

```tql
load_file "eve.json.lz4"
decompress_lz4
read_suricata
import
```

## See Also

[Section titled “See Also”](#see-also)

[`compress_lz4`](/reference/operators/compress_lz4), [`decompress_brotli`](/reference/operators/decompress_brotli), [`decompress_bz2`](/reference/operators/decompress_bz2), [`decompress_gzip`](/reference/operators/decompress_gzip), [`decompress_lz4`](/reference/operators/decompress_lz4), [`decompress_zstd`](/reference/operators/decompress_zstd)