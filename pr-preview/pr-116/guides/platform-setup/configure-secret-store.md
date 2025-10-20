# Configure secret store

The Tenzir Platform provides a secret store for each workspace. All Tenzir Nodes connected to the workspace can access its secrets. You can manage secrets using the CLI or the web interface. Alternatively, you can use an external secret store.

Read more about how secrets work in our [explanations page](/explanations/secrets).

## Configuring the platform secret store

[Section titled “Configuring the platform secret store”](#configuring-the-platform-secret-store)

### Managing Secrets via the CLI

[Section titled “Managing Secrets via the CLI”](#managing-secrets-via-the-cli)

To add a new secret to the Platform’s secret store:

Add value to the Platform's secret store

```sh
tenzir-platform secret add geheim --value=1528F9F3-FAFA-45B4-BC3C-B755D0E0D9C2
```

Refer to the [CLI reference](/reference/platform/command-line-interface#manage-secrets) for more details on updating or deleting secrets.

### Managing Secrets via Web Interface

[Section titled “Managing Secrets via Web Interface”](#managing-secrets-via-web-interface)

To manage secrets from the web interface, go to the `Workspace Settings` screen by clicking the gear icon in the workspace selector.

![Screenshot](/pr-preview/pr-116/_astro/secrets.Dd085Pjn_237u3S.webp)

## Configuring External Secret Stores

[Section titled “Configuring External Secret Stores”](#configuring-external-secret-stores)

You can configure the Tenzir Platform to provide access to secrets stored in an external secret store instead of using it own store. This access is read-only.

### AWS Secrets Manager

[Section titled “AWS Secrets Manager”](#aws-secrets-manager)

To add AWS Secrets Manager as an external secret store, use the CLI:

Add AWS Secrets Manager as external secret store

```sh
tenzir-platform secret store add aws \
  --region='eu-west-1' \
  --assumed-role-arn='arn:aws:iam::1234567890:role/tenzir-platform-secrets-access' \
  --prefix=tenzir/
```

* The Tenzir Platform must have permissions to read secrets under the specified prefix from the external store.
* The platform must be able to assume the specified role in AWS.

See the [CLI reference](/reference/platform/command-line-interface#manage-external-secret-stores) for more details.