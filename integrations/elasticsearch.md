# Elasticsearch

[Elasticsearch](https://www.elastic.co/elasticsearch) is a search and observability suite for unstructured data. Tenzir can send events to Elasticsearch and emulate and Elasticsearch Bulk API endpoint.

![How to send and receive data](/_astro/elasticsearch.G89ivtEj_19DKCs.svg)

When sending data to Elasticsearch, Tenzir uses the [Bulk API](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-bulk.html) and attempts to maximally batch events for throughput, accumulating multiple events before shipping them within a single API call. You can control batching behavior with the `max_content_length` and `send_timeout` options.

For more details, see the documentation for the [`to_opensearch`](/reference/operators/to_opensearch) operator.

Tenzir can also present an Elasticsearch-compatible REST API via the [`from_opensearch`](/reference/operators/from_opensearch) operator.

## Examples

### Send events to an Elasticsearch index

Send an example event to the `main` index:

```tql
from {event: "example"}
to "elasticsearch://1.2.3.4:9200", action="create", index="main"
```

Instead of treating the entire event as document to be indexed by Elasticsearch, you can designate a nested record as document:

```tql
from {category: "qux", doc_id: "XXX", event: {foo: "bar"}}
to "elasticsearch://localhost:9200", id=doc_id, doc=event, action="update", index=category
```

The above example updates the document with ID `XXX` with the contents from the nested field `event`.

### Accept data by emulating Elasticsearch

Tenzir can act as drop-in replacement for Elasticsearch by accepting data via a Bulk API endpoint. This allows you to point your [Logstash](https://www.elastic.co/logstash) or Beats instances to Tenzir instead.

```tql
from "elasticsearch://localhost:9200", keep_actions=true
publish "elasticsearch"
```

This pipeline accepts data on port 9200 and publishes all received events on the

`elasticsearch` topic for further processing by other pipelines.

Setting `keep_actions=true` causes command events to remain in the stream, e.g., like this:

```tql
{create:{_index:"filebeat-8.17.3"}} // 👈 command event
{"@timestamp":2025-03-31T13:42:28.068Z,log:{offset:1,file:{path:"/mounted/logfile"}},message:"hello",input:{type:"log"},host:{name:"eb21"},agent:{id:"682cfcf4-f251-4576-abcb-6c8bcadfda08",name:"eb21",type:"filebeat",version:"8.17.3",ephemeral_id:"17f74f6e-36f0-4045-93e6-c549874716df"},ecs:{version:"8.0.0"}}
{create:{_index:"filebeat-8.17.3"}} // 👈 command event
{"@timestamp":2025-03-31T13:42:28.068Z,log:{offset:7,file:{path:"/mounted/logfile"}},message:"this",input:{type:"log"},host:{name:"eb21"},agent:{id:"682cfcf4-f251-4576-abcb-6c8bcadfda08",name:"eb21",type:"filebeat",version:"8.17.3",ephemeral_id:"17f74f6e-36f0-4045-93e6-c549874716df"},ecs:{version:"8.0.0"}}
```

#### Ship data via Filebeat

Configure [Filebeat](https://www.elastic.co/beats/filebeat) as follows to ship data to Tenzir:

filebeat.yml

```yaml
output:
  elasticsearch:
  hosts: ["localhost:9200"]
```

Set `hosts` to the endpoint of the Tenzir pipeline accepting data.

#### Ship data via Logstash

Configure [Logstash](https://www.elastic.co/guide/en/logstash/current/plugins-outputs-elasticsearch.html) with the

`elasticsearch` output plugin to ship data to Tenzir:

pipeline.conf

```javascript
output {
  elasticsearch {
    hosts => "https://localhost:9200"
  }
}
```

Set `hosts` to the endpoint of the Tenzir pipeline accepting data.