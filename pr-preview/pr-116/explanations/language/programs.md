# Programs

TQL **programs** compose [statements](/explanations/language/statements) into complete data processing workflows that can execute. Valid TQL programs adhere to the following rules:

1. Adjacent operators must have identical types.
2. A pipeline must be **closed**, i.e., begin with void input and end with void output.

Pipeline Auto-Completion

When a pipeline is not closed, Tenzir attempts to *auto-complete* it. On the [command line](/guides/basic-usage/run-pipelines/#on-the-command-line), it suffices to write a sequence of transformations because Tenzir automatically adds a JSON input operator at the beginning and TQL output operator at the end. In the [web inteface](/guides/basic-usage/run-pipelines/#in-the-platform), auto-completetion takes place with an output operator: The web app appends [`serve`](/reference/operators/serve) to turn the dataflow into a REST API, allowing your browser to access it by routing the data through the platform.

## Statement chaining

[Section titled “Statement chaining”](#statement-chaining)

You chain statements with either a newline (`\n`) or pipe symbol (`|`). We purposefully offer choice to cater to two primary styles:

1. Vertical structuring with newlines for full-text editing
2. Horizontal inline pipe composition for command-line usage

Prefer the vertical approach for readability in files and documentation. Throughout this documentation, we only use the vertical style for clarity and consistency.

Let’s juxtapose the two styles. Here’s a vertical TQL program:

```tql
let $ports = [22, 443]


from_file "/tmp/logs.json"
where port in $ports
select src_ip, dst_ip, bytes
summarize src_ip, total=sum(bytes)
```

And here a horziontal one:

```tql
let $ports = [22, 443] | from "/tmp/logs.json" | where port in $ports | select src_ip, dst_ip, bytes | summarize src_ip, total=sum(bytes)
```

In theory, you can combine pipes and newlines to write programs that resemble Kusto and similar languages. However, we discourage this practice because it can make the code harder to read and maintainespecially when adding nested pipelines that increase the level of indentation.

## Diagnostics

[Section titled “Diagnostics”](#diagnostics)

TQL’s diagnostic system is designed to give you insights into what happens during data processing. There exist two types of diagnostics:

1. **Errors**: Stop pipeline execution immediately (critical failures)
2. **Warnings**: Signal data quality issues but continue processing

When a pipeline emits an error, it stops execution. Unless you configured the pipeline to restart on error, it now requires human intervention to resolve the issue and resume execution.

Warnings do not cause a screeching halt of the pipeline. They are useful for identifying potential issues that may impact the quality of the processed data, such as missing or unexpected values.

Best Practices

We have a dedicated [section on warnings and errors](/tutorials/learn-idiomatic-tql/#data-quality) in our [learning idiomatic TQL tutorial](/tutorials/learn-idiomatic-tql).

## Pipeline nesting

[Section titled “Pipeline nesting”](#pipeline-nesting)

Operators can contain entire subpipelines that execute based on the operator’s semantics. For example, the [`every`](/reference/operators/every) operator executes its subpipeline at regular intervals:

```tql
every 1h {
  from_http "api.example.com"
  select domain, risk
  context::update "domains", key=domain, value=risk
}
```

You define subpipelines syntactically within a block of curly braces (`{}`).

Some operators require that you define a closed (void-to-void) pipeline, whereas others exhibit parsing (bytes-to-events) or printing (events-to-bytes) semantics.

## Comments

[Section titled “Comments”](#comments)

Comments make implicit choices and assumptions explicit. They have no semantic effect and the compiler ignores them during parsing.

TQL features C-style comments, both single and multi-line.

### Single-line comments

[Section titled “Single-line comments”](#single-line-comments)

Use a double slash (`//`) to comment until the end of the line.

Here’s an example where a comment spans a full line:

```tql
// the app only supports lower-case user names
let $user = "jane"
```

Here’s an example where a comment starts in the middle of a line:

```tql
let $users = [
  "jane", // NB: also admin!
  "john", // Been here since day 1.
]
```

### Multi-line comments

[Section titled “Multi-line comments”](#multi-line-comments)

Use a slash-star (`/*`) to start a multi-line comment and a star-slash (`*/`) to end it.

Here’s an example where a comment spans multiple lines:

```tql
/*
 * User validation logic
 * ---------------------
 * Validate user input against a set of rules.
 * If any rule fails, the user is rejected.
 * If all rules pass, the user is accepted.
 */
let $user = "jane"
```

## Execution Model

[Section titled “Execution Model”](#execution-model)

TQL pipelines execute on a streaming engine that processes data incrementally. Understanding the execution model helps you write efficient pipelines and predict performance characteristics.

Key execution principles:

* **Stream processing by default**: Data flows through operators as it arrives
* **Lazy evaluation**: Operations execute only when data flows through them
* **Back-pressure handling**: Automatic flow control prevents memory exhaustion
* **Network transparency**: Pipelines can span multiple nodes seamlessly

### Streaming vs blocking

[Section titled “Streaming vs blocking”](#streaming-vs-blocking)

Understanding operator behavior helps write efficient pipelines:

**Streaming operators** process events incrementally:

* [`where`](/reference/operators/where): Filters one event at a time
* [`select`](/reference/operators/select): Transforms fields immediately
* [`drop`](/reference/operators/drop): Removes fields as events flow

**Blocking operators** need all input before producing output:

* [`sort`](/reference/operators/sort): Must see all events to order them
* [`summarize`](/reference/operators/summarize): Aggregates across the entire stream
* [`reverse`](/reference/operators/reverse): Needs complete input to reverse order

 Efficient: streaming operations first:

```tql
from "large_file.json"
where severity == "critical"    // Streaming: reduces data early
select relevant_fields          // Streaming: drops unnecessary data
sort timestamp                  // Blocking: but on reduced dataset
```

L Less efficient: blocking operation on full data:

```tql
from "large_file.json"
sort timestamp                  // Blocking: processes everything
where severity == "critical"    // Then filters
```

### Constant vs runtime evaluation

[Section titled “Constant vs runtime evaluation”](#constant-vs-runtime-evaluation)

Understanding when expressions evaluate helps write efficient pipelines:

Constants: evaluated once at pipeline start

```tql
let $threshold = 1Ki
let $start_time = 2024-01-15T09:00:00  // Would be now() - 1h in real usage
let $config = {
  ports: [80, 443, 8080],
  networks: [10.0.0.0/8, 192.168.0.0/16],
}


// Runtime: evaluated per event
from {bytes: 2Ki, timestamp: 2024-01-15T09:30:00},
     {bytes: 512, timestamp: 2024-01-15T09:45:00},
     {bytes: 3Ki, timestamp: 2024-01-15T10:00:00}
where bytes > $threshold            // Constant comparison
where timestamp > $start_time       // Constant comparison
current_time = 2024-01-15T10:30:00  // Would be now() in real usage
age = current_time - timestamp      // Runtime calculation
```

### Network transparency

[Section titled “Network transparency”](#network-transparency)

TQL pipelines can span network boundaries seamlessly. For example, the [`import`](/reference/operators/import) operator implicitly performs a network connection based on where it runs. If the `tenzir` binary executes the pipeline, the executor establishesa transparent network connection. If the pipeline runs within a node, the executor passes the data directly to the next operator in the same process.