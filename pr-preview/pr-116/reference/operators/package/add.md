# package::add

Installs a package.

```tql
package::add [package_path:string, inputs=record]
```

## Description

[Section titled “Description”](#description)

The `package::add` operator installs all operators, pipelines, and contexts from a package.

### `package_path : string (optional)`

[Section titled “package\_path : string (optional)”](#package_path--string-optional)

The path to a package located on the file system.

### `inputs = record (optional)`

[Section titled “inputs = record (optional)”](#inputs--record-optional)

A record of optional package inputs that configure the package.

## Examples

[Section titled “Examples”](#examples)

### Add a package from the Community Library

[Section titled “Add a package from the Community Library”](#add-a-package-from-the-community-library)

```tql
package::add "suricata-ocsf"
```

### Add a local package with inputs

[Section titled “Add a local package with inputs”](#add-a-local-package-with-inputs)

```tql
package::add "/mnt/config/tenzir/library/zeek",
  inputs={format: "tsv", "log-directory": "/opt/tenzir/logs"}
```

## See Also

[Section titled “See Also”](#see-also)

[`list`](/reference/operators/package/list), [`remove`](/reference/operators/package/remove)