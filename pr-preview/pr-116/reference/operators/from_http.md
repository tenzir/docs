# from_http

Sends and receives HTTP/1.1 requests.

```tql
from_http url:string, [method=string, body=record|string|blob, encode=string,
          headers=record, metadata_field=field, error_field=field,
          paginate=record->string, paginate_delay=duration,
          connection_timeout=duration, max_retry_count=int,
          retry_delay=duration, tls=bool, certfile=string, keyfile=string,
          password=string { … }]
from_http url:string, server=true, [metadata_field=field, responses=record,
          max_request_size=int, tls=bool, certfile=string, keyfile=string,
          password=string { … }]
```

## Description

[Section titled “Description”](#description)

The `from_http` operator issues HTTP requests or spins up an HTTP/1.1 server on a given address and forwards received requests as events.

Format and Compression Inference

The `from_http` operator automatically infers the file format (such as JSON, CSV, Parquet, etc.) and compression type (such as gzip, zstd, etc.) directly from the URL’s file extension, just like the generic `from` operator. This makes it easier to load data from HTTP sources without manually specifying the format or decompression step.

If the format or compression cannot be determined from the URL, the operator will fall back to using the HTTP `Content-Type` and `Content-Encoding` response headers to determine how to parse and decompress the data.

If neither the URL nor the HTTP headers provide enough information, you can explicitly specify the decompression and parsing steps using a pipeline argument.

### `url: string`

[Section titled “url: string”](#url-string)

URL to listen on or to connect to.

Must have the form `<host>:<port>` when `server=true`.

### `method = string (optional)`

[Section titled “method = string (optional)”](#method--string-optional)

One of the following HTTP methods to use when using the client:

* `get`
* `head`
* `post`
* `put`
* `del`
* `connect`
* `options`
* `trace`

Defaults to `get`, or `post` if `body` is specified.

### `body = blob|record|string (optional)`

[Section titled “body = blob|record|string (optional)”](#body--blobrecordstring-optional)

Body to send with the HTTP request.

If the value is a `record`, then the body is encoded according to the `encode` option and an appropriate `Content-Type` is set for the request.

### `encode = string (optional)`

[Section titled “encode = string (optional)”](#encode--string-optional)

Specifies how to encode `record` bodies. Supported values:

* `json`
* `form`

Defaults to `json`.

### `headers = record (optional)`

[Section titled “headers = record (optional)”](#headers--record-optional)

Record of headers to send with the request.

### `metadata_field = field (optional)`

[Section titled “metadata\_field = field (optional)”](#metadata_field--field-optional)

Field to insert metadata into when using the parsing pipeline.

The response metadata (when using the client mode) has the following schema:

| Field     | Type     | Description                           |
| :-------- | :------- | :------------------------------------ |
| `code`    | `uint64` | The HTTP status code of the response. |
| `headers` | `record` | The response headers.                 |

The request metadata (when using the server mode) has the following schema:

| Field      | Type     | Description                          |
| :--------- | :------- | :----------------------------------- |
| `headers`  | `record` | The request headers.                 |
| `query`    | `record` | The query parameters of the request. |
| `path`     | `string` | The path requested.                  |
| `fragment` | `string` | The URI fragment of the request.     |
| `method`   | `string` | The HTTP method of the request.      |
| `version`  | `string` | The HTTP version of the request.     |

### `error_field = field (optional)`

[Section titled “error\_field = field (optional)”](#error_field--field-optional)

Field to insert the response body for HTTP error responses (status codes not in the 2xx or 3xx range).

When set, any HTTP response with a status code outside the 200–399 range will have its body stored in this field as a `blob`. Otherwise, error responses, alongside the original event, are skipped and an error is emitted.

### `paginate = record -> string (optional)`

[Section titled “paginate = record -> string (optional)”](#paginate--record---string-optional)

A lambda expression to evaluate against the result of the request (optionally parsed by the given pipeline). If the expression evaluation is successful and non-null, the resulting string is used as the URL for a new GET request with the same headers.

### `paginate_delay = duration (optional)`

[Section titled “paginate\_delay = duration (optional)”](#paginate_delay--duration-optional)

The duration to wait between consecutive pagination requests.

Defaults to `0s`.

### `connection_timeout = duration (optional)`

[Section titled “connection\_timeout = duration (optional)”](#connection_timeout--duration-optional)

Timeout for the connection.

Defaults to `5s`.

### `max_retry_count = int (optional)`

[Section titled “max\_retry\_count = int (optional)”](#max_retry_count--int-optional)

The maximum times to retry a failed request. Every request has its own retry count.

Defaults to `0`.

### `retry_delay = duration (optional)`

[Section titled “retry\_delay = duration (optional)”](#retry_delay--duration-optional)

The duration to wait between each retry.

Defaults to `1s`.

### `server = bool (optional)`

[Section titled “server = bool (optional)”](#server--bool-optional)

Whether to spin up an HTTP server or act as an HTTP client.

Defaults to `false`, i.e., the HTTP client.

### `responses = record (optional)`

[Section titled “responses = record (optional)”](#responses--record-optional)

Specify custom responses for endpoints on the server. For example,

```tql
responses = {
  "/resource/create": { code: 200, content_type: "text/html", body: "Created!" },
  "/resource/delete": { code: 401, content_type: "text/html", body: "Unauthorized!" }
}
```

creates two special routes on the server with different responses.

Requests to an unspecified endpoint are responded with HTTP Status `200 OK`.

### `max_request_size = int (optional)`

[Section titled “max\_request\_size = int (optional)”](#max_request_size--int-optional)

The maximum size of an incoming request to accept.

Defaults to `10MiB`.

### `tls = bool (optional)`

[Section titled “tls = bool (optional)”](#tls--bool-optional)

Enables TLS.

Defaults to `false`.

### `certfile = string (optional)`

[Section titled “certfile = string (optional)”](#certfile--string-optional)

Path to the client certificate. Required for server if `tls` is `true`.

### `keyfile = string (optional)`

[Section titled “keyfile = string (optional)”](#keyfile--string-optional)

Path to the key for the client certificate. Required for server if `tls` is `true`.

### `password = string (optional)`

[Section titled “password = string (optional)”](#password--string-optional)

Password for keyfile.

### `{ … } (optional)`

[Section titled “{ … } (optional)”](#---optional)

A pipeline that receives the response body as bytes, allowing parsing per request. This is especially useful in scenarios where the response body can be parsed into multiple events.

If not provided, the operator will attempt to infer the parsing operator from the `Content-Type` header. Should this inference fail (e.g., unsupported or missing `Content-Type`), the operator raises an error.

## Examples

[Section titled “Examples”](#examples)

### Make a GET request

[Section titled “Make a GET request”](#make-a-get-request)

Make a request to [urlscan.io](https://urlscan.io/docs/api#search) to search for scans for `tenzir.com` and get the first result.

```tql
from_http "https://urlscan.io/api/v1/search?q=tenzir.com"
unroll results
head 1
```

```tql
{
  results: {
    submitter: { ... },
    task: { ... },
    stats: { ... },
    page: { ... },
    _id: "0196edb1-521e-761f-9d62-1ca4cfad5b30",
    _score: null,
    sort: [ "1747744570133", "\"0196edb1-521e-761f-9d62-1ca4cfad5b30\"" ],
    result: "https://urlscan.io/api/v1/result/0196edb1-521e-761f-9d62-1ca4cfad5b30/",
    screenshot: "https://urlscan.io/screenshots/0196edb1-521e-761f-9d62-1ca4cfad5b30.png",
  },
  total: 9,
  took: 296,
  has_more: false,
}
```

### Paginated API Requests

[Section titled “Paginated API Requests”](#paginated-api-requests)

Use the `paginate` parameter to handle paginated APIs:

```tql
from_http "https://api.example.com/data", paginate=(x => x.next_url?)
```

This sends a GET request to the initial URL and evaluates the `x.next_url` field in the response to determine the next URL for subsequent requests.

### Retry Failed Requests

[Section titled “Retry Failed Requests”](#retry-failed-requests)

Configure retries for failed requests:

```tql
from_http "https://api.example.com/data", max_retry_count=3, retry_delay=2s
```

This tries up to 3 times, waiting 2 seconds between each retry.

### Listen on port 8080

[Section titled “Listen on port 8080”](#listen-on-port-8080)

Spin up a server with:

```tql
from_http "0.0.0.0:8080", server=true, metadata_field=metadata
```

Send a request to the HTTP endpoint via `curl`:

```sh
echo '{"key": "value"}' | gzip | curl localhost:8080 --data-binary @- -H 'Content-Encoding: gzip' -H 'Content-Type: application/json'
```

Observe the request in the Tenzir pipeline, parsed and decompressed:

```tql
{
  key: "value",
  metadata: {
    headers: {
      Host: "localhost:8080",
      "User-Agent": "curl/8.13.0",
      Accept: "*/*",
      "Content-Encoding": "gzip",
      "Content-Length": "37",
      "Content-Type": "application/json",
    },
    path: "/",
    method: "post",
    version: "HTTP/1.1",
  },
}
```

## See Also

[Section titled “See Also”](#see-also)

[`http`](/reference/operators/http), [`serve`](/reference/operators/serve)