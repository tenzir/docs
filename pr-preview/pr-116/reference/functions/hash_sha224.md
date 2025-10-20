# hash_sha224

Computes a SHA-224 hash digest.

```tql
hash_sha224(x:any, [seed=string]) -> string
```

## Description

[Section titled “Description”](#description)

The `hash_sha224` function calculates a SHA-224 hash digest for the given value `x`.

## Examples

[Section titled “Examples”](#examples)

### Compute a SHA-224 digest of a string

[Section titled “Compute a SHA-224 digest of a string”](#compute-a-sha-224-digest-of-a-string)

```tql
from {x: hash_sha224("foo")}
```

```tql
{x: "0808f64e60d58979fcb676c96ec938270dea42445aeefcd3a4e6f8db"}
```

## See Also

[Section titled “See Also”](#see-also)

[`hash_md5`](/reference/functions/hash_md5), [`hash_sha1`](/reference/functions/hash_sha1), [`hash_sha256`](/reference/functions/hash_sha256), [`hash_sha384`](/reference/functions/hash_sha384), [`hash_sha512`](/reference/functions/hash_sha512), [`hash_xxh3`](/reference/functions/hash_xxh3)