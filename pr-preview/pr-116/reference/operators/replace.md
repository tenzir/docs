# replace

Replaces all occurrences of a value with another value.

```tql
replace [path:field...], what=any, with=any
```

## Description

[Section titled “Description”](#description)

The `replace` operator scans all fields of each input event and replaces every occurrence of a value equal to `what` with the value specified by `with`.

Note

The operator does not replace values in lists.

### `path: field... (optional)`

[Section titled “path: field... (optional)”](#path-field-optional)

An optional set of paths to restrict replacements to.

### `what: any`

[Section titled “what: any”](#what-any)

The value to search for and replace.

### `with: any`

[Section titled “with: any”](#with-any)

The value to replace in place of `what`.

## Examples

[Section titled “Examples”](#examples)

### Replace all occurrences of 42 with null

[Section titled “Replace all occurrences of 42 with null”](#replace-all-occurrences-of-42-with-null)

```tql
from {
  count: 42,
  data: {value: 42, other: 100},
  list: [42, 24, 42]
}
replace what=42, with=null
```

```tql
{
  count: null,
  data: {value: null, other: 100},
  list: [42, 24, 42]
}
```

### Replace only within specific fields

[Section titled “Replace only within specific fields”](#replace-only-within-specific-fields)

```tql
from {
  count: 42,
  data: {value: 42, other: 100},
}
replace data, what=42, with=null
```

```tql
{
  count: 42,
  data: {value: null, other: 100},
}
```

### Replace a specific IP address with a redacted value

[Section titled “Replace a specific IP address with a redacted value”](#replace-a-specific-ip-address-with-a-redacted-value)

```tql
from {
  src_ip: 192.168.1.1,
  dst_ip: 10.0.0.1,
  metadata: {source: 192.168.1.1}
}
replace what=192.168.1.1, with="REDACTED"
```

```tql
{
  src_ip: "REDACTED",
  dst_ip: 10.0.0.1,
  metadata: {
    source: "REDACTED",
  },
}
```

## See Also

[Section titled “See Also”](#see-also)

[`replace`](/reference/functions/replace)