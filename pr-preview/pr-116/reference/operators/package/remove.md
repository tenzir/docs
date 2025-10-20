# package::remove

Uninstalls a package.

```tql
package::remove package_id:string
```

## Description

[Section titled “Description”](#description)

The `package::remove` operator uninstalls a previously installed package.

### `package_id : string`

[Section titled “package\_id : string”](#package_id--string)

The unique ID of the package as in the package definition.

## Examples

[Section titled “Examples”](#examples)

### Remove an installed package

[Section titled “Remove an installed package”](#remove-an-installed-package)

```tql
package::remove "suricata-ocsf"
```

## See Also

[Section titled “See Also”](#see-also)

[`package::add`](/reference/operators/package/add)