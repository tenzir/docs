# encode_base64

Encodes bytes as Base64.

```tql
encode_base64(bytes: blob|string) -> string
```

## Description

[Section titled “Description”](#description)

Encodes bytes as Base64.

### `bytes: blob|string`

[Section titled “bytes: blob|string”](#bytes-blobstring)

The value to encode as Base64.

## Examples

[Section titled “Examples”](#examples)

### Encode a string as Base64

[Section titled “Encode a string as Base64”](#encode-a-string-as-base64)

```tql
from {bytes: "Tenzir"}
encoded = bytes.encode_base64()
```

```tql
{bytes: "Tenzir", encoded: "VGVuemly"}
```

## See Also

[Section titled “See Also”](#see-also)

[`decode_base64`](/reference/functions/decode_base64)