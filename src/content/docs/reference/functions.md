---
title: Functions
---

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

| Function                                                | Description                                                  | Example                      |
| :------------------------------------------------------ | :----------------------------------------------------------- | :--------------------------- |
| [`all`](/reference/functions/all)                       | Computes the conjunction (AND) of all boolean values         | `all([true,true,false])`     |
| [`any`](/reference/functions/any)                       | Computes the disjunction (OR) of all boolean values          | `any([true,false,true])`     |
| [`collect`](/reference/functions/collect)               | Creates a list of all non-null values, preserving duplicates | `collect([1,2,2,3])`         |
| [`count`](/reference/functions/count)                   | Counts the events or non-null values                         | `count([1,2,null])`          |
| [`count_if`](/reference/functions/count_if)             | Counts the events or non-null values matching a predicate                         | `count_if([1,2,null], x => x > 1)`          |
| [`count_distinct`](/reference/functions/count_distinct) | Counts all distinct non-null values                          | `count_distinct([1,2,2,3])`  |
| [`distinct`](/reference/functions/distinct)             | Creates a sorted list without duplicates of non-null values  | `distinct([1,2,2,3])`        |
| [`first`](/reference/functions/first)                   | Takes the first non-null value                               | `first([null,2,3])`          |
| [`last`](/reference/functions/last)                     | Takes the last non-null value                                | `last([1,2,null])`           |
| [`max`](/reference/functions/max)                       | Computes the maximum of all values                           | `max([1,2,3])`               |
| [`mean`](/reference/functions/mean)                     | Computes the mean of all values                              | `mean([1,2,3])`              |
| [`median`](/reference/functions/median)                 | Computes the approximate median with a t-digest algorithm    | `median([1,2,3,4])`          |
| [`min`](/reference/functions/min)                       | Computes the minimum of all values                           | `min([1,2,3])`               |
| [`mode`](/reference/functions/mode)                     | Takes the most common non-null value                         | `mode([1,1,2,3])`            |
| [`quantile`](/reference/functions/quantile)             | Computes the specified quantile `q` of values                | `quantile([1,2,3,4], q=0.5)` |
| [`stddev`](/reference/functions/stddev)                 | Computes the standard deviation of all values                | `stddev([1,2,3])`            |
| [`sum`](/reference/functions/sum)                       | Computes the sum of all values                               | `sum([1,2,3])`               |
| [`value_counts`](/reference/functions/value_counts)     | Returns a list of values with their frequency                | `value_counts([1,2,2,3])`    |
| [`variance`](/reference/functions/variance)             | Computes the variance of all values                          | `variance([1,2,3])`          |
| [`where`](/reference/functions/where)             | Filters list elements based on a predicate | `xs.where(x => x > 5)`     |

## Record

| Function                              | Description                         | Example                                    |
| :------------------------------------ | :---------------------------------- | :----------------------------------------- |
| [`get`](/reference/functions/get)     | Accesses a field of a record        | `record.get("field", default)`             |
| [`has`](/reference/functions/has)     | Checks whether a record has a field | `record.has("field")`                      |
| [`keys`](/reference/functions/keys)   | Gets all field names from a record  | `record.keys()`                            |
| [`merge`](/reference/functions/merge) | Merges two records                  | `merge(foo, bar)`                          |
| [`sort`](/reference/functions/sort)   | Sorts a record by field names       | `xs.sort()`                                |

## List

| Function                                          | Description                                | Example                    |
| :------------------------------------------------ | :----------------------------------------- | :------------------------- |
| [`append`](/reference/functions/append)           | Inserts an element at the back of a list   | `xs.append(y)`             |
| [`prepend`](/reference/functions/prepend)         | Inserts an element at the front of a list  | `xs.prepend(y)`            |
| [`concatenate`](/reference/functions/concatenate) | Merges two lists                           | `concatenate(xs, ys)`      |
| [`get`](/reference/functions/get)                 | Accesses an element of a list              | `list.get(index, default)` |
| [`length`](/reference/functions/length)           | Retrieves the length of a list             | `[1,2,3].length()`         |
| [`map`](/reference/functions/map)                 | Maps each list element to an expression    | `xs.map(x => x + 3)`         |
| [`sort`](/reference/functions/sort)               | Sorts a list by its values.                | `xs.sort()`                |
| [`where`](/reference/functions/where)             | Filters list elements based on a predicate | `xs.where(x, x > 5)`       |
| [`zip`](/reference/functions/zip)                 | Combines two lists into a list of pairs    | `zip(xs, ys)`              |

## Subnet

| Function                                  | Description                               | Example                |
| :---------------------------------------- | :---------------------------------------- | :--------------------- |
| [`network`](/reference/functions/network) | Retrieves the network address of a subnet | `10.0.0.0/8.network()` |

## String

### Inspection

| Function                                            | Description                                               | Example                         |
| :-------------------------------------------------- | :-------------------------------------------------------- | :------------------------------ |
| [`length_bytes`](/reference/functions/length_bytes) | Returns the length of a string in bytes                   | `"hello".length_bytes()`        |
| [`length_chars`](/reference/functions/length_chars) | Returns the length of a string in characters              | `"hello".length_chars()`        |
| [`starts_with`](/reference/functions/starts_with)   | Checks if a string starts with a substring                | `"hello".starts_with("he")`     |
| [`ends_with`](/reference/functions/ends_with)       | Checks if a string ends with a substring                  | `"hello".ends_with("lo")`       |
| [`is_alnum`](/reference/functions/is_alnum)         | Checks if a string is alphanumeric                        | `"hello123".is_alnum()`         |
| [`is_alpha`](/reference/functions/is_alpha)         | Checks if a string contains only letters                  | `"hello".is_alpha()`            |
| [`is_lower`](/reference/functions/is_lower)         | Checks if a string is in lowercase                        | `"hello".is_lower()`            |
| [`is_numeric`](/reference/functions/is_numeric)     | Checks if a string contains only numbers                  | `"1234".is_numeric()`           |
| [`is_printable`](/reference/functions/is_printable) | Checks if a string contains only printable characters     | `"hello".is_printable()`        |
| [`is_title`](/reference/functions/is_title)         | Checks if a string follows title case                     | `"Hello World".is_title()`      |
| [`is_upper`](/reference/functions/is_upper)         | Checks if a string is in uppercase                        | `"HELLO".is_upper()`            |
| [`match_regex`](/reference/functions/match_regex)   | Checks if a string partially matches a regular expression | `"Hi".match_regex("[Hh]i")`     |
| [`slice`](/reference/functions/slice)               | Slices a string with offsets and strides                  | `"Hi".slice(begin=2, stride=4)` |

### Transformation

| Function                                              | Description                                  | Example                       |
| :---------------------------------------------------- | :------------------------------------------- | :---------------------------- |
| [`trim`](/reference/functions/trim)                   | Trims whitespace from both ends of a string  | `" hello ".trim()`            |
| [`trim_start`](/reference/functions/trim_start)       | Trims whitespace from the start of a string  | `" hello".trim_start()`       |
| [`trim_end`](/reference/functions/trim_end)           | Trims whitespace from the end of a string    | `"hello ".trim_end()`         |
| [`capitalize`](/reference/functions/capitalize)       | Capitalizes the first character of a string  | `"hello".capitalize()`        |
| [`replace`](/reference/functions/replace)             | Replaces characters within a string          | `"hello".replace("o", "a")`   |
| [`replace_regex`](/reference/functions/replace_regex) | Reverses the characters of a string          | `"hello".replace("l+o", "y")` |
| [`reverse`](/reference/functions/reverse)             | Reverses the characters of a string          | `"hello".reverse()`           |
| [`to_lower`](/reference/functions/to_lower)           | Converts a string to lowercase               | `"HELLO".to_lower()`          |
| [`to_title`](/reference/functions/to_title)           | Converts a string to title case              | `"hello world".to_title()`    |
| [`to_upper`](/reference/functions/to_upper)           | Converts a string to uppercase               | `"hello".to_upper()`          |
| [`split`](/reference/functions/split)                 | Splits a string into substrings              | `split("a,b,c", ",")`         |
| [`split_regex`](/reference/functions/split_regex)     | Splits a string into substrings with a regex | `split_regex("a1b2c", r"\d")` |
| [`join`](/reference/functions/join)                   | Joins a list of strings into a single string | `join(["a", "b", "c"], ",")`  |

### Filesystem

| Function                                              | Description                                    | Example                           |
| :---------------------------------------------------- | :--------------------------------------------- | :-------------------------------- |
| [`file_contents`](/reference/functions/file_contents) | Reads a file's contents                        | `file_contents("/path/to/file")`  |
| [`file_name`](/reference/functions/file_name)         | Extracts the file name from a file path        | `file_name("/path/to/log.json")`  |
| [`parent_dir`](/reference/functions/parent_dir)       | Extracts the parent directory from a file path | `parent_dir("/path/to/log.json")` |

## Parsing

| Function                                            | Description                              | Example                                            |
| :-------------------------------------------------- | :--------------------------------------- | :------------------------------------------------- |
| [`parse_cef`](/reference/functions/parse_cef)       | Parses a string as a CEF message         | `string.parse_cef()`                               |
| [`parse_csv`](/reference/functions/parse_csv)       | Parses a string as CSV                   | `string.parse_csv(header=["a","b"])`               |
| [`parse_grok`](/reference/functions/parse_grok)     | Parses a string following a grok pattern | `string.parse_grok("%{IP:client} …")`              |
| [`parse_json`](/reference/functions/parse_json)     | Parses a string as a JSON value          | `string.parse_json()`                              |
| [`parse_kv`](/reference/functions/parse_kv)         | Parses a string as key-value pairs       | `string.parse_kv()`                                |
| [`parse_leef`](/reference/functions/parse_leef)     | Parses a string as a LEEF message        | `string.parse_leef()`                              |
| [`parse_ssv`](/reference/functions/parse_ssv)       | Parses a string as SSV                   | `string.parse_ssv(header=["a","b"])`               |
| [`parse_syslog`](/reference/functions/parse_syslog) | Parses a string as a syslog message      | `string.parse_syslog()`                            |
| [`parse_tsv`](/reference/functions/parse_tsv)       | Parses a string as TSV                   | `string.parse_tsv(header=["a","b"])`               |
| [`parse_xsv`](/reference/functions/parse_xsv)       | Parses a string as XSV                   | `string.parse_xsv(",", ";", "", header=["a","b"])` |
| [`parse_yaml`](/reference/functions/parse_yaml)     | Parses a string as YAML                  | `string.parse_yaml()`                              |

## Printing

| Function                                            | Description                                   | Example                 |
| :-------------------------------------------------- | :-------------------------------------------- | :---------------------- |
| [`print_csv`](/reference/functions/print_csv)       | Prints a record as comma separated values     | `record.print_csv()`    |
| [`print_kv`](/reference/functions/print_kv)         | Prints a record as Key-Value pairs            | `record.print_kv()`     |
| [`print_json`](/reference/functions/print_json)     | Prints a record as a JSON string              | `record.print_json()`   |
| [`print_ndjson`](/reference/functions/print_ndjson) | Prints a record as NDJSON string              | `record.print_ndjson()` |
| [`print_ssv`](/reference/functions/print_ssv)       | Prints a record as space separated values     | `record.print_ssv()`    |
| [`print_tsv`](/reference/functions/print_tsv)       | Prints a record as tab separated values       | `record.print_tsv()`    |
| [`print_xsv`](/reference/functions/print_xsv)       | Prints a record as delimited separated values | `record.print_tsv()`    |
| [`print_yaml`](/reference/functions/print_yaml)     | Prints a value as a YAML document             | `record.print_yaml()`   |

## Time & Date

| Function                                                        | Description                                       | Example                               |
| :-------------------------------------------------------------- | :------------------------------------------------ | :------------------------------------ |
| [`from_epoch`](/reference/functions/from_epoch)                 | Interprets a duration as Unix time                | `from_epoch(time_ms * 1ms)`           |
| [`now`](/reference/functions/now)                               | Gets the current wallclock time                   | `now()`                               |
| [`since_epoch`](/reference/functions/since_epoch)               | Turns a time into a duration since the Unix epoch | `since_epoch(2021-02-24)`             |
| [`parse_time`](/reference/functions/parse_time)                 | Parses a timestamp following a given format       | `"10/11/2012".parse_time("%d/%m/%Y")` |
| [`format_time`](/reference/functions/format_time)               | Formats a timestamp following a given format      | `ts.format_time("%d/ %m/%Y")`         |
| [`year`](/reference/functions/year)                             | Extracts the year component from a timestamp      | `ts.year()`                           |
| [`month`](/reference/functions/month)                           | Extracts the month component from a timestamp     | `ts.month()`                          |
| [`day`](/reference/functions/day)                               | Extracts the day component from a timestamp       | `ts.day()`                            |
| [`hour`](/reference/functions/hour)                             | Extracts the hour component from a timestamp      | `ts.hour()`                           |
| [`minute`](/reference/functions/minute)                         | Extracts the minute component from a timestamp    | `ts.minute()`                         |
| [`second`](/reference/functions/second)                         | Extracts the second component from a timestamp    | `ts.second()`                         |
| [`years`](/reference/functions/years)                           | Converts a number to equivalent years             | `years(100)`                          |
| [`months`](/reference/functions/months)                         | Converts a number to equivalent months            | `months(100)`                         |
| [`weeks`](/reference/functions/weeks)                           | Converts a number to equivalent weeks             | `weeks(100)`                          |
| [`days`](/reference/functions/days)                             | Converts a number to equivalent days              | `days(100)`                           |
| [`hours`](/reference/functions/hours)                           | Converts a number to equivalent hours             | `hours(100)`                          |
| [`minutes`](/reference/functions/minutes)                       | Converts a number to equivalent minutes           | `minutes(100)`                        |
| [`seconds`](/reference/functions/seconds)                       | Converts a number to equivalent seconds           | `seconds(100)`                        |
| [`milliseconds`](/reference/functions/milliseconds)             | Converts a number to equivalent milliseconds      | `milliseconds(100)`                   |
| [`microseconds`](/reference/functions/microseconds)             | Converts a number to equivalent microseconds      | `microseconds(100)`                   |
| [`nanoseconds`](/reference/functions/nanoseconds)               | Converts a number to equivalent nanoseconds       | `nanoseconds(100)`                    |
| [`count_years`](/reference/functions/count_years)               | Counts the number of years in a duration          | `count_years(100d)`                   |
| [`count_months`](/reference/functions/count_months)             | Counts the number of months in a duration         | `count_months(100d)`                  |
| [`count_weeks`](/reference/functions/count_weeks)               | Counts the number of weeks in a duration          | `count_weeks(100d)`                   |
| [`count_days`](/reference/functions/count_days)                 | Counts the number of days in a duration           | `count_days(100d)`                    |
| [`count_hours`](/reference/functions/count_hours)               | Counts the number of hours in a duration          | `count_hours(100d)`                   |
| [`count_minutes`](/reference/functions/count_minutes)           | Counts the number of minutes in a duration        | `count_minutes(100d)`                 |
| [`count_seconds`](/reference/functions/count_seconds)           | Counts the number of seconds in a duration        | `count_seconds(100d)`                 |
| [`count_milliseconds`](/reference/functions/count_milliseconds) | Counts the number of milliseconds in a duration   | `count_milliseconds(100d)`            |
| [`count_microseconds`](/reference/functions/count_microseconds) | Counts the number of microseconds in a duration   | `count_microseconds(100d)`            |
| [`count_nanoseconds`](/reference/functions/count_nanoseconds)   | Counts the number of nanoseconds in a duration    | `count_nanoseconds(100d)`             |

## IP

| Function                                  | Description                               | Example                |
| :---------------------------------------- | :---------------------------------------- | :--------------------- |
| [`network`](/reference/functions/network) | Retrieves the network address of a subnet | `10.0.0.0/8.network()` |
## Math

| Function                                | Description                | Example                        |
| :-------------------------------------- | :------------------------- | :----------------------------- |
| [`ceil`](/reference/functions/ceil)     | Takes the ceiling          | `ceil(4.2)`, `ceil(3.2s, 1m)`  |
| [`floor`](/reference/functions/floor)   | Takes the floor            | `floor(4.2)`, `floor(32h, 1d)` |
| [`random`](/reference/functions/random) | Generates a random number  | `random()`                     |
| [`round`](/reference/functions/round)   | Rounds a value             | `round(4.2)`, `round(31m, 1h)` |
| [`sqrt`](/reference/functions/sqrt)     | Calculates the square root | `sqrt(49)`                     |

## Networking

| Function                                                      | Description                 | Example                                                     |
| :------------------------------------------------------------ | :-------------------------- | :---------------------------------------------------------- |
| [`community_id`](/reference/functions/community_id)           | Computes a Community ID     | `community_id(src_ip=1.2.3.4, dst_ip=4.5.6.7, proto="tcp")` |
| [`decapsulate`](/reference/functions/decapsulate)             | Decapsulates PCAP packets   | `decapsulate(this)`                                         |
| [`encrypt_cryptopan`](/reference/functions/encrypt_cryptopan) | Encrypts IPs via Crypto-PAn | `encrypt_cryptopan(1.2.3.4)`                                |
| [`is_v4`](/reference/functions/is_v4)                         | Checks if an IP is IPv4     | `is_v4(1.2.3.4)`                                            |
| [`is_v6`](/reference/functions/is_v6)                         | Checks if an IP is IPv6     | `is_v6(::1)`                                                |

## Hashing

| Function                                          | Description                   | Example              |
| :------------------------------------------------ | :---------------------------- | :------------------- |
| [`hash_md5`](/reference/functions/hash_md5)       | Computes a MD5 hash digest    | `hash_md5("foo")`    |
| [`hash_sha1`](/reference/functions/hash_sha1)     | Computes a SHA1 hash digest   | `hash_sha1("foo")`   |
| [`hash_sha224`](/reference/functions/hash_sha224) | Computes a SHA224 hash digest | `hash_sha224("foo")` |
| [`hash_sha256`](/reference/functions/hash_sha256) | Computes a SHA256 hash digest | `hash_sha256("foo")` |
| [`hash_sha384`](/reference/functions/hash_sha384) | Computes a SHA384 hash digest | `hash_sha384("foo")` |
| [`hash_sha512`](/reference/functions/hash_sha512) | Computes a SHA512 hash digest | `hash_sha512("foo")` |
| [`hash_xxh3`](/reference/functions/hash_xxh3)     | Computes a XXH3 hash digest   | `hash_xxh3("foo")`   |

## Bit Operations

| Function                                          | Description                                | Example                 |
| :------------------------------------------------ | :----------------------------------------- | :---------------------- |
| [`bit_and`](/reference/functions/bit_and)         | Computes the bit-wise AND of its arguments | `bit_and(lhs, rhs)`     |
| [`bit_not`](/reference/functions/bit_not)         | Computes the bit-wise NOT of its argument  | `bit_not(x)`            |
| [`bit_or`](/reference/functions/bit_or)           | Computes the bit-wise OR of its arguments  | `bit_or(lhs, rhs)`      |
| [`bit_xor`](/reference/functions/bit_xor)         | Computes the bit-wise XOR of its arguments | `bit_xor(lhs, rhs)`     |
| [`shift_left`](/reference/functions/shift_left)   | Performs a bit-wise left shift             | `shift_left(lhs, rhs)`  |
| [`shift_right`](/reference/functions/shift_right) | Performs a bit-wise right shift            | `shift_right(lhs, rhs)` |

## Encoding

| Function                                              | Description                                       | Example                     |
| :---------------------------------------------------- | :------------------------------------------------ | :-------------------------- |
| [`encode_base64`](/reference/functions/encode_base64) | Encodes bytes as Base64                           | `encode_base64("Tenzir")`   |
| [`encode_hex`](/reference/functions/encode_hex)       | Encodes bytes as their hexadecimal representation | `encode_hex("Tenzir")`      |
| [`encode_url`](/reference/functions/encode_url)       | Encodes strings using URL encoding                | `encode_url("Hello World")` |

## Decoding

| Function                                              | Description                                         | Example                       |
| :---------------------------------------------------- | :-------------------------------------------------- | :---------------------------- |
| [`decode_base64`](/reference/functions/decode_base64) | Decodes bytes as Base64                             | `decode_base64("VGVuemly")`   |
| [`decode_hex`](/reference/functions/decode_hex)       | Decodes bytes from their hexadecimal representation | `decode_hex("4e6f6E6365")`    |
| [`decode_url`](/reference/functions/decode_url)       | Decodes URL encoded strings                         | `decode_url("Hello%20World")` |

## Type System

### Introspection

| Function                                  | Description                                    | Example            |
| :---------------------------------------- | :--------------------------------------------- | :----------------- |
| [`type_id`](/reference/functions/type_id) | Retrieves the type id of an expression         | `type_id(1 + 3.2)` |
| [`type_of`](/reference/functions/type_of) | Retrieves the type definition of an expression | `type_of(this)`    |

### Conversion

| Function                                    | Description                                | Example                |
| :------------------------------------------ | :----------------------------------------- | :--------------------- |
| [`int`](/reference/functions/int)           | Casts an expression to a signed integer    | `int(-4.2)`            |
| [`uint`](/reference/functions/uint)         | Casts an expression to an unsigned integer | `uint(4.2)`            |
| [`float`](/reference/functions/float)       | Casts an expression to a float             | `float(42)`            |
| [`string`](/reference/functions/string)     | Casts an expression to string              | `string(1.2.3.4)`      |
| [`ip`](/reference/functions/ip)             | Casts an expression to an IP               | `ip("1.2.3.4")`        |
| [`subnet`](/reference/functions/subnet)     | Casts an expression to a subnet            | `subnet("1.2.3.4/16")` |
| [`time`](/reference/functions/time)         | Casts an expression to a time value        | `time("2020-03-15")`   |
| [`duration`](/reference/functions/duration) | Casts an expression to a duration value    | `duration("1.34w")`    |

### Transposition

| Function                                      | Description                  | Example           |
| :-------------------------------------------- | :--------------------------- | :---------------- |
| [`flatten`](/reference/functions/flatten)     | Flattens nested data         | `flatten(this)`   |
| [`unflatten`](/reference/functions/unflatten) | Unflattens nested structures | `unflatten(this)` |

## Runtime

| Function                                | Description                   | Example          |
| :-------------------------------------- | :---------------------------- | :--------------- |
| [`config`](/reference/functions/config) | Reads the configuration file  | `config()`       |
| [`env`](/reference/functions/env)       | Reads an environment variable | `env("PATH")`    |
| [`secret`](/reference/functions/secret) | Reads a secret from a store   | `secret("KEY")`  |
