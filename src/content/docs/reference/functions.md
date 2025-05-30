---
title: Functions
---

<!-- This file is auto-generated from individual function files. Do not edit manually. -->
<!-- Run 'pnpm run generate:functions-overview' to regenerate this file. -->

<!--

TODO: the following functions still need to be documented:

## OCSF

- `ocsf::category_name`
- `ocsf::category_uid`
- `ocsf::class_name`
- `ocsf::class_uid`

-->

Functions appear in [expressions](/reference/language/expressions) and take positional
and/or named arguments, producing a value as a result of their computation.

Function signatures have the following notation:

```tql
f(arg1:<type>, arg2=<type>, [arg3=type]) -> <type>
```

- `arg:<type>`: positional argument
- `arg=<type>`: named argument
- `[arg=type]`: optional (named) argument
- `-> <type>`: function return type

TQL features the [uniform function call syntax
(UFCS)](https://en.wikipedia.org/wiki/Uniform_Function_Call_Syntax), which
allows you to interchangeably call a function with at least one argument either
as _free function_ or _method_. For example, `length(str)` and `str.length()`
resolve to the identical function call. The latter syntax is particularly
suitable for function chaining, e.g., `x.f().g().h()` reads left-to-right as
"start with `x`, apply `f()`, then `g()` and then `h()`," compared to
`h(g(f(x)))`, which reads "inside out."

Throughout our documentation, we use the free function style in the synopsis
but often resort to the method style when it is more idiomatic.

## Aggregation

| Function | Description | Example |
| :------- | :---------- | :------ |
| [`all`](/reference/functions/all) | Computes the conjunction (AND) of all grouped boolean values. | `all(xs:list) -> bool` |
| [`any`](/reference/functions/any) | Computes the disjunction (OR) of all grouped boolean values. | `any(xs:list) -> bool` |
| [`collect`](/reference/functions/collect) | Creates a list of all non-null grouped values, preserving duplicates. | `collect(xs:list) -> list` |
| [`count`](/reference/functions/count) | Counts the events or non-null grouped values. | `count(xs:list) -> int` |
| [`count_distinct`](/reference/functions/count_distinct) | Counts all distinct non-null grouped values. | `count_distinct(xs:list) -> int` |
| [`count_if`](/reference/functions/count_if) | Counts the events or non-null grouped values matching a given predicate. | `count_if(xs:list, predicate:any => bool) -> int` |
| [`distinct`](/reference/functions/distinct) | Creates a sorted list without duplicates of non-null grouped values. | `distinct(xs:list) -> list` |
| [`first`](/reference/functions/first) | Takes the first non-null grouped value. | `first(xs:list) -> any` |
| [`last`](/reference/functions/last) | Takes the last non-null grouped value. | `last(xs:list) -> any` |
| [`max`](/reference/functions/max) | Computes the maximum of all grouped values. | `max(xs:list) -> number` |
| [`mean`](/reference/functions/mean) | Computes the mean of all grouped values. | `mean(xs:list) -> float` |
| [`median`](/reference/functions/median) | Computes the approximate median of all grouped values using a t-digest algorithm. | `median(xs:list) -> float` |
| [`min`](/reference/functions/min) | Computes the minimum of all grouped values. | `min(xs:list) -> number` |
| [`mode`](/reference/functions/mode) | Takes the most common non-null grouped value. | `mode(xs:list) -> any` |
| [`otherwise`](/reference/functions/otherwise) | Returns a `fallback` value if `primary` is `null`. | `otherwise(primary:any, fallback:any) -> any` |
| [`quantile`](/reference/functions/quantile) | Computes the specified quantile of all grouped values. | `quantile(xs:list, q=float) -> float` |
| [`stddev`](/reference/functions/stddev) | Computes the standard deviation of all grouped values. | `stddev(xs:list) -> float` |
| [`sum`](/reference/functions/sum) | Computes the sum of all values. | `sum(xs:list) -> int` |
| [`value_counts`](/reference/functions/value_counts) | Returns a list of all grouped values alongside their frequency. | `value_counts(xs:list) -> list` |
| [`variance`](/reference/functions/variance) | Computes the variance of all grouped values. | `variance(xs:list) -> float` |
| [`where`](/reference/functions/where) | Filters list elements based on a predicate. | `where(xs:list, prediacte:any => bool) -> list` |

## Bit Operations

| Function | Description | Example |
| :------- | :---------- | :------ |
| [`bit_and`](/reference/functions/bit_and) | Computes the bit-wise AND of its arguments. | `bit_and(lhs:number, rhs:number) -> number` |
| [`bit_not`](/reference/functions/bit_not) | Computes the bit-wise NOT of its argument. | `bit_not(x:number) -> number` |
| [`bit_or`](/reference/functions/bit_or) | Computes the bit-wise OR of its arguments. | `bit_or(lhs:number, rhs:number) -> number` |
| [`bit_xor`](/reference/functions/bit_xor) | Computes the bit-wise XOR of its arguments. | `bit_xor(lhs:number, rhs:number) -> number` |
| [`shift_left`](/reference/functions/shift_left) | Performs a bit-wise left shift. | `shift_left(lhs:number, rhs:number) -> number` |
| [`shift_right`](/reference/functions/shift_right) | Performs a bit-wise right shift. | `shift_right(lhs:number, rhs:number) -> number` |

## Decoding

| Function | Description | Example |
| :------- | :---------- | :------ |
| [`decode_base64`](/reference/functions/decode_base64) | Decodes bytes as Base64. | `decode_base64(bytes: blob\|string) -> blob` |
| [`decode_hex`](/reference/functions/decode_hex) | Decodes bytes from their hexadecimal representation. | `decode_hex(bytes: blob\|string) -> blob` |
| [`decode_url`](/reference/functions/decode_url) | Decodes URL encoded strings. | `decode_url(string: blob\|string) -> blob` |

## Encoding

| Function | Description | Example |
| :------- | :---------- | :------ |
| [`encode_base64`](/reference/functions/encode_base64) | Encodes bytes as Base64. | `encode_base64(bytes: blob\|string) -> string` |
| [`encode_hex`](/reference/functions/encode_hex) | Encodes bytes into their hexadecimal representation. | `encode_hex(bytes: blob\|string) -> string` |
| [`encode_url`](/reference/functions/encode_url) | Encodes strings using URL encoding. | `encode_url(bytes: blob\|string) -> string` |

## Hashing

| Function | Description | Example |
| :------- | :---------- | :------ |
| [`hash_md5`](/reference/functions/hash_md5) | Computes an MD5 hash digest. | `hash_md5(x:any, [seed=string])` |
| [`hash_sha1`](/reference/functions/hash_sha1) | Computes a SHA-1 hash digest. | `hash_sha1(x:any, [seed=string]) -> string` |
| [`hash_sha224`](/reference/functions/hash_sha224) | Computes a SHA-224 hash digest. | `hash_sha224(x:any, [seed=string]) -> string` |
| [`hash_sha256`](/reference/functions/hash_sha256) | Computes a SHA-256 hash digest. | `hash_sha256(x:any, [seed=string]) -> string` |
| [`hash_sha384`](/reference/functions/hash_sha384) | Computes a SHA-384 hash digest. | `hash_sha384(x:any, [seed=string]) -> string` |
| [`hash_sha512`](/reference/functions/hash_sha512) | Computes a SHA-512 hash digest. | `hash_sha512(x:any, [seed=string]) -> string` |
| [`hash_xxh3`](/reference/functions/hash_xxh3) | Computes an XXH3 hash digest. | `hash_xxh3(x:any, [seed=string]) -> string` |

## IP

| Function | Description | Example |
| :------- | :---------- | :------ |
| [`is_v4`](/reference/functions/is_v4) | Checks whether an IP address has version number 4. | `is_v4(x:ip) -> bool` |
| [`is_v6`](/reference/functions/is_v6) | Checks whether an IP address has version number 6. | `is_v6(x:ip) -> bool` |
| [`network`](/reference/functions/network) | Retrieves the network address of a subnet. | `network(x:subnet) -> ip` |

## List

| Function | Description | Example |
| :------- | :---------- | :------ |
| [`append`](/reference/functions/append) | Inserts an element at the back of a list. | `append(xs:list, x:any) -> list` |
| [`concatenate`](/reference/functions/concatenate) | Merges two lists. | `concatenate(xs:list, ys:list) -> list` |
| [`get`](/reference/functions/get) | Gets a field from a record or an element from a list | `get(x:record, field:string, [fallback:any]) -> any` |
| [`length`](/reference/functions/length) | Retrieves the length of a list. | `length(xs:list) -> int` |
| [`map`](/reference/functions/map) | Maps each list element to an expression. | `map(xs:list, capture:field, any => any) -> list` |
| [`prepend`](/reference/functions/prepend) | Inserts an element at the start of a list. | `prepend(xs:list, x:any) -> list` |
| [`sort`](/reference/functions/sort) | Sorts lists and record fields. | `sort(xs:list\|record) -> list\|record` |
| [`where`](/reference/functions/where) | Filters list elements based on a predicate. | `where(xs:list, prediacte:any => bool) -> list` |
| [`zip`](/reference/functions/zip) | Combines two lists into a list of pairs. | `zip(xs:list, ys:list) -> list` |

## Math

| Function | Description | Example |
| :------- | :---------- | :------ |
| [`abs`](/reference/functions/abs) | Returns the absolute value. | `abs(x:number) -> number` |
| [`ceil`](/reference/functions/ceil) | Computes the ceiling of a number or a time/duration with a specified unit. | `ceil(x:number)` |
| [`floor`](/reference/functions/floor) | Computes the floor of a number or a time/duration with a specified unit. | `floor(x:number)` |
| [`random`](/reference/functions/random) | Generates a random number in *[0,1]*. | `random() -> float` |
| [`round`](/reference/functions/round) | Rounds a number or a time/duration with a specified unit. | `round(x:number)` |
| [`sqrt`](/reference/functions/sqrt) | Computes the square root of a number. | `sqrt(x:number) -> float` |

## Networking

| Function | Description | Example |
| :------- | :---------- | :------ |
| [`community_id`](/reference/functions/community_id) | Computes the [Community ID](https://github.com/corelight/community-id-spec) for | `community_id(src_ip=ip, dst_ip=ip, proto=string,` |
| [`decapsulate`](/reference/functions/decapsulate) | Decapsulates packet data at link, network, and transport layer. | `decapsulate(packet:record) -> record` |
| [`encrypt_cryptopan`](/reference/functions/encrypt_cryptopan) | Encrypts an IP address via Crypto-PAn. | `encrypt_cryptopan(address:ip, [seed=string])` |

## Printing

| Function | Description | Example |
| :------- | :---------- | :------ |
| [`print_kv`](/reference/functions/print_kv) | Prints records in a key-value format. | `print_kv( input:record, [field_separator=str, value_separator=str,` |
| [`print_xsv`](/reference/functions/print_xsv) | Prints a record as a delimited sequence of values. | `print_xsv(input:record, field_separator=str, list_separator=str, null_value=str) -> string` |
| [`print_yaml`](/reference/functions/print_yaml) | Prints a value as a YAML document. | `print_yaml( input:any, [include_document_markers=bool] )` |

## Record

| Function | Description | Example |
| :------- | :---------- | :------ |
| [`get`](/reference/functions/get) | Gets a field from a record or an element from a list | `get(x:record, field:string, [fallback:any]) -> any` |
| [`has`](/reference/functions/has) | Checks whether a record has a specified field. | `has(x:record, field:string) -> bool` |
| [`keys`](/reference/functions/keys) | Retrieves a list of field names from a record. | `keys(x:record) -> list<string>` |
| [`merge`](/reference/functions/merge) | Combines two records into a single record by merging their fields. | `merge(x: record, y: record) -> record` |
| [`sort`](/reference/functions/sort) | Sorts lists and record fields. | `sort(xs:list\|record) -> list\|record` |

## Runtime

| Function | Description | Example |
| :------- | :---------- | :------ |
| [`config`](/reference/functions/config) | Reads Tenzir's configuration file. | `config() -> record` |
| [`env`](/reference/functions/env) | Reads an environment variable. | `env(x:string) -> string` |
| [`secret`](/reference/functions/secret) | Reads a secret from a store. | `secret(x:string) -> string` |

### Filesystem

| Function | Description | Example |
| :------- | :---------- | :------ |
| [`file_contents`](/reference/functions/file_contents) | Reads a file's contents. | `file_contents(path:string, [binary=bool]) -> blob\|string` |
| [`file_name`](/reference/functions/file_name) | Extracts the file name from a file path. | `file_name(x:string) -> string` |
| [`parent_dir`](/reference/functions/parent_dir) | Extracts the parent directory from a file path. | `parent_dir(x:string) -> string` |

### Inspection

| Function | Description | Example |
| :------- | :---------- | :------ |
| [`ends_with`](/reference/functions/ends_with) | Checks if a string ends with a specified substring. | `ends_with(x:string, suffix:string) -> bool` |
| [`is_alnum`](/reference/functions/is_alnum) | Checks if a string is alphanumeric. | `is_alnum(x:string) -> bool` |
| [`is_alpha`](/reference/functions/is_alpha) | Checks if a string contains only alphabetic characters. | `is_alpha(x:string) -> bool` |
| [`is_lower`](/reference/functions/is_lower) | Checks if a string is in lowercase. | `is_lower(x:string) -> bool` |
| [`is_numeric`](/reference/functions/is_numeric) | Checks if a string contains only numeric characters. | `is_numeric(x:string) -> bool` |
| [`is_printable`](/reference/functions/is_printable) | Checks if a string contains only printable characters. | `is_printable(x:string) -> bool` |
| [`is_title`](/reference/functions/is_title) | Checks if a string follows title case. | `is_title(x:string) -> bool` |
| [`is_upper`](/reference/functions/is_upper) | Checks if a string is in uppercase. | `is_upper(x:string) -> bool` |
| [`length_bytes`](/reference/functions/length_bytes) | Returns the length of a string in bytes. | `length_bytes(x:string) -> int` |
| [`length_chars`](/reference/functions/length_chars) | Returns the length of a string in characters. | `length_chars(x:string) -> int` |
| [`match_regex`](/reference/functions/match_regex) | Checks if a string partially matches a regular expression. | `match_regex(input:string, regex:string) -> bool` |
| [`slice`](/reference/functions/slice) | Slices a string with offsets and strides. | `slice(x:string, [begin=int, end=int, stride=int])` |
| [`starts_with`](/reference/functions/starts_with) | Checks if a string starts with a specified substring. | `starts_with(x:string, prefix:string) -> bool` |

### Transformation

| Function | Description | Example |
| :------- | :---------- | :------ |
| [`capitalize`](/reference/functions/capitalize) | Capitalizes the first character of a string. | `capitalize(x:string) -> string` |
| [`join`](/reference/functions/join) | Joins a list of strings into a single string using a separator. | `join(xs:list, [separator:string]) -> string` |
| [`replace`](/reference/functions/replace) | Replaces characters within a string. | `replace(x:string, pattern:string, replacement:string, [max=int]) -> string` |
| [`replace_regex`](/reference/functions/replace_regex) | Replaces characters within a string based on a regular expression. | `replace_regex(x:string, pattern:string, replacement:string, [max=int]) -> string` |
| [`reverse`](/reference/functions/reverse) | Reverses the characters of a string. | `reverse(x:string) -> string` |
| [`split`](/reference/functions/split) | Splits a string into substrings. | `split(x:string, pattern:string, [max:int], [reverse:bool]) -> list` |
| [`split_regex`](/reference/functions/split_regex) | Splits a string into substrings with a regex. | `split_regex(x:string, pattern:string, [max:int], [reverse:bool]) -> list` |
| [`to_lower`](/reference/functions/to_lower) | Converts a string to lowercase. | `to_lower(x:string) -> string` |
| [`to_title`](/reference/functions/to_title) | Converts a string to title case. | `to_title(x:string) -> string` |
| [`to_upper`](/reference/functions/to_upper) | Converts a string to uppercase. | `to_upper(x:string) -> string` |
| [`trim`](/reference/functions/trim) | Trims whitespace from both ends of a string. | `trim(x:string) -> string` |
| [`trim_end`](/reference/functions/trim_end) | Trims whitespace from the end of a string. | `trim_end(x:string) -> string` |
| [`trim_start`](/reference/functions/trim_start) | Trims whitespace from the start of a string. | `trim_start(x:string) -> string` |

## Subnet

| Function | Description | Example |
| :------- | :---------- | :------ |
| [`network`](/reference/functions/network) | Retrieves the network address of a subnet. | `network(x:subnet) -> ip` |

## Time & Date

| Function | Description | Example |
| :------- | :---------- | :------ |
| [`day`](/reference/functions/day) | Extracts the day component from a timestamp. | `day(x: time) -> int` |
| [`format_time`](/reference/functions/format_time) | Formats a time into a string that follows a specific format. | `format_time(input: time, format: string) -> string` |
| [`from_epoch`](/reference/functions/from_epoch) | Interprets a duration as Unix time. | `from_epoch(x:duration) -> time` |
| [`hour`](/reference/functions/hour) | Extracts the hour component from a timestamp. | `hour(x: time) -> int` |
| [`minute`](/reference/functions/minute) | Extracts the minute component from a timestamp. | `minute(x: time) -> int` |
| [`month`](/reference/functions/month) | Extracts the month component from a timestamp. | `month(x: time) -> int` |
| [`now`](/reference/functions/now) | Gets the current wallclock time. | `now() -> time` |
| [`parse_time`](/reference/functions/parse_time) | Parses a time from a string that follows a specific format. | `parse_time(input: string, format: string) -> time` |
| [`second`](/reference/functions/second) | Extracts the second component from a timestamp with subsecond precision. | `second(x: time) -> float` |
| [`since_epoch`](/reference/functions/since_epoch) | Interprets a time value as duration since the Unix epoch. | `since_epoch(x:time) -> duration` |

### Conversion

| Function | Description | Example |
| :------- | :---------- | :------ |
| [`duration`](/reference/functions/duration) | Casts an expression to a duration value. | `duration(x:string) -> duration` |
| [`float`](/reference/functions/float) | Casts an expression to a float. | `float(x:any) -> float` |
| [`int`](/reference/functions/int) | Casts an expression to an integer. | `int(x:number\|string, base=int) -> int` |
| [`ip`](/reference/functions/ip) | Casts an expression to an IP address. | `ip(x:string) -> ip` |
| [`string`](/reference/functions/string) | Casts an expression to a string. | `string(x:any) -> string` |
| [`subnet`](/reference/functions/subnet) | Casts an expression to a subnet value. | `subnet(x:string) -> subnet` |
| [`time`](/reference/functions/time) | Casts an expression to a time value. | `time(x:any) -> time` |
| [`uint`](/reference/functions/uint) | Casts an expression to an unsigned integer. | `uint(x:number\|string, base=int) -> uint` |

### Introspection

| Function | Description | Example |
| :------- | :---------- | :------ |
| [`type_id`](/reference/functions/type_id) | Retrieves the type id of an expression. | `type_id(x:any) -> string` |
| [`type_of`](/reference/functions/type_of) | Retrieves the type definition of an expression. | `type_of(x:any) -> record` |

### Transposition

| Function | Description | Example |
| :------- | :---------- | :------ |
| [`flatten`](/reference/functions/flatten) | Flattens nested data. | `flatten(x:record, separtor=string) -> record` |
| [`unflatten`](/reference/functions/unflatten) | Unflattens nested data. | `unflatten(x:record, [separator=string]) -> record` |
