# write_feather

Transforms the input event stream to Feather byte stream.

```tql
write_feather [compression_level=int, compression_type=str, min_space_savings=double]
```

## Description

[Section titled “Description”](#description)

Transforms the input event stream to [Feather](https://arrow.apache.org/docs/python/feather.html) (a thin wrapper around [Apache Arrow’s IPC](https://arrow.apache.org/docs/python/ipc.html) wire format) byte stream.

### `compression_level = int (optional)`

[Section titled “compression\_level = int (optional)”](#compression_level--int-optional)

An optional compression level for the corresponding compression type. This option is ignored if no compression type is specified.

Defaults to the compression type’s default compression level.

### `compression_type = str (optional)`

[Section titled “compression\_type = str (optional)”](#compression_type--str-optional)

Supported options are `zstd` for [Zstandard](http://facebook.github.io/zstd/) compression and `lz4` for [LZ4 Frame](https://android.googlesource.com/platform/external/lz4/+/HEAD/doc/lz4_Frame_format.md) compression.

Why would I use this over the `compress_*` operators?

The Feather format offers more efficient compression compared to the `compress_*` operators. This is because it compresses the data column-by-column, leaving metadata that needs to be accessed frequently uncompressed.

### `min_space_savings = double (optional)`

[Section titled “min\_space\_savings = double (optional)”](#min_space_savings--double-optional)

Minimum space savings percentage required for compression to be applied. This option is ignored if no compression is specified. The provided value must be between 0 and 1 inclusive.

Space savings are calculated as `1.0 - compressed_size / uncompressed_size`. For example, with a minimum space savings rate of 0.1, a 100-byte body buffer will not be compressed if its expected compressed size exceeds 90 bytes.

Defaults to `0`, i.e., always applying compression.

## Examples

[Section titled “Examples”](#examples)

### Convert a JSON stream into a Feather file

[Section titled “Convert a JSON stream into a Feather file”](#convert-a-json-stream-into-a-feather-file)

```tql
load_file "input.json"
read_json
write_feather
save_file "output.feather"
```

## See Also

[Section titled “See Also”](#see-also)

[`read_bitz`](/reference/operators/read_bitz), [`read_feather`](/reference/operators/read_feather), [`to_hive`](/reference/operators/to_hive), [`write_bitz`](/reference/operators/write_bitz), [`write_parquet`](/reference/operators/write_parquet)