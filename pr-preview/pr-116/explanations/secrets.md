# Secrets

Operators accept secrets as parameters for sensitive values, such as authentication tokens, passwords, or even URLs.

Security Design

Secrets are designed to protect against *accidentally* compromising the secret value. You should assume that anyone with access to a workspace will be able to obtain the true value.

Read more in the [Security Design](#security-design) section.

## Usage in TQL

[Section titled “Usage in TQL”](#usage-in-tql)

You can use secret values only with operators that accept secrets. Operators generally do not document that they accept a secret, but they will accept secrets where appropriate.

You have two ways to pass an argument to an operator that expects a secret. The following examples use the [`to_splunk`](/reference/operators/to_splunk) operator, which expects a HEC-token for authentication:

* Provide a plain `string` ([Ad-hoc Secret](#ad-hoc-secrets)):

  ```tql
  to_splunk "https://localhost:8088", hec_token="my-plaintext-token"
  ```

  This creates a “secret” containing the string literal `my-plaintext-token`.

* Use the [`secret`](/reference/functions/secret) function ([Managed Secret](#managed-secrets)):

  ```tql
  to_splunk "https://localhost:8088", hec_token=secret("splunk-hec-token")
  ```

  The operator fetches the secret named `splunk-hec-token` to authenticate with the Splunk endpoint.

## The `secret` type

[Section titled “The secret type”](#the-secret-type)

Tenzir’s [type system](/explanations/language/types) includes secrets as a special type. You can access secrets only with the [`secret`](/reference/functions/secret) function.

### Internals

[Section titled “Internals”](#internals)

A value of type `secret` contains only the secret’s name, not the secret value itself. When a pipeline operator uses a secret, it resolves the name asynchronously. For ad-hoc secrets created from a string literal, name and value of the secret are identical, so no lookup occurs.

### Supported Operations

[Section titled “Supported Operations”](#supported-operations)

#### Concatenation

[Section titled “Concatenation”](#concatenation)

You can concatenate secrets with other secrets or strings using the `+` operator:

```tql
auth = "Bearer " + secret("my-secret")
url = $base_url + secret("user-name") + ":" + secret("password")
```

#### Format Strings

[Section titled “Format Strings”](#format-strings)

Secrets can be used in [format strings](/explanations/language/expressions#format-strings-f-strings). Unlike other types, which create strings with values formatted as-if using the `string` function, a format string containing a secret yields a secret.

The above concatenations can be written using format strings, like so:

```tql
auth = f"Bearer {secret("my-secret")}"
url = f"{$base_url}{secret("user-name")}:{secret("password")}"
```

A format string will turn secrets nested in a structured value (`record`, `list`) into the string `"***"`.

#### Encoding & Decoding

[Section titled “Encoding & Decoding”](#encoding--decoding)

In general, Tenzir does not assume that a secret is valid UTF-8, although most operators will make that constraint. Conversely some secret stores may require your secrets to be UTF-8, while some operators expect a binary secret.

To bridge this gap, you can base64-decode secrets using the [`decode_base64`](/reference/functions/decode_base64) function and base64-encode them using the [`encode_base64`](/reference/functions/encode_base64) function:

```tql
let $binary_secret = secret("my-encoded-secret").decode_base64()
```

You can also encode (or decode) the result of a concatenation or format string, which is useful for some APIs:

```tql
let $headers = {
  auth: f"{secret("user")}:{secret("password")}".encode_base64()
}
```

#### Turning Secrets into Strings

[Section titled “Turning Secrets into Strings”](#turning-secrets-into-strings)

You cannot turn a secret into a string. Any such attempt will simply produce the string `"***"`.

#### Python

[Section titled “Python”](#python)

Since secrets can also be values in a pipeline, they can also be passed *through* the [`python`](/reference/operators/python) operator. You must not modify a secret in the [`python`](/reference/operators/python) operator.

## Ad-hoc Secrets

[Section titled “Ad-hoc Secrets”](#ad-hoc-secrets)

**Ad-hoc secrets** are secrets implicitly created from a `string` within [TQL](/explanations/language). This happens when you provide a `string` to an operator that expects a `secret`.

Providing plain string values can help when you develop pipelines and do not want to add the secret to the configuration or a secret store.

This approach is also useful for arguments that you do not consider a secret, so you don’t have to create a managed secret.

However, secrets created from plain `string`s do not enjoy the same security as managed secrets. Their value appears directly in the TQL pipeline definition, as well as in the compiled and executed representation. As such, the Tenzir Node may persist the value.

## Managed Secrets

[Section titled “Managed Secrets”](#managed-secrets)

Managed secrets are identified by their name and can come from the following sources, in descending precedence:

1. The environment of the Tenzir Node
2. The configuration of the Tenzir Node
3. The Tenzir Platform secret store for the workspace the Tenzir Node belongs to

![Resolution](/pr-preview/pr-116/_astro/secret-resolution.a_JW2CI2_19DKCs.svg)

You use a managed secrets value using the [`secret`](/reference/functions/secret).

The Tenzir Node looks up the secret’s actual value only when an operator requires it. It first checks the config, with environment variables taking precedence over configuration file entries. If the secret is not found there, a request is made to the Tenzir Platform.

If the value is transferred over any network connection, it additionally be encrypted using [ECIES](https://en.wikipedia.org/wiki/Integrated_Encryption_Scheme) with a one-time, per-secret key. The value remains encrypted throughout the transfer until the final usage site.

A `tenzir` client process can use managed secrets only if it is able to connect to a Tenzir Node.

### Configuration Secrets

[Section titled “Configuration Secrets”](#configuration-secrets)

You can specify secrets in the `tenzir.yaml` config file, under the path `tenzir.secrets`:

tenzir.yaml

```yaml
tenzir:
  secrets:
    # Add your secrets here.
    geheim: 1528F9F3-FAFA-45B4-BC3C-B755D0E0D9C2
```

Since you can also set Tenzir’s configuration options as environment variables, you can define secrets in the environment as well. The above secret could also be defined via the environment variable `TENZIR_SECRETS__GEHEIM`. An environment variable takes precedence over an equivalent key in the configuration file.

See the [configuration reference](/reference/node/configuration) for more details.

Tenzir hides the `tenzir.secrets` section from the [`config()`](/reference/functions/config) function.

### Platform Secrets

[Section titled “Platform Secrets”](#platform-secrets)

The Tenzir Platform stores a separate set of secrets for every workspace. All Tenzir Nodes connected to that workspace can access these secrets.

Read about how to configure the platform secret store in the [guides section](/guides/platform-setup/configure-secret-store#configuring-the-platform-secret-store).

#### External Secret Stores

[Section titled “External Secret Stores”](#external-secret-stores)

You can configure the Tenzir Platform to provide access to secrets stored in an external secret store instead of using it own store. This access is read-only.

Read more about how to configure an external secret store in the [guides section](/guides/platform-setup/configure-secret-store#configuring-external-secret-stores).

## Legacy Model

[Section titled “Legacy Model”](#legacy-model)

You can use the configuration option `tenzir.legacy-secret-model` to change the behavior of the `secret` function so that it returns a `string` instead of a `secret`.

When you use the legacy model, you can only use secrets from the Tenzir Node’s configuration. You cannot use secrets from the Tenzir Platform’s secret store.

We do not recommend enabling this option. It exists as a transition option and will be deprecated and removed in some future version.

## Security Design

[Section titled “Security Design”](#security-design)

We designed secrets to protect against *accidentally* compromising the secret value by revealing it in a log file, showing it in a UI element, or committing it to a code repository as part of a pipeline.

However, anyone with access to a workspace can access secret values if sufficiently motivated.

For example, you could use a simple HTTP API that echoes requests to extract secret values:

```tql
from_http "echo.api.com",
  headers = { leaked: secret("key") },
  metadata_field=metadata
select metadata.headers.leaked
```

```tql
{ leaked: "secret-value" }
```

### Secrets in Diagnostics

[Section titled “Secrets in Diagnostics”](#secrets-in-diagnostics)

We take care not to leak managed secrets in our diagnostic messages. However, numerous of our integrations rely on third party libraries. Those libraries may produce error messages which are outside of our control, but that we forward to the user to help understand an issue.

As a remedy for this, an operator censors the values of managed secrets it has used in all diagnostics. Please note that we only censor an occurrence of the full value, not parts of it. This means that a third party diagnostic forwarded to the user may still contain part of a secret value.

Use smaller secrets

Try and keep your managed secrets to the logical unit that is a secret and use multiple secrets instead of one big one.

For example and S3 URI may contain multiple keys that should be kept as separate secrets, instead of a single one:

```tql
let $url = f"s3://{secret("access-key")}:{secret("secret-key")}@bucket/path/to/file"
```