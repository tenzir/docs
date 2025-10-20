# to_fluent_bit

Sends events via Fluent Bit.

```tql
to_fluent_bit plugin:string, [options=record, fluent_bit_options=record,
              tls=bool, cacert=string, certfile=string, keyfile=string,
              skip_peer_verification=bool]
```

## Description

[Section titled “Description”](#description)

The `to_fluent_bit` operator acts as a bridge into the [Fluent Bit](https://docs.fluentbit.io) ecosystem, making it possible to send events to Fluent Bit [output plugin](https://docs.fluentbit.io/manual/pipeline/outputs).

An invocation of the `fluent-bit` commandline utility

```bash
fluent-bit -o plugin -p key1=value1 -p key2=value2 -p…
```

translates to our `to_fluent_bit` operator as follows:

```tql
to_fluent_bit "plugin", options={key1: value1, key2:value2, …}
```

Read from Fluent Bit

You can acquire events from Fluent Bit using the [`from_fluent_bit` operator](/reference/operators/from_fluent_bit).

### `plugin: string`

[Section titled “plugin: string”](#plugin-string)

The name of the Fluent Bit plugin.

Run `fluent-bit -h` and look under the **Outputs** section of the help text for available plugin names. The web documentation often comes with an example invocation near the bottom of the page, which also provides a good idea how you could use the operator.

### `options = record (optional)`

[Section titled “options = record (optional)”](#options--record-optional)

Sets plugin configuration properties.

The key-value pairs in this record are equivalent to `-p key=value` for the `fluent-bit` executable.

### `fluent_bit_options = record (optional)`

[Section titled “fluent\_bit\_options = record (optional)”](#fluent_bit_options--record-optional)

Sets global properties of the Fluent Bit service. E.g., `fluent_bit_options={flush:1, grace:3}`.

Consult the list of available [key-value pairs](https://docs.fluentbit.io/manual/administration/configuring-fluent-bit/classic-mode/configuration-file#config_section) to configure Fluent Bit according to your needs.

We recommend factoring these options into the plugin-specific `fluent-bit.yaml` so that they are independent of the `fluent-bit` operator arguments.

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

The `to_fluent_bit` operator can also be used from the [`to`](/reference/operators/to) operator. For this, the `fluentbit://` scheme can be used. The URI is then translated:

```tql
to "fluentbit://plugin"
```

```tql
to_fluent_bit "plugin"
```

## Examples

[Section titled “Examples”](#examples)

### Slack

[Section titled “Slack”](#slack)

Send events to [Slack](https://docs.fluentbit.io/manual/pipeline/outputs/slack):

```tql
let $slack_hook = "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX"
to_fluent_bit "slack", options={webhook: $slack_hook}
```