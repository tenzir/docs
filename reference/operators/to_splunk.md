# to_splunk

Sends events to a Splunk [HTTP Event Collector (HEC)](https://docs.splunk.com/Documentation/Splunk/9.3.1/Data/UsetheHTTPEventCollector).

```tql
to_splunk url:string, hec_token=string,
          [event=any, host=string, source=string, sourcetype=expr, index=expr,
          tls=bool, cacert=string, certfile=string, keyfile=string,
          skip_peer_verification=bool, print_nulls=bool, max_content_length=int,
          buffer_timeout=duration, compress=bool]
```

## Description

[Section titled “Description”](#description)

The `to_splunk` operator sends events to a Splunk [HTTP Event Collector (HEC)](https://docs.splunk.com/Documentation/Splunk/9.3.1/Data/UsetheHTTPEventCollector).

The source type defaults to `_json` and the operator renders incoming events as JSON. You can specify a different source type via the `sourcetype` option.

The operator accumulates multiple events before sending them as a single message to the HEC endpoint. You can control the maximum message size via the `max_content_length` and the timeout before sending all accumulated events via the `send_timeout` option.

### `url: string`

[Section titled “url: string”](#url-string)

The address of the Splunk indexer.

### `hec_token = string`

[Section titled “hec\_token = string”](#hec_token--string)

The [HEC token](https://docs.splunk.com/Documentation/Splunk/9.3.1/Data/UsetheHTTPEventCollector#Create_an_Event_Collector_token_on_Splunk_Cloud_Platform) for authentication.

### `event = any (optional)`

[Section titled “event = any (optional)”](#event--any-optional)

The event to send.

Defaults to `this`, meaning the entire event is sent.

### `host = string (optional)`

[Section titled “host = string (optional)”](#host--string-optional)

An optional value for the [Splunk `host`](https://docs.splunk.com/Splexicon:Host).

### `source = string (optional)`

[Section titled “source = string (optional)”](#source--string-optional)

An optional value for the [Splunk `source`](https://docs.splunk.com/Splexicon:Source).

### `sourcetype = expr (optional)`

[Section titled “sourcetype = expr (optional)”](#sourcetype--expr-optional)

An optional expression for [Splunk’s `sourcetype`](https://docs.splunk.com/Splexicon:Sourcetype) that evaluates to a `string`. You can use this to set the `sourcetype` per event, by providing a field instead of a string.

Regardless of the chosen `sourcetype`, the event itself is passed as a json object in `event` key of level object that is sent.

Defaults to `_json`.

### `index = expr (optional)`

[Section titled “index = expr (optional)”](#index--expr-optional)

An optional expression for the [Splunk `index`](https://docs.splunk.com/Splexicon:Index) that evaluates to a `string`.

If you do not provide this option, Splunk will use the default index.

**NB**: HEC silently drops events with an invalid `index`.

### `tls = bool (optional)`

Enables TLS.

Defaults to `true`.

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

### `include_nulls = bool (optional)`

[Section titled “include\_nulls = bool (optional)”](#include_nulls--bool-optional)

Include fields with null values in the transmitted event data. By default, the operator drops all null values to save space.

### `max_content_length = int (optional)`

[Section titled “max\_content\_length = int (optional)”](#max_content_length--int-optional)

The maximum size of the message uncompressed body in bytes. A message may consist of multiple events. If a single event is larger than this limit, it is dropped and a warning is emitted.

This corresponds with Splunk’s [`max_content_length`](https://docs.splunk.com/Documentation/Splunk/9.3.1/Admin/Limitsconf#.5Bhttp_input.5D) option. Be aware that [Splunk Cloud has a default of `1MB`](https://docs.splunk.com/Documentation/SplunkCloud/9.2.2406/Service/SplunkCloudservice#Using_HTTP_Event_Collector_.28HEC.29) for `max_content_length`.

Defaults to `5Mi`.

### `buffer_timeout = duration (optional)`

[Section titled “buffer\_timeout = duration (optional)”](#buffer_timeout--duration-optional)

The maximum amount of time for which the operator accumulates messages before sending them out to the HEC endpoint as a single message.

Defaults to `5s`.

### `compress = bool (optional)`

[Section titled “compress = bool (optional)”](#compress--bool-optional)

Whether to compress the message body using standard gzip.

Defaults to `true`.

## Examples

[Section titled “Examples”](#examples)

### Send a JSON file to a HEC endpoint

[Section titled “Send a JSON file to a HEC endpoint”](#send-a-json-file-to-a-hec-endpoint)

```tql
load_file "example.json"
read_json
to_splunk "https://localhost:8088", hec_token=secret("splunk-hec-token")
```

### Data Dependent Splunk framing

[Section titled “Data Dependent Splunk framing”](#data-dependent-splunk-framing)

By default, the `to_splunk` operator sends the entire event as the `event` field to the HEC, together with any optional Splunk “frame” fields such as `host`, `source`, `sourcetype` and `index`. These special properties can be set using the operators respective arguments, with an expression that is evaluated per event.

However, this means that these special properties may be transmitted as both part of `event` and as part of the Splunk frame. This can be especially undesirable when the events are supposed to adhere to a specific schema, such as OCSF.

In this case, you can specify the additional `event` option to specify which part of the incoming event should be sent as the event.

```tql
from {
  host: "my-host",
  source: "my-source",
  a: 42,
  b: 0,
  message: "text",
  nested: { x: 0 },
}


// move the entire event into `event`
this = { event: this }


// hoist the splunk specific fields back out, so they are no longer part of the
// sent event
move host = event.host, source = event.source


to_splunk "https://localhost:8088",
  hec_token=secret("splunk-hec-token"),
  host=host,
  source=source,
  event=event
```