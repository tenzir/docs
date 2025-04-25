---
title: decompress_brotli
---

Decompresses a stream of bytes in the Brotli format.

```tql
decompress_brotli
```

## Description

The `decompress_brotli` operator decompresses bytes in a pipeline incrementally.
The operator supports decompressing multiple concatenated streams
of the same codec transparently.

## Examples

### Import Suricata events from a Brotli-compressed file

```tql
load_file "eve.json.brotli"
decompress_brotli
read_suricata
import
```

## See Also

[`compress_brotli`](decompress_brotli),
[`decompress_bz2`](decompress_bz2),
[`decompress_gzip`](decompress_gzip),
[`decompress_lz4`](decompress_lz4),
[`decompress_zstd`](decompress_zstd)
