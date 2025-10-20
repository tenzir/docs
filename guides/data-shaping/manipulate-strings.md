# Manipulate strings

String manipulation is essential for cleaning, formatting, and transforming text data. This guide covers TQL’s comprehensive string functions, from simple case changes to complex pattern matching and encoding operations.

## Change text case

[Section titled “Change text case”](#change-text-case)

Transform strings to different cases for consistency and formatting:

```tql
from {name: "john smith", title: "data ENGINEER", code: "xyz-123"}
lower_name = name.to_lower()
upper_code = code.to_upper()
title_case = title.to_title()
cap_name = name.capitalize()
```

```tql
{
  name: "john smith",
  title: "data ENGINEER",
  code: "xyz-123",
  lower_name: "john smith",
  upper_code: "XYZ-123",
  title_case: "Data Engineer",
  cap_name: "John smith",
}
```

Functions explained:

* [`to_lower()`](/reference/functions/to_lower) - Converts all characters to lowercase
* [`to_upper()`](/reference/functions/to_upper) - Converts all characters to uppercase
* [`to_title()`](/reference/functions/to_title) - Capitalizes first letter of each word
* [`capitalize()`](/reference/functions/capitalize) - Capitalizes only the first letter

## Trim whitespace

[Section titled “Trim whitespace”](#trim-whitespace)

Clean up strings by removing unwanted whitespace:

```tql
from {
  raw: "  hello world  ",
  prefix: "\t\tdata",
  suffix: "value   \n"
}
trimmed = raw.trim()
no_prefix = prefix.trim_start()
no_suffix = suffix.trim_end()
```

```tql
{
  raw: "  hello world  ",
  prefix: "\t\tdata",
  suffix: "value   \n",
  trimmed: "hello world",
  no_prefix: "data",
  no_suffix: "value"
}
```

Functions:

* [`trim()`](/reference/functions/trim) - Removes whitespace from both ends
* [`trim_start()`](/reference/functions/trim_start) - Removes whitespace from beginning
* [`trim_end()`](/reference/functions/trim_end) - Removes whitespace from end

## Split and join strings

[Section titled “Split and join strings”](#split-and-join-strings)

Break strings apart and combine them back together:

```tql
from {
  path: "/home/user/documents/report.pdf",
  tags: "security,network,alert"
}
parts = path.split("/")
tag_list = tags.split(",")
rejoined = parts.join("-")
```

```tql
{
  path: "/home/user/documents/report.pdf",
  tags: "security,network,alert",
  parts: [
    "",
    "home",
    "user",
    "documents",
    "report.pdf",
  ],
  tag_list: [
    "security",
    "network",
    "alert",
  ],
  rejoined: "-home-user-documents-report.pdf",
}
```

### Split with regular expressions

[Section titled “Split with regular expressions”](#split-with-regular-expressions)

Use [`split_regex()`](/reference/functions/split_regex) for complex splitting:

```tql
from {text: "error:42|warning:7|info:125"}
entries = text.split_regex("[:|]")
```

```tql
{
  text: "error:42|warning:7|info:125",
  entries: [
    "error",
    "42",
    "warning",
    "7",
    "info",
    "125",
  ],
}
```

## Find and replace text

[Section titled “Find and replace text”](#find-and-replace-text)

Replace specific text or patterns within strings:

### Simple replacement

[Section titled “Simple replacement”](#simple-replacement)

```tql
from {
  log: "User 192.168.1.1 accessed /admin",
  template: "Hello {name}, welcome to {place}"
}
masked = log.replace("192.168.1.1", "xxx.xxx.xxx.xxx")
filled = template.replace("{name}", "Alice").replace("{place}", "Tenzir")
```

```tql
{
  log: "User 192.168.1.1 accessed /admin",
  template: "Hello {name}, welcome to {place}",
  masked: "User xxx.xxx.xxx.xxx accessed /admin",
  filled: "Hello Alice, welcome to Tenzir",
}
```

### Pattern-based replacement

[Section titled “Pattern-based replacement”](#pattern-based-replacement)

Use [`replace_regex()`](/reference/functions/replace_regex) for complex replacements:

```tql
from {
  text: "Contact us at 555-1234 or 555-5678",
  log: "Error at 2024-01-15 10:30:45: Connection failed"
}
redacted = text.replace_regex("\\d{3}-\\d{4}", "XXX-XXXX")
simple_log = log.replace_regex(
  "\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}",
  "TIMESTAMP"
)
```

```tql
{
  text: "Contact us at 555-1234 or 555-5678",
  log: "Error at 2024-01-15 10:30:45: Connection failed",
  redacted: "Contact us at XXX-XXXX or XXX-XXXX",
  simple_log: "Error at TIMESTAMP: Connection failed",
}
```

## Match patterns

[Section titled “Match patterns”](#match-patterns)

Check if strings match specific patterns:

```tql
from {
  email: "alice@example.com",
  url: "https://tenzir.com",
  file: "report_2024.pdf"
}
is_email = email.match_regex("^[^@]+@[^@]+\\.[^@]+$")
is_https = url.starts_with("https://")
is_pdf = file.ends_with(".pdf")
```

```tql
{
  email: "alice@example.com",
  url: "https://tenzir.com",
  file: "report_2024.pdf",
  is_email: true,
  is_https: true,
  is_pdf: true,
}
```

Pattern matching functions:

* [`match_regex()`](/reference/functions/match_regex) - Test against regular expression
* [`starts_with()`](/reference/functions/starts_with) - Check string prefix
* [`ends_with()`](/reference/functions/ends_with) - Check string suffix

## Validate string content

[Section titled “Validate string content”](#validate-string-content)

Check what type of characters a string contains:

```tql
from {
  id: "12345",
  name: "Alice",
  code: "abc123",
  mixed: "Hello World!",
  spaces: "hello world"
}
id_numeric = id.is_numeric()
name_alpha = name.is_alpha()
code_alnum = code.is_alnum()
mixed_alpha = mixed.is_alpha()
has_lower = spaces.is_lower()
has_upper = name.is_title()
```

```tql
{
  id: "12345",
  name: "Alice",
  code: "abc123",
  mixed: "Hello World!",
  spaces: "hello world",
  id_numeric: true,
  name_alpha: true,
  code_alnum: true,
  mixed_alpha: false,
  has_lower: true,
  has_upper: true,
}
```

Validation functions:

* [`is_numeric()`](/reference/functions/is_numeric) - Contains only digits
* [`is_alpha()`](/reference/functions/is_alpha) - Contains only letters
* [`is_alnum()`](/reference/functions/is_alnum) - Contains only letters and digits
* [`is_lower()`](/reference/functions/is_lower) - All cased characters are lowercase
* [`is_upper()`](/reference/functions/is_upper) - All cased characters are uppercase
* [`is_title()`](/reference/functions/is_title) - String is in title case
* [`is_printable()`](/reference/functions/is_printable) - Contains only printable characters

## Measure string properties

[Section titled “Measure string properties”](#measure-string-properties)

Get information about string characteristics:

```tql
from {
  text: "Hello 世界",
  emoji: "👋 Hello!",
  path: "/var/log/system.log"
}
char_count = text.length_chars()
byte_count = text.length_bytes()
reversed = emoji.reverse()
filename = path.file_name()
directory = path.parent_dir()
```

```tql
{
  text: "Hello 世界",
  emoji: "👋 Hello!",
  path: "/var/log/system.log",
  char_count: 8,
  byte_count: 12,
  reversed: "!olleH 👋",
  filename: "system.log",
  directory: "/var/log",
}
```

String property functions:

* [`length_chars()`](/reference/functions/length_chars) - Count Unicode characters
* [`length_bytes()`](/reference/functions/length_bytes) - Count bytes
* [`reverse()`](/reference/functions/reverse) - Reverse character order
* [`file_name()`](/reference/functions/file_name) - Extract filename from path
* [`parent_dir()`](/reference/functions/parent_dir) - Extract directory from path

## Extract substrings

[Section titled “Extract substrings”](#extract-substrings)

Use [`slice()`](/reference/functions/slice) to extract portions of strings:

```tql
from {
  text: "Hello, World!",
  id: "USER-12345-ACTIVE",
  timestamp: "2024-01-15T10:30:45"
}
greeting = text.slice(begin=0, end=5)
user_num = id.slice(begin=5, end=10)
date_part = timestamp.slice(begin=0, end=10)
status = id.slice(begin=11)
```

```tql
{
  text: "Hello, World!",
  id: "USER-12345-ACTIVE",
  timestamp: "2024-01-15T10:30:45",
  greeting: "Hello",
  user_num: "12345",
  date_part: "2024-01-15",
  status: "ACTIVE",
}
```

The `slice()` function parameters:

* `begin` - Starting position (0-based, negative counts from end)
* `end` - Ending position (exclusive, optional)
* `stride` - Step between characters (optional, can be negative)

## Encode and decode strings

[Section titled “Encode and decode strings”](#encode-and-decode-strings)

Transform strings between different encodings:

### Base64 encoding

[Section titled “Base64 encoding”](#base64-encoding)

```tql
from {secret: "my-api-key-12345"}
encoded = secret.encode_base64()
decoded = encoded.decode_base64()
```

```tql
{
  secret: "my-api-key-12345",
  encoded: "bXktYXBpLWtleS0xMjM0NQ==",
  decoded: b"my-api-key-12345",
}
```

### Hex encoding

[Section titled “Hex encoding”](#hex-encoding)

Use [`encode_hex()`](/reference/functions/encode_hex) and [`decode_hex()`](/reference/functions/decode_hex):

```tql
from {data: "Hello", hex_string: "48656c6c6f"}
hex = data.encode_hex()
decoded = hex.decode_hex()
decoded_blob = hex_string.decode_hex()
```

```tql
{
  data: "Hello",
  hex_string: "48656c6c6f",
  hex: "48656c6c6f",
  decoded: b"Hello",
  decoded_blob: b"Hello",
}
```

### URL encoding

[Section titled “URL encoding”](#url-encoding)

```tql
from {query: "search term with spaces & special=characters"}
encoded = query.encode_url()
decoded = encoded.decode_url()
```

```tql
{
  query: "search term with spaces & special=characters",
  encoded: "search%20term%20with%20spaces%20%26%20special%3Dcharacters",
  decoded: b"search term with spaces & special=characters",
}
```

Encoding functions:

* [`encode_base64()`](/reference/functions/encode_base64) / [`decode_base64()`](/reference/functions/decode_base64)
* [`encode_hex()`](/reference/functions/encode_hex) / [`decode_hex()`](/reference/functions/decode_hex)
* [`encode_url()`](/reference/functions/encode_url) / [`decode_url()`](/reference/functions/decode_url)

## Pad strings

[Section titled “Pad strings”](#pad-strings)

Add characters to reach a specific length:

```tql
from {
  id: "42",
  code: "ABC"
}
padded_id = id.pad_start(5, "0")
padded_code = code.pad_end(10, "-")
```

```tql
{
  id: "42",
  code: "ABC",
  padded_id: "00042",
  padded_code: "ABC-------"
}
```

Padding functions:

* [`pad_start()`](/reference/functions/pad_start) - Add characters to the beginning
* [`pad_end()`](/reference/functions/pad_end) - Add characters to the end

## Read file contents

[Section titled “Read file contents”](#read-file-contents)

Access text from files during processing:

```tql
from {}
hostname = file_contents("/etc/hostname")
```

```tql
{
  hostname: "my-server\n",
}
```

The [`file_contents()`](/reference/functions/file_contents) function reads the entire file as a string. The file path must be a constant expression. Use with caution on large files.

## Practical examples

[Section titled “Practical examples”](#practical-examples)

### Clean and normalize user input

[Section titled “Clean and normalize user input”](#clean-and-normalize-user-input)

```tql
from {
  user_input: "  JOHN.SMITH@EXAMPLE.COM  ",
  phone: "(555) 123-4567"
}
email = user_input.trim().to_lower()
clean_phone = phone.replace_regex("[^0-9]", "")
```

```tql
{
  user_input: "  JOHN.SMITH@EXAMPLE.COM  ",
  phone: "(555) 123-4567",
  email: "john.smith@example.com",
  clean_phone: "5551234567"
}
```

### Extract and validate identifiers

[Section titled “Extract and validate identifiers”](#extract-and-validate-identifiers)

```tql
from {
  log: "User ID: ABC-123-XYZ performed action",
  url: "https://api.example.com/v2/users/42"
}
user_id = log.split("User ID: ")[1].split(" ")[0]
valid_id = user_id.match_regex("^[A-Z]{3}-\\d{3}-[A-Z]{3}$")
api_version = url.split("/")[4]
user_num = url.split("/").last()
```

```tql
{
  log: "User ID: ABC-123-XYZ performed action",
  url: "https://api.example.com/v2/users/42",
  user_id: "ABC-123-XYZ",
  valid_id: true,
  api_version: "v2",
  user_num: "42"
}
```

### Build formatted output

[Section titled “Build formatted output”](#build-formatted-output)

```tql
from {
  first: "alice",
  last: "smith",
  dept: "engineering",
  id: 42
}
full_name = first.capitalize() + " " + last.to_upper()
email = first + "." + last + "@company.com"
badge = dept.to_upper().slice(begin=0, end=3) + "-" + id.string()
```

```tql
{
  first: "alice",
  last: "smith",
  dept: "engineering",
  id: 42,
  full_name: "Alice SMITH",
  email: "alice.smith@company.com",
  badge: "ENG-42",
}
```

## Generate hash values

[Section titled “Generate hash values”](#generate-hash-values)

Create checksums and identifiers using hash functions:

### Common hash algorithms

[Section titled “Common hash algorithms”](#common-hash-algorithms)

```tql
from {
  data: "Hello, World!",
  secret: "my-api-key-123"
}
md5 = data.hash_md5()
sha1 = data.hash_sha1()
sha224 = data.hash_sha224()
sha256 = data.hash_sha256()
sha384 = data.hash_sha384()
sha512 = data.hash_sha512()
xxh3 = data.hash_xxh3()
```

```tql
{
  data: "Hello, World!",
  secret: "my-api-key-123",
  md5: "65a8e27d8879283831b664bd8b7f0ad4",
  sha1: "0a0a9f2a6772942557ab5355d76af442f8f65e01",
  sha224: "72a23dfa411ba6fde01dbfabf3b00a709c93ebf273dc29e2d8b261ff",
  sha256: "dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f",
  sha384: "5485cc9b3365b4305dfb4e8337e0a598a574f8242bf17289e0dd6c20a3cd44a089de16ab4ab308f63e44b1170eb5f515",
  sha512: "374d794a95cdcfd8b35993185fef9ba368f160d8daf432d08ba9f1ed1e5abe6cc69291e0fa2fe0006a52570ef18c19def4e617c33ce52ef0a6e5fbe318cb0387",
  xxh3: "c7269dc5f8602ca5",
}
```

### Create unique identifiers

[Section titled “Create unique identifiers”](#create-unique-identifiers)

Use hashes to generate identifiers from multiple fields:

```tql
from {
  user_id: "alice123",
  timestamp: "2024-01-15T10:30:00",
  action: "login"
}
event_id = f"{user_id}-{timestamp}-{action}".hash_sha256().slice(begin=0, end=16)
short_hash = f"{user_id}{action}".hash_md5().slice(begin=0, end=8)
numeric_id = user_id.hash_xxh3()
```

```tql
{
  user_id: "alice123",
  timestamp: "2024-01-15T10:30:00",
  action: "login",
  event_id: "d5f456083b8fee43",
  short_hash: "1616f7f2",
  numeric_id: "ac6dfe13bd512d81",
}
```

### Verify data integrity

[Section titled “Verify data integrity”](#verify-data-integrity)

```tql
from {
  file_content: "Important document content here...",
  expected_checksum: "dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f"
}
actual_checksum = file_content.hash_sha256()
valid = actual_checksum == expected_checksum
```

```tql
{
  file_content: "Important document content here...",
  expected_checksum: "dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f",
  actual_checksum: "25f898ef7be64ead26e775e41778c6b5b5e5fe135d1b6658b6a27f9334c4f085",
  valid: false,
}
```

## Network security functions

[Section titled “Network security functions”](#network-security-functions)

Process network data with specialized security functions:

### Generate Community IDs

[Section titled “Generate Community IDs”](#generate-community-ids)

Use [`community_id()`](/reference/functions/community_id) to create standardized flow hashes:

```tql
from {
  src_ip: 192.168.1.100,
  dst_ip: 10.0.0.1,
  src_port: 54321,
  dst_port: 443,
  proto: "tcp"
}
flow_id = community_id(
  src_ip=src_ip,
  dst_ip=dst_ip,
  src_port=src_port,
  dst_port=dst_port,
  proto=proto
)
```

```tql
{
  src_ip: 192.168.1.100,
  dst_ip: 10.0.0.1,
  src_port: 54321,
  dst_port: 443,
  proto: "tcp",
  flow_id: "1:ZSU9hCO1tdr7pj3SCLkQ0XS3uvI=",
}
```

### Anonymize IP addresses

[Section titled “Anonymize IP addresses”](#anonymize-ip-addresses)

Use [`encrypt_cryptopan()`](/reference/functions/encrypt_cryptopan) for consistent IP anonymization:

```tql
from {
  client_ip: 192.168.1.100,
  server_ip: 8.8.8.8,
  internal_ip: 10.0.0.5
}
anon_client = client_ip.encrypt_cryptopan(seed="mysecretkey12345")
anon_server = server_ip.encrypt_cryptopan(seed="mysecretkey12345")
anon_internal = internal_ip.encrypt_cryptopan(seed="mysecretkey12345")
```

```tql
{
  client_ip: 192.168.1.100,
  server_ip: 8.8.8.8,
  internal_ip: 10.0.0.5,
  anon_client: 206.216.1.132,
  anon_server: 110.0.51.203,
  anon_internal: 109.255.195.194,
}
```

## Best practices

[Section titled “Best practices”](#best-practices)

1. **Chain operations efficiently**: Combine multiple string operations in one expression
2. **Validate before transforming**: Check string content before applying operations
3. **Handle edge cases**: Empty strings, null values, and special characters
4. **Use appropriate functions**: Choose `length_chars()` vs `length_bytes()` based on needs
5. **Be mindful of encoding**: Ensure correct encoding when dealing with international text

## Related guides

[Section titled “Related guides”](#related-guides)

* [Extract structured data from text](/guides/data-shaping/extract-structured-data-from-text) - Parse complex text formats
* [Transform basic values](/guides/data-shaping/transform-basic-values) - Convert between data types
* [Filter and select data](/guides/data-shaping/filter-and-select-data) - Use string functions in filters