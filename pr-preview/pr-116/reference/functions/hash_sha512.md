# hash_sha512

Computes a SHA-512 hash digest.

```tql
hash_sha512(x:any, [seed=string]) -> string
```

## Description

[Section titled “Description”](#description)

The `hash_sha512` function calculates a SHA-512 hash digest for the given value `x`.

## Examples

[Section titled “Examples”](#examples)

### Compute a SHA-512 digest of a string

[Section titled “Compute a SHA-512 digest of a string”](#compute-a-sha-512-digest-of-a-string)

```tql
from {x: hash_sha512("foo")}
```

```tql
{x: "f7fbba6e0636f890e56fbbf3283e524c6fa3204ae298382d624741d0dc6638326e282c41be5e4254d8820772c5518a2c5a8c0c7f7eda19594a7eb539453e1ed7"}
```

## See Also

[Section titled “See Also”](#see-also)

[`hash_md5`](/reference/functions/hash_md5), [`hash_sha1`](/reference/functions/hash_sha1), [`hash_sha224`](/reference/functions/hash_sha224), [`hash_sha256`](/reference/functions/hash_sha256), [`hash_sha384`](/reference/functions/hash_sha384), [`hash_xxh3`](/reference/functions/hash_xxh3)