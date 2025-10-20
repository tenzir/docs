# save_kafka

Saves a byte stream to a Apache Kafka topic.

```tql
save_kafka topic:string, [key=string, timestamp=time, options=record,
           aws_iam=record]
```

## Description

[Section titled “Description”](#description)

Deprecated

The `save_kafka` operator does not respect event boundaries and can combine multiple events into a single message, causing issues for consumers. Consider using `to_kafka` instead.

The `save_kafka` operator saves bytes to a Kafka topic.

The implementation uses the official [librdkafka](https://github.com/confluentinc/librdkafka) from Confluent and supports all [configuration options](https://github.com/confluentinc/librdkafka/blob/master/CONFIGURATION.md). You can specify them via `options` parameter as `{key: value, ...}`.

The operator injects the following default librdkafka configuration values in case no configuration file is present, or when the configuration does not include them:

* `bootstrap.servers`: `localhost`
* `client.id`: `tenzir`
* `group.id`: `tenzir`

### `topic: string`

[Section titled “topic: string”](#topic-string)

The Kafka topic to use.

### `key = string (optional)`

[Section titled “key = string (optional)”](#key--string-optional)

Sets a fixed key for all messages.

### `timestamp = time (optional)`

[Section titled “timestamp = time (optional)”](#timestamp--time-optional)

Sets a fixed timestamp for all messages.

### `options = record (optional)`

[Section titled “options = record (optional)”](#options--record-optional)

A record of key-value configuration options for [librdkafka](https://github.com/confluentinc/librdkafka), e.g., `{"auto.offset.reset" : "earliest", "enable.partition.eof": true}`.

The `save_kafka` operator passes the key-value pairs directly to [librdkafka](https://github.com/confluentinc/librdkafka). Consult the list of available [configuration options](https://github.com/confluentinc/librdkafka/blob/master/CONFIGURATION.md) to configure Kafka according to your needs.

We recommend factoring these options into the plugin-specific `kafka.yaml` so that they are independent of the `save_kafka` arguments.

### `aws_iam = record (optional)`

[Section titled “aws\_iam = record (optional)”](#aws_iam--record-optional)

If specified, enables using AWS IAM Authentication for MSK. The keys must be non-empty when specified.

Available keys:

* `region`: Region of the MSK Clusters. Must be specified when using IAM.
* `assume_role`: Optional Role ARN to assume.
* `session_name`: Optional session name to use when assuming a role.
* `external_id`: Optional external id to use when assuming a role.

The operator will try to get credentials in the following order:

1. Checks your environment variables for AWS Credentials.
2. Checks your `$HOME/.aws/credentials` file for a profile and credentials
3. Contacts and logs in to a trusted identity provider. The login information to these providers can either be on the environment variables: `AWS_ROLE_ARN`, `AWS_WEB_IDENTITY_TOKEN_FILE`, `AWS_ROLE_SESSION_NAME` or on a profile in your `$HOME/.aws/credentials`.
4. Checks for an external method set as part of a profile on `$HOME/.aws/config` to generate or look up credentials that are not directly supported by AWS.
5. Contacts the ECS Task Role to request credentials if Environment variable `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI` has been set.
6. Contacts the EC2 Instance Metadata service to request credentials if `AWS_EC2_METADATA_DISABLED` is NOT set to ON.

## Examples

[Section titled “Examples”](#examples)

### Write the Tenzir version to topic `tenzir` with timestamp from the past

[Section titled “Write the Tenzir version to topic tenzir with timestamp from the past”](#write-the-tenzir-version-to-topic-tenzir-with-timestamp-from-the-past)

```tql
version
write_json
save_kafka "tenzir", timestamp=1984-01-01
```

### Follow a CSV file and publish it to topic `data`

[Section titled “Follow a CSV file and publish it to topic data”](#follow-a-csv-file-and-publish-it-to-topic-data)

```tql
load_file "/tmp/data.csv"
read_csv
write_json
save_kafka "data"
```

## See Also

[Section titled “See Also”](#see-also)

[`load_kafka`](/reference/operators/load_kafka)