# Overview

A Tenzir **integration** is a specific way to integrate with a third-party tool or technology.

All integrations rely on [pipelines](/explanations/architecture/pipeline) in some form. For some applications, there exist *dedicated* operators, e.g., the [Splunk](/integrations/splunk) integration using the [`to_splunk`](/reference/operators/to_splunk) output operator. Integrating with other applications means merely using an existing *generic* operator, such as the [`http`](/reference/operators/http) operator to [fetch data from APIs](/guides/data-loading/fetch-data-from-apis).

Often, integrations with tools end up as a parameterizable [package](/explanations/packages) in our freely available [library on GitHub](https://github.com/tenzir/library). In particular, packages can also provide [enrichment contexts](/explanations/enrichment/) and accompanying pipelines that periodically load external data into the context. Several packages that provide threat intelligence feeds in our library follow this pattern.

![Integrations](/pr-preview/pr-116/_astro/integrations.COlNcjp-_19DKCs.svg)