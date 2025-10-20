# hash_sha256

Computes a SHA-256 hash digest.

```tql
hash_sha256(x:any, [seed=string]) -> string
```

## Description

[Section titled “Description”](#description)

The `hash_sha256` function calculates a SHA-256 hash digest for the given value `x`.

## Examples

[Section titled “Examples”](#examples)

### Compute a SHA-256 digest of a string

[Section titled “Compute a SHA-256 digest of a string”](#compute-a-sha-256-digest-of-a-string)

```tql
from {x: hash_sha256("foo")}
```

```tql
{x: "2c26b46b68ffc68ff99b453c1d30413413422e6e6c8ee90c3abeac38044e8a8c1b0"}
```

## See Also

[Section titled “See Also”](#see-also)

[`hash_md5`](/reference/functions/hash_md5), [`hash_sha1`](/reference/functions/hash_sha1), [`hash_sha224`](/reference/functions/hash_sha224), [`hash_sha384`](/reference/functions/hash_sha384), [`hash_sha512`](/reference/functions/hash_sha512), [`hash_xxh3`](/reference/functions/hash_xxh3)