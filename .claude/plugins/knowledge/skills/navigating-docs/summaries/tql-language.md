# TQL Language Overview

TQL (Tenzir Query Language) is a dataflow language for processing unstructured
byte-streams and semi-structured events. It combines ideas from Splunk SPL,
Kusto, Unix pipes, and jq.

## Core Concepts

**Pipeline model**: Data flows through operators from left to right. Build
queries incrementally, test at each stage.

**Multi-schema philosophy**: Operators are polymorphic, adapting to different
schemas at runtime. No strict schema enforcement.

**Unified streaming/batch**: Same pipeline logic for real-time and historical
data.

## Type System

TQL extends JSON with domain-specific types:

| Type       | Example               | Use Case                    |
| ---------- | --------------------- | --------------------------- |
| `ip`       | `192.168.1.1`, `::1`  | IP address operations       |
| `subnet`   | `10.0.0.0/8`          | Network containment checks  |
| `duration` | `5min`, `1h30min`     | Time calculations           |
| `time`     | `2024-01-15T10:30:00` | Timestamp operations        |
| `blob`     | `b"\x00\x01\x02"`     | Binary data handling        |
| `secret`   | `secret("API_KEY")`   | Protected credential values |

All types are nullable. Type coercion is automatic for numeric operations.

## Expressions

Key operations:

- **Arithmetic**: `+`, `-`, `*`, `/` on numbers, durations, times
- **Comparison**: `==`, `!=`, `<`, `<=`, `>`, `>=`
- **Logical**: `and`, `or`, `not` (short-circuit evaluation)
- **Membership**: `in` for lists, strings, subnets
- **Null coalescing**: `field? else "default"`
- **Conditionals**: `x if condition else y`

Field access: `field`, `record.nested`, `list[0]`, `this` (entire event)

## Statements

- **Operators**: `from`, `where`, `select`, `head`, etc.
- **Assignments**: `field = expression` (implicit `set`)
- **Let bindings**: `let $name = value` (constants evaluated once)
- **Control flow**: `if condition { ... } else { ... }`

## Operator Types

Operators have upstream/downstream types: void, bytes, or events.

```
void → events   : from, load_file + read_json
events → events : where, select, drop, sort
events → void   : to, import
bytes → events  : read_json, read_csv (parsers)
events → bytes  : write_json, write_parquet (printers)
```

## Execution Model

- **Streaming**: Most operators process events incrementally
- **Blocking**: `sort`, `summarize`, `reverse` need all input first
- **Back-pressure**: Automatic flow control prevents memory exhaustion

## When to Read Full Docs

- Type details: `explanations/language/types`
- Expression syntax: `explanations/language/expressions`
- Statement reference: `explanations/language/statements`
- Program structure: `explanations/language/programs`
- Idiomatic patterns: `tutorials/learn-idiomatic-tql`
