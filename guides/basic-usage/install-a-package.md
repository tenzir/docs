# Install a package

[Packages](/explanations/packages) provide a flexible approach for combining operators, pipelines, contexts, and examples into a unified deployable unit.

Write your own package

Want to create your own package? Check out our [package development tutorial](/tutorials/write-a-package).

## Install from the Tenzir Library

[Section titled “Install from the Tenzir Library”](#install-from-the-tenzir-library)

The most convenient way to install a package is through the [Tenzir Library](https://app.tenzir.com/library):

1. Click on a package
2. Select the *Install* tab
3. Define your inputs (optional)
4. Click the *Install* button in the bottom right

## Install with the package operator

[Section titled “Install with the package operator”](#install-with-the-package-operator)

To install a package interactively in TQL, use the [`package::add`](/reference/operators/package/add) operator:

```tql
package::add "/path/to/pkg"
```

This installs the package from the directory `/path/to/pkg`. Pass an `inputs` record to adjust the package configuration and replace the package’s templates with concrete values:

```tql
package::add "package.yaml", inputs={
  endpoint: "localhost:42000",
  policy: "block",
}
```

Your package now appears when you list all installed packages:

```tql
package::list
```

```tql
{
  id: "your-package",
  install_status: "installed",
  // …
}
```

To uninstall a package interactively, use [`package::remove`](/reference/operators/package/remove) and pass the package ID.

```tql
package::remove "your-package"
```

## Install with Infrastructure as Code (IaC)

[Section titled “Install with Infrastructure as Code (IaC)”](#install-with-infrastructure-as-code-iac)

For IaC-style deployments, you can install packages *as code* by putting them next to your `tenzir.yaml` configuration file:

* /opt/tenzir/etc/tenzir/

  * packages/

    * your-package/

      * operators/

        * …

      * pipelines/

        * …

      * config.yaml The configuration for the package

      * package.yaml The package manifest with metadata

  * tenzir.yaml

Inside the `packages` directory, each installed package has its own directory. The directory name matches the package ID.

The node searches for packages in the following locations:

1. The `packages` directory in all [configuration directories](/explanations/configuration).
2. All directories specified in the `tenzir.package-dirs` configuration option.

To provide inputs in IaC-mode, place a `config.yaml` file next to the `package.yaml` file. For example, this configuration sets the inputs `endpoint` and `policy`:

config.yaml

```yaml
inputs:
  endpoint: localhost:42000
  policy: block
```