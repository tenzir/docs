# Aggregate and summarize data

Aggregation transforms streams of events into meaningful summaries. Whether you’re calculating statistics, counting occurrences, or finding extremes, the [`summarize`](/reference/operators/summarize) operator combined with aggregation functions provides powerful data analysis capabilities.

## Understanding the summarize operator

[Section titled “Understanding the summarize operator”](#understanding-the-summarize-operator)

The `summarize` operator groups events and applies aggregation functions. Its syntax is:

```plaintext
summarize <aggregation>, <aggregation>, ..., <group>, <group>, ...
```

Where:

* Aggregations are expressions like [`sum()`](/reference/functions/sum), [`count()`](/reference/functions/count), [`mean()`](/reference/functions/mean), etc.
* Groups are field names to group by

## Basic aggregations

[Section titled “Basic aggregations”](#basic-aggregations)

Start with fundamental aggregation functions on event streams.

### Count events

[Section titled “Count events”](#count-events)

Count total events and unique values with [`count()`](/reference/functions/count) and [`count_distinct()`](/reference/functions/count_distinct):

```tql
from {product: "apple", price: 100, category: "fruit"},
     {product: "banana", price: 250, category: "fruit"},
     {product: "carrot", price: 175, category: "vegetable"},
     {product: "apple", price: 120, category: "fruit"},
     {product: "banana", price: 225, category: "fruit"}
summarize total_count = count(), unique_products = count_distinct(product)
```

```tql
{
  total_count: 5,
  unique_products: 3
}
```

### Sum and average

[Section titled “Sum and average”](#sum-and-average)

Calculate totals and averages:

```tql
from {product: "apple", price: 100, quantity: 2},
     {product: "banana", price: 250, quantity: 1},
     {product: "carrot", price: 175, quantity: 3},
     {product: "apple", price: 120, quantity: 2},
     {product: "banana", price: 225, quantity: 1}
summarize total_revenue = sum(price * quantity), avg_price = mean(price), total_quantity = sum(quantity)
```

```tql
{
  total_revenue: 1440,
  avg_price: 174.0,
  total_quantity: 9
}
```

### Min and max

[Section titled “Min and max”](#min-and-max)

Find extreme values with [`min()`](/reference/functions/min) and [`max()`](/reference/functions/max):

```tql
from {sensor: "A", temperature: 72, timestamp: 2024-01-15T10:00:00},
     {sensor: "B", temperature: 68, timestamp: 2024-01-15T10:05:00},
     {sensor: "A", temperature: 75, timestamp: 2024-01-15T10:10:00},
     {sensor: "B", temperature: 82, timestamp: 2024-01-15T10:15:00},
     {sensor: "A", temperature: 71, timestamp: 2024-01-15T10:20:00}
summarize min_temp = min(temperature), max_temp = max(temperature), earliest = min(timestamp), latest = max(timestamp)
```

```tql
{
  min_temp: 68,
  max_temp: 82,
  earliest: 2024-01-15T10:00:00.000000,
  latest: 2024-01-15T10:20:00.000000
}
```

## Grouping data

[Section titled “Grouping data”](#grouping-data)

Group events by one or more fields to calculate aggregations per group.

### Group by single field

[Section titled “Group by single field”](#group-by-single-field)

Calculate statistics per category:

```tql
from {product: "apple", price: 100, category: "fruit"},
     {product: "banana", price: 250, category: "fruit"},
     {product: "carrot", price: 175, category: "vegetable"},
     {product: "lettuce", price: 125, category: "vegetable"},
     {product: "orange", price: 225, category: "fruit"}
summarize avg_price = mean(price), item_count = count(), category
```

```tql
{
  avg_price: 191.66666666666666,
  item_count: 3,
  category: "fruit",
}
{
  avg_price: 150.0,
  item_count: 2,
  category: "vegetable",
}
```

### Group by multiple fields

[Section titled “Group by multiple fields”](#group-by-multiple-fields)

Group by multiple dimensions:

```tql
from {user: "alice", action: "login", duration: 45, date: "2024-01-15"},
     {user: "bob", action: "login", duration: 38, date: "2024-01-15"},
     {user: "alice", action: "view", duration: 12, date: "2024-01-15"},
     {user: "alice", action: "login", duration: 52, date: "2024-01-16"},
     {user: "bob", action: "edit", duration: 89, date: "2024-01-16"}
summarize avg_duration = mean(duration), action_count = count(), user, action
```

```tql
{
  avg_duration: 38.0,
  action_count: 1,
  user: "bob",
  action: "login",
}
{
  avg_duration: 89.0,
  action_count: 1,
  user: "bob",
  action: "edit",
}
{
  avg_duration: 48.5,
  action_count: 2,
  user: "alice",
  action: "login",
}
{
  avg_duration: 12.0,
  action_count: 1,
  user: "alice",
  action: "view",
}
```

## Statistical functions

[Section titled “Statistical functions”](#statistical-functions)

Use statistical aggregation functions for deeper analysis.

### Percentiles and median

[Section titled “Percentiles and median”](#percentiles-and-median)

Calculate distribution statistics with [`quantile()`](/reference/functions/quantile):

```tql
from {endpoint: "/api/users", latency: 120},
     {endpoint: "/api/users", latency: 135},
     {endpoint: "/api/users", latency: 110},
     {endpoint: "/api/orders", latency: 245},
     {endpoint: "/api/orders", latency: 225},
     {endpoint: "/api/orders", latency: 280}
summarize p50 = quantile(latency, q=0.5),
          p90 = quantile(latency, q=0.9),
          p95 = quantile(latency, q=0.95),
          endpoint
```

```tql
{
  p50: 245.0,
  p90: 280.0,
  p95: 280.0,
  endpoint: "/api/orders",
}
{
  p50: 120.0,
  p90: 135.0,
  p95: 135.0,
  endpoint: "/api/users",
}
```

### Standard deviation and variance

[Section titled “Standard deviation and variance”](#standard-deviation-and-variance)

Measure data spread with [`stddev()`](/reference/functions/stddev) and [`variance()`](/reference/functions/variance):

```tql
from {server: "web1", cpu: 45},
     {server: "web1", cpu: 52},
     {server: "web1", cpu: 48},
     {server: "web2", cpu: 85},
     {server: "web2", cpu: 92},
     {server: "web2", cpu: 88}
summarize avg_cpu = mean(cpu),
          cpu_stddev = stddev(cpu),
          cpu_variance = variance(cpu),
          server
```

```tql
{
  avg_cpu: 48.333333333333336,
  cpu_stddev: 2.8674417556808622,
  cpu_variance: 8.222222222222145,
  server: "web1",
}
{
  avg_cpu: 88.33333333333333,
  cpu_stddev: 2.8674417556810217,
  cpu_variance: 8.22222222222306,
  server: "web2",
}
```

### Mode and distinct values

[Section titled “Mode and distinct values”](#mode-and-distinct-values)

Find most common values and collect unique values with [`mode()`](/reference/functions/mode), [`distinct()`](/reference/functions/distinct), and [`count_if()`](/reference/functions/count_if):

```tql
from {user: "alice", browser: "chrome", action: "login"},
     {user: "bob", browser: "firefox", action: "view"},
     {user: "alice", browser: "chrome", action: "edit"},
     {user: "charlie", browser: "chrome", action: "login"},
     {user: "alice", browser: "safari", action: "login"}
summarize most_common_browser = mode(browser),
          unique_browsers = distinct(browser),
          login_count = count_if(action, x => x == "login")
```

```tql
{
  most_common_browser: "chrome",
  unique_browsers: [
    "chrome",
    "firefox",
    "safari",
  ],
  login_count: 3,
}
```

### Value frequencies and entropy

[Section titled “Value frequencies and entropy”](#value-frequencies-and-entropy)

Analyze value distributions with [`value_counts()`](/reference/functions/value_counts) and [`entropy()`](/reference/functions/entropy):

```tql
from {category: "A", value: 10},
     {category: "B", value: 20},
     {category: "A", value: 15},
     {category: "B", value: 25},
     {category: "C", value: 30}
summarize frequencies = value_counts(category),
          info_entropy = entropy(category)
```

```tql
{
  frequencies: [
    {
      value: "A",
      count: 2,
    },
    {
      value: "B",
      count: 2,
    },
    {
      value: "C",
      count: 1,
    },
  ],
  info_entropy: 1.0549201679861442,
}
```

## Collecting values

[Section titled “Collecting values”](#collecting-values)

Use [`collect()`](/reference/functions/collect) and [`distinct()`](/reference/functions/distinct) to gather values:

```tql
from {user: "alice", action: "login", timestamp: 2024-01-15T10:00:00},
     {user: "bob", action: "view", timestamp: 2024-01-15T10:01:00},
     {user: "alice", action: "edit", timestamp: 2024-01-15T10:02:00},
     {user: "charlie", action: "login", timestamp: 2024-01-15T10:03:00},
     {user: "alice", action: "logout", timestamp: 2024-01-15T10:04:00}
summarize all_actions = collect(action),
          unique_users = distinct(user),
          event_count = count()
```

```tql
{
  all_actions: [
    "login",
    "view",
    "edit",
    "login",
    "logout",
  ],
  unique_users: [
    "alice",
    "charlie",
    "bob",
  ],
  event_count: 5,
}
```

### First and last values

[Section titled “First and last values”](#first-and-last-values)

Get boundary values with [`first()`](/reference/functions/first) and [`last()`](/reference/functions/last):

```tql
from {sensor: "temp1", reading: 72, time: 2024-01-15T09:00:00},
     {sensor: "temp1", reading: 75, time: 2024-01-15T10:00:00},
     {sensor: "temp1", reading: 78, time: 2024-01-15T11:00:00},
     {sensor: "temp2", reading: 68, time: 2024-01-15T09:00:00},
     {sensor: "temp2", reading: 71, time: 2024-01-15T10:00:00}
summarize first_reading = first(reading),
          last_reading = last(reading),
          avg_reading = mean(reading),
          sensor
```

```tql
{
  first_reading: 72,
  last_reading: 78,
  avg_reading: 75.0,
  sensor: "temp1",
}
{
  first_reading: 68,
  last_reading: 71,
  avg_reading: 69.5,
  sensor: "temp2",
}
```

## Boolean aggregations

[Section titled “Boolean aggregations”](#boolean-aggregations)

Use [`all()`](/reference/functions/all) and [`any()`](/reference/functions/any) for boolean checks:

```tql
from {test: "unit", passed: true, duration: 45},
     {test: "integration", passed: true, duration: 120},
     {test: "e2e", passed: false, duration: 300},
     {test: "performance", passed: true, duration: 180}
summarize all_passed = all(passed),
          any_failed = any(not passed),
          total_duration = sum(duration)
```

```tql
{
  all_passed: false,
  any_failed: true,
  total_duration: 645
}
```

## Practical examples

[Section titled “Practical examples”](#practical-examples)

### Analyze API response times

[Section titled “Analyze API response times”](#analyze-api-response-times)

```tql
from {
  requests: [
    {endpoint: "/api/users", method: "GET", duration: 45, status: 200},
    {endpoint: "/api/users", method: "POST", duration: 120, status: 201},
    {endpoint: "/api/orders", method: "GET", duration: 89, status: 200},
    {endpoint: "/api/users", method: "GET", duration: 38, status: 200},
    {endpoint: "/api/orders", method: "GET", duration: 156, status: 500}
  ]
}
unroll requests
summarize endpoint=requests.endpoint,
          count=count(),
          avg_duration=mean(requests.duration)
```

```tql
{
  endpoint: "/api/orders",
  count: 2,
  avg_duration: 122.5,
}
{
  endpoint: "/api/users",
  count: 3,
  avg_duration: 67.66666666666667,
}
```

### Calculate sales metrics

[Section titled “Calculate sales metrics”](#calculate-sales-metrics)

```tql
from {
  sales: [
    {date: "2024-01-01", amount: 1200, region: "North"},
    {date: "2024-01-01", amount: 800, region: "South"},
    {date: "2024-01-02", amount: 1500, region: "North"},
    {date: "2024-01-02", amount: 950, region: "South"},
    {date: "2024-01-03", amount: 1100, region: "North"}
  ]
}
// Calculate totals by date
unroll sales
summarize date=sales.date, total=sum(sales.amount)
```

```tql
{date: "2024-01-01", total: 2000}
{date: "2024-01-02", total: 2450}
{date: "2024-01-03", total: 1100}
```

### Monitor system health

[Section titled “Monitor system health”](#monitor-system-health)

```tql
from {
  metrics: [
    {timestamp: "10:00", cpu: 45, memory: 62, disk: 78},
    {timestamp: "10:01", cpu: 52, memory: 64, disk: 78},
    {timestamp: "10:02", cpu: 89, memory: 71, disk: 79},
    {timestamp: "10:03", cpu: 67, memory: 68, disk: 79},
    {timestamp: "10:04", cpu: 48, memory: 65, disk: 80}
  ]
}
cpu_alert = metrics.map(m => m.cpu > 80).any()
avg_memory = metrics.map(m => m.memory).mean()
disk_trend = metrics.last().disk - metrics.first().disk
health_summary = {
  cpu_max: metrics.map(m => m.cpu).max(),
  memory_avg: avg_memory,
  disk_growth: disk_trend,
  critical: cpu_alert
}
```

```tql
{
  metrics: [ ... ],
  cpu_alert: true,
  avg_memory: 66.0,
  disk_trend: 2,
  health_summary: {
    cpu_max: 89,
    memory_avg: 66.0,
    disk_growth: 2,
    critical: true,
  },
}
```

## Complex aggregations

[Section titled “Complex aggregations”](#complex-aggregations)

Combine multiple aggregation functions for comprehensive analysis:

```tql
from {method: "GET", endpoint: "/api/users", status: 200, duration: 45},
     {method: "POST", endpoint: "/api/users", status: 201, duration: 120},
     {method: "GET", endpoint: "/api/orders", status: 200, duration: 89},
     {method: "GET", endpoint: "/api/users", status: 200, duration: 38},
     {method: "GET", endpoint: "/api/orders", status: 500, duration: 156},
     {method: "DELETE", endpoint: "/api/users/123", status: 204, duration: 67}
summarize request_count = count(),
          avg_duration = mean(duration),
          error_count = count_if(status, s => s >= 400),
          unique_endpoints = count_distinct(endpoint),
          method
error_rate = error_count / request_count
```

```tql
{
  request_count: 1,
  avg_duration: 120.0,
  error_count: 0,
  unique_endpoints: 1,
  method: "POST",
  error_rate: 0.0,
}
{
  request_count: 1,
  avg_duration: 67.0,
  error_count: 0,
  unique_endpoints: 1,
  method: "DELETE",
  error_rate: 0.0,
}
{
  request_count: 4,
  avg_duration: 82.0,
  error_count: 1,
  unique_endpoints: 2,
  method: "GET",
  error_rate: 0.25,
}
```

## Best practices

[Section titled “Best practices”](#best-practices)

1. **Choose appropriate functions**: Use `mean()` for averages, `median()` for skewed data
2. **Handle empty collections**: Check if lists are empty before aggregating
3. **Consider memory usage**: Large collections can consume significant memory
4. **Combine aggregations**: Calculate multiple statistics in one pass for efficiency

## Related guides

[Section titled “Related guides”](#related-guides)

* [Transform collections](/guides/data-shaping/transform-collections) - Work with lists and records
* [Filter and select data](/guides/data-shaping/filter-and-select-data) - Filter before aggregating
* [Shape data](/guides/data-shaping/shape-data) - Overview of all shaping operations