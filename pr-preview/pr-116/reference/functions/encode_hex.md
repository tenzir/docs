# encode_hex

Encodes bytes into their hexadecimal representation.

```tql
encode_hex(bytes: blob|string) -> string
```

## Description

[Section titled “Description”](#description)

Encodes bytes into their hexadecimal representation.

### `bytes: blob|string`

[Section titled “bytes: blob|string”](#bytes-blobstring)

The value to encode.

## Examples

[Section titled “Examples”](#examples)

### Encode a string to hex

[Section titled “Encode a string to hex”](#encode-a-string-to-hex)

```tql
from {bytes: "Tenzir"}
encoded = bytes.encode_hex()
```

```tql
{bytes: "Tenzir", encoded: "54656E7A6972"}
```

## See Also

[Section titled “See Also”](#see-also)

[`decode_hex`](/reference/functions/decode_hex)