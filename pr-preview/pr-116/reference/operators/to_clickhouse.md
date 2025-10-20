# to_clickhouse

Sends events to a ClickHouse table.

```tql
to_clickhouse table=string, [host=string, port=int, user=string, password=string,
                             mode=string, primary=field,
                             tls=bool, cacert=string, certfile=string, keyfile=string,
                             skip_peer_verification=bool, skip_host_verification=bool]
```

## Description

[Section titled “Description”](#description)

### `table = string`

[Section titled “table = string”](#table--string)

The name of the table you want to write to. When giving a plain table name, it will use the `default` database, otherwise `database.table` can be specified.

### `host = string (optional)`

[Section titled “host = string (optional)”](#host--string-optional)

The hostname for the ClickHouse server.

Defaults to `"localhost"`.

### `port = int (optional)`

[Section titled “port = int (optional)”](#port--int-optional)

The port for the ClickHouse server.

Defaults to `9000` without TLS and `9440` with TLS.

### `user = string (optional)`

[Section titled “user = string (optional)”](#user--string-optional)

The user to use for authentication.

Defaults to `"default"`.

### `password = string (optional)`

[Section titled “password = string (optional)”](#password--string-optional)

The password for the given user.

Defaults to `""`.

### `mode = string (optional)`

[Section titled “mode = string (optional)”](#mode--string-optional)

* `"create"` if you want to create a table and fail if it already exists
* `"append"` to append to an existing table
* `"create_append"` to create a table if it does not exist and append to it otherwise.

Defaults to `"create_append"`.

### `primary = field (optional)`

[Section titled “primary = field (optional)”](#primary--field-optional)

The primary key to use when creating a table. Required for `mode = "create"` as well as for `mode = "create_append"` if the table does not yet exist.

### `tls = bool (optional)`

Enables TLS.

Defaults to `true`.

### `cacert = string (optional)`

Path to the CA certificate used to verify the server’s certificate.

Defaults to the Tenzir configuration value `tenzir.cacert`, which in turn defaults to a common cacert location for the system.

### `certfile = string (optional)`

Path to the client certificate.

### `keyfile = string (optional)`

Path to the key for the client certificate.

### `skip_peer_verification = bool (optional)`

Toggles TLS certificate verification.

Defaults to `false`.

Path to the key for the client certificate.

## Types

[Section titled “Types”](#types)

Tenzir uses ClickHouse’s [clickhouse-cpp](https://github.com/ClickHouse/clickhouse-cpp) client library to communicate with ClickHouse. The below table explains the translation from Tenzir’s types to ClickHouse:

| Tenzir     | ClickHouse                     | Comment                                                                                           |
| :--------- | :----------------------------- | :------------------------------------------------------------------------------------------------ |
| `bool`     | `UInt8`                        |                                                                                                   |
| `int64`    | `Int64`                        |                                                                                                   |
| `uint64`   | `UInt64`                       |                                                                                                   |
| `double`   | `Float64`                      |                                                                                                   |
| `ip`       | `IPv6`                         |                                                                                                   |
| `subnet`   | `Tuple(ip IPv6, length UInt8)` |                                                                                                   |
| `time`     | `DateTime64(9)`                |                                                                                                   |
| `duration` | `Int64`                        | Converted as `nanoseconds(duration)`                                                              |
| `record`   | `Tuple(...)`                   | Fields in the tuple will be named with the field name. The record must have at least one element. |
| `list<T>`  | `Array(T)`                     |                                                                                                   |
| `blob`     | `Array(UInt8)`                 | Blobs that are `null` will be represented by an empty array                                       |

Tenzir also supports `Nullable` versions of the above types (or their nested types). If a `list` itself is `null`, it will be represented by an empty `Array`. If a `record` is `null`, all elements of the `Tuple` will be null, if possible. Otherwise the event will be dropped.

### Table Creation

[Section titled “Table Creation”](#table-creation)

When a ClickHouse table is created from Tenzir, all columns except the `primary` will be created as `Nullable`. For example, a column of type `ip` will be created as `Nullable(IPv6)`, while a `list<int64>` will be created as `Array(Nullable(Int64))`.

The table will be created from the first event the operator receives. Should this first event contain unsupported types/values, an error is raised.

#### Untyped nulls

[Section titled “Untyped nulls”](#untyped-nulls)

Tenzir has both typed and untyped nulls. Typed nulls have a type, but no value. They are no problem for `to_clickhouse`.

For untyped nulls, the type itself is `null`, which cannot be supported by the `to_clickhouse` operator when creating a table.

Typed and Untyped Nulls in Tenzir

```tql
from {
  typed_null: int(null),
  untyped_null: null,
}
```

Untyped nulls are usually directly caused by nulls in the input, such as in a JSON file:

```json
{
  "value": null
}
```

If your input format has untyped nulls, but you know the type, you can either define an a schema and use that when parsing the input, or you can explicitly cast the columns to their desired type:

```tql
from (
  { value: null },
  { value: 42 },
)
value = int(value) // explicit cast turns untyped into typed nulls
to_clickhouse "example_table", primary=value
```

#### Empty records

[Section titled “Empty records”](#empty-records)

Empty records cannot be send to ClickHouse. Should an empty record appear in the first event, an error is raised.

## Examples

[Section titled “Examples”](#examples)

### Send CSV file to a local ClickHouse instance, without TLS

[Section titled “Send CSV file to a local ClickHouse instance, without TLS”](#send-csv-file-to-a-local-clickhouse-instance-without-tls)

```tql
from "my_file.csv"
to_clickhouse table="my_table", tls=false
```

### Create a new table with multiple fields

[Section titled “Create a new table with multiple fields”](#create-a-new-table-with-multiple-fields)

```tql
from { i: 42, d: 10.0, b: true, l: [42], r:{ s:"string" } }
to_clickhouse table="example", primary=i
```

This creates the following table:

```plaintext
   ┌─name─┬─type────────────────────┐
1. │ i    │ Int64                   │
2. │ d    │ Nullable(Float64)       │
3. │ b    │ Nullable(UInt8)         │
4. │ l    │ Array(Nullable(Int64))  │
5. │ r    │ Tuple(                 ↴│
   │      │↳    s Nullable(String)) │
   └──────┴─────────────────────────┘
```