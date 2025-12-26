# Common TQL Patterns

Frequently used idioms and best practices for writing TQL pipelines.

## Pipeline Structure

**Vertical style in files** (preferred):

```tql
let $ports = [22, 443]
from "/tmp/logs.json"
where port in $ports
select src_ip, dst_ip, bytes
```

**Horizontal style on command-line**:

```tql
from "logs.json" | where severity == "high" | summarize count()
```

Never mix styles. Use trailing commas in vertical lists/records.

## Field Management

**Move fields to avoid duplication**:

```tql
normalized.src_ip = move raw.source_address
```

**Optional field access** (no warning if missing):

```tql
select event_id, customer_id?
result = field? else "default"
```

**Replace placeholder values**:

```tql
replace what="-", with=null
drop_null_fields
```

## Type-Aware Operations

**IP and subnet checks**:

```tql
where src_ip in 10.0.0.0/8
where src_ip.is_private()
```

**Time calculations**:

```tql
where timestamp > now() - 1h
elapsed = end_time - start_time
```

**Duration conversions** (prefer method chaining):

```tql
timestamp = epoch_secs.seconds().from_epoch()
timeout = timeout_secs.seconds()
```

## Lookup Tables

**Use records instead of if-else chains**:

```tql
let $http_methods = {
  GET: 3,
  POST: 6,
  PUT: 7,
}
activity_id = $http_methods[method]? else 99
```

**List indexing for position-based lookups**:

```tql
let $names = ["Unknown", "Connect", "Delete", "Get"]
activity_name = $names[activity_id]? else "Other"
```

## Performance

**Filter early, aggregate late**:

```tql
from "large_file.json"
where severity == "critical"  // Reduce data volume first
select relevant_fields        // Drop unnecessary fields
summarize ...                 // Aggregate reduced dataset
```

**Streaming vs blocking**: `where`, `select`, `drop` stream incrementally.
`sort`, `summarize`, `reverse` need all input first.

## Data Quality

| Tool         | Use Case           | Behavior           |
| ------------ | ------------------ | ------------------ |
| `field`      | Required field     | Warning if missing |
| `field?`     | Optional field     | Silent if missing  |
| `where`      | Filtering          | Silent filter      |
| `assert`     | Enforce invariants | Warning + filter   |
| `strict { }` | Zero tolerance     | Warnings → Errors  |

**Example**:

```tql
strict {
  assert severity in ["low", "medium", "high", "critical"]
  select event_id, timestamp  // Fatal if missing
}
where geo?.country? == "US"   // Optional, outside strict
```

## Control Flow

**Conditional processing**:

```tql
if score < 100 {
  severity = "low"
} else if score < 200 {
  severity = "medium"
} else {
  severity = "high"
}
```

**Inline conditionals** (use sparingly):

```tql
status = "OK" if response_code == 200 else "ERROR"
```

## Constants

**Named values for clarity**:

```tql
let $internal_net = 10.0.0.0/8
let $critical_ports = [22, 3389, 5432]
let $high_risk_threshold = 0.8

where src_ip in $internal_net
where dst_port in $critical_ports
```

## When to Read Full Docs

- Idiomatic patterns: `tutorials/learn-idiomatic-tql`
- OCSF mapping: `tutorials/map-data-to-ocsf`
- Operator reference: `reference/operators/<name>`
- Function reference: `reference/functions/<name>`
