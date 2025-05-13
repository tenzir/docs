---
title: Operators
---

Tenzir comes with a wide range of built-in pipeline operators.

## Modify

| Operator                 | Description                                                     | Example                          |
| :----------------------- | :-------------------------------------------------------------- | :------------------------------- |
| [`set`](set)             | Assigns a value to a field, creating it if necessary            | `name = "Tenzir"`                |
| [`select`](select)       | Selects some values and discard the rest                        | `select name, id=metadata.id`    |
| [`drop`](drop)           | Removes fields from the event                                   | `drop name, metadata.id`         |
| [`enumerate`](enumerate) | Adds a field with the number of the event                       | `enumerate num`                  |
| [`move`](move)           | Moves a field to another                                        | `move id=parsed_id, ctx.message=incoming.status` |
| [`timeshift`](timeshift) | Adjusts timestamps relative to a given start time               | `timeshift ts, start=2020-01-01` |
| [`unroll`](unroll)       | Unrolls a field of type list, duplicating the surrounding event | `unroll names`                   |

## Filter

| Operator                     | Description                                        | Example                           |
| :--------------------------- | :------------------------------------------------- | :-------------------------------- |
| [`where`](where)             | Keeps only events matching a predicate             | `where name.starts_with("John")`  |
| [`assert`](assert)           | Same as `where`, but warns if predicate is `false` | `assert name.starts_with("John")` |
| [`taste`](taste)             | Keeps only N events of each type                   | `taste 1`                         |
| [`head`](head)               | Keeps only the first N events                      | `head 20`                         |
| [`tail`](tail)               | Keeps only the last N events                       | `tail 20`                         |
| [`slice`](slice)             | Keeps a range of events with an optional stride    | `slice begin=10, end=30`          |
| [`sample`](sample)           | Samples events based on load                       | `sample 30s, max_samples=2k`      |
| [`deduplicate`](deduplicate) | Removes duplicate events                           | `deduplicate src_ip`              |

## Analyze

| Operator                 | Description                                 | Example                        |
| :----------------------- | :------------------------------------------ | :----------------------------- |
| [`summarize`](summarize) | Aggregates events with implicit grouping    | `summarize name, sum(amount)`  |
| [`sort`](sort)           | Sorts the events by one or more expressions | `sort name, -abs(transaction)` |
| [`reverse`](reverse)     | Reverses the event order                    | `reverse`                      |
| [`top`](top)             | Shows the most common values                | `top user`                     |
| [`rare`](rare)           | Shows the least common values               | `rare auth.token`              |

## Flow Control

| Operator                       | Description                                         | Example                                                      |
| :----------------------------- | :-------------------------------------------------- | :----------------------------------------------------------- |
| [`delay`](delay)               | Delays events relative to a start time              | `delay ts, speed=2.5`                                        |
| [`cron`](cron)                 | Runs a pipeline periodically with a cron expression | `cron "* */10 * * * MON-FRI" { from "https://example.org" }` |
| [`discard`](discard)           | Discards incoming bytes or events                   | `discard`                                                    |
| [`every`](every)               | Runs a pipeline periodically at a fixed interval    | `every 10s { summarize sum(amount) }`                        |
| [`fork`](fork)                 | Forwards a copy of the events to another pipeline   | `fork { to "copy.json" }`                                    |
| [`load_balance`](load_balance) | Routes the data to one of multiple subpipelines     | `load_balance $over { publish $over }`                       |
| [`pass`](pass)                 | Does nothing with the input                         | `pass`                                                       |
| [`repeat`](repeat)             | Repeats the input after it has finished             | `repeat 100`                                                 |
| [`throttle`](throttle)         | Limits the amount of data flowing through           | `throttle 100M, within=1min`                                 |

<!--
[`group`]() | Starts a new pipeline for each group | `group path { to $path }`
[`timeout`]() | Ends a pipeline after a period without input | `timeout 1s { … }`
[`match`]() | Splits the flow with pattern matching | `match name { "Tenzir" => {…}, _ => {…} }`
-->

## Inputs

#### Events

| Operator                              | Description                                              | Example                                                                                                    |
| :------------------------------------ | :------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------- |
| [`from`](from)                        | Reads events from an URI<br/>Creates events from records | `from "http://example.org/file.csv.gz"`<br/>`from {key: "value"}…` <!--at the top because its important--> |
| [`from_http`](from_http)              | Accepts or sends HTTP/1.1 requests                       | `from_http "0.0.0.0:8080`                                                                                  |
| [`from_fluent_bit`](from_fluent_bit) | Returns results from Fluent Bit                          | `from_fluent_bit "opentelemetry"`                                                                          |
| [`from_opensearch`](from_opensearch)  | Accepts requests for OpenSearch Bulk API                 | `from_opensearch`                                                                                          |
| [`from_velocira…`](from_velociraptor) | Returns results from a Velociraptor server               | `from_velociraptor subscribe="Windows"`                                                                    |

#### Bytes

| Operator                                      | Description                                    | Example                                  |
| :-------------------------------------------- | :--------------------------------------------- | :--------------------------------------- |
| [`load_amqp`](load_amqp)                      | Loads bytes from an AMQP server                | `load_amqp`                              |
| [`load_azure_blob…`](load_azure_blob_storage) | Load bytes from an Azure Blob Storage          | `load_azure_blob_storage "abfs://…`      |
| [`load_file`](load_file)                      | Loads bytes from a file                        | `load_file "/tmp/data.json"`             |
| [`load_ftp`](load_ftp)                        | Loads bytes via FTP                            | `load_ftp "ftp.example.org"`             |
| [`load_google_c…`](load_google_cloud_pubsub)  | Listen to a Google Cloud Pub/Sub subscription  | `load_google_cloud_pubsub project_id=…`  |
| [`load_gcs`](load_gcs)                        | Loads bytes from a Google Cloud Storage object | `load_gcs "gs://bucket/object.json"`     |
| [`load_http`](load_http)                      | Receives bytes from a HTTP request             | `load_http "example.org", params={n: 5}` |
| [`load_kafka`](load_kafka)                    | Receives bytes from an Apache Kafka topic      | `load_kafka topic="example"`             |
| [`load_nic`](load_nic)                        | Receives bytes from a Network Interface Card   | `load_nic "eth0"`                        |
| [`load_s3`](load_s3)                          | Receives bytes from an Amazon S3 object        | `load_s3 "s3://my-bucket/obj.csv"`       |
| [`load_stdin`](load_stdin)                    | Receives bytes standard input                  | `load_stdin`                             |
| [`load_sqs`](load_sqs)                        | Receives bytes from an Amazon SQS queue        | `load_sqs "sqs://tenzir"`                |
| [`load_tcp`](load_tcp)                        | Loads bytes from a TCP or TLS connection       | `load_tcp "0.0.0.0:8090" { read_json }`  |
| [`load_udp`](load_udp)                        | Loads bytes from a UDP socket                  | `load_udp "0.0.0.0:8090"`                |
| [`load_zmq`](load_zmq)                        | Receives bytes from ZeroMQ messages            | `load_zmq`                               |

## Outputs

#### Events

| Operator                                      | Description                                      | Example                                                                       |
| :-------------------------------------------- | :----------------------------------------------- | :---------------------------------------------------------------------------- |
| [`to`](to)                                    | Writes events to an URI                          | `to "s3://examplebucket/obj.json.gz"` <!--at the top because its important--> |
| [`to_asl`](to_asl)                            | Sends OCSF events to an Amazon Security Lake     | `to_asl "s3://…"`                                                             |
| [`to_azure_log_ana…`](to_azure_log_analytics) | Sends events to Azure Log Analytics              | `to_azure_log_analytics tenant_id=…`                                          |
| [`to_clickhouse`](to_clickhouse)              | Sends events to a ClickHouse Table               | `to_clickhouse table="my_table"`                                              |
| [`to_fluent_bit`](to_fluent_bit)              | Sends events to Fluent Bit                       | `to_fluent_bit "elasticsearch" …`                                             |
| [`to_google_secops`](to_google_secops)        | Sends events to Google SecOps                    | `to_google_secops …`                                                          |
| [`to_google_cloud_logging`](to_google_cloud_logging) | Sends events to Google Cloud Logging      | `to_google_cloud_logging …`                                                   |
| [`to_hive`](to_hive)                          | Writes events using hive partitioning            | `to_hive "s3://…", partition_by=[x]`                                          |
| [`to_opensearch`](to_opensearch)              | Sends incoming events to the OpenSearch Bulk API | `to_opensearch 'localhost:9200", …`                                           |
| [`to_snowflake`](to_snowflake)                | Sends incoming events to a Snowflake database    | `to_snowflake account_identifier="…`                                          |
| [`to_splunk`](to_splunk)                      | Sends incoming events to a Splunk HEC            | `to_splunk "localhost:8088", …`                                               |

#### Bytes

| Operator                                         | Description                                     | Example                              |
| :----------------------------------------------- | :---------------------------------------------- | :----------------------------------- |
| [`save_amqp`](save_amqp)                         | Saves incoming bytes to an AMQP server          | `save_amqp`                          |
| [`save_azure_blob…`](save_azure_blob_storage)    | Saves to an Azure Blob Storage                  | `save_azure_blob_storage "abfs://…`  |
| [`save_email`](save_email)                       | Saves incoming bytes through an SMTP server     | `save_email "user@example.org"`      |
| [`save_file`](save_file)                         | Saves incoming bytes into a file                | `save_file "/tmp/out.json"`          |
| [`save_ftp`](save_ftp)                           | Saves incoming bytes via FTP                    | `save_ftp "ftp.example.org"`         |
| [`save_google_cloud…`](save_google_cloud_pubsub) | Publishes to a Google Cloud Pub/Sub topic       | `save_google_cloud_pubsub project…`  |
| [`save_gcs`](save_gcs)                           | Saves bytes to a Google Cloud Storage object    | `save_gcs "gs://bucket/object.json"` |
| [`save_http`](save_http)                         | Sends incoming bytes over a HTTP connection     | `save_http "example.org/api"`        |
| [`save_kafka`](save_kafka)                       | Saves incoming bytes to an Apache Kafka topic   | `save_kafka topic="example"`         |
| [`save_s3`](save_s3)                             | Saves incoming bytes to an Amazon S3 object     | `save_s3 "s3://my-bucket/obj.csv"`   |
| [`save_stdout`](save_stdout)                     | Saves incoming bytes to standard output         | `save_stdout`                        |
| [`save_sqs`](save_sqs)                           | Saves incoming bytes to an Amazon SQS queue     | `save_sqs "sqs://tenzir"`            |
| [`save_tcp`](save_tcp)                           | Saves incoming bytes to a TCP or TLS connection | `save_tcp "0.0.0.0:8090", tls=true`  |
| [`save_udp`](save_udp)                           | Saves incoming bytes to a UDP socket            | `save_udp "0.0.0.0:8090"`            |
| [`save_zmq`](save_zmq)                           | Saves incoming bytes to ZeroMQ messages         | `save_zmq`                           |

## Parsing

| Operator                           | Description                               | Example                                   |
| :--------------------------------- | :---------------------------------------- | :---------------------------------------- |
| [`read_bitz`](read_bitz)           | Parses Tenzir's internal wire format      | `read_bitz`                               |
| [`read_cef`](read_cef)             | Parses the Common Event Format            | `read_cef`                                |
| [`read_csv`](read_csv)             | Parses comma-separated values             | `read_csv null_value="-"`                 |
| [`read_feather`](read_feather)     | Parses Feather format                     | `read_feather`                            |
| [`read_gelf`](read_gelf)           | Parses the Graylog Extended Log Format    | `read_gelf`                               |
| [`read_grok`](read_grok)           | Parses events using a Grok pattern        | `read_grok "%{IP:client} %{WORD:action}"` |
| [`read_json`](read_json)           | Parses JSON objects                       | `read_json arrays_of_objects=true`        |
| [`read_kv`](read_kv)               | Parses key-value pairs                    | `read_kv r"(\s+)[A-Z_]+:", r":\s*"`       |
| [`read_leef`](read_leef)           | Parses the Log Event Extended Format      | `read_leef`                               |
| [`read_lines`](read_lines)         | Parses each line into a separate event    | `read_lines`                              |
| [`read_ndjson`](read_ndjson)       | Parses newline-delimited JSON             | `read_ndjson`                             |
| [`read_pcap`](read_pcap)           | Parses raw network packets in PCAP format | `read_pcap`                               |
| [`read_parquet`](read_parquet)     | Parses Parquet format                     | `read_parquet`                            |
| [`read_ssv`](read_ssv)             | Parses space-separated values             | `read_ssv header="name count"`            |
| [`read_suricata`](read_suricata)   | Parses Suricata's Eve format              | `read_suricata`                           |
| [`read_syslog`](read_syslog)       | Parses syslog                             | `read_syslog`                             |
| [`read_tsv`](read_tsv)             | Parses tab-separated values               | `read_tsv auto_expand=true`               |
| [`read_xsv`](read_xsv)             | Parses custom-separated values            | `read_xsv ";", ":", "N/A"`                |
| [`read_yaml`](read_yaml)           | Parses YAML                               | `read_yaml`                               |
| [`read_zeek_json`](read_zeek_json) | Parses Zeek JSON                          | `read_zeek_json`                          |
| [`read_zeek_tsv`](read_zeek_tsv)   | Parses Zeek TSV                           | `read_zeek_tsv`                           |

## Printing

| Operator                           | Description                                    | Example          |
| :--------------------------------- | :--------------------------------------------- | :--------------- |
| [`write_bitz`](write_bitz)         | Writes events as Tenzir's internal wire format | `write_bitz`     |
| [`write_csv`](write_csv)           | Writes events as CSV                           | `write_csv`      |
| [`write_feather`](write_feather)   | Writes events as Feather                       | `write_feather`  |
| [`write_json`](write_json)         | Writes events as JSON                          | `write_json`     |
| [`write_kv`](write_kv)             | Writes events as key-value pairs               | `write_kv`       |
| [`write_ndjson`](write_ndjson)     | Writes events as Newline-Delimited JSON        | `write_ndjson`   |
| [`write_lines`](write_lines)       | Writes events as lines                         | `write_lines`    |
| [`write_parquet`](write_parquet)   | Writes events as Parquet                       | `write_parquet`  |
| [`write_pcap`](write_pcap)         | Writes events as PCAP                          | `write_pcap`     |
| [`write_ssv`](write_ssv)           | Writes events as SSV                           | `write_ssv`      |
| [`write_syslog`](write_syslog)     | Writes events as RFC 5424 syslog messages      | `write_syslog`   |
| [`write_tsv`](write_tsv)           | Writes events as TSV                           | `write_tsv`      |
| [`write_tql`](write_tql)           | Writes events as TQL objects                   | `write_tql`      |
| [`write_xsv`](write_xsv)           | Writes events as XSV                           | `write_xsv`      |
| [`write_yaml`](write_yaml)         | Writes events as YAML                          | `write_yaml`     |
| [`write_zeek_tsv`](write_zeek_tsv) | Writes events as Zeek TSV                      | `write_zeek_tsv` |

## Charts

| Operator                   | Description                   | Example        |
| :------------------------- | :---------------------------- | :------------- |
| [`chart_area`](chart_area) | Plots events on an area chart | `chart_area …` |
| [`chart_bar`](chart_bar)   | Plots events on a bar chart   | `chart_bar …`  |
| [`chart_line`](chart_line) | Plots events on a line chart  | `chart_line …` |
| [`chart_pie`](chart_pie)   | Plots events on a pie chart   | `chart_pie …`  |

## Connecting Pipelines

| Operator                 | Description                             | Example             |
| :----------------------- | :-------------------------------------- | :------------------ |
| [`publish`](publish)     | Publishes events to a certain topic     | `publish "topic"`   |
| [`subscribe`](subscribe) | Subscribes to events of a certain topic | `subscribe "topic"` |

## Node

### Inspection

| Operator                     | Description                                    | Example         |
| :--------------------------- | :--------------------------------------------- | :-------------- |
| [`diagnostics`](diagnostics) | Returns diagnostic events of managed pipelines | `diagnostics`   |
| [`openapi`](openapi)         | Returns the OpenAPI specification              | `openapi`       |
| [`metrics`](metrics)         | Retrieves metrics events from a Tenzir node    | `metrics "cpu"` |
| [`plugins`](plugins)         | Lists available plugins                        | `plugins`       |
| [`version`](version)         | Shows the current version                      | `version`       |

### Storage Engine

| Operator                   | Description                                        | Example                        |
| :------------------------- | :------------------------------------------------- | :----------------------------- |
| [`export`](export)         | Retrieves events from the node                     | `export`                       |
| [`fields`](fields)         | Lists all fields stored at the node                | `fields`                       |
| [`import`](import)         | Stores events at the node                          | `import`                       |
| [`partitions`](partitions) | Retrieves metadata about events stored at the node | `partitions src_ip == 1.2.3.4` |
| [`schemas`](schemas)       | Lists schemas for events stored at the node        | `schemas`                      |

## Host Inspection

| Operator                 | Description                        | Example                           |
| :----------------------- | :--------------------------------- | :-------------------------------- |
| [`files`](files)         | Lists files in a directory         | `files "/var/log/", recurse=true` |
| [`nics`](nics)           | Lists available network interfaces | `nics`                            |
| [`processes`](processes) | Lists running processes            | `processes`                       |
| [`sockets`](sockets)     | Lists open sockets                 | `sockets`                         |

## Detection

| Operator                        | Description                                         | Example                                 |
| :------------------------------ | :-------------------------------------------------- | :-------------------------------------- |
| [`sigma`](sigma) | Matches incoming events against Sigma rules         | `sigma "/tmp/rules/"`                   |
| [`yara`](yara)   | Matches the incoming byte stream against YARA rules | `yara "/path/to/rules", blockwise=true` |

## Internals

| Operator                 | Description                                         | Example                         |
| :----------------------- | :-------------------------------------------------- | :------------------------------ |
| [`api`](api)             | Calls Tenzir's REST API from a pipeline             | `api "/pipeline/list"`          |
| [`batch`](batch)         | Controls the batch size of events                   | `batch timeout=1s`              |
| [`buffer`](buffer)       | Adds additional buffering to handle spikes          | `buffer 10M, policy="drop"`     |
| [`cache`](cache)         | In-memory cache shared between pipelines            | `cache "w01wyhTZm3", ttl=10min` |
| [`legacy`](legacy)       | Provides a compatibility fallback to TQL1 pipelines | `legacy "chart area"`           |
| [`local`](local)         | Forces a pipeline to run locally                    | `local { sort foo }`            |
| [`measure`](measure)     | Returns events describing the incoming batches      | `measure`                       |
| [`remote`](remote)       | Forces a pipeline to run remotely at a node         | `remote { version }`            |
| [`serve`](serve)         | Makes events available at `/serve`                  | `serve "abcde12345"`            |
| [`strict`](strict)       | Treats all warnings as errors                       | `strict { assert false }`       |
| [`unordered`](unordered) | Remove ordering assumptions in a pipeline           | `unordered { read_ndjson }`     |

## Encode & Decode

| Operator                                 | Description                               | Example                     |
| :--------------------------------------- | :---------------------------------------- | :-------------------------- |
| [`compress_brotli`](compress_brotli)     | Compresses bytes using Brotli compression | `compress_brotli, level=10` |
| [`compress_bz2`](compress_bz2)           | Compresses bytes using bzip compression   | `compress_bz2, level=9`     |
| [`compress_gzip`](compress_gzip)         | Compresses bytes using gzip compression   | `compress_gzip, level=8`    |
| [`compress_lz4`](compress_lz4)           | Compresses bytes using lz4 compression    | `compress_lz4, level=7`     |
| [`compress_zstd`](compress_zstd)         | Compresses bytes using zstd compression   | `compress_zstd, level=6`    |
| [`decompress_brotli`](decompress_brotli) | Decompresses Brotli compressed bytes      | `decompress_brotli`         |
| [`decompress_bz2`](decompress_bz2)       | Decompresses bzip2 compressed bytes       | `decompress_bz2`            |
| [`decompress_gzip`](decompress_gzip)     | Decompresses gzip compressed bytes        | `decompress_gzip`           |
| [`decompress_lz4`](decompress_lz4)       | Decompresses lz4 compressed bytes         | `decompress_lz4`            |
| [`decompress_zstd`](decompress_zstd)     | Decompresses zstd compressed bytes        | `decompress_zstd`           |

## Pipelines

| Operator                          | Description             | Example         |
| :-------------------------------- | :---------------------- | :-------------- |
| [`pipeline::activity`](pipeline/activity) | Summarizes the activity of pipelines | `pipeline::activity range=1d, interval=1h` |
| [`pipeline::detach`](pipeline/detach) | Starts a pipeline in the node | `pipeline::detach { version }` |
| [`pipeline::list`](pipeline/list) | Shows managed pipelines | `pipeline::list` |

## Contexts

| Function                                                      | Description                                      | Example                                                                 |
| :------------------------------------------------------------ | :----------------------------------------------- | :---------------------------------------------------------------------- |
| [`context::create_bloom_filter`](context/create_bloom_filter) | Creates a Bloom filter context                   | `context::create_bloom_filter "ctx", capacity=1Mi, fp_probability=0.01` |
| [`context::create_lookup_table`](context/create_lookup_table) | Creates a lookup table context                   | `context::create_lookup_table "ctx"`                                    |
| [`context::create_geoip`](context/create_geoip)               | Creates a GeoIP context for IP-based geolocation | `context::create_geoip "ctx", db_path="GeoLite2-City.mmdb"`             |
| [`context::enrich`](context/enrich)                           | Enriches with a context                          | `context::enrich "ctx", key=x`                                          |
| [`context::erase`](context/erase)                             | Removes entries from a context                   | `context::erase "ctx", key=x`                                           |
| [`context::inspect`](context/inspect)                         | Inspects the details of a specified context      | `context::inspect "ctx"`                                                |
| [`context::list`](context/list)                               | Lists all contexts                               | `context::list`                                                         |
| [`context::remove`](context/remove)                           | Deletes a context                                | `context::remove "ctx"`                                                 |
| [`context::reset`](context/reset)                             | Resets the state of a specified context          | `context::reset "ctx"`                                                  |
| [`context::save`](context/save)                               | Saves context state                              | `context::save "ctx"`                                                   |
| [`context::load`](context/load)                               | Loads context state                              | `context::load "ctx"`                                                   |
| [`context::update`](context/update)                           | Updates an existing context with new data        | `context::update "ctx", key=x, value=y`                                 |

<!--
TBD: new name
[`context::lookup`]() | |
-->

## Packages

| Operator                         | Description              | Example                           |
| :------------------------------- | :----------------------- | :-------------------------------- |
| [`package::add`](package/add)    | Installs a package       | `package::add "suricata-ocsf"`    |
| [`package::list`](package/list)  | Shows installed packages | `package::list`                   |
| [`package::remove`](package/add) | Uninstalls a package     | `package::remove "suricata-ocsf"` |

## Escape Hatches

| Operator           | Description                              | Example                                           |
| :----------------- | :--------------------------------------- | :------------------------------------------------ |
| [`python`](python) | Executes a Python snippet for each event | `python "self.x = self.y"`                        |
| [`shell`](shell)   | Runs a shell command within the pipeline | <code>shell "./process.sh \| tee copy.txt"</code> |
