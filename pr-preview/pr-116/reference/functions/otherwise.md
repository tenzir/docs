# otherwise

Returns a `fallback` value if `primary` is `null`.

```tql
otherwise(primary:any, fallback:any) -> any
```

## Description

[Section titled “Description”](#description)

The `otherwise` function evaluates its arguments and replaces `primary` with `fallback` where `primary` would be `null`.

### `primary: any`

[Section titled “primary: any”](#primary-any)

The expression to return if not `null`.

### `fallback: any`

[Section titled “fallback: any”](#fallback-any)

The expression to return if `primary` evaluates to `null`.

## Examples

[Section titled “Examples”](#examples)

### Set a default value for a key

[Section titled “Set a default value for a key”](#set-a-default-value-for-a-key)

```tql
from {x: 1}, {x: 2}, {}
x = x.otherwise(-1)
```

```tql
{x: 1}
{x: 2}
{x: -1}
```