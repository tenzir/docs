# Size a node

To better understand what resources you need to run a node, we provide guidance on sizing and a [calculator](#calculator) to derive concrete **CPU**, **RAM**, and **storage** requirements.

## Considerations

[Section titled “Considerations”](#considerations)

Several factors have an impact on sizing. Since you can run many types of workloads in pipelines, it is difficult to make a one-size-fits-all recommendation. The following considerations affect your resource requirements:

### Workloads

[Section titled “Workloads”](#workloads)

Depending on what you do with pipelines, you may generate a different resource profile.

#### Data Shaping

[Section titled “Data Shaping”](#data-shaping)

[Shaping](/guides/data-shaping/shape-data) operation changes the form of the data, e.g., filtering events, removing columns, or changing values. This workload predominantly incurs **CPU** load.

#### Aggregation

[Section titled “Aggregation”](#aggregation)

Performing in-stream or historical aggregations often requires extensive buffering of the aggregation groups, which adds to your **RAM** requirements. If you run intricate custom aggregation functions, you also may see an additional increase CPU usage.

#### Enrichment

[Section titled “Enrichment”](#enrichment)

[Enriching](/explanations/enrichment) dataflows with contexts requires holding in-memory state proportional to the context size. Therefore, enrichment affects your **RAM** requirements. Bloom filters are a fixed-size space-efficient structure for representing large sets, and lookup tables grow linearly with the number of entries.

### Data Diversity

[Section titled “Data Diversity”](#data-diversity)

The more data sources you have, the more pipelines you run. In the simplest scenario where you just import all data into a node, you deploy one pipeline per data source. The number of data sources is a thus a lower bound for the number of pipelines.

### Data Volume

[Section titled “Data Volume”](#data-volume)

The throughput of pipeline has an impact on performance. Pipelines with low data volume do not strain the system much, but high-volume pipelines substantially affect **CPU** and **RAM** requirements. Therefore, understanding your ingress volume, either as events per second or bytes per day, is helpful for sizing your node proportionally.

### Retention

[Section titled “Retention”](#retention)

When you leverage the node’s built-in storage engine by [importing](/guides/edge-storage/import-into-a-node) and [exporting](/guides/edge-storage/export-from-a-node) data, you need persistent **storage**. To assess your retention span, you need to understand your data volume and your capacity.

Tenzir storage engine builds sparse indexes to accelerate historical queries. Based on how aggressively configure indexing, your **RAM** requirements may vary.

## Calculator

[Section titled “Calculator”](#calculator)