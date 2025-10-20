# decode_hex

Decodes bytes from their hexadecimal representation.

```tql
decode_hex(bytes: blob|string) -> blob
```

## Description

[Section titled “Description”](#description)

Decodes bytes from their hexadecimal representation.

### `bytes: blob|string`

[Section titled “bytes: blob|string”](#bytes-blobstring)

The value to decode.

## Examples

[Section titled “Examples”](#examples)

### Decode a blob from hex

[Section titled “Decode a blob from hex”](#decode-a-blob-from-hex)

```tql
from {bytes: "54656E7A6972"}
decoded = bytes.decode_hex()
```

```tql
{bytes: "54656E7A6972", decoded: "Tenzir"}
```

### Decode a mixed-case hex string

[Section titled “Decode a mixed-case hex string”](#decode-a-mixed-case-hex-string)

```tql
from {bytes: "4e6f6E6365"}
decoded = bytes.decode_hex()
```

```tql
{bytes: "4e6f6E6365", decoded: "Nonce"}
```

## See Also

[Section titled “See Also”](#see-also)

[`encode_hex`](/reference/functions/encode_hex)