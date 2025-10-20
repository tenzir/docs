# HTTP

Tenzir supports HTTP and HTTPS, both as sender and receiver.

When retrieving data from an API or website, you prepare your HTTP request and get back the HTTP response body as your pipeline data:

![HTTP from](/pr-preview/pr-116/_astro/http-from.CK3DDVvm_19DKCs.svg)

When sending data from a pipeline to an API or website, the events in the pipeline make up the HTTP request body. If the HTTP status code is not 2\*\*, you will get a warning.

![HTTP from](/pr-preview/pr-116/_astro/http-to.DgFU5GZf_19DKCs.svg)

In both cases, you can only provide static header data.

URL Support

The URL schemes `http://` and `https://` dispatch to [`load_http`](/reference/operators/load_http) and [`save_http`](/reference/operators/save_http) for seamless URL-style use via [`from`](/reference/operators/from) and [`to`](/reference/operators/to).

Since the majority of HTTP activity uses JSON-encoded request/response bodies, you do not need to provide a separate pipeline argument with [`read_json`](/reference/operators/read_json) and [`write_ndjson`](/reference/operators/write_ndjson).

## Examples

[Section titled “Examples”](#examples)

### Perform a GET request with URL parameters

[Section titled “Perform a GET request with URL parameters”](#perform-a-get-request-with-url-parameters)

```tql
from "http://example.com:8888/api", method="GET", params={query: "tenzir"}
```

### Perform a POST request with JSON body

[Section titled “Perform a POST request with JSON body”](#perform-a-post-request-with-json-body)

```tql
from "http://example.com:8888/api", method="POST", data={query: "tenzir"}
```

### Call a webhook API with pipeline data

[Section titled “Call a webhook API with pipeline data”](#call-a-webhook-api-with-pipeline-data)

```tql
from {
  x: 42,
  y: "foo",
}
to "http://example.com:8888/api"
```