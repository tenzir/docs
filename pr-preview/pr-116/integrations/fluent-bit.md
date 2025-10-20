# Fluent Bit

[Fluent Bit](https://fluentbit.io) is a an open source observability pipeline. Tenzir embeds Fluent Bit, exposing all its [inputs](https://docs.fluentbit.io/manual/pipeline/inputs) via [`from_fluent_bit`](/reference/operators/from_fluent_bit) and [outputs](https://docs.fluentbit.io/manual/pipeline/outputs) via [`to_fluent_bit`](/reference/operators/to_fluent_bit)

This makes Tenzir effectively a superset of Fluent Bit.

![Fluent Bit Inputs & Outputs](/pr-preview/pr-116/_astro/fluent-bit.BMlvI90p_19DKCs.svg)

Fluent Bit [parsers](https://docs.fluentbit.io/manual/pipeline/parsers) map to Tenzir operators that accept bytes as input and produce events as output. Fluent Bit [filters](https://docs.fluentbit.io/manual/pipeline/filters) correspond to Tenzir operators that perform event-to-event transformations. Tenzir does not expose Fluent Bit parsers and filters, only inputs and output.

Internally, Fluent Bit uses [MsgPack](https://msgpack.org/) to encode events whereas Tenzir uses [Arrow](https://arrow.apache.org) record batches. The `fluentbit` source operator transposes MsgPack to Arrow, and the `fluentbit` sink performs the reverse operation.

## Usage

[Section titled “Usage”](#usage)

An invocation of the `fluent-bit` commandline utility

```bash
fluent-bit -o input_plugin -p key1=value1 -p key2=value2 -p…
```

translates to Tenzir’s [`from_fluent_bit`](/reference/operators/from_fluent_bit) operator as follows:

```tql
from_fluent_bit "input_plugin", options={key1: value1, key2: value2, …}
```

with the [`to_fluent_bit`](/reference/operators/to_fluent_bit) operator working exactly analogous.

## Examples

[Section titled “Examples”](#examples)

### Ingest OpenTelemetry logs, metrics, and traces

[Section titled “Ingest OpenTelemetry logs, metrics, and traces”](#ingest-opentelemetry-logs-metrics-and-traces)

```tql
from_fluent_bit "opentelemetry"
```

You can then send JSON-encoded log data to a freshly created API endpoint:

```bash
curl \
  --header "Content-Type: application/json" \
  --request POST \
  --data '{"resourceLogs":[{"resource":{},"scopeLogs":[{"scope":{},"logRecords":[{"timeUnixNano":"1660296023390371588","body":{"stringValue":"{\"message\":\"dummy\"}"},"traceId":"","spanId":""}]}]}]}' \
  http://0.0.0.0:4318/v1/logs
```

### Imitate a Splunk HEC endpoint

[Section titled “Imitate a Splunk HEC endpoint”](#imitate-a-splunk-hec-endpoint)

```tql
from_fluent_bit "splunk", options = {port: 8088}
```

Tip

Use the dedicated [`to_splunk` operator](/reference/operators/to_splunk) to send events to a Splunk HEC.

### Imitate an ElasticSearch & OpenSearch Bulk API endpoint

[Section titled “Imitate an ElasticSearch & OpenSearch Bulk API endpoint”](#imitate-an-elasticsearch--opensearch-bulk-api-endpoint)

This allows you to ingest from beats (e.g., Filebeat, Metricbeat, Winlogbeat).

```tql
from_fluent_bit "elasticsearch", options = {port: 9200}
```

### Send to Datadog

[Section titled “Send to Datadog”](#send-to-datadog)

```tql
to_fluent_bit "datadog", options = {apikey: "XXX"}
```

### Send to ElasticSearch

[Section titled “Send to ElasticSearch”](#send-to-elasticsearch)

```tql
to_fluent_bit "es", options = {host: 192.168.2.3, port: 9200, index: "my_index", type: "my_type"}
```