# Reshape complex data

Real-world data is rarely flat. It contains nested structures, arrays of objects, and deeply hierarchical information. This guide shows advanced techniques for reshaping complex data structures to meet your analysis needs.

## Flatten nested structures

[Section titled “Flatten nested structures”](#flatten-nested-structures)

Transform deeply nested data into flat structures for easier analysis.

### Basic flattening

[Section titled “Basic flattening”](#basic-flattening)

Start with simple nested objects:

```tql
from {
  user: {
    id: 123,
    profile: {
      name: "Alice",
      contact: {
        email: "alice@example.com",
        phone: "+1-555-0123"
      }
    }
  }
}
flat_user = {
  id: user.id,
  name: user.profile.name,
  email: user.profile.contact.email,
  phone: user.profile.contact.phone
}
```

```tql
{
  user: {...},
  flat_user: {
    id: 123,
    name: "Alice",
    email: "alice@example.com",
    phone: "+1-555-0123",
  },
}
```

### Flatten with prefixes

[Section titled “Flatten with prefixes”](#flatten-with-prefixes)

Preserve context when flattening:

```tql
from {
  event: {
    id: "evt-001",
    user: {name: "Alice", role: "admin"},
    system: {name: "web-server", version: "2.1"}
  }
}
flattened = {
  event_id: event.id,
  user_name: event.user.name,
  user_role: event.user.role,
  system_name: event.system.name,
  system_version: event.system.version
}
```

```tql
{
  event: {...},
  flattened: {
    event_id: "evt-001",
    user_name: "Alice",
    user_role: "admin",
    system_name: "web-server",
    system_version: "2.1",
  }
}
```

## Unflatten data

[Section titled “Unflatten data”](#unflatten-data)

Reconstruct hierarchical structures from flattened data using [`unflatten()`](/reference/functions/unflatten):

### Basic unflattening

[Section titled “Basic unflattening”](#basic-unflattening)

Convert dotted field names back to nested structures:

```tql
from {
  flattened: {
    "user.name": "Alice",
    "user.email": "alice@example.com",
    "user.address.city": "NYC",
    "user.address.zip": "10001",
    "status": "active"
  }
}
nested = flattened.unflatten()
```

```tql
{
  flattened: {
    "user.name": "Alice",
    "user.email": "alice@example.com",
    "user.address.city": "NYC",
    "user.address.zip": "10001",
    status: "active",
  },
  nested: {
    user: {
      name: "Alice",
      email: "alice@example.com",
      address: {
        city: "NYC",
        zip: "10001",
      },
    },
    status: "active",
  },
}
```

### Custom separator

[Section titled “Custom separator”](#custom-separator)

Use a different separator for field paths:

```tql
from {
  metrics: {
    cpu_usage_percent: 45,
    memory_used_gb: 8,
    memory_total_gb: 16,
    disk_root_used: 100,
    disk_root_total: 500
  }
}
structured = metrics.unflatten("_")
```

```tql
{
  metrics: {
    cpu_usage_percent: 45,
    memory_used_gb: 8,
    memory_total_gb: 16,
    disk_root_used: 100,
    disk_root_total: 500,
  },
  structured: {
    cpu: {
      usage: {
        percent: 45,
      },
    },
    memory: {
      used: {
        gb: 8,
      },
      total: {
        gb: 16,
      },
    },
    disk: {
      root: {
        used: 100,
        total: 500,
      },
    },
  },
}
```

## Normalize denormalized data

[Section titled “Normalize denormalized data”](#normalize-denormalized-data)

Convert wide data to long format for better analysis.

### Wide to long transformation

[Section titled “Wide to long transformation”](#wide-to-long-transformation)

```tql
from {
  metrics: {
    timestamp: "2024-01-15T10:00:00",
    cpu_usage: 45,
    memory_usage: 62,
    disk_usage: 78
  }
}
long_format = [
  {timestamp: metrics.timestamp, metric: "cpu", value: metrics.cpu_usage},
  {timestamp: metrics.timestamp, metric: "memory", value: metrics.memory_usage},
  {timestamp: metrics.timestamp, metric: "disk", value: metrics.disk_usage}
]
```

```tql
{
  metrics: {
    timestamp: "2024-01-15T10:00:00",
    cpu_usage: 45,
    memory_usage: 62,
    disk_usage: 78,
  },
  long_format: [
    {
      timestamp: "2024-01-15T10:00:00",
      metric: "cpu",
      value: 45,
    },
    {
      timestamp: "2024-01-15T10:00:00",
      metric: "memory",
      value: 62,
    },
    {
      timestamp: "2024-01-15T10:00:00",
      metric: "disk",
      value: 78,
    },
  ],
}
```

### Transform to event stream

[Section titled “Transform to event stream”](#transform-to-event-stream)

Convert arrays to event streams for processing:

```tql
from {
  readings: [
    {sensor: "temp", location: "room1", value: 72},
    {sensor: "humidity", location: "room1", value: 45},
    {sensor: "temp", location: "room2", value: 68},
    {sensor: "humidity", location: "room2", value: 50}
  ]
}
unroll readings
select sensor=readings.sensor,
       location=readings.location,
      value=readings.value
```

```tql
{sensor: "temp", location: "room1", value: 72}
{sensor: "humidity", location: "room1", value: 45}
{sensor: "temp", location: "room2", value: 68}
{sensor: "humidity", location: "room2", value: 50}
```

## Extract arrays from objects

[Section titled “Extract arrays from objects”](#extract-arrays-from-objects)

Transform objects with numbered keys into proper arrays.

```tql
from {
  response: {
    item_0: {name: "Widget", price: 9.99},
    item_1: {name: "Gadget", price: 19.99},
    item_2: {name: "Tool", price: 14.99},
    total_items: 3
  }
}
// Extract items manually when keys are known
items = [
  response.item_0,
  response.item_1,
  response.item_2
]
```

```tql
{
  response: {...},
  items: [
    {name: "Widget", price: 9.99},
    {name: "Gadget", price: 19.99},
    {name: "Tool", price: 14.99},
  ]
}
```

## Build hierarchical structures

[Section titled “Build hierarchical structures”](#build-hierarchical-structures)

Create nested structures from flat data.

### Group data with summarize

[Section titled “Group data with summarize”](#group-data-with-summarize)

Use the [`summarize`](/reference/operators/summarize) operator to group data:

```tql
from {
  records: [
    {dept: "Engineering", team: "Backend", member: "Alice"},
    {dept: "Engineering", team: "Backend", member: "Bob"},
    {dept: "Engineering", team: "Frontend", member: "Charlie"},
    {dept: "Sales", team: "Direct", member: "David"}
  ]
}
unroll records
summarize dept=records.dept, team=records.team, members=collect(records.member)
```

```tql
{
  dept: "Sales",
  team: "Direct",
  members: [
    "David",
  ],
}
{
  dept: "Engineering",
  team: "Frontend",
  members: [
    "Charlie",
  ],
}
{
  dept: "Engineering",
  team: "Backend",
  members: [
    "Alice",
    "Bob",
  ],
}
```

### Extract path components

[Section titled “Extract path components”](#extract-path-components)

```tql
from {
  paths: [
    "/home/user/docs/report.pdf",
    "/home/user/docs/summary.txt",
    "/home/user/images/photo.jpg",
    "/var/log/system.log"
  ]
}
path_info = paths.map(path => {
  full_path: path,
  directory: path.parent_dir(),
  filename: path.file_name(),
  parts: path.split("/").where(p => p.length_bytes() > 0)
})
```

```tql
{
  paths: [...],
  path_info: [
    {
      full_path: "/home/user/docs/report.pdf",
      directory: "/home/user/docs",
      filename: "report.pdf",
      parts: ["home", "user", "docs", "report.pdf"],
    },
    {
      full_path: "/home/user/docs/summary.txt",
      directory: "/home/user/docs",
      filename: "summary.txt",
      parts: ["home", "user", "docs", "summary.txt"],
    },
    {
      full_path: "/home/user/images/photo.jpg",
      directory: "/home/user/images",
      filename: "photo.jpg",
      parts: ["home", "user", "images", "photo.jpg"],
    },
    {
      full_path: "/var/log/system.log",
      directory: "/var/log",
      filename: "system.log",
      parts: ["var", "log", "system.log"],
    },
  ],
}
```

## Merge fragmented data

[Section titled “Merge fragmented data”](#merge-fragmented-data)

Combine data split across multiple records.

### Merge records with spread operator

[Section titled “Merge records with spread operator”](#merge-records-with-spread-operator)

```tql
from {
  user: {id: 1, name: "Alice"},
  profile: {email: "alice@example.com", dept: "Engineering"},
  metrics: {logins: 45, actions: 234}
}
merged = {
  ...user,
  ...profile,
  ...metrics
}
```

```tql
{
  user: {
    id: 1,
    name: "Alice",
  },
  profile: {
    email: "alice@example.com",
    dept: "Engineering",
  },
  metrics: {
    logins: 45,
    actions: 234,
  },
  merged: {
    id: 1,
    name: "Alice",
    email: "alice@example.com",
    dept: "Engineering",
    logins: 45,
    actions: 234,
  },
}
```

## Handle dynamic schemas

[Section titled “Handle dynamic schemas”](#handle-dynamic-schemas)

Work with data that has varying structures.

### Normalize inconsistent records

[Section titled “Normalize inconsistent records”](#normalize-inconsistent-records)

```tql
from {
  events: [
    {type: "user", data: {name: "Alice", email: "alice@example.com"}},
    {type: "system", data: {cpu: 45, memory: 1024}},
    {type: "error", message: "Connection failed", code: 500}
  ]
}
select normalized = events.map(e => {
  event_type: e.type,
  timestamp: now(),
  // Use conditional assignment for type-specific fields
  user_name: e.data.name if e.type == "user",
  user_email: e.data.email if e.type == "user",
  system_cpu: e.data.cpu if e.type == "system",
  system_memory: e.data.memory if e.type == "system",
  error_message: e.message if e.type == "error",
  error_code: e.code if e.type == "error"
})
```

```tql
{
  normalized: [
    {
      event_type: "user",
      timestamp: 2025-07-21T18:54:09.307412Z,
      user_name: "Alice",
      user_email: "alice@example.com",
      system_cpu: null,
      system_memory: null,
      error_message: null,
      error_code: null,
    },
    {
      event_type: "system",
      timestamp: 2025-07-21T18:54:09.307412Z,
      user_name: null,
      user_email: null,
      system_cpu: 45,
      system_memory: 1024,
      error_message: null,
      error_code: null,
    },
    {
      event_type: "error",
      timestamp: 2025-07-21T18:54:09.307412Z,
      user_name: null,
      user_email: null,
      system_cpu: null,
      system_memory: null,
      error_message: "Connection failed",
      error_code: 500,
    },
  ],
}
```

## Working with aggregated events

[Section titled “Working with aggregated events”](#working-with-aggregated-events)

### Unroll arrays to individual events

[Section titled “Unroll arrays to individual events”](#unroll-arrays-to-individual-events)

Some data sources aggregate multiple events into a single record. Use [`unroll`](/reference/operators/unroll) to expand these into individual events:

Expanding aggregated message types

```tql
// DHCP logs may contain multiple message types in one record
from {
  ts: 2024-01-15T10:00:00,
  uid: "C123abc",
  msg_types: ["DISCOVER", "OFFER", "REQUEST", "ACK"],
  client_addr: 192.168.1.100
}
unroll msg_types
// Now we have 4 separate events, one per message type
activity_name = msg_types.to_title()
```

```tql
{ts: 2024-01-15T10:00:00, uid: "C123abc", msg_types: "DISCOVER", client_addr: 192.168.1.100, activity_name: "Discover"}
{ts: 2024-01-15T10:00:00, uid: "C123abc", msg_types: "OFFER", client_addr: 192.168.1.100, activity_name: "Offer"}
{ts: 2024-01-15T10:00:00, uid: "C123abc", msg_types: "REQUEST", client_addr: 192.168.1.100, activity_name: "Request"}
{ts: 2024-01-15T10:00:00, uid: "C123abc", msg_types: "ACK", client_addr: 192.168.1.100, activity_name: "Ack"}
```

This pattern is essential when:

* Converting aggregated logs to event-per-row formats
* Normalizing data for OCSF or other schemas that expect individual events
* Processing batched API responses

## Safe arithmetic with optional fields

[Section titled “Safe arithmetic with optional fields”](#safe-arithmetic-with-optional-fields)

### Dynamic field computation with null safety

[Section titled “Dynamic field computation with null safety”](#dynamic-field-computation-with-null-safety)

When computing metrics from fields that might be null, use the `else` keyword for safe fallbacks:

Null-safe calculations

```tql
from {
  packets_sent: 1000,
  packets_received: 950,
  duration: 10s,
  bytes_sent: null,  // Missing data
  bytes_received: 5000
}


// Safe division with fallback
packets_per_second = packets_sent / duration.count_seconds() else 0


// Handle missing values in arithmetic
loss_rate = (packets_sent - packets_received) / packets_sent else 0


// Compute only when both values exist
throughput = (bytes_sent + bytes_received) / duration.count_seconds() if bytes_sent != null else null


// Complex calculation with multiple fallbacks
efficiency = (bytes_received / bytes_sent) * 100 if bytes_sent != null else
              100 if bytes_received > 0 else 0
```

```tql
{
  packets_sent: 1000,
  packets_received: 950,
  duration: 10s,
  bytes_sent: null,
  bytes_received: 5000,
  packets_per_second: 100.0,
  loss_rate: 0.05,
  throughput: null,
  efficiency: 100
}
```

## Conditional aggregation patterns

[Section titled “Conditional aggregation patterns”](#conditional-aggregation-patterns)

### Selective data collection

[Section titled “Selective data collection”](#selective-data-collection)

Collect values conditionally during aggregation:

Conditional collection in summarize

```tql
from {src_ip: 10.0.0.5, dst_port: 22, bytes: 1024},
     {src_ip: 192.168.1.10, dst_port: 80, bytes: 2048},
     {src_ip: 10.0.0.5, dst_port: 443, bytes: 4096},
     {src_ip: 192.168.1.10, dst_port: 22, bytes: 512}


let $critical_ports = [22, 3389, 5985]


summarize src_ip,
  total_bytes=sum(bytes),
  // Collect all unique ports
  all_ports=collect(dst_port),
  // Collect with conditional transformation
  port_types=collect("HIGH" if dst_port in $critical_ports else "LOW")
```

```tql
{src_ip: 192.168.1.10, total_bytes: 2560, all_ports: [80, 22], port_types: ["LOW", "HIGH"]}
{src_ip: 10.0.0.5, total_bytes: 5120, all_ports: [22, 443], port_types: ["HIGH", "LOW"]}
```

This pattern enables:

* Building risk profiles during aggregation
* Transforming values during collection based on conditions
* Creating categorical metrics from raw data

## Advanced transformations

[Section titled “Advanced transformations”](#advanced-transformations)

### Recursive flattening

[Section titled “Recursive flattening”](#recursive-flattening)

Flatten arbitrarily nested structures:

```tql
from {
  data: {
    level1: {
      level2: {
        level3: {
          value: "deep",
          items: [1, 2, 3]
        }
      },
      other: "value"
    }
  }
}
// Use flatten function for automatic recursive flattening
select flattened = data.flatten()
```

```tql
{
  flattened: {
    "level1.level2.level3.value": "deep",
    "level1.level2.level3.items": [
      1,
      2,
      3,
    ],
    "level1.other": "value",
  },
}
```

### Extract fields by prefix

[Section titled “Extract fields by prefix”](#extract-fields-by-prefix)

Use field access to extract specific configurations:

```tql
from {
  config: {
    env_DATABASE_HOST: "db.example.com",
    env_DATABASE_PORT: 5432,
    env_API_KEY: "secret123",
    app_name: "MyApp",
    app_version: "1.0"
  }
}
// Extract specific fields directly
select env_vars = {
    DATABASE_HOST: config.env_DATABASE_HOST,
    DATABASE_PORT: config.env_DATABASE_PORT,
    API_KEY: config.env_API_KEY
  },
  app_config = {
    name: config.app_name,
    version: config.app_version
  }
```

```tql
{
  env_vars: {
    DATABASE_HOST: "db.example.com",
    DATABASE_PORT: 5432,
    API_KEY: "secret123",
  },
  app_config: {
    name: "MyApp",
    version: "1.0",
  },
}
```

## Practical examples

[Section titled “Practical examples”](#practical-examples)

### Process nested API responses

[Section titled “Process nested API responses”](#process-nested-api-responses)

```tql
from {
  api_response: {
    status: "success",
    data: {
      user: {
        id: 123,
        profile: {
          personal: {name: "Alice", age: 30},
          professional: {title: "Engineer", company: "TechCorp"}
        }
      },
      metadata: {
        request_id: "req-001",
        timestamp: "2024-01-15T10:00:00"
      }
    }
  }
}
// Extract and reshape for database storage
select user_record = {
  user_id: api_response.data.user.id,
  name: api_response.data.user.profile.personal.name,
  age: api_response.data.user.profile.personal.age,
  job_title: api_response.data.user.profile.professional.title,
  company: api_response.data.user.profile.professional.company,
  last_updated: api_response.data.metadata.timestamp.parse_time("%Y-%m-%dT%H:%M:%S")
}
```

```tql
{
  user_record: {
    user_id: 123,
    name: "Alice",
    age: 30,
    job_title: "Engineer",
    company: "TechCorp",
    last_updated: 2024-01-15T10:00:00Z,
  },
}
```

### Transform log aggregations

[Section titled “Transform log aggregations”](#transform-log-aggregations)

```tql
from {
  log_stats: {
    "2024-01-15": {
      "/api/users": {GET: 150, POST: 20},
      "/api/orders": {GET: 200, POST: 50, DELETE: 5}
    },
    "2024-01-16": {
      "/api/users": {GET: 180, POST: 25},
      "/api/orders": {GET: 220, POST: 60}
    }
  }
}
// Flatten nested structure into individual events
select flattened = log_stats.flatten()
```

```tql
{
  flattened: {
    "2024-01-15./api/users.GET": 150,
    "2024-01-15./api/users.POST": 20,
    "2024-01-15./api/orders.GET": 200,
    "2024-01-15./api/orders.POST": 50,
    "2024-01-15./api/orders.DELETE": 5,
    "2024-01-16./api/users.GET": 180,
    "2024-01-16./api/users.POST": 25,
    "2024-01-16./api/orders.GET": 220,
    "2024-01-16./api/orders.POST": 60,
  },
}
```

## Best practices

[Section titled “Best practices”](#best-practices)

1. **Plan your structure**: Design the target schema before transforming
2. **Handle missing fields**: Use conditional logic or defaults for optional data
3. **Preserve information**: Don’t lose data during transformation unless intentional
4. **Test edge cases**: Verify transformations work with incomplete or unusual data
5. **Document complex logic**: Add comments explaining non-obvious transformations

## Related guides

[Section titled “Related guides”](#related-guides)

* [Transform collections](/guides/data-shaping/transform-collections) - Basic collection operations
* [Extract structured data from text](/guides/data-shaping/extract-structured-data-from-text) - Parse before reshaping
* [Shape data](/guides/data-shaping/shape-data) - Overview of all shaping operations