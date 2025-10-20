# Extract structured data from text

Real-world data is messy. Log lines contain embedded JSON. CSV fields hide key-value pairs. Network packets wrap multiple protocols. This guide shows you how to extract structured data from text using TQL’s parsing functions, starting simple and building up to complex scenarios.

## Parse JSON embedded in strings

[Section titled “Parse JSON embedded in strings”](#parse-json-embedded-in-strings)

The most common parsing task is extracting JSON data from string fields. Let’s start with a simple example:

```tql
from {message: "{\"user\": \"alice\", \"action\": \"login\", \"timestamp\": 1234567890}"}
data = message.parse_json()
```

```tql
{
  message: "{\"user\": \"alice\", \"action\": \"login\", \"timestamp\": 1234567890}",
  data: {
    user: "alice",
    action: "login",
    timestamp: 1234567890,
  },
}
```

The [`parse_json()`](/reference/functions/parse_json) function converts the JSON string into a structured record. You can now access nested fields directly:

```tql
from {message: "{\"user\": \"alice\", \"action\": \"login\", \"timestamp\": 1234567890}"}
data = message.parse_json()
user = data.user
action = data.action
```

```tql
{
  message: "{\"user\": \"alice\", \"action\": \"login\", \"timestamp\": 1234567890}",
  data: {user: "alice", action: "login", timestamp: 1234567890},
  user: "alice",
  action: "login",
}
```

## Extract key-value pairs

[Section titled “Extract key-value pairs”](#extract-key-value-pairs)

Many logs use simple key-value formats. The [`parse_kv()`](/reference/functions/parse_kv) function handles these automatically:

```tql
from {log: "status=200 method=GET path=/api/users duration=45ms"}
fields = log.parse_kv()
```

```tql
{
  log: "status=200 method=GET path=/api/users duration=45ms",
  fields: {
    status: 200,
    method: "GET",
    path: "/api/users",
    duration: 45ms,
  },
}
```

Notice how `parse_kv()` automatically:

* Detects the `=` separator
* Converts numeric values (status becomes 200, not “200”)
* Parses duration values (duration becomes `45ms`, not “45ms”)

### Customize separators

[Section titled “Customize separators”](#customize-separators)

Not all key-value pairs use `=`. Specify custom separators:

```tql
from {log: "user:alice action:login time:2024-01-15"}
fields = log.parse_kv(field_split=" ", value_split=":")
```

```tql
{
  log: "user:alice action:login time:2024-01-15",
  fields: {
    user: "alice",
    action: "login",
    time: 2024-01-15T00:00:00Z,
  },
}
```

## Parse tabular data formats

[Section titled “Parse tabular data formats”](#parse-tabular-data-formats)

TQL provides several functions for parsing tabular data:

### CSV (Comma-Separated Values)

[Section titled “CSV (Comma-Separated Values)”](#csv-comma-separated-values)

Use [`parse_csv()`](/reference/functions/parse_csv) for standard CSV:

```tql
from {line: "alice,30,engineer,SF"}
fields = line.parse_csv(header=["name", "age", "role", "location"])
```

```tql
{
  line: "alice,30,engineer,SF",
  fields: {
    name: "alice",
    age: 30,
    role: "engineer",
    location: "SF",
  },
}
```

To get an array without field names, use `split()`:

```tql
from {line: "alice,30,engineer,SF"}
values = line.split(",")
```

```tql
{
  line: "alice,30,engineer,SF",
  values: [
    "alice",
    "30",
    "engineer",
    "SF",
  ],
}
```

### TSV (Tab-Separated Values)

[Section titled “TSV (Tab-Separated Values)”](#tsv-tab-separated-values)

For tab-separated data, use [`parse_tsv()`](/reference/functions/parse_tsv):

```tql
from {line: "alice\t30\tengineer"}
fields = line.parse_tsv(header=["name", "age", "role"])
```

```tql
{
  line: "alice\t30\tengineer",
  fields: {
    name: "alice",
    age: 30,
    role: "engineer",
  },
}
```

### SSV (Space-Separated Values)

[Section titled “SSV (Space-Separated Values)”](#ssv-space-separated-values)

For space-separated data, use [`parse_ssv()`](/reference/functions/parse_ssv):

```tql
from {line: "alice 30 engineer"}
fields = line.parse_ssv(header=["name", "age", "role"])
```

```tql
{
  line: "alice 30 engineer",
  fields: {
    name: "alice",
    age: 30,
    role: "engineer",
  },
}
```

### XSV (Custom-Separated Values)

[Section titled “XSV (Custom-Separated Values)”](#xsv-custom-separated-values)

For custom separators, use [`parse_xsv()`](/reference/functions/parse_xsv):

```tql
from {line: "alice|30|engineer|SF"}
fields = line.parse_xsv(field_separator="|",
                        list_separator=",",
                        null_value="",
                        header=["name", "age", "role", "location"])
```

```tql
{
  line: "alice|30|engineer|SF",
  fields: {
    name: "alice",
    age: 30,
    role: "engineer",
    location: "SF",
  },
}
```

## Parse YAML data

[Section titled “Parse YAML data”](#parse-yaml-data)

YAML is common in configuration files. Use [`parse_yaml()`](/reference/functions/parse_yaml):

```tql
from {config: "user: alice\nrole: admin\npermissions:\n  - read\n  - write"}
data = config.parse_yaml()
```

```tql
{
  config: "user: alice\nrole: admin\npermissions:\n  - read\n  - write",
  data: {
    user: "alice",
    role: "admin",
    permissions: [
      "read",
      "write",
    ],
  },
}
```

## Use Grok patterns for complex formats

[Section titled “Use Grok patterns for complex formats”](#use-grok-patterns-for-complex-formats)

When data doesn’t follow simple patterns, [`parse_grok()`](/reference/functions/parse_grok) provides powerful pattern matching:

```tql
from {log: "2024-01-15 10:30:45 ERROR [UserService] Failed to authenticate user alice"}
parsed = log.parse_grok("%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} \\[%{DATA:service}\\] %{GREEDYDATA:message}")
```

```tql
{
  log: "2024-01-15 10:30:45 ERROR [UserService] Failed to authenticate user alice",
  parsed: {
    timestamp: 2024-01-15T10:30:45Z,
    level: "ERROR",
    service: "UserService",
    message: "Failed to authenticate user alice",
  },
}
```

Common Grok patterns include:

* `%{DATA:fieldname}` - Match any characters (non-greedy)
* `%{GREEDYDATA:fieldname}` - Match any characters (greedy)
* `%{NUMBER:fieldname}` - Match numbers
* `%{IP:fieldname}` - Match IP addresses
* `%{TIMESTAMP_ISO8601:fieldname}` - Match ISO timestamps
* `%{LOGLEVEL:fieldname}` - Match log levels (ERROR, WARN, INFO, etc.)
* `%{WORD:fieldname}` - Match a single word
* `%{QUOTEDSTRING:fieldname}` - Match quoted strings

## Parse standard log formats

[Section titled “Parse standard log formats”](#parse-standard-log-formats)

### Syslog messages

[Section titled “Syslog messages”](#syslog-messages)

Syslog is ubiquitous in system logging. Use [`parse_syslog()`](/reference/functions/parse_syslog):

```tql
from {line: "2024-01-15T10:30:45.123Z myhost myapp[1234]: User login failed"}
syslog = line.parse_syslog()
```

```tql
{
  line: "2024-01-15T10:30:45.123Z myhost myapp[1234]: User login failed",
  syslog: {
    facility: null,
    severity: null,
    timestamp: 2024-01-15T10:30:45.123Z,
    hostname: "myhost",
    app_name: "myapp",
    process_id: "1234",
    content: "User login failed",
  },
}
```

### CEF (Common Event Format)

[Section titled “CEF (Common Event Format)”](#cef-common-event-format)

For security tools using CEF, use [`parse_cef()`](/reference/functions/parse_cef):

```tql
from {log: "CEF:0|Security|Firewall|1.0|100|Connection Blocked|5|src=10.0.0.1 dst=192.168.1.1 spt=12345 dpt=443"}
event = log.parse_cef()
```

```tql
{
  log: "CEF:0|Security|Firewall|1.0|100|Connection Blocked|5|src=10.0.0.1 dst=192.168.1.1 spt=12345 dpt=443",
  event: {
    cef_version: 0,
    device_vendor: "Security",
    device_product: "Firewall",
    device_version: "1.0",
    signature_id: "100",
    name: "Connection Blocked",
    severity: "5",
    extension: {
      src: 10.0.0.1,
      dst: 192.168.1.1,
      spt: 12345,
      dpt: 443,
    },
  },
}
```

### LEEF (Log Event Extended Format)

[Section titled “LEEF (Log Event Extended Format)”](#leef-log-event-extended-format)

For IBM QRadar’s LEEF format, use [`parse_leef()`](/reference/functions/parse_leef):

```tql
from {log: "LEEF:1.0|Security|Firewall|1.0|100|src=10.0.0.1|dst=192.168.1.1|spt=12345|dpt=443"}
event = log.parse_leef()
```

```tql
{
  log: "LEEF:1.0|Security|Firewall|1.0|100|src=10.0.0.1|dst=192.168.1.1|spt=12345|dpt=443",
  event: {
    leef_version: "1.0",
    vendor: "Security",
    product_name: "Firewall",
    product_version: "1.0",
    event_class_id: "100",
    attributes: {
      src: "10.0.0.1|dst=192.168.1.1|spt=12345|dpt=443",
    },
  },
}
```

## Parse timestamps

[Section titled “Parse timestamps”](#parse-timestamps)

Convert time strings to proper timestamp values with [`parse_time()`](/reference/functions/parse_time):

```tql
from {
  log1: "Event at 2024-01-15",
  log2: "Event at 15/Jan/2024:10:30:45",
  log3: "Event at Mon Jan 15 10:30:45 2024"
}
time1 = log1.split(" at ")[1].parse_time("%Y-%m-%d")
time2 = log2.split(" at ")[1].parse_time("%d/%b/%Y:%H:%M:%S")
time3 = log3.split(" at ")[1].parse_time("%a %b %d %H:%M:%S %Y")
```

```tql
{
  log1: "Event at 2024-01-15",
  log2: "Event at 15/Jan/2024:10:30:45",
  log3: "Event at Mon Jan 15 10:30:45 2024",
  time1: 2024-01-15T00:00:00Z,
  time2: 2024-01-15T10:30:45Z,
  time3: 2024-01-15T10:30:45Z,
}
```

## Layer multiple parsers

[Section titled “Layer multiple parsers”](#layer-multiple-parsers)

Real-world logs often require multiple parsing steps. Let’s parse a web server log that contains syslog formatting with embedded JSON:

```tql
from {
  line: "2024-01-15T10:30:45Z web nginx[5678]: {\"method\":\"POST\",\"path\":\"/api/login\",\"status\":401,\"duration\":\"125ms\",\"client\":\"192.168.1.100\"}"
}
// First, parse the syslog wrapper
syslog = line.parse_syslog()
// Then parse the JSON content
request = syslog.content.parse_json()
// Extract specific fields we care about
method = request.method
path = request.path
status = request.status
client_ip = request.client.ip()
```

```tql
{
  line: "2024-01-15T10:30:45Z web nginx[5678]: {\"method\":\"POST\",\"path\":\"/api/login\",\"status\":401,\"duration\":\"125ms\",\"client\":\"192.168.1.100\"}",
  syslog: {
    facility: null,
    severity: null,
    timestamp: 2024-01-15T10:30:45Z,
    hostname: "web",
    app_name: "nginx",
    process_id: "5678",
    content: "{\"method\":\"POST\",\"path\":\"/api/login\",\"status\":401,\"duration\":\"125ms\",\"client\":\"192.168.1.100\"}",
  },
  request: {
    method: "POST",
    path: "/api/login",
    status: 401,
    duration: 125ms,
    client: 192.168.1.100,
  },
  method: "POST",
  path: "/api/login",
  status: 401,
  client_ip: 192.168.1.100,
}
```

## Parse and transform incrementally

[Section titled “Parse and transform incrementally”](#parse-and-transform-incrementally)

When dealing with complex nested data, work incrementally. Here’s a practical example with firewall logs:

```tql
from {
  log: "2024-01-15 10:30:45 FW01 BLOCK src=10.0.0.5:54321 dst=93.184.216.34:443 proto=TCP flags=SYN"
}
// Step 1: Extract the basic structure
parts = log.parse_grok("%{TIMESTAMP_ISO8601:time} %{DATA:device} %{DATA:action} %{GREEDYDATA:details}")
```

```tql
{
  log: "2024-01-15 10:30:45 FW01 BLOCK src=10.0.0.5:54321 dst=93.184.216.34:443 proto=TCP flags=SYN",
  parts: {
    time: 2024-01-15T10:30:45Z,
    device: "FW01",
    action: "BLOCK",
    details: "src=10.0.0.5:54321 dst=93.184.216.34:443 proto=TCP flags=SYN",
  },
}
```

Now parse the details field:

```tql
from {
  log: "2024-01-15 10:30:45 FW01 BLOCK src=10.0.0.5:54321 dst=93.184.216.34:443 proto=TCP flags=SYN"
}
parts = log.parse_grok("%{TIMESTAMP_ISO8601:time} %{DATA:device} %{DATA:action} %{GREEDYDATA:details}")
// Step 2: Parse the key-value pairs
parts.details = parts.details.parse_kv()
```

```tql
{
  log: "2024-01-15 10:30:45 FW01 BLOCK src=10.0.0.5:54321 dst=93.184.216.34:443 proto=TCP flags=SYN",
  parts: {
    time: 2024-01-15T10:30:45Z,
    device: "FW01",
    action: "BLOCK",
    details: {
      src: "10.0.0.5:54321",
      dst: "93.184.216.34:443",
      proto: "TCP",
      flags: "SYN",
    },
  }
}
```

Finally, parse the IP:port combinations:

```tql
from {
  log: "2024-01-15 10:30:45 FW01 BLOCK src=10.0.0.5:54321 dst=93.184.216.34:443 proto=TCP flags=SYN"
}
parts = log.parse_grok("%{TIMESTAMP_ISO8601:time} %{DATA:device} %{DATA:action} %{GREEDYDATA:details}")
parts.details = parts.details.parse_kv()
// Step 3: Split IP:port combinations
src_parts = parts.details.src.split(":")
dst_parts = parts.details.dst.split(":")
// Step 4: Create clean output
this = {
  timestamp: parts.time,
  device: parts.device,
  action: parts.action,
  src_ip: src_parts[0].ip(),
  src_port: src_parts[1].int(),
  dst_ip: dst_parts[0].ip(),
  dst_port: dst_parts[1].int(),
  protocol: parts.details.proto,
  flags: parts.details.flags
}
```

```tql
{
  timestamp: 2024-01-15T10:30:45Z,
  device: "FW01",
  action: "BLOCK",
  src_ip: 10.0.0.5,
  src_port: 54321,
  dst_ip: 93.184.216.34,
  dst_port: 443,
  protocol: "TCP",
  flags: "SYN",
}
```

## Best practices

[Section titled “Best practices”](#best-practices)

1. **Work incrementally**: Parse complex data in stages, testing each step

2. **Check intermediate results**: Examine data after each parsing step

3. **Handle errors gracefully**: Parsing functions return null on failure

4. **Use appropriate parsers**:

   * JSON/YAML for structured data
   * Key-value for simple pairs
   * CSV/TSV/SSV for tabular data
   * Grok for complex patterns
   * Specific parsers (syslog, CEF, LEEF) for standard formats

5. **Transform types**: After parsing, convert strings to appropriate types (timestamps, IPs, numbers)

6. **Consider performance**: Simpler parsers (JSON, KV) are faster than complex ones (Grok)

## Related guides

[Section titled “Related guides”](#related-guides)

* [Filter and select data](/guides/data-shaping/filter-and-select-data) - Work with parsed fields
* [Transform basic values](/guides/data-shaping/transform-basic-values) - Convert parsed strings to proper types
* [Shape data](/guides/data-shaping/shape-data) - Overview of all shaping operations