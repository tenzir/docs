# Pipeline

A Tenzir **pipeline** is a chain of **operators** that represents a dataflow. Operators are the atomic building blocks that produce, transform, or consume data. Think of them as Unix or Powershell commands where the result from one command is feeding into the next:

![Pipeline Chaining](/_astro/operator-chaining.CjiL40XZ_19DKCs.svg)

Our pipelines have 3 types of operators: **inputs** that produce data, **outputs** that consume data, and **transformations** that do both:

![Pipeline Structure](/_astro/operator-types.B4v1eusl_19DKCs.svg)

You write pipelines in the [Tenzir Query Language (TQL)](/explanations/language), a language that we developed from the ground up to concisely describe such dataflows.

Learn TQL

Head over to our [language documentation](/explanations/language) for an in-depth explanation of how TQL works. We’re continuing here with high-level architectural aspects of the pipeline execution model.

## Typed Operators

[Section titled “Typed Operators”](#typed-operators)

Tenzir pipelines operate both ond unstructured stream of bytes and typed event streams. The execution model ensures type safety while maintaining high performance through batching and parallel processing.

An operator has an **upstream** and **downstream** type:

![Upstream and Downstream Types](/_astro/operator-table.ChkIKyOz_19DKCs.svg)

This typing ensures pipelines are well-formed. Adjacent operators must have matching types: the downstream type of one operator must match the upstream type of the next, i.e., upstream/downstream types of adjacent operators have to match. Otherwise the pipeline is malformed.

With these operators as building blocks, you can create all kinds of pipelines, as long as they follow the two principal rules of (1) sequencing inputs, transformations, and outputs, and (2) ensuring that operator upstream/downstream types match. Here are examples of other valid pipeline variations:

![Operator Composition Examples](/_astro/operator-composition-variations.8EYlYgMP_19DKCs.svg)

## Multi-Schema Dataflows

[Section titled “Multi-Schema Dataflows”](#multi-schema-dataflows)

As mentioned above, pipelines can transport both *bytes* and *events*. Let’s go deeper into the details of Tenzir represents events. Every event that flows through a pipeline is part of a *data frame* with a schema. Internally, these data frames are represented as Apache Arrow record batches, encoding potentially of tens of thousands of events in a single block of data. This innate batching is the reason why the pipelines can achieve high throughput.

Unique about Tenzir’s pipeline executor is that a single pipeline can process events with *multiple schemas*. When you typically work with data frames, your workload runs on input with a fixed schema, e.g., when you query a database table. In Tenzir, schemas can change dynamically during the execution of a pipeline, much like document-oriented engines that work on JSON or have one-event-at-a-time processing semantics. Tenzir is unique in that it gives the user the feeling of operating on a single event at a time while hiding the structured data frame batching behind the scenes. Thus, Tenzir combines the performance of structured query engines with the flexibility of document-oriented engines, making it perfect fit for processing *semi-structured data* at scale:

![Structured vs document-oriented engines](/_astro/document-vs-structured.y0QQZq3T_19DKCs.svg)

The schema variance begins early in the data flow, where parsers emit events with changing schemas as they encounter changing fields. If an operator detects a schema changes, it creates a new batch of events. In terms of performance, the worst case for Tenzir is a ordered stream of schema-switching events, with every event having a new schema than the previous one. But even for those scenarios operators can efficiently build homogeneous batches when the inter-event order does not matter. Similar to predicate pushdown, Tenzir operators support *ordering pushdown* to signal to upstream operators that the event order only matters intra-schema but not inter-schema. In this case the operator transparently “demultiplex” a heterogeneous event stream into N homogeneous streams. The [`sort`](/reference/operators/sort) operator is an example of such an operator; it pushes its ordering requirements upstream, allowing parsers to efficiently create multiple streams events in parallel.

![Multi-schema Example](/_astro/multi-schema-example.Ddg0yxO5_19DKCs.svg)

Some operators only work with exactly one instance per schema internally, such as [`write_csv`](/reference/operators/write_csv), which first writes a header and then all subsequent rows have to adhere to the emitted schema. Such operators cannot handle events with changing schemas.

It’s important to mention that most of the time you don’t have to worry about schemas. They are there for you when you want to work with them, but it’s often enough to just specified the fields that you want to work with, e.g., `where id.orig_h in 10.0.0.0/8`, or `select src_ip, dest_ip, proto`. Schemas are inferred automatically in parsers, but you can also seed a parser with a schema that you define explicitly.

## Unified Live Stream Processing and Historical Queries

[Section titled “Unified Live Stream Processing and Historical Queries”](#unified-live-stream-processing-and-historical-queries)

Tenzir’s execution engine transparently processes both historical data and real-time event streams within a single, unified pipeline model. [TQL](/explanations/language) empowers you to switch between these workloads by simply changing the data source at the start of your pipeline.

![Unified Processing](/_astro/unified-processing.l9So0oFr_19DKCs.svg)

This design lets you reuse the same logic for exploring existing data and for deploying it on live streams, which streamlines the entire analytics workflow.

Each Tenzir Node includes a lightweight **edge storage** engine for efficient local data persistence. You interact with this storage engine using just two dedicated operators to store and retrieve data. The retrievial goes much beyond replay.

A naive interpretation would be that [`export`](/reference/operators/export) first retrieves all its data, which subsequent operators then filter. However, Tenzir actively optimizes this process using **predicate pushdown**. Before a pipeline runs, Tenzir pushes filter conditions from later stages down to the initial storage source. This allows the source to intelligently fetch only the necessary data, often using fast index lookups and avoiding costly full scans.

Tenzir’s unique edge storage engine enables this powerful optimization. The diagram below illustrates how the engine works:

![Database Architecture](/_astro/storage-engine-architecture.DQ2lar3W_19DKCs.svg)

The edge storage engine is not a traditional database but a lightweight **catalog** that maintains a thin indexing layer over immutable Apache Parquet and Feather files. It maintains **sparse indexes**, such as min-max synopses and Bloom filters, that act as a table of contents. These indexes allow the engine to quickly rule out data partitions that do not match a query’s filter, avoiding unnecessary scans. The catalog also tracks evolving schemas and provides a transactional interface for partition operations.

Because the engine handles these optimizations automatically, the same pipeline logic can be seamlessly repurposed. A pipeline developed for historical analysis can be deployed on a live data stream by simply exchanging the historical data source for a streaming one. This unified model streamlines the path from interactive exploration to production deployment.

Federated Search

The Tenzir pipeline execution engine leverages powerful optimizations, such as predicate, limit, and ordering pushdowns. These optimizations are propagated to any pipeline source, including operators that fetch data from remote storage layers, databases, or SIEMs. This process enables efficient **federated search** across distributed systems and is a transparent, fundamental capability of the engine.