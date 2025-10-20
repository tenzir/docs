# save_http

Sends a byte stream via HTTP.

```tql
save_http url:string, [params=record, headers=record, method=string,
          parallel=int, tls=bool, cacert=string, certifle=string,
          keyfile=string, skip_peer_verification=bool]
```

## Description

[Section titled “Description”](#description)

The `save_http` operator performs a HTTP request with the request body being the bytes provided by the previous operator.

### `url: string`

[Section titled “url: string”](#url-string)

The URL to write to. The `http://` scheme can be omitted.

### `method = string (optional)`

[Section titled “method = string (optional)”](#method--string-optional)

The HTTP method, such as `POST` or `GET`.

The default is `"POST"`.

### `params = record (optional)`

[Section titled “params = record (optional)”](#params--record-optional)

The query parameters for the request.

### `headers = record (optional)`

[Section titled “headers = record (optional)”](#headers--record-optional)

The headers for the request.

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

## Examples

[Section titled “Examples”](#examples)

### Call a webhook with pipeline data

[Section titled “Call a webhook with pipeline data”](#call-a-webhook-with-pipeline-data)

```tql
save_http "example.org/api", headers={"X-API-Token": "0000-0000-0000"}
```

## See Also

[Section titled “See Also”](#see-also)

[`load_http`](/reference/operators/load_http)