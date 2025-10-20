# Operators

Tenzir comes with a wide range of built-in pipeline operators.

## Analyze

[Section titled “Analyze”](#analyze)

### [rare](/reference/operators/rare)

[→](/reference/operators/rare)

Shows the least common values.

```tql
rare auth.token
```

### [reverse](/reference/operators/reverse)

[→](/reference/operators/reverse)

Reverses the event order.

```tql
reverse
```

### [sort](/reference/operators/sort)

[→](/reference/operators/sort)

Sorts events by the given expressions.

```tql
sort name, -abs(transaction)
```

### [summarize](/reference/operators/summarize)

[→](/reference/operators/summarize)

Groups events and applies aggregate functions to each group.

```tql
summarize name, sum(amount)
```

### [top](/reference/operators/top)

[→](/reference/operators/top)

Shows the most common values.

```tql
top user
```

## Charts

[Section titled “Charts”](#charts)

### [chart\_area](/reference/operators/chart_area)

[→](/reference/operators/chart_area)

Plots events on an area chart.

```tql
chart_area …
```

### [chart\_bar](/reference/operators/chart_bar)

[→](/reference/operators/chart_bar)

Plots events on an bar chart.

```tql
chart_bar …
```

### [chart\_line](/reference/operators/chart_line)

[→](/reference/operators/chart_line)

Plots events on an line chart.

```tql
chart_line …
```

### [chart\_pie](/reference/operators/chart_pie)

[→](/reference/operators/chart_pie)

Plots events on an pie chart.

```tql
chart_pie …
```

## Connecting Pipelines

[Section titled “Connecting Pipelines”](#connecting-pipelines)

### [publish](/reference/operators/publish)

[→](/reference/operators/publish)

Publishes events to a channel with a topic.

```tql
publish "topic"
```

### [subscribe](/reference/operators/subscribe)

[→](/reference/operators/subscribe)

Subscribes to events from a channel with a topic.

```tql
subscribe "topic"
```

## Contexts

[Section titled “Contexts”](#contexts)

### [context::create\_bloom\_filter](/reference/operators/context/create_bloom_filter)

[→](/reference/operators/context/create_bloom_filter)

Creates a Bloom filter context.

```tql
context::create_bloom_filter "ctx", capacity=1Mi, fp_probability=0.01
```

### [context::create\_geoip](/reference/operators/context/create_geoip)

[→](/reference/operators/context/create_geoip)

Creates a GeoIP context.

```tql
context::create_geoip "ctx", db_path="GeoLite2-City.mmdb"
```

### [context::create\_lookup\_table](/reference/operators/context/create_lookup_table)

[→](/reference/operators/context/create_lookup_table)

Creates a lookup table context.

```tql
context::create_lookup_table "ctx"
```

### [context::enrich](/reference/operators/context/enrich)

[→](/reference/operators/context/enrich)

Enriches events with data from a context.

```tql
context::enrich "ctx", key=x
```

### [context::erase](/reference/operators/context/erase)

[→](/reference/operators/context/erase)

Removes entries from a context.

```tql
context::erase "ctx", key=x
```

### [context::inspect](/reference/operators/context/inspect)

[→](/reference/operators/context/inspect)

Resets a context.

```tql
context::inspect "ctx"
```

### [context::list](/reference/operators/context/list)

[→](/reference/operators/context/list)

Lists all contexts

```tql
context::list
```

### [context::load](/reference/operators/context/load)

[→](/reference/operators/context/load)

Loads context state.

```tql
context::load "ctx"
```

### [context::remove](/reference/operators/context/remove)

[→](/reference/operators/context/remove)

Deletes a context.

```tql
context::remove "ctx"
```

### [context::reset](/reference/operators/context/reset)

[→](/reference/operators/context/reset)

Resets a context.

```tql
context::reset "ctx"
```

### [context::save](/reference/operators/context/save)

[→](/reference/operators/context/save)

Saves context state.

```tql
context::save "ctx"
```

### [context::update](/reference/operators/context/update)

[→](/reference/operators/context/update)

Updates a context with new data.

```tql
context::update "ctx", key=x, value=y
```

## Detection

[Section titled “Detection”](#detection)

### [sigma](/reference/operators/sigma)

[→](/reference/operators/sigma)

Filter the input with Sigma rules and output matching events.

```tql
sigma "/tmp/rules/"
```

### [yara](/reference/operators/yara)

[→](/reference/operators/yara)

Executes YARA rules on byte streams.

```tql
yara "/path/to/rules", blockwise=true
```

## Encode & Decode

[Section titled “Encode & Decode”](#encode--decode)

### [compress](/reference/operators/compress)

[→](/reference/operators/compress)

Compresses a stream of bytes.

```tql
compress "zstd"
```

### [compress\_brotli](/reference/operators/compress_brotli)

[→](/reference/operators/compress_brotli)

Compresses a stream of bytes using Brotli compression.

```tql
compress_brotli, level=10
```

### [compress\_bz2](/reference/operators/compress_bz2)

[→](/reference/operators/compress_bz2)

Compresses a stream of bytes using bz2 compression.

```tql
compress_bz2, level=9
```

### [compress\_gzip](/reference/operators/compress_gzip)

[→](/reference/operators/compress_gzip)

Compresses a stream of bytes using gzip compression.

```tql
compress_gzip, level=8
```

### [compress\_lz4](/reference/operators/compress_lz4)

[→](/reference/operators/compress_lz4)

Compresses a stream of bytes using lz4 compression.

```tql
compress_lz4, level=7
```

### [compress\_zstd](/reference/operators/compress_zstd)

[→](/reference/operators/compress_zstd)

Compresses a stream of bytes using zstd compression.

```tql
compress_zstd, level=6
```

### [decompress](/reference/operators/decompress)

[→](/reference/operators/decompress)

Decompresses a stream of bytes.

```tql
decompress "gzip"
```

### [decompress\_brotli](/reference/operators/decompress_brotli)

[→](/reference/operators/decompress_brotli)

Decompresses a stream of bytes in the Brotli format.

```tql
decompress_brotli
```

### [decompress\_bz2](/reference/operators/decompress_bz2)

[→](/reference/operators/decompress_bz2)

Decompresses a stream of bytes in the Bzip2 format.

```tql
decompress_bz2
```

### [decompress\_gzip](/reference/operators/decompress_gzip)

[→](/reference/operators/decompress_gzip)

Decompresses a stream of bytes in the Gzip format.

```tql
decompress_gzip
```

### [decompress\_lz4](/reference/operators/decompress_lz4)

[→](/reference/operators/decompress_lz4)

Decompresses a stream of bytes in the Lz4 format.

```tql
decompress_lz4
```

### [decompress\_zstd](/reference/operators/decompress_zstd)

[→](/reference/operators/decompress_zstd)

Decompresses a stream of bytes in the Zstd format.

```tql
decompress_zstd
```

## Escape Hatches

[Section titled “Escape Hatches”](#escape-hatches)

### [python](/reference/operators/python)

[→](/reference/operators/python)

Executes Python code against each event of the input.

```tql
python "self.x = self.y"
```

### [shell](/reference/operators/shell)

[→](/reference/operators/shell)

Executes a system command and hooks its stdin and stdout into the pipeline.

```tql
shell "echo hello"
```

## Filter

[Section titled “Filter”](#filter)

### [assert](/reference/operators/assert)

[→](/reference/operators/assert)

Drops events and emits a warning if the invariant is violated.

```tql
assert name.starts_with("John")
```

### [assert\_throughput](/reference/operators/assert_throughput)

[→](/reference/operators/assert_throughput)

Emits a warning if the pipeline does not have the expected throughput

```tql
assert_throughput 1000, within=1s
```

### [deduplicate](/reference/operators/deduplicate)

[→](/reference/operators/deduplicate)

Removes duplicate events based on a common key.

```tql
deduplicate src_ip
```

### [head](/reference/operators/head)

[→](/reference/operators/head)

Limits the input to the first `n` events.

```tql
head 20
```

### [sample](/reference/operators/sample)

[→](/reference/operators/sample)

Dynamically samples events from a event stream.

```tql
sample 30s, max_samples=2k
```

### [slice](/reference/operators/slice)

[→](/reference/operators/slice)

Keeps a range of events within the interval `[begin, end)` stepping by `stride`.

```tql
slice begin=10, end=30
```

### [tail](/reference/operators/tail)

[→](/reference/operators/tail)

Limits the input to the last `n` events.

```tql
tail 20
```

### [taste](/reference/operators/taste)

[→](/reference/operators/taste)

Limits the input to `n` events per unique schema.

```tql
taste 1
```

### [where](/reference/operators/where)

[→](/reference/operators/where)

Keeps only events for which the given predicate is true.

```tql
where name.starts_with("John")
```

## Flow Control

[Section titled “Flow Control”](#flow-control)

### [cron](/reference/operators/cron)

[→](/reference/operators/cron)

Runs a pipeline periodically according to a cron expression.

```tql
cron "* */10 * * * MON-FRI" { from "https://example.org" }
```

### [delay](/reference/operators/delay)

[→](/reference/operators/delay)

Delays events relative to a given start time, with an optional speedup.

```tql
delay ts, speed=2.5
```

### [discard](/reference/operators/discard)

[→](/reference/operators/discard)

Discards all incoming events.

```tql
discard
```

### [every](/reference/operators/every)

[→](/reference/operators/every)

Runs a pipeline periodically at a fixed interval.

```tql
every 10s { summarize sum(amount) }
```

### [fork](/reference/operators/fork)

[→](/reference/operators/fork)

Executes a subpipeline with a copy of the input.

```tql
fork { to "copy.json" }
```

### [load\_balance](/reference/operators/load_balance)

[→](/reference/operators/load_balance)

Routes the data to one of multiple subpipelines.

```tql
load_balance $over { publish $over }
```

### [pass](/reference/operators/pass)

[→](/reference/operators/pass)

Does nothing with the input.

```tql
pass
```

### [repeat](/reference/operators/repeat)

[→](/reference/operators/repeat)

Repeats the input a number of times.

```tql
repeat 100
```

### [throttle](/reference/operators/throttle)

[→](/reference/operators/throttle)

Limits the bandwidth of a pipeline.

```tql
throttle 100M, within=1min
```

## Host Inspection

[Section titled “Host Inspection”](#host-inspection)

### [files](/reference/operators/files)

[→](/reference/operators/files)

Shows file information for a given directory.

```tql
files "/var/log/", recurse=true
```

### [nics](/reference/operators/nics)

[→](/reference/operators/nics)

Shows a snapshot of available network interfaces.

```tql
nics
```

### [processes](/reference/operators/processes)

[→](/reference/operators/processes)

Shows a snapshot of running processes.

```tql
processes
```

### [sockets](/reference/operators/sockets)

[→](/reference/operators/sockets)

Shows a snapshot of open sockets.

```tql
sockets
```

## Internals

[Section titled “Internals”](#internals)

### [api](/reference/operators/api)

[→](/reference/operators/api)

Use Tenzir's REST API directly from a pipeline.

```tql
api "/pipeline/list"
```

### [batch](/reference/operators/batch)

[→](/reference/operators/batch)

The `batch` operator controls the batch size of events.

```tql
batch timeout=1s
```

### [buffer](/reference/operators/buffer)

[→](/reference/operators/buffer)

An in-memory buffer to improve handling of data spikes in upstream operators.

```tql
buffer 10M, policy="drop"
```

### [cache](/reference/operators/cache)

[→](/reference/operators/cache)

An in-memory cache shared between pipelines.

```tql
cache "w01wyhTZm3", ttl=10min
```

### [local](/reference/operators/local)

[→](/reference/operators/local)

Forces a pipeline to run locally.

```tql
local { sort foo }
```

### [measure](/reference/operators/measure)

[→](/reference/operators/measure)

Replaces the input with metrics describing the input.

```tql
measure
```

### [remote](/reference/operators/remote)

[→](/reference/operators/remote)

Forces a pipeline to run remotely at a node.

```tql
remote { version }
```

### [serve](/reference/operators/serve)

[→](/reference/operators/serve)

Make events available under the `/serve` REST API endpoint

```tql
serve "abcde12345"
```

### [strict](/reference/operators/strict)

[→](/reference/operators/strict)

Treats all warnings as errors.

```tql
strict { assert false }
```

### [unordered](/reference/operators/unordered)

[→](/reference/operators/unordered)

Removes ordering assumptions from a pipeline.

```tql
unordered { read_ndjson }
```

## Modify

[Section titled “Modify”](#modify)

### [dns\_lookup](/reference/operators/dns_lookup)

[→](/reference/operators/dns_lookup)

Performs DNS lookups to resolve IP addresses to hostnames or hostnames to IP addresses.

```tql
dns_lookup ip_address, result=dns_info
```

### [drop](/reference/operators/drop)

[→](/reference/operators/drop)

Removes fields from the event.

```tql
drop name, metadata.id
```

### [drop\_null\_fields](/reference/operators/drop_null_fields)

[→](/reference/operators/drop_null_fields)

Removes fields containing null values from the event.

```tql
drop_null_fields name, metadata.id
```

### [enumerate](/reference/operators/enumerate)

[→](/reference/operators/enumerate)

Add a field with the number of preceding events.

```tql
enumerate num
```

### [http](/reference/operators/http)

[→](/reference/operators/http)

Sends HTTP/1.1 requests and forwards the response.

```tql
http "example.com"
```

### [move](/reference/operators/move)

[→](/reference/operators/move)

Moves values from one field to another, removing the original field.

```tql
move id=parsed_id, ctx.message=incoming.status
```

### [replace](/reference/operators/replace)

[→](/reference/operators/replace)

Replaces all occurrences of a value with another value.

```tql
replace what=42, with=null
```

### [select](/reference/operators/select)

[→](/reference/operators/select)

Selects some values and discards the rest.

```tql
select name, id=metadata.id
```

### [set](/reference/operators/set)

[→](/reference/operators/set)

Assigns a value to a field, creating it if necessary.

```tql
name = "Tenzir"
```

### [timeshift](/reference/operators/timeshift)

[→](/reference/operators/timeshift)

Adjusts timestamps relative to a given start time, with an optional speedup.

```tql
timeshift ts, start=2020-01-01
```

### [unroll](/reference/operators/unroll)

[→](/reference/operators/unroll)

Returns a new event for each member of a list or a record in an event, duplicating the surrounding event.

```tql
unroll names
```

## OCSF

[Section titled “OCSF”](#ocsf)

### [ocsf::apply](/reference/operators/ocsf/apply)

[→](/reference/operators/ocsf/apply)

Casts incoming events to their OCSF type.

```tql
ocsf::apply
```

### [ocsf::derive](/reference/operators/ocsf/derive)

[→](/reference/operators/ocsf/derive)

Automatically assigns enum strings from their integer counterparts and vice versa.

```tql
ocsf::derive
```

### [ocsf::trim](/reference/operators/ocsf/trim)

[→](/reference/operators/ocsf/trim)

Drops fields from OCSF events to reduce their size.

```tql
ocsf::trim
```

## Packages

[Section titled “Packages”](#packages)

### [package::add](/reference/operators/package/add)

[→](/reference/operators/package/add)

Installs a package.

```tql
package::add "suricata-ocsf"
```

### [package::list](/reference/operators/package/list)

[→](/reference/operators/package/list)

Shows installed packages.

```tql
package::list
```

### [package::remove](/reference/operators/package/remove)

[→](/reference/operators/package/remove)

Uninstalls a package.

```tql
package::remove "suricata-ocsf"
```

## Parsing

[Section titled “Parsing”](#parsing)

### [read\_all](/reference/operators/read_all)

[→](/reference/operators/read_all)

Parses an incoming bytes stream into a single event.

```tql
read_all binary=true
```

### [read\_bitz](/reference/operators/read_bitz)

[→](/reference/operators/read_bitz)

Parses bytes as *BITZ* format.

```tql
read_bitz
```

### [read\_cef](/reference/operators/read_cef)

[→](/reference/operators/read_cef)

Parses an incoming Common Event Format (CEF) stream into events.

```tql
read_cef
```

### [read\_csv](/reference/operators/read_csv)

[→](/reference/operators/read_csv)

Read CSV (Comma-Separated Values) from a byte stream.

```tql
read_csv null_value="-"
```

### [read\_delimited](/reference/operators/read_delimited)

[→](/reference/operators/read_delimited)

Parses an incoming bytes stream into events using a string as delimiter.

```tql
read_delimited "|"
```

### [read\_delimited\_regex](/reference/operators/read_delimited_regex)

[→](/reference/operators/read_delimited_regex)

Parses an incoming bytes stream into events using a regular expression as delimiter.

```tql
read_delimited_regex r"\s+"
```

### [read\_feather](/reference/operators/read_feather)

[→](/reference/operators/read_feather)

Parses an incoming Feather byte stream into events.

```tql
read_feather
```

### [read\_gelf](/reference/operators/read_gelf)

[→](/reference/operators/read_gelf)

Parses an incoming GELF stream into events.

```tql
read_gelf
```

### [read\_grok](/reference/operators/read_grok)

[→](/reference/operators/read_grok)

Parses lines of input with a grok pattern.

```tql
read_grok "%{IP:client} %{WORD:action}"
```

### [read\_json](/reference/operators/read_json)

[→](/reference/operators/read_json)

Parses an incoming JSON stream into events.

```tql
read_json arrays_of_objects=true
```

### [read\_kv](/reference/operators/read_kv)

[→](/reference/operators/read_kv)

Read Key-Value pairs from a byte stream.

```tql
read_kv r"(\s+)[A-Z_]+:", r":\s*"
```

### [read\_leef](/reference/operators/read_leef)

[→](/reference/operators/read_leef)

Parses an incoming \[LEEF]\[leef] stream into events.

```tql
read_leef
```

### [read\_lines](/reference/operators/read_lines)

[→](/reference/operators/read_lines)

Parses an incoming bytes stream into events.

```tql
read_lines
```

### [read\_ndjson](/reference/operators/read_ndjson)

[→](/reference/operators/read_ndjson)

Parses an incoming NDJSON (newline-delimited JSON) stream into events.

```tql
read_ndjson
```

### [read\_parquet](/reference/operators/read_parquet)

[→](/reference/operators/read_parquet)

Reads events from a Parquet byte stream.

```tql
read_parquet
```

### [read\_pcap](/reference/operators/read_pcap)

[→](/reference/operators/read_pcap)

Reads raw network packets in PCAP file format.

```tql
read_pcap
```

### [read\_ssv](/reference/operators/read_ssv)

[→](/reference/operators/read_ssv)

Read SSV (Space-Separated Values) from a byte stream.

```tql
read_ssv header="name count"
```

### [read\_suricata](/reference/operators/read_suricata)

[→](/reference/operators/read_suricata)

Parse an incoming \[Suricata EVE JSON]\[eve-json] stream into events.

```tql
read_suricata
```

### [read\_syslog](/reference/operators/read_syslog)

[→](/reference/operators/read_syslog)

Parses an incoming Syslog stream into events.

```tql
read_syslog
```

### [read\_tsv](/reference/operators/read_tsv)

[→](/reference/operators/read_tsv)

Read TSV (Tab-Separated Values) from a byte stream.

```tql
read_tsv auto_expand=true
```

### [read\_xsv](/reference/operators/read_xsv)

[→](/reference/operators/read_xsv)

Read XSV from a byte stream.

```tql
read_xsv ";", ":", "N/A"
```

### [read\_yaml](/reference/operators/read_yaml)

[→](/reference/operators/read_yaml)

Parses an incoming YAML stream into events.

```tql
read_yaml
```

### [read\_zeek\_json](/reference/operators/read_zeek_json)

[→](/reference/operators/read_zeek_json)

Parse an incoming Zeek JSON stream into events.

```tql
read_zeek_json
```

### [read\_zeek\_tsv](/reference/operators/read_zeek_tsv)

[→](/reference/operators/read_zeek_tsv)

Parses an incoming `Zeek TSV` stream into events.

```tql
read_zeek_tsv
```

## Pipelines

[Section titled “Pipelines”](#pipelines)

### [pipeline::activity](/reference/operators/pipeline/activity)

[→](/reference/operators/pipeline/activity)

Summarizes the activity of pipelines.

```tql
pipeline::activity range=1d, interval=1h
```

### [pipeline::detach](/reference/operators/pipeline/detach)

[→](/reference/operators/pipeline/detach)

Starts a pipeline in the node.

```tql
pipeline::detach { … }
```

### [pipeline::list](/reference/operators/pipeline/list)

[→](/reference/operators/pipeline/list)

Shows managed pipelines.

```tql
pipeline::list
```

### [pipeline::run](/reference/operators/pipeline/run)

[→](/reference/operators/pipeline/run)

Starts a pipeline in the node and waits for it to complete.

```tql
pipeline::run { … }
```

## Printing

[Section titled “Printing”](#printing)

### [write\_bitz](/reference/operators/write_bitz)

[→](/reference/operators/write_bitz)

Writes events in *BITZ* format.

```tql
write_bitz
```

### [write\_csv](/reference/operators/write_csv)

[→](/reference/operators/write_csv)

Transforms event stream to CSV (Comma-Separated Values) byte stream.

```tql
write_csv
```

### [write\_feather](/reference/operators/write_feather)

[→](/reference/operators/write_feather)

Transforms the input event stream to Feather byte stream.

```tql
write_feather
```

### [write\_json](/reference/operators/write_json)

[→](/reference/operators/write_json)

Transforms the input event stream to a JSON byte stream.

```tql
write_json
```

### [write\_kv](/reference/operators/write_kv)

[→](/reference/operators/write_kv)

Writes events in a Key-Value format.

```tql
write_kv
```

### [write\_lines](/reference/operators/write_lines)

[→](/reference/operators/write_lines)

Writes events as key-value pairsthe *values* of an event.

```tql
write_lines
```

### [write\_ndjson](/reference/operators/write_ndjson)

[→](/reference/operators/write_ndjson)

Transforms the input event stream to a Newline-Delimited JSON byte stream.

```tql
write_ndjson
```

### [write\_parquet](/reference/operators/write_parquet)

[→](/reference/operators/write_parquet)

Transforms event stream to a Parquet byte stream.

```tql
write_parquet
```

### [write\_pcap](/reference/operators/write_pcap)

[→](/reference/operators/write_pcap)

Transforms event stream to PCAP byte stream.

```tql
write_pcap
```

### [write\_ssv](/reference/operators/write_ssv)

[→](/reference/operators/write_ssv)

Transforms event stream to SSV (Space-Separated Values) byte stream.

```tql
write_ssv
```

### [write\_syslog](/reference/operators/write_syslog)

[→](/reference/operators/write_syslog)

Writes events as syslog.

```tql
write_syslog
```

### [write\_tql](/reference/operators/write_tql)

[→](/reference/operators/write_tql)

Transforms the input event stream to a TQL notation byte stream.

```tql
write_tql
```

### [write\_tsv](/reference/operators/write_tsv)

[→](/reference/operators/write_tsv)

Transforms event stream to TSV (Tab-Separated Values) byte stream.

```tql
write_tsv
```

### [write\_xsv](/reference/operators/write_xsv)

[→](/reference/operators/write_xsv)

Transforms event stream to XSV byte stream.

```tql
write_xsv
```

### [write\_yaml](/reference/operators/write_yaml)

[→](/reference/operators/write_yaml)

Transforms the input event stream to YAML byte stream.

```tql
write_yaml
```

### [write\_zeek\_tsv](/reference/operators/write_zeek_tsv)

[→](/reference/operators/write_zeek_tsv)

Transforms event stream into Zeek Tab-Separated Value byte stream.

```tql
write_zeek_tsv
```

## Inputs

[Section titled “Inputs”](#inputs)

### Bytes

[Section titled “Bytes”](#bytes)

### [load\_amqp](/reference/operators/load_amqp)

[→](/reference/operators/load_amqp)

Loads a byte stream via AMQP messages.

```tql
load_amqp
```

### [load\_azure\_blob\_storage](/reference/operators/load_azure_blob_storage)

[→](/reference/operators/load_azure_blob_storage)

Loads bytes from Azure Blob Storage.

```tql
load_azure_blob_storage "abfs://container/file"
```

### [load\_file](/reference/operators/load_file)

[→](/reference/operators/load_file)

Loads the contents of the file at `path` as a byte stream.

```tql
load_file "/tmp/data.json"
```

### [load\_ftp](/reference/operators/load_ftp)

[→](/reference/operators/load_ftp)

Loads a byte stream via FTP.

```tql
load_ftp "ftp.example.org"
```

### [load\_gcs](/reference/operators/load_gcs)

[→](/reference/operators/load_gcs)

Loads bytes from a Google Cloud Storage object.

```tql
load_gcs "gs://bucket/object.json"
```

### [load\_google\_cloud\_pubsub](/reference/operators/load_google_cloud_pubsub)

[→](/reference/operators/load_google_cloud_pubsub)

Subscribes to a Google Cloud Pub/Sub subscription and obtains bytes.

```tql
load_google_cloud_pubsub project_id="my-project"
```

### [load\_http](/reference/operators/load_http)

[→](/reference/operators/load_http)

Loads a byte stream via HTTP.

```tql
load_http "example.org", params={n: 5}
```

### [load\_kafka](/reference/operators/load_kafka)

[→](/reference/operators/load_kafka)

Loads a byte stream from an Apache Kafka topic.

```tql
load_kafka topic="example"
```

### [load\_nic](/reference/operators/load_nic)

[→](/reference/operators/load_nic)

Loads bytes from a network interface card (NIC).

```tql
load_nic "eth0"
```

### [load\_s3](/reference/operators/load_s3)

[→](/reference/operators/load_s3)

Loads from an Amazon S3 object.

```tql
load_s3 "s3://my-bucket/obj.csv"
```

### [load\_sqs](/reference/operators/load_sqs)

[→](/reference/operators/load_sqs)

Loads bytes from \[Amazon SQS]\[sqs] queues.

```tql
load_sqs "sqs://tenzir"
```

### [load\_stdin](/reference/operators/load_stdin)

[→](/reference/operators/load_stdin)

Accepts bytes from standard input.

```tql
load_stdin
```

### [load\_tcp](/reference/operators/load_tcp)

[→](/reference/operators/load_tcp)

Loads bytes from a TCP or TLS connection.

```tql
load_tcp "0.0.0.0:8090" { read_json }
```

### [load\_udp](/reference/operators/load_udp)

[→](/reference/operators/load_udp)

Loads bytes from a UDP socket.

```tql
load_udp "0.0.0.0:8090"
```

### [load\_zmq](/reference/operators/load_zmq)

[→](/reference/operators/load_zmq)

Receives ZeroMQ messages.

```tql
load_zmq
```

### Events

[Section titled “Events”](#events)

### [from](/reference/operators/from)

[→](/reference/operators/from)

Obtains events from an URI, inferring the source, compression and format.

```tql
from "data.json"
```

### [from\_azure\_blob\_storage](/reference/operators/from_azure_blob_storage)

[→](/reference/operators/from_azure_blob_storage)

Reads one or multiple files from Azure Blob Storage.

```tql
from_azure_blob_storage "abfs://container/data/**.json"
```

### [from\_file](/reference/operators/from_file)

[→](/reference/operators/from_file)

Reads one or multiple files from a filesystem.

```tql
from_file "s3://data/**.json"
```

### [from\_fluent\_bit](/reference/operators/from_fluent_bit)

[→](/reference/operators/from_fluent_bit)

Receives events via Fluent Bit.

```tql
from_fluent_bit "opentelemetry"
```

### [from\_gcs](/reference/operators/from_gcs)

[→](/reference/operators/from_gcs)

Reads one or multiple files from Google Cloud Storage.

```tql
from_gcs "gs://my-bucket/data/**.json"
```

### [from\_http](/reference/operators/from_http)

[→](/reference/operators/from_http)

Sends and receives HTTP/1.1 requests.

```tql
from_http "0.0.0.0:8080"
```

### [from\_opensearch](/reference/operators/from_opensearch)

[→](/reference/operators/from_opensearch)

Receives events via Opensearch Bulk API.

```tql
from_opensearch
```

### [from\_s3](/reference/operators/from_s3)

[→](/reference/operators/from_s3)

Reads one or multiple files from Amazon S3.

```tql
from_s3 "s3://my-bucket/data/**.json"
```

### [from\_udp](/reference/operators/from_udp)

[→](/reference/operators/from_udp)

Receives UDP datagrams and outputs structured events.

```tql
from_udp "0.0.0.0:8090"
```

### [from\_velociraptor](/reference/operators/from_velociraptor)

[→](/reference/operators/from_velociraptor)

Submits VQL to a Velociraptor server and returns the response as events.

```tql
from_velociraptor subscribe="Windows"
```

## Node

[Section titled “Node”](#node)

### Inspection

[Section titled “Inspection”](#inspection)

### [diagnostics](/reference/operators/diagnostics)

[→](/reference/operators/diagnostics)

Retrieves diagnostic events from a Tenzir node.

```tql
diagnostics
```

### [metrics](/reference/operators/metrics)

[→](/reference/operators/metrics)

Retrieves metrics events from a Tenzir node.

```tql
metrics "cpu"
```

### [openapi](/reference/operators/openapi)

[→](/reference/operators/openapi)

Shows the node's OpenAPI specification.

```tql
openapi
```

### [plugins](/reference/operators/plugins)

[→](/reference/operators/plugins)

Shows all available plugins and built-ins.

```tql
plugins
```

### [version](/reference/operators/version)

[→](/reference/operators/version)

Shows the current version.

```tql
version
```

### Storage Engine

[Section titled “Storage Engine”](#storage-engine)

### [export](/reference/operators/export)

[→](/reference/operators/export)

Retrieves events from a Tenzir node.

```tql
export
```

### [fields](/reference/operators/fields)

[→](/reference/operators/fields)

Retrieves all fields stored at a node.

```tql
fields
```

### [import](/reference/operators/import)

[→](/reference/operators/import)

Imports events into a Tenzir node.

```tql
import
```

### [partitions](/reference/operators/partitions)

[→](/reference/operators/partitions)

Retrieves metadata about events stored at a node.

```tql
partitions src_ip == 1.2.3.4
```

### [schemas](/reference/operators/schemas)

[→](/reference/operators/schemas)

Retrieves all schemas for events stored at a node.

```tql
schemas
```

## Outputs

[Section titled “Outputs”](#outputs)

### Bytes

[Section titled “Bytes”](#bytes-1)

### [save\_amqp](/reference/operators/save_amqp)

[→](/reference/operators/save_amqp)

Saves a byte stream via AMQP messages.

```tql
save_amqp
```

### [save\_azure\_blob\_storage](/reference/operators/save_azure_blob_storage)

[→](/reference/operators/save_azure_blob_storage)

Saves bytes to Azure Blob Storage.

```tql
save_azure_blob_storage "abfs://container/file"
```

### [save\_email](/reference/operators/save_email)

[→](/reference/operators/save_email)

Saves bytes through an SMTP server.

```tql
save_email "user@example.org"
```

### [save\_file](/reference/operators/save_file)

[→](/reference/operators/save_file)

Writes a byte stream to a file.

```tql
save_file "/tmp/out.json"
```

### [save\_ftp](/reference/operators/save_ftp)

[→](/reference/operators/save_ftp)

Saves a byte stream via FTP.

```tql
save_ftp "ftp.example.org"
```

### [save\_gcs](/reference/operators/save_gcs)

[→](/reference/operators/save_gcs)

Saves bytes to a Google Cloud Storage object.

```tql
save_gcs "gs://bucket/object.json"
```

### [save\_google\_cloud\_pubsub](/reference/operators/save_google_cloud_pubsub)

[→](/reference/operators/save_google_cloud_pubsub)

Publishes to a Google Cloud Pub/Sub topic.

```tql
save_google_cloud_pubsub project_id="my-project"
```

### [save\_http](/reference/operators/save_http)

[→](/reference/operators/save_http)

Sends a byte stream via HTTP.

```tql
save_http "example.org/api"
```

### [save\_kafka](/reference/operators/save_kafka)

[→](/reference/operators/save_kafka)

Saves a byte stream to a Apache Kafka topic.

```tql
save_kafka topic="example"
```

### [save\_s3](/reference/operators/save_s3)

[→](/reference/operators/save_s3)

Saves bytes to an Amazon S3 object.

```tql
save_s3 "s3://my-bucket/obj.csv"
```

### [save\_sqs](/reference/operators/save_sqs)

[→](/reference/operators/save_sqs)

Saves bytes to \[Amazon SQS]\[sqs] queues.

```tql
save_sqs "sqs://tenzir"
```

### [save\_stdout](/reference/operators/save_stdout)

[→](/reference/operators/save_stdout)

Writes a byte stream to standard output.

```tql
save_stdout
```

### [save\_tcp](/reference/operators/save_tcp)

[→](/reference/operators/save_tcp)

Saves bytes to a TCP or TLS connection.

```tql
save_tcp "0.0.0.0:8090", tls=true
```

### [save\_udp](/reference/operators/save_udp)

[→](/reference/operators/save_udp)

Saves bytes to a UDP socket.

```tql
save_udp "0.0.0.0:8090"
```

### [save\_zmq](/reference/operators/save_zmq)

[→](/reference/operators/save_zmq)

Sends bytes as ZeroMQ messages.

```tql
save_zmq
```

### Events

[Section titled “Events”](#events-1)

### [to](/reference/operators/to)

[→](/reference/operators/to)

Saves to an URI, inferring the destination, compression and format.

```tql
to "output.json"
```

### [to\_amazon\_security\_lake](/reference/operators/to_amazon_security_lake)

[→](/reference/operators/to_amazon_security_lake)

Sends OCSF events to Amazon Security Lake.

```tql
to_amazon_security_lake "s3://…"
```

### [to\_azure\_log\_analytics](/reference/operators/to_azure_log_analytics)

[→](/reference/operators/to_azure_log_analytics)

Sends events to the Microsoft Azure Logs Ingestion API.

```tql
to_azure_log_analytics tenant_id="...", workspace_id="..."
```

### [to\_clickhouse](/reference/operators/to_clickhouse)

[→](/reference/operators/to_clickhouse)

Sends events to a ClickHouse table.

```tql
to_clickhouse table="my_table"
```

### [to\_fluent\_bit](/reference/operators/to_fluent_bit)

[→](/reference/operators/to_fluent_bit)

Sends events via Fluent Bit.

```tql
to_fluent_bit "elasticsearch" …
```

### [to\_google\_cloud\_logging](/reference/operators/to_google_cloud_logging)

[→](/reference/operators/to_google_cloud_logging)

Sends events to Google Cloud Logging.

```tql
to_google_cloud_logging …
```

### [to\_google\_secops](/reference/operators/to_google_secops)

[→](/reference/operators/to_google_secops)

Sends unstructured events to a Google SecOps Chronicle instance.

```tql
to_google_secops …
```

### [to\_hive](/reference/operators/to_hive)

[→](/reference/operators/to_hive)

Writes events to a URI using hive partitioning.

```tql
to_hive "s3://…", partition_by=[x]
```

### [to\_kafka](/reference/operators/to_kafka)

[→](/reference/operators/to_kafka)

Sends messages to an Apache Kafka topic.

```tql
to_kafka "topic", message=this.print_json()
```

### [to\_opensearch](/reference/operators/to_opensearch)

[→](/reference/operators/to_opensearch)

Sends events to an OpenSearch-compatible Bulk API.

```tql
to_opensearch "localhost:9200", …
```

### [to\_sentinelone\_data\_lake](/reference/operators/to_sentinelone_data_lake)

[→](/reference/operators/to_sentinelone_data_lake)

Sends security events to SentinelOne Singularity Data Lake via REST API.

```tql
to_sentinelone_data_lake "https://…", …
```

### [to\_snowflake](/reference/operators/to_snowflake)

[→](/reference/operators/to_snowflake)

Sends events to a Snowflake database.

```tql
to_snowflake account_identifier="…
```

### [to\_splunk](/reference/operators/to_splunk)

[→](/reference/operators/to_splunk)

Sends events to a Splunk \[HTTP Event Collector (HEC)]\[hec].

```tql
to_splunk "localhost:8088", …
```