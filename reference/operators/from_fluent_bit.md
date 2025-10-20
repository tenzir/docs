# from_fluent_bit

Receives events via Fluent Bit.

```tql
from_fluent_bit plugin:string, [options=record, fluent_bit_options=record,
                schema=string, selector=string, schema_only=bool, merge=bool,
                raw=bool, unflatten=string, tls=bool, cacert=string,
                certfile=string, keyfile=string, skip_peer_verification=bool]
```

## Description

[Section titled “Description”](#description)

The `from_fluent_bit` operator acts as a bridge into the [Fluent Bit](https://docs.fluentbit.io) ecosystem, making it possible to acquire events from a Fluent Bit [input plugin](https://docs.fluentbit.io/manual/pipeline/inputs).

An invocation of the `fluent-bit` commandline utility

```bash
fluent-bit -o plugin -p key1=value1 -p key2=value2 -p…
```

translates to our `from_fluent_bit` operator as follows:

```tql
from_fluent_bit "plugin", options={key1: value1, key2: value2, …}
```

Output to Fluent Bit

You can output events to Fluent Bit using the [`to_fluent_bit` operator](/reference/operators/to_fluent_bit).

### `plugin: string`

[Section titled “plugin: string”](#plugin-string)

The name of the Fluent Bit plugin.

Run `fluent-bit -h` and look under the **Inputs** section of the help text for available plugin names. The web documentation often comes with an example invocation near the bottom of the page, which also provides a good idea how you could use the operator.

### `options = record (optional)`

[Section titled “options = record (optional)”](#options--record-optional)

Sets plugin configuration properties.

The key-value pairs in this record are equivalent to `-p key=value` for the `fluent-bit` executable.

### `fluent_bit_options = record (optional)`

[Section titled “fluent\_bit\_options = record (optional)”](#fluent_bit_options--record-optional)

Sets global properties of the Fluent Bit service., e.g., `fluent_bit_options={flush:1, grace:3}`.

Consult the list of available [key-value pairs](https://docs.fluentbit.io/manual/administration/configuring-fluent-bit/classic-mode/configuration-file#config_section) to configure Fluent Bit according to your needs.

We recommend factoring these options into the plugin-specific `fluent-bit.yaml` so that they are independent of the `fluent-bit` operator arguments.

### `merge = bool (optional)`

Merges all incoming events into a single schema\* that converges over time. This option is usually the fastest *for reading* highly heterogeneous data, but can lead to huge schemas filled with nulls and imprecise results. Use with caution.

\*: In selector mode, only events with the same selector are merged.

### `raw = bool (optional)`

Use only the raw types that are native to the parsed format. Fields that have a type specified in the chosen `schema` will still be parsed according to the schema.

### `schema = string (optional)`

Provide the name of a schema to be used by the parser.

If a schema with a matching name is installed, the result will always have all fields from that schema.

* Fields that are specified in the schema, but did not appear in the input will be null.
* Fields that appear in the input, but not in the schema will also be kept. Use `schema_only=true` to reject fields that are not in the schema.

If the given schema does not exist, this option instead assigns the output schema name only.

The `schema` option is incompatible with the `selector` option.

### `selector = string (optional)`

Designates a field value as schema name with an optional dot-separated prefix.

The string is parsed as `<fieldname>[:<prefix>]`. The `prefix` is optional and will be prepended to the field value to generate the schema name.

For example, the Suricata EVE JSON format includes a field `event_type` that contains the event type. Setting the selector to `event_type:suricata` causes an event with the value `flow` for the field `event_type` to map onto the schema `suricata.flow`.

The `selector` option is incompatible with the `schema` option.

### `schema_only = bool (optional)`

When working with an existing schema, this option will ensure that the output schema has *only* the fields from that schema.

If the schema name is obtained via a `selector` and it does not exist, this has no effect.

This option requires either `schema` or `selector` to be set.

### `unflatten_separator = string (optional)`

A delimiter that, if present in keys, causes values to be treated as values of nested records.

A popular example of this is the [Zeek JSON](/reference/operators/read_zeek_json) format. It includes the fields `id.orig_h`, `id.orig_p`, `id.resp_h`, and `id.resp_p` at the top-level. The data is best modeled as an `id` record with four nested fields `orig_h`, `orig_p`, `resp_h`, and `resp_p`.

Without an unflatten separator, the data looks like this:

Without unflattening

```json
{
  "id.orig_h": "1.1.1.1",
  "id.orig_p": 10,
  "id.resp_h": "1.1.1.2",
  "id.resp_p": 5
}
```

With the unflatten separator set to `.`, Tenzir reads the events like this:

With 'unflatten'

```json
{
  "id": {
    "orig_h": "1.1.1.1",
    "orig_p": 10,
    "resp_h": "1.1.1.2",
    "resp_p": 5
  }
}
```

### `tls = bool (optional)`

Enables TLS.

Defaults to `false`.

### `cacert = string (optional)`

Path to the CA certificate used to verify the server’s certificate.

Defaults to the Tenzir configuration value `tenzir.cacert`, which in turn defaults to a common cacert location for the system.

### `certfile = string (optional)`

Path to the client certificate.

### `keyfile = string (optional)`

Path to the key for the client certificate.

### `skip_peer_verification = bool (optional)`

Toggles TLS certificate verification.

Defaults to `false`.

## URI support & integration with `from`

[Section titled “URI support & integration with from”](#uri-support--integration-with-from)

The `from_fluent_bit` operator can also be used from the [`from`](/reference/operators/from) operator. For this, the `fluentbit://` scheme can be used. The URI is then translated:

```tql
from "fluentbit://plugin"
```

```tql
from_fluent_bit "plugin"
```

## Examples

[Section titled “Examples”](#examples)

### OpenTelemetry

[Section titled “OpenTelemetry”](#opentelemetry)

Ingest [OpenTelemetry](https://docs.fluentbit.io/manual/pipeline/inputs/slack) logs, metrics, and traces:

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

### Splunk

[Section titled “Splunk”](#splunk)

Handle [Splunk](https://docs.fluentbit.io/manual/pipeline/inputs/splunk) HEC requests:

```tql
from_fluent_bit "splunk", options={port: 8088}
```