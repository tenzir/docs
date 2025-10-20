# load_ftp

Loads a byte stream via FTP.

```tql
load_ftp url:str [tls=bool, cacert=string, certifle=string,
                  keyfile=string, skip_peer_verification=bool]
```

## Description

[Section titled “Description”](#description)

Loads a byte stream via FTP.

### `url: str`

[Section titled “url: str”](#url-str)

The URL to request from. The `ftp://` scheme can be omitted.

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

## Examples

[Section titled “Examples”](#examples)

```tql
load_ftp "ftp.example.org"
```