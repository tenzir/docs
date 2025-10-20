# decode_base64

Decodes bytes as Base64.

```tql
decode_base64(bytes: blob|string) -> blob
```

## Description

[Section titled “Description”](#description)

Decodes bytes as Base64.

### `bytes: blob|string`

[Section titled “bytes: blob|string”](#bytes-blobstring)

The value to decode as Base64.

## Examples

[Section titled “Examples”](#examples)

### Decode a Base64 encoded string

[Section titled “Decode a Base64 encoded string”](#decode-a-base64-encoded-string)

```tql
from {bytes: "VGVuemly"}
decoded = bytes.decode_base64()
```

```tql
{bytes: "VGVuemly", decoded: "Tenzir"}
```

## See Also

[Section titled “See Also”](#see-also)

[`encode_base64`](/reference/functions/encode_base64)