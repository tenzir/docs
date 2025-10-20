# Expressions

Expressions form the computational core of TQL. They range from simple literals to complex evaluations.

## Types and Operations

[Section titled “Types and Operations”](#types-and-operations)

Each type in TQL provides specific operations, starting from the simplest and building up to more complex types. For functions that work with these types, see the [functions reference](/reference/functions).

### Null

[Section titled “Null”](#null)

The `null` type represents absent or invalid values using the literal `null`:

```tql
from {
  value: null,
  is_null: null == null,
  has_value: 42 != null,
}
```

```tql
{
  value: null,
  is_null: true,
  has_value: true,
}
```

The `else` operator provides null coalescing:

```tql
from {
  result: null else "default",
}
```

```tql
{
  result: "default",
}
```

### Boolean

[Section titled “Boolean”](#boolean)

Boolean values (`bool`) support logical operations `and`, `or`, and `not`:

```tql
from {
  x: true and false,
  y: true or false,
  z: not true,
}
```

```tql
{
  x: false,
  y: true,
  z: false,
}
```

TQL implements *short-circuit evaluation*: it stops evaluating once it determines the result.

### String

[Section titled “String”](#string)

Strings support several formats:

* **Regular strings**: `"hello\nworld"` (with escape sequences)
* **Raw strings**: `r"C:\path\to\file"` (no escape processing)
* **Raw strings with quotes**: `r#"They said "hello""#` (allows quotes inside)

Strings support concatenation via `+` and substring checking via `in`:

```tql
from {
  name: "World",
  greeting: "Hello, " + name + "!",
  has_hello: "Hello" in greeting,
}
```

```tql
{
  name: "World",
  greeting: "Hello, World!",
  has_hello: true,
}
```

#### Format Strings (f-strings)

[Section titled “Format Strings (f-strings)”](#format-strings-f-strings)

Format strings provide a concise way to build dynamic strings using embedded expressions. They’re much more readable than string concatenation. For example, instead of:

```tql
percent = round(found / total * 100).string()
message = "Found " + found.string() + "/" + total.string() + ": " + percent + "%"
```

You can simply write:

```tql
message = f"Found {found}/{total}: {round(found / total * 100)}%"
```

To include literal braces, double them:

```tql
from {
  name: "TQL",
  template: f"Use {{braces}} in {name} like this: {{example}}",
}
```

```tql
{
  name: "TQL",
  template: "Use {braces} in TQL like this: {example}",
}
```

### Blob

[Section titled “Blob”](#blob)

Blobs represent raw binary data. Use them for handling non-textual data like network packets, encrypted payloads, or file contents.

Read [why TQL has binary blob types](/explanations/language/types/#why-binary-blob-types) for details.

### Numbers

[Section titled “Numbers”](#numbers)

Numeric literals can include magnitude suffixes for readability:

* **Power-of-ten suffixes**: `k` (1,000), `M` (1,000,000), `G`, `T`, `P`, `E`
* **Power-of-two suffixes**: `Ki` (1,024), `Mi` (1,048,576), `Gi`, `Ti`, `Pi`, `Ei`

For example, `2k` equals `2000` and `2Ki` equals `2048`.

All numeric types support standard arithmetic operations:

```tql
from {
  sum: 10 + 5,
  diff: 10 - 5,
  product: 10 * 5,
  quotient: 10 / 5,
}
```

```tql
{
  sum: 15,
  diff: 5,
  product: 50,
  quotient: 2.0,
}
```

#### Type Coercion

[Section titled “Type Coercion”](#type-coercion)

When mixing numeric types, TQL automatically coerces to the type that can hold the most values:

| Left Type |   Operator  | Right Type | Result Type |
| :-------- | :---------: | :--------- | :---------- |
| `int64`   | +, -, \*, / | `int64`    | `int64`     |
| `int64`   | +, -, \*, / | `uint64`   | `int64`     |
| `int64`   | +, -, \*, / | `double`   | `double`    |
| `uint64`  | +, -, \*, / | `uint64`   | `uint64`    |
| `uint64`  | +, -, \*, / | `double`   | `double`    |
| `double`  | +, -, \*, / | `double`   | `double`    |

#### Overflow and Error Handling

[Section titled “Overflow and Error Handling”](#overflow-and-error-handling)

TQL handles numeric errors gracefully by emitting warnings in the following cases:

* **Overflow/Underflow**: Returns `null` (no wrapping)
* **Division by zero**: Returns `null`
* **Invalid operations**: Returns `null`

This design prevents silent data corruption and makes errors explicit in your data.

Example:

```tql
let $x = 42 / 0
from {
  x: $x,
}
```

This emits the following warning:

```plaintext
warning: division by zero
 --> <input>:1:10
  |
1 | let $x = 42 / 0
  |          ~~~~~~
  |
```

### Duration

[Section titled “Duration”](#duration)

Create durations using time unit suffixes:

* Nanoseconds: `ns`
* Microseconds: `us`
* Milliseconds: `ms`
* Seconds: `s`
* Minutes: `min`
* Hours: `h`
* Days: `d`
* Weeks: `w`
* Months: `mo`
* Years: `y`

Example: `30s`, `5min`, `2h30min`

Durations support arithmetic operations for time calculations:

```tql
from {
  total: 1h + 30min,
  doubled: 30min * 2,
  half: 2h / 4,
  ratio: 30min / 1h,  // 0.5
}
```

```tql
{
  total: 1h30min,
  doubled: 1h,
  half: 30min,
  ratio: 0.5,
}
```

### Time

[Section titled “Time”](#time)

Write dates and timestamps using the [ISO 8601 standard](https://en.wikipedia.org/wiki/ISO_8601):

* Date only: `2024-10-03`
* Full timestamp: `2024-10-03T14:30:00Z`
* With timezone offset: `2024-10-03T14:30:00+02:00`

Time points represent specific moments and support arithmetic with durations:

```tql
from {
  start: 2024-01-01T00:00:00Z,
  one_day_later: start + 24h,
  one_hour_earlier: start - 1h,
}
```

```tql
{
  start: 2024-01-01T00:00:00Z,
  one_day_later: 2024-01-02T00:00:00Z,
  one_hour_earlier: 2023-12-31T23:00:00Z,
}
```

Calculating elapsed time is a common operation that converts two time points into a duration via subtraction:

```tql
from {
  start: 2024-01-01T00:00:00Z,
  end: 2024-01-01T12:30:00Z,
  elapsed: end - start,
}
```

```tql
{
  start: 2024-01-01T00:00:00Z,
  end: 2024-01-01T12:30:00Z,
  elapsed: 12h30min,
}
```

### IP and Subnet

[Section titled “IP and Subnet”](#ip-and-subnet)

The `ip` type handles both IPv4 and IPv6 addresses.

* IPv4: `192.168.1.1`, `10.0.0.1`
* IPv6: `::1`, `2001:db8::1`

This also applies to subnets: both `10.0.0.0/8` and `2001:db8::/32` are valid subnets.

IP addresses and subnets support membership and containment testing:

```tql
let $ip = 192.168.1.100;
let $network = 10.1.0.0/24;
from {
  ip: $ip,
  network: $network,
  is_private: $ip in 192.168.0.0/16,
  is_loopback: $ip in 127.0.0.0/8,
  contains_ip: 10.1.0.5 in $network,
  contains_subnet: 10.1.0.0/28 in $network,
}
```

```tql
{
  ip: 192.168.1.100,
  network: 10.1.0.0/24,
  is_private: true,
  is_loopback: false,
  contains_ip: true,
  contains_subnet: true,
}
```

### Secret

[Section titled “Secret”](#secret)

[Secrets](/explanations/secrets) protect sensitive values like authentication tokens and passwords. The `secret` type contains only a secret’s name, not its actual value, which is resolved asynchronously when needed.

Create secrets using the [`secret`](/reference/functions/secret) function or pass string literals directly to operators that accept secrets:

```tql
// Using managed secret
auth_header = "Bearer " + secret("api-token")


// Using format string (produces a secret)
connection = f"https://{secret("user")}:{secret("pass")}@api.example.com"
```

Secrets support concatenation with `+` and can be used in format strings. When a format string contains a secret, the result is also a secret. Converting a secret to a string yields a masked value (`"***"`) to prevent accidental exposure.

### List

[Section titled “List”](#list)

TQL has *typed* lists, which means that the type of the elements in a list is fixed and must not change per element. Lists use brackets to sequence data. `[]` denotes the empty list. Specify items with comma-delimited expressions:

```tql
let $ports = [80, 443, 8080]
let $mixed = [1, 2+3, foo()]  // Can contain expressions
```

Lists support indexing with `[]` and membership testing with `in`, with negative indices counting from the end of the list (`-1` refers to the last element):

```tql
let $items = [10, 20, 30]
from {
  first: $items[0],
  last: $items[-1],
  has_twenty: 20 in $items,
}
```

```tql
{
  first: 10,
  last: 30,
  has_twenty: true,
}
```

Use `?` for safe indexing that returns `null` instead of generating a warning:

```tql
from {
  items: [1, 2],
  third: items[2]? else 0,
}
```

```tql
{
  items: [
    1,
    2,
  ],
  third: 0,
}
```

The spread operator `...` expands lists into other lists:

```tql
let $base = [1, 2]
let $extended = [...$base, 3]  // Results in [1, 2, 3]
```

### Records

[Section titled “Records”](#records)

Records use braces to structure data. `{}` denotes the empty record. Specify fields using identifiers followed by a colon and an expression. Use quoted strings for invalid field names. For example:

```tql
let $my_record = {
  name: "Tom",
  age: 42,
  friends: ["Jerry", "Brutus"],
  "detailed summary": "Jerry is a cat."  // strings for invalid identifiers
}
```

The spread operator `...` expands records into other records:

Lifting nested fields

```tql
from {
  type: "alert",
  context: {
    severity: "high",
    source: 1.2.3.4,
  }
}
this = {type: type, ...context}
```

```tql
{
  type: "alert",
  severity: "high",
  source: 1.2.3.4,
}
```

Fields must be unique, and later values overwrite earlier ones.

The spread operator `...` expands records:

```tql
let $base = {a: 1, b: 2}
from {
  extended: {...$base, c: 3},
}
```

```tql
{
  extended: {
    a: 1,
    b: 2,
    c: 3,
  },
}
```

## Field Access

[Section titled “Field Access”](#field-access)

TQL provides multiple ways to access and manipulate fields within records and events.

### Basic Access

[Section titled “Basic Access”](#basic-access)

Use a single identifier to refer to a top-level field:

```tql
from {
  name: "Alice",
  age: 30,
}
adult = age >= 18
```

Chain identifiers with dots to access nested fields:

```tql
from {
  user: {
    profile: {
      name: "Alice"
    }
  },
}
username = user.profile.name
```

```tql
{
  user: {
    profile: {
      name: "Alice"
    }
  },
  username: "Alice",
}
```

### The `this` Keyword

[Section titled “The this Keyword”](#the-this-keyword)

`this` references the entire top-level event:

```tql
from {
  x: 1,
  y: 2,
}
z = this
```

```tql
{
  x: 1,
  y: 2,
  z: {
    x: 1,
    y: 2,
  },
}
```

You can also overwrite the entire event:

```tql
this = {transformed: true, data: this}
```

### Non-existent Fields

[Section titled “Non-existent Fields”](#non-existent-fields)

Trying to access a field that does not exist in an event will raise a warning and evaluate to `null`.

### Optional Access with `?`

[Section titled “Optional Access with ?”](#optional-access-with)

The optional field access operator (`?`) suppresses warnings when accessing non-existent fields:

Processing events with optional fields

```tql
from {event: "logon", user: {id: 123, name: "John Doe"}},
     {event: "logon", user: {id: 456}},
     {event: "logoff", user: {id: 123}}
select event, user_id=user.id, name=user.name?
```

```tql
{event: "logon", user_id: 123, name: "John Doe"}
{event: "logon", user_id: 456, name: null}  // No warning for missing `user.name`
{event: "logoff", user_id: 123, name: null} // No warning for missing `user.name`
```

Optional access also works on nested paths:

```tql
from {
  user: {address: {city: "NYC"}},
}
city = user.address?.city?  // No warning if `address` or `address.city` do not exist.
```

### Fallback with `else`

[Section titled “Fallback with else”](#fallback-with-else)

The `else` keyword provides default values when used with `?`:

```tql
from \
  { severity: 10, priority: null }, \
  { severity: null, priority: null }
severity_level = severity? else "unknown" // If `severity` is `null`, use `"unknown"` instead
priority =  priority? else 3              // if `priority` is `null`, default it to `3`
```

Without `else`, the `?` operator returns `null` when the field doesn’t exist. With `else`, you get a sensible default value instead:

```tql
from {
  foo: 1,
  bar: 2,
}
select
  value = missing?,           // null
  with_default = missing? else "default"  // "default"
```

### Indexing

[Section titled “Indexing”](#indexing)

Both lists and records support indexing operations to access their elements.

#### List Indexing

[Section titled “List Indexing”](#list-indexing)

Access list elements using integral indices, starting with `0`:

```tql
let $my_list = ["Hello", "World"]
first = $my_list[0]    // "Hello"
second = $my_list[1]   // "World"
```

Use `?` to handle out-of-bounds access:

```tql
let $ports = [80, 443]
third = $ports[2]? else 8080  // Fallback when index doesn't exist
```

#### Record Indexing

[Section titled “Record Indexing”](#record-indexing)

Bracket notation accesses fields with special characters or runtime values:

```tql
let $answers = {"the ultimate question": 42}
result = $answers["the ultimate question"]
```

Access fields based on runtime values:

```tql
let $severity_to_level = {"ERROR": 1, "WARNING": 2, "INFO": 3}
from {
  severity: "ERROR",
}
level = $severity_to_level[severity]  // Dynamic field access
```

Indexing expressions (see next section below) support numeric indices for records:

Accessing a field by position

```tql
from {
  foo: "Hello",
  bar: "World",
}
select first_field = this[0]  // "Hello"
```

### Moving Fields

[Section titled “Moving Fields”](#moving-fields)

The `move` expression transfers a field’s value and removes the original field in one atomic operation. Use the `move` keyword in front of a field to relocate it as part of an assignment:

```tql
from {foo: 1, bar: 2}
qux = move bar + 2
```

```tql
{foo: 1, qux: 4}  // Note: bar is gone
```

Use `move` in assignments to avoid separate delete operations:

```tql
// Clean approach
new_field = move old_field


// Instead of verbose
new_field = old_field
drop old_field
```

In addition to the `move` keyword, there exists a [`move`](/reference/operators/move) operator that is a convenient alternative when relocating multiple fields. For example, this sequence of assignments with the `move` keyword:

```tql
x = move foo
y = move bar
z = move baz
```

can be rewritten succinctly with the [`move`](/reference/operators/move) operator:

```tql
move x=foo, y=bar, z=baz
```

Key points

* Only usable in expression position (right side of `=`)
* Only works with fields, not arbitrary expressions
* Different from the [`move`](/reference/operators/move) operator that is a statement

### Metadata

[Section titled “Metadata”](#metadata)

Events carry both data and metadata. Access metadata fields using the `@` prefix. For instance, `@name` holds the name of the event.

Currently, available metadata fields include `@name`, `@import_time`, and `@internal`. Future updates may allow defining custom metadata fields.

```tql
from {
  event_name: @name,           // The schema name
  import_time: @import_time,   // When the event was imported
}
```

## Additional Operations

[Section titled “Additional Operations”](#additional-operations)

Beyond type-specific operations, TQL provides general-purpose operators for working with data.

### Unary Operations

[Section titled “Unary Operations”](#unary-operations)

TQL supports unary operators:

* `-` for numbers and durations (negation)
* `not` for boolean values (logical NOT)

```tql
from {
  value: 42,
  flag: true,
}
negative = -value
inverted = not flag
```

```tql
{
  value: 42,
  flag: true,
  negative: -42,
  inverted: false,
}
```

### Binary Operations

[Section titled “Binary Operations”](#binary-operations)

Binary operators work on two operands. The supported operations depend on the data types involved.

#### Arithmetic Operations Summary

[Section titled “Arithmetic Operations Summary”](#arithmetic-operations-summary)

| Operation      | Example | Behavior                         |
| -------------- | ------- | -------------------------------- |
| Addition       | `a + b` | Type coercion to wider type      |
| Subtraction    | `a - b` | Returns null on underflow        |
| Multiplication | `a * b` | Returns null on overflow         |
| Division       | `a / b` | Returns null on division by zero |

#### Time and Duration Arithmetic Summary

[Section titled “Time and Duration Arithmetic Summary”](#time-and-duration-arithmetic-summary)

| Operation             | Result Type | Example                 |
| --------------------- | ----------- | ----------------------- |
| `time + duration`     | `time`      | `now() + 5min`          |
| `time - duration`     | `time`      | `timestamp - 1h`        |
| `time - time`         | `duration`  | `end_time - start_time` |
| `duration + duration` | `duration`  | `5min + 30s`            |
| `duration * number`   | `duration`  | `5min * 3`              |
| `duration / number`   | `duration`  | `1h / 2`                |
| `duration / duration` | `double`    | `30min / 1h` → `0.5`    |

For detailed type coercion rules and more examples, see the specific type sections above.

#### Comparison

[Section titled “Comparison”](#comparison)

All types support equality comparison (`==`, `!=`). Additionally, ordered types support relational comparisons (`<`, `<=`, `>`, `>=`):

```tql
from {
  a: 5,
  b: 10,
}
set equal = a == b
set not_equal = a != b
set less = a < b
set less_equal = a <= b
set greater = a > b
set greater_equal = a >= b
```

```tql
{
  a: 5,
  b: 10,
  equal: false,
  not_equal: true,
  less: true,
  less_equal: true,
  greater: false,
  greater_equal: false,
}
```

**Comparison rules by type:**

* **All types**: Can compare equality with themselves and with `null`
* **Numeric types**: Can compare across different numeric types; ordered by magnitude
* **Strings**: Compare lexicographically (dictionary order)
* **IP addresses**: Ordered by their IPv6 bit pattern
* **Subnets**: Ordered by their IPv6 bit pattern
* **Times**: Chronologically ordered
* **Durations**: Ordered by length

#### Logical

[Section titled “Logical”](#logical)

Combine boolean expressions with `and` and `or`:

```tql
where timestamp > now() - 1d and severity == "critical"
where port == 22 or port == 3389
```

Short-circuit Evaluation

The `and` and `or` operators use short-circuit evaluation: they evaluate the second operand only if necessary. This means that if the first operand is sufficient to determine the result, the second operand is not evaluated.

#### Membership Testing (`in`)

[Section titled “Membership Testing (in)”](#membership-testing-in)

The `in` operator tests containment across different types:

| Expression            | Checks if…                              |
| :-------------------- | :-------------------------------------- |
| `value in list`       | List contains the value                 |
| `substring in string` | String contains the substring           |
| `ip in subnet`        | IP address is within the subnet range   |
| `subnet in subnet`    | First subnet is contained in the second |

```tql
from {
  ip: 10.0.0.5,
  port: 443,
  message: "connection error",
}
in_private = ip in 10.0.0.0/8
is_https = port in [443, 8443]
has_error = "error" in message
```

```tql
{
  ip: 10.0.0.5,
  port: 443,
  message: "connection error",
  in_private: true,
  is_https: true,
  has_error: true,
}
```

To negate membership tests, use `not in` or `not (value in container)`.

### Operator Precedence

[Section titled “Operator Precedence”](#operator-precedence)

Operations follow standard precedence rules:

| Precedence  | Operators                                | Associativity |
| ----------- | ---------------------------------------- | ------------- |
| 1 (highest) | Method call, field access, `[]` indexing | -             |
| 2           | Unary `+`, `-`                           | -             |
| 3           | `*`, `/`                                 | Left          |
| 4           | Binary `+`, `-`                          | Left          |
| 5           | `==`, `!=`, `<`, `<=`, `>`, `>=`, `in`   | Left          |
| 6           | `not`                                    | -             |
| 7           | `and`                                    | Left          |
| 8 (lowest)  | `or`                                     | Left          |

Expressions like `1 - 2 * 3 + 4` follow these precedence and associativity rules. The expression evaluates as `(1 - (2 * 3)) + 4`. Example: `1 + 2 * 3` evaluates as `1 + (2 * 3)` = 7

## Conditional Expressions

[Section titled “Conditional Expressions”](#conditional-expressions)

### Python-style Conditionals

[Section titled “Python-style Conditionals”](#python-style-conditionals)

TQL uses Python-style conditional expressions, i.e., `x if condition else y` where `x`, `y`, and `condition` are expressions.

Use conditionals in assignments and format strings:

```tql
from {
  response_code: 200,
  success: true,
}
status = "OK" if response_code == 200 else "ERROR"
message = f"Status: {'✓' if success else '✗'}"
```

Chaining is allowed but discouraged for readability:

```tql
from {
  severity: "high",
}
priority = 1 if severity == "critical" else 2 if severity == "high" else 3
```

### Standalone `if`

[Section titled “Standalone if”](#standalone-if)

`if` acts as a guard, returning `null` when false:

```tql
from {
  performance: "good",
  should_compute: false,
}
bonus = 1000 if performance == "excellent"  // null otherwise
result = now() if should_compute            // null since should_compute is false
```

```tql
{
  performance: "good",
  should_compute: false,
  bonus: null,
  result: null,
}
```

### Standalone `else`

[Section titled “Standalone else”](#standalone-else)

`else` performs null coalescing:

```tql
from {
  field: null,
}
value = field else "default"  // Use "default" if field is null
```

## Functions and Methods

[Section titled “Functions and Methods”](#functions-and-methods)

Functions and take positional and/or named arguments, producing a value as a result of their computation.

Call **free functions** with parentheses and comma-delimited arguments:

```tql
from {
  result: sqrt(16),
  rounded: round(3.7, 1),
  current: now(),
}
```

Call **methods** using dot notation:

```tql
from {
  text: "  hello  ",
  message: "world",
}
trimmed = text.trim()
length = message.length()
```

### Uniform Function Call Syntax (UFCS)

[Section titled “Uniform Function Call Syntax (UFCS)”](#uniform-function-call-syntax-ufcs)

TQL supports the [uniform function call syntax (UFCS)](https://en.wikipedia.org/wiki/Uniform_Function_Call_Syntax), which allows you to interchangeably call a function with at least one argument either as free function or method. For example, `length(str)` and `str.length()` resolve to the identical function call. The latter syntax is particularly suitable for function chaining, e.g., `x.f().g().h()` reads left-to-right as “start with `x`, apply `f()`, then `g()` and then `h()`,” compared to `h(g(f(x)))`, which reads “inside out.”

* Free function

  ```tql
  from {input: "  hello  "}
  output = capitalize(trim(input))
  ```

  ```tql
  {
    input: "  hello  ",
    output: "Hello",
  }
  ```

* Method

  ```tql
  from {input: "  hello  "}
  output = input.trim().capitalize()
  ```

  ```tql
  {
    input: "  hello  ",
    output: "Hello",
  }
  ```

Note the improved readability of function chaining:

* Free function

  ```tql
  from {message: "  HELLO world  "}
  message = replace(to_lower(trim(message)), " ", "_")
  ```

  ```tql
  {
    message: "hello_world",
  }
  ```

* Method

  ```tql
  from {message: "  HELLO world  "}
  message = message
    .trim()                       // Remove whitespace
    .to_lower()                   // Normalize case
    .replace(" ", "_")            // Replace spaces
  ```

  ```tql
  {
    message: "hello_world",
  }
  ```

Prefer method style

While both styles are valid, we prefer the method syntax for:

* **Readability**: Left-to-right data flow is easier to follow
* **Discoverability**: IDEs can better suggest available methods
* **Consistency**: Aligns with common programming patterns
* **Chaining**: Natural for multi-step transformations

For a comprehensive list of functions, see the [functions reference](/reference/functions).

## Advanced Expressions

[Section titled “Advanced Expressions”](#advanced-expressions)

### Lambda Expressions

[Section titled “Lambda Expressions”](#lambda-expressions)

Some operators and functions accept **lambda expressions** of the form `arg => expr`:

```tql
let $list = [1, 2, 3, 4, 5]
let $data = [{value: 1}, {value: 2}]
from {
  threshold: 3,
}
doubled = [1, 2, 3].map(x => x * 2)
filtered = $list.where(x => x > threshold)
transformed = $data.map(item => item.value * 100)
```

```tql
{
  threshold: 3,
  doubled: [
    2,
    4,
    6,
  ],
  filtered: [],
  transformed: [
    100,
    200,
  ],
}
```

The input gets an explicit name and the expression evaluates for each element.

### Pipeline Expressions

[Section titled “Pipeline Expressions”](#pipeline-expressions)

Some operators accept pipeline expressions as arguments, written with braces:

```tql
every 10s {
  from_http "https://api.example.com/"
  select id, data
}
fork {
  to_hive "s3://bucket/path/", partition_by=[id], format="json"
}
```

If the pipeline expression is the last argument, omit the preceding comma. Braces can contain multiple statements separated by newlines.

### Let Substitution

[Section titled “Let Substitution”](#let-substitution)

Reference previously defined [`let`](/explanations/language/statements#let) bindings using `$`-prefixed names:

```tql
let $pi = 3.14159
let $radius = 5
from {
  area: $radius * $radius * $pi,
}
```

```tql
{
  area: 78.53975,
}
```

Evaluation Time

Constants evaluate *once* at pipeline start and remain available throughout.

## Expression Evaluation

[Section titled “Expression Evaluation”](#expression-evaluation)

TQL expressions can be evaluated at different times: at pipeline start (constant) or per event (runtime).

### Constant Expressions

[Section titled “Constant Expressions”](#constant-expressions)

A **constant expression** evaluates to a constant when the pipeline containing it starts. Many pipeline operators require constant arguments:

```tql
head 5           // Valid: 5 is constant
head count       // Invalid: count depends on events
```

Functions like `now()` and `random()` can be constant-evaluated:

```tql
let $start_time = now()        // Evaluated once at pipeline start
where timestamp > $start_time - 1h
```

They are evaluated once at pipeline start, and the result is treated as a constant.

### Runtime Evaluation

[Section titled “Runtime Evaluation”](#runtime-evaluation)

Most expressions evaluate per event at runtime:

```tql
// These evaluate for each event
score = impact * likelihood
is_recent = timestamp > now() - 5min
formatted = f"Alert: {severity} at {timestamp}"
```