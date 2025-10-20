# SentinelOne Data Lake

[SentinelOne](https://www.sentinelone.com) is a cybersecurity platform that provides endpoint protection and threat detection. The SentinelOne [Singularity Data Lake](https://www.sentinelone.com/products/singularity-data-lake/) allows you to store and analyze security events at scale. Tenzir can send structured security events to the SentinelOne Data Lake via its REST API.

![SentinelOne Data Lake](/_astro/sentinelone-data-lake.UmtBpY1y_19DKCs.svg)

The operator provides special handling for OCSF events. If it detects that the input event in OCSF, it will automatically map timestamp and severity fields to the corresponding SentinelOne Data Lake fields.

## Examples

[Section titled “Examples”](#examples)

### Send events to SentinelOne Data Lake

[Section titled “Send events to SentinelOne Data Lake”](#send-events-to-sentinelone-data-lake)

To send events from a pipeline to SentinelOne Data Lake, use the [`to_sentinelone_data_lake`](/reference/operators/to_sentinelone_data_lake) operator:

```tql
subscribe "suricata"
where @name == "suricata.alert"
to_sentinelone_data_lake "https://ingest.eu1.sentinelone.net",
  token=secret("SENTINELONE_TOKEN")
```

Replace `https://ingest.eu1.sentinelone.net` with your conigured SentinelOne Data Lake ingest URL and configure the `SENTINELONE_TOKEN` secret with your bearer token.

### Send events with additional session information

[Section titled “Send events with additional session information”](#send-events-with-additional-session-information)

You can include additional session information that identifies the source of the events:

```tql
subscribe "network-events"
to_sentinelone_data_lake "https://ingest.eu1.sentinelone.net",
  token=secret("SENTINELONE_TOKEN"),
  session_info={
    serverHost: "Tenzir Node 01",
    serverType: "Tenzir Node",
    region: "US East"
  }
```

### Send OCSF events

[Section titled “Send OCSF events”](#send-ocsf-events)

If the datastream input is valid OCSF, the operator will automatically extract timestamp and severity fields and map them to the corresponding SentinelOne Data Lake fields `ts` and `sev`:

```tql
subscribe "ocsf"
where severity_id >= 4  // High and Critical events only
to_sentinelone_data_lake "https://ingest.eu1.sentinelone.net",
  token=secret("SENTINELONE_TOKEN"),
  session_info={serverHost: "Security Gateway"}
```

### Send unstructured data

[Section titled “Send unstructured data”](#send-unstructured-data)

You can also use the operator to send unstructured data and let SentinelOne parse it. Simply give the operator a `message` field as input and specify a `parser` in the `session_info` argument:

```tql
select message = this.print_ndjson();         // Format the entire event as JSON
to_sentinelone_data_lake "https://ingest.eu1.sentinelone.net",
  token=secret("sentinelone-token"),
  session_info={
    serverHost: "Node 42",
    parser: "json",                           // Have SentinelOne parse the data
  }
```

In this example, we are formatting the entire event as JSON and sending it as the message field. The SentinelOne `json` parser will then parse the event again.

Ingest Costs

SentinelOne charges per ingested byte in any value, including the unstructured `message`. This means SentinelOne charges for keys, structural elements and whitespace in `message`.

If you already have structured data in Tenzir, prefer sending structured data. SentinelOne will only charge for the values, one byte per key and nothing for the requests structure.