# Tenzir Architecture Overview

Tenzir's architecture has three primary abstractions:

## Pipeline

A sequence of operators that process data. Pipelines are the core mechanism for:

- Loading data from sources (files, APIs, message queues)
- Parsing raw bytes into structured events
- Transforming and enriching events
- Routing data to destinations

Pipelines use TQL (Tenzir Query Language) and follow a dataflow model where
data streams through operators from left to right.

**Key concepts:**

- Operators are connected with `|` (pipe)
- Data flows as batches of events
- Pipelines can be ad-hoc or managed (persistent)

## Node

A running process that manages and executes pipelines. Nodes:

- Run on the edge (your infrastructure)
- Execute pipelines locally
- Store data in a local catalog
- Expose a REST API for control
- Can connect to the platform for centralized management

**Key operations:**

- `import` - Store events in the node
- `export` - Retrieve events from storage
- Pipeline lifecycle management (start, stop, list)

## Platform

A management layer that provides oversight over multiple nodes:

- Web-based UI at app.tenzir.com (or self-hosted)
- User and workspace administration
- Authentication via identity providers
- Dashboards with charts
- Centralized pipeline deployment

**Relationship:**

```
Platform (manages) → Nodes (execute) → Pipelines (process data)
```

## When to Read Full Docs

- Pipeline details: `explanations/architecture/pipeline`
- Node configuration: `explanations/architecture/node`
- Platform setup: `explanations/architecture/platform`
- Deployment guides: `guides/node-setup/`, `guides/platform-setup/`
