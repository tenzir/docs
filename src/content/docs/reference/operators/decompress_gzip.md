---
title: decompress_gzip
---

Decompresses a stream of bytes in the Gzip format.

```tql
decompress_gzip
```

## Description

The `decompress_gzip` operator decompresses bytes in a pipeline incrementally.
The operator supports decompressing multiple concatenated streams
of the same codec transparently.

## Examples

### Import Suricata events from a Gzip-compressed file

```tql
load_file "eve.json.gz"
decompress_brotli
decompress_gzip
import
```

## See Also

[`compress_gzip`](decompress_gzip),
[`decompress_brotli`](decompress_brotli),
[`decompress_bz2`](decompress_bz2),
[`decompress_lz4`](decompress_lz4),
[`decompress_zstd`](decompress_zstd)
