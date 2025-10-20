# decode_url

Decodes URL encoded strings.

```tql
decode_url(string: blob|string) -> blob
```

## Description

[Section titled “Description”](#description)

Decodes URL encoded strings or blobs, converting percent-encoded sequences back to their original characters.

### `string: blob|string`

[Section titled “string: blob|string”](#string-blobstring)

The URL encoded string to decode.

## Examples

[Section titled “Examples”](#examples)

### Decode a URL encoded string

[Section titled “Decode a URL encoded string”](#decode-a-url-encoded-string)

```tql
from {input: "Hello%20World%20%26%20Special%2FChars%3F"}
decoded = input.decode_url()
```

```tql
{
  input: "Hello%20World%20%26%20Special%2FChars%3F",
  decoded: "Hello World & Special/Chars?",
}
```

## See Also

[Section titled “See Also”](#see-also)

[`encode_url`](/reference/functions/encode_url)