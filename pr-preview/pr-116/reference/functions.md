# Functions

Functions appear in [expressions](/explanations/language/expressions) and take positional and/or named arguments, producing a value as a result of their computation.

Function signatures have the following notation:

```tql
f(arg1:<type>, arg2=<type>, [arg3=type]) -> <type>
```

* `arg:<type>`: positional argument
* `arg=<type>`: named argument
* `[arg=type]`: optional (named) argument
* `-> <type>`: function return type

## Aggregation

[Section titled “Aggregation”](#aggregation)

### [all](/reference/functions/all)

[→](/reference/functions/all)

Computes the conjunction (AND) of all grouped boolean values.

```tql
all([true,true,false])
```

### [any](/reference/functions/any)

[→](/reference/functions/any)

Computes the disjunction (OR) of all grouped boolean values.

```tql
any([true,false,true])
```

### [collect](/reference/functions/collect)

[→](/reference/functions/collect)

Creates a list of all non-null grouped values, preserving duplicates.

```tql
collect([1,2,2,3])
```

### [count](/reference/functions/count)

[→](/reference/functions/count)

Counts the events or non-null grouped values.

```tql
count([1,2,null])
```

### [count\_distinct](/reference/functions/count_distinct)

[→](/reference/functions/count_distinct)

Counts all distinct non-null grouped values.

```tql
count_distinct([1,2,2,3])
```

### [count\_if](/reference/functions/count_if)

[→](/reference/functions/count_if)

Counts the events or non-null grouped values matching a given predicate.

```tql
count_if([1,2,null], x => x > 1)
```

### [distinct](/reference/functions/distinct)

[→](/reference/functions/distinct)

Creates a sorted list without duplicates of non-null grouped values.

```tql
distinct([1,2,2,3])
```

### [entropy](/reference/functions/entropy)

[→](/reference/functions/entropy)

Computes the Shannon entropy of all grouped values.

```tql
entropy([1,1,2,3])
```

### [first](/reference/functions/first)

[→](/reference/functions/first)

Takes the first non-null grouped value.

```tql
first([null,2,3])
```

### [last](/reference/functions/last)

[→](/reference/functions/last)

Takes the last non-null grouped value.

```tql
last([1,2,null])
```

### [max](/reference/functions/max)

[→](/reference/functions/max)

Computes the maximum of all grouped values.

```tql
max([1,2,3])
```

### [mean](/reference/functions/mean)

[→](/reference/functions/mean)

Computes the mean of all grouped values.

```tql
mean([1,2,3])
```

### [median](/reference/functions/median)

[→](/reference/functions/median)

Computes the approximate median of all grouped values using a t-digest algorithm.

```tql
median([1,2,3,4])
```

### [min](/reference/functions/min)

[→](/reference/functions/min)

Computes the minimum of all grouped values.

```tql
min([1,2,3])
```

### [mode](/reference/functions/mode)

[→](/reference/functions/mode)

Takes the most common non-null grouped value.

```tql
mode([1,1,2,3])
```

### [otherwise](/reference/functions/otherwise)

[→](/reference/functions/otherwise)

Returns a `fallback` value if `primary` is `null`.

```tql
x.otherwise(0)
```

### [quantile](/reference/functions/quantile)

[→](/reference/functions/quantile)

Computes the specified quantile of all grouped values.

```tql
quantile([1,2,3,4], q=0.5)
```

### [stddev](/reference/functions/stddev)

[→](/reference/functions/stddev)

Computes the standard deviation of all grouped values.

```tql
stddev([1,2,3])
```

### [sum](/reference/functions/sum)

[→](/reference/functions/sum)

Computes the sum of all values.

```tql
sum([1,2,3])
```

### [value\_counts](/reference/functions/value_counts)

[→](/reference/functions/value_counts)

Returns a list of all grouped values alongside their frequency.

```tql
value_counts([1,2,2,3])
```

### [variance](/reference/functions/variance)

[→](/reference/functions/variance)

Computes the variance of all grouped values.

```tql
variance([1,2,3])
```

## Bit Operations

[Section titled “Bit Operations”](#bit-operations)

### [bit\_and](/reference/functions/bit_and)

[→](/reference/functions/bit_and)

Computes the bit-wise AND of its arguments.

```tql
bit_and(lhs, rhs)
```

### [bit\_not](/reference/functions/bit_not)

[→](/reference/functions/bit_not)

Computes the bit-wise NOT of its argument.

```tql
bit_not(x)
```

### [bit\_or](/reference/functions/bit_or)

[→](/reference/functions/bit_or)

Computes the bit-wise OR of its arguments.

```tql
bit_or(lhs, rhs)
```

### [bit\_xor](/reference/functions/bit_xor)

[→](/reference/functions/bit_xor)

Computes the bit-wise XOR of its arguments.

```tql
bit_xor(lhs, rhs)
```

### [shift\_left](/reference/functions/shift_left)

[→](/reference/functions/shift_left)

Performs a bit-wise left shift.

```tql
shift_left(lhs, rhs)
```

### [shift\_right](/reference/functions/shift_right)

[→](/reference/functions/shift_right)

Performs a bit-wise right shift.

```tql
shift_right(lhs, rhs)
```

## Decoding

[Section titled “Decoding”](#decoding)

### [decode\_base64](/reference/functions/decode_base64)

[→](/reference/functions/decode_base64)

Decodes bytes as Base64.

```tql
decode_base64("VGVuemly")
```

### [decode\_hex](/reference/functions/decode_hex)

[→](/reference/functions/decode_hex)

Decodes bytes from their hexadecimal representation.

```tql
decode_hex("4e6f6E6365")
```

### [decode\_url](/reference/functions/decode_url)

[→](/reference/functions/decode_url)

Decodes URL encoded strings.

```tql
decode_url("Hello%20World")
```

## Encoding

[Section titled “Encoding”](#encoding)

### [encode\_base64](/reference/functions/encode_base64)

[→](/reference/functions/encode_base64)

Encodes bytes as Base64.

```tql
encode_base64("Tenzir")
```

### [encode\_hex](/reference/functions/encode_hex)

[→](/reference/functions/encode_hex)

Encodes bytes into their hexadecimal representation.

```tql
encode_hex("Tenzir")
```

### [encode\_url](/reference/functions/encode_url)

[→](/reference/functions/encode_url)

Encodes strings using URL encoding.

```tql
encode_url("Hello World")
```

## Hashing

[Section titled “Hashing”](#hashing)

### [hash\_md5](/reference/functions/hash_md5)

[→](/reference/functions/hash_md5)

Computes an MD5 hash digest.

```tql
hash_md5("foo")
```

### [hash\_sha1](/reference/functions/hash_sha1)

[→](/reference/functions/hash_sha1)

Computes a SHA-1 hash digest.

```tql
hash_sha1("foo")
```

### [hash\_sha224](/reference/functions/hash_sha224)

[→](/reference/functions/hash_sha224)

Computes a SHA-224 hash digest.

```tql
hash_sha224("foo")
```

### [hash\_sha256](/reference/functions/hash_sha256)

[→](/reference/functions/hash_sha256)

Computes a SHA-256 hash digest.

```tql
hash_sha256("foo")
```

### [hash\_sha384](/reference/functions/hash_sha384)

[→](/reference/functions/hash_sha384)

Computes a SHA-384 hash digest.

```tql
hash_sha384("foo")
```

### [hash\_sha512](/reference/functions/hash_sha512)

[→](/reference/functions/hash_sha512)

Computes a SHA-512 hash digest.

```tql
hash_sha512("foo")
```

### [hash\_xxh3](/reference/functions/hash_xxh3)

[→](/reference/functions/hash_xxh3)

Computes an XXH3 hash digest.

```tql
hash_xxh3("foo")
```

## IP

[Section titled “IP”](#ip)

### [ip\_category](/reference/functions/ip_category)

[→](/reference/functions/ip_category)

Returns the type classification of an IP address.

```tql
ip_category(8.8.8.8)
```

### [is\_global](/reference/functions/is_global)

[→](/reference/functions/is_global)

Checks whether an IP address is a global address.

```tql
is_global(8.8.8.8)
```

### [is\_link\_local](/reference/functions/is_link_local)

[→](/reference/functions/is_link_local)

Checks whether an IP address is a link-local address.

```tql
is_link_local(169.254.1.1)
```

### [is\_loopback](/reference/functions/is_loopback)

[→](/reference/functions/is_loopback)

Checks whether an IP address is a loopback address.

```tql
is_loopback(127.0.0.1)
```

### [is\_multicast](/reference/functions/is_multicast)

[→](/reference/functions/is_multicast)

Checks whether an IP address is a multicast address.

```tql
is_multicast(224.0.0.1)
```

### [is\_private](/reference/functions/is_private)

[→](/reference/functions/is_private)

Checks whether an IP address is a private address.

```tql
is_private(192.168.1.1)
```

### [is\_v4](/reference/functions/is_v4)

[→](/reference/functions/is_v4)

Checks whether an IP address has version number 4.

```tql
is_v4(1.2.3.4)
```

### [is\_v6](/reference/functions/is_v6)

[→](/reference/functions/is_v6)

Checks whether an IP address has version number 6.

```tql
is_v6(::1)
```

### [network](/reference/functions/network)

[→](/reference/functions/network)

Retrieves the network address of a subnet.

```tql
10.0.0.0/8.network()
```

## List

[Section titled “List”](#list)

### [add](/reference/functions/add)

[→](/reference/functions/add)

Adds an element into a list if it doesn't already exist (set-insertion).

```tql
xs.add(y)
```

### [append](/reference/functions/append)

[→](/reference/functions/append)

Inserts an element at the back of a list.

```tql
xs.append(y)
```

### [concatenate](/reference/functions/concatenate)

[→](/reference/functions/concatenate)

Merges two lists.

```tql
concatenate(xs, ys)
```

### [get](/reference/functions/get)

[→](/reference/functions/get)

Gets a field from a record or an element from a list

```tql
xs.get(index, fallback)
```

### [length](/reference/functions/length)

[→](/reference/functions/length)

Retrieves the length of a list.

```tql
[1,2,3].length()
```

### [map](/reference/functions/map)

[→](/reference/functions/map)

Maps each list element to an expression.

```tql
xs.map(x => x + 3)
```

### [prepend](/reference/functions/prepend)

[→](/reference/functions/prepend)

Inserts an element at the start of a list.

```tql
xs.prepend(y)
```

### [remove](/reference/functions/remove)

[→](/reference/functions/remove)

Removes all occurrences of an element from a list.

```tql
xs.remove(y)
```

### [sort](/reference/functions/sort)

[→](/reference/functions/sort)

Sorts lists and record fields.

```tql
xs.sort()
```

### [where](/reference/functions/where)

[→](/reference/functions/where)

Filters list elements based on a predicate.

```tql
xs.where(x => x > 5)
```

### [zip](/reference/functions/zip)

[→](/reference/functions/zip)

Combines two lists into a list of pairs.

```tql
zip(xs, ys)
```

## Math

[Section titled “Math”](#math)

### [abs](/reference/functions/abs)

[→](/reference/functions/abs)

Returns the absolute value.

```tql
abs(-42)
```

### [ceil](/reference/functions/ceil)

[→](/reference/functions/ceil)

Computes the ceiling of a number or a time/duration with a specified unit.

```tql
ceil(4.2)
```

### [floor](/reference/functions/floor)

[→](/reference/functions/floor)

Computes the floor of a number or a time/duration with a specified unit.

```tql
floor(4.8)
```

### [round](/reference/functions/round)

[→](/reference/functions/round)

Rounds a number or a time/duration with a specified unit.

```tql
round(4.6)
```

### [sqrt](/reference/functions/sqrt)

[→](/reference/functions/sqrt)

Computes the square root of a number.

```tql
sqrt(49)
```

## Networking

[Section titled “Networking”](#networking)

### [community\_id](/reference/functions/community_id)

[→](/reference/functions/community_id)

Computes the Community ID for a network connection/flow.

```tql
community_id(src_ip=1.2.3.4, dst_ip=4.5.6.7, proto="tcp")
```

### [decapsulate](/reference/functions/decapsulate)

[→](/reference/functions/decapsulate)

Decapsulates packet data at link, network, and transport layer.

```tql
decapsulate(this)
```

### [encrypt\_cryptopan](/reference/functions/encrypt_cryptopan)

[→](/reference/functions/encrypt_cryptopan)

Encrypts an IP address via Crypto-PAn.

```tql
encrypt_cryptopan(1.2.3.4)
```

## OCSF

[Section titled “OCSF”](#ocsf)

### [ocsf::category\_name](/reference/functions/ocsf/category_name)

[→](/reference/functions/ocsf/category_name)

Returns the `category_name` for a given `category_uid`.

```tql
ocsf::category_name(2)
```

### [ocsf::category\_uid](/reference/functions/ocsf/category_uid)

[→](/reference/functions/ocsf/category_uid)

Returns the `category_uid` for a given `category_name`.

```tql
ocsf::category_uid("Findings")
```

### [ocsf::class\_name](/reference/functions/ocsf/class_name)

[→](/reference/functions/ocsf/class_name)

Returns the `class_name` for a given `class_uid`.

```tql
ocsf::class_name(4003)
```

### [ocsf::class\_uid](/reference/functions/ocsf/class_uid)

[→](/reference/functions/ocsf/class_uid)

Returns the `class_uid` for a given `class_name`.

```tql
ocsf::class_uid("DNS Activity")
```

### [ocsf::type\_name](/reference/functions/ocsf/type_name)

[→](/reference/functions/ocsf/type_name)

Returns the `type_name` for a given `type_uid`.

```tql
ocsf::type_name(400704)
```

### [ocsf::type\_uid](/reference/functions/ocsf/type_uid)

[→](/reference/functions/ocsf/type_uid)

Returns the `type_uid` for a given `type_name`.

```tql
ocsf::type_uid("SSH Activity: Fail")
```

## Parsing

[Section titled “Parsing”](#parsing)

### [parse\_cef](/reference/functions/parse_cef)

[→](/reference/functions/parse_cef)

Parses a string as a CEF message

```tql
string.parse_cef()
```

### [parse\_csv](/reference/functions/parse_csv)

[→](/reference/functions/parse_csv)

Parses a string as CSV (Comma-Separated Values).

```tql
string.parse_csv(header=["a","b"])
```

### [parse\_grok](/reference/functions/parse_grok)

[→](/reference/functions/parse_grok)

Parses a string according to a grok pattern.

```tql
string.parse_grok("%{IP:client} …")
```

### [parse\_json](/reference/functions/parse_json)

[→](/reference/functions/parse_json)

Parses a string as a JSON value.

```tql
string.parse_json()
```

### [parse\_kv](/reference/functions/parse_kv)

[→](/reference/functions/parse_kv)

Parses a string as key-value pairs.

```tql
string.parse_kv()
```

### [parse\_leef](/reference/functions/parse_leef)

[→](/reference/functions/parse_leef)

Parses a string as a LEEF message

```tql
string.parse_leef()
```

### [parse\_ssv](/reference/functions/parse_ssv)

[→](/reference/functions/parse_ssv)

Parses a string as space separated values.

```tql
string.parse_ssv(header=["a","b"])
```

### [parse\_syslog](/reference/functions/parse_syslog)

[→](/reference/functions/parse_syslog)

Parses a string as a Syslog message.

```tql
string.parse_syslog()
```

### [parse\_tsv](/reference/functions/parse_tsv)

[→](/reference/functions/parse_tsv)

Parses a string as tab separated values.

```tql
string.parse_tsv(header=["a","b"])
```

### [parse\_xsv](/reference/functions/parse_xsv)

[→](/reference/functions/parse_xsv)

Parses a string as delimiter separated values.

```tql
string.parse_xsv(",", ";", "", header=["a","b"])
```

### [parse\_yaml](/reference/functions/parse_yaml)

[→](/reference/functions/parse_yaml)

Parses a string as a YAML value.

```tql
string.parse_yaml()
```

## Printing

[Section titled “Printing”](#printing)

### [print\_cef](/reference/functions/print_cef)

[→](/reference/functions/print_cef)

Prints records as Common Event Format (CEF) messages

```tql
extension.print_cef(cef_version="0", device_vendor="Tenzir", device_product="Tenzir Node", device_version="5.5.0", signature_id=id, name="description", severity="7")
```

### [print\_csv](/reference/functions/print_csv)

[→](/reference/functions/print_csv)

Prints a record as a comma-separated string of values.

```tql
record.print_csv()
```

### [print\_json](/reference/functions/print_json)

[→](/reference/functions/print_json)

Transforms a value into a JSON string.

```tql
record.print_json()
```

### [print\_kv](/reference/functions/print_kv)

[→](/reference/functions/print_kv)

Prints records in a key-value format.

```tql
record.print_kv()
```

### [print\_leef](/reference/functions/print_leef)

[→](/reference/functions/print_leef)

Prints records as LEEF messages

```tql
attributes.print_leef(vendor="Tenzir",product_name="Tenzir Node", product_name="5.5.0",event_class_id=id)
```

### [print\_ndjson](/reference/functions/print_ndjson)

[→](/reference/functions/print_ndjson)

Transforms a value into a single-line JSON string.

```tql
record.print_ndjson()
```

### [print\_ssv](/reference/functions/print_ssv)

[→](/reference/functions/print_ssv)

Prints a record as a space-separated string of values.

```tql
record.print_ssv()
```

### [print\_tsv](/reference/functions/print_tsv)

[→](/reference/functions/print_tsv)

Prints a record as a tab-separated string of values.

```tql
record.print_tsv()
```

### [print\_xsv](/reference/functions/print_xsv)

[→](/reference/functions/print_xsv)

Prints a record as a delimited sequence of values.

```tql
record.print_tsv()
```

### [print\_yaml](/reference/functions/print_yaml)

[→](/reference/functions/print_yaml)

Prints a value as a YAML document.

```tql
record.print_yaml()
```

## Record

[Section titled “Record”](#record)

### [get](/reference/functions/get)

[→](/reference/functions/get)

Gets a field from a record or an element from a list

```tql
xs.get(index, fallback)
```

### [has](/reference/functions/has)

[→](/reference/functions/has)

Checks whether a record has a specified field.

```tql
record.has("field")
```

### [keys](/reference/functions/keys)

[→](/reference/functions/keys)

Retrieves a list of field names from a record.

```tql
record.keys()
```

### [merge](/reference/functions/merge)

[→](/reference/functions/merge)

Combines two records into a single record by merging their fields.

```tql
merge(foo, bar)
```

### [sort](/reference/functions/sort)

[→](/reference/functions/sort)

Sorts lists and record fields.

```tql
xs.sort()
```

## Runtime

[Section titled “Runtime”](#runtime)

### [config](/reference/functions/config)

[→](/reference/functions/config)

Reads Tenzir's configuration file.

```tql
config()
```

### [env](/reference/functions/env)

[→](/reference/functions/env)

Reads an environment variable.

```tql
env("PATH")
```

### [secret](/reference/functions/secret)

[→](/reference/functions/secret)

Use the value of a secret.

```tql
secret("KEY")
```

## Subnet

[Section titled “Subnet”](#subnet)

### [network](/reference/functions/network)

[→](/reference/functions/network)

Retrieves the network address of a subnet.

```tql
10.0.0.0/8.network()
```

## Time & Date

[Section titled “Time & Date”](#time--date)

### [count\_days](/reference/functions/count_days)

[→](/reference/functions/count_days)

Counts the number of `days` in a duration.

```tql
count_days(100d)
```

### [count\_hours](/reference/functions/count_hours)

[→](/reference/functions/count_hours)

Counts the number of `hours` in a duration.

```tql
count_hours(100d)
```

### [count\_microseconds](/reference/functions/count_microseconds)

[→](/reference/functions/count_microseconds)

Counts the number of `microseconds` in a duration.

```tql
count_microseconds(100d)
```

### [count\_milliseconds](/reference/functions/count_milliseconds)

[→](/reference/functions/count_milliseconds)

Counts the number of `milliseconds` in a duration.

```tql
count_milliseconds(100d)
```

### [count\_minutes](/reference/functions/count_minutes)

[→](/reference/functions/count_minutes)

Counts the number of `minutes` in a duration.

```tql
count_minutes(100d)
```

### [count\_months](/reference/functions/count_months)

[→](/reference/functions/count_months)

Counts the number of `months` in a duration.

```tql
count_months(100d)
```

### [count\_nanoseconds](/reference/functions/count_nanoseconds)

[→](/reference/functions/count_nanoseconds)

Counts the number of `nanoseconds` in a duration.

```tql
count_nanoseconds(100d)
```

### [count\_seconds](/reference/functions/count_seconds)

[→](/reference/functions/count_seconds)

Counts the number of `seconds` in a duration.

```tql
count_seconds(100d)
```

### [count\_weeks](/reference/functions/count_weeks)

[→](/reference/functions/count_weeks)

Counts the number of `weeks` in a duration.

```tql
count_weeks(100d)
```

### [count\_years](/reference/functions/count_years)

[→](/reference/functions/count_years)

Counts the number of `years` in a duration.

```tql
count_years(100d)
```

### [day](/reference/functions/day)

[→](/reference/functions/day)

Extracts the day component from a timestamp.

```tql
ts.day()
```

### [days](/reference/functions/days)

[→](/reference/functions/days)

Converts a number to equivalent days.

```tql
days(100)
```

### [format\_time](/reference/functions/format_time)

[→](/reference/functions/format_time)

Formats a time into a string that follows a specific format.

```tql
ts.format_time("%d/ %m/%Y")
```

### [from\_epoch](/reference/functions/from_epoch)

[→](/reference/functions/from_epoch)

Interprets a duration as Unix time.

```tql
from_epoch(time_ms * 1ms)
```

### [hour](/reference/functions/hour)

[→](/reference/functions/hour)

Extracts the hour component from a timestamp.

```tql
ts.hour()
```

### [hours](/reference/functions/hours)

[→](/reference/functions/hours)

Converts a number to equivalent hours.

```tql
hours(100)
```

### [microseconds](/reference/functions/microseconds)

[→](/reference/functions/microseconds)

Converts a number to equivalent microseconds.

```tql
microseconds(100)
```

### [milliseconds](/reference/functions/milliseconds)

[→](/reference/functions/milliseconds)

Converts a number to equivalent milliseconds.

```tql
milliseconds(100)
```

### [minute](/reference/functions/minute)

[→](/reference/functions/minute)

Extracts the minute component from a timestamp.

```tql
ts.minute()
```

### [minutes](/reference/functions/minutes)

[→](/reference/functions/minutes)

Converts a number to equivalent minutes.

```tql
minutes(100)
```

### [month](/reference/functions/month)

[→](/reference/functions/month)

Extracts the month component from a timestamp.

```tql
ts.month()
```

### [months](/reference/functions/months)

[→](/reference/functions/months)

Converts a number to equivalent months.

```tql
months(100)
```

### [nanoseconds](/reference/functions/nanoseconds)

[→](/reference/functions/nanoseconds)

Converts a number to equivalent nanoseconds.

```tql
nanoseconds(100)
```

### [now](/reference/functions/now)

[→](/reference/functions/now)

Gets the current wallclock time.

```tql
now()
```

### [parse\_time](/reference/functions/parse_time)

[→](/reference/functions/parse_time)

Parses a time from a string that follows a specific format.

```tql
"10/11/2012".parse_time("%d/%m/%Y")
```

### [second](/reference/functions/second)

[→](/reference/functions/second)

Extracts the second component from a timestamp with subsecond precision.

```tql
ts.second()
```

### [seconds](/reference/functions/seconds)

[→](/reference/functions/seconds)

Converts a number to equivalent seconds.

```tql
seconds(100)
```

### [since\_epoch](/reference/functions/since_epoch)

[→](/reference/functions/since_epoch)

Interprets a time value as duration since the Unix epoch.

```tql
since_epoch(2021-02-24)
```

### [weeks](/reference/functions/weeks)

[→](/reference/functions/weeks)

Converts a number to equivalent weeks.

```tql
weeks(100)
```

### [year](/reference/functions/year)

[→](/reference/functions/year)

Extracts the year component from a timestamp.

```tql
ts.year()
```

### [years](/reference/functions/years)

[→](/reference/functions/years)

Converts a number to equivalent years.

```tql
years(100)
```

## Utility

[Section titled “Utility”](#utility)

### [contains](/reference/functions/contains)

[→](/reference/functions/contains)

Searches for a value within data structures recursively.

```tql
this.contains("value")
```

### [contains\_null](/reference/functions/contains_null)

[→](/reference/functions/contains_null)

Checks whether the input contains any `null` values.

```tql
{x: 1, y: null}.contains_null() == true
```

### [is\_empty](/reference/functions/is_empty)

[→](/reference/functions/is_empty)

Checks whether a value is empty.

```tql
"".is_empty()
```

### [random](/reference/functions/random)

[→](/reference/functions/random)

Generates a random number in *\[0,1]*.

```tql
random()
```

### [uuid](/reference/functions/uuid)

[→](/reference/functions/uuid)

Generates a Universally Unique Identifier (UUID) string.

```tql
uuid()
```

## String

[Section titled “String”](#string)

### Filesystem

[Section titled “Filesystem”](#filesystem)

### [file\_contents](/reference/functions/file_contents)

[→](/reference/functions/file_contents)

Reads a file's contents.

```tql
file_contents("/path/to/file")
```

### [file\_name](/reference/functions/file_name)

[→](/reference/functions/file_name)

Extracts the file name from a file path.

```tql
file_name("/path/to/log.json")
```

### [parent\_dir](/reference/functions/parent_dir)

[→](/reference/functions/parent_dir)

Extracts the parent directory from a file path.

```tql
parent_dir("/path/to/log.json")
```

### Inspection

[Section titled “Inspection”](#inspection)

### [ends\_with](/reference/functions/ends_with)

[→](/reference/functions/ends_with)

Checks if a string ends with a specified substring.

```tql
"hello".ends_with("lo")
```

### [is\_alnum](/reference/functions/is_alnum)

[→](/reference/functions/is_alnum)

Checks if a string is alphanumeric.

```tql
"hello123".is_alnum()
```

### [is\_alpha](/reference/functions/is_alpha)

[→](/reference/functions/is_alpha)

Checks if a string contains only alphabetic characters.

```tql
"hello".is_alpha()
```

### [is\_lower](/reference/functions/is_lower)

[→](/reference/functions/is_lower)

Checks if a string is in lowercase.

```tql
"hello".is_lower()
```

### [is\_numeric](/reference/functions/is_numeric)

[→](/reference/functions/is_numeric)

Checks if a string contains only numeric characters.

```tql
"1234".is_numeric()
```

### [is\_printable](/reference/functions/is_printable)

[→](/reference/functions/is_printable)

Checks if a string contains only printable characters.

```tql
"hello".is_printable()
```

### [is\_title](/reference/functions/is_title)

[→](/reference/functions/is_title)

Checks if a string follows title case.

```tql
"Hello World".is_title()
```

### [is\_upper](/reference/functions/is_upper)

[→](/reference/functions/is_upper)

Checks if a string is in uppercase.

```tql
"HELLO".is_upper()
```

### [length\_bytes](/reference/functions/length_bytes)

[→](/reference/functions/length_bytes)

Returns the length of a string in bytes.

```tql
"hello".length_bytes()
```

### [length\_chars](/reference/functions/length_chars)

[→](/reference/functions/length_chars)

Returns the length of a string in characters.

```tql
"hello".length_chars()
```

### [match\_regex](/reference/functions/match_regex)

[→](/reference/functions/match_regex)

Checks if a string partially matches a regular expression.

```tql
"Hi".match_regex("[Hh]i")
```

### [slice](/reference/functions/slice)

[→](/reference/functions/slice)

Slices a string with offsets and strides.

```tql
"Hi".slice(begin=2, stride=4)
```

### [starts\_with](/reference/functions/starts_with)

[→](/reference/functions/starts_with)

Checks if a string starts with a specified substring.

```tql
"hello".starts_with("he")
```

### Transformation

[Section titled “Transformation”](#transformation)

### [capitalize](/reference/functions/capitalize)

[→](/reference/functions/capitalize)

Capitalizes the first character of a string.

```tql
"hello".capitalize()
```

### [join](/reference/functions/join)

[→](/reference/functions/join)

Joins a list of strings into a single string using a separator.

```tql
join(["a", "b", "c"], ",")
```

### [pad\_end](/reference/functions/pad_end)

[→](/reference/functions/pad_end)

Pads a string at the end to a specified length.

```tql
"hello".pad_end(10)
```

### [pad\_start](/reference/functions/pad_start)

[→](/reference/functions/pad_start)

Pads a string at the start to a specified length.

```tql
"hello".pad_start(10)
```

### [replace](/reference/functions/replace)

[→](/reference/functions/replace)

Replaces characters within a string.

```tql
"hello".replace("o", "a")
```

### [replace\_regex](/reference/functions/replace_regex)

[→](/reference/functions/replace_regex)

Replaces characters within a string based on a regular expression.

```tql
"hello".replace("l+o", "y")
```

### [reverse](/reference/functions/reverse)

[→](/reference/functions/reverse)

Reverses the characters of a string.

```tql
"hello".reverse()
```

### [split](/reference/functions/split)

[→](/reference/functions/split)

Splits a string into substrings.

```tql
split("a,b,c", ",")
```

### [split\_regex](/reference/functions/split_regex)

[→](/reference/functions/split_regex)

Splits a string into substrings with a regex.

```tql
split_regex("a1b2c", r"\d")
```

### [to\_lower](/reference/functions/to_lower)

[→](/reference/functions/to_lower)

Converts a string to lowercase.

```tql
"HELLO".to_lower()
```

### [to\_title](/reference/functions/to_title)

[→](/reference/functions/to_title)

Converts a string to title case.

```tql
"hello world".to_title()
```

### [to\_upper](/reference/functions/to_upper)

[→](/reference/functions/to_upper)

Converts a string to uppercase.

```tql
"hello".to_upper()
```

### [trim](/reference/functions/trim)

[→](/reference/functions/trim)

Trims whitespace or specified characters from both ends of a string.

```tql
" hello ".trim()
```

### [trim\_end](/reference/functions/trim_end)

[→](/reference/functions/trim_end)

Trims whitespace or specified characters from the end of a string.

```tql
"hello ".trim_end()
```

### [trim\_start](/reference/functions/trim_start)

[→](/reference/functions/trim_start)

Trims whitespace or specified characters from the start of a string.

```tql
" hello".trim_start()
```

## Type System

[Section titled “Type System”](#type-system)

### Conversion

[Section titled “Conversion”](#conversion)

### [duration](/reference/functions/duration)

[→](/reference/functions/duration)

Casts an expression to a duration value.

```tql
duration("1.34w")
```

### [float](/reference/functions/float)

[→](/reference/functions/float)

Casts an expression to a float.

```tql
float(42)
```

### [int](/reference/functions/int)

[→](/reference/functions/int)

Casts an expression to an integer.

```tql
int(-4.2)
```

### [ip](/reference/functions/ip)

[→](/reference/functions/ip)

Casts an expression to an IP address.

```tql
ip("1.2.3.4")
```

### [string](/reference/functions/string)

[→](/reference/functions/string)

Casts an expression to a string.

```tql
string(1.2.3.4)
```

### [subnet](/reference/functions/subnet)

[→](/reference/functions/subnet)

Casts an expression to a subnet value.

```tql
subnet("1.2.3.4/16")
```

### [time](/reference/functions/time)

[→](/reference/functions/time)

Casts an expression to a time value.

```tql
time("2020-03-15")
```

### [uint](/reference/functions/uint)

[→](/reference/functions/uint)

Casts an expression to an unsigned integer.

```tql
uint(4.2)
```

### Introspection

[Section titled “Introspection”](#introspection)

### [type\_id](/reference/functions/type_id)

[→](/reference/functions/type_id)

Retrieves the type id of an expression.

```tql
type_id(1 + 3.2)
```

### [type\_of](/reference/functions/type_of)

[→](/reference/functions/type_of)

Retrieves the type definition of an expression.

```tql
type_of(this)
```

### Transposition

[Section titled “Transposition”](#transposition)

### [flatten](/reference/functions/flatten)

[→](/reference/functions/flatten)

Flattens nested data.

```tql
flatten(this)
```

### [unflatten](/reference/functions/unflatten)

[→](/reference/functions/unflatten)

Unflattens nested data.

```tql
unflatten(this)
```