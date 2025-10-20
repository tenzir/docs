# load_google_cloud_pubsub

Subscribes to a Google Cloud Pub/Sub subscription and obtains bytes.

```tql
load_google_cloud_pubsub project_id=string, subscription_id=string, [timeout=duration]
```

Authentication

The connector tries to retrieve the appropriate credentials using Google’s [Application Default Credentials](https://google.aip.dev/auth/4110).

## Description

[Section titled “Description”](#description)

The operator acquires raw bytes from a Google Cloud Pub/Sub subscription.

### `project_id = string`

[Section titled “project\_id = string”](#project_id--string)

The project to connect to. Note that this is the project id, not the display name.

### `subscription_id = string`

[Section titled “subscription\_id = string”](#subscription_id--string)

The subscription to subscribe to.

### `timeout = duration (optional)`

[Section titled “timeout = duration (optional)”](#timeout--duration-optional)

How long to wait for messages before ending the connection. A duration of zero means the operator will run forever.

The default value is `0s`.

## URI support & integration with `from`

[Section titled “URI support & integration with from”](#uri-support--integration-with-from)

The `load_google_cloud_pubsub` operator can also be used from the [`from`](/reference/operators/from) operator. For this, the `gcps://` scheme can be used. The URI is then translated:

```tql
from "gcps://my_project/my_subscription"
```

```tql
load_google_cloud_pubsub project_id="my_project", subscription_id="my_subscription"
```

## Examples

[Section titled “Examples”](#examples)

### Read JSON messages from a subscription

[Section titled “Read JSON messages from a subscription”](#read-json-messages-from-a-subscription)

Subscribe to `my-subscription` in the project `amazing-project-123456` and parse the messages as JSON:

```tql
load_google_cloud_pubsub project_id="amazing-project-123456", subscription_id="my-subscription"
read_json
```

## See Also

[Section titled “See Also”](#see-also)

[`save_google_cloud_pubsub`](/reference/operators/save_google_cloud_pubsub)