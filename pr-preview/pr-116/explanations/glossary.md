# Glossary

This page defines central terms in the Tenzir ecosystem.

Missing term?

If you are missing a term, please open a [GitHub Discussion](https://github.com/orgs/tenzir/discussions/new?category=questions-answers) or ping us in our [Discord server](/discord).

## App

[Section titled “App”](#app)

Web user interface to access [platform](#platform) at [app.tenzir.com](https://app.tenzir.com).

The app is a web application that partially runs in the user’s browser. It is written in [Svelte](https://svelte.dev/).

## Catalog

[Section titled “Catalog”](#catalog)

Maintains [partition](#partition) ownership and metadata.

The catalog is a component in the [node](#node) that owns the [partitions](#partition), keeps metadata about them, and maintains a set of sparse secondary indexes to identify relevant partitions for a given query. It offers a transactional interface for adding and removing partitions.

## Connector

[Section titled “Connector”](#connector)

Manages chunks of raw bytes by interacting with a resource.

A connector is either a *loader* that acquires bytes from a resource, or a *saver* that sends bytes to a resource. Loaders are implemented as ordinary [operators](/reference/operators) prefixed with `load_*` while savers are prefixed with `save_*`.

## Context

[Section titled “Context”](#context)

A stateful object used for in-band enrichment.

Contexts come in various types, such as a lookup table, Bloom filter, and GeoIP database. They live inside a node and you can enrich with them in other pipelines.

* Read more about [enrichment](/explanations/enrichment)

## Destination

[Section titled “Destination”](#destination)

An pipeline ending with an [output](#output) operator preceded by a [`subscribe`](/reference/operators/subscribe) input operator.

* Learn more about [pipelines](/explanations/architecture/pipeline)

## Edge Storage

[Section titled “Edge Storage”](#edge-storage)

The indexed storage that pipelines can use at the [node](#node). Every node has a light-weight storage engine for importing and exporting events. You must mount the storage into the node such that it can be used from [pipelines](#pipeline) using the [`import`](/reference/operators/import) and [`export`](/reference/operators/export) [operators](#operator). The storage cengine comes with a [catalog](#catalog) that tracks [partitions](#partition) and keeps sparse [indexes](#index) to accelerate historical queries.

* [Ingest data into the node’s edge storage](/guides/edge-storage/import-into-a-node)
* [Query the node’s edge storage](/guides/edge-storage/export-from-a-node)

## Event

[Section titled “Event”](#event)

A record of typed data. Think of events as JSON objects, but with a richer [type system](/explanations/language/types) that also has timestamps, durations, IP addresses, and more. Events have fields and can contain numerous shapes that describe its types (= the [schema](#schema)).

* Learn more about [pipelines](/explanations/architecture/pipeline)

## Format

[Section titled “Format”](#format)

Translates between bytes and events.

A format is either supported by a *parser* that converts bytes to events, or a *printer* that converts events to bytes. Example formats are JSON, CEF, or PCAP.

* See available [operators for parsing](/reference/operators#parsing)
* See available [operators for printing](/reference/operators#printing)
* See available [functions for parsing](/reference/functions#parsing)
* See available [functions for printing](/reference/functions#printing)

## Function

[Section titled “Function”](#function)

Computes something over a value in an [event](#event). Unlike operators that work on streams of events, functions can only act on single values.

* See available [functions](/reference/functions)

## Index

[Section titled “Index”](#index)

Optional data structures for accelerating queries involving the node’s [edge storage](#edge-storage).

Tenzir featres in-memory *sparse* indexes that point to [partitions](#partition).

* [Configure the catalog](/guides/node-setup/tune-performance#configure-the-catalog)

## Input

[Section titled “Input”](#input)

An [operator](#operator) that only producing data, without consuming anything.

* Learn more about [pipelines](/explanations/architecture/pipeline)

## Integration

[Section titled “Integration”](#integration)

A set of pipelines to integrate with a third-party product.

An integration describes use cases in combination with a specific product or tool. Based on the depth of the configuration, this may require configuration on either end.

* List of [all integrations](/integrations)
* [Does Tenzir have an integration for *X*?](/explanations/faqs#do-you-have-an-integration-for-x)

## Library

[Section titled “Library”](#library)

A collection of [packages](#package).

Our community library is [freely available at GitHub](https://github.com/tenzir/library).

## Loader

[Section titled “Loader”](#loader)

A connector that acquires bytes.

A loader is the dual to a [saver](#saver). It has a no input and only performs a side effect that acquires bytes. Use a loader implicitly with the [`from`](/reference/operators/from) operator or explicitly with the `load_*` operators.

* Learn more about [pipelines](/explanations/architecture/pipeline)

## Node

[Section titled “Node”](#node)

A host for [pipelines](#pipeline) and storage reachable over the network.

The `tenzir-node` binary starts a node in a dedicated server process that listens on TCP port 5158.

* [Deploy a node](/guides/node-setup/provision-a-node)
* Use the [REST API](/reference/node/api) to manage a node
* [Import into a node](/guides/edge-storage/import-into-a-node)
* [Export from a node](/guides/edge-storage/export-from-a-node)

## Metrics

[Section titled “Metrics”](#metrics)

Runtime statistics about the node and pipeline execution.

* [Collect metrics](/guides/basic-usage/collect-metrics)

## OCSF

[Section titled “OCSF”](#ocsf)

The [Open Cybersecurity Schema Framework (OCSF)](https://schema.ocsf.io) is a cross-vendor schema for security event data. Our [community library](#library) contains packages that map data sources to OCSF.

* [Map data to OCSF](/tutorials/map-data-to-ocsf)

## Operator

[Section titled “Operator”](#operator)

The building block of a [pipeline](#pipeline).

An operator is an [input](#input), a [transformation](#transformation), or an [output](#output).

* See all available [operators](/reference/operators)

## Output

[Section titled “Output”](#output)

An [operator](#operator) consuming data, without producing anything.

* Learn more about [pipelines](/explanations/architecture/pipeline)

## PaC

[Section titled “PaC”](#pac)

The acronym PaC stands for *Pipelines as Code*. It is meant as an adaptation of [Infrastructure as Code (IaC)](https://en.wikipedia.org/wiki/Infrastructure_as_code) with pipelines represent the (data) infrastructure that is provisioning as code.

* Learn how to provision [piplines as code](/guides/basic-usage/run-pipelines#as-code).

## Package

[Section titled “Package”](#package)

A collection of [pipelines](#pipeline) and [contexts](#context).

* Read more about [packages](/explanations/packages)
* [Learn how to write a package](/tutorials/write-a-package)

## Parser

[Section titled “Parser”](#parser)

A bytes-to-events operator.

A parser is the dual to a [printer](#printer). You use a parser implicitly in the [`from`](/reference/operators/from) operator, or via the `read_*` operators. There exist also [functions](#function) for applying parsers to string values.

* Learn more about [pipelines](/explanations/architecture/pipeline)
* See available [operators for parsing](/reference/operators#parsing)
* See available [functions for parsing](/reference/functions#parsing)

## Partition

[Section titled “Partition”](#partition)

The horizontal scaling unit of the storage attached to a [node](#node).

A partition contains the raw data and optionally a set of indexes. Supported formats are [Parquet](https://parquet.apache.org) or [Feather](https://arrow.apache.org/docs/python/feather.html).

## Pipeline

[Section titled “Pipeline”](#pipeline)

Combines a set of [operators](#operator) into a dataflow graph.

* Learn more about [pipelines](/explanations/architecture/pipeline)
* [Run a pipeline](/guides/basic-usage/run-pipelines)

## Platform

[Section titled “Platform”](#platform)

The control plane for nodes and pipelines, accessible at [app.tenzir.com](https://app.tenzir.com).

* Understand the [Tenzir architecture](/explanations/architecture)

## Printer

[Section titled “Printer”](#printer)

An events-to-bytes operator.

A [format](#format) that translates events into bytes.

A printer is the dual to a [parser](#parser). Use a parser implicitly in the [`to`](/reference/operators/to) operator.

* Learn more about [pipelines](/explanations/architecture/pipeline)
* See available [operators for printing](/reference/operators#printing)
* See available [functions for printing](/reference/functions#printing)

## Saver

[Section titled “Saver”](#saver)

A [connector](#connector) that emits bytes.

A saver is the dual to a [loader](#loader). It has a no output and only performs a side effect that emits bytes. Use a saver implicitly with the [`to`](/reference/operators/to) operator or explicitly with the `save_*` operators.

* Learn more about [pipelines](/explanations/architecture/pipeline)

## Schema

[Section titled “Schema”](#schema)

A top-level record type of an event.

* [Show available schemas in the edge storage](/guides/edge-storage/show-available-schemas)

## Source

[Section titled “Source”](#source)

An pipeline starting with an [input](#input) operator followed by a [`publish`](/reference/operators/publish) output operator.

* Learn more about [pipelines](/explanations/architecture/pipeline)

## TQL

[Section titled “TQL”](#tql)

An acronym for *Tenzir Query Language*.

TQL is the language in which users write [pipelines](#pipeline).

* Learn more about the [language](/explanations/language)

## Transformation

[Section titled “Transformation”](#transformation)

An [operator](#operator) consuming both input and producing output.

* Learn more about [pipelines](/explanations/architecture/pipeline)