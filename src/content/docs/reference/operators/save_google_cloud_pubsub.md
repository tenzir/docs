---
title: save_google_cloud_pubsub
---

Publishes to a Google Cloud Pub/Sub topic.

```tql
save_google_cloud_pubsub project_id=string, topic_id=string
```

:::note[Authentication]
The connector tries to retrieve the appropriate credentials using Google's
[Application Default Credentials](https://google.aip.dev/auth/4110).
:::

## Description

The operator publishes bytes to a Google Cloud Pub/Sub topic.

### `project_id = string`

The project to connect to. Note that this is the project_id, not the display name.

### `topic_id = string`

The topic to publish to.

## URI support & integration with `from`

The `save_google_cloud_pubsub` operator can also be used from the [`to`](to)
operator. For this, the `gcps://` scheme can be used. The URI is then translated:

```tql
to "gcps://my_project/my_topic"
```
```tql
save_google_cloud_pubsub project_id="my_project", topic_id="my_topic"
```

## Examples

### Publish alerts to a given topic

Publish `suricata.alert` events as JSON to `alerts-topic`:

```tql
export
where @name = "suricata.alert"
write_json
save_google_cloud_pubsub project_id="amazing-project-123456", topic_id="alerts-topic"
```

## See Also

[`load_google_cloud_pubsub`](load_google_cloud_pubsub)
