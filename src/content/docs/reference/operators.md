---
title: Operators
---

<!-- This file is auto-generated from individual operator files. Do not edit manually. -->
<!-- Run 'pnpm run generate:operators-overview' to regenerate this file. -->

Tenzir comes with a wide range of built-in pipeline operators.

## Analyze

| Operator | Description | Example |
| :------- | :---------- | :------ |
| [`rare`](/reference/operators/rare) | Shows the least common values. | `rare x:field` |
| [`reverse`](/reference/operators/reverse) | Reverses the event order. | `reverse` |
| [`sort`](/reference/operators/sort) | Sorts events by the given expressions. | `sort [-]expr...` |
| [`summarize`](/reference/operators/summarize) | Groups events and applies aggregate functions to each group. | `summarize (group\|aggregation)...` |
| [`top`](/reference/operators/top) | Shows the most common values. The dual to [`rare`](/reference/operators/rare). | `top x:field` |

## Charts

| Operator | Description | Example |
| :------- | :---------- | :------ |
| [`chart_area`](/reference/operators/chart_area) | Plots events on an area chart. | `chart_area x=field, y=any, [x_min=any, x_max=any, y_min=any, y_max=any,` |
| [`chart_bar`](/reference/operators/chart_bar) | Plots events on an bar chart. | `chart_bar x\|label=field, y\|value=any, [x_min=any, x_max=any,` |
| [`chart_line`](/reference/operators/chart_line) | Plots events on an line chart. | `chart_line x=field, y=any, [x_min=any, x_max=any, y_min=any, y_max=any,` |
| [`chart_pie`](/reference/operators/chart_pie) | Plots events on an pie chart. | `chart_pie x\|label=field, y\|value=any, [group=any]` |

## Connecting Pipelines

| Operator | Description | Example |
| :------- | :---------- | :------ |
| [`publish`](/reference/operators/publish) | Publishes events to a channel with a topic. | `publish [topic:string]` |
| [`subscribe`](/reference/operators/subscribe) | Subscribes to events from a channel with a topic. | `subscribe [topic:string]` |

## Contexts

| Operator | Description | Example |
| :------- | :---------- | :------ |
| [`create_bloom_filter`](/reference/operators/create_bloom_filter) | Creates a Bloom filter context. | `context::create_bloom_filter name:string, capacity=int, fp_probability=float` |
| [`create_geoip`](/reference/operators/create_geoip) | Creates a GeoIP context. | `context::create_geoip name:string, [db_path=string]` |
| [`create_lookup_table`](/reference/operators/create_lookup_table) | Creates a lookup table context. | `context::create_lookup_table name:string` |
| [`enrich`](/reference/operators/enrich) | Resets data with a context. | `context::enrich name:string, key=any,` |
| [`erase`](/reference/operators/erase) | Removes entries from a context. | `context::erase name:string, key=any` |
| [`inspect`](/reference/operators/inspect) | Resets a context. | `context::inspect name:string` |
| [`load`](/reference/operators/load) | Loads context state. | `context::load name:string` |
| [`remove`](/reference/operators/remove) | Deletes a context. | `context::remove name:string` |
| [`remove`](/reference/operators/remove) | Uninstalls a package. | `package::remove package_id:string` |
| [`reset`](/reference/operators/reset) | Resets a context. | `context::reset name:string` |
| [`save`](/reference/operators/save) | Saves context state. | `context::save name:string` |
| [`update`](/reference/operators/update) | Updates a context with new data. | `context::update name:string, key=any,` |

## Detection

| Operator | Description | Example |
| :------- | :---------- | :------ |
| [`sigma`](/reference/operators/sigma) | Filter the input with [Sigma rules][sigma] and output matching events. | `sigma path:string, [refresh_interval=duration]` |
| [`yara`](/reference/operators/yara) | Executes YARA rules on byte streams. | `yara rule:list<string>, [blockwise=bool, compiled_rules=bool, fast_scan=bool]` |

## Encode & Decode

| Operator | Description | Example |
| :------- | :---------- | :------ |
| [`compress`](/reference/operators/compress) | Compresses a stream of bytes. | `compress codec:string, [level=int]` |
| [`compress_brotli`](/reference/operators/compress_brotli) | Compresses a stream of bytes using Brotli compression. | `compress_brotli [level=int, window_bits=int]` |
| [`compress_bz2`](/reference/operators/compress_bz2) | Compresses a stream of bytes using bz2 compression. | `compress_bz2 [level=int]` |
| [`compress_gzip`](/reference/operators/compress_gzip) | Compresses a stream of bytes using gzip compression. | `compress_gzip [level=int, window_bits=int, format=string]` |
| [`compress_lz4`](/reference/operators/compress_lz4) | Compresses a stream of bytes using lz4 compression. | `compress_lz4 [level=int]` |
| [`compress_zstd`](/reference/operators/compress_zstd) | Compresses a stream of bytes using zstd compression. | `compress_zstd [level=int]` |
| [`decompress`](/reference/operators/decompress) | Decompresses a stream of bytes. | `decompress codec:string` |
| [`decompress_brotli`](/reference/operators/decompress_brotli) | Decompresses a stream of bytes in the Brotli format. | `decompress_brotli` |
| [`decompress_bz2`](/reference/operators/decompress_bz2) | Decompresses a stream of bytes in the Bzip2 format. | `decompress_bz2` |
| [`decompress_gzip`](/reference/operators/decompress_gzip) | Decompresses a stream of bytes in the Gzip format. | `decompress_gzip` |
| [`decompress_lz4`](/reference/operators/decompress_lz4) | Decompresses a stream of bytes in the Lz4 format. | `decompress_lz4` |
| [`decompress_zstd`](/reference/operators/decompress_zstd) | Decompresses a stream of bytes in the Zstd format. | `decompress_zstd` |

## Escape Hatches

| Operator | Description | Example |
| :------- | :---------- | :------ |
| [`python`](/reference/operators/python) | Executes Python code against each event of the input. | `python code:string, [requirements=string]` |
| [`shell`](/reference/operators/shell) | Executes a system command and hooks its stdin and stdout into the pipeline. | `shell cmd:string` |

## Filter

| Operator | Description | Example |
| :------- | :---------- | :------ |
| [`assert`](/reference/operators/assert) | Drops event and emits a warning if the invariant is violated. | `assert invariant:bool` |
| [`assert_throughput`](/reference/operators/assert_throughput) | Emits a warning if the pipeline does not have the expected throughput | `assert_throughput min_events:int, within=duration, [retries=int]` |
| [`deduplicate`](/reference/operators/deduplicate) | Removes duplicate events based on a common key. | `deduplicate [key:any, limit=int, distance=int, create_timeout=duration,` |
| [`head`](/reference/operators/head) | Limits the input to the first `n` events. | `head [n:int]` |
| [`sample`](/reference/operators/sample) | Dynamically samples events from a event stream. | `sample [period:duration, mode=string, min_events=int, max_rate=int, max_samples=int]` |
| [`slice`](/reference/operators/slice) | Keeps a range of events within the interval `[begin, end)` stepping by `stride`. | `slice [begin=int, end=int, stride=int]` |
| [`tail`](/reference/operators/tail) | Limits the input to the last `n` events. | `tail [n:int]` |
| [`taste`](/reference/operators/taste) | Limits the input to `n` events per unique schema. | `taste [n:int]` |
| [`where`](/reference/operators/where) | Keeps only events for which the given predicate is true. | `where predicate:bool` |

## Flow Control

| Operator | Description | Example |
| :------- | :---------- | :------ |
| [`cron`](/reference/operators/cron) | Runs a pipeline periodically according to a cron expression. | `cron schedule:string { … }` |
| [`delay`](/reference/operators/delay) | Delays events relative to a given start time, with an optional speedup. | `delay field:time, [start=time, speed=double]` |
| [`discard`](/reference/operators/discard) | Discards all incoming events. | `discard` |
| [`every`](/reference/operators/every) | Runs a pipeline periodically at a fixed interval. | `every interval:duration { … }` |
| [`fork`](/reference/operators/fork) | Executes a subpipeline with a copy of the input. | `fork { … }` |
| [`load_balance`](/reference/operators/load_balance) | Routes the data to one of multiple subpipelines. | `load_balance over:list { … }` |
| [`pass`](/reference/operators/pass) | Does nothing with the input. | `pass` |
| [`repeat`](/reference/operators/repeat) | Repeats the input a number of times. | `repeat [count:int]` |
| [`throttle`](/reference/operators/throttle) | Limits the bandwidth of a pipeline. | `throttle bandwidth:int, [within=duration]` |

## Host Inspection

| Operator | Description | Example |
| :------- | :---------- | :------ |
| [`files`](/reference/operators/files) | Shows file information for a given directory. | `files [dir:string, recurse=bool, follow_symlinks=bool, skip_permission_denied=bool]` |
| [`nics`](/reference/operators/nics) | Shows a snapshot of available network interfaces. | `nics` |
| [`processes`](/reference/operators/processes) | Shows a snapshot of running processes. | `processes` |
| [`sockets`](/reference/operators/sockets) | Shows a snapshot of open sockets. | `sockets` |

#### Bytes

| Operator | Description | Example |
| :------- | :---------- | :------ |
| [`load_amqp`](/reference/operators/load_amqp) | Loads a byte stream via AMQP messages. | `load_amqp [url:str, channel=int, exchange=str, routing_key=str, queue=str,` |
| [`load_azure_blob_storage`](/reference/operators/load_azure_blob_storage) | Loads bytes from Azure Blob Storage. | `load_azure_blob_storage uri:string` |
| [`load_file`](/reference/operators/load_file) | Loads the contents of the file at `path` as a byte stream. | `load_file path:string, [follow=bool, mmap=bool, timeout=duration]` |
| [`load_ftp`](/reference/operators/load_ftp) | Loads a byte stream via FTP. | `load_ftp url:str [tls=bool, cacert=string, certifle=string,` |
| [`load_gcs`](/reference/operators/load_gcs) | Loads bytes from a Google Cloud Storage object. | `load_gcs uri:string, [anonymous=bool]` |
| [`load_google_cloud_pubsub`](/reference/operators/load_google_cloud_pubsub) | Subscribes to a Google Cloud Pub/Sub subscription and obtains bytes. | `load_google_cloud_pubsub project_id=string, subscription_id=string, [timeout=duration]` |
| [`load_http`](/reference/operators/load_http) | Loads a byte stream via HTTP. | `load_http url:string, [data=record, params=record, headers=record,` |
| [`load_kafka`](/reference/operators/load_kafka) | Loads a byte stream from a Apache Kafka topic. | `load_kafka topic:string, [count=int, exit=bool, offset=int\|string,` |
| [`load_nic`](/reference/operators/load_nic) | Loads bytes from a network interface card (NIC). | `load_nic iface:str, [snaplen=int, emit_file_headers=bool]` |
| [`load_s3`](/reference/operators/load_s3) | Loads from an Amazon S3 object. | `load_s3 uri:str, [anonymous=bool]` |
| [`load_sqs`](/reference/operators/load_sqs) | Loads bytes from [Amazon SQS][sqs] queues. | `load_sqs queue:str, [poll_time=duration]` |
| [`load_stdin`](/reference/operators/load_stdin) | Accepts bytes from standard input. | `load_stdin` |
| [`load_tcp`](/reference/operators/load_tcp) | Loads bytes from a TCP or TLS connection. | `load_tcp endpoint:string, [parallel=int, peer_field=field, tls=bool,` |
| [`load_udp`](/reference/operators/load_udp) | Loads bytes from a UDP socket. | `load_udp endpoint:str, [connect=bool, insert_newlines=bool]` |
| [`load_zmq`](/reference/operators/load_zmq) | Receives ZeroMQ messages. | `load_zmq [endpoint:str, filter=str, listen=bool, connect=bool, monitor=bool]` |

#### Events

| Operator | Description | Example |
| :------- | :---------- | :------ |
| [`from`](/reference/operators/from) | Obtains events from an URI, inferring the source, compression and format. | `from uri:string, [loader_args… { … }]` |
| [`from_file`](/reference/operators/from_file) | :::warning[Under Active Development] | `from_file url:string, [watch=bool, remove=bool, path_field=field] { … }` |
| [`from_fluent_bit`](/reference/operators/from_fluent_bit) | Receives events via [Fluent Bit](https://docs.fluentbit.io/). | `from_fluent_bit plugin:string, [options=record, fluent_bit_options=record,` |
| [`from_http`](/reference/operators/from_http) | Receives HTTP/1.1 requests. | `from_http url:string, [server=bool, responses=record, max_request_size=int,` |
| [`from_opensearch`](/reference/operators/from_opensearch) | Receives events via [Opensearch Bulk | `from_opensearch [url:string, keep_actions=bool, max_request_size=int, tls=bool,` |
| [`from_velociraptor`](/reference/operators/from_velociraptor) | Submits VQL to a Velociraptor server and returns the response as events. | `from_velociraptor [request_name=string, org_id=string, max_rows=int,` |

## Internals

| Operator | Description | Example |
| :------- | :---------- | :------ |
| [`api`](/reference/operators/api) | Use Tenzir's REST API directly from a pipeline. | `api endpoint:string, [request_body:string]` |
| [`batch`](/reference/operators/batch) | The `batch` operator controls the batch size of events. | `batch [limit:int, timeout=duration]` |
| [`buffer`](/reference/operators/buffer) | An in-memory buffer to improve handling of data spikes in upstream operators. | `buffer [capacity:int, policy=string]` |
| [`cache`](/reference/operators/cache) | An in-memory cache shared between pipelines. | `cache id:string, [mode=string, capacity=int, read_timeout=duration, write_timeout=duration]` |
| [`legacy`](/reference/operators/legacy) | Provides a compatibility fallback to TQL1 pipelines. | `legacy definition:string` |
| [`local`](/reference/operators/local) | Forces a pipeline to run locally. | `local { … }` |
| [`measure`](/reference/operators/measure) | Replaces the input with metrics describing the input. | `measure [real_time=bool, cumulative=bool]` |
| [`pass`](/reference/operators/pass) | Does nothing with the input. | `pass` |
| [`remote`](/reference/operators/remote) | Forces a pipeline to run remotely at a node. | `remote { … }` |
| [`serve`](/reference/operators/serve) | Make events available under the `/serve` REST API endpoint | `serve id:string, [buffer_size=int]` |
| [`strict`](/reference/operators/strict) | Treats all warnings as errors. | `strict { … }` |
| [`unordered`](/reference/operators/unordered) | Removes ordering assumptions from a pipeline. | `unordered { … }` |

## Modify

| Operator | Description | Example |
| :------- | :---------- | :------ |
| [`drop`](/reference/operators/drop) | Removes fields from the event. | `drop field...` |
| [`enumerate`](/reference/operators/enumerate) | Add a field with the number of preceding events. | `enumerate [out:field]` |
| [`http`](/reference/operators/http) | Sends HTTP/1.1 requests and forwards the response. | `http url:string, [method=string, payload=string, headers=record,` |
| [`move`](/reference/operators/move) | move to=from, … | `move to=from, …` |
| [`select`](/reference/operators/select) | Selects some values and discards the rest. | `select (field\|assignment)...` |
| [`set`](/reference/operators/set) | Assigns a value to a field, creating it if necessary. | `field = expr` |
| [`timeshift`](/reference/operators/timeshift) | Adjusts timestamps relative to a given start time, with an optional speedup. | `timeshift field:time, [start=time, speed=double]` |
| [`unroll`](/reference/operators/unroll) | Returns a new event for each member of a list or a record in an event, | `unroll [field:list\|record]` |

#### Inspection

| Operator | Description | Example |
| :------- | :---------- | :------ |
| [`diagnostics`](/reference/operators/diagnostics) | Retrieves diagnostic events from a Tenzir node. | `diagnostics [live=bool, retro=bool]` |
| [`metrics`](/reference/operators/metrics) | Retrieves metrics events from a Tenzir node. | `metrics [name:string, live=bool, retro=bool]` |
| [`openapi`](/reference/operators/openapi) | Shows the node's OpenAPI specification. | `openapi` |
| [`plugins`](/reference/operators/plugins) | Shows all available plugins and built-ins. | `plugins` |
| [`version`](/reference/operators/version) | Shows the current version. | `version` |

#### Storage Engine

| Operator | Description | Example |
| :------- | :---------- | :------ |
| [`export`](/reference/operators/export) | Retrieves events from a Tenzir node. The dual to [`import`](/reference/operators/import). | `export [live=bool, retro=bool, internal=bool, parallel=int]` |
| [`fields`](/reference/operators/fields) | Retrieves all fields stored at a node. | `fields` |
| [`import`](/reference/operators/import) | Imports events into a Tenzir node. The dual to [`export`](/reference/operators/export). | `import` |
| [`partitions`](/reference/operators/partitions) | Retrieves metadata about events stored at a node. | `partitions [predicate:expr]` |
| [`schemas`](/reference/operators/schemas) | Retrieves all schemas for events stored at a node. | `schemas` |

#### Bytes

| Operator | Description | Example |
| :------- | :---------- | :------ |
| [`save_amqp`](/reference/operators/save_amqp) | Saves a byte stream via AMQP messages. | `save_amqp [url:str, channel=int, exchange=str, routing_key=str,` |
| [`save_azure_blob_storage`](/reference/operators/save_azure_blob_storage) | Saves bytes to Azure Blob Storage. | `save_azure_blob_storage uri:string` |
| [`save_email`](/reference/operators/save_email) | Saves bytes through an SMTP server. | `save_email recipient:str, [endpoint=str, from=str, subject=str, username=str,` |
| [`save_file`](/reference/operators/save_file) | Writes a byte stream to a file. | `save_file path:string, [append=bool, real_time=bool, uds=bool]` |
| [`save_ftp`](/reference/operators/save_ftp) | Saves a byte stream via FTP. | `save_ftp url:str [tls=bool, cacert=string, certifle=string,` |
| [`save_gcs`](/reference/operators/save_gcs) | Saves bytes to a Google Cloud Storage object. | `save_gcs uri:string, [anonymous=bool]` |
| [`save_google_cloud_pubsub`](/reference/operators/save_google_cloud_pubsub) | Publishes to a Google Cloud Pub/Sub topic. | `save_google_cloud_pubsub project_id=string, topic_id=string` |
| [`save_http`](/reference/operators/save_http) | Sends a byte stream via HTTP. | `save_http url:string, [params=record, headers=record, method=string,` |
| [`save_kafka`](/reference/operators/save_kafka) | Saves a byte stream to a Apache Kafka topic. | `save_kafka topic:string, [key=string, timestamp=time, options=record,` |
| [`save_s3`](/reference/operators/save_s3) | Saves bytes to an Amazon S3 object. | `save_s3 uri:str, [anonymous=bool]` |
| [`save_sqs`](/reference/operators/save_sqs) | Saves bytes to [Amazon SQS][sqs] queues. | `save_sqs queue:str, [poll_time=duration]` |
| [`save_stdout`](/reference/operators/save_stdout) | Writes a byte stream to standard output. | `save_stdout` |
| [`save_tcp`](/reference/operators/save_tcp) | Saves bytes to a TCP or TLS connection. | `save_tcp endpoint:string, [tls=bool, cacert=string, certifle=string,` |
| [`save_udp`](/reference/operators/save_udp) | Saves bytes to a UDP socket. | `save_udp endpoint:str` |
| [`save_zmq`](/reference/operators/save_zmq) | Sends bytes as ZeroMQ messages. | `save_zmq [endpoint:str, listen=bool, connect=bool, monitor=bool]` |

#### Events

| Operator | Description | Example |
| :------- | :---------- | :------ |
| [`to`](/reference/operators/to) | Saves to an URI, inferring the destination, compression and format. | `to uri:string, [saver_args… { … }]` |
| [`to_asl`](/reference/operators/to_asl) | Sends events to [Amazon Security Lake (ASL)][asl]. | `to_asl s3_uri:string, region=string, account_id=string, [timeout=duration]` |
| [`to_azure_log_analytics`](/reference/operators/to_azure_log_analytics) | Sends events to the [Microsoft Azure Logs Ingestion API][api]. | `to_azure_log_analytics tenant_id=string, client_id=string, client_secret=string,` |
| [`to_clickhouse`](/reference/operators/to_clickhouse) | Sends events to a ClickHouse table. | `to_clickhouse table=string, [host=string, port=int, user=string, password=string,` |
| [`to_fluent_bit`](/reference/operators/to_fluent_bit) | Sends events via [Fluent Bit](https://docs.fluentbit.io/). | `to_fluent_bit plugin:string, [options=record, fluent_bit_options=record,` |
| [`to_google_cloud_logging`](/reference/operators/to_google_cloud_logging) | Sends events to [Google Cloud Logging](https://cloud.google.com/logging). | `to_google_cloud_logging log_id=string, [project=string, organization=string,` |
| [`to_google_cloud_logging`](/reference/operators/to_google_cloud_logging) | Sends events to **Google Cloud Logging**. | `to_google_cloud_logging name=string, resource_type=string,` |
| [`to_google_secops`](/reference/operators/to_google_secops) | Sends unstructured events to a Google SecOps Chronicle instance. | `to_google_secops customer_id=string, private_key=string, client_email=string,` |
| [`to_hive`](/reference/operators/to_hive) | Writes events to a URI using hive partitioning. | `to_hive uri:string, partition_by=list<field>, format=string, [timeout=duration, max_size=int]` |
| [`to_opensearch`](/reference/operators/to_opensearch) | Sends events to an OpenSearch-compatible Bulk API. | `to_opensearch url:string, action=string, [index=string, id=string, doc=record,` |
| [`to_snowflake`](/reference/operators/to_snowflake) | Sends events to a Snowflake database. | `to_snowflake account_identifier=string, user_name=string, password=string,` |
| [`to_splunk`](/reference/operators/to_splunk) | Sends events to a Splunk [HTTP Event Collector (HEC)][hec]. | `to_splunk url:string, hec_token=string,` |

## Packages

| Operator | Description | Example |
| :------- | :---------- | :------ |
| [`add`](/reference/operators/add) | Installs a package. | `package::add [package_id:string, inputs=record]` |
| [`list`](/reference/operators/list) | Lists all contexts | `context::list` |
| [`list`](/reference/operators/list) | Shows installed packages. | `package::list [format=string]` |
| [`list`](/reference/operators/list) | Shows managed pipelines. | `pipeline::list` |

## Parsing

| Operator | Description | Example |
| :------- | :---------- | :------ |
| [`read_bitz`](/reference/operators/read_bitz) | Parses bytes as *BITZ* format. | `read_bitz` |
| [`read_cef`](/reference/operators/read_cef) | Parses an incoming [Common Event Format (CEF)][cef] stream into events. | `read_cef [merge=bool, raw=bool, schema=string, selector=string, schema_only=bool, unflatten_separator=string]` |
| [`read_csv`](/reference/operators/read_csv) | Read CSV (Comma-Separated Values) from a byte stream. | `read_csv [list_separator=string, null_value=string, comments=bool, header=string,` |
| [`read_feather`](/reference/operators/read_feather) | Parses an incoming Feather byte stream into events. | `read_feather` |
| [`read_gelf`](/reference/operators/read_gelf) | Parses an incoming [GELF](https://go2docs.graylog.org/current/getting_in_log_data/gelf.html) stream into events. | `read_gelf [merge=bool, raw=bool, schema=string, selector=string, schema_only=bool, unflatten_separator=string]` |
| [`read_grok`](/reference/operators/read_grok) | read_grok pattern:string, [pattern_definitions=record\|string, indexed_captures=bool, | `read_grok pattern:string, [pattern_definitions=record\|string, indexed_captures=bool,` |
| [`read_json`](/reference/operators/read_json) | :::tip | `read_json [schema=string, selector=string, schema_only=bool, merge=bool, raw=bool,` |
| [`read_kv`](/reference/operators/read_kv) | Read Key-Value pairs from a byte stream. | `read_kv [field_split=string, value_split=string, merge=bool, raw=bool, quotes=string,` |
| [`read_leef`](/reference/operators/read_leef) | Parses an incoming [LEEF][leef] stream into events. | `read_leef [merge=bool, raw=bool, schema=string, selector=string, schema_only=bool, unflatten_separator=string]` |
| [`read_lines`](/reference/operators/read_lines) | Parses an incoming bytes stream into events. | `read_lines [skip_empty=bool, split_at_null=bool, split_at_regex=string]` |
| [`read_ndjson`](/reference/operators/read_ndjson) | Parses an incoming NDJSON (newline-delimited JSON) stream into events. | `read_ndjson [schema=string, selector=string, schema_only=bool,` |
| [`read_parquet`](/reference/operators/read_parquet) | Reads events from a Parquet byte stream. | `read_parquet` |
| [`read_pcap`](/reference/operators/read_pcap) | Reads raw network packets in [PCAP][pcap-rfc] file format. | `read_pcap [emit_file_headers=bool]` |
| [`read_ssv`](/reference/operators/read_ssv) | Read SSV (Space-Separated Values) from a byte stream. | `read_ssv [list_separator=string, null_value=string, comments=bool, header=string,` |
| [`read_suricata`](/reference/operators/read_suricata) | Parse an incoming [Suricata EVE JSON][eve-json] stream into events. | `read_suricata [schema_only=bool, raw=bool]` |
| [`read_syslog`](/reference/operators/read_syslog) | Parses an incoming [Syslog](https://en.wikipedia.org/wiki/Syslog) stream into events. | `read_syslog [merge=bool, raw=bool, schema=string, selector=string, schema_only=bool, unflatten_separator=string]` |
| [`read_tsv`](/reference/operators/read_tsv) | Read TSV (Tab-Separated Values) from a byte stream. | `read_tsv [list_separator=string, null_value=string, comments=bool, header=string,` |
| [`read_xsv`](/reference/operators/read_xsv) | Read XSV from a byte stream. | `read_xsv field_separator=string, list_separator=string, null_value=string,` |
| [`read_yaml`](/reference/operators/read_yaml) | Parses an incoming YAML stream into events. | `read_yaml [merge=bool, raw=bool, schema=string, selector=string,` |
| [`read_zeek_json`](/reference/operators/read_zeek_json) | Parse an incoming Zeek JSON stream into events. | `read_zeek_json [schema_only=bool, raw=bool]` |
| [`read_zeek_tsv`](/reference/operators/read_zeek_tsv) | Parses an incoming `Zeek TSV` stream into events. | `read_zeek_tsv` |

## Pipelines

| Operator | Description | Example |
| :------- | :---------- | :------ |
| [`activity`](/reference/operators/activity) | Summarizes the activity of pipelines. | `pipeline::activity range=duration, interval=duration` |
| [`detach`](/reference/operators/detach) | Starts a pipeline in the node. | `pipeline::detach { … }, [id=string]` |
| [`run`](/reference/operators/run) | Starts a pipeline in the node and waits for it to complete. | `pipeline::run { … }, [id=string]` |

## Printing

| Operator | Description | Example |
| :------- | :---------- | :------ |
| [`write_bitz`](/reference/operators/write_bitz) | Writes events in *BITZ* format. | `write_bitz` |
| [`write_csv`](/reference/operators/write_csv) | Transforms event stream to CSV (Comma-Separated Values) byte stream. | `write_csv [list_separator=str, null_value=str, no_header=bool]` |
| [`write_feather`](/reference/operators/write_feather) | Transforms the input event stream to Feather byte stream. | `write_feather [compression_level=int, compression_type=str, min_space_savings=double]` |
| [`write_json`](/reference/operators/write_json) | Transforms the input event stream to a JSON byte stream. | `write_json [strip=bool, color=bool, arrays_of_objects=bool,` |
| [`write_kv`](/reference/operators/write_kv) | Writes events in a Key-Value format. | `write_kv [field_separator=str, value_separator=str, list_separator=str,` |
| [`write_lines`](/reference/operators/write_lines) | Writes events as key-value pairsthe *values* of an event. | `write_lines` |
| [`write_ndjson`](/reference/operators/write_ndjson) | Transforms the input event stream to a Newline-Delimited JSON byte stream. | `write_ndjson [strip=bool, color=bool, arrays_of_objects=bool,` |
| [`write_parquet`](/reference/operators/write_parquet) | Transforms event stream to a Parquet byte stream. | `write_parquet [compression_level=int, compression_type=str]` |
| [`write_pcap`](/reference/operators/write_pcap) | Transforms event stream to PCAP byte stream. | `write_pcap` |
| [`write_ssv`](/reference/operators/write_ssv) | Transforms event stream to SSV (Space-Separated Values) byte stream. | `write_ssv [list_separator=str, null_value=str, no_header=bool]` |
| [`write_syslog`](/reference/operators/write_syslog) | Writes events as syslog. | `write_syslog [facility=int, severity=int, timestamp=time, hostname=string,` |
| [`write_tql`](/reference/operators/write_tql) | Transforms the input event stream to a TQL notation byte stream. | `write_tql [strip=bool, color=bool, compact=bool,` |
| [`write_tsv`](/reference/operators/write_tsv) | Transforms event stream to TSV (Tab-Separated Values) byte stream. | `write_tsv [list_separator=str, null_value=str, no_header=bool]` |
| [`write_xsv`](/reference/operators/write_xsv) | Transforms event stream to XSV byte stream. | `write_xsv field_separator=str, list_separator=str, null_value=str, [no_header=bool]` |
| [`write_yaml`](/reference/operators/write_yaml) | Transforms the input event stream to YAML byte stream. | `write_yaml` |
| [`write_zeek_tsv`](/reference/operators/write_zeek_tsv) | Transforms event stream into Zeek Tab-Separated Value byte stream. | `write_zeek_tsv [set_separator=str, empty_field=str, unset_field=str, disable_timestamp_tags=bool]` |
