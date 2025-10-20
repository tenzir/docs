# save_google_cloud_pubsub

Publishes to a Google Cloud Pub/Sub topic.

```tql
save_google_cloud_pubsub project_id=string, topic_id=string
```

Authentication

The connector tries to retrieve the appropriate credentials using Google’s [Application Default Credentials](https://google.aip.dev/auth/4110).

## Description

[Section titled “Description”](#description)

The operator publishes bytes to a Google Cloud Pub/Sub topic.

### `project_id = string`

[Section titled “project\_id = string”](#project_id--string)

The project to connect to. Note that this is the project\_id, not the display name.

### `topic_id = string`

[Section titled “topic\_id = string”](#topic_id--string)

The topic to publish to.

## URI support & integration with `from`

[Section titled “URI support & integration with from”](#uri-support--integration-with-from)

The `save_google_cloud_pubsub` operator can also be used from the [`to`](/reference/operators/to) operator. For this, the `gcps://` scheme can be used. The URI is then translated:

```tql
to "gcps://my_project/my_topic"
```

```tql
save_google_cloud_pubsub project_id="my_project", topic_id="my_topic"
```

## Examples

[Section titled “Examples”](#examples)

### Publish alerts to a given topic

[Section titled “Publish alerts to a given topic”](#publish-alerts-to-a-given-topic)

Publish `suricata.alert` events as JSON to `alerts-topic`:

```tql
export
where @name = "suricata.alert"
write_json
save_google_cloud_pubsub project_id="amazing-project-123456", topic_id="alerts-topic"
```

## See Also

[Section titled “See Also”](#see-also)

[`load_google_cloud_pubsub`](/reference/operators/load_google_cloud_pubsub)