# decompress_bz2

Decompresses a stream of bytes in the Bzip2 format.

```tql
decompress_bz2
```

## Description

[Section titled “Description”](#description)

The `decompress_bz2` operator decompresses bytes in a pipeline incrementally. The operator supports decompressing multiple concatenated streams of the same codec transparently.

## Examples

[Section titled “Examples”](#examples)

### Import Suricata events from a Bzip2-compressed file

[Section titled “Import Suricata events from a Bzip2-compressed file”](#import-suricata-events-from-a-bzip2-compressed-file)

```tql
load_file "eve.json.bz"
decompress_bz2
read_suricata
import
```

## See Also

[Section titled “See Also”](#see-also)

[`compress_bz2`](/reference/operators/compress_bz2), [`decompress_brotli`](/reference/operators/decompress_brotli), [`decompress_bz2`](/reference/operators/decompress_bz2), [`decompress_gzip`](/reference/operators/decompress_gzip), [`decompress_lz4`](/reference/operators/decompress_lz4), [`decompress_zstd`](/reference/operators/decompress_zstd)