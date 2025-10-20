# ClickHouse

[ClickHouse](https://clickhouse.com/clickhouse) is an open-source analytical database that enables its users to generate powerful analytics, using SQL queries, in real-time.

![ClickHouse integration](/_astro/clickhouse.DHWXsxpE_19DKCs.svg)

## How Tenzir Connects to ClickHouse

[Section titled “How Tenzir Connects to ClickHouse”](#how-tenzir-connects-to-clickhouse)

Tenzir connects to ClickHouse over the network using the native ClickHouse TCP protocol using the official [clickhouse-cpp](https://github.com/ClickHouse/clickhouse-cpp) library. Tenzir communicates with ClickHouse via the host and port you specify in the [`to_clickhouse`](/reference/operators/to_clickhouse) operator. This means:

* **Network**: Tenzir and ClickHouse can run on the same machine (using `localhost`) or on different machines in the same network. You just need to make sure that Tenzir can reach the ClickHouse server.
* **IPC**: There is no direct inter-process communication (IPC) mechanism; all communication uses ClickHouse’s network protocol.
* **Co-deployment**: For best performance and security, deploy Tenzir and ClickHouse in the same trusted network or use secure tunnels if needed.

## Setting Up ClickHouse

[Section titled “Setting Up ClickHouse”](#setting-up-clickhouse)

To get started with ClickHouse, follow the [official quick start guide](https://clickhouse.com/docs/getting-started/quick-start/oss):

### Native Binary

[Section titled “Native Binary”](#native-binary)

1. Download the binary:

   ```sh
   curl https://clickhouse.com/ | sh
   ```

2. Start the server:

   ```sh
   ./clickhouse server
   ```

   This downloads the ClickHouse binary and starts the server. You can then connect to ClickHouse at `localhost:9000` (native protocol) or `localhost:8123` (HTTP interface).

3. (Optionally) Start CLI client:

   ```sh
   ./clickhouse client
   ```

   With this client, you can now run SQL queries on your ClickHouse server.

### Docker

[Section titled “Docker”](#docker)

1. Run Docker:

   ```sh
   docker run -d --name clickhouse-server --ulimit nofile=262144:262144 \
     -p 9000:9000 -p 8123:8123 clickhouse/clickhouse-server
   ```

***

You can now connect to ClickHouse at `localhost:9000` (native protocol) or `localhost:8123` (HTTP interface).

## Usage Examples

[Section titled “Usage Examples”](#usage-examples)

These examples assume that the ClickHouse server is running on the same host as Tenzir and that it allows non-TLS connections (hence using `tls=false` in the pipelines).

You can find out more about how to configure TLS on the [`to_clickhouse`](/reference/operators/to_clickhouse) documentation and the [Clickhouse SSL-TLS configuration guide](https://clickhouse.com/docs/guides/sre/configuring-ssl)

### 1. Easy Mode: Automatic table creation

[Section titled “1. Easy Mode: Automatic table creation”](#1-easy-mode-automatic-table-creation)

Tenzir can automatically create tables in ClickHouse based on the incoming data schema. For example, to ingest OCSF network activity data:

```tql
from "ocsf_network_activity.json"
ocsf::apply
to_clickhouse table="ocsf.network_activity", primary=timestamp, tls=false
```

When creating a table, the [`to_clickhouse`](/reference/operators/to_clickhouse) operator uses the first event to determine the schema. You must take care that there are no untyped nulls in this event, as the operator cannot transmit those.

In this example, we use the [`ocsf::apply`](/reference/operators/ocsf/apply) operator, which will automatically align events with the correct OCSF schema, giving all fields the correct types and adding all fields that should be in `ocsf.network_activity`. This ensures that we create a complete table without missing or incorrectly typed columns.

You can now query the data in ClickHouse, e.g.:

```sql
SELECT median(traffic.bytes_in), median(traffic.bytes_out)
FROM ocsf.network_activity
GROUP BY *
```

### 2. Advanced: Explicit Table Creation

[Section titled “2. Advanced: Explicit Table Creation”](#2-advanced-explicit-table-creation)

For more control, you can create the table in ClickHouse first. Use this approach when you know the full schema of your table, but not all events contain all fields and as such the operator would not create the correct table.

1. Create the table in ClickHouse:

   ```sql
   CREATE TABLE my_table (
     id Int64,
     name String,
     mice_caught Nullable(Int64)
   ) ENGINE = MergeTree() ORDER BY id;
   ```

2. Ingest data from Tenzir:

   my\_file.csv

   ```csv
   id,name,mice_caught
   0,Jerry,
   1,Tom,0
   ```

   ```tql
   from "my_file.csv"
   to_clickhouse table="my_table", mode="append", tls=false
   ```

   We use the explicit `mode="append"` to ensure that the table already exists.

   In this example *Jerry*, being a mouse, has no value for `mice_caught`. Since we created a table with the expected type, this is not an issue.