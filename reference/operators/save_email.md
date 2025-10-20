# save_email

Saves bytes through an SMTP server.

```tql
save_email recipient:str, [endpoint=str, from=str, subject=str, username=str,
      password=str, authzid=str, authorization=str, tls=bool,
      skip_peer_verification=bool, cacert=string, certfile=string, keyfile=string,
      mime=bool]
```

## Description

[Section titled “Description”](#description)

The `save_email` operator establishes a SMTP(S) connection to a mail server and sends bytes as email body.

### `recipient: str`

[Section titled “recipient: str”](#recipient-str)

The recipient of the mail.

The expected format is either `Name <user@example.org>` with the email in angle brackets, or a plain email adress, such as `user@example.org`.

### `endpoint = str (optional)`

[Section titled “endpoint = str (optional)”](#endpoint--str-optional)

The endpoint of the mail server.

To choose between SMTP and SMTPS, provide a URL with with the corresponding scheme. For example, `smtp://127.0.0.1:25` will establish an unencrypted connection, whereas `smtps://127.0.0.1:25` an encrypted one. If you specify a server without a schema, the protocol defaults to SMTPS.

Defaults to `smtp://localhost:25`.

### `from = str (optional)`

[Section titled “from = str (optional)”](#from--str-optional)

The `From` header.

If you do not specify this parameter, an empty address is sent to the SMTP server which might cause the email to be rejected.

### `subject = str (optional)`

[Section titled “subject = str (optional)”](#subject--str-optional)

The `Subject` header.

### `username = str (optional)`

[Section titled “username = str (optional)”](#username--str-optional)

The username in an authenticated SMTP connection.

### `password = str (optional)`

[Section titled “password = str (optional)”](#password--str-optional)

The password in an authenticated SMTP connection.

### `authzid = str (optional)`

[Section titled “authzid = str (optional)”](#authzid--str-optional)

The authorization identity in an authenticated SMTP connection.

This option is only applicable to the PLAIN SASL authentication mechanism where it is optional. When not specified only the authentication identity (`authcid`) as specified by the username is sent to the server, along with the password. The server derives an `authzid` from the `authcid` when not provided, which it then uses internally. When the `authzid` is specified it can be used to access another user’s inbox, that the user has been granted access to, or a shared mailbox.

### `authorization = str (optional)`

[Section titled “authorization = str (optional)”](#authorization--str-optional)

The authorization options for an authenticated SMTP connection.

This login option defines the preferred authentication mechanism, e.g., `AUTH=PLAIN`, `AUTH=LOGIN`, or `AUTH=*`.

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

### `mime = bool (optional)`

[Section titled “mime = bool (optional)”](#mime--bool-optional)

Whether to wrap the chunk into a MIME part.

The operator uses the metadata of the byte chunk for the `Content-Type` MIME header.

Defaults to `false`.

## Examples

[Section titled “Examples”](#examples)

Send the Tenzir version string as CSV to `user@example.org`:

```tql
version
write_csv
save_email "user@example.org"
```

Send the email body as MIME part:

```tql
version
write_json
save_email "user@example.org", mime=true
```

This may result in the following email body:

```plaintext
--------------------------s89ecto6c12ILX7893YOEf
Content-Type: application/json
Content-Transfer-Encoding: quoted-printable


{
  "version": "4.10.4+ge0a060567b-dirty",
  "build": "ge0a060567b-dirty",
  "major": 4,
  "minor": 10,
  "patch": 4
}


--------------------------s89ecto6c12ILX7893YOEf--
```