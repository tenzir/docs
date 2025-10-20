# hash_sha384

Computes a SHA-384 hash digest.

```tql
hash_sha384(x:any, [seed=string]) -> string
```

## Description

[Section titled “Description”](#description)

The `hash_sha384` function calculates a SHA-384 hash digest for the given value `x`.

## Examples

[Section titled “Examples”](#examples)

### Compute a SHA-384 digest of a string

[Section titled “Compute a SHA-384 digest of a string”](#compute-a-sha-384-digest-of-a-string)

```tql
from {x: hash_sha384("foo")}
```

```tql
{x: "98c11ffdfdd540676b1a137cb1a22b2a70350c9a44171d6b1180c6be5cbb2ee3f79d532c8a1dd9ef2e8e08e752a3babb"}
```

## See Also

[Section titled “See Also”](#see-also)

[`hash_md5`](/reference/functions/hash_md5), [`hash_sha1`](/reference/functions/hash_sha1), [`hash_sha224`](/reference/functions/hash_sha224), [`hash_sha256`](/reference/functions/hash_sha256), [`hash_sha512`](/reference/functions/hash_sha512), [`hash_xxh3`](/reference/functions/hash_xxh3)