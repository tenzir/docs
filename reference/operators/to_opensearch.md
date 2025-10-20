# to_opensearch

Sends events to an OpenSearch-compatible Bulk API.

```tql
to_opensearch url:string, action=string, [index=string, id=string, doc=record,
    user=string, passwd=string, tls=bool, skip_peer_verification=bool,
    cacert=string, certfile=string, keyfile=string, include_nulls=bool,
    max_content_length=int, buffer_timeout=duration, compress=bool]
```

## Description

[Section titled “Description”](#description)

The `to_opensearch` operator sends events to a [OpenSearch-compatible Bulk API](https://opensearch.org/docs/latest/api-reference/document-apis/bulk/) such as [ElasticSearch](https://www.elastic.co/elasticsearch).

The operator accumulates multiple events before sending them as a single request. You can control the maximum request size via the `max_content_length` and the timeout before sending all accumulated events via the `send_timeout` option.

### `url: string`

[Section titled “url: string”](#url-string)

The URL of the API endpoint.

### `action = string`

[Section titled “action = string”](#action--string)

An expression for the action that evaluates to a `string`.

Supported actions:

* `create`: Creates a document if it doesn’t already exist and returns an error otherwise.
* `delete`: Deletes a document if it exists.
* `index`: Creates a document if it doesn’t yet exist and replace the document if it already exists.
* `update`: Updates existing documents and returns an error if the document doesn’t exist.
* `upsert`: If a document exists, it is updated; if it does not exist, a new document is indexed.

### `index = string (optional)`

[Section titled “index = string (optional)”](#index--string-optional)

An optional expression for the index that evaluates to a `string`.

Must be provided if the `url` does not have an index.

### `id = string (optional)`

[Section titled “id = string (optional)”](#id--string-optional)

The `id` of the document to act on.

Must be provided when using the `delete` and `update` actions.

### `doc = record (optional)`

[Section titled “doc = record (optional)”](#doc--record-optional)

The document to serialize.

Defaults to `this`.

### `user = string (optional)`

[Section titled “user = string (optional)”](#user--string-optional)

Optional user for HTTP Basic Authentication.

### `passwd = string (optional)`

[Section titled “passwd = string (optional)”](#passwd--string-optional)

Optional password for HTTP Basic Authentication.

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

Defaults to `false`.

### `max_content_length = int (optional)`

[Section titled “max\_content\_length = int (optional)”](#max_content_length--int-optional)

The maximum size of the message uncompressed body in bytes. A message may consist of multiple events. If a single event is larger than this limit, it is dropped and a warning is emitted.

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

### Send events from a JSON file

[Section titled “Send events from a JSON file”](#send-events-from-a-json-file)

```tql
from "example.json"
to_opensearch "localhost:9200", action="create", index="main"
```

## See Also

[Section titled “See Also”](#see-also)

[`from_opensearch`](/reference/operators/from_opensearch)