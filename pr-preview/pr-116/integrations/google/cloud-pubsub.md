# Cloud Pub/Sub

[Google Cloud Pub/Sub](https://cloud.google.com/pubsub) ingests events for streaming into BigQuery, data lakes, or operational databases. Tenzir can act as a publisher that sends messages to a topic, and as a subscriber that receives messages from a subscription.

![Google Cloud Pub/Sub](/pr-preview/pr-116/_astro/cloud-pubsub.CbURM6vM_19DKCs.svg)

URL Support

The URL scheme `gcps://` dispatches to [`load_google_cloud_pubsub`](/reference/operators/load_google_cloud_pubsub) and [`save_google_cloud_pubsub`](/reference/operators/save_google_cloud_pubsub) for seamless URL-style use via [`from`](/reference/operators/from) and [`to`](/reference/operators/to).

## Examples

[Section titled “Examples”](#examples)

### Publish a message to a topic

[Section titled “Publish a message to a topic”](#publish-a-message-to-a-topic)

```tql
from {foo: 42}
to "gcps://my-project/my-topic" {
  write_json
}
```

### Receive messages from a subscription

[Section titled “Receive messages from a subscription”](#receive-messages-from-a-subscription)

```tql
from "gcps://my-project/my-topic" {
  read_json
}
```