# read_feather

Parses an incoming Feather byte stream into events.

```tql
read_feather
```

## Description

[Section titled “Description”](#description)

Transforms the input [Feather](https://arrow.apache.org/docs/python/feather.html) (a thin wrapper around [Apache Arrow’s IPC](https://arrow.apache.org/docs/python/ipc.html) wire format) byte stream to event stream.

## Examples

[Section titled “Examples”](#examples)

### Publish a feather logs file

[Section titled “Publish a feather logs file”](#publish-a-feather-logs-file)

```tql
load_file "logs.feather"
read_feather
pulish "log"
```

## See Also

[Section titled “See Also”](#see-also)

[`read_parquet`](/reference/operators/read_parquet), [`write_feather`](/reference/operators/write_feather)