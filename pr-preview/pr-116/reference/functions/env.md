# env

Reads an environment variable.

```tql
env(x:string) -> string
```

## Description

[Section titled “Description”](#description)

The `env` function retrieves the value of an environment variable `x`. If the variable does not exist, it returns `null`.

## Examples

[Section titled “Examples”](#examples)

### Read the `PATH` environment variable

[Section titled “Read the PATH environment variable”](#read-the-path-environment-variable)

```tql
from {x: env("PATH")}
```

```tql
{x: "/usr/local/bin:/usr/bin:/bin"}
```

## See also

[Section titled “See also”](#see-also)

[`config`](/reference/functions/config), [`secret`](/reference/functions/secret)