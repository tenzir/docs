# encode_url

Encodes strings using URL encoding.

```tql
encode_url(bytes: blob|string) -> string
```

## Description

[Section titled “Description”](#description)

Encodes strings or blobs using URL encoding, replacing special characters with their percent-encoded equivalents.

### `bytes: blob|string`

[Section titled “bytes: blob|string”](#bytes-blobstring)

The input to URL encode.

## Examples

[Section titled “Examples”](#examples)

### Encode a string as URL encoded

[Section titled “Encode a string as URL encoded”](#encode-a-string-as-url-encoded)

```tql
from {input: "Hello World & Special/Chars?"}
encoded = input.encode_url()
```

```tql
{
  input: "Hello World & Special/Chars?",
  encoded: "Hello%20World%20%26%20Special%2FChars%3F",
}
```

## See Also

[Section titled “See Also”](#see-also)

[`decode_url`](/reference/functions/decode_url)